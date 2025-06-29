'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMapExport } from '@/hooks/useMapExport';
import { getShareUrl } from '@/lib/share-utils';
import { compressImage, getImageSize } from '@/lib/image-utils';
import { toast } from 'sonner';

export interface SharedMap {
  id: string;
  user_id: string;
  share_code: string;
  image_url: string;
  title: string;
  description: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShareManagementState {
  share: SharedMap | null;
  isLoading: boolean;
  isGenerating: boolean;
  isDeleting: boolean;
  shareUrl: string | null;
  error: string | null;
  copied: boolean;
}

export function useShareManagement() {
  const [state, setState] = useState<ShareManagementState>({
    share: null,
    isLoading: false,
    isGenerating: false,
    isDeleting: false,
    shareUrl: null,
    error: null,
    copied: false
  });

  const { exportMap } = useMapExport();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (state.copied) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, copied: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.copied]);

  const fetchShare = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/shares');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch share');
      }

      const data = await response.json();
      
      const shareUrl = data.share ? getShareUrl(data.share.share_code) : null;
      
      setState(prev => ({
        ...prev,
        share: data.share || null,
        shareUrl,
        isLoading: false
      }));

      return data.share;

    } catch (error) {
      console.error('Failed to fetch share:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch share'
      }));
      return null;
    }
  }, []);

  const generateShare = useCallback(async (title: string, description: string) => {
    try {
      setState(prev => ({ ...prev, isGenerating: true, error: null }));

      // Export map to get image data without downloading
      const exportResult = await exportMap({ autoDownload: false });
      
      if (!exportResult.success || !exportResult.dataUrl) {
        throw new Error(exportResult.error?.message || 'Failed to export map');
      }

      // Check image size and compress if needed
      const imageInfo = await getImageSize(exportResult.dataUrl);
      let imageData = exportResult.dataUrl;

      // Compress if image is too large (>2MB)
      if (imageInfo.size > 2 * 1024 * 1024) {
        try {
          imageData = await compressImage(exportResult.dataUrl, {
            maxWidth: 1200,
            maxHeight: 900,
            quality: 0.8,
            format: 'png'
          });
          
          const compressedInfo = await getImageSize(imageData);
          toast.success(`Image compressed from ${(imageInfo.size / 1024 / 1024).toFixed(1)}MB to ${(compressedInfo.size / 1024 / 1024).toFixed(1)}MB`);
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          // Continue with original image
        }
      }

      // Create share
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || 'My Travel Map',
          description: description.trim() || null,
          imageData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share');
      }

      const data = await response.json();
      const shareUrl = getShareUrl(data.shareCode);

      const newShare: SharedMap = {
        id: data.id,
        user_id: data.userId,
        share_code: data.shareCode,
        image_url: data.imageUrl,
        title: title.trim() || 'My Travel Map',
        description: description.trim() || null,
        is_active: true,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        share: newShare,
        shareUrl
      }));

      toast.success('Share link created successfully!');
      return { shareUrl, shareCode: data.shareCode };

    } catch (error) {
      console.error('Failed to generate share:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create share';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, [exportMap]);

  const deleteShare = useCallback(async () => {
    if (!state.share) return false;

    try {
      setState(prev => ({ ...prev, isDeleting: true, error: null }));

      const response = await fetch(`/api/shares/${state.share.share_code}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete share');
      }

      setState(prev => ({
        ...prev,
        share: null,
        shareUrl: null,
        isDeleting: false
      }));

      toast.success('Share deleted successfully');
      return true;

    } catch (error) {
      console.error('Failed to delete share:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete share';
      setState(prev => ({
        ...prev,
        isDeleting: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
      return false;
    }
  }, [state.share]);

  const setCopied = useCallback((copied: boolean) => {
    setState(prev => ({ ...prev, copied }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      share: null,
      isLoading: false,
      isGenerating: false,
      isDeleting: false,
      shareUrl: null,
      error: null,
      copied: false
    });
  }, []);

  return {
    ...state,
    fetchShare,
    generateShare,
    deleteShare,
    setCopied,
    clearError,
    resetState
  };
}