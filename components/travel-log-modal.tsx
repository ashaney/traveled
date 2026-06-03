'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures, japanRegionGroups } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelLogModalProps {
  open: boolean;
  onClose: () => void;
}

interface LogEntry {
  tempId: string;
  regionId: string; // '' until the user picks a prefecture
  year: string;
  rating: VisitRating;
  notes: string;
}

const getRatingColor = (rating: VisitRating) => {
  const colors = {
    0: 'bg-gray-100 text-gray-700',
    1: 'bg-red-100 text-red-700',
    2: 'bg-orange-100 text-orange-700',
    3: 'bg-yellow-100 text-yellow-700',
    4: 'bg-green-100 text-green-700',
    5: 'bg-blue-100 text-blue-700',
  };
  return colors[rating];
};

const createEntry = (): LogEntry => ({
  tempId: `entry-${Date.now()}-${Math.random()}`,
  regionId: '',
  year: new Date().getFullYear().toString(),
  rating: 1, // Default to "Passed through" (skip "Never been")
  notes: '',
});

export function TravelLogModal({ open, onClose }: TravelLogModalProps) {
  const { addVisit, getVisitsByRegion } = useSupabaseVisits();
  const [entries, setEntries] = useState<LogEntry[]>([createEntry()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setEntries([createEntry()]);
      setError('');
    }
  }, [open]);

  const addEntry = () => setEntries(prev => [...prev, createEntry()]);

  const removeEntry = (tempId: string) => {
    setEntries(prev => (prev.length === 1 ? [createEntry()] : prev.filter(e => e.tempId !== tempId)));
  };

  const updateEntry = (tempId: string, field: keyof LogEntry, value: string | number) => {
    setEntries(prev => prev.map(e => (e.tempId === tempId ? { ...e, [field]: value } : e)));
  };

  const handleSave = async () => {
    setError('');
    const currentYear = new Date().getFullYear();

    // Per-row validation
    for (const entry of entries) {
      if (!entry.regionId) {
        setError('Please choose a prefecture for every row.');
        return;
      }
      const year = parseInt(entry.year);
      if (!year || year < 1900 || year > currentYear + 10) {
        const region = japanPrefectures.regions.find(r => r.id === entry.regionId);
        setError(`Enter a valid year (1900–${currentYear + 10}) for ${region?.name ?? 'each visit'}.`);
        return;
      }
    }

    // Duplicate prefecture + year within this batch
    const seen = new Set<string>();
    for (const entry of entries) {
      const key = `${entry.regionId}-${entry.year}`;
      if (seen.has(key)) {
        const region = japanPrefectures.regions.find(r => r.id === entry.regionId);
        setError(`Duplicate entry: ${region?.name ?? 'prefecture'} in ${entry.year} appears more than once.`);
        return;
      }
      seen.add(key);
    }

    // Duplicate against visits that already exist
    for (const entry of entries) {
      const year = parseInt(entry.year);
      const existing = getVisitsByRegion(entry.regionId).some(v => v.visit_year === year);
      if (existing) {
        const region = japanPrefectures.regions.find(r => r.id === entry.regionId);
        setError(`You already have a visit for ${region?.name ?? 'this prefecture'} in ${entry.year}.`);
        return;
      }
    }

    setSaving(true);
    try {
      await Promise.all(
        entries.map(entry =>
          addVisit(entry.regionId, 'japan', entry.rating, parseInt(entry.year), entry.notes.trim() || undefined)
        )
      );
      toast.success(`Logged ${entries.length} visit${entries.length === 1 ? '' : 's'}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save visits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
            <NotebookPen className="w-5 h-5" />
            <span>Travel Log</span>
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Quickly log one or more visits across any prefectures — no need to pick them on the map first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="w-56 dark:text-gray-200">Prefecture</TableHead>
                  <TableHead className="w-24 dark:text-gray-200">Year</TableHead>
                  <TableHead className="w-44 dark:text-gray-200">Visit Type</TableHead>
                  <TableHead className="dark:text-gray-200">Notes</TableHead>
                  <TableHead className="w-16 dark:text-gray-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.tempId} className="dark:border-gray-600">
                    <TableCell>
                      <Select
                        value={entry.regionId}
                        onValueChange={value => updateEntry(entry.tempId, 'regionId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select prefecture" />
                        </SelectTrigger>
                        <SelectContent>
                          {japanRegionGroups.map(group => (
                            <SelectGroup key={group.name}>
                              <SelectLabel>
                                {group.name} ({group.nameJapanese})
                              </SelectLabel>
                              {group.regionIds.map(regionId => {
                                const region = japanPrefectures.regions.find(r => r.id === regionId);
                                if (!region) return null;
                                return (
                                  <SelectItem key={region.id} value={region.id}>
                                    <span>
                                      {region.name}
                                      {region.nameJapanese && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          {region.nameJapanese}
                                        </span>
                                      )}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={entry.year}
                        onChange={e => updateEntry(entry.tempId, 'year', e.target.value)}
                        className="w-20"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={entry.rating.toString()}
                        onValueChange={value => updateEntry(entry.tempId, 'rating', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
                            .filter(rating => parseInt(rating.toString()) !== 0)
                            .map(rating => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className={cn('w-3 h-3 rounded', getRatingColor(rating))} />
                                  {RATING_LABELS[rating]}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={entry.notes}
                        onChange={e => updateEntry(entry.tempId, 'notes', e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.tempId)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={addEntry} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add another visit
          </Button>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : `Save ${entries.length} visit${entries.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
