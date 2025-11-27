-- =====================================================
-- USERS TABLE FOR REFERRAL SYSTEM
-- =====================================================

-- Create users table with referral hierarchy
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'recruited')),
  parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON public.users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can view their recruits (descendants)
CREATE POLICY "Users can view their recruits"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      WITH RECURSIVE chain AS (
        SELECT id, parent_id FROM public.users WHERE id = auth.uid()
        UNION ALL
        SELECT u.id, u.parent_id 
        FROM public.users u
        INNER JOIN chain c ON c.id = u.parent_id
      )
      SELECT 1 FROM chain WHERE chain.id = users.id
    )
  );

-- Policy: Anyone can read referral codes (needed for signup)
CREATE POLICY "Anyone can lookup referral codes"
  ON public.users
  FOR SELECT
  USING (true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- RECURSIVE FUNCTION TO GET REFERRAL TREE
-- =====================================================

-- Function to get all recruits in a user's tree
CREATE OR REPLACE FUNCTION get_referral_tree(recruiter_id UUID)
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
  WITH RECURSIVE chain AS (
    -- Base case: start with the recruiter
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      0 as level
    FROM public.users u
    WHERE u.id = recruiter_id
    
    UNION ALL
    
    -- Recursive case: get all children
    SELECT 
      u.id,
      u.role,
      u.parent_id,
      u.referral_code,
      u.created_at,
      c.level + 1
    FROM public.users u
    INNER JOIN chain c ON u.parent_id = c.id
  )
  SELECT 
    chain.id,
    chain.role,
    chain.parent_id,
    chain.referral_code,
    chain.created_at,
    chain.level
  FROM chain
  ORDER BY chain.level, chain.created_at;
END;
$$;

-- =====================================================
-- FUNCTION TO GET DIRECT RECRUITS COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION get_direct_recruits_count(recruiter_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count
  FROM public.users
  WHERE parent_id = recruiter_id;
  
  RETURN count;
END;
$$;

-- =====================================================
-- FUNCTION TO GET TOTAL RECRUITS COUNT (ALL LEVELS)
-- =====================================================

CREATE OR REPLACE FUNCTION get_total_recruits_count(recruiter_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count INTEGER;
BEGIN
  WITH RECURSIVE chain AS (
    SELECT id FROM public.users WHERE id = recruiter_id
    UNION ALL
    SELECT u.id FROM public.users u
    INNER JOIN chain c ON u.parent_id = c.id
  )
  SELECT COUNT(*) - 1 -- Subtract 1 to exclude the recruiter themselves
  INTO count
  FROM chain;
  
  RETURN count;
END;
$$;

-- =====================================================
-- FUNCTION TO GENERATE UNIQUE REFERRAL CODE
-- =====================================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character random code (alphanumeric)
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- =====================================================
-- TRIGGER TO AUTO-GENERATE REFERRAL CODE ON INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT EXECUTE ON FUNCTION get_referral_tree TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_direct_recruits_count TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_total_recruits_count TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_referral_code TO authenticated, anon;
