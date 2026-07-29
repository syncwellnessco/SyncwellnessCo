export const optimizeCloudinaryUrl = (url: string) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  if (url.includes('q_auto') && url.includes('f_auto')) return url;

  if (url.includes('/upload/')) {
    const paramsToAdd: string[] = [];
    if (!url.includes('q_auto')) paramsToAdd.push('q_auto');
    if (!url.includes('f_auto')) paramsToAdd.push('f_auto');

    if (paramsToAdd.length > 0) {
      const paramString = paramsToAdd.join(',');
      return url.replace('/upload/', `/upload/${paramString}/`);
    }
  }
  return url;
};

export const deleteCloudinaryFile = async (public_id: string, resource_type: 'image' | 'video' = 'image') => {
  if (!public_id) return;
  try {
    await fetch('/api/cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id, resource_type })
    });
  } catch (error) {
    console.error("Failed to delete orphaned Cloudinary file:", error);
  }
};

export const uploadFileToCloudinary = async (
  file: File,
  preset?: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; publicId: string }> => {
  const isFileVideo = file.type.startsWith("video/");
  const resourceType = isFileVideo ? "video" : "image";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "daw1tscqr";
  const uploadPreset =
    preset ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "syncwellness";

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const rawUrl = data.secure_url || data.url;
        const publicId = data.public_id || "";
        const optimizedUrl = optimizeCloudinaryUrl(rawUrl);
        resolve({ url: optimizedUrl, publicId });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Upload failed"));
        } catch {
          reject(new Error("Upload failed. Please try again."));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload."));
    };

    xhr.send(formData);
  });
};
