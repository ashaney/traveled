'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '@/lib/share-utils';

interface ShareActionsProps {
  shareUrl: string;
  copied: boolean;
  onCopiedChangeAction: (copied: boolean) => void;
}

export function ShareActions({ shareUrl, copied, onCopiedChangeAction }: ShareActionsProps) {
  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      onCopiedChangeAction(true);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleCopy}
        className="flex-1"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => window.open(shareUrl, '_blank')}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
}