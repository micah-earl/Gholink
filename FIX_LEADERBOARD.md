# Leaderboard Not Showing Users - Fix

## The Problem:
The `get_points_leaderboard` function needs to be updated in your Supabase database to include `avatar_url`.

## Solution:

### Step 1: Run This SQL in Supabase
Go to your Supabase SQL Editor and run:

```sql
-- Drop the existing function first
DROP FUNCTION IF EXISTS get_points_leaderboard(integer);

-- Recreate the function with admin filter, display_name, and avatar_url
CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  role TEXT,
  referral_code TEXT,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER,
  direct_recruits BIGINT,
  total_recruits BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.role,
    u.referral_code,
    u.display_name,
    u.avatar_url,
    u.points,
    COUNT(DISTINCT d.id) as direct_recruits,
    (SELECT COUNT(*) - 1 FROM get_referral_tree(u.id)) as total_recruits,
    u.created_at
  FROM public.users u
  LEFT JOIN public.users d ON d.parent_id = u.id
  WHERE u.role != 'admin'  -- Exclude admin users from leaderboard
  GROUP BY u.id, u.role, u.referral_code, u.display_name, u.avatar_url, u.points, u.created_at
  ORDER BY u.points DESC
  LIMIT limit_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_points_leaderboard TO authenticated, anon;
```

This is in the file: `exclude-admin-from-leaderboard.sql`

### Step 2: Test the Function
Run this to verify it works:

```sql
SELECT * FROM get_points_leaderboard(10);
```

You should see users with their avatar_url field populated.

### Step 3: Refresh Your App
After running the SQL, refresh your app and the leaderboard should display users with their avatars!

## Why This Happened:
The function definition in the database still has the OLD schema (without avatar_url). Even though the code expects it, the database isn't returning it.

## Quick Debug:
Open browser DevTools Console and look for any errors when loading the leaderboard page. You might see something like "column avatar_url does not exist" or similar.
