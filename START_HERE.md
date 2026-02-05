# 🚀 START HERE - Feed Setup (2 Steps)

## Your 400 Error Fix

The error happens because the database isn't set up yet. Follow these 2 steps:

---

## Step 1: Run SQL (2 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy **ALL** of `COMPLETE_FEED_SETUP.sql`
5. Paste it in
6. Click **RUN** (or press Cmd/Ctrl + Enter)

✅ You should see "Success. No rows returned"

---

## Step 2: Create Storage Bucket (1 minute)

1. Still in Supabase Dashboard
2. Go to **Storage** (left sidebar)
3. Click **New Bucket**
4. Settings:
   - **Name**: `feed-media`
   - **Public bucket**: ✅ CHECK THIS BOX
5. Click **Create Bucket**

---

## Step 3: Test! (30 seconds)

1. Refresh your app (Cmd/Ctrl + R)
2. Go to Feed page
3. Should load now! 🎉

---

## If It Still Doesn't Work

Check the browser console (F12 → Console):

**Error: "relation posts_with_users does not exist"**
→ Run Step 1 again

**Error: "bucket feed-media not found"**  
→ Double-check the bucket name is exactly `feed-media`

**Still getting 400?**
→ Open Network tab (F12 → Network), find the red request, click it, check the Response tab for the actual error message

---

## What You'll Get

✅ Create posts with text  
✅ Upload images  
✅ Upload videos  
✅ Like/unlike posts  
✅ See everyone's posts  
✅ Instagram-style layout  

---

**Files:**
- `COMPLETE_FEED_SETUP.sql` ← Run this in SQL Editor
- `FIX_FEED_LOADING.md` ← Troubleshooting guide
- Your Feed page code is already updated ✅
