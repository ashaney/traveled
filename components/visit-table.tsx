'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useVisits } from '@/contexts/VisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, RATING_COLORS_TAILWIND, VisitRating } from '@/types';
import { Trash2, Edit, TableIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitTableProps {
  onEditVisit?: (regionId: string) => void;
}

export function VisitTable({ onEditVisit }: VisitTableProps) {
  const { visits, deleteVisit } = useVisits();
  const [sortBy, setSortBy] = useState<'region' | 'rating' | 'date'>('region');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const japanVisits = visits.filter(visit => visit.countryId === 'japan');

  const getRegionName = (regionId: string) => {
    const region = japanPrefectures.regions.find(r => r.id === regionId);
    return region?.name || regionId;
  };

  const getRatingColor = (rating: VisitRating) => {
    const colors = {
      0: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
      1: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      2: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      3: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      4: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      5: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
    };
    return colors[rating];
  };

  const sortedVisits = [...japanVisits].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'region':
        comparison = getRegionName(a.regionId).localeCompare(getRegionName(b.regionId));
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'date':
        const dateA = a.visitDate?.getTime() || 0;
        const dateB = b.visitDate?.getTime() || 0;
        comparison = dateA - dateB;
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
      ['Prefecture', 'Rating', 'Rating Label', 'Visit Date', 'Notes'],
      ...sortedVisits.map(visit => [
        getRegionName(visit.regionId),
        visit.rating.toString(),
        RATING_LABELS[visit.rating],
        visit.visitDate?.toLocaleDateString() || '',
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TableIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Visit Records
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No visits recorded yet. Start exploring the map to track your adventures!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Visit Records
          </h3>
        </div>
        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('region')}
              >
                Prefecture
                {sortBy === 'region' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('rating')}
              >
                Rating
                {sortBy === 'rating' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('date')}
              >
                Visit Date
                {sortBy === 'date' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVisits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium">
                  {getRegionName(visit.regionId)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getRatingColor(visit.rating)
                  )}>
                    {visit.rating} - {RATING_LABELS[visit.rating]}
                  </span>
                </TableCell>
                <TableCell>
                  {visit.visitDate?.toLocaleDateString() || '-'}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={visit.notes}>
                    {visit.notes || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditVisit?.(visit.regionId)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteVisit(visit.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
    </div>
  );
}