"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Plus, Search, Filter, Edit, Trash2, Star, MapPin, Clock } from "lucide-react"
import { format } from "date-fns"

const visitTypes = {
  1: { label: "Passed through", color: "bg-red-100 text-red-700 border-red-200" },
  2: { label: "Brief stop", color: "bg-orange-100 text-orange-700 border-orange-200" },
  3: { label: "Day visit", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  4: { label: "Multi-day stay", color: "bg-green-100 text-green-700 border-green-200" },
  5: { label: "Lived there", color: "bg-blue-100 text-blue-700 border-blue-200" },
}

const sampleData = [
  {
    id: 1,
    prefecture: "Tokyo",
    visitType: 5,
    rating: 5,
    visitDate: "2023-01-15",
    duration: "365 days",
    notes: "Amazing city with incredible food and culture. Lived in Shibuya district.",
    highlights: ["Tsukiji Market", "Senso-ji Temple", "Shibuya Crossing"],
    wouldRecommend: true,
  },
  {
    id: 2,
    prefecture: "Osaka",
    visitType: 4,
    rating: 5,
    visitDate: "2023-03-20",
    duration: "5 days",
    notes: "Best takoyaki and friendly people. Stayed in Dotonbori area.",
    highlights: ["Dotonbori", "Osaka Castle", "Universal Studios"],
    wouldRecommend: true,
  },
  {
    id: 3,
    prefecture: "Kyoto",
    visitType: 4,
    rating: 5,
    visitDate: "2023-03-18",
    duration: "3 days",
    notes: "Beautiful temples and traditional architecture. Perfect for cultural immersion.",
    highlights: ["Fushimi Inari", "Kinkaku-ji", "Arashiyama Bamboo Grove"],
    wouldRecommend: true,
  },
  {
    id: 4,
    prefecture: "Hokkaido",
    visitType: 3,
    rating: 4,
    visitDate: "2023-07-10",
    duration: "1 day",
    notes: "Great seafood and beautiful nature. Want to spend more time here.",
    highlights: ["Sapporo Beer Garden", "Susukino District"],
    wouldRecommend: true,
  },
  {
    id: 5,
    prefecture: "Okinawa",
    visitType: 2,
    rating: 3,
    visitDate: "2023-05-05",
    duration: "4 hours",
    notes: "Brief layover at Naha Airport. Glimpsed beautiful beaches from plane.",
    highlights: ["Naha Airport"],
    wouldRecommend: false,
  },
]

export function VisitRecordsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const filteredData = sampleData.filter((record) => {
    const matchesSearch =
      record.prefecture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || record.visitType.toString() === filterType
    return matchesSearch && matchesFilter
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            Visit Records
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4" />
              Add Visit
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search prefectures or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(visitTypes).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold w-32">Prefecture</TableHead>
                <TableHead className="font-semibold w-40">Visit Type</TableHead>
                <TableHead className="font-semibold w-32">Rating</TableHead>
                <TableHead className="font-semibold w-32">Date</TableHead>
                <TableHead className="font-semibold w-28">Duration</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{record.prefecture}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${visitTypes[record.visitType as keyof typeof visitTypes].color} text-xs px-2 py-1`}
                    >
                      {visitTypes[record.visitType as keyof typeof visitTypes].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(record.rating)}
                      <span className="ml-1 text-xs text-gray-600">({record.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(record.visitDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs">{record.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-gray-600" title={record.notes}>
                      {record.notes}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 h-8 w-8 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">No records found matching your criteria.</div>
        )}
      </CardContent>

      {/* Record Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {selectedRecord?.prefecture}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <Select defaultValue={selectedRecord.visitType.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(visitTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select defaultValue={selectedRecord.rating.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Date</Label>
                  <Input type="date" defaultValue={selectedRecord.visitDate} />
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input defaultValue={selectedRecord.duration} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Highlights</Label>
                <Input
                  defaultValue={selectedRecord.highlights.join(", ")}
                  placeholder="Separate highlights with commas"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  defaultValue={selectedRecord.notes}
                  rows={4}
                  placeholder="Share your experiences, memories, and recommendations..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recommend"
                  defaultChecked={selectedRecord.wouldRecommend}
                  className="rounded"
                />
                <Label htmlFor="recommend">Would recommend to others</Label>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
