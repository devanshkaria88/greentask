-- Create enum types for jobs
CREATE TYPE job_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'verified', 'paid');
CREATE TYPE job_category AS ENUM ('tree_planting', 'waste_management', 'water_conservation', 'renewable_energy', 'awareness', 'other');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category job_category NOT NULL,
  status job_status NOT NULL DEFAULT 'open',
  location TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ,
  proof_requirements TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
-- Anyone authenticated can view all jobs
CREATE POLICY "Authenticated users can view all jobs"
  ON public.jobs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Gram Panchayat and Admins can create jobs
CREATE POLICY "Gram Panchayat and Admins can create jobs"
  ON public.jobs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
      AND (role = 'GramPanchayat' OR role = 'Admin')
    )
  );

-- Job creators and Admins can update jobs
CREATE POLICY "Job creators and Admins can update jobs"
  ON public.jobs
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Job creators and Admins can delete jobs
CREATE POLICY "Job creators and Admins can delete jobs"
  ON public.jobs
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create trigger for jobs table
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for jobs table
CREATE INDEX idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX idx_jobs_assigned_to ON public.jobs(assigned_to);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_location ON public.jobs(lat, lng);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id) -- Prevent duplicate applications
);

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for job_applications table
-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.job_applications
  FOR SELECT
  USING (user_id = auth.uid());

-- Job creators can view applications for their jobs
CREATE POLICY "Job creators can view applications for their jobs"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.created_by = auth.uid()
    )
  );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Community members can create applications
CREATE POLICY "Community members can create applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Job creators and Admins can update application status
CREATE POLICY "Job creators and Admins can update applications"
  ON public.job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create trigger for job_applications table
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically assign job when application is accepted
CREATE OR REPLACE FUNCTION public.handle_application_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- If application is accepted, update the job's assigned_to field
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE public.jobs
    SET 
      assigned_to = NEW.user_id,
      status = 'assigned',
      updated_at = NOW()
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle application acceptance
CREATE TRIGGER on_application_accepted
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_accepted();

-- Create indexes for job_applications table
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_created_at ON public.job_applications(created_at DESC);
