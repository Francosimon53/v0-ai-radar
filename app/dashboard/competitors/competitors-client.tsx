"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Minus, Plus, Building2, Users, Trash2, Loader2, Radar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Competitor {
  id: string
  name: string
  score: number
  scoreChange: number
  shareOfVoice: number
  threatLevel: "low" | "medium" | "high"
}

function getThreatBadgeProps(level: string) {
  switch (level) {
    case "high":
      return { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "High Threat" }
    case "medium":
      return { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Medium Threat" }
    case "low":
      return { className: "bg-green-500/10 text-green-400 border-green-500/20", label: "Low Threat" }
    default:
      return { className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", label: "Unknown" }
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-amber-400"
  return "text-red-400"
}

export default function CompetitorsClient() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [brand, setBrand] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCompetitorName, setNewCompetitorName] = useState("")
  const [addingCompetitor, setAddingCompetitor] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCompetitors() {
      try {
        const response = await fetch("/api/competitors")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setCompetitors(data.competitors || [])
        setBrand(data.brand)
      } catch (error) {
        console.error("Error fetching competitors:", error)
        toast({
          title: "Error",
          description: "Failed to load competitors",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCompetitors()
  }, [toast])

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) return

    setAddingCompetitor(true)
    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitor: newCompetitorName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add competitor")
      }

      const newCompetitor: Competitor = {
        id: `competitor-${Date.now()}`,
        name: newCompetitorName.trim(),
        score: Math.floor(Math.random() * 30) + 50,
        scoreChange: 0,
        shareOfVoice: Math.floor(Math.random() * 10) + 5,
        threatLevel: "low",
      }

      setCompetitors([...competitors, newCompetitor])
      setNewCompetitorName("")
      setShowAddDialog(false)

      toast({
        title: "Competitor added",
        description: `${newCompetitorName.trim()} has been added to your tracking list.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor",
        variant: "destructive",
      })
    } finally {
      setAddingCompetitor(false)
    }
  }

  const handleDeleteCompetitor = async (competitor: Competitor) => {
    setDeletingId(competitor.id)
    try {
      const response = await fetch(`/api/competitors?name=${encodeURIComponent(competitor.name)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete competitor")
      }

      setCompetitors(competitors.filter((c) => c.id !== competitor.id))

      toast({
        title: "Competitor removed",
        description: `${competitor.name} has been removed from your tracking list.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove competitor",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radar className="h-6 w-6 text-blue-500" />
              AI Competitors Radar
            </h1>
            <p className="text-zinc-400 mt-1">
              Track how AI assistants score and mention your closest rivals vs your brand.
            </p>
          </div>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No brand configured</h3>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              Set up your brand first to start tracking competitors.
            </p>
            <Link href="/dashboard/setup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Configure Your Brand</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radar className="h-6 w-6 text-blue-500" />
            AI Competitors Radar
          </h1>
          <p className="text-zinc-400 mt-1">
            Track how AI assistants score and mention your closest rivals vs your brand.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 px-3 py-1">
            {competitors.length} tracked
          </Badge>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Competitors Grid or Empty State */}
      {competitors.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No competitors yet</h3>
            <p className="text-zinc-400 text-center max-w-md mb-6">
              Add 3-5 key rivals to see how AI compares them vs your brand.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add first competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((competitor) => {
            const threatBadge = getThreatBadgeProps(competitor.threatLevel)
            return (
              <Card key={competitor.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{competitor.name}</h3>
                        <Badge className={threatBadge.className}>{threatBadge.label}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCompetitor(competitor)}
                      disabled={deletingId === competitor.id}
                      className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      {deletingId === competitor.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-1">AI Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-semibold ${getScoreColor(competitor.score)}`}>
                        {competitor.score}
                      </span>
                      <span className="text-zinc-500 text-sm">/ 100</span>
                      {competitor.scoreChange !== 0 && (
                        <span
                          className={`flex items-center text-sm ml-2 ${
                            competitor.scoreChange > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {competitor.scoreChange > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(competitor.scoreChange)}
                        </span>
                      )}
                      {competitor.scoreChange === 0 && (
                        <span className="flex items-center text-sm text-zinc-500 ml-2">
                          <Minus className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Share of Voice</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-white">{competitor.shareOfVoice}%</span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">How often this brand appears vs yours in AI responses.</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Competitor Dialog - unchanged behavior */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Add Competitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="competitor-name" className="text-zinc-300">
                Competitor Name
              </Label>
              <Input
                id="competitor-name"
                placeholder="e.g., Adidas, Puma, Nike..."
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAddDialog(false)}
              className="text-zinc-400 hover:text-white"
              disabled={addingCompetitor}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCompetitor}
              disabled={!newCompetitorName.trim() || addingCompetitor}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addingCompetitor ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Competitor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
