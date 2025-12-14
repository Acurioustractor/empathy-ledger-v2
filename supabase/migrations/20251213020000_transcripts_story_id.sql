-- Migration: Add story_id to transcripts table
-- This links transcripts directly to stories for the capture workflow

-- Add story_id column to transcripts table
ALTER TABLE public.transcripts
ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL;

-- Add created_by column for tracking who created the transcript
ALTER TABLE public.transcripts
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add duration_seconds column (the code uses this but schema has 'duration')
-- Check if duration_seconds exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'transcripts'
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE public.transcripts ADD COLUMN duration_seconds INTEGER;
  END IF;
END $$;

-- Add content column for transcript text (code uses 'content', schema has 'transcript_text')
ALTER TABLE public.transcripts
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create index for faster story lookups
CREATE INDEX IF NOT EXISTS idx_transcripts_story_id ON public.transcripts(story_id);

-- Update RLS policies to allow story-based access
-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view transcripts for their stories" ON public.transcripts;
DROP POLICY IF EXISTS "Users can create transcripts for their stories" ON public.transcripts;

-- Policy: Users can view transcripts for stories they own or are storyteller of
CREATE POLICY "Users can view transcripts for their stories" ON public.transcripts
FOR SELECT USING (
  created_by = auth.uid()
  OR storyteller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = transcripts.story_id
    AND (s.author_id = auth.uid() OR s.storyteller_id = auth.uid())
  )
);

-- Policy: Users can create transcripts
CREATE POLICY "Users can create transcripts for their stories" ON public.transcripts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Policy: Users can update their own transcripts
DROP POLICY IF EXISTS "Users can update their transcripts" ON public.transcripts;
CREATE POLICY "Users can update their transcripts" ON public.transcripts
FOR UPDATE USING (
  created_by = auth.uid()
  OR storyteller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = transcripts.story_id
    AND (s.author_id = auth.uid() OR s.storyteller_id = auth.uid())
  )
);

-- Grant service role full access for background processing
GRANT ALL ON public.transcripts TO service_role;
