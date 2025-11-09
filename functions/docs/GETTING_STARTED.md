# Getting Started with Greenmatch Functions

Quick start guide to get your Greenmatch Functions up and running.

## Prerequisites

Install the required tools:

```bash
# Install Deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# Install Supabase CLI
brew install supabase/tap/supabase
```

## Quick Start (5 minutes)

### 1. Start Local Supabase

```bash
cd greenmatch-functions
supabase start
```

**Save the output!** You'll need:
- API URL: `http://localhost:54321`
- Anon key: `eyJh...`
- Service role key: `eyJh...`

### 2. Apply Database Migrations

```bash
supabase db reset
```

This creates the `users`, `tasks`, and `task_applications` tables with all necessary policies.

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your local credentials from step 1.

### 4. Start Edge Functions

```bash
supabase functions serve
```

Your functions are now running at:
- Users API: `http://localhost:54321/functions/v1/users`
- Tasks API: `http://localhost:54321/functions/v1/tasks`
- Applications API: `http://localhost:54321/functions/v1/applications`

### 5. Test the API

First, create a test user through Supabase Auth:

```bash
# Open Supabase Studio
open http://localhost:54323
```

Go to Authentication > Users > Add User, then:

1. Create a user with email/password
2. Copy the user's UUID
3. Make them admin or Gram Panchayat:

```sql
UPDATE public.users
SET role = 'Admin'
WHERE email = 'your-email@example.com';
```

Now test the API:

```bash
# Get your JWT token from Supabase Studio or sign in programmatically
TOKEN="your-jwt-token"

# Test tasks endpoint
curl -X GET "http://localhost:54321/functions/v1/tasks?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## Project Structure

```
greenmatch-functions/
├── supabase/
│   ├── migrations/           # Database schema versions
│   ├── seed.sql             # Test data
│   └── functions/           # Edge functions
│       ├── _shared/         # Shared utilities
│       ├── users/           # User CRUD API
│       ├── tasks/           # Task CRUD API
│       └── applications/    # Application API
├── deno.json                # Deno config
└── README.md                # Full documentation
```

## Key Features Implemented

✅ **Database Migrations**
- Users table with role-based access (GramPanchayat, CommunityMember, Admin)
- Tasks table with climate-action categories
- Task applications table
- Row-level security policies
- Automatic timestamp management

✅ **User Management**
- Get all users (Admin)
- Get user by ID
- Update profile
- Delete user (Admin)

✅ **Task Management**
- List tasks (paginated, filtered by status/category)
- Get task by ID
- Create task (Gram Panchayat/Admin)
- Update task (Creator/Admin)
- Delete task (Creator/Admin)
- Assign tasks to community members

✅ **Application System**
- Apply for tasks
- View applications
- Accept/reject applications (Task creator)

✅ **Security**
- JWT authentication
- Role-based access control
- Row-level security
- CORS support

## Next Steps

1. **Read the full documentation**: See `README.md`
2. **Explore API endpoints**: See `docs/API_DOCS.md`
3. **Deploy to production**: Follow deployment guide in README
4. **Add more features**: Chat, file uploads, payments, etc.

## Common Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (reapply migrations)
supabase db reset

# Create new migration
supabase migration new migration_name

# Serve functions
supabase functions serve

# Deploy to production
supabase functions deploy
```

## Troubleshooting

**Functions not working?**
- Check that Supabase is running: `supabase status`
- Verify JWT token is valid
- Check function logs: `supabase functions logs tasks`

**Database issues?**
- Reset database: `supabase db reset`
- Check migrations: `ls supabase/migrations/`

**Authentication errors?**
- Verify user exists in `public.users` table
- Check Authorization header format: `Bearer <token>`

## Need Help?

- Full documentation: `README.md`
- API reference: `docs/API_DOCS.md`
- Supabase docs: https://supabase.com/docs
- Deno docs: https://deno.land/manual

## What's Next?

The foundation is ready! Here's what you might want to add:

- [ ] File upload for task photos and verification images
- [ ] Real-time chat between Gram Panchayat and community members
- [ ] Payment integration for compensation
- [ ] Push notifications for task updates
- [ ] Task verification workflow
- [ ] Analytics dashboard
- [ ] Location-based task search
- [ ] User ratings and reviews
- [ ] Activity feed

Happy coding! 🌱
