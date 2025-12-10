'use client'

import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bell, 
  BarChart3,
  Play,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Sample data
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
  { id: 1, type: 'score_drop', title: 'Innovation score dropped 6 points', time: '2 hours ago' },
  { id: 2, type: 'competitor_rise', title: 'Adidas gained 5 points in sustainability', time: '1 day ago' },
  { id: 3, type: 'milestone', title: 'You reached #1 in customer trust!', time: '3 days ago' },
]

const metrics = [
  { title: 'Questions Tracked', value: '5', subtitle: 'across 7 AI models', icon: BarChart3 },
  { title: 'Competitors', value: '4', subtitle: 'being monitored', icon: Users },
  { title: 'Analyses Run', value: '12', subtitle: 'this month', icon: LayoutDashboard },
  { title: 'Alerts', value: '3', subtitle: 'need attention', icon: Bell, highlight: true },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Brand Health Hero Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm">Brand Health Score</p>
              <h1 className="text-3xl font-bold mt-1">{brandData.name}</h1>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className={brandData.trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {brandData.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {brandData.trend > 0 ? '+' : ''}{brandData.trend} pts vs last week
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
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
              <p className="text-xl font-semibold">{brandData.sh
