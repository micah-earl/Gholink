# Admin Panel - Quick Start Guide

## 🎯 What Was Built

You now have a complete **Admin Panel** that allows administrators to:
- Search for users by email
- View all user details and roles
- Promote "recruited" users to "recruiter" status
- Maintain the recruitment hierarchy

## 🏗️ System Architecture

### User Roles Explained

1. **Admin** 🟣
   - Can access the Admin Panel
   - Can promote users
   - Full system access

2. **Recruiter** 🔵
   - Can share referral links
   - People who sign up via their link become their recruits
   - Default role for new signups (if not using a referral link)

3. **Recruited** ⚪
   - Signed up via someone's referral link
   - Can still recruit others (but they're under the original recruiter's chain)
   - Can be promoted to Recruiter by an admin

### Hierarchical Structure

```
Admin/Recruiter (parent_id: NULL)
  ├── Recruited User A (parent_id: Recruiter's ID)
  │     ├── Sub-recruit 1 (parent_id: User A's ID)
  │     └── Sub-recruit 2 (parent_id: User A's ID)
  └── Recruited User B (parent_id: Recruiter's ID)

[If User A is promoted to Recruiter, they keep their parent_id]
```

## 🚀 Setup Instructions

### 1. Apply Database Migration

Run in your terminal:
```bash
cd /Users/micahearl/Documents/fullstack\ dev/Gholink
supabase db push
```

Or manually apply the migration file:
- `supabase/migrations/20250127_add_head_recruiter_function.sql`

### 2. Create Your First Admin

Open Supabase SQL Editor and run:
```sql
-- Replace with your actual email
UPDATE public.users 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your@email.com'
);
```

### 3. Access the Admin Panel

1. Build and run your app:
   ```bash
   npm run dev
   ```

2. Sign in with your admin account

3. You'll see a new "Admin" menu item in the sidebar (with shield icon 🛡️)

4. Click it to access `/admin`

## 📋 How to Use

### Search for a User
1. Enter their email in the search box
2. Click "Search" or press Enter
3. View their complete profile

### Promote a User
1. Search for the user or find them in "All Users" list
2. Click "Promote to Recruiter" button
3. Confirm the action
4. User's role will change from "recruited" to "recruiter"

### View All Users
- Scroll through the "All Users" section
- See role badges (color-coded)
- Quick-promote directly from the list

## 🔐 Security Features

- ✅ Only admins can access `/admin` route
- ✅ Admin menu item only visible to admins
- ✅ Confirmation dialog before promoting users
- ✅ Row Level Security enabled on database
- ✅ Protected routes redirect unauthorized users

## 🧪 Testing Checklist

- [ ] Sign up a new user without referral (should be "recruiter")
- [ ] Generate referral link from first user
- [ ] Sign up second user via referral link (should be "recruited")
- [ ] Make yourself an admin using SQL
- [ ] Access the admin panel
- [ ] Search for the recruited user by email
- [ ] Promote the recruited user to recruiter
- [ ] Verify promoted user can now recruit others
- [ ] Verify hierarchy is maintained (parent_id unchanged)

## 📝 Files Modified/Created

### New Files
- ✅ `src/pages/Admin/Admin.jsx` - Admin panel component
- ✅ `supabase/migrations/20250127_add_head_recruiter_function.sql` - DB function
- ✅ `make-admin.sql` - Helper SQL script
- ✅ `ADMIN_PANEL.md` - Full documentation
- ✅ `ADMIN_QUICKSTART.md` - This file

### Modified Files
- ✅ `src/App.jsx` - Added /admin route
- ✅ `src/components/Sidebar.jsx` - Added admin menu item
- ✅ `src/lib/referrals.js` - Added helper functions

## 🎨 UI Features

- **Search Section**: Email-based user lookup
- **User Details Card**: Shows role, ID, referral code, parent ID
- **Role Badges**: Color-coded (Purple=Admin, Blue=Recruiter, Gray=Recruited)
- **All Users List**: Scrollable, sortable user directory
- **Quick Actions**: One-click promote buttons
- **Success/Error Messages**: User-friendly feedback
- **Confirmation Dialogs**: Prevent accidental changes

## 🔧 Troubleshooting

### Admin menu not showing?
- Verify your role in database: `SELECT role FROM users WHERE id = 'your-id'`
- Should be `'admin'`, not `'recruiter'` or `'recruited'`

### Can't search users?
- Ensure you have admin API access in Supabase
- Check browser console for errors
- Verify Supabase connection

### Migration errors?
- Check if migration already applied: `supabase db status`
- Manually run SQL in Supabase SQL Editor

### Build errors?
- Clear cache: `rm -rf node_modules dist && npm install`
- Rebuild: `npm run build`

## 🎉 You're All Set!

The admin panel is now ready to use. You can manage your user hierarchy and promote recruited users to recruiters while maintaining the complete recruitment chain.

For detailed documentation, see `ADMIN_PANEL.md`.
