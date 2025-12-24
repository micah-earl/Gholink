# Avatar Upload Feature Implementation

## Database Changes

### 1. Run the SQL migration
Execute `add-avatar-support.sql` in your Supabase SQL Editor to:
- Add `avatar_url` column to the `users` table
- Set up Row Level Security (RLS) policies for the avatars bucket

### Storage Policies Created:
1. **Upload Policy**: Users can only upload to their own folder (`/user_id/`)
2. **Update Policy**: Users can only update their own avatars
3. **Delete Policy**: Users can only delete their own avatars
4. **Read Policy**: Anyone can view avatars (public read access)

## Frontend Changes

### Account Page Updates (`src/pages/Account.jsx`)
Added:
- Avatar display with image or fallback to initials
- Upload button overlay (camera icon on hover)
- File input handling for image uploads
- Upload progress indicator (spinner)
- Automatic profile refresh after upload

### Features:
- ✅ Click avatar to upload photo
- ✅ Shows uploaded image or initials
- ✅ Hover effect with camera icon
- ✅ Loading state during upload
- ✅ Automatic URL update in database
- ✅ RLS ensures users can only upload their own photos

## How It Works:

1. User clicks on their avatar
2. File picker opens (images only)
3. Image uploads to: `avatars/{user_id}/avatar.{ext}`
4. Public URL is generated
5. User's `avatar_url` field is updated
6. Avatar displays immediately

## Org Chart Integration:
The avatar will automatically appear in the org chart modal cards since they already check for `user.avatar_url`!

## Next Steps:
1. Run the SQL migration in Supabase
2. Test uploading an avatar on the Account page
3. Check that it appears in the org chart modal

## Security Notes:
- Users can ONLY upload to their own folder (enforced by RLS)
- Files are stored as: `{user_id}/avatar.{extension}`
- Old avatars are automatically replaced (upsert: true)
- Public read access allows avatars to be displayed anywhere
