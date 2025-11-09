# JWT Token Issue - Fixed

## Problem
The register API was creating users successfully but not returning a valid JWT token.

## Root Cause
The issue was that we were using the **SERVICE_ROLE_KEY** client to call `signInWithPassword()`, but this method requires the **ANON_KEY** client to generate proper user session tokens.

## Solution
Changed the register function to use two separate Supabase clients:

1. **Admin Client** (with SERVICE_ROLE_KEY) - For creating the user via `auth.admin.createUser()`
2. **Anon Client** (with ANON_KEY) - For signing in the user via `signInWithPassword()` to get the JWT token

## Code Changes
In `/supabase/functions/auth/index.ts`:

```typescript
// Create Supabase admin client for user creation
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create auth user with admin client
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { ... },
});

// ... update user profile with admin client ...

// Generate session token using anon key client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
  email,
  password,
});
```

## Environment Variables Required
Make sure your `.env` file (or Supabase environment) has:

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

Get these values from `supabase start` output.

## Testing
```bash
curl -X POST "http://localhost:54321/functions/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone_number": "+919876543210",
    "user_type": "CommunityMember"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

## Key Takeaway
- **SERVICE_ROLE_KEY**: Use for admin operations (creating users, bypassing RLS)
- **ANON_KEY**: Use for client-side operations (signing in, getting JWT tokens)

This is a common pattern in Supabase Edge Functions when you need to both create a user (admin operation) and immediately sign them in (client operation).
