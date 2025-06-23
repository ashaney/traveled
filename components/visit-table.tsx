'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { Trash2, Edit, Download, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitTableProps {
  onEditVisit?: (regionId: string) => void;
}

export function VisitTable({ onEditVisit }: VisitTableProps) {
  const { visits, deleteVisit } = useSupabaseVisits();
  const [sortBy, setSortBy] = useState<'region' | 'rating' | 'date'>('region');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const japanVisits = visits.filter(visit => visit.country_id === 'japan');

  const getRegionName = (regionId: string) => {
    const region = japanPrefectures.regions.find(r => r.id === regionId);
    return region?.name || regionId;
  };

  const getRatingColor = (rating: VisitRating) => {
    const colors = {
      0: "bg-gray-100 text-gray-700 border-gray-200",
      1: "bg-red-100 text-red-700 border-red-200",
      2: "bg-orange-100 text-orange-700 border-orange-200",
      3: "bg-yellow-100 text-yellow-700 border-yellow-200",
      4: "bg-green-100 text-green-700 border-green-200",
      5: "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[rating];
  };

  const renderStars = (rating: VisitRating, visitType: VisitRating) => {
    // For types 0 (Never been), 1 (Passed through), 2 (Brief stop), show N/A
    const showNAForTypes = [0, 1, 2];
    if (showNAForTypes.includes(visitType)) {
      return <span className="text-xs text-gray-500 italic">N/A</span>;
    }
    
    if (rating === 0) {
      return <span className="text-xs text-gray-500 italic">None</span>;
    }
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  const sortedVisits = [...japanVisits].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'region':
        comparison = getRegionName(a.region_id).localeCompare(getRegionName(b.region_id));
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'date':
        const yearA = a.visit_year || 0;
        const yearB = b.visit_year || 0;
        comparison = yearA - yearB;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: 'region' | 'rating' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportData = () => {
    const csvData = [
      ['Prefecture', 'Type', 'Rating', 'Year', 'Length of Stay', 'Notes'],
      ...sortedVisits.map(visit => [
        getRegionName(visit.region_id),
        RATING_LABELS[visit.rating as VisitRating],
        visit.rating.toString(),
        visit.visit_year?.toString() || '',
        '', // length of stay removed
        visit.notes || ''
      ])
    ];

    const csvString = csvData.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-visits-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (japanVisits.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            Visit Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No visits recorded yet. Start exploring the map to track your adventures!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            Visit Records
          </CardTitle>
          <Button onClick={exportData} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead 
                  className="font-semibold w-40 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('region')}
                >
                  Prefecture
                  {sortBy === 'region' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead className="font-semibold w-40">Type</TableHead>
                <TableHead 
                  className="font-semibold w-48 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('rating')}
                >
                  Rating
                  {sortBy === 'rating' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="font-semibold w-24 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('date')}
                >
                  Year
                  {sortBy === 'date' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead className="font-semibold w-32">Length of Stay</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
              {sortedVisits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">
                    {getRegionName(visit.region_id)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs px-2 py-1", getRatingColor(visit.rating as VisitRating))}>
                      {RATING_LABELS[visit.rating as VisitRating]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(visit.rating as VisitRating, visit.rating as VisitRating)}
                      {![0, 1, 2].includes(visit.rating) && visit.rating > 0 && (
                        <span className="ml-1 text-xs text-gray-600">({visit.rating})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {visit.visit_year || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {'-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-gray-600" title={visit.notes || undefined}>
                      {visit.notes || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditVisit?.(visit.region_id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteVisit(visit.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedVisits.length === 0 && (
          <div className="text-center py-8 text-gray-500">No records found.</div>
        )}
      </CardContent>
    </Card>
  );
}