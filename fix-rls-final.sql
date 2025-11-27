-- Complete fix for RLS issue on users table
-- Run this in Supabase SQL Editor

-- OPTION 1: Check current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- OPTION 2: Completely recreate the policies from scratch

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their recruits" ON public.users;
DROP POLICY IF EXISTS "Anyone can lookup referral codes" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data during signup" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

-- Recreate simple policies
CREATE POLICY "enable_insert_for_authenticated_users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_select_for_all"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_update_for_users_own_record"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify new policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd;
