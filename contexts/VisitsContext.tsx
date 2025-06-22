'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Visit, VisitRating, VisitStats } from '@/types';

interface VisitsContextType {
  visits: Visit[];
  addVisit: (regionId: string, countryId: string, rating: VisitRating, notes?: string, visitDate?: Date) => void;
  updateVisit: (visitId: string, updates: Partial<Visit>) => void;
  deleteVisit: (visitId: string) => void;
  getVisitByRegion: (regionId: string) => Visit | undefined;
  getVisitsByCountry: (countryId: string) => Visit[];
  getStats: (countryId: string, totalRegions: number) => VisitStats;
}

const VisitsContext = createContext<VisitsContextType | undefined>(undefined);

// Helper function to revive Date objects from JSON
function reviveDates(key: string, value: any) {
  if (typeof value === 'string' && 
      (key === 'visitDate' || key === 'createdAt' || key === 'updatedAt') &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

export function VisitsProvider({ children }: { children: React.ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('travel-visits');
      if (item) {
        const parsed = JSON.parse(item, reviveDates);
        setVisits(parsed);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever visits change
  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem('travel-visits', JSON.stringify(visits));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [visits, isLoaded]);

  const addVisit = useCallback((regionId: string, countryId: string, rating: VisitRating, notes?: string, visitDate?: Date) => {
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      regionId,
      countryId,
      rating,
      notes,
      visitDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setVisits(prev => [...prev, newVisit]);
  }, []);

  const updateVisit = useCallback((visitId: string, updates: Partial<Visit>) => {
    setVisits(prev => 
      prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updates, updatedAt: new Date() }
          : visit
      )
    );
  }, []);

  const deleteVisit = useCallback((visitId: string) => {
    setVisits(prev => prev.filter(visit => visit.id !== visitId));
  }, []);

  const getVisitByRegion = useCallback((regionId: string): Visit | undefined => {
    return visits.find(visit => visit.regionId === regionId);
  }, [visits]);

  const getVisitsByCountry = useCallback((countryId: string): Visit[] => {
    return visits.filter(visit => visit.countryId === countryId);
  }, [visits]);

  const getStats = useCallback((countryId: string, totalRegions: number): VisitStats => {
    const countryVisits = getVisitsByCountry(countryId);
    const visitedRegions = countryVisits.length;
    
    const ratingBreakdown = countryVisits.reduce((acc, visit) => {
      acc[visit.rating] = (acc[visit.rating] || 0) + 1;
      return acc;
    }, {} as Record<VisitRating, number>);

    // Fill in missing ratings with 0
    for (let i = 0; i <= 5; i++) {
      if (!(i in ratingBreakdown)) {
        ratingBreakdown[i as VisitRating] = 0;
      }
    }

    const lastVisit = countryVisits
      .filter(visit => visit.visitDate)
      .sort((a, b) => (b.visitDate?.getTime() || 0) - (a.visitDate?.getTime() || 0))[0]?.visitDate;

    return {
      totalRegions,
      visitedRegions,
      percentageVisited: Math.round((visitedRegions / totalRegions) * 100),
      ratingBreakdown,
      lastVisit
    };
  }, [getVisitsByCountry]);

  const value: VisitsContextType = {
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisitByRegion,
    getVisitsByCountry,
    getStats
  };

  return (
    <VisitsContext.Provider value={value}>
      {children}
    </VisitsContext.Provider>
  );
}

export function useVisits() {
  const context = useContext(VisitsContext);
  if (context === undefined) {
    throw new Error('useVisits must be used within a VisitsProvider');
  }
  return context;
}