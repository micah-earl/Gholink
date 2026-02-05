# ⚡ Quick Setup: Instagram-Style Feed with Media

## 3-Step Setup (5 minutes)

### Step 1: Create Storage Bucket (2 min)
1. Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `feed-media`
4. Check **Public bucket** ✅
5. Click **Create**

### Step 2: Run SQL (2 min)
Go to **SQL Editor** and run:

```sql
-- Add media support
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_type TEXT 
CHECK (media_type IN ('image', 'video', NULL));

-- Copy and run the updated get_feed_posts function 
-- from update-feed-media.sql (lines 12-68)

-- Storage policies
CREATE POLICY "Users can upload feed media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'feed-media');

CREATE POLICY "Anyone can view feed media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'feed-media');

CREATE POLICY "Users can delete their own feed media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'feed-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 3: Test (1 min)
1. Open your app
2. Go to Feed page
3. Click 📷 or 🎥 button
4. Select image/video
5. Click **Post**
6. See it live! 🎉

## ✅ What You Get

- 📸 **Image uploads** - JPEG, PNG, GIF, WebP
- 🎥 **Video uploads** - MP4, WebM, MOV
- 🖼️ **Instagram layout** - Full-width media, black background
- ❤️ **Like system** - Already working
- 📊 **Progress bar** - Visual upload feedback
- 👁️ **Preview** - See media before posting
- 🔒 **Secure** - RLS policies protect data

## 🎨 How It Looks

**Before posting:**
```
[Your avatar] [Caption text...]
              [Image preview with X]
              [Progress: ████████ 100%]
[📷] [🎥]                    [Post →]
```

**In feed:**
```
┌──────────────────────────┐
│ �� Name • 2m ago • 100pts│
├──────────────────────────┤
│   ▓▓▓ FULL IMAGE ▓▓▓    │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │
├──────────────────────────┤
│ ❤️ 💬 ↗️              🔖 │
│ 42 likes                 │
│ Name: Great photo!       │
└──────────────────────────┘
```

## 📁 Files to Check

- `STORAGE_BUCKET_SETUP.md` - Detailed setup guide
- `update-feed-media.sql` - Full SQL migration
- `MEDIA_FEED_SUMMARY.md` - Complete documentation
- `src/pages/Feed.jsx` - Already updated! ✅

---

**That's it!** Your Instagram-style feed is ready to go! 🚀
