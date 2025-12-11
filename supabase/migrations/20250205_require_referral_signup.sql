-- =====================================================
-- UPDATE HANDLE_NEW_USER TRIGGER - REFERRAL REQUIRED
-- =====================================================
-- This updates the trigger to handle referral-based signups
-- Users MUST have a parent_id (referral code required)
-- =====================================================

-- Update the handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_id UUID;
  v_role TEXT;
  v_display_name TEXT;
BEGIN
  -- Get parent_id from user metadata
  v_parent_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Set role based on whether they have a parent
  -- All signups require referral, so all new users are 'recruited'
  -- Only admins can promote to 'recruiter' (which removes parent_id)
  IF v_parent_id IS NOT NULL THEN
    v_role := 'recruited';
  ELSE
    -- Should not happen due to frontend validation, but fallback to recruiter
    v_role := 'recruiter';
  END IF;
  
  -- Get display_name from metadata, fallback to email username
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert into users table when a new auth user is created
  INSERT INTO public.users (id, role, parent_id, display_name)
  VALUES (
    NEW.id, 
    v_role,
    v_parent_id,
    v_display_name
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    parent_id = EXCLUDED.parent_id,
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;
  
  -- CRITICAL: Distribute points if user has a parent (was recruited)
  IF v_parent_id IS NOT NULL THEN
    PERFORM distribute_referral_points(NEW.id, v_parent_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check if trigger was created:
-- SELECT trigger_name, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';
