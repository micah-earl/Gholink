-- ULTRA SIMPLE LEADERBOARD - FOR DEBUGGING
-- Run this first to see if basic function works

DROP FUNCTION IF EXISTS get_points_leaderboard(integer);

CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  role TEXT,
  referral_code TEXT,
  display_name TEXT,
  avatar_url TEXT,
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
    u.display_name,
    u.avatar_url,
    u.points,
    CAST(0 AS BIGINT) as direct_recruits,  -- Simplified for testing
    CAST(0 AS BIGINT) as total_recruits,    -- Simplified for testing
    u.created_at
  FROM public.users u
  WHERE u.role != 'admin'
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;

-- Test it
SELECT * FROM get_points_leaderboard(10);

-- If this works, you should see users listed
-- If not, check what error you get
