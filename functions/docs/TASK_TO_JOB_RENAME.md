# Task to Job Rename Summary

## Overview
Comprehensive renaming of all "task" references to "job" throughout the Greenmatch Functions project for consistency and clarity.

## Database Changes (Migration: 20251109150324)

### Enum Types Renamed
- ✅ `task_status` → `job_status`
- ✅ `task_category` → `job_category`

### Tables
- ✅ `tasks` → `jobs` (renamed in earlier migration)
- ✅ `task_applications` → `job_applications` (renamed in earlier migration)

### RLS Policies Renamed

**Jobs Table:**
- ✅ "Authenticated users can view all tasks" → "Authenticated users can view all jobs"
- ✅ "Gram Panchayat and Admins can create tasks" → "Gram Panchayat and Admins can create jobs"
- ✅ "Task creators and Admins can update tasks" → "Job creators and Admins can update jobs"
- ✅ "Task creators and Admins can delete tasks" → "Job creators and Admins can delete jobs"

**Job Applications Table:**
- ✅ Policies updated to reference "job_applications"

### Triggers Renamed
- ✅ `update_tasks_updated_at` → `update_jobs_updated_at`
- ✅ `update_task_applications_updated_at` → `update_job_applications_updated_at`
- ✅ `on_application_accepted` recreated for job_applications

### Foreign Keys
- ✅ `task_id` → `job_id` in job_applications table

## TypeScript Type Changes

### New Primary Types
```typescript
export type JobStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'paid';
export type JobCategory = 'tree_planting' | 'waste_management' | 'water_conservation' | 'renewable_energy' | 'awareness' | 'other';

export interface Job { ... }
export interface JobApplication { ... }
export interface CreateJobRequest { ... }
export interface UpdateJobRequest { ... }
```

### Legacy Aliases (for backward compatibility)
```typescript
export type TaskStatus = JobStatus;
export type TaskCategory = JobCategory;
export type Task = Job;
export type TaskApplication = JobApplication;
export type CreateTaskRequest = CreateJobRequest;
export type UpdateTaskRequest = UpdateJobRequest;
```

## API Endpoints
All endpoints remain the same but now work with "jobs" terminology:
- `/jobs/create` - Create a new job
- `/jobs/my-jobs` - Get jobs created by current user
- `/jobs/:id` - Get job details by ID
- `/jobs/discover` - Discover nearby jobs
- `/jobs/:id/apply` - Apply for a job
- `/jobs/my-applications` - Get user's job applications
- `/jobs/:id/applications` - Get applications for a job
- `/applications/:id/accept` - Accept an application
- `/applications/:id/reject` - Reject an application

## What's Consistent Now

### Database Level
- ✅ All table names use "job" terminology
- ✅ All column names use "job" terminology
- ✅ All enum types use "job" terminology
- ✅ All RLS policies reference "jobs"
- ✅ All triggers reference "jobs"
- ✅ All foreign keys reference "job_id"

### Code Level
- ✅ TypeScript types use "Job" terminology
- ✅ Legacy "Task" aliases maintained for compatibility
- ✅ All API functions work with "jobs" table
- ✅ All queries reference "jobs" and "job_applications"

## Migration Applied
Run `supabase db reset` to apply all migrations including the comprehensive rename.

## Notes
- Legacy type aliases ensure existing code continues to work
- All database objects now consistently use "job" terminology
- API endpoints and responses use "jobs" terminology
- The system is now fully aligned with the "jobs" naming convention
