'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'

type Visit = Database['public']['Tables']['visits']['Row']
type VisitInsert = Database['public']['Tables']['visits']['Insert']
type VisitUpdate = Database['public']['Tables']['visits']['Update']
type Region = Database['public']['Tables']['regions']['Row']
type PrefectureRating = Database['public']['Tables']['prefecture_ratings']['Row']
type PrefectureRatingInsert = Database['public']['Tables']['prefecture_ratings']['Insert']
type PrefectureRatingUpdate = Database['public']['Tables']['prefecture_ratings']['Update']

export type VisitRating = 0 | 1 | 2 | 3 | 4 | 5

export interface VisitStats {
  totalRegions: number
  visitedRegions: number
  percentageVisited: number
  ratingBreakdown: Record<VisitRating, number>
  lastVisit?: number
}

interface SupabaseVisitsContextType {
  visits: Visit[]
  regions: Region[]
  prefectureRatings: PrefectureRating[]
  loading: boolean
  addVisit: (regionId: string, countryId: string, rating: VisitRating, visitYear: number, notes?: string) => Promise<void>
  updateVisit: (visitId: string, updates: Partial<VisitUpdate>) => Promise<void>
  deleteVisit: (visitId: string) => Promise<void>
  getVisitByRegion: (regionId: string, year?: number) => Visit | undefined
  getHighestRatedVisitByRegion: (regionId: string) => Visit | undefined // Get highest-rated visit for a region
  getVisitsByRegion: (regionId: string) => Visit[] // Get all visits for a region
  getVisitsByCountry: (countryId: string) => Visit[]
  getStats: (countryId: string, totalRegions: number) => VisitStats
  refreshVisits: () => Promise<void>
  getPrefectureRating: (regionId: string, countryId: string) => number | undefined
  setPrefectureRating: (regionId: string, countryId: string, starRating: number) => Promise<void>
  deletePrefectureRating: (regionId: string, countryId: string) => Promise<void>
}

const SupabaseVisitsContext = createContext<SupabaseVisitsContextType | undefined>(undefined)

export function useSupabaseVisits() {
  const context = useContext(SupabaseVisitsContext)
  if (context === undefined) {
    throw new Error('useSupabaseVisits must be used within a SupabaseVisitsProvider')
  }
  return context
}

export function SupabaseVisitsProvider({ children }: { children: React.ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [prefectureRatings, setPrefectureRatings] = useState<PrefectureRating[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Load regions and visits
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('*')
          .eq('country_id', 'japan')
          .order('name')

        if (regionsError) throw regionsError
        setRegions(regionsData || [])

        // Load visits if user is authenticated
        if (user) {
          await refreshVisits()
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const refreshVisits = useCallback(async () => {
    if (!user) {
      setVisits([])
      setPrefectureRatings([])
      return
    }

    try {
      // Load visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (visitsError) throw visitsError
      setVisits(visitsData || [])

      // Load prefecture ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('prefecture_ratings')
        .select('*')
        .eq('user_id', user.id)

      if (ratingsError) throw ratingsError
      setPrefectureRatings(ratingsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [user, supabase])

  const addVisit = useCallback(async (
    regionId: string, 
    countryId: string, 
    rating: VisitRating, 
    visitYear: number,
    notes?: string
  ) => {
    if (!user) throw new Error('User must be authenticated')

    const visitData: VisitInsert = {
      user_id: user.id,
      region_id: regionId,
      country_id: countryId,
      rating,
      visit_year: visitYear,
      notes: notes || null,
    }

    const { data, error } = await supabase
      .from('visits')
      .insert(visitData)
      .select()
      .single()

    if (error) throw error
    
    setVisits(prev => [data, ...prev])
  }, [user, supabase])

  const updateVisit = useCallback(async (visitId: string, updates: Partial<VisitUpdate>) => {
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('visits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', visitId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    setVisits(prev => 
      prev.map(visit => visit.id === visitId ? data : visit)
    )
  }, [user, supabase])

  const deleteVisit = useCallback(async (visitId: string) => {
    if (!user) throw new Error('User must be authenticated')

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId)
      .eq('user_id', user.id)

    if (error) throw error

    setVisits(prev => prev.filter(visit => visit.id !== visitId))
  }, [user, supabase])

  const getVisitByRegion = useCallback((regionId: string, year?: number): Visit | undefined => {
    if (year) {
      return visits.find(visit => visit.region_id === regionId && visit.visit_year === year)
    }
    // Return most recent visit if no year specified
    return visits
      .filter(visit => visit.region_id === regionId)
      .sort((a, b) => b.visit_year - a.visit_year)[0]
  }, [visits])

  const getHighestRatedVisitByRegion = useCallback((regionId: string): Visit | undefined => {
    // Return the highest-rated visit for a region (for map colors and stats)
    return visits
      .filter(visit => visit.region_id === regionId)
      .sort((a, b) => b.rating - a.rating)[0] // Highest rating first
  }, [visits])

  const getVisitsByRegion = useCallback((regionId: string): Visit[] => {
    return visits
      .filter(visit => visit.region_id === regionId)
      .sort((a, b) => b.visit_year - a.visit_year) // Most recent first
  }, [visits])

  const getVisitsByCountry = useCallback((countryId: string): Visit[] => {
    return visits.filter(visit => visit.country_id === countryId)
  }, [visits])

  const getStats = useCallback((countryId: string, totalRegions: number): VisitStats => {
    const countryVisits = getVisitsByCountry(countryId)
    // Exclude "Never been" (rating 0) visits from progress count
    const actualVisits = countryVisits.filter(visit => visit.rating !== 0)
    const visitedRegions = new Set(actualVisits.map(visit => visit.region_id)).size

    // For rating breakdown, use the highest-rated visit per region to avoid double counting
    const highestRatedVisitPerRegion = new Map<string, Visit>()
    countryVisits.forEach(visit => {
      const existing = highestRatedVisitPerRegion.get(visit.region_id)
      if (!existing || visit.rating > existing.rating) {
        highestRatedVisitPerRegion.set(visit.region_id, visit)
      }
    })

    const ratingBreakdown: Record<VisitRating, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }

    highestRatedVisitPerRegion.forEach(visit => {
      ratingBreakdown[visit.rating as VisitRating]++
    })

    const lastVisit = actualVisits
      .sort((a, b) => b.visit_year - a.visit_year)[0]?.visit_year

    return {
      totalRegions,
      visitedRegions,
      percentageVisited: Math.round((visitedRegions / totalRegions) * 100),
      ratingBreakdown,
      lastVisit: lastVisit || undefined
    }
  }, [getVisitsByCountry])

  // Prefecture rating methods
  const getPrefectureRating = useCallback((regionId: string, countryId: string): number | undefined => {
    const rating = prefectureRatings.find(r => r.region_id === regionId && r.country_id === countryId)
    return rating?.star_rating
  }, [prefectureRatings])

  const setPrefectureRating = useCallback(async (regionId: string, countryId: string, starRating: number) => {
    if (!user) throw new Error('User must be authenticated')

    const ratingData: PrefectureRatingInsert = {
      user_id: user.id,
      region_id: regionId,
      country_id: countryId,
      star_rating: starRating,
    }

    const { data, error } = await supabase
      .from('prefecture_ratings')
      .upsert(ratingData, { onConflict: 'user_id,region_id,country_id' })
      .select()
      .single()

    if (error) throw error
    
    // Update local state
    setPrefectureRatings(prev => {
      const filtered = prev.filter(r => !(r.region_id === regionId && r.country_id === countryId))
      return [...filtered, data]
    })
  }, [user, supabase])

  const deletePrefectureRating = useCallback(async (regionId: string, countryId: string) => {
    if (!user) throw new Error('User must be authenticated')

    const { error } = await supabase
      .from('prefecture_ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('region_id', regionId)
      .eq('country_id', countryId)

    if (error) throw error
    
    // Update local state
    setPrefectureRatings(prev => 
      prev.filter(r => !(r.region_id === regionId && r.country_id === countryId))
    )
  }, [user, supabase])

  return (
    <SupabaseVisitsContext.Provider value={{
      visits,
      regions,
      prefectureRatings,
      loading,
      addVisit,
      updateVisit,
      deleteVisit,
      getVisitByRegion,
      getHighestRatedVisitByRegion,
      getVisitsByRegion,
      getVisitsByCountry,
      getStats,
      refreshVisits,
      getPrefectureRating,
      setPrefectureRating,
      deletePrefectureRating
    }}>
      {children}
    </SupabaseVisitsContext.Provider>
  )
}