'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JobCardProps {
  job: any
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter()

  const statusColors: Record<string, string> = {
    open: 'bg-blue-500',
    assigned: 'bg-yellow-500',
    under_review: 'bg-orange-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  const categoryLabels: Record<string, string> = {
    tree_planting: 'Tree Planting',
    water_harvesting: 'Water Harvesting',
    solar_maintenance: 'Solar Maintenance',
    waste_management: 'Waste Management',
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'No deadline'
    }
  }

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <Badge className={statusColors[job.status] || 'bg-gray-500'}>
            {job.status}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit">
          {categoryLabels[job.category] || job.category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {job.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 mr-2" />
          ₹{job.reward_amount?.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {job.deadline ? formatDate(job.deadline) : 'No deadline'}
        </div>
      </CardContent>
    </Card>
  )
}
