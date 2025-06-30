/**
 * Image optimization utilities for map sharing
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export async function compressImage(
  dataUrl: string, 
  options: ImageCompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 900,
    quality = 0.9,
    format = 'png'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                      format === 'webp' ? 'image/webp' : 'image/png';
      
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export function getImageSize(dataUrl: string): Promise<{ width: number; height: number; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate approximate file size from base64
      const base64Length = dataUrl.split(',')[1]?.length || 0;
      const size = Math.round((base64Length * 3) / 4);
      
      resolve({
        width: img.width,
        height: img.height,
        size
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}