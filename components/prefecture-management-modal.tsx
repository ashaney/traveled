'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { Plus, Trash2, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrefectureManagementModalProps {
  regionId: string | null;
  open: boolean;
  onClose: () => void;
}

interface VisitEdit {
  id?: string;
  tempId: string; // Unique identifier for editing
  year: string;
  rating: VisitRating;
  notes: string;
  isNew?: boolean;
}

export function PrefectureManagementModal({ regionId, open, onClose }: PrefectureManagementModalProps) {
  const { 
    getVisitsByRegion, 
    addVisit, 
    updateVisit, 
    deleteVisit,
    getPrefectureRating,
    setPrefectureRating,
    deletePrefectureRating
  } = useSupabaseVisits();
  const [visits, setVisits] = useState<VisitEdit[]>([]);
  const [prefectureStarRating, setPrefectureStarRating] = useState<number>(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const region = japanPrefectures.regions.find(r => r.id === regionId);

  useEffect(() => {
    if (open && regionId) {
      // Load existing visits and sort by year (ascending)
      const existingVisits = getVisitsByRegion(regionId);
      const visitEdits: VisitEdit[] = existingVisits
        .map(visit => ({
          id: visit.id,
          tempId: visit.id || `temp-${Date.now()}-${Math.random()}`, // Use existing ID or generate temp ID
          year: visit.visit_year.toString(),
          rating: visit.rating as VisitRating,
          notes: visit.notes || ''
        }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort by year ascending
      setVisits(visitEdits);
      
      // Load prefecture star rating
      const currentRating = getPrefectureRating(regionId, 'japan');
      setPrefectureStarRating(currentRating || 0);
      
      setError('');
    }
  }, [open, regionId, getVisitsByRegion, getPrefectureRating]);

  const addNewVisit = () => {
    const currentYear = new Date().getFullYear();
    const newVisit: VisitEdit = {
      tempId: `new-${Date.now()}-${Math.random()}`, // Generate unique temp ID
      year: currentYear.toString(),
      rating: 1, // Default to "Passed through" instead of "Never been"
      notes: '',
      isNew: true
    };
    setVisits(prev => {
      const updated = [...prev, newVisit];
      // Keep visits sorted by year (ascending)
      return updated.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    });
  };

  const updateVisitEdit = (tempId: string, field: keyof VisitEdit, value: string | number) => {
    setVisits(prev => {
      const updated = prev.map(visit => 
        visit.tempId === tempId ? { ...visit, [field]: value } : visit
      );
      
      // Re-sort if year was changed and it's a complete year (4 digits)
      if (field === 'year' && value.toString().length === 4) {
        return updated.sort((a, b) => parseInt(a.year) - parseInt(b.year));
      }
      
      return updated;
    });
  };

  const sortVisits = () => {
    setVisits(prev => prev.sort((a, b) => parseInt(a.year) - parseInt(b.year)));
  };

  const removeVisit = async (tempId: string) => {
    const visit = visits.find(v => v.tempId === tempId);
    if (visit?.id && !visit.isNew) {
      try {
        await deleteVisit(visit.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete visit');
        return;
      }
    }
    setVisits(prev => prev.filter(v => v.tempId !== tempId));
  };

  const handleSave = async () => {
    if (!regionId) return;
    
    setSaving(true);
    setError('');

    try {
      // Validate all visits
      for (const visit of visits) {
        const year = parseInt(visit.year);
        if (!year || year < 1900 || year > new Date().getFullYear() + 10) {
          throw new Error(`Invalid year: ${visit.year}`);
        }
      }

      // Check for duplicate years
      const years = visits.map(v => v.year);
      const uniqueYears = new Set(years);
      if (years.length !== uniqueYears.size) {
        throw new Error('Cannot have multiple visits for the same year');
      }

      // Close modal immediately to prevent visual glitches
      onClose();

      // Perform database operations in background (in parallel for better UX)
      const visitPromises = visits.map(async (visit) => {
        const year = parseInt(visit.year);
        
        if (visit.isNew || !visit.id) {
          // Create new visit
          return addVisit(
            regionId,
            'japan',
            visit.rating,
            year,
            visit.notes || undefined
          );
        } else {
          // Update existing visit
          return updateVisit(visit.id, {
            rating: visit.rating,
            visit_year: year,
            notes: visit.notes || null
          });
        }
      });

      // Save prefecture star rating in parallel with visits
      const ratingPromise = prefectureStarRating > 0 
        ? setPrefectureRating(regionId, 'japan', prefectureStarRating)
        : deletePrefectureRating(regionId, 'japan');

      // Wait for all operations to complete
      await Promise.all([...visitPromises, ratingPromise]);

    } catch (err) {
      // If there's an error, we could show a toast notification here
      console.error('Error saving visits:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRatingColor = (rating: VisitRating) => {
    const colors = {
      0: "bg-gray-100 text-gray-700",
      1: "bg-red-100 text-red-700",
      2: "bg-orange-100 text-orange-700",
      3: "bg-yellow-100 text-yellow-700",
      4: "bg-green-100 text-green-700",
      5: "bg-blue-100 text-blue-700"
    };
    return colors[rating];
  };


  if (!region) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Manage Visits - {region.name}</span>
            {region.nameJapanese && (
              <span className="text-sm text-muted-foreground font-normal">
                ({region.nameJapanese})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove visits to {region.name} across different years.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prefecture Star Rating */}
          <div className="border rounded-lg p-4 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Prefecture Rating</h3>
                <p className="text-sm text-gray-600">Overall impression of {region.name}</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-6 h-6 cursor-pointer transition-colors",
                      i < prefectureStarRating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300 hover:text-yellow-200"
                    )}
                    onClick={() => setPrefectureStarRating(i + 1)}
                  />
                ))}
                {prefectureStarRating > 0 && (
                  <button
                    onClick={() => setPrefectureStarRating(0)}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visits Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-24">Year</TableHead>
                  <TableHead className="w-40">Visit Type</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No visits recorded yet. Click &quot;Add Visit&quot; to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  visits.map((visit) => (
                    <TableRow key={visit.tempId}>
                      <TableCell>
                        <Input
                          type="number"
                          value={visit.year}
                          onChange={(e) => updateVisitEdit(visit.tempId, 'year', e.target.value)}
                          onBlur={sortVisits}
                          className="w-20"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={visit.rating.toString()} 
                          onValueChange={(value) => updateVisitEdit(visit.tempId, 'rating', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
                              .filter(rating => rating !== 0) // Remove "Never been" option
                              .map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-3 h-3 rounded", getRatingColor(rating))} />
                                  {RATING_LABELS[rating]}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={visit.notes}
                          onChange={(e) => updateVisitEdit(visit.tempId, 'notes', e.target.value)}
                          placeholder="Optional notes..."
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVisit(visit.tempId)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Visit Button */}
          <Button
            onClick={addNewVisit}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Visit
          </Button>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}