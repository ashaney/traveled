'use client';

import { useVisits } from '@/contexts/VisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, VisitRating } from '@/types';
import { BarChart3, MapPin, Calendar } from 'lucide-react';

export function VisitStats() {
  const { getStats } = useVisits();
  const stats = getStats('japan', japanPrefectures.regions.length);

  const ratingColors = {
    0: 'bg-gray-200 dark:bg-gray-700',
    1: 'bg-red-200 dark:bg-red-900',
    2: 'bg-orange-200 dark:bg-orange-900',
    3: 'bg-yellow-200 dark:bg-yellow-900',
    4: 'bg-green-200 dark:bg-green-900',
    5: 'bg-blue-200 dark:bg-blue-900'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Travel Statistics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overall Progress
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.percentageVisited}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stats.visitedRegions} of {stats.totalRegions} prefectures
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentageVisited}%` }}
            />
          </div>
        </div>

        {/* Last Visit */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last Visit
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.lastVisit 
              ? new Date(stats.lastVisit).toLocaleDateString() 
              : 'None yet'
            }
          </div>
        </div>

        {/* Rating Breakdown */}
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
            Visit Types
          </div>
          <div className="space-y-2">
            {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
              .filter(rating => stats.ratingBreakdown[rating] > 0)
              .map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${ratingColors[rating]}`} />
                  <span className="flex-1 text-gray-700 dark:text-gray-300">
                    {RATING_LABELS[rating]}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.ratingBreakdown[rating]}
                  </span>
                </div>
              ))}
            {stats.visitedRegions === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
                Start exploring to see your statistics!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}