# Avatar Display Troubleshooting Guide

## Issue: Question mark showing instead of avatar image

### Steps to Debug:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors when the image loads
   - Check what URL is being used
   - Look for CORS or 403 errors

2. **Verify Supabase Storage Bucket is Public**
   
   Go to Supabase Dashboard → Storage → avatars bucket:
   
   - Click the bucket settings (⋮ menu)
   - Make sure "Public bucket" is enabled
   - If not, toggle it ON

3. **Check Storage Policies**
   
   Make sure these policies exist in Storage → Policies:
   
   ```sql
   -- Public read access
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

4. **Verify Upload Path**
   
   Files should be stored as: `avatars/{user_id}/avatar-{timestamp}.{ext}`
   
   Check in Supabase Storage UI that files are actually there.

5. **Test Public URL**
   
   Copy the avatar URL from browser console and try opening it in a new tab.
   - If it downloads the file → bucket might not be public
   - If it shows 403 → missing read policy
   - If it shows the image → frontend issue

6. **Common Fixes:**

   **A. Make bucket public:**
   - Go to Storage in Supabase
   - Click avatars bucket
   - Settings → Enable "Public bucket"

   **B. Add public read policy (if missing):**
   ```sql
   CREATE POLICY "Anyone can view avatars"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

   **C. Clear old policies and recreate:**
   - Delete all policies on storage.objects for 'avatars' bucket
   - Run the policies from `add-avatar-support.sql` again

7. **Alternative: Use signed URLs (if public doesn't work)**
   
   Change upload function to use signed URLs:
   ```javascript
   const { data, error } = await supabase.storage
     .from('avatars')
     .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year
   
   const signedUrl = data.signedUrl
   ```

## Current Implementation Details:

- Upload path: `{user_id}/avatar-{timestamp}.{ext}`
- Old avatars are deleted before uploading new ones
- Images resized to max 400px
- Converted to JPEG at 90% quality
- Error handling with console logs
- Fallback to initials if image fails to load

## Check These in Console:

When you upload, you should see:
```
Uploading to path: {user_id}/avatar-123456.jpg
Upload successful: {...}
Public URL: https://...
```

If any step fails, the error will show in the console.
