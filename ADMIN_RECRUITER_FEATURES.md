# Admin Recruiter Management - Feature Documentation

## Overview
Enhanced admin functionality to manage recruiters with **referral-only signup enforcement**.

## New Features

### 1. **Referral-Only Signup** ⚠️
**Location:** `/signup`

Users CANNOT sign up without a referral code:
- Form is disabled if no referral detected
- Warning message displayed: "Referral code required"
- Submit button shows "Referral Required" and is disabled
- Must use referral link `/join/{code}` to access signup

**Benefits:**
- Controlled growth through referrals only
- No orphaned users in the system
- Every user belongs to a recruiter's downline
- Maintains referral tree integrity

### 2. Enhanced User Promotion
**Location:** `/admin`

When promoting a user from "recruited" to "recruiter":
- Removes their `parent_id` (makes them independent)
- Changes role from `recruited` to `recruiter`
- Allows them to start their own recruiting network

**Usage:**
1. Go to Admin Panel
2. Search for a user or find them in "All Users"
3. Click "Promote to Recruiter"
4. User is now independent and can recruit others

### 3. Recruiters Overview Page
**Location:** `/admin/recruiters`

A dedicated page to view all recruiters and their downlines:
- Lists all users with `role = 'recruiter'`
- Shows display name, referral code, points, and join date
- Click any recruiter to expand and see their direct recruits
- View recruit details including role, points, and status

**Access:**
- From Admin Panel, click "View All Recruiters" button
- Or navigate directly to `/admin/recruiters`

## Technical Implementation

### Database Changes
**Migration:** `20250205_require_referral_signup.sql`

The `handle_new_user()` trigger now:
```sql
1. Checks for parent_id in user metadata (from referral link)
2. Sets role to 'recruited' if parent exists
3. Falls back to 'recruiter' if no parent (shouldn't happen)
4. Inserts user with proper parent_id and role
```

### Frontend Changes

#### SignUp.jsx Updates
- Added validation: blocks signup without referral code
- Disabled all form inputs when no referral detected
- Visual warning message when no referral
- Submit button disabled and shows "Referral Required"

#### Admin.jsx Updates
- Added `parent_id: null` to promotion update
- Added "View All Recruiters" button
- Updated confirmation message

#### New Component: Recruiters.jsx
- Fetches all recruiters with their data
- Expandable sections to show each recruiter's downline
- Real-time recruit count
- Clean, organized UI

#### App.jsx Updates
- Added route `/admin/recruiters`
- Imported Recruiters component

## Setup Instructions

### 1. Apply Database Migration
```bash
./require-referral-signup.sh
```

Or manually run the SQL file in Supabase SQL Editor:
```bash
supabase/migrations/20250205_require_referral_signup.sql
```

### 2. Test the Features

**Test Referral-Only Signup:**
1. Go directly to `/signup` (no referral link)
2. Form should be disabled with warning message
3. Try a referral link `/join/ABC123`
4. Form should be enabled with green success message

**Test Promotion:**
1. Sign up as a user with a referral code
2. As admin, go to `/admin`
3. Search for the user
4. Promote to recruiter
5. Verify `parent_id` is NULL in database

**Test Recruiters Page:**
1. Go to `/admin/recruiters`
2. See all recruiters listed
3. Click any recruiter to expand
4. View their direct recruits
5. Check recruit details (role, points, etc.)

## User Flow Examples

### Scenario 1: Direct Signup Attempt (Blocked)
```
User visits /signup directly
↓
No referral code detected
↓
Form is disabled with warning
↓
Submit button shows "Referral Required"
↓
User cannot create account
```

### Scenario 2: Referral Signup (Success)
```
User clicks referral link /join/ABC123
↓
parent_id stored in localStorage
↓
Redirected to /signup with enabled form
↓
User signs up successfully
↓
Trigger gets parent_id from metadata
↓
User created with role='recruited', parent_id=recruiter_id
↓
Points distributed up the chain
↓
User appears in recruiter's downline
```

### Scenario 3: Promote to Recruiter
```
Admin finds recruited user in /admin
↓
Clicks "Promote to Recruiter"
↓
Update: role='recruiter', parent_id=NULL
↓
User is now independent
↓
User appears in /admin/recruiters list
↓
Can start recruiting their own team
```

## Database Schema Updates

### users table
- `parent_id`: Can be NULL for independent recruiters and admin
- `role`: 'admin' | 'recruiter' | 'recruited'
- `display_name`: User's display name (from metadata or email)
- `points`: Points earned from recruiting

### Key Relationships
```
admin (parent_id=NULL, role='admin')
  └─> Can promote users to recruiter
  
recruiter_1 (parent_id=NULL, role='recruiter')
  └─> recruited_user_1 (parent_id=recruiter_1_id, role='recruited')
  └─> recruited_user_2 (parent_id=recruiter_1_id, role='recruited')

recruiter_2 (parent_id=NULL, role='recruiter')
  └─> recruited_user_3 (parent_id=recruiter_2_id, role='recruited')
      └─> (if promoted, becomes independent recruiter with parent_id=NULL)
```

## API Functions Used

### isAdmin(userId)
Checks if user has admin role

### supabase.from('users').select()
- `.eq('role', 'recruiter')` - Get all recruiters
- `.eq('parent_id', recruiterId)` - Get recruits for a recruiter

### supabase.from('users').update()
- Update role and parent_id during promotion

## Security Considerations

1. **Admin Check:** All admin routes verify admin role before loading
2. **RLS Policies:** Ensure proper policies on users table
3. **Trigger Security:** Uses SECURITY DEFINER for elevated privileges
4. **Navigation Guard:** Redirects non-admins to dashboard

## Troubleshooting

### Issue: Users can't sign up
**Solution:** 
- Users MUST use a referral link `/join/{code}`
- Direct `/signup` access is blocked
- Share referral links to allow signups

### Issue: Form disabled on signup page
**Solution:**
- This is expected behavior without a referral code
- User needs to access via `/join/{referral_code}`
- Check that referral code exists in database

### Issue: Recruiters page empty
**Solution:**
- Verify users with role='recruiter' exist
- Check user has admin role
- Check browser console for errors
- Promote some users to recruiter first

### Issue: Promotion not working
**Solution:**
- Check RLS policies allow updates
- Verify admin permissions
- Check browser console for errors

## Future Enhancements

Potential improvements:
- Bulk promotion of users
- Reassign recruits from one recruiter to another
- Export recruiter data to CSV
- Advanced filtering on recruiters page
- Search functionality on recruiters page
- Recursive tree view showing full hierarchy

## Related Files

- `/src/pages/SignUp.jsx` - Signup page with referral requirement
- `/src/pages/Admin/Admin.jsx` - Main admin panel
- `/src/pages/Admin/Recruiters.jsx` - Recruiters overview
- `/src/App.jsx` - Routing configuration
- `/supabase/migrations/20250205_require_referral_signup.sql` - Database migration
- `/require-referral-signup.sh` - Migration helper script
