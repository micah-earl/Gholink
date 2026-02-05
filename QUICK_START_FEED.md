# 🚀 Quick Start: Feed System

## Step 1: Run SQL Migration

Copy everything from `create-feed-tables.sql` and run it in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste the SQL from `create-feed-tables.sql`
4. Click "Run"

## Step 2: Test It Out

1. Log in to your app
2. Go to `/feed` page
3. Type a post and click "Post"
4. Like/unlike posts
5. Watch real-time updates!

## 🎉 That's It!

Your feed is now connected to the database. All posts, likes, and comments are saved in Supabase.

## What You Get

✅ **Create Posts** - Users can share updates  
✅ **Like Posts** - Click heart to like/unlike  
✅ **View Feed** - See all posts from network  
✅ **User Info** - Avatar, name, points displayed  
✅ **Time Stamps** - "2m ago", "5h ago", etc.  
✅ **Optimistic UI** - Instant feedback on actions  
✅ **Secure** - RLS policies protect user data  

## Database Tables Created

- `posts` - All user posts
- `post_likes` - Who liked what
- `post_comments` - Comments (ready for future)

## Helper Functions

- `get_feed_posts()` - Fetch feed with all info
- `toggle_post_like()` - Like/unlike posts efficiently

---

**Need Help?** Check `FEED_DATABASE_SETUP.md` for full documentation
