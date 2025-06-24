'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, RATING_COLORS, VisitRating } from '@/types';
import { MapPin, Calendar, Trophy, TrendingUp, BarChart3, Crown, Repeat, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface DetailModalData {
  type: 'stars' | 'visitType' | 'region';
  title: string;
  prefectures: Array<{
    id: string;
    name: string;
    value: number | string;
    color?: string;
  }>;
}

// Recharts click event types  
interface RechartsClickData {
  activeIndex?: string | number;
  activeLabel?: string;
  activeDataKey?: string;
  activeCoordinate?: {
    x: number;
    y: number;
  };
}

export function StatsDashboard() {
  const { getStats, getVisitsByCountry, getPrefectureRating } = useSupabaseVisits();
  const { resolvedTheme } = useTheme();
  const stats = getStats('japan', japanPrefectures.regions.length);
  const japanVisits = getVisitsByCountry('japan');
  const [detailModal, setDetailModal] = useState<DetailModalData | null>(null);
  
  // Prepare star ratings data (only for prefectures eligible for ratings)
  const starRatingsData: Array<{
    stars: number;
    count: number;
    name: string;
    color: string;
  }> = [];
  const eligiblePrefectures = japanVisits
    .filter(visit => visit.rating > 0) // Has visits
    .reduce((acc, visit) => {
      const highest = acc[visit.region_id] || 0;
      acc[visit.region_id] = Math.max(highest, visit.rating);
      return acc;
    }, {} as Record<string, number>);
    
  // Only include prefectures with highest visit type 3+ (eligible for star ratings)
  const eligibleForStars = Object.entries(eligiblePrefectures)
    .filter(([, highestType]) => highestType >= 3)
    .map(([regionId]) => regionId);
    
  // Count star ratings for eligible prefectures
  for (let stars = 1; stars <= 5; stars++) {
    const count = eligibleForStars.filter(regionId => {
      const starRating = getPrefectureRating(regionId, 'japan');
      return starRating === stars;
    }).length;
    
    if (count > 0) {
      starRatingsData.push({
        stars,
        count,
        name: `${stars} Star${stars > 1 ? 's' : ''}`,
        color: `hsl(${45 + stars * 15}, 70%, 50%)` // Gold gradient
      });
    }
  }

  // Visits per year data (for timeline chart)
  const visitsByYear = japanVisits
    .filter(visit => visit.rating > 0) // Exclude "Never been"
    .reduce((acc, visit) => {
      const year = visit.visit_year;
      if (!acc[year]) {
        acc[year] = { year, visits: 0, newPrefectures: 0 };
      }
      acc[year].visits++;
      return acc;
    }, {} as Record<number, { year: number; visits: number; newPrefectures: number }>);

  // Calculate new prefectures per year (first-time visits)
  const prefectureFirstVisits = new Map<string, number>();
  japanVisits
    .filter(visit => visit.rating > 0)
    .sort((a, b) => a.visit_year - b.visit_year)
    .forEach(visit => {
      if (!prefectureFirstVisits.has(visit.region_id)) {
        prefectureFirstVisits.set(visit.region_id, visit.visit_year);
        if (visitsByYear[visit.visit_year]) {
          visitsByYear[visit.visit_year].newPrefectures++;
        }
      }
    });

  const yearlyData = Object.values(visitsByYear).sort((a, b) => a.year - b.year);

  // Rating distribution for bar chart
  const ratingDistribution = Object.entries(RATING_LABELS).map(([rating, label]) => ({
    name: label.split(' ')[0], // Shorter labels for chart
    count: stats.ratingBreakdown[parseInt(rating) as VisitRating],
    color: RATING_COLORS[parseInt(rating) as VisitRating],
    fullName: label
  }));

  // Calculate total score and average rating
  const actualVisits = japanVisits.filter(visit => visit.rating > 0);
  const totalScore = actualVisits.reduce((sum, visit) => sum + visit.rating, 0);
  const averageRating = actualVisits.length > 0 ? totalScore / actualVisits.length : 0;

  // Cumulative prefectures over time
  const cumulativeData: { year: number; total: number }[] = [];
  let runningTotal = 0;
  yearlyData.forEach(yearData => {
    runningTotal += yearData.newPrefectures;
    cumulativeData.push({ year: yearData.year, total: runningTotal });
  });

  // Calculate most visited prefecture
  const visitCounts = japanVisits
    .filter(visit => visit.rating > 0)
    .reduce((acc, visit) => {
      acc[visit.region_id] = (acc[visit.region_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const mostVisitedEntry = Object.entries(visitCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  const mostVisitedPrefecture = mostVisitedEntry ? {
    name: japanPrefectures.regions.find(r => r.id === mostVisitedEntry[0])?.name || mostVisitedEntry[0],
    count: mostVisitedEntry[1]
  } : null;

  // Calculate exploration rate (prefectures visited this year vs total)
  const currentYear = new Date().getFullYear();
  const visitsThisYear = japanVisits.filter(visit => 
    visit.rating > 0 && visit.visit_year === currentYear
  ).length;

  // Calculate best score (highest rating per prefecture, counted once)
  const bestScoreByPrefecture = japanVisits
    .filter(visit => visit.rating > 0)
    .reduce((acc, visit) => {
      const currentBest = acc[visit.region_id] || 0;
      acc[visit.region_id] = Math.max(currentBest, visit.rating);
      return acc;
    }, {} as Record<string, number>);
  
  const bestScore = Object.values(bestScoreByPrefecture).reduce((sum, rating) => sum + rating, 0);

  // Region mapping (including Okinawa as Kyushu)
  const regionMapping = {
    'hokkaido': 'Hokkaido',
    'aomori': 'Tohoku', 'iwate': 'Tohoku', 'miyagi': 'Tohoku', 'akita': 'Tohoku', 'yamagata': 'Tohoku', 'fukushima': 'Tohoku',
    'ibaraki': 'Kanto', 'tochigi': 'Kanto', 'gunma': 'Kanto', 'saitama': 'Kanto', 'chiba': 'Kanto', 'tokyo': 'Kanto', 'kanagawa': 'Kanto',
    'niigata': 'Chubu', 'toyama': 'Chubu', 'ishikawa': 'Chubu', 'fukui': 'Chubu', 'yamanashi': 'Chubu', 'nagano': 'Chubu', 'gifu': 'Chubu', 'shizuoka': 'Chubu', 'aichi': 'Chubu',
    'mie': 'Kansai', 'shiga': 'Kansai', 'kyoto': 'Kansai', 'osaka': 'Kansai', 'hyogo': 'Kansai', 'nara': 'Kansai', 'wakayama': 'Kansai',
    'tottori': 'Chugoku', 'shimane': 'Chugoku', 'okayama': 'Chugoku', 'hiroshima': 'Chugoku', 'yamaguchi': 'Chugoku',
    'tokushima': 'Shikoku', 'kagawa': 'Shikoku', 'ehime': 'Shikoku', 'kochi': 'Shikoku',
    'fukuoka': 'Kyushu', 'saga': 'Kyushu', 'nagasaki': 'Kyushu', 'kumamoto': 'Kyushu', 'oita': 'Kyushu', 'miyazaki': 'Kyushu', 'kagoshima': 'Kyushu', 'okinawa': 'Kyushu'
  };

  // Calculate region visit data
  const regionVisitData = japanVisits
    .filter(visit => visit.rating > 0)
    .reduce((acc, visit) => {
      const region = regionMapping[visit.region_id as keyof typeof regionMapping] || 'Unknown';
      if (!acc[region]) {
        acc[region] = new Set();
      }
      acc[region].add(visit.region_id);
      return acc;
    }, {} as Record<string, Set<string>>);

  // Get all regions and their totals
  const allRegions = ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu'];
  
  const regionTracker = allRegions.map(region => {
    const total = Object.entries(regionMapping).filter(([, r]) => r === region).length;
    const visited = regionVisitData[region]?.size || 0;
    const percentage = Math.round((visited / total) * 100);
    
    return {
      region,
      visited,
      total,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // Interactive chart handlers using BarChart onClick
  const handleStarRatingChartClick = (data: RechartsClickData) => {
    if (data.activeIndex === undefined) return;
    
    const index = typeof data.activeIndex === 'string' ? parseInt(data.activeIndex) : data.activeIndex;
    const clickedData = starRatingsData[index];
    
    if (!clickedData) return;
    
    const starLevel = clickedData.stars;
    const prefecturesWithThisRating = eligibleForStars
      .filter(regionId => getPrefectureRating(regionId, 'japan') === starLevel)
      .map(regionId => {
        const prefecture = japanPrefectures.regions.find(r => r.id === regionId);
        return {
          id: regionId,
          name: prefecture?.name || regionId,
          value: `${starLevel} star${starLevel !== 1 ? 's' : ''}`,
          color: clickedData.color
        };
      });

    setDetailModal({
      type: 'stars',
      title: `Prefectures with ${starLevel} Star${starLevel !== 1 ? 's' : ''}`,
      prefectures: prefecturesWithThisRating
    });
  };

  const handleVisitTypeChartClick = (data: RechartsClickData) => {
    if (data.activeIndex === undefined) return;
    
    const index = typeof data.activeIndex === 'string' ? parseInt(data.activeIndex) : data.activeIndex;
    const clickedData = ratingDistribution[index];
    
    if (!clickedData) return;
    
    const ratingValue = Object.entries(RATING_LABELS).find(([, label]) => 
      label.split(' ')[0] === clickedData.name
    )?.[0];
    
    if (!ratingValue) return;
    
    const rating = parseInt(ratingValue) as VisitRating;
    const prefecturesWithThisType = japanVisits
      .filter(visit => visit.rating === rating)
      .map(visit => visit.region_id)
      .filter((regionId, index, array) => array.indexOf(regionId) === index) // Remove duplicates
      .map(regionId => {
        const prefecture = japanPrefectures.regions.find(r => r.id === regionId);
        return {
          id: regionId,
          name: prefecture?.name || regionId,
          value: RATING_LABELS[rating],
          color: clickedData.color
        };
      });

    setDetailModal({
      type: 'visitType',
      title: `Prefectures with "${RATING_LABELS[rating]}" visits`,
      prefectures: prefecturesWithThisType
    });
  };

  const handleRegionClick = (regionName: string) => {
    const region = regionTracker.find(r => r.region === regionName);
    if (!region) return;

    const regionPrefectures = Object.entries(regionMapping)
      .filter(([, r]) => r === regionName)
      .map(([prefectureId]) => {
        const prefecture = japanPrefectures.regions.find(r => r.id === prefectureId);
        const hasVisits = regionVisitData[regionName]?.has(prefectureId) || false;
        return {
          id: prefectureId,
          name: prefecture?.name || prefectureId,
          value: hasVisits ? 'Visited' : 'Not visited',
          color: hasVisits ? '#3b82f6' : '#e5e7eb'
        };
      });

    setDetailModal({
      type: 'region',
      title: `${regionName} Region (${region.visited}/${region.total} visited)`,
      prefectures: regionPrefectures
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Travel Analytics</h2>
      </div>

      {/* Stats Grid - 3x3 Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Progress */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Progress</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.percentageVisited}%</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {stats.visitedRegions} of {stats.totalRegions}
            </p>
            <Progress value={stats.percentageVisited} className="h-1" />
          </CardContent>
        </Card>

        {/* Total Score */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-600" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Score</span>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{totalScore}</span>
            </div>
            <p className="text-xs text-gray-600">
              Avg: {averageRating.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        {/* Best Score */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Best Score</span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{bestScore}</span>
            </div>
            <p className="text-xs text-gray-600">
              Peak score per prefecture
            </p>
          </CardContent>
        </Card>

        {/* Total Visits */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Visits</span>
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {japanVisits.filter(v => v.rating > 0).length}
            </div>
          </CardContent>
        </Card>

        {/* This Year */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">This Year</span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {visitsThisYear}
            </div>
            <p className="text-xs text-gray-600">visits in {currentYear}</p>
          </CardContent>
        </Card>

        {/* Most Visited Prefecture */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Repeat className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Most Visited</span>
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {mostVisitedPrefecture?.name || 'None yet'}
            </div>
            <p className="text-xs text-gray-600">
              {mostVisitedPrefecture ? `${mostVisitedPrefecture.count} visits` : '0 visits'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Ratings Chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100 flex items-center justify-between">
              Star Ratings
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">Click bars for details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {starRatingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={starRatingsData} 
                  margin={{ top: 5, right: 15, left: 10, bottom: 35 }}
                  onClick={handleStarRatingChartClick}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    height={30}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} width={25} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} prefecture${value !== 1 ? 's' : ''}`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: resolvedTheme === 'dark' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1F2937',
                      boxShadow: resolvedTheme === 'dark' 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#6B7280'
                    }}
                    itemStyle={{
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1F2937'
                    }}
                  />
                  <Bar dataKey="count">
                    {starRatingsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No star ratings yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {starRatingsData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                  <span className="font-medium dark:text-gray-200">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution Bar Chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100 flex items-center justify-between">
              Types
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">Click bars for details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={ratingDistribution} 
                margin={{ top: 5, right: 15, left: 10, bottom: 35 }}
                onClick={handleVisitTypeChartClick}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  height={30}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} width={25} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} prefecture${value !== 1 ? 's' : ''}`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: resolvedTheme === 'dark' ? 'none' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1F2937',
                    boxShadow: resolvedTheme === 'dark' 
                      ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{
                    color: resolvedTheme === 'dark' ? '#FFFFFF' : '#6B7280'
                  }}
                  itemStyle={{
                    color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1F2937'
                  }}
                />
                <Bar dataKey="count">
                  {ratingDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visits by Year - Third chart */}
        {yearlyData.length > 0 && (
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">By Year</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={yearlyData} margin={{ top: 5, right: 15, left: 10, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9CA3AF' }} height={30} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} width={25} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} visit${value !== 1 ? 's' : ''}`,
                      name === 'visits' ? 'Total Visits' : 'New Prefectures'
                    ]}
                    contentStyle={{
                      backgroundColor: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: resolvedTheme === 'dark' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1F2937',
                      boxShadow: resolvedTheme === 'dark' 
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#6B7280'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newPrefectures" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="#10b981" 
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Region Tracker - Fourth chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100 flex items-center justify-between">
              Regions
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">Click for details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionTracker.map((region) => (
                <div 
                  key={region.region} 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleRegionClick(region.region)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16">
                      {region.region}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {region.visited}/{region.total}
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 w-8 text-right">
                      {region.percentage}%
                    </span>
                  </div>
                </div>
              ))}
              {regionTracker.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No regional data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Timeline Chart - if more than 3 years of data */}
      {yearlyData.length > 2 && (
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base">Cumulative Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value} prefecture${value !== 1 ? 's' : ''}`,
                      'Total Visited'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailModal?.title}
            </DialogTitle>
            <DialogDescription>
              {detailModal?.type === 'stars' && 'Prefectures with this star rating'}
              {detailModal?.type === 'visitType' && 'Prefectures with this visit type'}
              {detailModal?.type === 'region' && 'All prefectures in this region'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {detailModal?.prefectures.map((prefecture) => (
              <div key={prefecture.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: prefecture.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {prefecture.name}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    detailModal?.type === 'stars' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    detailModal?.type === 'visitType' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    detailModal?.type === 'region' && prefecture.value === 'Visited' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    detailModal?.type === 'region' && prefecture.value === 'Not visited' && "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {detailModal?.type === 'stars' && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {prefecture.value}
                    </div>
                  )}
                  {detailModal?.type !== 'stars' && prefecture.value}
                </Badge>
              </div>
            ))}
            
            {detailModal?.prefectures.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No prefectures found for this category
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}