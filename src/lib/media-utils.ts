/**
 * Client & Universal Media Utilities for Cloudflare R2
 */

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResponse {
  url: string;
  key: string;
}

/**
 * Resolves an object key or partial path into a complete public media URL.
 */
export function resolveMediaUrl(urlOrKey: string): string {
  if (!urlOrKey || typeof urlOrKey !== "string") return "";

  if (
    urlOrKey.startsWith("http://") ||
    urlOrKey.startsWith("https://") ||
    urlOrKey.startsWith("blob:") ||
    urlOrKey.startsWith("data:")
  ) {
    return urlOrKey;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/+$/, "");
  const cleanKey = urlOrKey.replace(/^\/+/, "");

  return baseUrl ? `${baseUrl}/${cleanKey}` : `/${cleanKey}`;
}

/**
 * Creates a smart, realistic progress scaler for uploads:
 * - Progresses smoothly and quickly up to ~80% during byte transmission.
 * - Gently slows down and eases between 82% and 94% while awaiting cloud/server processing.
 * - Instantly flashes to 100% upon actual server response completion before finishing.
 */
function createSmartProgressTracker(onProgress?: (percent: number) => void) {
  if (!onProgress) {
    return {
      handleProgress: () => {},
      handleComplete: async () => {},
      handleCleanup: () => {},
    };
  }

  let currentPercent = 0;
  let serverWaitTimer: ReturnType<typeof setInterval> | null = null;

  const update = (val: number) => {
    const nextVal = Math.min(94, Math.max(currentPercent, Math.round(val)));
    if (nextVal !== currentPercent) {
      currentPercent = nextVal;
      onProgress(currentPercent);
    }
  };

  const handleProgress = (loaded: number, total: number) => {
    if (total > 0) {
      const rawRatio = loaded / total;
      if (rawRatio < 0.99) {
        // Fast, smooth climb to ~80% during raw transmission
        update(rawRatio * 80);
      } else {
        // Raw bytes finished uploading (100% raw), awaiting storage/server finalization
        update(82);
        if (!serverWaitTimer) {
          serverWaitTimer = setInterval(() => {
            if (currentPercent < 94) {
              update(currentPercent + 2);
            }
          }, 350);
        }
      }
    }
  };

  const handleComplete = async () => {
    if (serverWaitTimer) {
      clearInterval(serverWaitTimer);
      serverWaitTimer = null;
    }
    // Flash directly to 100% when task is truly done
    onProgress(100);
    // Brief micro-pause so user sees 100% completion flash
    await new Promise((r) => setTimeout(r, 150));
  };

  const handleCleanup = () => {
    if (serverWaitTimer) {
      clearInterval(serverWaitTimer);
      serverWaitTimer = null;
    }
  };

  return { handleProgress, handleComplete, handleCleanup };
}

/**
 * Uploads a file via server endpoint (bypasses browser CORS constraints).
 */
async function uploadFileViaServer(
  file: File,
  folder: string = "general",
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const tracker = createSmartProgressTracker(onProgress);

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        tracker.handleProgress(event.loaded, event.total);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          await tracker.handleComplete();
          resolve({
            url: data.url,
            key: data.key,
          });
        } catch {
          tracker.handleCleanup();
          reject(new Error("Failed to parse upload response from server."));
        }
      } else {
        tracker.handleCleanup();
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Upload failed with status ${xhr.status}.`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}.`));
        }
      }
    };

    xhr.onerror = () => {
      tracker.handleCleanup();
      reject(new Error("Network error during server upload."));
    };

    xhr.send(formData);
  });
}

/**
 * Uploads a file directly to Cloudflare R2 using a secure backend presigned URL,
 * with automatic fallback to server-side upload if direct storage upload encounters CORS or network issues.
 */
export async function uploadFile(
  file: File,
  folder: string = "general",
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const tracker = createSmartProgressTracker(onProgress);

  try {
    // 1. Get presigned upload URL from backend
    const presignRes = await fetch("/api/media/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        folder,
      }),
    });

    if (!presignRes.ok) {
      console.warn("Presigned URL generation skipped or failed, using server upload...");
      tracker.handleCleanup();
      return await uploadFileViaServer(file, folder, onProgress);
    }

    const { uploadUrl, publicUrl, key } = await presignRes.json();

    // 2. Try direct upload to R2
    return await new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          tracker.handleProgress(event.loaded, event.total);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          await tracker.handleComplete();
          resolve({
            url: publicUrl,
            key,
          });
        } else {
          tracker.handleCleanup();
          reject(new Error(`Direct upload failed with status ${xhr.status}.`));
        }
      };

      xhr.onerror = () => {
        tracker.handleCleanup();
        reject(new Error("Direct storage upload blocked (likely CORS or network)."));
      };

      xhr.send(file);
    });
  } catch (directErr) {
    console.warn("Direct R2 upload encountered an issue, falling back to server-side upload:", directErr);
    tracker.handleCleanup();
    // Fallback directly to server upload
    return await uploadFileViaServer(file, folder, onProgress);
  }
}

/**
 * Deletes a media file from Cloudflare R2 by object key or URL.
 */
export async function deleteFile(urlOrKey: string): Promise<boolean> {
  if (!urlOrKey) return false;

  try {
    const res = await fetch("/api/media/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: urlOrKey }),
    });

    if (!res.ok) {
      console.warn("Media deletion request failed:", await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete media file:", error);
    return false;
  }
}
