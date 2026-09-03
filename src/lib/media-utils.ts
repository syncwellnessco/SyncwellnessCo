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
 * Uploads a file via server endpoint (bypasses browser CORS constraints).
 */
async function uploadFileViaServer(
  file: File,
  folder: string = "general",
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url,
            key: data.key,
          });
        } catch {
          reject(new Error("Failed to parse upload response from server."));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Upload failed with status ${xhr.status}.`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}.`));
        }
      }
    };

    xhr.onerror = () => {
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
      return await uploadFileViaServer(file, folder, onProgress);
    }

    const { uploadUrl, publicUrl, key } = await presignRes.json();

    // 2. Try direct upload to R2
    return await new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: publicUrl,
            key,
          });
        } else {
          reject(new Error(`Direct upload failed with status ${xhr.status}.`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Direct storage upload blocked (likely CORS or network)."));
      };

      xhr.send(file);
    });
  } catch (directErr) {
    console.warn("Direct R2 upload encountered an issue, falling back to server-side upload:", directErr);
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
