'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useGetJobDetailsQuery, useGetJobApplicationsQuery, useAcceptApplicationMutation, useRejectApplicationMutation } from '@/store/api/jobsApi'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  User,
  Phone,
  Mail,
  MapPinned,
} from 'lucide-react'
import { format } from 'date-fns'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const { data: jobResponse, isLoading, error, refetch: refetchJob } = useGetJobDetailsQuery(jobId, {
    skip: !jobId,
  })
  const { data: applicationsResponse, refetch: refetchApplications } = useGetJobApplicationsQuery(jobId, {
    skip: !jobId,
  })

  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [processingAppId, setProcessingAppId] = useState<string | null>(null)

  // Handle different response structures
  const job = jobResponse?.data || jobResponse
  const applications = applicationsResponse?.data?.applications || applicationsResponse || []

  // Debug logging
  useEffect(() => {
    if (jobResponse) {
      console.log('Job Response:', jobResponse)
    }
    if (error) {
      console.error('Job Error:', error)
    }
  }, [jobResponse, error])

  // Debug applications data structure
  useEffect(() => {
    if (applications && applications.length > 0) {
      console.log('Applications data:', applications)
      console.log('First application:', applications[0])
      console.log('Application keys:', Object.keys(applications[0]))
    }
  }, [applications])

  // Auto-refresh applications every minute
  useEffect(() => {
    if (!jobId) return
    
    const interval = setInterval(() => {
      refetchApplications()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [refetchApplications, jobId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = (error as any)?.data?.error || (error as any)?.message || 'Unknown error'
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive text-lg font-semibold">Failed to load job details</p>
        <p className="text-muted-foreground text-sm">{errorMessage}</p>
        <div className="flex gap-2">
          <Button onClick={() => refetchJob()} variant="outline" className="cursor-pointer">
            Try Again
          </Button>
          <Button onClick={() => router.push('/dashboard/jobs')} className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Job not found</p>
        <Button onClick={() => router.push('/dashboard/jobs')} className="cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const safeFormatDate = (dateString: string | null | undefined, formatStr: string = 'PPP') => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return format(date, formatStr)
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      console.log('Accepting application with ID:', applicationId)
      setProcessingAppId(applicationId)
      await acceptApplication(applicationId).unwrap()
      toast.success('Application accepted successfully!')
      refetchApplications()
      refetchJob()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to accept application')
      console.error('Accept error:', error)
    } finally {
      setProcessingAppId(null)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setProcessingAppId(applicationId)
      await rejectApplication(applicationId).unwrap()
      toast.success('Application rejected')
      refetchApplications()
      refetchJob()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to reject application')
      console.error('Reject error:', error)
    } finally {
      setProcessingAppId(null)
    }
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/jobs">Jobs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge className={getStatusColor(job.status)}>
              {job.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created on {safeFormatDate(job.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Proof Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proof Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.proof_requirements}</p>
            </CardContent>
          </Card>

          {/* Creator Information */}
          {job.creator && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Created By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{job.creator.name}</p>
                    <p className="text-sm text-muted-foreground">{job.creator.email}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{job.creator.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinned className="h-4 w-4 text-muted-foreground" />
                    <span>{job.creator.location}, {job.creator.region_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Applications ({applications.length})
                  </CardTitle>
                  <CardDescription>
                    Auto-refreshes every minute
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchApplications()}
                  className="cursor-pointer"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No applications yet</p>
                  <p className="text-sm text-muted-foreground">
                    Applications will appear here when community members apply
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application: any) => (
                    <Card key={application.application_id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{application.worker?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">
                                {application.worker?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                            {application.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{application.worker?.phone_number || 'N/A'}</span>
                          </div>
                          {application.worker?.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{application.worker.location}, {application.worker.region_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Applied on {safeFormatDate(application.applied_at, 'PPP p')}</span>
                          </div>
                        </div>

                        {application.status === 'pending' && (
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button 
                              size="sm" 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleAcceptApplication(application.application_id)}
                              disabled={processingAppId === application.application_id}
                            >
                              {processingAppId === application.application_id && isAccepting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Accepting...
                                </>
                              ) : (
                                'Accept'
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleRejectApplication(application.application_id)}
                              disabled={processingAppId === application.application_id}
                            >
                              {processingAppId === application.application_id && isRejecting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                'Reject'
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reward Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{job.reward_amount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {safeFormatDate(job.deadline, 'PPP p')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.lat.toFixed(6)}, {job.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Category</p>
                <Badge variant="outline">{getCategoryLabel(job.category)}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full cursor-pointer" variant="outline">
                View on Map
              </Button>
              <Button className="w-full cursor-pointer" variant="outline">
                Share Job
              </Button>
              <Button className="w-full cursor-pointer" variant="outline">
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
