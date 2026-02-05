-- ============================================
-- FIX FEED - Add display names to users table
-- ============================================

-- Add display_name column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create a function to sync display names from auth.users metadata
CREATE OR REPLACE FUNCTION sync_user_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is created/updated, sync their display name from auth metadata
  UPDATE users 
  SET display_name = (
    SELECT raw_user_meta_data->>'display_name'
    FROM auth.users 
    WHERE id = NEW.id
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync on user insert/update
DROP TRIGGER IF EXISTS sync_display_name_on_user_change ON users;
CREATE TRIGGER sync_display_name_on_user_change
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_display_name();

-- Sync existing users' display names
UPDATE users u
SET display_name = (
  SELECT COALESCE(au.raw_user_meta_data->>'display_name', au.email)
  FROM auth.users au
  WHERE au.id = u.id
);

-- Create simplified view for posts with user info
CREATE OR REPLACE VIEW posts_with_users AS
SELECT 
  p.*,
  u.display_name,
  u.points as user_points,
  u.avatar_url as user_avatar
FROM posts p
LEFT JOIN users u ON p.user_id = u.id;

-- Grant select on view
GRANT SELECT ON posts_with_users TO authenticated;
