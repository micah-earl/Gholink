# Quick Setup Guide

## 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project: Settings → API

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run these migrations in order:

### Migration 1: Initial Schema
Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

### Migration 2: Points Function
Copy and run the contents of `supabase/migrations/002_increment_points_function.sql`

## 3. Edge Function Setup (Optional but Recommended)

The points system requires the Edge Function to work properly.

### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project (get project ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy apply-recruit-points
```

### Option B: Manual Deployment

1. Go to **Edge Functions** in your Supabase dashboard
2. Click **Create a new function**
3. Name it: `apply-recruit-points`
4. Copy the contents of `supabase/functions/apply-recruit-points/index.ts`
5. Deploy

## 4. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## 5. Test the App

1. Sign up with a new account
2. Go to the Recruit page
3. Invite someone by email
4. The invite will be created as "pending"
5. (In production, the recruit would accept via email link)

## Troubleshooting

### "Table doesn't exist" errors
- Make sure you ran both migration SQL files
- Check that tables were created in the Supabase dashboard

### "Function not found" errors
- Make sure the Edge Function is deployed
- Check the function name matches exactly: `apply-recruit-points`

### Authentication issues
- Verify your Supabase URL and anon key in `.env`
- Make sure RLS policies are set up (they're included in the migration)

### Points not updating
- Check that the Edge Function is deployed and working
- Verify the function has the correct service role key set in environment variables

