-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- First, drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their recruits" ON public.users;
DROP POLICY IF EXISTS "Anyone can lookup referral codes" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data during signup" ON public.users;

-- Create simple, non-recursive policies

-- 1. Allow users to INSERT their own record (for signup)
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Allow anyone to SELECT (needed for referral lookups and tree queries)
CREATE POLICY "Anyone can view users"
  ON public.users
  FOR SELECT
  USING (true);

-- 3. Allow users to UPDATE their own record
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
