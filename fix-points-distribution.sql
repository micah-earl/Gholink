-- =====================================================
-- CHECK AND FIX POINTS DISTRIBUTION SYSTEM
-- =====================================================
-- This checks if points are being distributed properly
-- and fixes any issues with triggers
-- =====================================================

-- =====================================================
-- STEP 1: CHECK EXISTING TRIGGERS
-- =====================================================
-- See what triggers exist on the users table
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
ORDER BY trigger_name;

-- Expected triggers:
-- 1. on_auth_user_created (for creating user entry)
-- 2. trigger_award_referral_points (for distributing points)
-- 3. trigger_auto_referral_code (for generating referral codes)

-- =====================================================
-- STEP 2: CHECK POINTS FUNCTION EXISTS
-- =====================================================
-- Check if the points distribution functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%point%'
ORDER BY routine_name;

-- Expected functions:
-- 1. distribute_referral_points
-- 2. trigger_distribute_points
-- 3. get_points_leaderboard

-- =====================================================
-- STEP 3: TEST POINTS DISTRIBUTION MANUALLY
-- =====================================================
-- Test if the points function works by calling it directly
-- Replace these UUIDs with actual user IDs from your database

-- First, find a user with a parent
-- SELECT id, parent_id, points, referral_code, display_name
-- FROM public.users
-- WHERE parent_id IS NOT NULL
-- LIMIT 1;

-- Then test the function with those IDs:
-- SELECT distribute_referral_points(
--   'new-user-id-here'::UUID,
--   'parent-id-here'::UUID
-- );

-- Check if points were added:
-- SELECT id, points, referral_code, display_name
-- FROM public.users
-- WHERE id IN ('new-user-id', 'parent-id')
-- ORDER BY points DESC;

-- =====================================================
-- STEP 4: RE-CREATE POINTS TRIGGER (IF MISSING)
-- =====================================================
-- If the trigger doesn't exist, recreate it

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_award_referral_points ON public.users;

-- Recreate the points distribution trigger
CREATE TRIGGER trigger_award_referral_points
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_distribute_points();

-- =====================================================
-- STEP 5: CHECK FOR TRIGGER CONFLICTS
-- =====================================================
-- Make sure the on_auth_user_created trigger isn't blocking points
-- The order matters: user must be created BEFORE points are distributed

-- Check the handle_new_user function
SELECT pg_get_functiondef('public.handle_new_user'::regproc);

-- =====================================================
-- STEP 6: FIX - ENSURE POINTS TRIGGER FIRES AFTER USER CREATION
-- =====================================================
-- The issue might be that points trigger fires before user is fully created
-- Let's ensure proper order

-- Option A: Add points distribution to handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_id UUID;
  v_role TEXT;
  v_display_name TEXT;
BEGIN
  -- Get parent_id from user metadata
  v_parent_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Set role based on whether they have a parent
  IF v_parent_id IS NOT NULL THEN
    v_role := 'recruited';
  ELSE
    v_role := 'recruiter';
  END IF;
  
  -- Get display_name from metadata, fallback to email username
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert into users table
  INSERT INTO public.users (id, role, parent_id, display_name)
  VALUES (
    NEW.id, 
    v_role,
    v_parent_id,
    v_display_name
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    parent_id = EXCLUDED.parent_id,
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;
  
  -- IMPORTANT: Distribute points AFTER user is created
  IF v_parent_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, v_parent_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 7: VERIFY THE FIX
-- =====================================================
-- After running the above, test with a new signup
-- Then check points:

-- See all users and their points:
-- SELECT 
--   id, 
--   role, 
--   parent_id, 
--   points, 
--   referral_code, 
--   display_name
-- FROM public.users
-- ORDER BY created_at DESC;

-- =====================================================
-- STEP 8: BACKFILL POINTS FOR EXISTING USERS (OPTIONAL)
-- =====================================================
-- If you want to give points to users who signed up before the fix:

-- Find users who were recruited but have 0 points
-- SELECT id, parent_id, points, referral_code, display_name
-- FROM public.users
-- WHERE parent_id IS NOT NULL 
-- AND points = 0
-- ORDER BY created_at ASC;

-- Manually distribute points for these users:
-- DO $$
-- DECLARE
--   user_record RECORD;
-- BEGIN
--   FOR user_record IN 
--     SELECT id, parent_id 
--     FROM public.users 
--     WHERE parent_id IS NOT NULL 
--     AND points = 0
--     ORDER BY created_at ASC
--   LOOP
--     PERFORM distribute_referral_points(user_record.id, user_record.parent_id);
--     RAISE NOTICE 'Distributed points for user: %', user_record.id;
--   END LOOP;
-- END $$;

-- =====================================================
-- STEP 9: VERIFY POINTS WERE DISTRIBUTED
-- =====================================================
-- Check the leaderboard:
-- SELECT * FROM get_points_leaderboard(20);

-- Or check points manually:
-- SELECT 
--   referral_code,
--   display_name,
--   role,
--   points,
--   (SELECT COUNT(*) FROM public.users WHERE parent_id = u.id) as direct_recruits
-- FROM public.users u
-- WHERE points > 0
-- ORDER BY points DESC;
