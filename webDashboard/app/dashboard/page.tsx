'use client'

import { useRouter } from 'next/navigation'
import { useGetDashboardStatsQuery, useGetClimateImpactQuery } from '@/store/api/dashboardApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Leaf, TreePine, Droplets, TrendingUp, Plus, CheckCircle, Wallet } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: stats, isLoading } = useGetDashboardStatsQuery()
  const { data: climate } = useGetClimateImpactQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Jobs Posted',
      value: stats?.total_jobs_posted || 0,
      icon: <TreePine className="h-5 w-5" />,
      color: 'text-blue-600',
    },
    {
      title: 'Active Jobs',
      value: stats?.active_jobs || 0,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
    },
    {
      title: 'Pending Verifications',
      value: stats?.pending_verifications || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-orange-600',
    },
    {
      title: 'Total Amount Distributed',
      value: `₹${stats?.total_spent?.toLocaleString() || 0}`,
      icon: <Wallet className="h-5 w-5" />,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to GreenTask Climate Action Dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Climate Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Climate Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Trees Planted</p>
              <p className="text-3xl font-bold text-green-600">
                {climate?.total_trees_planted?.toLocaleString() || 0}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">CO₂ Offset (kg)</p>
              <p className="text-3xl font-bold text-blue-600">
                {climate?.total_co2_offset_kg?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            className="cursor-pointer"
            onClick={() => router.push('/dashboard/jobs?action=create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Job
          </Button>
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={() => router.push('/dashboard/verifications')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            View Pending Verifications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
