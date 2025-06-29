'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useMapExport } from '@/hooks/useMapExport';
import { useShareManagement } from '@/hooks/useShareManagement';
import { copyToClipboard } from '@/lib/share-utils';
import { ShareCreationForm } from '@/components/share/share-creation-form';
import { ExistingShareDisplay } from '@/components/share/existing-share-display';

interface ShareModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function ShareModal({ isOpen, onCloseAction }: ShareModalProps) {
  const { isExporting } = useMapExport();
  const {
    share,
    shareUrl,
    isLoading,
    isGenerating,
    isDeleting,
    copied,
    error,
    fetchShare,
    generateShare,
    deleteShare,
    setCopied,
    resetState
  } = useShareManagement();

  // Load existing share when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShare();
    } else {
      resetState();
    }
  }, [isOpen, fetchShare, resetState]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
    }
  };

  const handleDeleteShare = async () => {
    await deleteShare();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share Your Travel Map
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !share ? (
            <ShareCreationForm
              onGenerateAction={generateShare}
              isGenerating={isGenerating}
              isExporting={isExporting}
            />
          ) : (
            <ExistingShareDisplay
              share={share}
              shareUrl={shareUrl || ''}
              copied={copied}
              isDeleting={isDeleting}
              onCopyAction={handleCopyLink}
              onDeleteAction={handleDeleteShare}
            />
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}