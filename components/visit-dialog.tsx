'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVisits } from '@/contexts/VisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitDialogProps {
  regionId: string | null;
  open: boolean;
  onClose: () => void;
}

export function VisitDialog({ regionId, open, onClose }: VisitDialogProps) {
  const { getVisitByRegion, addVisit, updateVisit } = useVisits();
  const [selectedType, setSelectedType] = useState<VisitRating>(0);
  const [selectedRating, setSelectedRating] = useState<VisitRating>(0);
  const [visitYear, setVisitYear] = useState('');
  const [lengthOfStay, setLengthOfStay] = useState('');
  const [notes, setNotes] = useState('');

  const region = japanPrefectures.regions.find(r => r.id === regionId);
  const existingVisit = regionId ? getVisitByRegion(regionId) : null;

  // Initialize form when dialog opens
  React.useEffect(() => {
    if (existingVisit) {
      setSelectedType(existingVisit.rating);
      setSelectedRating(existingVisit.rating);
      setVisitYear(existingVisit.visitYear?.toString() || '');
      setLengthOfStay(existingVisit.lengthOfStay || '');
      setNotes(existingVisit.notes || '');
    } else {
      setSelectedType(0);
      setSelectedRating(0);
      setVisitYear('');
      setLengthOfStay('');
      setNotes('');
    }
  }, [existingVisit]);

  // Auto-set rating to 0 for N/A visit types
  React.useEffect(() => {
    const showNAForTypes = [0, 1, 2];
    if (showNAForTypes.includes(selectedType)) {
      setSelectedRating(0);
    }
  }, [selectedType]);

  const handleSave = () => {
    if (!regionId) return;

    const visitData = {
      rating: Number(selectedType) as VisitRating,
      visitYear: visitYear ? parseInt(visitYear) : undefined,
      lengthOfStay: lengthOfStay.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (existingVisit) {
      updateVisit(existingVisit.id, visitData);
    } else {
      addVisit(regionId, 'japan', visitData.rating, visitData.notes, undefined, visitData.visitYear, visitData.lengthOfStay);
    }
    
    onClose();
  };

  const getTypeColor = (type: VisitRating) => {
    const colors = {
      0: "bg-gray-100 text-gray-700 border-gray-200",
      1: "bg-red-100 text-red-700 border-red-200",
      2: "bg-orange-100 text-orange-700 border-orange-200",
      3: "bg-yellow-100 text-yellow-700 border-yellow-200",
      4: "bg-green-100 text-green-700 border-green-200",
      5: "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[type];
  };

  const renderStars = (rating: VisitRating) => {
    // For types 0 (Never been), 1 (Passed through), 2 (Brief stop), don't show ratings
    const showNAForTypes = [0, 1, 2];
    const shouldShowNA = showNAForTypes.includes(selectedType);
    
    if (shouldShowNA) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 italic">N/A - Not applicable for this visit type</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-6 h-6 cursor-pointer transition-colors",
              i < rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-200"
            )}
            onClick={() => setSelectedRating((i + 1) as VisitRating)}
          />
        ))}
        <button
          onClick={() => setSelectedRating(0)}
          className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      </div>
    );
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
            <Label htmlFor="visitType" className="text-sm font-medium mb-2 block">
              Visit Type
            </Label>
            <Select 
              value={selectedType.toString()} 
              onValueChange={(value) => setSelectedType(parseInt(value) as VisitRating)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RATING_LABELS) as unknown as VisitRating[]).map((type) => (
                  <SelectItem key={type} value={type.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded", getTypeColor(type).split(' ')[0])} />
                      {RATING_LABELS[type]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Rating
            </Label>
            <div className="flex items-center gap-1">
              {renderStars(selectedRating)}
              {![0, 1, 2].includes(selectedType) && selectedRating > 0 && (
                <span className="ml-2 text-sm text-gray-600">({selectedRating} star{selectedRating !== 1 ? 's' : ''})</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visitYear" className="text-sm font-medium mb-2 block">
                Year (optional)
              </Label>
              <Input
                id="visitYear"
                type="number"
                value={visitYear}
                onChange={(e) => setVisitYear(e.target.value)}
                placeholder="e.g., 2023"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label htmlFor="lengthOfStay" className="text-sm font-medium mb-2 block">
                Length of Stay (optional)
              </Label>
              <Input
                id="lengthOfStay"
                value={lengthOfStay}
                onChange={(e) => setLengthOfStay(e.target.value)}
                placeholder="e.g., 3 days, 2 weeks"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20 resize-none"
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