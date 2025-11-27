-- This script creates users table entries for existing auth users
-- Run this in Supabase SQL Editor after the main migration

-- Insert existing auth users into the users table
-- They will become top-level recruiters (no parent_id)
INSERT INTO public.users (id, role, parent_id)
SELECT 
  id,
  'recruiter' as role,
  NULL as parent_id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify the insert worked
SELECT 
  u.id,
  u.email,
  users.role,
  users.referral_code,
  users.created_at
FROM auth.users u
LEFT JOIN public.users users ON users.id = u.id
ORDER BY users.created_at DESC;
