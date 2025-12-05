#!/bin/bash

# Script to update signup to require referral codes
# This ensures ONLY users with referral links can sign up

echo "🔧 Updating signup to require referral codes..."
echo "================================================"
echo ""

# Check if user wants to proceed
read -p "This will enforce referral-only signups. Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Run the migration
echo "📝 Applying migration..."
npx supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📋 What this does:"
    echo "  - Users MUST use a referral link to sign up"
    echo "  - Direct /signup access shows disabled form"
    echo "  - All new users are created as 'recruited'"
    echo "  - Admins can promote users to 'recruiter' (removes parent_id)"
    echo ""
    echo "🔍 Features:"
    echo "  - /admin/recruiters - View all recruiters and their downlines"
    echo "  - /admin - Promote users to independent recruiters"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error message above"
    exit 1
fi
