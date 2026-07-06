export const optimizeCloudinaryUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('/upload/') && !url.includes('/q_auto') && !url.includes('/f_auto')) {
    return url.replace('/upload/', '/upload/q_auto,f_auto/');
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
