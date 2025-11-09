/**
 * Payments & Wallet API
 * 
 * Endpoints:
 * - GET /payments/wallet - Get worker's wallet info
 * - GET /payments/pending-approvals - Get pending payment approvals (Government Official)
 * - PATCH /payments/:id/approve - Approve payment
 */

import { 
  requireAuth,
  requireGramPanchayat,
  handleCors, 
  errorResponse, 
  successResponse,
  corsHeaders,
} from '../_shared/middleware.ts';
import { isValidUUID } from '../_shared/validation.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    const lastPart = pathParts[pathParts.length - 1];

    // GET /payments/wallet
    if (method === 'GET' && lastPart === 'wallet') {
      return await getWallet(req);
    }

    // GET /payments/pending-approvals
    if (method === 'GET' && lastPart === 'pending-approvals') {
      return await getPendingApprovals(req);
    }

    // PATCH /payments/:id/approve
    if (method === 'PATCH' && pathParts.length >= 3 && lastPart === 'approve') {
      const paymentId = pathParts[pathParts.length - 2];
      return await approvePayment(req, paymentId);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Get worker's wallet information
 */
async function getWallet(req: Request): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get all payments for this worker
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        job_id,
        worker_id,
        amount,
        status,
        created_at,
        approved_at,
        paid_at,
        job:jobs!payments_job_id_fkey (
          id,
          title
        )
      `)
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get wallet error:', error);
      return errorResponse(error.message);
    }

    // Calculate totals
    const allPayments = payments || [];
    const total_earned = allPayments
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    
    const pending_amount = allPayments
      .filter((p: any) => p.status === 'pending' || p.status === 'approved')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    
    const paid_amount = total_earned;

    // Format transactions
    const transactions = allPayments.map((p: any) => ({
      payment_id: p.id,
      job_id: p.job_id || 'optional-job-uuid',
      worker_id: p.worker_id || 'optional-worker-uuid',
      job_title: p.job?.title,
      amount: parseFloat(p.amount),
      status: p.status,
      created_at: p.created_at,
      approved_at: p.approved_at,
      paid_at: p.paid_at,
    }));

    return successResponse({
      total_earned,
      pending_amount,
      paid_amount,
      transactions,
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return errorResponse('Failed to fetch wallet information', 500);
  }
}

/**
 * Get pending payment approvals (Government Official/Admin)
 */
async function getPendingApprovals(req: Request): Promise<Response> {
  const authResult = await requireGramPanchayat(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get pending payments for jobs created by this user
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        created_at,
        job:jobs!payments_job_id_fkey (
          id,
          title,
          created_by
        ),
        worker:users!payments_worker_id_fkey (
          id,
          name,
          phone_number,
          email
        ),
        submission:submissions!payments_submission_id_fkey (
          id,
          before_photo,
          after_photo
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get pending approvals error:', error);
      return errorResponse(error.message);
    }

    // Filter to only show payments for jobs created by this user (unless admin)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    
    const filteredPayments = isAdmin 
      ? payments 
      : (payments || []).filter((p: any) => p.job?.created_by === user.id);

    // Format response
    const formattedPayments = filteredPayments.map((p: any) => ({
      payment_id: p.id,
      worker_name: p.worker?.name,
      worker_phone: p.worker?.phone_number,
      job_title: p.job?.title,
      amount: parseFloat(p.amount),
      submitted_at: p.created_at,
      submission_id: p.submission?.id,
    }));

    return successResponse({ payments: formattedPayments });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return errorResponse('Failed to fetch pending approvals', 500);
  }
}

/**
 * Approve payment
 */
async function approvePayment(req: Request, paymentId: string): Promise<Response> {
  if (!isValidUUID(paymentId)) {
    return errorResponse('Invalid payment ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get payment with job details
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select(`
        *,
        job:jobs!payments_job_id_fkey (
          id,
          created_by
        )
      `)
      .eq('id', paymentId)
      .single();

    if (payError || !payment) {
      return errorResponse('Payment not found', 404);
    }

    // Check if user owns the job or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isJobOwner = payment.job.created_by === user.id;

    if (!isAdmin && !isJobOwner) {
      return errorResponse('You can only approve payments for your own jobs', 403);
    }

    // Update payment status to paid immediately (simulate instant payment)
    // In production, this would be 'approved' and later marked as 'paid' after actual payment processing
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Approve payment error:', updateError);
      return errorResponse(updateError.message);
    }

    return successResponse({ success: true }, 'Payment approved successfully');
  } catch (error) {
    console.error('Approve payment error:', error);
    return errorResponse('Failed to approve payment', 500);
  }
}
