"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Download,
  Search,
  MoreVertical,
  Share2,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Play,
} from "lucide-react"

// Sample reports data
const sampleReports = [
  {
    id: "1",
    date: new Date("2024-12-10"),
    title: "Weekly Brand Intelligence Report",
    brand: "Nike",
    score: 84,
    scoreChange: 3,
    shareOfVoice: 47,
    criticalThreats: 2,
    generatedAt: "Dec 10, 2024 at 9:00 AM",
    status: "ready",
  },
  {
    id: "2",
    date: new Date("2024-12-03"),
    title: "Weekly Brand Intelligence Report",
    brand: "Nike",
    score: 81,
    scoreChange: 1,
    shareOfVoice: 45,
    criticalThreats: 1,
    generatedAt: "Dec 3, 2024 at 9:00 AM",
    status: "ready",
  },
  {
    id: "3",
    date: new Date("2024-11-26"),
    title: "Weekly Brand Intelligence Report",
    brand: "Nike",
    score: 80,
    scoreChange: -2,
    shareOfVoice: 44,
    criticalThreats: 3,
    generatedAt: "Nov 26, 2024 at 9:00 AM",
    status: "ready",
  },
  {
    id: "4",
    date: new Date("2024-11-19"),
    title: "Weekly Brand Intelligence Report",
    brand: "Nike",
    score: 82,
    scoreChange: 2,
    shareOfVoice: 43,
    criticalThreats: 0,
    generatedAt: "Nov 19, 2024 at 9:00 AM",
    status: "ready",
  },
]

const brands = ["All Brands", "Nike", "Adidas", "Under Armour", "Puma"]

export default function ReportsClient() {
  const [reports] = useState(sampleReports)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("All Brands")
  const [dateRange, setDateRange] = useState("all")
  const [selectedReport, setSelectedReport] = useState<(typeof sampleReports)[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 5

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesBrand = selectedBrand === "All Brands" || report.brand === selectedBrand
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesDate = true

    if (dateRange !== "all") {
      const now = new Date()
      const reportDate = new Date(report.date)
      if (dateRange === "7days") {
        matchesDate = now.getTime() - reportDate.getTime() <= 7 * 24 * 60 * 60 * 1000
      } else if (dateRange === "30days") {
        matchesDate = now.getTime() - reportDate.getTime() <= 30 * 24 * 60 * 60 * 1000
      } else if (dateRange === "90days") {
        matchesDate = now.getTime() - reportDate.getTime() <= 90 * 24 * 60 * 60 * 1000
      }
    }

    return matchesBrand && matchesSearch && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage)
  const paginatedReports = filteredReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getDayOfMonth = (date: Date) => {
    return date.getDate()
  }

  const getMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and download your brand intelligence reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Play className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {paginatedReports.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate your first report to see brand insights here
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedReports.map((report) => (
            <Card
              key={report.id}
              className="border-border bg-card hover:border-blue-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Date Display */}
                  <div className="hidden sm:flex flex-col items-center justify-center bg-slate-800 rounded-lg p-3 min-w-[70px]">
                    <span className="text-2xl font-bold text-foreground">{getDayOfMonth(report.date)}</span>
                    <span className="text-xs text-muted-foreground">{getMonth(report.date)}</span>
                  </div>

                  {/* Report Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {report.brand}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Generated {report.generatedAt}</p>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold text-foreground">{report.score}</span>
                          <span
                            className={`flex items-center text-sm ${report.scoreChange >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {report.scoreChange >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-0.5" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                            )}
                            {Math.abs(report.scoreChange)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">Score</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{report.shareOfVoice}%</span>
                        <span className="text-sm text-muted-foreground">Share of Voice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.criticalThreats === 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {report.criticalThreats === 0
                            ? "No critical threats"
                            : `${report.criticalThreats} critical threat${report.criticalThreats > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredReports.length > reportsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * reportsPerPage + 1} to{" "}
            {Math.min(currentPage * reportsPerPage, filteredReports.length)} of {filteredReports.length} reports
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-transparent"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-transparent"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {selectedReport.brand}
                </span>
                <span className="text-sm text-muted-foreground">{formatDate(selectedReport.date)}</span>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Executive Summary</h4>
                <p className="text-muted-foreground">
                  {selectedReport.brand}&apos;s brand perception across AI models shows a score of{" "}
                  {selectedReport.score}/100, representing a {Math.abs(selectedReport.scoreChange)} point{" "}
                  {selectedReport.scoreChange >= 0 ? "increase" : "decrease"} from the previous period. Share of voice
                  stands at {selectedReport.shareOfVoice}%, maintaining competitive positioning.
                </p>
              </div>

              {/* Key Strengths */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Key Strengths</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Strong brand recognition in athletic footwear category
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Consistent positive sentiment around innovation and quality
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    High recommendation rate from all 7 AI models
                  </li>
                </ul>
              </div>

              {/* Potential Threats */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Potential Threats</h4>
                <ul className="space-y-2">
                  {selectedReport.criticalThreats > 0 ? (
                    <>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        Competitor gaining ground in sustainability messaging
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        Price perception shifting in some AI model responses
                      </li>
                    </>
                  ) : (
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      No critical threats identified this period
                    </li>
                  )}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Recommendations</h4>
                <ol className="space-y-2 list-decimal list-inside">
                  <li className="text-muted-foreground">Increase sustainability messaging across digital channels</li>
                  <li className="text-muted-foreground">Monitor competitor promotional activities closely</li>
                  <li className="text-muted-foreground">Reinforce value proposition in product descriptions</li>
                </ol>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="border-border bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
