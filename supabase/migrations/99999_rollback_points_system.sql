-- =====================================================
-- ROLLBACK POINTS SYSTEM - RESTORE TO ORIGINAL STATE
-- =====================================================
-- This migration removes all points system features and
-- restores the database to its original users table only
-- =====================================================

-- Drop triggers first (to remove dependencies)
DROP TRIGGER IF EXISTS trigger_award_referral_points ON public.users;
DROP TRIGGER IF EXISTS trigger_sync_points_to_profiles ON public.users;

-- Drop functions (this also revokes permissions automatically)
DROP FUNCTION IF EXISTS trigger_distribute_points();
DROP FUNCTION IF EXISTS distribute_referral_points(UUID, UUID);
DROP FUNCTION IF EXISTS get_points_leaderboard(INTEGER);
DROP FUNCTION IF EXISTS sync_points_to_profiles();

-- Now we can safely drop the points column
ALTER TABLE public.users DROP COLUMN IF EXISTS points CASCADE;

-- Drop index if it still exists
DROP INDEX IF EXISTS idx_users_points;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, your users table should only have:
-- - id (UUID, PRIMARY KEY)
-- - role (TEXT)
-- - parent_id (UUID)
-- - referral_code (TEXT)
-- - created_at (TIMESTAMP WITH TIME ZONE)
--
-- The following functions should still exist:
-- - get_referral_tree()
-- - get_direct_recruits_count()
-- - get_total_recruits_count()
-- - generate_referral_code()
-- - auto_generate_referral_code()
-- =====================================================
