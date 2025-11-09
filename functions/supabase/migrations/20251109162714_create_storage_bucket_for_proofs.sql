-- Create storage bucket for job proof submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-proofs', 'job-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the bucket
CREATE POLICY "Authenticated users can upload proof photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-proofs' AND
  (storage.foldername(name))[1] = 'submissions'
);

-- Allow users to view all proof photos (public bucket)
CREATE POLICY "Anyone can view proof photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'job-proofs');

-- Allow job creators and admins to delete proof photos
CREATE POLICY "Job creators and admins can delete proof photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-proofs' AND
  (
    -- Check if user is admin
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
    OR
    -- Check if user created the job (folder structure: submissions/job_id/user_id/file)
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id::text = (storage.foldername(name))[2]
      AND created_by = auth.uid()
    )
  )
);
