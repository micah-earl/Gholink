# 📦 Storage Bucket Setup Guide

## Step 1: Create the Storage Bucket

1. Go to your **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter these settings:
   - **Name:** `feed-media`
   - **Public bucket:** ✅ YES (check this box)
   - **File size limit:** 50MB (optional)
   - **Allowed MIME types:** Leave empty for now
5. Click **Create bucket**

## Step 2: Run the SQL for RLS Policies

After creating the bucket, go to **SQL Editor** and run this:

```sql
-- Storage RLS Policies for feed-media bucket

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

-- Users can update their own files  
CREATE POLICY "Users can update their own feed media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Run the Posts Table Update

In **SQL Editor**, run the migration from `update-feed-media.sql`:

```sql
-- Add media_type column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', NULL));
```

Then update the function (copy from `update-feed-media.sql`).

## Step 4: Test It!

1. Log in to your app
2. Go to the Feed page
3. Click the image/video icon
4. Select an image or video
5. Add optional text
6. Click Post
7. Watch it upload and appear in the feed!

## ✅ What You Should See

After setup, your feed will have:
- ✅ Image upload button
- ✅ Video upload button  
- ✅ Preview before posting
- ✅ Upload progress bar
- ✅ Instagram-style media display
- ✅ Full-width images/videos
- ✅ Video controls (play, pause, etc.)

## 📸 Supported Formats

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- WebM (.webm)
- QuickTime (.mov)

**Size Limit:** 50MB per file

## 🔐 Security

Files are stored with this structure:
```
feed-media/
  ├── {user-id}/
  │   ├── {timestamp}.jpg
  │   ├── {timestamp}.mp4
  │   └── ...
```

Users can only delete their own files, but everyone can view all files (public bucket).

## 🐛 Troubleshooting

### "Bucket not found" error
- Make sure you created the bucket named exactly `feed-media`
- Check it's marked as public

### "Permission denied" uploading
- Run the RLS policies SQL above
- Make sure you're logged in

### Images not showing
- Check the bucket is public
- Verify the file uploaded successfully in Storage tab
- Check browser console for errors

### "File too large" error
- Files must be under 50MB
- Try compressing the image/video

## 📝 Files to Run in Order

1. ✅ `create-feed-tables.sql` (if not already done)
2. ✅ Create `feed-media` bucket in Dashboard
3. ✅ Run storage RLS policies (above)
4. ✅ Run `update-feed-media.sql`
5. ✅ Test the app!

That's it! Your Instagram-style feed with media uploads is ready! 🎉
