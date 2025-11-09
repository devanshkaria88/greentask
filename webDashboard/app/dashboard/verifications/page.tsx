'use client'

import { useGetPendingSubmissionsQuery } from '@/store/api/submissionsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'

export default function VerificationsPage() {
  const router = useRouter()
  const { data: submissions, isLoading, error } = useGetPendingSubmissionsQuery()

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-12">
        <p>Failed to load submissions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Verifications</h1>
        <p className="text-muted-foreground">
          Review and verify completed work submissions
        </p>
      </div>

      {submissions?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending verifications</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions?.map((submission: any) => (
            <Card key={submission.submission_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{submission.job_title}</CardTitle>
                <Badge variant="outline">{submission.worker_name}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Submitted: {formatDate(submission.submitted_at)}
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/verifications/${submission.submission_id}`)}
                  className="w-full cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Review Submission
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
