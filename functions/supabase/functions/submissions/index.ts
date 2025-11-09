/**
 * Submissions API - Proof Submission & Verification
 * 
 * Endpoints:
 * - POST /submissions/create - Create submission with proof
 * - GET /submissions/pending - Get pending submissions (Government Official)
 * - PATCH /submissions/:id/verify - Verify submission
 * - GET /submissions/:id - Get submission details
 */

import { 
  requireAuth,
  requireGramPanchayat,
  handleCors, 
  errorResponse, 
  successResponse,
} from '../_shared/middleware.ts';
import { isValidUUID, isValidLatitude, isValidLongitude } from '../_shared/validation.ts';
import { createAdminClient, fixStorageUrl, getPublicSupabaseUrl } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    const lastPart = pathParts[pathParts.length - 1];

    // POST /submissions/create
    if (method === 'POST' && lastPart === 'create') {
      return await createSubmission(req);
    }

    // GET /submissions/pending
    if (method === 'GET' && lastPart === 'pending') {
      return await getPendingSubmissions(req);
    }

    // PATCH /submissions/:id/verify
    if (method === 'PATCH' && pathParts.length >= 3 && lastPart === 'verify') {
      const submissionId = pathParts[pathParts.length - 2];
      return await verifySubmission(req, submissionId);
    }

    // GET /submissions/:id
    if (method === 'GET' && pathParts.length >= 2 && isValidUUID(lastPart)) {
      return await getSubmissionDetails(req, lastPart);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Create submission with proof
 * Handles multipart/form-data with file uploads
 */
async function createSubmission(req: Request): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Check content type
    const contentType = req.headers.get('content-type') || '';
    console.log('[Info] Request content-type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      return errorResponse('Content-Type must be multipart/form-data');
    }

    // Parse multipart form data
    const formData = await req.formData();
    const job_id = formData.get('job_id') as string;
    const before_photo = formData.get('before_photo') as File;
    const after_photo = formData.get('after_photo') as File;
    const notes = formData.get('notes') as string | null;
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined;
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined;

    // Validate required fields
    if (!job_id || !isValidUUID(job_id)) {
      return errorResponse('Valid job_id is required');
    }

    if (!before_photo || !(before_photo instanceof File)) {
      return errorResponse('before_photo file is required');
    }

    if (!after_photo || !(after_photo instanceof File)) {
      return errorResponse('after_photo file is required');
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(before_photo.type)) {
      return errorResponse('before_photo must be a JPEG, PNG, or WebP image');
    }
    if (!allowedTypes.includes(after_photo.type)) {
      return errorResponse('after_photo must be a JPEG, PNG, or WebP image');
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (before_photo.size > maxSize) {
      return errorResponse('before_photo must be less than 5MB');
    }
    if (after_photo.size > maxSize) {
      return errorResponse('after_photo must be less than 5MB');
    }

    if (lat !== undefined && !isValidLatitude(lat)) {
      return errorResponse('Invalid latitude (must be between -90 and 90)');
    }

    if (lng !== undefined && !isValidLongitude(lng)) {
      return errorResponse('Invalid longitude (must be between -180 and 180)');
    }

    // Check if job exists and user is assigned to it
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('assigned_to, status')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return errorResponse('Job not found', 404);
    }

    if (job.assigned_to !== user.id) {
      return errorResponse('You are not assigned to this job', 403);
    }

    if (job.status === 'completed' || job.status === 'verified') {
      return errorResponse('This job has already been completed');
    }

    // Use admin client for storage uploads (bypasses RLS)
    const supabaseAdmin = createAdminClient();

    // Upload before_photo to Supabase Storage
    const beforeExt = before_photo.name.split('.').pop() || 'jpg';
    const beforePath = `submissions/${job_id}/${user.id}/before_${Date.now()}.${beforeExt}`;
    const beforeBytes = await before_photo.arrayBuffer();
    
    const { data: beforeData, error: beforeError } = await supabaseAdmin.storage
      .from('job-proofs')
      .upload(beforePath, beforeBytes, {
        contentType: before_photo.type,
        upsert: false,
      });

    if (beforeError) {
      console.error('Before photo upload error:', beforeError);
      return errorResponse(`Failed to upload before photo: ${beforeError.message}`);
    }

    // Upload after_photo to Supabase Storage
    const afterExt = after_photo.name.split('.').pop() || 'jpg';
    const afterPath = `submissions/${job_id}/${user.id}/after_${Date.now()}.${afterExt}`;
    const afterBytes = await after_photo.arrayBuffer();
    
    const { data: afterData, error: afterError } = await supabaseAdmin.storage
      .from('job-proofs')
      .upload(afterPath, afterBytes, {
        contentType: after_photo.type,
        upsert: false,
      });

    if (afterError) {
      console.error('After photo upload error:', afterError);
      // Clean up before photo if after photo fails
      await supabaseAdmin.storage.from('job-proofs').remove([beforePath]);
      return errorResponse(`Failed to upload after photo: ${afterError.message}`);
    }

    // Construct proper public URLs using the public Supabase URL (not Docker internal URL)
    const publicUrl = getPublicSupabaseUrl();
    const beforePhotoUrl = `${publicUrl}/storage/v1/object/public/job-proofs/${beforePath}`;
    const afterPhotoUrl = `${publicUrl}/storage/v1/object/public/job-proofs/${afterPath}`;

    console.log('[Info] Before photo URL:', beforePhotoUrl);
    console.log('[Info] After photo URL:', afterPhotoUrl);

    // Create submission with storage URLs
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        job_id,
        worker_id: user.id,
        before_photo: beforePhotoUrl,
        after_photo: afterPhotoUrl,
        notes: notes?.trim() || null,
        lat,
        lng,
        verification_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Create submission error:', error);
      // Clean up uploaded files if database insert fails
      await supabaseAdmin.storage.from('job-proofs').remove([beforePath, afterPath]);
      return errorResponse(error.message);
    }

    // Update job status to in_progress if not already
    if (job.status !== 'in_progress') {
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', job_id);
    }

    return successResponse({ 
      submission_id: data.id,
      before_photo_url: beforePhotoUrl,
      after_photo_url: afterPhotoUrl,
      success: true 
    }, 'Submission created successfully');
  } catch (error) {
    console.error('Create submission error:', error);
    return errorResponse('Failed to create submission', 500);
  }
}

/**
 * Get pending submissions (Government Official/Admin)
 */
async function getPendingSubmissions(req: Request): Promise<Response> {
  const authResult = await requireGramPanchayat(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get pending submissions for jobs created by this user
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        before_photo,
        after_photo,
        notes,
        created_at,
        job:jobs!submissions_job_id_fkey (
          id,
          title,
          created_by
        ),
        worker:users!submissions_worker_id_fkey (
          id,
          name,
          phone_number,
          email
        )
      `)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get pending submissions error:', error);
      return errorResponse(error.message);
    }

    // Filter to only show submissions for jobs created by this user (unless admin)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    
    const filteredSubmissions = isAdmin 
      ? data 
      : (data || []).filter((sub: any) => sub.job?.created_by === user.id);

    // Format response with fixed storage URLs
    const submissions = filteredSubmissions.map((sub: any) => ({
      submission_id: sub.id,
      job_title: sub.job?.title,
      worker_name: sub.worker?.name,
      worker_phone: sub.worker?.phone_number,
      submitted_at: sub.created_at,
      photos: {
        before: fixStorageUrl(sub.before_photo),
        after: fixStorageUrl(sub.after_photo),
      },
      notes: sub.notes,
    }));

    return successResponse({ submissions });
  } catch (error) {
    console.error('Get pending submissions error:', error);
    return errorResponse('Failed to fetch pending submissions', 500);
  }
}

/**
 * Verify submission (approve or reject)
 * Side effect: If approved, create payment record & update job status
 */
async function verifySubmission(req: Request, submissionId: string): Promise<Response> {
  if (!isValidUUID(submissionId)) {
    return errorResponse('Invalid submission ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    const body = await req.json();
    const { verification_status, rejection_reason } = body;

    // Validate verification_status
    if (!verification_status || !['approved', 'rejected'].includes(verification_status)) {
      return errorResponse('verification_status must be "approved" or "rejected"');
    }

    if (verification_status === 'rejected' && !rejection_reason) {
      return errorResponse('rejection_reason is required when rejecting');
    }

    // Get submission with job details
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select(`
        *,
        job:jobs!submissions_job_id_fkey (
          id,
          created_by
        )
      `)
      .eq('id', submissionId)
      .single();

    if (subError || !submission) {
      return errorResponse('Submission not found', 404);
    }

    // Check if user owns the job or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isJobOwner = submission.job.created_by === user.id;

    if (!isAdmin && !isJobOwner) {
      return errorResponse('You can only verify submissions for your own jobs', 403);
    }

    // Update submission
    const updateData: any = {
      verification_status,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    };

    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason.trim();
    }

    const { error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (updateError) {
      console.error('Verify submission error:', updateError);
      return errorResponse(updateError.message);
    }

    // The trigger will automatically create payment and update job status if approved

    return successResponse({ success: true }, `Submission ${verification_status} successfully`);
  } catch (error) {
    console.error('Verify submission error:', error);
    return errorResponse('Failed to verify submission', 500);
  }
}

/**
 * Get submission details
 */
async function getSubmissionDetails(req: Request, submissionId: string): Promise<Response> {
  if (!isValidUUID(submissionId)) {
    return errorResponse('Invalid submission ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Get submission with full details
    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        *,
        job:jobs!submissions_job_id_fkey (
          id,
          title,
          description,
          category,
          location,
          reward_amount,
          created_by
        ),
        worker:users!submissions_worker_id_fkey (
          id,
          name,
          email,
          phone_number
        ),
        verifier:users!submissions_verified_by_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', submissionId)
      .single();

    if (error || !submission) {
      return errorResponse('Submission not found', 404);
    }

    // Check if user has access to this submission
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isWorker = submission.worker_id === user.id;
    const isJobOwner = submission.job?.created_by === user.id;

    if (!isAdmin && !isWorker && !isJobOwner) {
      return errorResponse('You do not have access to this submission', 403);
    }

    // Format response with fixed storage URLs
    const response = {
      submission_details: {
        id: submission.id,
        before_photo: fixStorageUrl(submission.before_photo),
        after_photo: fixStorageUrl(submission.after_photo),
        notes: submission.notes,
        lat: submission.lat,
        lng: submission.lng,
        verification_status: submission.verification_status,
        rejection_reason: submission.rejection_reason,
        created_at: submission.created_at,
        verified_at: submission.verified_at,
      },
      job_details: submission.job,
      worker_details: submission.worker,
      verifier_details: submission.verifier,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get submission details error:', error);
    return errorResponse('Failed to fetch submission details', 500);
  }
}
