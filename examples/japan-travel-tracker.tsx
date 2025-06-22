"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HexagonMap } from "./components/hexagon-map"
import { TravelStatistics } from "./components/travel-statistics"
import { VisitRecordsTable } from "./components/visit-records-table"

export default function JapanTravelTracker() {
  const [selectedCountry, setSelectedCountry] = useState("japan")

  const countries = {
    japan: { name: "Japan", flag: "🇯🇵" },
    usa: { name: "United States", flag: "🇺🇸" },
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Traveled</h1>
            </div>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="japan">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇯🇵</span>
                    Japan
                  </div>
                </SelectItem>
                <SelectItem value="usa">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇺🇸</span>
                    United States
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Japan Explorer Map */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {countries[selectedCountry as keyof typeof countries].name} Explorer
                </h2>
                <p className="text-sm text-gray-600">Click any region to track visits</p>
              </div>
              <HexagonMap />
            </section>

            {/* Visit Records Table */}
            <section>
              <VisitRecordsTable />
            </section>
          </div>

          {/* Sidebar with Statistics */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <TravelStatistics />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
