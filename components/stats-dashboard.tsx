'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseVisits } from '@/contexts/SupabaseVisitsContext';
import { japanPrefectures } from '@/data/japan';
import { RATING_LABELS, RATING_COLORS, VisitRating } from '@/types';
import { MapPin, Calendar, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

export function StatsDashboard() {
  const { getStats, getVisitsByCountry } = useSupabaseVisits();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Travel Analytics</h2>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Progress</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.percentageVisited}%</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {stats.visitedRegions} of {stats.totalRegions} prefectures
            </p>
            <Progress value={stats.percentageVisited} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Total Score</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{totalScore}</span>
            </div>
            <p className="text-xs text-gray-600">
              Avg: {averageRating.toFixed(1)} per visit
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Last Visit</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.lastVisit || 'None yet'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Visits</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {japanVisits.filter(v => v.rating > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Types Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Visit Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {visitTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {visitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: { payload: { name: string } }) => [
                      `${value} prefecture${value !== 1 ? 's' : ''}`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
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
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                    `${value} prefecture${value !== 1 ? 's' : ''}`,
                    props.payload.fullName
                  ]}
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
      </div>

      {/* Timeline Charts */}
      {yearlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visits per Year */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Visits by Year</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} visit${value !== 1 ? 's' : ''}`,
                      name === 'visits' ? 'Total Visits' : 'New Prefectures'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newPrefectures" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Progress */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cumulative Prefecture Count</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
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
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visit Types Breakdown Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(RATING_LABELS) as unknown as VisitRating[])
              .map((rating) => (
                <div 
                  key={rating} 
                  className="flex justify-between items-center p-3 rounded-lg border"
                  style={{ backgroundColor: RATING_COLORS[rating] + '20' }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: RATING_COLORS[rating] }}
                    />
                    <span className="text-sm font-medium">{RATING_LABELS[rating]}</span>
                  </div>
                  <span className="text-lg font-bold">{stats.ratingBreakdown[rating]}</span>
                </div>
              ))}
            {stats.visitedRegions === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Start exploring to see your statistics!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}