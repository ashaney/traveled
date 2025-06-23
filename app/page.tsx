'use client';

import { useState } from 'react';
import { LogOut, User } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from "motion/react";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { JapanRegionMap } from '@/components/japan-region-map';
import { VisitDialog } from '@/components/visit-dialog';
import { VisitStats } from '@/components/visit-stats';
import { VisitTable } from '@/components/visit-table';
import { StatsDashboard } from '@/components/stats-dashboard';
import { PageNav } from '@/components/page-nav';
import { PrefectureManagementModal } from '@/components/prefecture-management-modal';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('japan');
  const [isUserHovered, setIsUserHovered] = useState(false);
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

  const handleManagePrefecture = (regionId: string) => {
    setSelectedRegion(regionId);
    setManagementModalOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRegion(null);
    setSelectedVisitId(undefined);
  };
  
  const handleManagementModalClose = () => {
    setManagementModalOpen(false);
    setSelectedRegion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo Section */}
            <div className="flex items-center">
              <Image 
                src="/logo_with_text.png" 
                alt="Traveled" 
                width={189}
                height={50}
                className="h-12 w-auto" 
                priority
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Animated User Info */}
              <motion.div 
                className="hidden sm:flex items-center bg-gray-50 rounded-lg border h-10 overflow-hidden cursor-pointer"
                onHoverStart={() => setIsUserHovered(true)}
                onHoverEnd={() => setIsUserHovered(false)}
                animate={{ width: isUserHovered ? "auto" : "40px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-l-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <AnimatePresence>
                  {isUserHovered && (
                    <motion.div
                      className="flex items-center h-full"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <span className="text-sm font-medium text-gray-700 px-3 whitespace-nowrap">{user?.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Country Selector */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="japan">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇯🇵</span>
                      <span className="font-medium">Japan</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sign Out Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="h-10 px-4 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Main Content - Map */}
          <div>
            {/* Japan Explorer Map */}
            <section id="map-section" className="space-y-4">
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
        </div>

        {/* Statistics Dashboard - Full Width */}
        <section id="stats-section" className="mb-8">
          <StatsDashboard />
        </section>

        {/* Visit Records Table - Full Width */}
        <section id="table-section">
          <VisitTable onManagePrefecture={handleManagePrefecture} />
        </section>
      </div>

      {/* Page Navigation */}
      <PageNav />

      <VisitDialog 
        regionId={selectedRegion}
        open={dialogOpen}
        onClose={handleDialogClose}
        editVisitId={selectedVisitId}
      />
      
      <PrefectureManagementModal 
        regionId={selectedRegion}
        open={managementModalOpen}
        onClose={handleManagementModalClose}
      />
    </div>
  );
}
