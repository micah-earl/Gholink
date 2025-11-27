# Admin Panel Documentation

## Overview
The Admin Panel allows administrators to manage user roles and promote recruited users to recruiter status.

## Features

### 1. **User Search by Email**
- Search for any user by their email address
- View complete user details including:
  - User ID
  - Current role (Admin/Recruiter/Recruited)
  - Referral code
  - Parent recruiter ID
  - Account creation date

### 2. **Promote Users to Recruiter**
- Promote "recruited" users to "recruiter" status
- Allows recruited users to start their own recruitment chains
- Maintains the hierarchical structure (they keep their parent_id)

### 3. **View All Users**
- See complete list of all users in the system
- Sort by creation date (newest first)
- Quick-promote users directly from the list
- Color-coded role badges for easy identification

## Access Control

### Making a User an Admin
1. Access your Supabase SQL Editor
2. Run the following query:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

Or use the helper script: `/make-admin.sql`

### Admin Menu Visibility
- The Admin menu item only appears in the sidebar for users with role = 'admin'
- Non-admin users cannot access the `/admin` route
- Attempting to access without admin privileges redirects to dashboard

## Hierarchical Recruitment System

### How It Works

1. **Initial Signup (No Referral)**
   - User signs up without a referral link
   - Automatically assigned role: `recruiter`
   - `parent_id`: NULL (top of chain)

2. **Signup via Referral Link**
   - User clicks a recruiter's referral link
   - Automatically assigned role: `recruited`
   - `parent_id`: Set to the recruiter's ID
   - Can still recruit others, but they remain under the original recruiter's chain

3. **Promoted Recruited User**
   - Admin promotes recruited user to recruiter
   - Role changes from `recruited` to `recruiter`
   - `parent_id` remains unchanged (maintains chain hierarchy)
   - Can now recruit independently but still attributed to head recruiter

### Head Recruiter Tracking
Use the database function to find the top-level recruiter for any user:

```sql
SELECT * FROM get_head_recruiter('user-uuid-here');
```

This recursively traverses up the parent_id chain to find the original recruiter.

## Database Functions

### `get_head_recruiter(user_id UUID)`
Returns the top-level recruiter in a user's chain.

**Usage:**
```javascript
import { getHeadRecruiter } from '../lib/referrals'

const { data, error } = await getHeadRecruiter(userId)
```

### `promoteToRecruiter(userId)`
Updates a user's role from 'recruited' to 'recruiter'.

**Usage:**
```javascript
import { promoteToRecruiter } from '../lib/referrals'

const { data, error } = await promoteToRecruiter(userId)
```

## API Permissions

The Admin page requires:
- Authenticated user session
- Admin role in users table
- Access to `supabase.auth.admin.listUsers()` for email search

## UI Components

### Admin Panel Layout
1. **Header** - Shield icon with title and description
2. **Search Section** - Email input with search functionality
3. **User Details Card** - Displays found user information
4. **All Users List** - Scrollable list of all users with quick actions

### Role Badges
- 🟣 **Admin** - Purple badge with crown icon
- 🔵 **Recruiter** - Blue badge
- ⚪ **Recruited** - Gray badge

### Actions
- **Promote to Recruiter** button only shows for users with 'recruited' role
- Confirmation dialog before promoting
- Success/error messages for user feedback

## Security Considerations

1. **Row Level Security (RLS)** - Already configured on users table
2. **Route Protection** - Admin route redirects non-admins
3. **UI Protection** - Admin menu only visible to admins
4. **Confirmation Dialogs** - Prevents accidental role changes

## Testing the Feature

1. Create two test accounts
2. Make one an admin using SQL
3. Use the other to sign up via referral
4. Login as admin and promote the recruited user
5. Verify the promoted user can now recruit others

## Future Enhancements

Potential additions:
- Bulk promote users
- Demote recruiters back to recruited
- View detailed recruitment chains
- Analytics on recruitment performance
- Email notifications for promotions
