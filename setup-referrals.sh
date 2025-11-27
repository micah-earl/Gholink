#!/bin/bash

# Referral System Setup Script
# This script helps you set up the referral system in Supabase

echo "🚀 Gholink Referral System Setup"
echo "================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo "📦 Install it with: npm install -g supabase"
    echo "📚 Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the project root?"
    exit 1
fi

echo "📂 Project directory verified"
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250126_create_users_table.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file found"
echo ""

echo "🔄 Options:"
echo "1. Apply migration to remote Supabase project"
echo "2. Apply migration to local Supabase (Docker)"
echo "3. Show migration preview"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Applying to remote project..."
        echo "Make sure you're logged in: supabase login"
        echo "And linked to project: supabase link --project-ref your-project-ref"
        echo ""
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            supabase db push
            echo ""
            echo "✅ Migration applied to remote project!"
        fi
        ;;
    2)
        echo ""
        echo "🐳 Applying to local Supabase..."
        echo "Make sure Docker is running and Supabase is started: supabase start"
        echo ""
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            supabase db reset
            echo ""
            echo "✅ Migration applied to local database!"
        fi
        ;;
    3)
        echo ""
        echo "📋 Migration Preview:"
        echo "===================="
        cat "$MIGRATION_FILE"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Sign up at: http://localhost:5173/signup"
echo "3. Check your referral code at: http://localhost:5173/referrals"
echo "4. Test referral link: http://localhost:5173/join/YOUR_CODE"
echo ""
echo "📚 Read REFERRAL_SYSTEM.md for full documentation"
