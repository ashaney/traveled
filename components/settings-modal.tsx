'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Settings, Share2, ExternalLink, Trash2, Loader2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useShareManagement } from '@/hooks/useShareManagement';
import { copyToClipboard, getShareUrl } from '@/lib/share-utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { share, isLoading, error, fetchShare, deleteShare, clearError } = useShareManagement();

  // Load share data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShare();
    }
  }, [isOpen, fetchShare]);

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = async () => {
    if (!share) return;
    
    const shareUrl = getShareUrl(share.share_code);
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
    }
  };

  const handleOpenLink = () => {
    if (!share) return;
    
    const shareUrl = getShareUrl(share.share_code);
    window.open(shareUrl, '_blank');
  };

  const handleDeleteShare = async () => {
    const success = await deleteShare();
    if (success) {
      // Share deleted successfully, UI will update automatically
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={user?.id || ''}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 font-mono text-xs"
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Profile settings are managed through Supabase authentication.
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : share ? (
              // User has an active share
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-medium mb-2">
                    <Share2 className="h-4 w-4" />
                    Active Shared Map
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <div className="font-medium">{share.title}</div>
                    {share.description && (
                      <div className="text-blue-600 dark:text-blue-400">{share.description}</div>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      <span>Created {new Date(share.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {share.view_count} views
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={getShareUrl(share.share_code)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      title="Copy link"
                    >
                      {copied ? (
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
                    value={share.share_code}
                    readOnly
                    className="font-mono text-lg font-bold text-center"
                  />
                </div>

                {copied && (
                  <div className="text-sm text-green-600 text-center">
                    ✓ Link copied to clipboard!
                  </div>
                )}

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="ml-2 h-auto p-0 text-red-600 hover:text-red-700"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                <Button
                  variant="destructive"
                  onClick={handleDeleteShare}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Shared Map
                </Button>
              </>
            ) : (
              // No active share
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Shared Map
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You haven&apos;t created a shared map yet. Use the share button to create one.
                </p>
                <Button onClick={onClose} variant="outline">
                  Close Settings
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}