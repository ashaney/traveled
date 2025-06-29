/**
 * Utility functions for map sharing functionality
 */

export function generateShareCode(): string {
  // Generate 8-character alphanumeric code
  // Exclude confusing characters (0, O, I, l, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

export function validateShareCode(code: string): boolean {
  // Validate format: exactly 8 alphanumeric chars
  return /^[A-Z0-9]{8}$/.test(code);
}

export function getShareUrl(shareCode: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return `https://traveled.app/share/${shareCode}`;
  }
  return `${window.location.origin}/share/${shareCode}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function generateStoragePath(userId: string, shareCode: string): string {
  return `${userId}/${shareCode}.png`;
}