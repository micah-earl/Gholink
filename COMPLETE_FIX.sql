-- COMPLETE FIX FOR USERS TABLE RLS
-- Copy this ENTIRE block and run it in Supabase SQL Editor

-- Step 1: Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Create the trigger to auto-create users (bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, role, parent_id)
  VALUES (NEW.id, 'recruiter', NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create simple RLS policies
CREATE POLICY "allow_all_select"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_own_update"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Step 4: Verify everything is set up
SELECT 'Trigger created:' as status, count(*) as count
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 'Policies created:' as status, count(*) as count
FROM pg_policies
WHERE tablename = 'users';
