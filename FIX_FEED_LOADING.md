# 🔧 Fix Feed Loading Issue

## The Problem
You're getting a 400 error because either:
1. The `posts` table doesn't have the `media_type` column yet
2. The `posts_with_users` view doesn't exist
3. The display names aren't synced

## Quick Fix (Run in SQL Editor)

Copy and paste this into Supabase SQL Editor and run it:

```sql
-- Step 1: Add media_type column to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_type TEXT 
CHECK (media_type IN ('image', 'video', NULL));

-- Step 2: Add display_name to users table  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 3: Sync existing display names
UPDATE users u
SET display_name = (
  SELECT COALESCE(au.raw_user_meta_data->>'display_name', au.email)
  FROM auth.users au
  WHERE au.id = u.id
);

-- Step 4: Create view for easy querying
CREATE OR REPLACE VIEW posts_with_users AS
SELECT 
  p.*,
  u.display_name,
  u.points as user_points,
  u.avatar_url as user_avatar
FROM posts p
LEFT JOIN users u ON p.user_id = u.id;

-- Step 5: Grant permissions
GRANT SELECT ON posts_with_users TO authenticated;
```

## Test It

1. Refresh your app
2. Go to Feed page
3. Should load without errors now!

## If Still Not Working

### Check 1: Do you have the posts table?
```sql
SELECT * FROM posts LIMIT 1;
```
If error: Run `create-feed-tables.sql` first

### Check 2: Do you have the storage bucket?
- Go to Storage in Supabase Dashboard
- Look for `feed-media` bucket
- If missing: Create it (mark as Public)

### Check 3: Check browser console
- F12 → Console tab
- Look for specific error messages
- Share the error message if still stuck

## Common Errors & Fixes

**Error: "relation posts does not exist"**
→ Run `create-feed-tables.sql` first

**Error: "column media_type does not exist"**
→ Run the ALTER TABLE command above

**Error: "permission denied for view posts_with_users"**
→ Run the GRANT SELECT command above

**Error: "Failed to load resource 400"**
→ Usually means RLS policy issue, run:
```sql
-- Fix RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);
```

## Files to Run in Order

1. `create-feed-tables.sql` - Creates posts, likes, comments tables
2. `fix-feed-display-names.sql` - Adds display names (or use Quick Fix above)
3. `update-feed-media.sql` - Adds media_type column (or use Quick Fix above)
4. Create `feed-media` bucket in Dashboard
5. Test the app!

---

**Still stuck?** Check the browser Network tab (F12 → Network) and look at the failed request details.
