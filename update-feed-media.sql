-- ============================================
-- UPDATE POSTS TABLE FOR MEDIA SUPPORT
-- ============================================

-- Add media_type column if it doesn't exist
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', NULL));

-- Update the get_feed_posts function to include media_type
CREATE OR REPLACE FUNCTION get_feed_posts(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  user_display_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  user_points INT,
  content TEXT,
  image_url TEXT,
  media_type TEXT,
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  is_liked_by_user BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS post_id,
    p.user_id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email) AS user_display_name,
    au.email AS user_email,
    u.avatar_url AS user_avatar,
    COALESCE(u.points, 0) AS user_points,
    p.content,
    p.image_url,
    p.media_type,
    p.created_at,
    COALESCE(like_counts.count, 0) AS likes_count,
    COALESCE(comment_counts.count, 0) AS comments_count,
    CASE 
      WHEN p_user_id IS NOT NULL 
      THEN EXISTS(
        SELECT 1 FROM post_likes pl 
        WHERE pl.post_id = p.id AND pl.user_id = p_user_id
      )
      ELSE false
    END AS is_liked_by_user
  FROM posts p
  INNER JOIN auth.users au ON p.user_id = au.id
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM post_likes 
    GROUP BY post_id
  ) like_counts ON p.id = like_counts.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM post_comments 
    GROUP BY post_id
  ) comment_counts ON p.id = comment_counts.post_id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Note: Run this in the Supabase Dashboard under Storage

-- Create a storage bucket for feed media (if not exists)
-- This should be done in the Supabase Dashboard > Storage section
-- Bucket name: feed-media
-- Public: true (for viewing images/videos)

-- Storage RLS Policies (run after creating the bucket)
-- Anyone authenticated can upload files
CREATE POLICY "Users can upload feed media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feed-media');

-- Anyone can view files (public bucket)
CREATE POLICY "Anyone can view feed media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feed-media');

-- Users can delete their own files
CREATE POLICY "Users can delete their own feed media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
