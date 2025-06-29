'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Share2, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useMapExport } from '@/hooks/useMapExport';
import { copyToClipboard, getShareUrl } from '@/lib/share-utils';
import { compressImage, getImageSize, formatFileSize } from '@/lib/image-utils';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShareData {
  id: string;
  share_code: string;
  image_url: string;
  title: string;
  description: string | null;
  view_count: number;
  created_at: string;
}

interface ShareState {
  isLoading: boolean;
  isGenerating: boolean;
  isDeleting: boolean;
  existingShare: ShareData | null;
  shareUrl: string | null;
  shareCode: string | null;
  error: string | null;
  copied: boolean;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [title, setTitle] = useState('My Travel Map');
  const [description, setDescription] = useState('');
  const [shareState, setShareState] = useState<ShareState>({
    isLoading: false,
    isGenerating: false,
    isDeleting: false,
    existingShare: null,
    shareUrl: null,
    shareCode: null,
    error: null,
    copied: false
  });

  const { exportMap, isExporting } = useMapExport();

  // Load existing share when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingShare();
    } else {
      // Reset state when modal closes
      setShareState({
        isLoading: false,
        isGenerating: false,
        isDeleting: false,
        existingShare: null,
        shareUrl: null,
        shareCode: null,
        error: null,
        copied: false
      });
      setTitle('My Travel Map');
      setDescription('');
    }
  }, [isOpen]);

  const loadExistingShare = async () => {
    try {
      setShareState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/shares');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load existing share');
      }

      const data = await response.json();
      
      if (data.share) {
        const shareUrl = getShareUrl(data.share.share_code);
        setShareState(prev => ({
          ...prev,
          isLoading: false,
          existingShare: data.share,
          shareUrl,
          shareCode: data.share.share_code
        }));
        setTitle(data.share.title || 'My Travel Map');
        setDescription(data.share.description || '');
      } else {
        setShareState(prev => ({ ...prev, isLoading: false }));
      }

    } catch (error) {
      console.error('Failed to load existing share:', error);
      setShareState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load existing share'
      }));
    }
  };

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (shareState.copied) {
      const timer = setTimeout(() => {
        setShareState(prev => ({ ...prev, copied: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareState.copied]);

  const handleGenerateShare = async () => {
    try {
      setShareState(prev => ({ ...prev, isGenerating: true, error: null }));

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
          console.log(`Image compressed from ${formatFileSize(imageInfo.size)} to ${formatFileSize(compressedInfo.size)}`);
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          // Continue with original image
        }
      }

      // Create share via API
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          title: title.trim() || 'My Travel Map',
          description: description.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share');
      }

      const data = await response.json();
      
      setShareState(prev => ({
        ...prev,
        isGenerating: false,
        existingShare: data.share,
        shareUrl: data.shareUrl,
        shareCode: data.shareCode,
        error: null
      }));

      toast.success('Share link created!', {
        description: 'Your travel map is now available for sharing.'
      });

    } catch (error) {
      console.error('Share generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate share';
      
      setShareState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      toast.error('Failed to create share', {
        description: errorMessage
      });
    }
  };

  const handleDeleteShare = async () => {
    try {
      setShareState(prev => ({ ...prev, isDeleting: true, error: null }));

      const response = await fetch('/api/shares', {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete share');
      }

      setShareState(prev => ({
        ...prev,
        isDeleting: false,
        existingShare: null,
        shareUrl: null,
        shareCode: null,
        error: null,
        copied: false
      }));

      setTitle('My Travel Map');
      setDescription('');

    } catch (error) {
      console.error('Share deletion error:', error);
      setShareState(prev => ({
        ...prev,
        isDeleting: false,
        error: error instanceof Error ? error.message : 'Failed to delete share'
      }));
    }
  };

  const handleCopyLink = async () => {
    if (!shareState.shareUrl) return;

    const success = await copyToClipboard(shareState.shareUrl);
    if (success) {
      setShareState(prev => ({ ...prev, copied: true }));
      toast.success('Link copied!', {
        description: 'Share link has been copied to your clipboard.'
      });
    } else {
      toast.error('Copy failed', {
        description: 'Failed to copy link to clipboard. Please try again.'
      });
    }
  };

  const handleOpenLink = () => {
    if (shareState.shareUrl) {
      window.open(shareState.shareUrl, '_blank');
    }
  };


  const hasShare = shareState.existingShare || (shareState.shareUrl && shareState.shareCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Travel Map
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {shareState.isLoading ? (
            // Loading state
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : !hasShare ? (
            // Share generation form
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Travel Map"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details about your travels..."
                  maxLength={500}
                  rows={3}
                />
              </div>

              {shareState.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {shareState.error}
                </div>
              )}

              <Button
                onClick={handleGenerateShare}
                disabled={shareState.isGenerating || isExporting}
                className="w-full"
              >
                {shareState.isGenerating || isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isExporting ? 'Exporting map...' : 'Creating share...'}
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Create Share Link
                  </>
                )}
              </Button>
            </>
          ) : (
            // Existing share display
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Share2 className="h-4 w-4" />
                  Your shared travel map
                </div>
                <p className="text-sm text-blue-700">
                  {shareState.existingShare ? 
                    `Created ${new Date(shareState.existingShare.created_at).toLocaleDateString()} • ${shareState.existingShare.view_count} views` :
                    'Your travel map is available at the link below.'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareState.shareUrl || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    title="Copy link"
                  >
                    {shareState.copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenLink}
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Share Code</Label>
                <Input
                  value={shareState.shareCode || ''}
                  readOnly
                  className="font-mono text-lg font-bold text-center"
                />
              </div>

              {shareState.copied && (
                <div className="text-sm text-green-600 text-center">
                  ✓ Link copied to clipboard!
                </div>
              )}

              {shareState.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {shareState.error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteShare}
                  disabled={shareState.isDeleting}
                  className="flex-1"
                >
                  {shareState.isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Share
                    </>
                  )}
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}