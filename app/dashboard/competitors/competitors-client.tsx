"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Minus, Plus, Building2, Eye, Users } from "lucide-react"

interface Competitor {
  id: string
  name: string
  score: number
  scoreChange: number
  shareOfVoice: number
  threatLevel: "low" | "medium" | "high"
}

const sampleCompetitors: Competitor[] = [
  {
    id: "1",
    name: "Adidas",
    score: 78,
    scoreChange: 1,
    shareOfVoice: 23,
    threatLevel: "medium",
  },
  {
    id: "2",
    name: "Puma",
    score: 72,
    scoreChange: -2,
    shareOfVoice: 15,
    threatLevel: "low",
  },
  {
    id: "3",
    name: "New Balance",
    score: 69,
    scoreChange: 4,
    shareOfVoice: 10,
    threatLevel: "low",
  },
  {
    id: "4",
    name: "Under Armour",
    score: 65,
    scoreChange: 0,
    shareOfVoice: 8,
    threatLevel: "low",
  },
]

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
  const [competitors, setCompetitors] = useState<Competitor[]>(sampleCompetitors)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCompetitorName, setNewCompetitorName] = useState("")

  const handleAddCompetitor = () => {
    if (!newCompetitorName.trim()) return

    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitorName.trim(),
      score: Math.floor(Math.random() * 30) + 50,
      scoreChange: Math.floor(Math.random() * 10) - 5,
      shareOfVoice: Math.floor(Math.random() * 15) + 5,
      threatLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
    }

    setCompetitors([...competitors, newCompetitor])
    setNewCompetitorName("")
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitors</h1>
          <p className="text-slate-400 mt-1">Track and monitor your competitors&apos; AI visibility</p>
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
              Add competitors to track their AI visibility and compare their performance against your brand.
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
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Score */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-bold ${getScoreColor(competitor.score)}`}>
                        {competitor.score}
                      </span>
                      <span className="text-slate-500 text-sm">/100</span>
                    </div>
                  </div>

                  {/* Trend */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Trend</p>
                    <div className="flex items-center gap-1">
                      {competitor.scoreChange > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-medium">+{competitor.scoreChange}</span>
                        </>
                      ) : competitor.scoreChange < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 font-medium">{competitor.scoreChange}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 font-medium">0</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Share of Voice */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">AI Share</p>
                    <span className="text-xl font-semibold text-white">{competitor.shareOfVoice}%</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
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
                placeholder="Enter competitor brand name"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCompetitor}
              disabled={!newCompetitorName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
