-- Update get_points_leaderboard to exclude admin users
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
  WHERE u.role != 'admin'  -- Exclude admin users from leaderboard
  GROUP BY u.id, u.role, u.referral_code, u.points, u.created_at
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;
