'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitDialogProps {
  regionId: string | null;
  open: boolean;
  onClose: () => void;
  editVisitId?: string; // If provided, edit this specific visit
}

export function VisitDialog({ regionId, open, onClose, editVisitId }: VisitDialogProps) {
  const { getVisitsByRegion, addVisit, updateVisit, visits } = useSupabaseVisits();
  const [selectedType, setSelectedType] = useState<VisitRating>(0);
  const [visitYear, setVisitYear] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const region = japanPrefectures.regions.find(r => r.id === regionId);
  const regionVisits = regionId ? getVisitsByRegion(regionId) : [];
  const existingVisit = editVisitId ? visits.find(v => v.id === editVisitId) : null;
  const isEditing = Boolean(existingVisit);

  // Initialize form when dialog opens
  useEffect(() => {
    if (existingVisit) {
      // Editing existing visit
      setSelectedType(existingVisit.rating as VisitRating);
      setVisitYear(existingVisit.visit_year?.toString() || new Date().getFullYear().toString());
      setNotes(existingVisit.notes || '');
    } else {
      // Creating new visit - default to "Passed through" instead of "Never been"
      setSelectedType(1);
      setVisitYear(new Date().getFullYear().toString()); // Default to current year
      setNotes('');
    }
    setError('');
  }, [existingVisit, open]);


  const handleSave = async () => {
    if (!regionId) return;
    
    setError('');
    
    // Validate year
    const year = parseInt(visitYear);
    if (!year || year < 1900 || year > new Date().getFullYear() + 10) {
      setError('Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 10));
      return;
    }

    try {
      if (existingVisit) {
        // Update existing visit
        await updateVisit(existingVisit.id, {
          rating: selectedType,
          visit_year: year,
          notes: notes.trim() || null,
        });
      } else {
        // Create new visit
        await addVisit(
          regionId,
          'japan',
          selectedType,
          year,
          notes.trim() || undefined
        );
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
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
            {isEditing ? 'Edit your visit' : 'Record a new visit'} to {region.name} with a rating and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Show existing visits for context when adding new */}
          {!isEditing && regionVisits.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Previous visits:
              </h4>
              <div className="space-y-1">
                {regionVisits.map(visit => (
                  <div key={visit.id} className="text-sm text-blue-800">
                    {visit.visit_year}: {RATING_LABELS[visit.rating as VisitRating]}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="visitYear" className="text-sm font-medium mb-2 block">
              Visit Year <span className="text-red-500">*</span>
            </Label>
            <Input
              id="visitYear"
              type="number"
              value={visitYear}
              onChange={(e) => setVisitYear(e.target.value)}
              placeholder="e.g., 2024"
              min="1900"
              max={new Date().getFullYear() + 10}
              required
              className={error.includes('year') ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <Label htmlFor="visitType" className="text-sm font-medium mb-2 block">
              Visit Type <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={selectedType.toString()} 
              onValueChange={(value) => setSelectedType(parseInt(value) as VisitRating)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
                  .filter(type => parseInt(type.toString()) !== 0) // Remove "Never been" option
                  .map((type) => (
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? 'Update' : 'Save'} Visit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}