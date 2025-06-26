'use client';

import { useState, useCallback } from 'react';
import { LogOut, User, MapPin, Table, ExternalLink, Sun, Moon, Monitor, Search } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { japanPrefectures } from '@/data/japan';
import dynamic from 'next/dynamic';
import { JapanRegionMap } from '@/components/japan-region-map';
import { VisitDialog } from '@/components/visit-dialog';
import { PageNav } from '@/components/page-nav';
import { AnimatedHeaderItem } from '@/components/ui/animated-header-item';
import { PrefectureManagementModal } from '@/components/prefecture-management-modal';
import { usePrefectureSearch } from '@/hooks/usePrefectureSearch';

// Dynamic imports for heavy components
const VisitTable = dynamic(() => import('@/components/visit-table').then(mod => ({ default: mod.VisitTable })), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>,
  ssr: false
});

const StatsDashboard = dynamic(() => import('@/components/stats-dashboard').then(mod => ({ default: mod.StatsDashboard })), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>,
  ssr: false
});

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
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { loading: visitsLoading } = useSupabaseVisits();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    selectedSearchResult,
    handleSearch,
    resetSearch,
    scrollToTableRow,
    cancelScroll,
  } = usePrefectureSearch();
  

  const handleLogoClick = useCallback(async () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount === 5) {
      // Dynamically import confetti only when needed
      const { default: confetti } = await import('canvas-confetti');
      
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-white to-gray-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/30 border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            {/* Logo Section */}
            <div className="flex items-center">
              <Image 
                src={resolvedTheme === 'dark' ? '/logo_with_text_dark.png' : '/logo_with_text.png'}
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
              {/* Animated Global Search */}
              <motion.div
                className="relative flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/80 h-10 overflow-hidden cursor-pointer shadow-sm dark:bg-gray-800/80 dark:border-gray-700/80"
                animate={{ width: isSearchExpanded ? "240px" : "40px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                onClick={() => {
                  if (!isSearchExpanded) {
                    setIsSearchExpanded(true);
                    // Focus the input after animation
                    setTimeout(() => {
                      const input = document.getElementById('global-search-input') as HTMLInputElement;
                      input?.focus();
                    }, 350);
                  }
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-l-lg">
                  <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      className="flex items-center h-full flex-1"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <input
                        id="global-search-input"
                        type="text"
                        placeholder="Search prefectures..."
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          handleSearch(value);
                        }}
                        onBlur={() => {
                          if (!searchTerm) {
                            setIsSearchExpanded(false);
                            resetSearch();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchResults.length > 0) {
                            cancelScroll();
                            scrollToTableRow(searchResults[0]);
                            const mapSection = document.getElementById('map-section');
                            if (mapSection) {
                              mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                          if (e.key === 'Escape') {
                            resetSearch();
                            setIsSearchExpanded(false);
                          }
                        }}
                        className="w-full h-full px-3 bg-transparent border-0 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {searchTerm && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetSearch();
                            setIsSearchExpanded(false);
                          }}
                          className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ×
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Search Results Dropdown */}
                {isSearchExpanded && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.slice(0, 8).map((regionId, index) => {
                      const region = japanPrefectures.regions.find(r => r.id === regionId);
                      if (!region) return null;
                      
                      return (
                        <button
                          key={regionId}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={() => {
                            setSearchTerm(region.name);
                            setIsSearchExpanded(false);
                            scrollToTableRow(regionId);
                            const mapSection = document.getElementById('map-section');
                            if (mapSection) {
                              mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{region.name}</div>
                            {region.nameJapanese && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{region.nameJapanese}</div>
                            )}
                          </div>
                          {index === 0 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">⏎</div>
                          )}
                        </button>
                      );
                    })}
                    {searchResults.length > 8 && (
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-700">
                        +{searchResults.length - 8} more results
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

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

              <AnimatedHeaderItem
                isHovered={isThemeHovered}
                onHoverStart={() => setIsThemeHovered(true)}
                onHoverEnd={() => setIsThemeHovered(false)}
                onClick={() => {
                  const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
                  const currentIndex = themes.indexOf(theme);
                  const nextTheme = themes[(currentIndex + 1) % themes.length];
                  setTheme(nextTheme);
                }}
                icon={
                  theme === 'light' ? <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> :
                  theme === 'dark' ? <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> :
                  <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                }
                label={theme === 'system' ? 'Auto' : theme}
                bgColor={theme === 'light' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}
                textColor={theme === 'light' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}
              />

              <AnimatedHeaderItem
                isHovered={isUserHovered}
                onHoverStart={() => setIsUserHovered(true)}
                onHoverEnd={() => setIsUserHovered(false)}
                icon={<User className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                label={user?.email ?? ''}
                bgColor="bg-blue-100 dark:bg-blue-900/50"
                textColor="text-gray-700 dark:text-gray-200"
              />

              <AnimatedHeaderItem
                isHovered={isSignOutHovered}
                onHoverStart={() => setIsSignOutHovered(true)}
                onHoverEnd={() => setIsSignOutHovered(false)}
                onClick={signOut}
                icon={<LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />}
                label="Sign Out"
                bgColor="bg-red-100 dark:bg-red-900/50"
                textColor="text-red-600 dark:text-red-400"
              />
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Explore the Map</h2>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">Click any region to track visits</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 p-3">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-sm mb-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Never been</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Passed through</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 dark:bg-orange-800 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Brief stop</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Day visit</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Multi-day stay</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Lived there</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <JapanRegionMap 
                    onRegionClick={handleRegionClick}
                    selectedRegion={selectedSearchResult || undefined}
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visit Records</h2>
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
