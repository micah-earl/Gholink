# Feed System Database Setup Guide

## 🗄️ Database Setup Instructions

### Step 1: Run the SQL Migration

You need to execute the SQL file in your Supabase project to create all the necessary tables and functions.

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `create-feed-tables.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 2: Verify Tables Were Created

In the Supabase dashboard, go to **Table Editor** and verify you see:
- ✅ `posts`
- ✅ `post_likes`
- ✅ `post_comments`

### Step 3: Test the System

After running the migration:
1. Start your app: `npm run dev`
2. Log in to your account
3. Navigate to the Feed page
4. Try creating a post
5. Try liking/unliking posts

## 📊 Database Schema

### Posts Table
```sql
posts (
  id UUID PRIMARY KEY,
  user_id UUID (references auth.users),
  content TEXT,
  image_url TEXT (optional),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Post Likes Table
```sql
post_likes (
  id UUID PRIMARY KEY,
  post_id UUID (references posts),
  user_id UUID (references auth.users),
  created_at TIMESTAMPTZ,
  UNIQUE(post_id, user_id)
)
```

### Post Comments Table
```sql
post_comments (
  id UUID PRIMARY KEY,
  post_id UUID (references posts),
  user_id UUID (references auth.users),
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## 🔐 Security (RLS Policies)

All tables have Row Level Security (RLS) enabled with these policies:

### Posts
- ✅ Anyone authenticated can **view** all posts
- ✅ Users can **create** their own posts
- ✅ Users can **update** only their own posts
- ✅ Users can **delete** only their own posts

### Post Likes
- ✅ Anyone authenticated can **view** likes
- ✅ Users can **like** any post
- ✅ Users can **unlike** their own likes

### Post Comments
- ✅ Anyone authenticated can **view** comments
- ✅ Users can **create** comments
- ✅ Users can **update** only their own comments
- ✅ Users can **delete** only their own comments

## 🚀 Helper Functions

### `get_feed_posts()`
Retrieves posts with all necessary information in a single query:
- User information (name, email, avatar, points)
- Like count
- Comment count
- Whether current user has liked the post

**Usage:**
```javascript
const { data, error } = await supabase.rpc('get_feed_posts', {
  p_user_id: currentUserId,
  p_limit: 20,
  p_offset: 0
})
```

### `toggle_post_like()`
Efficiently toggles a like on a post (like if not liked, unlike if already liked):

**Usage:**
```javascript
const { error } = await supabase.rpc('toggle_post_like', {
  p_post_id: postId,
  p_user_id: currentUserId
})
```

## 📝 Feed.jsx Features

### Create Post
- Textarea input with character preview
- Disabled state while posting
- Loading indicator
- Auto-refresh after posting

### View Posts
- Displays user info with avatar
- Shows points badge
- Time ago formatting (2m ago, 5h ago, etc.)
- Like/comment counts
- Like button with heart fill animation

### Like/Unlike
- Optimistic UI updates (instant feedback)
- Reverts if error occurs
- Toggle function (like ↔ unlike)
- Visual feedback (red background + filled heart)

### Post Display
- User avatar with initials
- Display name or email fallback
- Relative timestamps
- Points display
- Content with preserved line breaks
- Optional image display (ready for future)

## 🎨 UI Features

- **Loading State**: Spinner while fetching posts
- **Empty State**: Friendly message when no posts exist
- **Optimistic Updates**: UI updates immediately before server confirms
- **Error Handling**: Alerts on failures, reverts optimistic updates
- **Responsive Design**: Works on mobile and desktop
- **Smooth Animations**: Transitions on all interactions

## 🔄 Data Flow

### Creating a Post
```
1. User types in textarea
2. Clicks "Post" button
3. Button shows loading state
4. Insert into posts table
5. Refresh feed with new post
6. Scroll to top (optional)
```

### Liking a Post
```
1. User clicks Like button
2. UI updates immediately (optimistic)
3. Call toggle_post_like function
4. If error, revert UI change
5. If success, keep UI change
```

### Loading Feed
```
1. Component mounts
2. Show loading spinner
3. Call get_feed_posts function
4. Receive posts with all data
5. Update UI with posts
6. Hide loading spinner
```

## 🐛 Troubleshooting

### "Permission denied" errors
- Check that RLS policies are created
- Verify user is authenticated
- Check that functions have GRANT EXECUTE

### Posts not showing up
- Verify data exists: `SELECT * FROM posts;`
- Check function output: `SELECT * FROM get_feed_posts(null, 20, 0);`
- Confirm user is logged in

### Likes not working
- Check post_likes table: `SELECT * FROM post_likes;`
- Verify UNIQUE constraint exists
- Test toggle function manually in SQL editor

### Functions not found
- Re-run the SQL migration
- Check function exists: `\df` in psql
- Verify GRANT permissions were applied

## 🚀 Next Steps

1. **Image Upload**: Add image upload to posts
2. **Comments**: Implement comment threads
3. **Notifications**: Notify users of likes/comments
4. **Real-time**: Use Supabase Realtime for live updates
5. **Pagination**: Implement infinite scroll
6. **Share**: Add share functionality
7. **Bookmarks**: Save posts for later
8. **Hashtags**: Tag posts with topics
9. **Mentions**: @mention other users
10. **Post Editing**: Allow users to edit their posts

## 📦 Files Created/Modified

1. ✅ `create-feed-tables.sql` - Database migration
2. ✅ `src/pages/Feed.jsx` - Updated with database integration
3. ✅ `FEED_DATABASE_SETUP.md` - This guide

## ✨ Summary

You now have a fully functional social media feed system with:
- ✅ Post creation
- ✅ Post viewing with user info
- ✅ Like/unlike functionality
- ✅ Comment infrastructure (ready for implementation)
- ✅ Secure RLS policies
- ✅ Optimized database queries
- ✅ Beautiful, responsive UI

Just run the SQL migration in Supabase and you're ready to go! 🎉
