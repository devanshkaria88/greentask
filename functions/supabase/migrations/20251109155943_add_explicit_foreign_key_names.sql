-- Ensure foreign key constraints have explicit names for PostgREST to recognize them

-- Drop and recreate job_applications foreign keys with explicit names
ALTER TABLE public.job_applications 
  DROP CONSTRAINT IF EXISTS job_applications_job_id_fkey;

ALTER TABLE public.job_applications 
  DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

-- Add foreign keys with explicit constraint names
ALTER TABLE public.job_applications
  ADD CONSTRAINT job_applications_job_id_fkey 
  FOREIGN KEY (job_id) 
  REFERENCES public.jobs(id) 
  ON DELETE CASCADE;

ALTER TABLE public.job_applications
  ADD CONSTRAINT job_applications_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Also ensure jobs table foreign keys have explicit names
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_created_by_fkey;

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_assigned_to_fkey;

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_verified_by_fkey;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_assigned_to_fkey
  FOREIGN KEY (assigned_to)
  REFERENCES public.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_verified_by_fkey
  FOREIGN KEY (verified_by)
  REFERENCES public.users(id)
  ON DELETE SET NULL;
