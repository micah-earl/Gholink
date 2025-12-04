-- =====================================================
-- DEBUG POINTS SYSTEM
-- Run these queries to see what's happening
-- =====================================================

-- 1. Check all users and their points/relationships
SELECT 
  id,
  role,
  referral_code,
  parent_id,
  points,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- 2. Check if handle_new_user trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if distribute_referral_points function exists
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'distribute_referral_points';

-- 4. Manually test the points distribution function
-- Replace the UUIDs below with actual user IDs from query #1
-- SELECT distribute_referral_points('new-user-uuid-here', 'recruiter-uuid-here');

-- 5. Check auth.users metadata to see if parent_id is being stored
SELECT 
  id,
  email,
  raw_user_meta_data->>'parent_id' as parent_id_in_metadata,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
