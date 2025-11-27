-- =====================================================
-- FUNCTION TO GET HEAD RECRUITER (TOP OF CHAIN)
-- =====================================================

-- This function traverses up the parent_id chain to find the top-level recruiter
CREATE OR REPLACE FUNCTION get_head_recruiter(user_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  parent_id UUID,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE chain AS (
    -- Base case: start with the user
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at
    FROM public.users u
    WHERE u.id = user_id
    
    UNION ALL
    
    -- Recursive case: go up to parent
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at
    FROM public.users u
    INNER JOIN chain c ON u.id = c.parent_id
  )
  SELECT 
    chain.id,
    chain.role,
    chain.parent_id,
    chain.referral_code,
    chain.created_at
  FROM chain
  WHERE chain.parent_id IS NULL  -- Top of the chain
  LIMIT 1;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_head_recruiter TO authenticated, anon;

-- Add comment for documentation
COMMENT ON FUNCTION get_head_recruiter IS 'Returns the head recruiter (top of the parent chain) for any given user';
