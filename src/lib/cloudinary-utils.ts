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
