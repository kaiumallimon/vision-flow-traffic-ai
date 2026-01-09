'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, ImageIcon, TrendingUp, Camera, History, ArrowRight } from 'lucide-react'
import { DashboardSkeleton } from './dashboard-skeleton'
import { useAuth } from '@/lib/auth-context'
import { useStats, useHistory } from '@/lib/hooks'

export function DashboardContent() {
  const { user } = useAuth()
  const { stats, loading: statsLoading, getStats } = useStats()
  const { items: recentAnalyses, loading: historyLoading, getHistory } = useHistory()

  useEffect(() => {
    if (user?.email) {
      getStats(user.email)
      getHistory(user.email)
    }
  }, [user])

  if (statsLoading || historyLoading) {
    return <DashboardSkeleton />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your traffic detection activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Analyses</p>
                <div className="text-3xl font-bold tracking-tight">{stats?.totalDetections || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  All time analyses
                </p>
              </div>
              <div className="ml-4 p-3 bg-primary/10 rounded-xl">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Detections</p>
                <div className="text-3xl font-bold tracking-tight">{stats?.totalDetections || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Objects detected
                </p>
              </div>
              <div className="ml-4 p-3 bg-blue-500/10 rounded-xl">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Most Detected</p>
                <div className="text-3xl font-bold tracking-tight capitalize">
                  {stats?.mostCommonObjects && Object.keys(stats.mostCommonObjects).length > 0
                    ? Object.keys(stats.mostCommonObjects)[0]
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Top detected class
                </p>
              </div>
              <div className="ml-4 p-3 bg-green-500/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Avg Objects/Image</p>
                <div className="text-3xl font-bold tracking-tight">
                  {stats?.totalDetections > 0 ? '1.0' : '0.0'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average per analysis
                </p>
              </div>
              <div className="ml-4 p-3 bg-purple-500/10 rounded-xl">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Analyses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/history">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!recentAnalyses || recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-4">No analyses yet</p>
              <Button asChild>
                <Link href="/dashboard/analyze">Start Analyzing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.slice(0, 5).map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium">
                        {analysis.object_name}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(analysis.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {analysis.object_name}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/analyze">
                <Camera className="mr-2 h-4 w-4" />
                Analyze Image
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/history">
                <History className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/profile">
                <Activity className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
