'use client';

import { useState } from 'react';
import { LogOut, User } from "lucide-react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { JapanRegionMap } from '@/components/japan-region-map';
import { VisitDialog } from '@/components/visit-dialog';
import { VisitStats } from '@/components/visit-stats';
import { VisitTable } from '@/components/visit-table';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('japan');
  const { user, signOut, loading } = useAuth();
  const { loading: visitsLoading } = useSupabaseVisits();

  const countries = {
    japan: { name: 'Japan', flag: '🇯🇵' },
  };

  if (loading || visitsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo_with_text.png" 
                alt="Traveled" 
                width={140}
                height={37}
                className="h-9 w-auto" 
                priority
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="japan">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇯🇵</span>
                      Japan
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Main Content - Map */}
          <div className="lg:col-span-4">
            {/* Japan Explorer Map */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {countries[selectedCountry as keyof typeof countries].name} Explorer
                </h2>
                <p className="text-sm text-gray-600">Click any region to track visits</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border-0 p-8">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-gray-600">Never been</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span className="text-gray-600">Passed through</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 rounded"></div>
                    <span className="text-gray-600">Brief stop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span className="text-gray-600">Day visit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span className="text-gray-600">Multi-day stay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <span className="text-gray-600">Lived there</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <JapanRegionMap 
                    onRegionClick={handleRegionClick}
                    className="w-full"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar with Statistics */}
          <div className="lg:col-span-1">
            <div className="h-fit">
              <VisitStats />
            </div>
          </div>
        </div>

        {/* Visit Records Table - Full Width */}
        <section>
          <VisitTable onEditVisit={handleEditVisit} />
        </section>
      </div>

      <VisitDialog 
        regionId={selectedRegion}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
