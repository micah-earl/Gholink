#!/bin/bash

# =====================================================
# ROLLBACK TO PRE-POINTS SYSTEM STATE
# =====================================================
# This script removes all points system related files
# and applies the database rollback migration
# =====================================================

echo "🔄 Starting rollback to pre-points system state..."

# 1. Remove points-related documentation
echo "📄 Removing points documentation files..."
rm -f POINTS_SYSTEM.md
rm -f POINTS_SYSTEM_SUMMARY.md
rm -f POINTS_QUICKSTART.md
rm -f QUICK_START_POINTS.md
rm -f POINTS_LEADERBOARD_STATUS.md
rm -f FIX_POINTS_TABLE_ISSUE.md

# 2. Remove points-related setup scripts
echo "🗑️  Removing points setup scripts..."
rm -f setup-points-system.sh
rm -f apply-upline-migration.sh

# 3. Remove points-related frontend files
echo "🎨 Removing points frontend components..."
rm -f src/pages/Points.jsx
rm -f src/pages/PointsTest.jsx
rm -f src/pages/Leaderboards.jsx
rm -f src/components/ui/LeaderboardRow.jsx
rm -f src/lib/points.js

# 4. Remove points-related migrations (but keep the rollback)
echo "🗄️  Removing points migrations..."
rm -f supabase/migrations/20250129_add_points_system.sql
rm -f supabase/migrations/20250129_fix_points_integration.sql
rm -f supabase/migrations/002_increment_points_function.sql

# 5. Remove points-related edge functions
echo "⚡ Removing points edge functions..."
rm -rf supabase/functions/apply-recruit-points

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Apply the rollback migration to your Supabase database:"
echo "   - Open Supabase SQL Editor"
echo "   - Run: supabase/migrations/99999_rollback_points_system.sql"
echo ""
echo "2. Update any frontend components that reference points"
echo "   - Check ReferralDashboard.jsx"
echo "   - Check Dashboard.jsx"
echo "   - Check Navigation.jsx/Sidebar.jsx for points routes"
echo ""
echo "3. Restart your development server"
echo "   - npm run dev"
echo ""
