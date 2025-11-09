/**
 * Dashboard & Analytics API
 * 
 * Endpoints:
 * - GET /dashboard/stats - Get user-specific dashboard stats
 * - GET /dashboard/climate-impact - Get global climate impact stats
 */

import { 
  requireAuth,
  handleCors, 
  errorResponse, 
  successResponse,
} from '../_shared/middleware.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    const lastPart = pathParts[pathParts.length - 1];

    // GET /dashboard/stats
    if (method === 'GET' && lastPart === 'stats') {
      return await getDashboardStats(req, url);
    }

    // GET /dashboard/climate-impact
    if (method === 'GET' && lastPart === 'climate-impact') {
      return await getClimateImpact(req);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Get dashboard stats based on user type
 */
async function getDashboardStats(req: Request, url: URL): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return errorResponse('User not found', 404);
    }

    const userType = url.searchParams.get('user_type') || 
      (userData.role === 'GramPanchayat' ? 'government' : 'worker');

    if (userType === 'government' || userData.role === 'GramPanchayat' || userData.role === 'Admin') {
      return await getGovernmentStats(user.id, supabase);
    } else {
      return await getWorkerStats(user.id, supabase);
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse('Failed to fetch dashboard stats', 500);
  }
}

/**
 * Get government official dashboard stats
 */
async function getGovernmentStats(userId: string, supabase: any): Promise<Response> {
  try {
    // Total jobs posted
    const { count: total_jobs_posted } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    // Active jobs (open or assigned)
    const { count: active_jobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .in('status', ['open', 'assigned', 'in_progress']);

    // Completed jobs
    const { count: completed_jobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .in('status', ['completed', 'verified', 'paid']);

    // Total spent (sum of approved/paid payments)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, job:jobs!payments_job_id_fkey(created_by)')
      .in('status', ['approved', 'paid']);

    const total_spent = (payments || [])
      .filter((p: any) => p.job?.created_by === userId)
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    // Pending verifications
    const { count: pending_verifications } = await supabase
      .from('submissions')
      .select('*, job:jobs!submissions_job_id_fkey(created_by)', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    // Filter pending verifications for this user's jobs
    const { data: pendingSubmissions } = await supabase
      .from('submissions')
      .select('job:jobs!submissions_job_id_fkey(created_by)')
      .eq('verification_status', 'pending');

    const user_pending_verifications = (pendingSubmissions || [])
      .filter((s: any) => s.job?.created_by === userId)
      .length;

    return successResponse({
      total_jobs_posted: total_jobs_posted || 0,
      active_jobs: active_jobs || 0,
      completed_jobs: completed_jobs || 0,
      total_spent: parseFloat(total_spent.toFixed(2)),
      pending_verifications: user_pending_verifications,
    });
  } catch (error) {
    console.error('Get government stats error:', error);
    return errorResponse('Failed to fetch government stats', 500);
  }
}

/**
 * Get worker dashboard stats
 */
async function getWorkerStats(userId: string, supabase: any): Promise<Response> {
  try {
    // Jobs completed
    const { count: jobs_completed } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .in('status', ['completed', 'verified', 'paid']);

    // Total earned (paid payments)
    const { data: paidPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('worker_id', userId)
      .eq('status', 'paid');

    const total_earned = (paidPayments || [])
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    // Pending earnings (pending/approved payments)
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('worker_id', userId)
      .in('status', ['pending', 'approved']);

    const pending_earnings = (pendingPayments || [])
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    // Current applications (pending/accepted)
    const { count: current_applications } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'accepted']);

    return successResponse({
      jobs_completed: jobs_completed || 0,
      total_earned: parseFloat(total_earned.toFixed(2)),
      pending_earnings: parseFloat(pending_earnings.toFixed(2)),
      current_applications: current_applications || 0,
    });
  } catch (error) {
    console.error('Get worker stats error:', error);
    return errorResponse('Failed to fetch worker stats', 500);
  }
}

/**
 * Get global climate impact stats
 */
async function getClimateImpact(req: Request): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { supabase } = authResult;

  try {
    // Total jobs completed
    const { count: total_jobs_completed } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'verified', 'paid']);

    // Total trees planted (jobs with tree_planting category)
    const { count: total_trees_planted } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'tree_planting')
      .in('status', ['completed', 'verified', 'paid']);

    // Estimate CO2 offset (rough estimate: 20kg per tree per year)
    const total_co2_offset_kg = (total_trees_planted || 0) * 20;

    // Total income generated (sum of all paid payments)
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid');

    const total_income_generated = (allPayments || [])
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    // Active workers (users with at least one completed job)
    const { data: activeWorkers } = await supabase
      .from('jobs')
      .select('assigned_to')
      .in('status', ['completed', 'verified', 'paid'])
      .not('assigned_to', 'is', null);

    const uniqueWorkers = new Set((activeWorkers || []).map((j: any) => j.assigned_to));
    const active_workers = uniqueWorkers.size;

    return successResponse({
      total_trees_planted: total_trees_planted || 0,
      total_co2_offset_kg,
      total_jobs_completed: total_jobs_completed || 0,
      total_income_generated: parseFloat(total_income_generated.toFixed(2)),
      active_workers,
    });
  } catch (error) {
    console.error('Get climate impact error:', error);
    return errorResponse('Failed to fetch climate impact stats', 500);
  }
}
