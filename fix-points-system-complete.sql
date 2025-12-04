-- =====================================================
-- COMPLETE FIX FOR POINTS SYSTEM
-- Run this in Supabase SQL Editor to fix everything
-- =====================================================

-- Drop existing functions and triggers to start fresh
DROP TRIGGER IF EXISTS trigger_award_referral_points ON public.users;
DROP FUNCTION IF EXISTS trigger_distribute_points();
DROP FUNCTION IF EXISTS distribute_referral_points(UUID, UUID);
DROP FUNCTION IF EXISTS get_points_leaderboard(INTEGER);

-- Add points column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);

-- =====================================================
-- FUNCTION TO DISTRIBUTE POINTS UP THE REFERRAL CHAIN
-- =====================================================
-- Award 2000 total points per recruit distributed:
-- - New recruit: 1000 points
-- - Direct recruiter: 500 points
-- - Then halve up the chain: 250, 125, 62, 31, 15, 7, 3, 1...
-- =====================================================

CREATE OR REPLACE FUNCTION distribute_referral_points(new_user_id UUID, direct_recruiter_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_points INTEGER;
  level_count INTEGER;
BEGIN
  -- Award 1000 points to the new recruit
  UPDATE public.users 
  SET points = points + 1000 
  WHERE id = new_user_id;
  
  -- Start with the direct recruiter getting 500 points
  current_user_id := direct_recruiter_id;
  current_points := 500;
  level_count := 0;
  
  -- Loop through the chain going up, halving points each level
  WHILE current_user_id IS NOT NULL AND current_points >= 1 LOOP
    -- Award points to current user in the chain
    UPDATE public.users 
    SET points = points + current_points 
    WHERE id = current_user_id;
    
    -- Get the parent of the current user for next iteration
    SELECT parent_id INTO current_user_id 
    FROM public.users 
    WHERE id = current_user_id;
    
    -- Halve the points for the next level
    current_points := current_points / 2;
    level_count := level_count + 1;
    
    -- Safety check: stop after 50 levels (prevent infinite loop)
    EXIT WHEN level_count > 50;
  END LOOP;
END;
$$;

-- =====================================================
-- TRIGGER TO AUTO-DISTRIBUTE POINTS ON NEW USER
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_distribute_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only distribute points if the user has a parent (was recruited)
  IF NEW.parent_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, NEW.parent_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_award_referral_points
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_distribute_points();

-- =====================================================
-- UPDATE HANDLE_NEW_USER TO DISTRIBUTE POINTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Get parent_id from user metadata (passed during signup)
  referrer_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Insert into users table
  -- If referrer_id exists, set as 'recruited', otherwise 'recruiter'
  INSERT INTO public.users (id, role, parent_id)
  VALUES (
    NEW.id, 
    CASE WHEN referrer_id IS NOT NULL THEN 'recruited' ELSE 'recruiter' END,
    referrer_id
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Distribute points if user was referred
  IF referrer_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, referrer_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- FUNCTION TO GET LEADERBOARD
-- =====================================================

CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  role TEXT,
  referral_code TEXT,
  points INTEGER,
  direct_recruits BIGINT,
  total_recruits BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.role,
    u.referral_code,
    u.points,
    COUNT(DISTINCT d.id) as direct_recruits,
    (SELECT COUNT(*) - 1 FROM get_referral_tree(u.id)) as total_recruits,
    u.created_at
  FROM public.users u
  LEFT JOIN public.users d ON d.parent_id = u.id
  GROUP BY u.id, u.role, u.referral_code, u.points, u.created_at
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION distribute_referral_points TO authenticated;
GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;

-- =====================================================
-- RESET ALL EXISTING POINTS (OPTIONAL)
-- =====================================================
-- Uncomment the line below if you want to reset all points to 0
-- UPDATE public.users SET points = 0;

-- =====================================================
-- NOTES
-- =====================================================
-- Total points distributed per recruit: ~2000
-- 
-- Example distribution:
-- New User: 1000 points
-- Direct Recruiter (Level 0): 500 points
-- Level 1 up: 250 points
-- Level 2 up: 125 points
-- Level 3 up: 62 points
-- Level 4 up: 31 points
-- Level 5 up: 15 points
-- Level 6 up: 7 points
-- Level 7 up: 3 points
-- Level 8 up: 1 point
-- Total: 1994 points (small rounding due to integer division)
-- 
-- To view leaderboard:
-- SELECT * FROM get_points_leaderboard(10);
--
-- To reset all points:
-- UPDATE public.users SET points = 0;
