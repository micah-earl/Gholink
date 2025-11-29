-- =====================================================
-- FUNCTION TO GET COMPLETE TREE (UPLINE + DOWNLINE)
-- =====================================================

CREATE OR REPLACE FUNCTION get_complete_referral_tree(user_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  parent_id UUID,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  level INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE 
  -- Get upline (parents going backwards)
  upline AS (
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      -1 as level,
      1 as depth
    FROM public.users u
    WHERE u.id = (SELECT u2.parent_id FROM public.users u2 WHERE u2.id = user_id)
    
    UNION ALL
    
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      ul.level - 1,
      ul.depth + 1
    FROM public.users u
    INNER JOIN upline ul ON u.id = ul.parent_id
  ),
  -- Get downline (children going forward)
  downline AS (
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      0 as level
    FROM public.users u
    WHERE u.id = user_id
    
    UNION ALL
    
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      dl.level + 1
    FROM public.users u
    INNER JOIN downline dl ON u.parent_id = dl.id
  )
  -- Combine upline and downline
  SELECT 
    upline.id,
    upline.role,
    upline.parent_id,
    upline.referral_code,
    upline.created_at,
    upline.level
  FROM upline
  UNION ALL
  SELECT 
    downline.id,
    downline.role,
    downline.parent_id,
    downline.referral_code,
    downline.created_at,
    downline.level
  FROM downline
  ORDER BY level, created_at;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_complete_referral_tree TO authenticated, anon;
