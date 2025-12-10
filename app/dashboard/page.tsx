'use client'

import { TrendingUp, Users, Bell, BarChart3, Play } from 'lucide-react'
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
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 text-white">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold">{brandData.name}</h1>
          <div className="text-6xl font-bold mt-4">{brandData.score}/100</div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-slate-400">AI Share of Voice</p>
              <p className="text-xl font-bold">{brandData.shareOfVoice}%</p>
            </div>
            <div>
              <p className="text-slate-400">Competitor Gap</p>
              <p className="text-xl font-bold">+{brandData.competitorGap} pts</p>
            </div>
            <div>
              <p className="text-slate-400">Next Analysis</p>
              <p className="text-xl font-bold">{brandData.nextAnalysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5" />
            <p className="text-2xl font-bold mt-2">5</p>
            <p className="text-sm text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-5 w-5" />
            <p className="text-2xl font-bold mt-2">4</p>
            <p className="text-sm text-muted-foreground">Competitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5" />
            <p className="text-2xl font-bold mt-2">12</p>
            <p className="text-sm text-muted-foreground">Analyses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Bell className="h-5 w-5" />
            <p className="text-2xl font-bold mt-2">3</p>
            <p className="text-sm text-muted-foreground">Alerts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {competitors.map((c) => (
            <div key={c.name} className="flex justify-between p-2">
              <span>
                {c.rank}. {c.name}
              </span>
              <span>{c.score}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg">
        <Play className="h-4 w-4 mr-2" />
        Run Analysis Now
      </Button>
    </div>
  )
}
