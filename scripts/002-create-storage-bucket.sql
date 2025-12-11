-- Create the reports bucket (run this in SQL Editor)
-- Note: Buckets are typically created via Supabase Dashboard > Storage > New Bucket
-- This script sets up the RLS policies for the bucket

-- Enable storage by inserting into storage.buckets if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own reports
CREATE POLICY "Users can upload own reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own reports
CREATE POLICY "Users can delete own reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'reports')
WITH CHECK (bucket_id = 'reports');
