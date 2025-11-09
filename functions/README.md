# Greenmatch Functions

Supabase Edge Functions for the Greenmatch hyperlocal climate-action micro-jobs marketplace.

## Overview

This project provides backend functionality through Supabase Edge Functions, implementing business logic and API endpoints for connecting government officials (Gram Panchayat/local bodies) with community members in rural/climate-vulnerable regions to complete climate-resilience tasks for verified compensation.

## Tech Stack

- **Runtime**: Deno
- **Database**: PostgreSQL (via Supabase)
- **Language**: TypeScript
- **Architecture**: Controllers & Edge Functions

## Features

- ✅ Database migrations with version control
- ✅ User management (Gram Panchayat, Community Members, Admin)
- ✅ Task CRUD operations with role-based access control
- ✅ Task application and assignment system
- ✅ JWT-based authentication
- ✅ Row-level security policies
- ✅ Automatic timestamp management
- 🔄 Multipart request support for file uploads (planned)
- 🔄 Real-time chat subscriptions (planned)

## Project Structure

```
greenmatch-functions/
├── deno.json                            # Deno configuration & import maps
├── supabase/
│   ├── config.toml                      # Supabase configuration
│   ├── migrations/                      # Database migrations
│   │   ├── 20241109000000_create_users_table.sql
│   │   ├── 20241109000001_create_tasks_table.sql
│   │   └── 20241109000002_create_task_applications_table.sql
│   ├── seed.sql                         # Seed data for development
│   └── functions/                       # Edge functions
│       ├── _shared/                     # Shared utilities
│       │   ├── types.ts                 # TypeScript types
│       │   ├── supabase.ts              # Supabase client utilities
│       │   ├── jwt.ts                   # JWT utilities
│       │   ├── middleware.ts            # Auth & CORS middleware
│       │   └── validation.ts            # Input validation
│       ├── users/
│       │   └── index.ts                 # User CRUD endpoints
│       ├── tasks/
│       │   └── index.ts                 # Task CRUD endpoints
│       └── applications/
│           └── index.ts                 # Task application endpoints
└── docs/                                # Documentation
    ├── API_DOCS.md                      # API reference
    └── GETTING_STARTED.md               # Quick start guide
```

## Database Schema

### Users Table

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary key (from auth.users)  |
| name        | TEXT      | User's display name            |
| email       | TEXT      | User's email (unique)          |
| phone       | TEXT      | User's phone number (optional) |
| photo_url   | TEXT      | Profile photo URL (optional)   |
| role        | ENUM      | 'GramPanchayat', 'CommunityMember', or 'Admin' |
| location    | TEXT      | User's location (optional)     |
| created_at  | TIMESTAMP | Auto-generated                 |
| updated_at  | TIMESTAMP | Auto-updated                   |

### Tasks Table

| Column                   | Type      | Description                    |
|--------------------------|-----------|--------------------------------|
| id                       | UUID      | Primary key                    |
| title                    | TEXT      | Task title                     |
| description              | TEXT      | Task description               |
| category                 | ENUM      | Task category                  |
| status                   | ENUM      | Task status                    |
| compensation_amount      | DECIMAL   | Compensation in INR            |
| location                 | TEXT      | Task location                  |
| lat                      | DOUBLE    | Latitude (optional)            |
| long                     | DOUBLE    | Longitude (optional)           |
| estimated_duration_hours | INTEGER   | Estimated hours (optional)     |
| required_participants    | INTEGER   | Required participants (optional)|
| verification_required    | BOOLEAN   | Requires verification          |
| created_by               | UUID      | Creator (FK to users)          |
| assigned_to              | UUID      | Assignee (FK to users)         |
| verified_by              | UUID      | Verifier (FK to users)         |
| created_at               | TIMESTAMP | Auto-generated                 |
| updated_at               | TIMESTAMP | Auto-updated                   |
| completed_at             | TIMESTAMP | Completion timestamp           |
| verified_at              | TIMESTAMP | Verification timestamp         |

### Task Applications Table

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary key                    |
| task_id     | UUID      | Task reference (FK)            |
| user_id     | UUID      | Applicant (FK to users)        |
| status      | ENUM      | 'pending', 'accepted', 'rejected' |
| message     | TEXT      | Application message (optional) |
| created_at  | TIMESTAMP | Auto-generated                 |
| updated_at  | TIMESTAMP | Auto-updated                   |

## Setup Instructions

### Prerequisites

- [Deno](https://deno.land/) installed
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Supabase account and project

### Local Development Setup

1. **Clone the repository**
   ```bash
   cd greenmatch-functions
   ```

2. **Install Supabase CLI** (if not already installed)
   ```bash
   brew install supabase/tap/supabase
   ```

3. **Initialize Supabase**
   ```bash
   supabase init
   ```

4. **Start local Supabase**
   ```bash
   supabase start
   ```
   
   This will output your local credentials:
   - API URL: `http://localhost:54321`
   - Anon key: `eyJh...`
   - Service role key: `eyJh...`

5. **Apply migrations**
   ```bash
   supabase db reset
   ```

6. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your local credentials from step 4.

7. **Serve functions locally**
   ```bash
   # Serve all functions
   supabase functions serve

   # Or serve a specific function
   supabase functions serve tasks
   ```

### Production Deployment

1. **Link to your Supabase project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Push migrations to production**
   ```bash
   supabase db push
   ```

3. **Deploy functions**
   ```bash
   # Deploy all functions
   supabase functions deploy

   # Or deploy specific function
   supabase functions deploy users
   supabase functions deploy tasks
   supabase functions deploy applications
   ```

4. **Set environment variables** (in Supabase Dashboard)
   - Go to Project Settings > Edge Functions
   - Add required environment variables

## API Endpoints

### Users API (`/users`)

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (Admin only)

### Tasks API (`/tasks`)

- `GET /tasks` - Get all tasks (paginated, public)
- `GET /tasks/:id` - Get task by ID (public)
- `POST /tasks` - Create task (Gram Panchayat/Admin only)
- `PUT /tasks/:id` - Update task (Creator/Admin only)
- `DELETE /tasks/:id` - Delete task (Creator/Admin only)

### Applications API (`/applications`)

- `GET /applications` - Get user's applications
- `POST /applications` - Apply for a task
- `PUT /applications/:id` - Update application status (Task creator only)

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get your JWT token by signing in through Supabase Auth.

## Role-Based Access Control

### Community Member Role (Default)
- View own profile
- Update own profile
- View all open tasks
- Apply for tasks
- View own applications

### Gram Panchayat Role
- All Community Member permissions
- Create tasks
- Update own tasks
- Delete own tasks
- Review and accept/reject applications
- Verify completed tasks

### Admin Role
- All permissions
- View all user profiles
- Update any user profile
- Delete users
- Manage all tasks
- Override any operation

## Development Tips

1. **Hot Reloading**: Functions automatically reload when you save changes
2. **Logs**: View logs with `supabase functions logs <function-name>`
3. **Database Studio**: Access local database at `http://localhost:54323`
4. **Reset Database**: Use `supabase db reset` to reapply all migrations
5. **Create Migrations**: Use `supabase migration new <name>` to create new migrations

## Troubleshooting

### Migrations Not Applied
```bash
# Reset and reapply all migrations
supabase db reset
```

### Function Not Working
```bash
# Check function logs
supabase functions logs tasks --tail

# Restart local Supabase
supabase stop
supabase start
```

### Authentication Issues
- Ensure JWT token is valid and not expired
- Check that Authorization header is properly formatted
- Verify user exists in `public.users` table

## Next Steps

- [ ] Implement multipart request support for file uploads (task photos, verification images)
- [ ] Add chat system with real-time subscriptions
- [ ] Implement payment integration
- [ ] Add notification system
- [ ] Create analytics dashboard
- [ ] Add comprehensive API documentation with OpenAPI/Swagger

## Contributing

1. Create a new migration for database changes using `supabase migration new <name>`
2. Follow TypeScript best practices
3. Add proper error handling
4. Update documentation
5. Test locally before deploying

## License

[Your License Here]
