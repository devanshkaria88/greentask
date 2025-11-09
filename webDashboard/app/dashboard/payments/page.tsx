'use client'

import { useGetPendingApprovalsQuery, useApprovePaymentMutation } from '@/store/api/paymentsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = useGetPendingApprovalsQuery()
  const [approvePayment, { isLoading: isApproving }] = useApprovePaymentMutation()

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

  const handleApprove = async (paymentId: string) => {
    try {
      await approvePayment(paymentId).unwrap()
      toast.success('Payment approved successfully!')
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to approve payment')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-12">
        <p>Failed to load payments. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Manage and approve worker payments
        </p>
      </div>

      {payments?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending payments</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments?.map((payment: any) => (
            <Card key={payment.payment_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{payment.job_title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Worker: {payment.worker_name} ({payment.worker_phone})
                    </p>
                  </div>
                  <Badge variant="outline">Pending Approval</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ₹{payment.amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {formatDate(payment.submitted_at)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApprove(payment.payment_id)}
                    disabled={isApproving}
                    className="cursor-pointer"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
