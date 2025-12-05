# Quick Start - Referral-Only Signup & Admin Features

## What Changed

### 1. **Referral-Only Signup** 🔒
Users CANNOT sign up without a referral code. Direct `/signup` access shows disabled form with warning.

### 2. **Promote to Recruiter** - Now removes parent_id
When you promote a "recruited" user to "recruiter", they become independent (parent_id set to NULL).

### 3. **New Page: Recruiters Overview** (`/admin/recruiters`)
- View all recruiters in your system
- Click any recruiter to expand and see their direct recruits
- See display names, points, join dates
- Access via button in Admin Panel

## How to Use

### Share Referral Links
Users can ONLY sign up via referral links:
- Format: `yourdomain.com/join/{referral_code}`
- Each recruiter has their own code
- View codes in `/admin` or `/recruit`

### View All Recruiters
1. Go to `/admin`
2. Click "View All Recruiters" button
3. Click any recruiter to expand their downline

### Promote a User
1. Go to `/admin`
2. Search for user or find in list
3. Click "Promote to Recruiter"
4. User is now independent (parent_id removed)

### Apply Database Updates
```bash
# Run the migration
./require-referral-signup.sh

# Or manually apply the SQL
# File: supabase/migrations/20250205_require_referral_signup.sql
```

## Testing

### Test Referral Requirement
1. Go to `/signup` directly (no referral)
2. Form should be disabled with red warning
3. Button shows "Referral Required"
4. Cannot submit

### Test Referral Signup
1. Use referral link `/join/ABC123`
2. Should redirect to signup with green message
3. Form should be enabled
4. Can create account

### Test Promotion
1. Create a recruited user
2. Promote them in `/admin`
3. Check `/admin/recruiters` - they should now appear as a recruiter
4. Verify in database: `parent_id` should be NULL

## Files Changed

- ✅ `/src/pages/SignUp.jsx` - Added referral requirement validation
- ✅ `/src/pages/Admin/Admin.jsx` - Updated promotion logic + button
- ✅ `/src/pages/Admin/Recruiters.jsx` - NEW page
- ✅ `/src/App.jsx` - Added route for recruiters page
- ✅ `/supabase/migrations/20250205_require_referral_signup.sql` - NEW migration

## Documentation

Full details in: `ADMIN_RECRUITER_FEATURES.md`

## Status

✅ Build successful
✅ All changes implemented
⚠️ Migration needs to be applied to database

## Important Notes

⚠️ **Referral Required:** After this update, users MUST have a referral link to sign up. Make sure existing users know to share their referral links!

🔗 **How Users Get Referral Links:**
- Each user has a unique referral code
- Find it on Dashboard or Recruit page
- Share link: `yourdomain.com/join/{code}`
