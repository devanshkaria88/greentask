-- Add additional fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for phone number
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Create submissions table for proof submission
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  before_photo TEXT NOT NULL,
  after_photo TEXT NOT NULL,
  notes TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Enable RLS for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Workers can view their own submissions
CREATE POLICY "Workers can view own submissions"
  ON public.submissions
  FOR SELECT
  USING (worker_id = auth.uid());

-- Job creators can view submissions for their jobs
CREATE POLICY "Job creators can view submissions for their jobs"
  ON public.submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = submissions.job_id
      AND jobs.created_by = auth.uid()
    )
  );

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Workers can create submissions for jobs they're assigned to
CREATE POLICY "Workers can create submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (
    worker_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = submissions.job_id
      AND jobs.assigned_to = auth.uid()
    )
  );

-- Job creators and Admins can update submission verification
CREATE POLICY "Job creators and Admins can verify submissions"
  ON public.submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = submissions.job_id
      AND jobs.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create trigger for submissions table
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_job_id ON public.submissions(job_id);
CREATE INDEX IF NOT EXISTS idx_submissions_worker_id ON public.submissions(worker_id);
CREATE INDEX IF NOT EXISTS idx_submissions_verification_status ON public.submissions(verification_status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Workers can view their own payments
CREATE POLICY "Workers can view own payments"
  ON public.payments
  FOR SELECT
  USING (worker_id = auth.uid());

-- Job creators can view payments for their jobs
CREATE POLICY "Job creators can view payments for their jobs"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = payments.job_id
      AND jobs.created_by = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- System can create payments (triggered by submission approval)
CREATE POLICY "System can create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Job creators and Admins can update payment status
CREATE POLICY "Job creators and Admins can approve payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = payments.job_id
      AND jobs.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Create trigger for payments table
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON public.payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON public.payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create payment when submission is approved
CREATE OR REPLACE FUNCTION public.handle_submission_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- If submission is approved, create a payment record
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    INSERT INTO public.payments (job_id, worker_id, submission_id, amount, approved_by)
    SELECT 
      NEW.job_id,
      NEW.worker_id,
      NEW.id,
      jobs.reward_amount,
      NEW.verified_by
    FROM public.jobs
    WHERE jobs.id = NEW.job_id;
    
    -- Update job status to completed
    UPDATE public.jobs
    SET 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.job_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for submission approval
CREATE TRIGGER on_submission_approved
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_approved();
