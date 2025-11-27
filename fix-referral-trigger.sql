-- Fix the auto-create trigger to use parent_id from signup metadata
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Get parent_id from user metadata (passed during signup)
  referrer_id := (NEW.raw_user_meta_data->>'parent_id')::UUID;
  
  -- Insert into users table
  -- If referrer_id exists, set as 'recruited', otherwise 'recruiter'
  INSERT INTO public.users (id, role, parent_id)
  VALUES (
    NEW.id, 
    CASE WHEN referrer_id IS NOT NULL THEN 'recruited' ELSE 'recruiter' END,
    referrer_id
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Verify the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

