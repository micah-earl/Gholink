-- =====================================================
-- NUCLEAR OPTION: Complete cleanup and rebuild
-- This removes ALL points-related triggers and functions
-- Then recreates them correctly
-- =====================================================

-- Step 1: Drop ALL triggers that might distribute points
DROP TRIGGER IF EXISTS trigger_award_referral_points ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_distribute_points ON public.users;
DROP TRIGGER IF EXISTS auto_distribute_points ON public.users;

-- Step 2: Drop ALL functions
DROP FUNCTION IF EXISTS trigger_distribute_points() CASCADE;
DROP FUNCTION IF EXISTS distribute_referral_points(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_points_leaderboard(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Ensure points column exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);

-- Step 4: Create the ONLY function to distribute points
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
    
    -- Safety check: stop after 50 levels
    EXIT WHEN level_count > 50;
  END LOOP;
END;
$$;

-- Step 5: Create handle_new_user - this is the ONLY trigger that should run
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Get parent_id from user metadata
  referrer_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Insert into users table
  INSERT INTO public.users (id, role, parent_id)
  VALUES (
    NEW.id, 
    CASE WHEN referrer_id IS NOT NULL THEN 'recruited' ELSE 'recruiter' END,
    referrer_id
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Distribute points ONLY if user was referred
  IF referrer_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, referrer_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 6: Create the ONLY trigger (on auth.users, not public.users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create leaderboard function
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

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION distribute_referral_points TO authenticated;
GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;

-- Step 9: OPTIONAL - Reset all points to 0
-- Uncomment the next line to reset all existing points:
-- UPDATE public.users SET points = 0;

-- Step 10: Verify setup
SELECT 'Setup complete! Run the queries below to verify:' as status;

-- Check triggers
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('users')
  AND trigger_schema IN ('auth', 'public');
