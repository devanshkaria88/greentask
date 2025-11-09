/**
 * Middleware utilities for Edge Functions
 */

import { createSupabaseClient } from './supabase.ts';
import { ApiResponse, UserRole } from './types.ts';
import { decodeJWT, isJWTExpired } from './jwt.ts';

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
        } as ApiResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  // Try to validate with Supabase auth first
  const supabase = createSupabaseClient(authHeader);
  let { data: { user }, error } = await supabase.auth.getUser();

  // If Supabase auth fails, try manual JWT validation as fallback
  if (error || !user) {
    console.log('Supabase auth.getUser() failed, trying manual JWT validation...');
    
    const payload = decodeJWT(authHeader);
    if (!payload || isJWTExpired(payload)) {
      console.error('JWT validation failed - invalid or expired token');
      return {
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or expired token',
          } as ApiResponse),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      };
    }

    // JWT is valid, get user from database using the sub (user ID) from JWT
    const userId = payload.sub;
    console.log('Looking up user ID:', userId);
    
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Database query result:', { 
      dbUser, 
      dbError,
      errorDetails: dbError ? JSON.stringify(dbError) : null 
    });

    if (dbError || !dbUser) {
      console.error('User not found in database:', userId);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      console.error('User data:', dbUser);
      return {
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'User not found',
            debug: {
              userId,
              errorCode: dbError?.code,
              errorMessage: dbError?.message,
              errorDetails: dbError?.details,
            }
          } as ApiResponse),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      };
    }

    // Create a user object compatible with Supabase auth user
    user = {
      id: dbUser.id,
      email: dbUser.email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: dbUser.created_at,
    } as any;
  }

  return {
    authorized: true,
    user,
    supabase,
  };
}

export async function requireAdmin(req: Request) {
  const authResult = await requireAuth(req);
  
  if (!authResult.authorized) {
    return authResult;
  }

  const { user, supabase } = authResult;

  // Check if user has admin role
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userData || userData.role !== 'Admin') {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Admin access required',
        } as ApiResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  return {
    authorized: true,
    user,
    supabase,
  };
}

export async function requireGramPanchayat(req: Request) {
  const authResult = await requireAuth(req);
  
  if (!authResult.authorized) {
    return authResult;
  }

  const { user, supabase } = authResult;

  // Check if user has GramPanchayat or Admin role
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userData || (userData.role !== 'GramPanchayat' && userData.role !== 'Admin')) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Gram Panchayat access required',
        } as ApiResponse),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  return {
    authorized: true,
    user,
    supabase,
  };
}

export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders(),
      status: 200,
    });
  }
  return null;
}

export function errorResponse(error: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
    } as ApiResponse),
    {
      status,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    }
  );
}

export function successResponse<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
    } as ApiResponse<T>),
    {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    }
  );
}
