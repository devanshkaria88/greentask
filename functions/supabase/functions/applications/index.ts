/**
 * Applications Management API
 * 
 * Endpoints:
 * - PATCH /applications/:id/accept - Accept an application (Job creator only)
 * - PATCH /applications/:id/reject - Reject an application (Job creator only)
 */

import { 
  requireAuth,
  handleCors, 
  errorResponse, 
  successResponse,
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

    if (method === 'PATCH' && pathParts.length >= 3) {
      const applicationId = pathParts[pathParts.length - 2];
      const action = pathParts[pathParts.length - 1];

      // PATCH /applications/:id/accept
      if (action === 'accept') {
        return await acceptApplication(req, applicationId);
      }

      // PATCH /applications/:id/reject
      if (action === 'reject') {
        return await rejectApplication(req, applicationId);
      }
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Accept an application
 * Side effect: Update job status to 'assigned'
 */
async function acceptApplication(req: Request, applicationId: string): Promise<Response> {
  if (!isValidUUID(applicationId)) {
    return errorResponse('Invalid application ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get application with job details
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs!job_applications_job_id_fkey (
          id,
          created_by,
          status
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return errorResponse('Application not found', 404);
    }

    // Check if user owns the job or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isJobOwner = application.job.created_by === user.id;

    if (!isAdmin && !isJobOwner) {
      return errorResponse('You can only accept applications for your own jobs', 403);
    }

    // Check if job is still open
    if (application.job.status !== 'open') {
      return errorResponse('This job is no longer accepting applications');
    }

    // Update application status to accepted
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Accept application error:', updateError);
      return errorResponse(updateError.message);
    }

    // The trigger will automatically update the job status to 'assigned'
    // and set the assigned_to field

    return successResponse({ success: true }, 'Application accepted successfully');
  } catch (error) {
    console.error('Accept application error:', error);
    return errorResponse('Failed to accept application', 500);
  }
}

/**
 * Reject an application
 */
async function rejectApplication(req: Request, applicationId: string): Promise<Response> {
  if (!isValidUUID(applicationId)) {
    return errorResponse('Invalid application ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get application with job details
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs!job_applications_job_id_fkey (
          id,
          created_by
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return errorResponse('Application not found', 404);
    }

    // Check if user owns the job or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isJobOwner = application.job.created_by === user.id;

    if (!isAdmin && !isJobOwner) {
      return errorResponse('You can only reject applications for your own jobs', 403);
    }

    // Update application status to rejected
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Reject application error:', updateError);
      return errorResponse(updateError.message);
    }

    return successResponse({ success: true }, 'Application rejected successfully');
  } catch (error) {
    console.error('Reject application error:', error);
    return errorResponse('Failed to reject application', 500);
  }
}
