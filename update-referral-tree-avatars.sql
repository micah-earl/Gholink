-- Add avatar_url to get_referral_tree function
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS get_referral_tree(uuid);

CREATE OR REPLACE FUNCTION get_referral_tree(recruiter_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  parent_id UUID,
  referral_code TEXT,
  points INTEGER,
  level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    -- Base case: the recruiter themselves
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.points,
      0 as level,
      u.created_at,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User') as display_name,
      au.email,
      u.avatar_url
    FROM public.users u
    LEFT JOIN auth.users au ON au.id = u.id
    WHERE u.id = recruiter_id
    
    UNION ALL
    
    -- Recursive case: children of current level
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.points,
      tree.level + 1 as level,
      u.created_at,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User') as display_name,
      au.email,
      u.avatar_url
    FROM public.users u
    LEFT JOIN auth.users au ON au.id = u.id
    INNER JOIN tree ON u.parent_id = tree.id
  )
  SELECT * FROM tree;
END;
$$;

GRANT EXECUTE ON FUNCTION get_referral_tree TO authenticated, anon;
