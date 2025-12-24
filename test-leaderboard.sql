-- TEST LEADERBOARD DATA
-- Run this to check if users are showing up

-- Check users table
SELECT id, role, referral_code, display_name, avatar_url, points 
FROM public.users 
WHERE role != 'admin'
ORDER BY points DESC
LIMIT 10;

-- Test the function
SELECT * FROM get_points_leaderboard(10);
