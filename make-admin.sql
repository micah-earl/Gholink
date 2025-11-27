-- Make a specific user an admin (run this in Supabase SQL editor)
-- Replace 'user@example.com' with the email of the user you want to make admin

-- Option 1: If you know the user's UUID
-- UPDATE public.users SET role = 'admin' WHERE id = 'your-user-uuid-here';

-- Option 2: If you know the user's email (requires auth access)
-- First, get the user's UUID from auth.users, then update
-- SELECT id, email FROM auth.users WHERE email = 'user@example.com';
-- Then use that UUID in the update:
-- UPDATE public.users SET role = 'admin' WHERE id = '<uuid-from-above>';

-- Quick way to see all users and their roles:
SELECT 
  u.id,
  au.email,
  u.role,
  u.referral_code,
  u.parent_id,
  u.created_at
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
ORDER BY u.created_at DESC;

-- Example to make the first user an admin:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1);
