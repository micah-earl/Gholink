# Referral System Documentation

## Overview

This is a complete referral-based recruiting system built with React (Vite) and Supabase. The system allows users to recruit others through unique referral links, forming a hierarchical tree structure.

## Features

✅ **Unique Referral Codes**: Auto-generated 8-character codes for each user  
✅ **Referral Links**: Shareable links like `https://yourapp.com/join/ABC12345`  
✅ **Hierarchical Tree**: Parent-child relationships with unlimited depth  
✅ **Recursive Queries**: Fetch entire referral trees using PostgreSQL CTEs  
✅ **Role-Based System**: Admin, Recruiter, and Recruited roles  
✅ **Real-time Stats**: Direct recruits and total network counts  
✅ **Tree Visualization**: Interactive expandable tree view  

---

## Database Schema

### `users` Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'recruiter', 'recruited')),
  parent_id UUID REFERENCES public.users(id),
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: UUID referencing Supabase auth.users
- `role`: User type (admin/recruiter/recruited)
- `parent_id`: ID of the user who recruited this user (nullable)
- `referral_code`: Unique 8-character code (auto-generated)
- `created_at`: Account creation timestamp

---

## Database Functions (RPC)

### 1. `get_referral_tree(recruiter_id)`
Returns entire referral tree starting from a user.

```sql
SELECT * FROM get_referral_tree('user-uuid-here');
```

**Returns:**
- `id`, `role`, `parent_id`, `referral_code`, `created_at`, `level`

### 2. `get_direct_recruits_count(recruiter_id)`
Returns count of users directly recruited by this user.

```sql
SELECT get_direct_recruits_count('user-uuid-here');
```

### 3. `get_total_recruits_count(recruiter_id)`
Returns count of all users in the tree (all levels).

```sql
SELECT get_total_recruits_count('user-uuid-here');
```

### 4. `generate_referral_code()`
Auto-generates unique 8-character referral code.

---

## Frontend Components

### Pages

#### 1. **SignUp.jsx** (`/signup`)
- Email/password signup form
- Checks localStorage for `referrer_id` from referral link
- Creates user with appropriate role and parent_id
- Auto-generates referral code via database trigger

#### 2. **ReferralLanding.jsx** (`/join/:referral_code`)
- Validates referral code
- Displays invitation message
- Stores referrer info in localStorage
- Redirects to signup

#### 3. **ReferralDashboard.jsx** (`/referrals`)
- Shows user's referral code and shareable link
- Displays statistics (direct recruits, total network)
- Renders interactive referral tree
- Copy-to-clipboard functionality

---

## How It Works

### User Flow

#### **1. Recruiter shares link**
```
User A (recruiter) shares: https://myapp.com/join/ABC12345
```

#### **2. New user visits link**
- ReferralLanding validates code `ABC12345`
- Stores recruiter ID in localStorage
- Shows invitation page

#### **3. New user signs up**
- SignUp page reads recruiter ID from localStorage
- Creates auth user
- Creates users table entry:
  ```javascript
  {
    id: new_user_id,
    role: 'recruited',
    parent_id: recruiter_id,
    referral_code: auto_generated
  }
  ```

#### **4. User becomes recruiter**
- Gets their own unique referral code
- Can now recruit others
- New recruits become their children in the tree

---

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration file in Supabase SQL Editor:

```bash
supabase/migrations/20250126_create_users_table.sql
```

This creates:
- `users` table
- Row Level Security policies
- RPC functions
- Triggers for auto-generating codes

### 2. Install Dependencies

Already included in your package.json:
```bash
npm install
```

### 3. Configure Routes

Routes are already added to `App.jsx`:
- `/signup` - SignUp page
- `/join/:referral_code` - Referral landing
- `/recruit` - Combined Recruit & Referrals dashboard

### 4. Test the System

1. **Create first user** (becomes recruiter):
   ```
   Visit: http://localhost:5173/signup
   Sign up normally (no referral link)
   Role: 'recruiter'
   ```

2. **Check referral code**:
   ```
   Visit: http://localhost:5173/recruit
   Scroll to see your referral link and tree
   Copy your referral link
   ```

3. **Test referral signup**:
   ```
   Open incognito/private window
   Visit: http://localhost:5173/join/YOUR_CODE
   Sign up
   Role: 'recruited'
   ```

4. **View tree**:
   ```
   Go back to first user's /recruit page
   Scroll down to see new recruit in tree
   ```

---

## API Usage Examples

### JavaScript/React

```javascript
import { supabase } from './lib/supabase'

// Get user's referral data
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Get referral tree
const { data: tree } = await supabase
  .rpc('get_referral_tree', { recruiter_id: userId })

// Get recruit counts
const { data: directCount } = await supabase
  .rpc('get_direct_recruits_count', { recruiter_id: userId })

const { data: totalCount } = await supabase
  .rpc('get_total_recruits_count', { recruiter_id: userId })

// Validate referral code
const { data: recruiter } = await supabase
  .from('users')
  .select('*')
  .eq('referral_code', code)
  .single()
```

---

## Helper Functions

All helper functions are in `src/lib/referrals.js`:

```javascript
import {
  getUserReferralData,
  validateReferralCode,
  getReferralTree,
  getDirectRecruitsCount,
  getTotalRecruitsCount,
  createUserWithReferral,
  generateReferralLink,
  storeReferrerInfo,
  clearReferrerInfo,
} from './lib/referrals'
```

---

## Security (Row Level Security)

The system uses Supabase RLS policies:

1. **Users can view own data**
2. **Users can view their recruits** (entire tree)
3. **Anyone can lookup referral codes** (needed for public signup)
4. **Users can update own data**

All policies are defined in the migration file.

---

## Tree Structure Example

```
User A (recruiter)
├── User B (recruited by A)
│   ├── User C (recruited by B)
│   └── User D (recruited by B)
└── User E (recruited by A)
    └── User F (recruited by E)
```

**Query Result:**
```javascript
[
  { id: 'A', level: 0, parent_id: null },
  { id: 'B', level: 1, parent_id: 'A' },
  { id: 'E', level: 1, parent_id: 'A' },
  { id: 'C', level: 2, parent_id: 'B' },
  { id: 'D', level: 2, parent_id: 'B' },
  { id: 'F', level: 2, parent_id: 'E' },
]
```

---

## Customization

### Change Referral Code Length

In `20250126_create_users_table.sql`:
```sql
-- Change from 8 to desired length
code := upper(substring(md5(random()::text) from 1 for 12));
```

### Add Custom Domain

In `ReferralDashboard.jsx`:
```javascript
const referralLink = `https://yourcustomdomain.com/join/${userData.referral_code}`
```

### Modify Roles

Add new roles in the CHECK constraint:
```sql
role TEXT CHECK (role IN ('admin', 'recruiter', 'recruited', 'manager'))
```

---

## Testing Checklist

- [ ] First user can sign up without referral
- [ ] First user gets referral code
- [ ] Referral link validates correctly
- [ ] Second user can sign up via referral link
- [ ] Second user has correct parent_id
- [ ] Tree shows both users
- [ ] Direct count = 1
- [ ] Total count = 1
- [ ] Third user via second user's link (nested)
- [ ] Tree shows all 3 levels
- [ ] Copy link button works
- [ ] Invalid referral code shows error

---

## Troubleshooting

### Issue: Referral code not generating
**Solution:** Check trigger is installed:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'trigger_auto_referral_code';
```

### Issue: Can't fetch tree
**Solution:** Check RPC function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'get_referral_tree';
```

### Issue: RLS blocking queries
**Solution:** Ensure policies are enabled:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## Production Considerations

1. **Indexes**: Already added on `parent_id` and `referral_code`
2. **Rate Limiting**: Add rate limits to signup endpoint
3. **Referral Fraud**: Monitor suspicious patterns (same IP, rapid signups)
4. **Analytics**: Track conversion rates by referral code
5. **Rewards**: Integrate points/rewards for successful referrals

---

## Next Steps

Potential enhancements:
- [ ] Email notifications for new recruits
- [ ] Referral leaderboard
- [ ] Referral rewards/bonuses
- [ ] CSV export of tree
- [ ] Admin panel for managing users
- [ ] Analytics dashboard
- [ ] Referral campaigns with expiration
- [ ] Multi-level rewards (MLM style)

---

## Support

For issues or questions:
1. Check Supabase logs: Project → Database → Logs
2. Check browser console for errors
3. Verify RLS policies are correct
4. Test SQL queries directly in Supabase SQL Editor

---

## Files Created

```
supabase/migrations/20250126_create_users_table.sql  (Database)
src/pages/SignUp.jsx                                  (Signup with referral)
src/pages/ReferralLanding.jsx                        (Join page)
src/pages/ReferralDashboard.jsx                      (Tree & stats)
src/lib/referrals.js                                 (Helper functions)
REFERRAL_SYSTEM.md                                   (This file)
```

Updated files:
```
src/App.jsx                                          (Added routes)
src/components/Sidebar.jsx                           (Added Referrals link)
src/pages/SignIn.jsx                                 (Link to signup)
```

---

## License

Part of the Gholink recruiting platform.
