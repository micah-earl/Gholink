-- =====================================================
-- QUICK FIX: RESTORE POINTS DISTRIBUTION
-- =====================================================
-- This adds points distribution back to the handle_new_user trigger
-- Run this in Supabase SQL Editor NOW
-- =====================================================

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
  
  -- ✨ CRITICAL: Distribute points if user was recruited
  IF v_parent_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, v_parent_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- VERIFY THE FIX
-- =====================================================
-- After running the above, test by creating a new user
-- or check existing users:

SELECT 
  u.referral_code,
  u.display_name,
  u.role,
  u.points,
  u.parent_id,
  (SELECT COUNT(*) FROM public.users WHERE parent_id = u.id) as direct_recruits
FROM public.users u
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- OPTIONAL: BACKFILL POINTS FOR RECENT SIGNUPS
-- =====================================================
-- If users signed up recently without getting points,
-- you can manually distribute points to them:

-- First, see who needs points:
SELECT 
  id, 
  parent_id, 
  points, 
  referral_code, 
  display_name,
  created_at
FROM public.users
WHERE parent_id IS NOT NULL 
  AND points = 0
ORDER BY created_at DESC;

-- Then uncomment and run this to give them points:
/*
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, parent_id 
    FROM public.users 
    WHERE parent_id IS NOT NULL 
      AND points = 0
    ORDER BY created_at ASC
  LOOP
    PERFORM distribute_referral_points(user_record.id, user_record.parent_id);
    RAISE NOTICE 'Distributed points for user: %', user_record.id;
  END LOOP;
END $$;
*/

-- Verify points were distributed:
SELECT 
  referral_code,
  display_name,
  role,
  points
FROM public.users
WHERE parent_id IS NOT NULL
ORDER BY points DESC;
