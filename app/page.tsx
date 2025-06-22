'use client';

import { useState } from 'react';
import { MapPin, Globe } from "lucide-react";
import { JapanRegionMap } from '@/components/japan-region-map';
import { VisitDialog } from '@/components/visit-dialog';
import { VisitStats } from '@/components/visit-stats';
import { VisitTable } from '@/components/visit-table';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    setDialogOpen(true);
  };

  const handleEditVisit = (regionId: string) => {
    setSelectedRegion(regionId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRegion(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Traveled
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Track your adventures and visualize your journeys around the world
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Japan Explorer
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Click on any prefecture to track your visits and rate your experiences.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Never been</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Passed through</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Brief stop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Day visit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Multi-day stay</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Lived there</span>
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                <JapanRegionMap 
                  onRegionClick={handleRegionClick}
                  className="border rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <VisitStats />
            
            <VisitTable onEditVisit={handleEditVisit} />
          </div>
        </div>
      </div>

      <VisitDialog 
        regionId={selectedRegion}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
