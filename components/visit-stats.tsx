'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { MapPin, Calendar } from 'lucide-react';

export function VisitStats() {
  const { getStats } = useSupabaseVisits();
  const stats = getStats('japan', japanPrefectures.regions.length);
  const progressPercentage = stats.percentageVisited;


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Statistics</h3>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Progress</span>
            </div>
            <span className="text-lg font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {stats.visitedRegions} of {stats.totalRegions} prefectures
          </p>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Last Visit</span>
          </div>
          <div className="text-lg font-bold">
            {stats.lastVisit || 'None yet'}
          </div>
        </CardContent>
      </Card>

      {/* Visit Types Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Visit Types</h4>
          <div className="space-y-2">
            {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
              .filter(rating => stats.ratingBreakdown[rating] > 0)
              .map((rating) => (
                <div key={rating} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{RATING_LABELS[rating]}</span>
                  <span className="text-sm font-medium">{stats.ratingBreakdown[rating]}</span>
                </div>
              ))}
            {stats.visitedRegions === 0 && (
              <div className="text-xs text-gray-500 text-center py-2">
                Start exploring to see your statistics!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}