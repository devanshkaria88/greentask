-- Fix storage URLs in submissions table
-- Replace internal Docker URLs (kong:8000) with proper storage URLs

UPDATE public.submissions
SET 
  before_photo = REPLACE(before_photo, 'http://kong:8000', 'http://127.0.0.1:54321'),
  after_photo = REPLACE(after_photo, 'http://kong:8000', 'http://127.0.0.1:54321')
WHERE 
  before_photo LIKE '%kong:8000%' 
  OR after_photo LIKE '%kong:8000%';
