#!/bin/bash

# Script to apply the upline function migration

echo "Applying upline function migration..."
echo ""
echo "You can run this migration in one of two ways:"
echo ""
echo "1. Using Supabase CLI:"
echo "   supabase db push"
echo ""
echo "2. Manually in Supabase Dashboard:"
echo "   - Go to your Supabase project dashboard"
echo "   - Navigate to SQL Editor"
echo "   - Copy and paste the contents of: supabase/migrations/20250129_add_upline_function.sql"
echo "   - Click 'Run'"
echo ""
echo "Migration file location: ./supabase/migrations/20250129_add_upline_function.sql"
