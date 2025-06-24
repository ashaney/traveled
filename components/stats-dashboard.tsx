'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, RATING_COLORS, VisitRating } from '@/types';
import { MapPin, Calendar, Trophy, TrendingUp, BarChart3, Crown, Repeat } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

export function StatsDashboard() {
  const { getStats, getVisitsByCountry } = useSupabaseVisits();
  const { resolvedTheme } = useTheme();
  const stats = getStats('japan', japanPrefectures.regions.length);
  const japanVisits = getVisitsByCountry('japan');
  
  // Prepare data for charts
  const visitTypeData = Object.entries(RATING_LABELS).map(([rating, label]) => ({
    name: label,
    value: stats.ratingBreakdown[parseInt(rating) as VisitRating],
    color: RATING_COLORS[parseInt(rating) as VisitRating],
    rating: parseInt(rating)
  })).filter(item => item.value > 0);

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visit Types Pie Chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100">Visit Types</CardTitle>
          </CardHeader>
          <CardContent>
            {visitTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={visitTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {visitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No visit data yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {visitTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                  <span className="font-medium dark:text-gray-200">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution Bar Chart */}
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-gray-100">Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDistribution} margin={{ top: 5, right: 15, left: 10, bottom: 35 }}>
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
                    backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#FFFFFF',
                    border: resolvedTheme === 'dark' ? 'none' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: resolvedTheme === 'dark' ? '#F3F4F6' : '#1F2937',
                    boxShadow: resolvedTheme === 'dark' 
                      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{
                    color: resolvedTheme === 'dark' ? '#D1D5DB' : '#6B7280'
                  }}
                />
                <Bar dataKey="count">
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
              <ResponsiveContainer width="100%" height={200}>
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
    </div>
  );
}