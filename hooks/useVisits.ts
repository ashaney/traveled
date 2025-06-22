import { useState, useCallback } from 'react';
import { Visit, VisitRating, VisitStats } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import spacetime from 'spacetime';

export function useVisits() {
  const [visits, setVisits, isLoaded] = useLocalStorage<Visit[]>('travel-visits', []);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const addVisit = (regionId: string, countryId: string, rating: VisitRating, notes?: string, visitDate?: Date) => {
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

    console.log('Adding visit:', newVisit);
    setVisits(prev => {
      const updated = [...prev, newVisit];
      console.log('Updated visits array:', updated);
      return updated;
    }, triggerUpdate);
  };

  const updateVisit = (visitId: string, updates: Partial<Visit>) => {
    setVisits(prev => 
      prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updates, updatedAt: new Date() }
          : visit
      ), triggerUpdate
    );
  };

  const deleteVisit = (visitId: string) => {
    setVisits(prev => prev.filter(visit => visit.id !== visitId), triggerUpdate);
  };

  const getVisitByRegion = (regionId: string): Visit | undefined => {
    return visits.find(visit => visit.regionId === regionId);
  };

  const getVisitsByCountry = (countryId: string): Visit[] => {
    return visits.filter(visit => visit.countryId === countryId);
  };

  const getStats = (countryId: string, totalRegions: number): VisitStats => {
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
  };

  return {
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisitByRegion,
    getVisitsByCountry,
    getStats,
    updateTrigger // Include this so components can depend on it
  };
}