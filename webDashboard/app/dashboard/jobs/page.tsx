'use client'

import { useState } from 'react'
import { useGetMyJobsQuery } from '@/store/api/jobsApi'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateJobDialog } from '@/components/jobs/CreateJobDialog'
import { JobCard } from '@/components/jobs/JobCard'
import { Plus } from 'lucide-react'

export default function MyJobsPage() {
  const [status, setStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading, error } = useGetMyJobsQuery({ status: status === 'all' ? undefined : status })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground">
            Manage your climate-action jobs
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
          <TabsTrigger value="open" className="cursor-pointer">Open</TabsTrigger>
          <TabsTrigger value="assigned" className="cursor-pointer">Assigned</TabsTrigger>
          <TabsTrigger value="under_review" className="cursor-pointer">Under Review</TabsTrigger>
          <TabsTrigger value="completed" className="cursor-pointer">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-12">
              <p>Failed to load jobs. Please try again.</p>
            </div>
          ) : data?.jobs?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No jobs found</p>
              <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.jobs?.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateJobDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
