'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, TrendingDown, TrendingUp, Award, Info, Check, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sample alert data
const alerts = [
  {
    id: '1',
    type: 'score_drop',
    severity: 'high',
    title: 'Innovation score dropped 6 points',
    message: 'Your innovation perception fell from 88 to 82. This correlates with competitor Adidas launching their new campaign.',
    createdAt: '2 hours ago',
    isRead: false,
    data: { before: 88, after: 82, change: -6 }
  },
  {
    id: '2',
    type: 'competitor_rise',
    severity: 'medium',
    title: 'Adidas gained 5 points in sustainability',
    message: 'Adidas sustainability score rose from 73 to 78, closing the gap with your brand.',
    createdAt: '1 day ago',
    isRead: false,
    data: { competitor: 'Adidas', before: 73, after: 78, change: 5 }
  },
  {
    id: '3',
    type: 'milestone',
    severity: 'low',
    title: 'You reached #1 in customer trust!',
    message: 'Congratulations! Your brand is now ranked #1 for customer trust perception among your competitors.',
    createdAt: '3 days ago',
    isRead: true,
    data: { rank: 1, dimension: 'trust' }
  },
  {
    id: '4',
    type: 'system',
    severity: 'low',
    title: 'Weekly analysis complete',
    message: 'Your weekly brand intelligence report is ready to view.',
    createdAt: '5 days ago',
    isRead: true,
    data: {}
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'score_drop': return <TrendingDown className="h-5 w-5" />
    case 'competitor_rise': return <TrendingUp className="h-5 w-5" />
    case 'milestone': return <Award className="h-5 w-5" />
    case 'rank_change': return <Award className="h-5 w-5" />
    default: return <Info className="h-5 w-5" />
  }
}

const getAlertColor = (type: string) => {
  switch (type) {
    case 'score_drop': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
    case 'competitor_rise': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
    case 'milestone': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
    case 'rank_change': return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20'
    default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'score_drop': return 'text-red-600 bg-red-100'
    case 'competitor_rise': return 'text-yellow-600 bg-yellow-100'
    case 'milestone': return 'text-green-600 bg-green-100'
    case 'rank_change': return 'text-purple-600 bg-purple-100'
    default: return 'text-blue-600 bg-blue-100'
  }
}

function AlertsContent() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  
  const unreadCount = alerts.filter(a => !a.isRead).length
  const totalCount = alerts.length

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.isRead
    return alert.type === filter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Stay informed about important changes to your brand perception
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{totalCount} total</Badge>
            <Badge variant="destructive">{unreadCount} unread</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="score_drop">Score Drops</TabsTrigger>
          <TabsTrigger value="competitor_rise">Competitor Moves</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AlertsList alerts={filteredAlerts} />
        </TabsContent>
        <TabsContent value="unread" className="mt-6">
          <AlertsList alerts={alerts.filter(a => !a.isRead)} />
        </TabsContent>
        <TabsContent value="score_drop" className="mt-6">
          <AlertsList alerts={alerts.filter(a => a.type === 'score_drop')} />
        </TabsContent>
        <TabsContent value="competitor_rise" className="mt-6">
          <AlertsList alerts={alerts.filter(a => a.type === 'competitor_rise')} />
        </TabsContent>
        <TabsContent value="milestone" className="mt-6">
          <AlertsList alerts={alerts.filter(a => a.type === 'milestone')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlertsList({ alerts }: { alerts: typeof alerts }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No alerts</h3>
          <p className="text-muted-foreground text-center mt-1">
            We&apos;ll notify you when something important changes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card 
          key={alert.id} 
          className={`border-l-4 ${getAlertColor(alert.type)} ${!alert.isRead ? 'ring-1 ring-blue-200' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${getIconColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                    {alert.title}
                  </h3>
                  {!alert.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.message}
                </p>
                {alert.data && alert.type === 'score_drop' && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">{alert.data.before}</span>
                    <span className="mx-2">→</span>
                    <span className="text-red-600 font-medium">{alert.data.after}</span>
                    <span className="text-red-600 ml-1">({alert.data.change} pts)</span>
                  </div>
                )}
                {alert.data && alert.type === 'competitor_rise' && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">{alert.data.competitor}:</span>
                    <span className="text-muted-foreground ml-1">{alert.data.before}</span>
                    <span className="mx-2">→</span>
                    <span className="text-yellow-600 font-medium">{alert.data.after}</span>
                    <span className="text-yellow-600 ml-1">(+{alert.data.change} pts)</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{alert.createdAt}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">View Details</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AlertsContent />
    </Suspense>
  )
}
