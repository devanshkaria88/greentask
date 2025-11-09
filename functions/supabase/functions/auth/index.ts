/**
 * Authentication API
 * 
 * Endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 */

import { 
  handleCors, 
  errorResponse, 
  successResponse,
  corsHeaders,
} from '../_shared/middleware.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { isValidEmail, isValidPhone, isValidLatitude, isValidLongitude } from '../_shared/validation.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    // POST /auth/register
    if (method === 'POST' && pathParts[pathParts.length - 1] === 'register') {
      return await register(req);
    }

    // POST /auth/login
    if (method === 'POST' && pathParts[pathParts.length - 1] === 'login') {
      return await login(req);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

/**
 * Register new user
 * POST /auth/register
 * Body: { phone_number, name, email, user_type, region_name, location, lat, lng, password }
 */
async function register(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { phone_number, name, email, user_type, region_name, location, lat, lng, password } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required');
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format');
    }

    if (phone_number && !isValidPhone(phone_number)) {
      return errorResponse('Invalid phone number format');
    }

    if (lat !== undefined && !isValidLatitude(lat)) {
      return errorResponse('Invalid latitude (must be between -90 and 90)');
    }

    if (lng !== undefined && !isValidLongitude(lng)) {
      return errorResponse('Invalid longitude (must be between -180 and 180)');
    }

    // Validate user_type
    const validUserTypes = ['GramPanchayat', 'CommunityMember', 'Admin'];
    const role = user_type || 'CommunityMember';
    if (!validUserTypes.includes(role)) {
      return errorResponse('Invalid user_type. Must be GramPanchayat, CommunityMember, or Admin');
    }

    // Create Supabase admin client for user creation
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone_number,
        region_name,
        location,
        lat,
        lng,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return errorResponse(authError.message);
    }

    if (!authData.user) {
      return errorResponse('Failed to create user');
    }

    // Insert or update user profile in public.users
    // Using upsert to handle both trigger-created and manual creation
    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authData.user.id,
        name,
        email,
        role,
        phone_number,
        region_name,
        location,
        lat,
        lng,
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return errorResponse('Failed to create user profile');
    }

    // Get the complete user profile
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Generate session token using anon key client
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      // User created but session failed - return user without token
      return successResponse({
        user: userProfile,
        session_token: null,
        message: 'User created but session generation failed. Please login.',
      });
    }

    return successResponse({
      user: userProfile,
      session_token: sessionData.session.access_token,
    }, 'User registered successfully');

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Failed to register user', 500);
  }
}

/**
 * Login user
 * POST /auth/login
 * Body: { email, password }
 */
async function login(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login error:', authError);
      return errorResponse('Invalid email or password', 401);
    }

    if (!authData.session || !authData.user) {
      return errorResponse('Login failed', 401);
    }

    // Get user profile from public.users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return errorResponse('User profile not found', 404);
    }

    return successResponse({
      user: userProfile,
      session_token: authData.session.access_token,
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Failed to login', 500);
  }
}
