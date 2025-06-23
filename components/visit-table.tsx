'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { Trash2, Download, MapPin, Star, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitTableProps {
  onManagePrefecture?: (regionId: string) => void;
}

export function VisitTable({ onManagePrefecture }: VisitTableProps) {
  const { visits, deleteVisit, getPrefectureRating, getVisitsByRegion } = useSupabaseVisits();
  const [sortBy, setSortBy] = useState<'region' | 'rating' | 'date' | 'type' | 'visits'>('region');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const japanVisits = visits.filter(visit => visit.country_id === 'japan');

  // Get most recent visit per region (for table display)
  const mostRecentVisitsPerRegion = new Map<string, typeof visits[0]>();
  japanVisits.forEach(visit => {
    const existing = mostRecentVisitsPerRegion.get(visit.region_id);
    if (!existing || visit.visit_year > existing.visit_year) {
      mostRecentVisitsPerRegion.set(visit.region_id, visit);
    }
  });
  
  const mostRecentVisits = Array.from(mostRecentVisitsPerRegion.values());

  const getRegionName = (regionId: string) => {
    const region = japanPrefectures.regions.find(r => r.id === regionId);
    return region?.name || regionId;
  };
  
  // Get prefecture star rating from the prefecture_ratings table
  const getPrefectureStarRating = (regionId: string) => {
    return getPrefectureRating(regionId, 'japan') || 0;
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

  const renderStars = (starRating: number | null, visitType: VisitRating) => {
    // For types 0 (Never been), 1 (Passed through), 2 (Brief stop), show N/A
    const showNAForTypes = [0, 1, 2];
    if (showNAForTypes.includes(visitType)) {
      return <span className="text-xs text-gray-500 italic">N/A</span>;
    }
    
    if (!starRating || starRating === 0) {
      return <span className="text-xs text-gray-500 italic">None</span>;
    }
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < starRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  // Filter visits based on search and type filter
  const filteredVisits = mostRecentVisits.filter(visit => {
    const regionName = getRegionName(visit.region_id).toLowerCase();
    const matchesSearch = regionName.includes(searchTerm.toLowerCase()) || 
                         (visit.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || visit.rating.toString() === filterType;
    return matchesSearch && matchesType;
  });

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'region':
        comparison = getRegionName(a.region_id).localeCompare(getRegionName(b.region_id));
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'type':
        comparison = a.rating - b.rating; // Same as rating for now
        break;
      case 'date':
        comparison = a.visit_year - b.visit_year;
        break;
      case 'visits':
        const aVisitCount = getVisitsByRegion(a.region_id).length;
        const bVisitCount = getVisitsByRegion(b.region_id).length;
        comparison = aVisitCount - bVisitCount;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column: 'region' | 'rating' | 'date' | 'type' | 'visits') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportData = () => {
    const csvData = [
      ['Prefecture', 'Type', '# Visits', 'Rating', 'Visit Year'],
      ...sortedVisits.map(visit => [
        getRegionName(visit.region_id),
        RATING_LABELS[visit.rating as VisitRating],
        getVisitsByRegion(visit.region_id).length.toString(),
        getPrefectureStarRating(visit.region_id).toString(),
        visit.visit_year.toString()
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

  if (mostRecentVisits.length === 0) {
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
        <div className="flex items-center justify-between mb-4">
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
        
        {/* Search and Filter Controls */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search prefectures or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(RATING_LABELS) as unknown as VisitRating[]).map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {RATING_LABELS[rating]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-y-auto max-h-96" style={{ scrollbarGutter: 'stable' }}>
            <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead 
                  className="font-semibold w-36 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('region')}
                >
                  Prefecture
                  {sortBy === 'region' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="font-semibold w-32 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('type')}
                >
                  Type
                  {sortBy === 'type' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="font-semibold w-20 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('visits')}
                >
                  # Visits
                  {sortBy === 'visits' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="font-semibold w-36 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('rating')}
                >
                  Rating
                  {sortBy === 'rating' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  className="font-semibold w-32 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('date')}
                >
                  Most Recent
                  {sortBy === 'date' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead className="font-semibold text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVisits.map((visit) => {
                const overallRating = getPrefectureStarRating(visit.region_id);
                return (
                <TableRow key={visit.region_id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">
                    <button
                      onClick={() => onManagePrefecture?.(visit.region_id)}
                      className="text-gray-900 hover:text-blue-600 hover:underline font-medium text-left"
                    >
                      {getRegionName(visit.region_id)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs px-2 py-1", getRatingColor(visit.rating as VisitRating))}>
                      {RATING_LABELS[visit.rating as VisitRating]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-center">
                    {getVisitsByRegion(visit.region_id).length}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(overallRating, visit.rating as VisitRating)}
                      {![0, 1, 2].includes(visit.rating) && overallRating > 0 && (
                        <span className="ml-1 text-xs text-gray-600">({overallRating})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-center">
                    {visit.visit_year}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteVisit(visit.id)}
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      title="Delete most recent visit"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
            </Table>
          </div>
        </div>

        {sortedVisits.length === 0 && (
          <div className="text-center py-8 text-gray-500">No records found.</div>
        )}
      </CardContent>
    </Card>
  );
}