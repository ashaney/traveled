'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Share2 } from 'lucide-react';

interface ShareCreationFormProps {
  onGenerateAction: (title: string, description: string) => Promise<{ shareUrl: string; shareCode: string } | void>;
  isGenerating: boolean;
  isExporting: boolean;
}

export function ShareCreationForm({ onGenerateAction, isGenerating, isExporting }: ShareCreationFormProps) {
  const [title, setTitle] = useState('My Travel Map');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateAction(title, description);
  };

  const isLoading = isGenerating || isExporting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Travel Map"
          maxLength={100}
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <Button 
        type="submit"
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isExporting ? 'Exporting map...' : 'Creating share...'}
          </>
        ) : (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Generate Share Link
          </>
        )}
      </Button>
    </form>
  );
}