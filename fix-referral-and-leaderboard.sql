-- =====================================================
-- FIX REFERRAL PARENT_ID AND CONNECT ALL TO ADMIN
-- =====================================================

-- First, let's identify your admin user
-- Run this to see all users and find your admin ID:
SELECT 
  u.id,
  au.email,
  u.role,
  u.referral_code,
  u.parent_id,
  u.created_at
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
ORDER BY u.created_at ASC;

-- STEP 1: Set your admin user (replace with your actual email)
-- UPDATE public.users 
-- SET role = 'admin', parent_id = NULL
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- STEP 2: Get admin user ID for next steps
-- After running step 1, get the admin ID:
-- SELECT id FROM public.users WHERE role = 'admin' LIMIT 1;

-- STEP 3: Connect all recruiters (without parents) to admin
-- Replace 'ADMIN_USER_ID_HERE' with the actual UUID from step 2
-- UPDATE public.users
-- SET parent_id = 'ADMIN_USER_ID_HERE'
-- WHERE role = 'recruiter' 
--   AND parent_id IS NULL
--   AND role != 'admin';

-- =====================================================
-- FIX THE TRIGGER TO PROPERLY SET PARENT_ID
-- =====================================================

-- This ensures new users get the parent_id from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  referrer_id UUID;
  referrer_role TEXT;
BEGIN
  -- Get parent_id from user metadata (passed during signup)
  referrer_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Check if referrer exists and get their role
  IF referrer_id IS NOT NULL THEN
    SELECT role INTO referrer_role 
    FROM public.users 
    WHERE id = referrer_id;
  END IF;
  
  -- Insert into users table
  -- If referrer_id exists and is valid, set as 'recruited', otherwise 'recruiter'
  INSERT INTO public.users (id, role, parent_id)
  VALUES (
    NEW.id, 
    CASE WHEN referrer_id IS NOT NULL THEN 'recruited' ELSE 'recruiter' END,
    referrer_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    parent_id = EXCLUDED.parent_id,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

-- Verify the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all users and their relationships
SELECT 
  u.id,
  au.email,
  u.role,
  u.parent_id,
  p.email as parent_email,
  u.points,
  u.referral_code
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
LEFT JOIN public.users pu ON pu.id = u.parent_id
LEFT JOIN auth.users p ON p.id = pu.id
ORDER BY u.created_at ASC;

-- Check referral tree structure
-- Replace 'ADMIN_USER_ID_HERE' with your admin ID
-- SELECT * FROM get_referral_tree('ADMIN_USER_ID_HERE');
