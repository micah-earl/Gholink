-- =====================================================
-- ADMIN PROMOTION FUNCTION - REMOVE PARENT ID
-- =====================================================
-- This allows admins to promote users to recruiter
-- and removes their parent_id to make them independent
-- =====================================================

-- Function to promote user to recruiter (removes parent_id)
CREATE OR REPLACE FUNCTION promote_user_to_recruiter(user_id_to_promote UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update the user: set role to recruiter and remove parent_id
  UPDATE public.users
  SET 
    role = 'recruiter',
    parent_id = NULL
  WHERE id = user_id_to_promote;
  
  -- Check if update was successful
  IF FOUND THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'User promoted to recruiter successfully',
      'user_id', user_id_to_promote
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'message', 'User not found',
      'user_id', user_id_to_promote
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION promote_user_to_recruiter TO authenticated;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
-- Promote a user by their ID:
-- SELECT promote_user_to_recruiter('user-uuid-here');

-- =====================================================
-- OR USE DIRECT UPDATE (SIMPLER APPROACH)
-- =====================================================
-- If you just want to run a simple UPDATE query:

-- Update a specific user by ID:
-- UPDATE public.users 
-- SET role = 'recruiter', parent_id = NULL 
-- WHERE id = 'user-uuid-here';

-- Update by referral code:
-- UPDATE public.users 
-- SET role = 'recruiter', parent_id = NULL 
-- WHERE referral_code = 'ABC123';

-- Update by email (requires join with auth.users):
-- UPDATE public.users 
-- SET role = 'recruiter', parent_id = NULL 
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'user@example.com'
-- );

-- =====================================================
-- VERIFY THE CHANGE
-- =====================================================
-- Check user's current role and parent_id:
-- SELECT id, role, parent_id, referral_code, display_name
-- FROM public.users
-- WHERE id = 'user-uuid-here';

-- See all recruiters (should have parent_id = NULL):
-- SELECT id, role, parent_id, referral_code, display_name
-- FROM public.users
-- WHERE role = 'recruiter'
-- ORDER BY created_at DESC;

-- =====================================================
-- MAKE YOUR FIRST ADMIN (IF NEEDED)
-- =====================================================
-- To create your first admin user:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = 'your-user-uuid-here';

-- Or by email:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@example.com'
-- );
