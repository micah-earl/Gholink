-- SIMPLIFIED LEADERBOARD FUNCTION
-- This version doesn't rely on get_referral_tree
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_points_leaderboard(integer);

-- Recreate the function with a simpler approach
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
  WITH RECURSIVE referral_tree AS (
    -- Base case: all users
    SELECT 
      u1.id,
      u1.id as root_id,
      u1.parent_id,
      0 as depth
    FROM public.users u1
    
    UNION ALL
    
    -- Recursive case: find all descendants
    SELECT 
      u2.id,
      rt.root_id,
      u2.parent_id,
      rt.depth + 1
    FROM public.users u2
    INNER JOIN referral_tree rt ON u2.parent_id = rt.id
    WHERE rt.depth < 10  -- Prevent infinite recursion
  )
  SELECT 
    u.id,
    u.role,
    u.referral_code,
    u.display_name,
    u.avatar_url,
    u.points,
    COUNT(DISTINCT d.id) as direct_recruits,
    (SELECT COUNT(DISTINCT rt.id) - 1 
     FROM referral_tree rt 
     WHERE rt.root_id = u.id AND rt.id != u.id) as total_recruits,
    u.created_at
  FROM public.users u
  LEFT JOIN public.users d ON d.parent_id = u.id
  WHERE u.role != 'admin'
  GROUP BY u.id, u.role, u.referral_code, u.display_name, u.avatar_url, u.points, u.created_at
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;

-- Test the function
SELECT * FROM get_points_leaderboard(10);
