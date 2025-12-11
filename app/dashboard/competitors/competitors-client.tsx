"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Minus, Plus, Building2, Users, Trash2, Loader2 } from "lucide-react"
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

function getThreatColor(level: string) {
  switch (level) {
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
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

      // Add new competitor to local state
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
        <div>
          <h1 className="text-2xl font-bold text-white">Competitors</h1>
          <p className="text-slate-400 mt-1">Track and monitor your competitors&apos; AI visibility</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No brand configured</h3>
            <p className="text-slate-400 text-center max-w-md mb-6">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitors</h1>
          <p className="text-slate-400 mt-1">Track and monitor your competitors&apos; AI visibility vs {brand}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Competitors Grid */}
      {competitors.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No competitors added yet</h3>
            <p className="text-slate-400 text-center max-w-md mb-6">
              Add competitors to track their AI visibility and compare their performance against {brand}.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((competitor) => (
            <Card
              key={competitor.id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{competitor.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getThreatColor(
                          competitor.threatLevel,
                        )}`}
                      >
                        {competitor.threatLevel.charAt(0).toUpperCase() + competitor.threatLevel.slice(1)} Threat
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCompetitor(competitor)}
                    disabled={deletingId === competitor.id}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    {deletingId === competitor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">AI Score</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(competitor.score)}`}>
                        {competitor.score}
                      </span>
                      <span className="text-slate-500">/100</span>
                      {competitor.scoreChange !== 0 && (
                        <span
                          className={`flex items-center text-sm ${
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
                        <span className="flex items-center text-sm text-slate-400">
                          <Minus className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Share of Voice</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{competitor.shareOfVoice}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Competitor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Competitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="competitor-name" className="text-slate-300">
                Competitor Name
              </Label>
              <Input
                id="competitor-name"
                placeholder="e.g., Adidas, Puma, Nike..."
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAddDialog(false)}
              className="text-slate-400 hover:text-white"
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
