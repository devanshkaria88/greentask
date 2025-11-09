'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetSubmissionDetailsQuery, useVerifySubmissionMutation } from '@/store/api/submissionsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function ReviewSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const { data, isLoading } = useGetSubmissionDetailsQuery(params.id as string)
  const [verifySubmission, { isLoading: isVerifying }] = useVerifySubmissionMutation()
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const handleApprove = async () => {
    try {
      await verifySubmission({
        id: params.id as string,
        verification_status: 'approved',
      }).unwrap()
      toast.success('Submission approved successfully!')
      router.push('/dashboard/verifications')
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to approve submission')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await verifySubmission({
        id: params.id as string,
        verification_status: 'rejected',
        rejection_reason: rejectionReason,
      }).unwrap()
      toast.success('Submission rejected')
      router.push('/dashboard/verifications')
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to reject submission')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      </div>
    )
  }

  const submission = data?.submission_details
  const job = data?.job_details
  const worker = data?.worker_details

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Submission</h1>
        <p className="text-muted-foreground">Verify the completed work</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{job?.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge>{job?.category}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="font-medium">₹{job?.reward_amount?.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worker Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{worker?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{worker?.phone_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {submission?.created_at ? formatDate(submission.created_at) : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proof of Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-2">Before Photo</p>
              <img
                src={submission?.before_photo || '/placeholder.jpg'}
                alt="Before"
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Before+Photo'
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">After Photo</p>
              <img
                src={submission?.after_photo || '/placeholder.jpg'}
                alt="After"
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=After+Photo'
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Worker Notes</p>
            <p className="text-sm text-muted-foreground">{submission?.notes || 'No notes provided'}</p>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">
              Location: {submission?.lat}, {submission?.lng}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          variant="destructive"
          onClick={() => setRejectModalOpen(true)}
          disabled={isVerifying}
          className="cursor-pointer"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isVerifying}
          className="cursor-pointer"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isVerifying}
                className="cursor-pointer"
              >
                Submit Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
