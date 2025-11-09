/**
 * Jobs Management API
 * 
 * Endpoints:
 * - POST /jobs/create - Create new job (Government Official)
 * - GET /jobs/my-jobs - Get jobs created by current user
 * - PATCH /jobs/:id - Update job
 * - DELETE /jobs/:id - Delete job
 * - GET /jobs/:id/applications - Get applications for a job
 * - GET /jobs/discover - Discover nearby jobs (Workers)
 * - POST /jobs/:id/apply - Apply for a job
 * - GET /jobs/my-applications - Get user's job applications
 */

import { requireAuth, requireGramPanchayat, handleCors, corsHeaders } from '../_shared/middleware.ts';
import { errorResponse, successResponse } from '../_shared/middleware.ts';
import { isValidUUID, validatePagination, isValidLatitude, isValidLongitude } from '../_shared/validation.ts';
import { createAdminClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    const lastPart = pathParts[pathParts.length - 1];

    // POST /jobs/create
    if (method === 'POST' && lastPart === 'create') {
      return await createJob(req);
    }

    // GET /jobs/my-jobs
    if (method === 'GET' && lastPart === 'my-jobs') {
      return await getMyJobs(req, url);
    }

    // GET /jobs/discover
    if (method === 'GET' && lastPart === 'discover') {
      return await discoverJobs(req, url);
    }

    // GET /jobs/my-applications
    if (method === 'GET' && lastPart === 'my-applications') {
      return await getMyApplications(req, url);
    }

    // Routes with job ID
    if (pathParts.length >= 2) {
      const jobId = pathParts[pathParts.length - 2];
      
      // POST /jobs/:id/apply
      if (method === 'POST' && lastPart === 'apply') {
        return await applyForJob(req, jobId);
      }

      // GET /jobs/:id/applications
      if (method === 'GET' && lastPart === 'applications') {
        return await getJobApplications(req, jobId);
      }
    }

    // GET /jobs/:id - Get single job details
    if (method === 'GET' && pathParts.length >= 2 && isValidUUID(lastPart)) {
      return await getJobById(req, lastPart);
    }

    // PATCH /jobs/:id
    if (method === 'PATCH' && pathParts.length >= 2) {
      const jobId = lastPart;
      return await updateJob(req, jobId);
    }

    // DELETE /jobs/:id
    if (method === 'DELETE' && pathParts.length >= 2) {
      const jobId = lastPart;
      return await deleteJob(req, jobId);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Create new job (Government Official/Admin only)
 */
async function createJob(req: Request): Promise<Response> {
  const authResult = await requireGramPanchayat(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    const body = await req.json();
    const { title, description, category, location, lat, lng, reward_amount, deadline, proof_requirements } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return errorResponse('Title is required');
    }

    if (!description || description.trim().length === 0) {
      return errorResponse('Description is required');
    }

    if (!category) {
      return errorResponse('Category is required');
    }

    if (!location || location.trim().length === 0) {
      return errorResponse('Location is required');
    }

    if (reward_amount === undefined || reward_amount === null || reward_amount < 0) {
      return errorResponse('Valid reward amount is required');
    }

    if (lat !== undefined && !isValidLatitude(lat)) {
      return errorResponse('Invalid latitude (must be between -90 and 90)');
    }

    if (lng !== undefined && !isValidLongitude(lng)) {
      return errorResponse('Invalid longitude (must be between -180 and 180)');
    }

    // Insert job
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        lat,
        lng,
        reward_amount,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        proof_requirements: proof_requirements?.trim(),
        created_by: user.id,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Create job error:', error);
      return errorResponse(error.message);
    }

    return successResponse(data, 'Job created successfully');
  } catch (error) {
    console.error('Create job error:', error);
    return errorResponse('Failed to create job', 500);
  }
}

/**
 * Get jobs created by current user
 */
async function getMyJobs(req: Request, url: URL): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    const status = url.searchParams.get('status');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const validation = validatePagination(page, limit);
    if (!validation.valid) {
      return errorResponse(validation.error!);
    }

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('created_by', user.id);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const { data, error, count } = await query
      .range(validation.offset!, validation.offset! + validation.limit! - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my jobs error:', error);
      return errorResponse(error.message);
    }

    return new Response(JSON.stringify({
      success: true,
      jobs: data || [],
      total_count: count || 0,
      pagination: {
        page: validation.page!,
        limit: validation.limit!,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / validation.limit!),
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    return errorResponse('Failed to fetch jobs', 500);
  }
}

/**
 * Get job by ID
 */
async function getJobById(req: Request, jobId: string): Promise<Response> {
  if (!isValidUUID(jobId)) {
    return errorResponse('Invalid job ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { supabase } = authResult;

  try {
    // Fetch job details
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Get job error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return errorResponse(`Job not found: ${error.message}`, 404);
    }

    if (!job) {
      return errorResponse('Job not found', 404);
    }

    // Fetch creator details separately
    let creator = null;
    if (job.created_by) {
      const { data: creatorData } = await supabase
        .from('users')
        .select('id, name, email, phone_number, region_name, location')
        .eq('id', job.created_by)
        .single();
      creator = creatorData;
    }

    // Fetch assigned user details separately
    let assigned_user = null;
    if (job.assigned_to) {
      const { data: assignedData } = await supabase
        .from('users')
        .select('id, name, email, phone_number')
        .eq('id', job.assigned_to)
        .single();
      assigned_user = assignedData;
    }

    return successResponse({
      ...job,
      creator,
      assigned_user,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    return errorResponse('Failed to fetch job', 500);
  }
}

/**
 * Update job
 */
async function updateJob(req: Request, jobId: string): Promise<Response> {
  if (!isValidUUID(jobId)) {
    return errorResponse('Invalid job ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Check if user owns this job or is admin
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', jobId)
      .single();

    if (!job) {
      return errorResponse('Job not found', 404);
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isOwner = job.created_by === user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse('You can only update your own jobs', 403);
    }

    const body = await req.json();
    const { title, description, reward_amount, deadline, status } = body;

    // Build update object
    const updateData: any = {};

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return errorResponse('Title cannot be empty');
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || description.trim().length === 0) {
        return errorResponse('Description cannot be empty');
      }
      updateData.description = description.trim();
    }

    if (reward_amount !== undefined) {
      if (reward_amount < 0) {
        return errorResponse('Reward amount cannot be negative');
      }
      updateData.reward_amount = reward_amount;
    }

    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline).toISOString() : null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update');
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Update job error:', error);
      return errorResponse(error.message);
    }

    return successResponse({ success: true, updated_job: data }, 'Job updated successfully');
  } catch (error) {
    console.error('Update job error:', error);
    return errorResponse('Failed to update job', 500);
  }
}

/**
 * Delete job
 */
async function deleteJob(req: Request, jobId: string): Promise<Response> {
  if (!isValidUUID(jobId)) {
    return errorResponse('Invalid job ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Check if user owns this job or is admin
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', jobId)
      .single();

    if (!job) {
      return errorResponse('Job not found', 404);
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isOwner = job.created_by === user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse('You can only delete your own jobs', 403);
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Delete job error:', error);
      return errorResponse(error.message);
    }

    return successResponse({ success: true }, 'Job deleted successfully');
  } catch (error) {
    console.error('Delete job error:', error);
    return errorResponse('Failed to delete job', 500);
  }
}

/**
 * Get applications for a job
 */
async function getJobApplications(req: Request, jobId: string): Promise<Response> {
  if (!isValidUUID(jobId)) {
    return errorResponse('Invalid job ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    // Check if user owns this job or is admin
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', jobId)
      .single();

    if (!job) {
      return errorResponse('Job not found', 404);
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'Admin';
    const isOwner = job.created_by === user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse('You can only view applications for your own jobs', 403);
    }

    // Get applications
    const { data: applicationsData, error } = await supabase
      .from('job_applications')
      .select('id, user_id, status, message, created_at, updated_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get applications error:', error);
      return errorResponse(error.message);
    }

    // Use admin client to fetch user details (bypasses RLS)
    const supabaseAdmin = createAdminClient();
    
    // Fetch user details for each application
    const applications = await Promise.all(
      (applicationsData || []).map(async (app: any) => {
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, name, email, phone_number, region_name, location, lat, lng')
          .eq('id', app.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          console.error('User ID:', app.user_id);
        }

        return {
          application_id: app.id,
          worker_id: app.user_id,
          worker: userData || {},
          status: app.status,
          message: app.message,
          applied_at: app.created_at,
          responded_at: app.status !== 'pending' ? app.updated_at : null,
        };
      })
    );

    return successResponse({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return errorResponse('Failed to fetch applications', 500);
  }
}

/**
 * Discover nearby jobs (for workers)
 */
async function discoverJobs(req: Request, url: URL): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { supabase } = authResult;

  try {
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseInt(url.searchParams.get('radius') || '50');
    const category = url.searchParams.get('category');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const validation = validatePagination(page, limit);
    if (!validation.valid) {
      return errorResponse(validation.error!);
    }

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'open');

    // Apply category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Fetch jobs
    const { data, error, count } = await query
      .range(validation.offset!, validation.offset! + validation.limit! - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Discover jobs error:', error);
      return errorResponse(error.message);
    }

    // Calculate distance for each job (simple Haversine formula)
    const jobsWithDistance = (data || []).map((job: any) => {
      let distance_km = null;
      
      if (job.lat && job.lng && lat && lng) {
        const R = 6371; // Earth's radius in km
        const dLat = (job.lat - lat) * Math.PI / 180;
        const dLng = (job.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(job.lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance_km = R * c;
      }

      return {
        ...job,
        distance_km: distance_km ? parseFloat(distance_km.toFixed(2)) : null,
      };
    });

    // Filter by radius if distance is calculated
    const filteredJobs = jobsWithDistance.filter((job: any) => 
      job.distance_km === null || job.distance_km <= radius
    );

    return new Response(JSON.stringify({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Discover jobs error:', error);
    return errorResponse('Failed to discover jobs', 500);
  }
}

/**
 * Apply for a job
 */
async function applyForJob(req: Request, jobId: string): Promise<Response> {
  if (!isValidUUID(jobId)) {
    return errorResponse('Invalid job ID format');
  }

  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    const body = await req.json();
    const { message } = body;

    // Check if job exists and is open
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return errorResponse('Job not found', 404);
    }

    if (job.status !== 'open') {
      return errorResponse('This job is no longer accepting applications');
    }

    // Create application
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        user_id: user.id,
        message: message?.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return errorResponse('You have already applied for this job');
      }
      console.error('Apply for job error:', error);
      return errorResponse(error.message);
    }

    return successResponse({ success: true, application_id: data.id }, 'Application submitted successfully');
  } catch (error) {
    console.error('Apply for job error:', error);
    return errorResponse('Failed to apply for job', 500);
  }
}

/**
 * Get user's job applications
 * Supports filter parameter for lifecycle stages:
 * - applied: Applications that are still pending
 * - ongoing: Applications that are accepted/assigned and job is in progress
 * - completed: Applications where job is completed or verified
 */
async function getMyApplications(req: Request, url: URL): Promise<Response> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const { user, supabase } = authResult;

  try {
    const filter = url.searchParams.get('filter'); // applied, ongoing, completed
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const validation = validatePagination(page, limit);
    if (!validation.valid) {
      return errorResponse(validation.error!);
    }

    // Build query
    let query = supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        user_id,
        status,
        message,
        created_at,
        updated_at,
        job:jobs!job_applications_job_id_fkey (
          id,
          title,
          description,
          category,
          location,
          lat,
          lng,
          reward_amount,
          deadline,
          status,
          proof_requirements,
          assigned_to,
          created_by,
          created_at,
          updated_at
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply lifecycle filter if provided
    if (filter === 'applied') {
      // Applications that are still pending (not yet accepted/rejected)
      query = query.eq('status', 'pending');
    } else if (filter === 'ongoing') {
      // Applications that are accepted
      query = query.eq('status', 'accepted');
    } else if (filter === 'completed') {
      // For completed, we want accepted applications only (not rejected)
      query = query.eq('status', 'accepted');
    }

    // Apply pagination
    const { data, error, count } = await query
      .range(validation.offset!, validation.offset! + validation.limit! - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my applications error:', error);
      return errorResponse(error.message);
    }

    // Format response and apply additional filtering based on job status
    let applications = (data || []).map((app: any) => ({
      application_id: app.id,
      job_id: app.job_id,
      worker_id: app.user_id,
      status: app.status,
      message: app.message,
      applied_at: app.created_at,
      responded_at: app.status !== 'pending' ? app.updated_at : null,
      job_details: {
        ...app.job,
        distance_km: null, // Can be calculated if user provides lat/lng
      },
    }));

    // Additional filtering for ongoing and completed based on job status
    if (filter === 'ongoing') {
      // Only include jobs that are assigned or in_progress and assigned to current user
      applications = applications.filter((app: any) => 
        ['assigned', 'in_progress'].includes(app.job_details.status) &&
        app.job_details.assigned_to === user.id
      );
    } else if (filter === 'completed') {
      // Only include jobs that are completed/verified/paid and were assigned to current user
      applications = applications.filter((app: any) => 
        ['completed', 'verified', 'paid'].includes(app.job_details.status) &&
        app.job_details.assigned_to === user.id
      );
    }

    return new Response(JSON.stringify({
      success: true,
      applications,
      pagination: {
        page: validation.page!,
        limit: validation.limit!,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / validation.limit!),
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    return errorResponse('Failed to fetch applications', 500);
  }
}
