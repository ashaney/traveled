"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, TrendingUp, Star } from "lucide-react"

const stats = {
  totalPrefectures: 47,
  visitedPrefectures: 5,
  lastVisit: "Hokkaido",
  lastVisitDate: "July 10, 2023",
  averageRating: 4.4,
  totalDays: 45,
  visitTypes: {
    "Lived there": 1,
    "Multi-day stay": 2,
    "Day visit": 1,
    "Brief stop": 1,
    "Passed through": 0,
    "Never been": 42,
  },
}

export function TravelStatistics() {
  const progressPercentage = (stats.visitedPrefectures / stats.totalPrefectures) * 100

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Statistics</h3>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Progress</span>
            </div>
            <span className="text-lg font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {stats.visitedPrefectures} of {stats.totalPrefectures} prefectures
          </p>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Last Visit</span>
          </div>
          <div className="text-lg font-bold">{stats.lastVisit}</div>
          <p className="text-xs text-gray-600">{stats.lastVisitDate}</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Avg Rating</span>
          </div>
          <div className="text-lg font-bold">{stats.averageRating}</div>
          <p className="text-xs text-gray-600">out of 5 stars</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Days</span>
          </div>
          <div className="text-lg font-bold">{stats.totalDays}</div>
          <p className="text-xs text-gray-600">days traveled</p>
        </CardContent>
      </Card>

      {/* Visit Types Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Visit Types</h4>
          <div className="space-y-2">
            {Object.entries(stats.visitTypes)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{type}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
