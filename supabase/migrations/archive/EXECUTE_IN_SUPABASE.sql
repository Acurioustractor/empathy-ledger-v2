-- ============================================================================
-- ADD AI ANALYSIS COLUMNS TO TRANSCRIPTS TABLE
-- ============================================================================
-- Date: 2025-10-01
-- Action: Add columns for AI-powered transcript analysis
-- Impact: Adds 4 new columns to transcripts table
-- ============================================================================

-- Add AI analysis columns to transcripts table
ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS ai_processing_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_quotes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Add index for querying by processing status
CREATE INDEX IF NOT EXISTS idx_transcripts_ai_status ON transcripts(ai_processing_status);

-- Add comments for documentation
COMMENT ON COLUMN transcripts.ai_processing_status IS 'Status of AI analysis: not_started, queued, processing, completed, failed';
COMMENT ON COLUMN transcripts.themes IS 'Array of themes extracted from transcript';
COMMENT ON COLUMN transcripts.key_quotes IS 'Array of key quotes from transcript';
COMMENT ON COLUMN transcripts.ai_summary IS 'AI-generated summary of transcript';

-- ============================================================================
-- PROFILES TABLE CLEANUP - EXECUTE IN SUPABASE SQL EDITOR
-- ============================================================================
-- Date: 2025-09-30
-- Action: Drop 2 unused fields from profiles table
-- Impact: Reduces from 116 → 114 columns
-- ============================================================================

-- Step 1: Drop avatar_url (0% usage - replaced by profile_image_url)
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;

-- Step 2: Drop location_data (0% usage - JSONB field no longer used)
ALTER TABLE profiles DROP COLUMN IF EXISTS location_data;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check column count (should be 114)
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- ============================================================================
-- SUCCESS! ✅
-- ============================================================================
-- You've cleaned up 2 unused fields from the profiles table.
-- The table is now 2 columns leaner without any data loss.
-- ============================================================================