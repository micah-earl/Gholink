-- Add invite_link column to recruits table
-- This stores the generated Supabase invite link for each recruit

ALTER TABLE recruits 
ADD COLUMN IF NOT EXISTS invite_link TEXT;

-- Add index for invite_link lookups (optional, but useful if you'll query by link)
CREATE INDEX IF NOT EXISTS idx_recruits_invite_link ON recruits(invite_link) WHERE invite_link IS NOT NULL;

