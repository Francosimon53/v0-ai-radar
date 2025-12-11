"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
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
  Loader2,
  FolderOpen,
} from "lucide-react"

interface Report {
  id: string
  date: string
  title: string
  brand: string
  score: number
  scoreChange: number
  shareOfVoice: number
  criticalThreats: number
  generatedAt: string
  pdfUrl: string | null
  recommendations: any[]
  threats: any[]
  status: string
}

export default function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("All Brands")
  const [dateRange, setDateRange] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const reportsPerPage = 5
  const { toast } = useToast()

  // Fetch reports from API
  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports")
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports || [])
          setBrands(data.brands || [])
        }
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchReports()
  }, [toast])

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesBrand = selectedBrand === "All Brands" || report.brand === selectedBrand
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.brand.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getDayOfMonth = (dateStr: string) => {
    return new Date(dateStr).getDate()
  }

  const getMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: "current" }),
      })

      if (response.ok) {
        toast({
          title: "Report Generated",
          description: "Your new report is ready to view",
        })
        // Refresh reports list
        const reportsResponse = await fetch("/api/reports")
        if (reportsResponse.ok) {
          const data = await reportsResponse.json()
          setReports(data.reports || [])
        }
      } else {
        throw new Error("Failed to generate report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== reportId))
        toast({
          title: "Report Deleted",
          description: "The report has been removed",
        })
      } else {
        throw new Error("Failed to delete report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (report: Report) => {
    if (report.pdfUrl) {
      window.open(report.pdfUrl, "_blank")
    } else {
      toast({
        title: "No PDF Available",
        description: "PDF not generated for this report",
        variant: "destructive",
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Empty state
  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">View and download your brand intelligence reports</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Run your first analysis to generate a brand intelligence report with AI-powered insights.
            </p>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate First Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and download your brand intelligence reports</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Generate New Report
            </>
          )}
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
          <SelectTrigger className="w-full sm:w-40 bg-background border-border">
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
          <SelectTrigger className="w-full sm:w-40 bg-background border-border">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Brands">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {paginatedReports.map((report) => (
          <Card key={report.id} className="hover:border-blue-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Date Block */}
                <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-blue-500/10 text-blue-500">
                  <span className="text-2xl font-bold">{getDayOfMonth(report.date)}</span>
                  <span className="text-xs">{getMonth(report.date)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{report.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-500">
                      {report.brand}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.generatedAt}</p>
                </div>

                {/* Metrics */}
                <div className="hidden lg:flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{report.score}</span>
                      {report.scoreChange !== 0 && (
                        <span
                          className={`flex items-center text-xs ${report.scoreChange > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {report.scoreChange > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(report.scoreChange)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{report.shareOfVoice}%</p>
                    <p className="text-xs text-muted-foreground">Share of Voice</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-lg font-bold ${report.criticalThreats > 0 ? "text-red-500" : "text-green-500"}`}
                    >
                      {report.criticalThreats}
                    </p>
                    <p className="text-xs text-muted-foreground">Threats</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(report)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * reportsPerPage + 1} to{" "}
            {Math.min(currentPage * reportsPerPage, filteredReports.length)} of {filteredReports.length} reports
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {selectedReport.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Score Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-3xl font-bold text-blue-500">{selectedReport.score}</p>
                    <p className="text-sm text-muted-foreground">Brand Score</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-3xl font-bold">{selectedReport.shareOfVoice}%</p>
                    <p className="text-sm text-muted-foreground">Share of Voice</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p
                      className={`text-3xl font-bold ${selectedReport.criticalThreats > 0 ? "text-red-500" : "text-green-500"}`}
                    >
                      {selectedReport.criticalThreats}
                    </p>
                    <p className="text-sm text-muted-foreground">Critical Threats</p>
                  </div>
                </div>

                {/* Threats */}
                {selectedReport.threats.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Competitive Threats
                    </h4>
                    <ul className="space-y-2">
                      {selectedReport.threats.slice(0, 3).map((threat: any, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span
                            className={`w-2 h-2 mt-1.5 rounded-full ${
                              threat.severity === "critical" || threat.threat_level === "high"
                                ? "bg-red-500"
                                : threat.severity === "warning" || threat.threat_level === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <span>
                            {threat.competitor || threat.name}: {threat.description || threat.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.slice(0, 3).map((rec: any, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span>{typeof rec === "string" ? rec : rec.action || rec.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleDownload(selectedReport)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
