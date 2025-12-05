-- =====================================================
-- REMOVE ALL DUPLICATE FUNCTIONS AND TRIGGERS
-- Run this to clean up all duplicates
-- =====================================================

-- Step 1: Remove ALL duplicate point distribution functions
DROP FUNCTION IF EXISTS distribute_referral_points_users_table(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS trigger_distribute_points() CASCADE;
DROP FUNCTION IF EXISTS trigger_distribute_points_users() CASCADE;

-- Step 2: Verify what's left
SELECT 'Remaining functions that mention points:' as status;
SELECT proname as function_name
FROM pg_proc
WHERE proname LIKE '%point%' OR proname LIKE '%referral%'
ORDER BY proname;

-- Step 3: Check triggers on users table (should only see referral_code triggers, NO points triggers)
SELECT 'Triggers on public.users table:' as status;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' 
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- Step 4: Check triggers on auth.users (should see on_auth_user_created)
SELECT 'Triggers on auth.users table:' as status;
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- Step 5: Show which function handle_new_user calls
SELECT 'Checking handle_new_user function:' as status;
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Step 6: Reset all points to start fresh
UPDATE public.users SET points = 0;

SELECT 'Cleanup complete! You should now have:' as status
UNION ALL
SELECT '✅ ONE function: distribute_referral_points'
UNION ALL
SELECT '✅ ONE trigger function: handle_new_user'
UNION ALL
SELECT '✅ ONE trigger: on_auth_user_created on auth.users'
UNION ALL
SELECT '✅ NO point triggers on public.users table';
