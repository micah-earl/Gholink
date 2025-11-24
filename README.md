# Gholink — DuoLingo-Style Social Recruiting App

A full-stack web application where recruiters can invite new recruits, earn points through a pyramid-style reward system, and view stats, recruits, and leaderboards — all using a fun, colorful DuoLingo-style UI with a YouTube Studio left sidebar layout.

## 🚀 Features

- **Dashboard**: View total points, recruit chain trace, stats, and activity
- **Recruit Page**: Invite new recruits via email, track pending and accepted invites
- **Leaderboard**: Ranked list of top recruiters based on total points
- **Points System**: Pyramid-style reward system where recruiters earn points when their recruits accept invites
- **DuoLingo-Style UI**: Bright, colorful, playful interface with rounded cards and friendly design

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom DuoLingo color scheme
- **Routing**: React Router
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and get your:
   - Project URL
   - Anon (public) key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_increment_points_function.sql`

### 4. Deploy Edge Function (Optional but Recommended)

The points system uses a Supabase Edge Function. To deploy it:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy apply-recruit-points
```

Alternatively, you can deploy it manually through the Supabase dashboard:
1. Go to Edge Functions in your Supabase dashboard
2. Create a new function called `apply-recruit-points`
3. Copy the contents of `supabase/functions/apply-recruit-points/index.ts`

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── DashboardCard.jsx      # Reusable dashboard stat card
│   │   ├── ChainTrace.jsx         # Recruit chain visualization
│   │   ├── RecruitModal.jsx       # Modal for inviting recruits
│   │   ├── InviteCard.jsx         # Card showing invite status
│   │   └── LeaderboardRow.jsx     # Leaderboard entry component
│   ├── Sidebar.jsx                # YouTube Studio-style sidebar
│   └── Navigation.jsx             # (Not used, kept for compatibility)
├── pages/
│   ├── Dashboard.jsx              # Main dashboard page
│   ├── Recruit.jsx                # Recruit management page
│   ├── Leaderboards.jsx           # Leaderboard page
│   ├── Landing.jsx                # Landing page
│   └── SignIn.jsx                 # Authentication page
├── lib/
│   ├── supabase.js                # Supabase client configuration
│   └── utils.js                   # Utility functions
└── App.jsx                        # Main app component with routing
```

## 🗄 Database Schema

### Tables

- **profiles**: User profiles with points and display info
- **recruits**: Recruit relationships (recruiter → recruit)
- **points_transactions**: History of all points awarded

See `supabase/migrations/001_initial_schema.sql` for full schema details.

## 🎮 Points System

When a recruit accepts an invite:
- The direct recruiter gets **1000 points**
- Their recruiter gets **500 points**
- The next level gets **250 points**
- Then **125**, **62**, **31**, etc.
- Points are halved each level until < 1 point

This is handled by the `apply-recruit-points` Edge Function.

## 🎨 Design System

- **Primary Green**: `#58CC02` (DuoLingo green)
- **Rounded Corners**: 16px border radius
- **Shadows**: Soft green-tinted shadows
- **Typography**: Bold, friendly fonts

## 🔐 Authentication

The app uses Supabase Auth. Users can:
- Sign up with email/password
- Sign in with existing accounts
- Profiles are automatically created on signup

## 📝 TODO / Future Enhancements

- [ ] Email notifications for invites (via Supabase Edge Function)
- [ ] Real-time updates using Supabase Realtime
- [ ] Profile picture uploads
- [ ] Advanced analytics and charts
- [ ] Recruit chain visualization improvements
- [ ] Mobile responsive optimizations
- [ ] Admin dashboard for managing users

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

MIT
