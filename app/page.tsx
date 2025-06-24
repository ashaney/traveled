'use client';

import { useState, useCallback } from 'react';
import { LogOut, User, MapPin, Table, ExternalLink } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from "motion/react";
import confetti from 'canvas-confetti';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { JapanRegionMap } from '@/components/japan-region-map';
import { VisitDialog } from '@/components/visit-dialog';
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
  const [isCountryHovered, setIsCountryHovered] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSignOutHovered, setIsSignOutHovered] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { loading: visitsLoading } = useSupabaseVisits();

  const handleLogoClick = useCallback(() => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount === 5) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }
      
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      // Show easter egg message
      setShowEasterEgg(true);
      
      // Hide easter egg after 5 seconds
      setTimeout(() => {
        setShowEasterEgg(false);
        setLogoClickCount(0);
      }, 5000);
    }
  }, [logoClickCount]);

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

  if (loading || visitsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-white to-gray-50/30 border-b border-gray-200/60 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            {/* Logo Section */}
            <div className="flex items-center">
              <Image 
                src="/logo_with_text.png" 
                alt="Traveled" 
                width={208}
                height={55}
                className="h-14 w-auto cursor-pointer transition-transform hover:scale-105" 
                priority
                onClick={handleLogoClick}
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Animated Country Selector */}
              <motion.div
                className="relative flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/80 h-10 overflow-hidden cursor-pointer shadow-sm"
                onHoverStart={() => setIsCountryHovered(true)}
                onHoverEnd={() => !isCountryDropdownOpen && setIsCountryHovered(false)}
                animate={{ width: (isCountryHovered || isCountryDropdownOpen) ? "auto" : "40px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-l-lg">
                  <span className="text-lg">🇯🇵</span>
                </div>
                <AnimatePresence>
                  {(isCountryHovered || isCountryDropdownOpen) && (
                    <motion.div
                      className="flex items-center h-full"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Select 
                        value={selectedCountry} 
                        onValueChange={setSelectedCountry}
                        onOpenChange={(open) => {
                          setIsCountryDropdownOpen(open);
                          if (!open && !isCountryHovered) {
                            setIsCountryHovered(false);
                          }
                        }}
                      >
                        <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 px-3 h-full">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Animated User Info */}
              <motion.div 
                className="hidden sm:flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/80 h-10 overflow-hidden cursor-pointer shadow-sm"
                onHoverStart={() => setIsUserHovered(true)}
                onHoverEnd={() => setIsUserHovered(false)}
                animate={{ width: isUserHovered ? "auto" : "40px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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

              {/* Animated Sign Out Button */}
              <motion.div
                className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/80 h-10 overflow-hidden cursor-pointer shadow-sm"
                onHoverStart={() => setIsSignOutHovered(true)}
                onHoverEnd={() => setIsSignOutHovered(false)}
                animate={{ width: isSignOutHovered ? "auto" : "40px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                onClick={signOut}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-l-lg">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <AnimatePresence>
                  {isSignOutHovered && (
                    <motion.div
                      className="flex items-center h-full"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <span className="text-sm font-medium text-red-600 px-3 whitespace-nowrap">Sign Out</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4">
          {/* Main Content - Map */}
          <div>
            {/* Explore the Map */}
            <section id="map-section" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Explore the Map</h2>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Click any region to track visits</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border-0 p-3">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-sm mb-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-gray-600">Never been</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span className="text-gray-600">Passed through</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 rounded"></div>
                    <span className="text-gray-600">Brief stop</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span className="text-gray-600">Day visit</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span className="text-gray-600">Multi-day stay</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
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
          <div className="flex items-center gap-2 mb-6">
            <Table className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Visit Records</h2>
          </div>
          <VisitTable onManagePrefecture={handleManagePrefecture} />
        </section>
      </div>

      {/* Page Navigation */}
      <PageNav />
      
      {/* Easter Egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed bottom-8 right-8 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-6 max-w-sm z-50"
          >
            <div className="text-center space-y-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl"
              >
                🎉
              </motion.div>
              <div className="text-sm text-gray-700 leading-relaxed">
                Made with <span className="text-red-500">❤️</span> by Aaron in <span className="text-blue-500">🇯🇵</span>
              </div>
              <motion.a
                href="https://github.com/ashaney/traveled"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
