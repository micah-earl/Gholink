-- =====================================================
-- FIX PROMOTION AND RLS POLICIES
-- =====================================================
-- This fixes two issues:
-- 1. Allow admins to update users (promotion to recruiter)
-- 2. Ensure display_name is included in all policies
-- =====================================================

-- =====================================================
-- PROBLEM 1: RLS BLOCKING ADMIN UPDATES
-- =====================================================

-- Check current policies on users table
-- Run this first to see what policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'users';

-- Drop existing update policy if it's too restrictive
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;

-- Create new update policy that allows:
-- 1. Users can update their own record
-- 2. Admins can update any user record
CREATE POLICY "Users can update own record or admins can update any"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- PROBLEM 2: ENSURE DISPLAY_NAME IN SELECT POLICIES
-- =====================================================

-- Drop and recreate select policy to include display_name
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow viewing all users" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

-- Create comprehensive select policy
CREATE POLICY "Users can view all users data"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Allow anon users to view basic user data (for leaderboard, etc)
CREATE POLICY "Anon users can view basic user data"
ON public.users
FOR SELECT
TO anon
USING (true);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Check that policies were created correctly:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies 
-- WHERE tablename = 'users'
-- ORDER BY cmd, policyname;

-- =====================================================
-- TEST THE FIX
-- =====================================================
-- Test promotion query (replace with actual user ID):
-- UPDATE public.users 
-- SET role = 'recruiter', parent_id = NULL 
-- WHERE id = 'user-uuid-here';

-- Verify the change:
-- SELECT id, role, parent_id, display_name, referral_code
-- FROM public.users
-- WHERE id = 'user-uuid-here';

-- =====================================================
-- CHECK ADMIN ROLE
-- =====================================================
-- Make sure you have admin role:
-- SELECT id, role, referral_code, display_name
-- FROM public.users
-- WHERE id = auth.uid();

-- If you need to make yourself admin:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = auth.uid();
