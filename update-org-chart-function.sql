-- =====================================================
-- UPDATE get_complete_referral_tree TO INCLUDE DISPLAY_NAME
-- =====================================================

DROP FUNCTION IF EXISTS get_complete_referral_tree(uuid);

CREATE OR REPLACE FUNCTION get_complete_referral_tree(user_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  parent_id UUID,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  level INT,
  display_name TEXT
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
      1 as depth,
      u.display_name
    FROM public.users u
    WHERE u.id = (SELECT u2.parent_id FROM public.users u2 WHERE u2.id = user_id)
    
    UNION ALL
    
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      up.level - 1,
      up.depth + 1,
      u.display_name
    FROM public.users u
    INNER JOIN upline up ON u.id = up.parent_id
    WHERE up.depth < 100 -- Prevent infinite loops
  ),
  
  -- Get current user (renamed to avoid reserved keyword)
  curr_user AS (
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      0 as level,
      u.display_name
    FROM public.users u
    WHERE u.id = get_complete_referral_tree.user_id
  ),
  
  -- Get downline (children going forwards)
  downline AS (
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      1 as level,
      u.display_name
    FROM public.users u
    WHERE u.parent_id = get_complete_referral_tree.user_id
    
    UNION ALL
    
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      d.level + 1,
      u.display_name
    FROM public.users u
    INNER JOIN downline d ON u.parent_id = d.id
    WHERE d.level < 100 -- Prevent infinite loops
  )
  
  -- Combine all parts
  SELECT upline.id, upline.role, upline.parent_id, upline.referral_code, upline.created_at, upline.level, upline.display_name FROM upline
  UNION ALL
  SELECT curr_user.id, curr_user.role, curr_user.parent_id, curr_user.referral_code, curr_user.created_at, curr_user.level, curr_user.display_name FROM curr_user
  UNION ALL
  SELECT downline.id, downline.role, downline.parent_id, downline.referral_code, downline.created_at, downline.level, downline.display_name FROM downline
  ORDER BY level;
END;
$$;

GRANT EXECUTE ON FUNCTION get_complete_referral_tree TO authenticated, anon;

SELECT 'Updated get_complete_referral_tree to include display_name' as status;
