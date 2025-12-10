'use client'

import { 
  TrendingUp, 
  Users, 
  Bell, 
  BarChart3,
  Play
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const brandData = {
  name: 'Nike',
  score: 84,
  trend: 3,
  rank: 1,
  totalCompetitors: 5,
  shareOfVoice: 47,
  competitorGap: 6,
  nextAnalysis: '5 days',
}

const competitors = [
  { rank: 1, name: 'Nike', score: 84, change: 3, isUser: true },
  { rank: 2, name: 'Adidas', score: 78, change: 1, isUser: false },
  { rank: 3, name: 'Puma', score: 72, change: -2, isUser: false },
  { rank: 4, name: 'New Balance', score: 69, change: 4, isUser: false },
  { rank: 5, name: 'Under Armour', score: 65, change: 0, isUser: false },
]

const recentAlerts = [
  { id: 1, type: 'score_drop', title: 'Innovation score dropped', time: '2 hours ago' },
  { id: 2, type: 'competitor_rise', title: 'Adidas gained 5 points', time: '1 day ago' },
  { id: 3, type: 'milestone', title: 'You reached #1 in trust!', time: '3 days ago' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm">Brand Health Score</p>
              <h1 className="text-3xl font-bold mt-1">{brandData.name}</h1>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-green-500/20 text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{brandData.trend} pts
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  #{brandData.rank} of {brandData.totalCompetitors}
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">{brandData.score}</div>
              <div className="text-slate-400">/100</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div>
              <p className="text-slate-400 text-sm">AI Share of Voice</p>
              <p className="text-xl font-semibold">{brandData.shareOfVoice}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Competitor Gap</p>
              <p className="text-xl font-semibold">+{brandData.competitorGap} pts</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Next Analysis</p>
              <p className="text-xl font-semibold">{brandData.nextAnalysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <p c
