-- Fix for missing INSERT policy on users table
-- Run this in Supabase SQL Editor

-- Add policy to allow users to insert their own record during signup
CREATE POLICY "Users can insert own data during signup"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
