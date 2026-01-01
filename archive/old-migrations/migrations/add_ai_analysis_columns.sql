-- Add AI analysis columns to transcripts table
ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS ai_processing_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_quotes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Add index for querying by processing status
CREATE INDEX IF NOT EXISTS idx_transcripts_ai_status ON transcripts(ai_processing_status);

-- Add comment for documentation
COMMENT ON COLUMN transcripts.ai_processing_status IS 'Status of AI analysis: not_started, queued, processing, completed, failed';
COMMENT ON COLUMN transcripts.themes IS 'Array of themes extracted from transcript';
COMMENT ON COLUMN transcripts.key_quotes IS 'Array of key quotes from transcript';
COMMENT ON COLUMN transcripts.ai_summary IS 'AI-generated summary of transcript';
