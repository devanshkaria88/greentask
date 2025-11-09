/**
 * Supabase client utilities
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export function createSupabaseClient(authHeader: string) {
  // Use service role key for server-side operations
  // This bypasses RLS and allows us to validate JWTs
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  return createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  return authHeader;
}

export function createAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get the public Supabase URL (not the internal Docker URL)
 * In local development, Docker uses kong:8000 internally, but we need the external URL
 */
export function getPublicSupabaseUrl(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  
  // If running in Docker (kong:8000), use localhost instead
  if (supabaseUrl.includes('kong:8000')) {
    return 'http://127.0.0.1:54321';
  }
  
  return supabaseUrl;
}

/**
 * Fix storage URLs that use internal Docker network addresses
 * Converts kong:8000 URLs to proper public URL
 */
export function fixStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If URL contains kong:8000, replace it with the public URL
  if (url.includes('kong:8000')) {
    return url.replace('http://kong:8000', getPublicSupabaseUrl());
  }
  
  return url;
}
