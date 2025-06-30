'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { SharedMap } from '@/hooks/useShareManagement';

interface ExistingShareDisplayProps {
  share: SharedMap;
  shareUrl: string;
  copied: boolean;
  isDeleting: boolean;
  onCopyAction: () => void;
  onDeleteAction: () => void;
}

export function ExistingShareDisplay({ 
  share, 
  shareUrl, 
  copied, 
  isDeleting, 
  onCopyAction, 
  onDeleteAction 
}: ExistingShareDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2">Share Active</h3>
        <p className="text-sm text-green-700">
          Your map has been shared and viewed {share.view_count} time{share.view_count !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="share-url">Share URL</Label>
        <div className="flex gap-2">
          <Input
            id="share-url"
            value={shareUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyAction}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(shareUrl, '_blank')}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Share Details</Label>
        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
          <p className="font-medium">{share.title}</p>
          {share.description && (
            <p className="text-sm text-gray-600">{share.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Created {new Date(share.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        onClick={onDeleteAction}
        disabled={isDeleting}
        className="w-full"
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Share
          </>
        )}
      </Button>
    </div>
  );
}