// src/lib/images.ts
const R2_BUCKET_URL = import.meta.env.PUBLIC_R2_BUCKET_URL;

export function getImageUrl(imagePath: string): string {
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${R2_BUCKET_URL}/${cleanPath}`;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  quality?: number;
}

export function getOptimizedImageUrl(
  imagePath: string, 
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, format = 'webp', quality = 80 } = options;
  const baseUrl = getImageUrl(imagePath);
  
  // If you're using Cloudflare Image Resizing (paid feature)
  // return `https://your-domain.com/cdn-cgi/image/width=${width},height=${height},format=${format},quality=${quality}/${baseUrl}`;
  
  return baseUrl;
}