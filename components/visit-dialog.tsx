'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVisits } from '@/contexts/VisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { cn } from '@/lib/utils';

interface VisitDialogProps {
  regionId: string | null;
  open: boolean;
  onClose: () => void;
}

export function VisitDialog({ regionId, open, onClose }: VisitDialogProps) {
  const { getVisitByRegion, addVisit, updateVisit } = useVisits();
  const [selectedRating, setSelectedRating] = useState<VisitRating>(0);
  const [notes, setNotes] = useState('');

  const region = japanPrefectures.regions.find(r => r.id === regionId);
  const existingVisit = regionId ? getVisitByRegion(regionId) : null;

  // Initialize form when dialog opens
  React.useEffect(() => {
    if (existingVisit) {
      setSelectedRating(existingVisit.rating);
      setNotes(existingVisit.notes || '');
    } else {
      setSelectedRating(0);
      setNotes('');
    }
  }, [existingVisit]);

  const handleSave = () => {
    if (!regionId) return;

    if (existingVisit) {
      updateVisit(existingVisit.id, {
        rating: Number(selectedRating) as VisitRating,
        notes: notes.trim() || undefined,
      });
    } else {
      addVisit(regionId, 'japan', Number(selectedRating) as VisitRating, notes.trim() || undefined);
    }
    
    onClose();
  };

  const getRatingColor = (rating: VisitRating) => {
    const colors = {
      0: "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
      1: "bg-red-200 dark:bg-red-900 border-red-300 dark:border-red-700",
      2: "bg-orange-200 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
      3: "bg-yellow-200 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
      4: "bg-green-200 dark:bg-green-900 border-green-300 dark:border-green-700",
      5: "bg-blue-200 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
    };
    return colors[rating];
  };

  if (!region) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{region.name}</span>
            {region.nameJapanese && (
              <span className="text-sm text-muted-foreground font-normal">
                ({region.nameJapanese})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Record your visit to {region.name} with a rating and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Visit Rating</h3>
            <div className="space-y-2">
              {(Object.keys(RATING_LABELS) as unknown as VisitRating[]).map((rating) => (
                <button
                  key={rating}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-all duration-200",
                    getRatingColor(rating),
                    selectedRating === rating 
                      ? "ring-2 ring-blue-500 dark:ring-blue-400" 
                      : "hover:scale-[1.02]"
                  )}
                  onClick={() => setSelectedRating(rating)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{RATING_LABELS[rating]}</span>
                    <span className="text-sm opacity-70">Level {rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about your visit..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {existingVisit ? 'Update' : 'Save'} Visit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}