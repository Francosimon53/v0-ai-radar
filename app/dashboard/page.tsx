'use client'

import { useState } from 'react'
import { Bell, TrendingDown, TrendingUp, Award, Info, Check, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Sample alert data
const alertsData = [
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
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'score_drop': return <TrendingDown className="h-5 w-5" />
    case 'competitor_rise': return <TrendingUp className="h-5 w-5" />
    case 'milestone': return <Award className="h-5 w-5" />
    default: return <Info className="h-5 w-5" />
  }
}

const getAlertColor = (type: string) => {
  switch (type) {
    case 'score_drop': return 'border-l-red-500'
    case 'competitor_rise': return 'border-l-yellow-500'
    case 'milestone': return 'border-l-green-500'
    default: return 'border-l-blue-500'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'score_drop': return 'text-red-600 bg-red-100'
    case 'competitor_rise': return 'text-yellow-600 bg-yellow-100'
    case 'milestone': return 'text-green-600 bg-green-100'
    default: return 'text-blue-600 bg-blue-100'
  }
}

export default function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [alerts, setAlerts] = useState(alertsData)
  
  const unreadCount = alerts.filter(a => !a.isRead).length
  const totalCount = alerts.length

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.isRead
    return alert.type === filter
  })

  const filterButtons = [
    { id: 'all', label: `All (${totalCount})` },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'score_drop', label: 'Score Drops' },
    { id: 'competitor_rise', label: 'Competitor Moves' },
    { id: 'milestone', label: 'Milestones' },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Stay informed about important changes to your brand perception
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{totalCount} total</Badge>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <Button
            key={btn.id}
            variant={filter === btn.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(btn.id)}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No alerts</h3>
            <p className="text-muted-foreground text-center mt-1">
              We&apos;ll notify you when something important changes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 ${getAlertColor(alert.type)} ${!alert.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
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
                    <p className="text-xs text-muted-foreground mt-2">{alert.createdAt}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
