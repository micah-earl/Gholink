-- =====================================================
-- ADD DISPLAY NAME SUPPORT TO LEADERBOARD AND QUERIES
-- =====================================================

-- Drop existing functions first to change return types
DROP FUNCTION IF EXISTS get_points_leaderboard(integer);
DROP FUNCTION IF EXISTS get_referral_tree(uuid);

-- Update get_points_leaderboard to include display_name and email from auth.users
CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  role TEXT,
  referral_code TEXT,
  points INTEGER,
  direct_recruits BIGINT,
  total_recruits BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  email TEXT
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
    u.created_at,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User') as display_name,
    au.email
  FROM public.users u
  LEFT JOIN public.users d ON d.parent_id = u.id
  LEFT JOIN auth.users au ON au.id = u.id
  GROUP BY u.id, u.role, u.referral_code, u.points, u.created_at, au.raw_user_meta_data, au.email
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;

-- Update get_referral_tree to include display_name and email
CREATE OR REPLACE FUNCTION get_referral_tree(recruiter_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  parent_id UUID,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  level INTEGER,
  display_name TEXT,
  email TEXT,
  points INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH RECURSIVE tree AS (
    -- Base case: start with the given recruiter
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      0 AS level,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User') as display_name,
      au.email,
      u.points
    FROM public.users u
    LEFT JOIN auth.users au ON au.id = u.id
    WHERE u.id = recruiter_id
    
    UNION ALL
    
    -- Recursive case: find all children
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      t.level + 1,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User') as display_name,
      au.email,
      u.points
    FROM public.users u
    INNER JOIN tree t ON u.parent_id = t.id
    LEFT JOIN auth.users au ON au.id = u.id
  )
  SELECT * FROM tree ORDER BY level, created_at;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_referral_tree TO authenticated, anon;

-- Test query
SELECT 'Setup complete! Test with:' as status
UNION ALL
SELECT 'SELECT * FROM get_points_leaderboard(10);';
