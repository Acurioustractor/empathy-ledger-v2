-- SAFE MEDIA SYSTEM MIGRATION
-- Generated after comprehensive database audit
-- Date: 2025-09-09
-- 
-- This migration:
-- 1. Only adds missing columns to existing tables
-- 2. Creates only missing tables
-- 3. Preserves all existing data
-- 4. Uses IF NOT EXISTS to prevent duplicates
-- ================================

-- ================================
-- PART 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ================================

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_storyteller BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_elder BOOLEAN DEFAULT false;

-- Add missing columns to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS storyteller_id UUID REFERENCES public.profiles(id);

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS transcript_id UUID;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS media_attachments JSONB;

-- Add missing columns to media_assets table
ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS filename TEXT;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS url TEXT;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document', 'file'));

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS transcript_id UUID;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS mime_type TEXT;

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);

ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add missing columns to transcripts table
ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS formatted_text TEXT;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS segments JSONB;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review'));

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS duration FLOAT;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS word_count INTEGER;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS confidence FLOAT;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ================================
-- PART 2: CREATE MISSING TABLES
-- ================================

-- Create transcription_jobs table (for queue management)
CREATE TABLE IF NOT EXISTS public.transcription_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

-- Create media_usage_tracking table
CREATE TABLE IF NOT EXISTS public.media_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
  used_in_type TEXT CHECK (used_in_type IN ('story', 'project', 'gallery', 'profile', 'organization')),
  used_in_id UUID,
  usage_context TEXT,
  usage_role TEXT CHECK (usage_role IN ('primary', 'thumbnail', 'background', 'inline', 'attachment')),
  added_by UUID REFERENCES auth.users(id),
  ordinal_position INTEGER DEFAULT 0
);

-- ================================
-- PART 3: CREATE INDEXES (IF NOT EXISTS)
-- ================================

-- Indexes for media_assets
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_story_id ON public.media_assets(story_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_organization_id ON public.media_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_project_id ON public.media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_media_type ON public.media_assets(media_type);

-- Indexes for transcripts
CREATE INDEX IF NOT EXISTS idx_transcripts_media_asset_id ON public.transcripts(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON public.transcripts(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_language ON public.transcripts(language);

-- Indexes for transcription_jobs
CREATE INDEX IF NOT EXISTS idx_transcription_jobs_status ON public.transcription_jobs(status);
CREATE INDEX IF NOT EXISTS idx_transcription_jobs_media_asset_id ON public.transcription_jobs(media_asset_id);

-- Indexes for media_usage_tracking
CREATE INDEX IF NOT EXISTS idx_media_usage_media_asset_id ON public.media_usage_tracking(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_used_in ON public.media_usage_tracking(used_in_type, used_in_id);

-- Indexes for stories (new columns)
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id ON public.stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_transcript_id ON public.stories(transcript_id);

-- ================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ================================

ALTER TABLE public.transcription_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage_tracking ENABLE ROW LEVEL SECURITY;

-- ================================
-- PART 5: CREATE RLS POLICIES (IF NOT EXISTS)
-- ================================

-- Policies for transcription_jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transcription_jobs' 
    AND policyname = 'Users can view their own transcription jobs'
  ) THEN
    CREATE POLICY "Users can view their own transcription jobs" 
      ON public.transcription_jobs FOR SELECT 
      USING (created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transcription_jobs' 
    AND policyname = 'Users can create transcription jobs'
  ) THEN
    CREATE POLICY "Users can create transcription jobs" 
      ON public.transcription_jobs FOR INSERT 
      WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- Policies for media_usage_tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media_usage_tracking' 
    AND policyname = 'Media usage is viewable by everyone'
  ) THEN
    CREATE POLICY "Media usage is viewable by everyone" 
      ON public.media_usage_tracking FOR SELECT 
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media_usage_tracking' 
    AND policyname = 'Users can track media usage'
  ) THEN
    CREATE POLICY "Users can track media usage" 
      ON public.media_usage_tracking FOR INSERT 
      WITH CHECK (added_by = auth.uid());
  END IF;
END $$;

-- ================================
-- PART 6: ADD UPDATE TRIGGERS
-- ================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_transcription_jobs_updated_at'
  ) THEN
    CREATE TRIGGER update_transcription_jobs_updated_at
      BEFORE UPDATE ON public.transcription_jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_media_usage_tracking_updated_at'
  ) THEN
    CREATE TRIGGER update_media_usage_tracking_updated_at
      BEFORE UPDATE ON public.media_usage_tracking
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked:
-- ================================

-- Check all columns exist:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('avatar_url', 'is_storyteller', 'is_elder');

-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'stories' AND column_name IN ('storyteller_id', 'transcript_id', 'media_attachments');

-- Check tables exist:
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('transcription_jobs', 'media_usage_tracking');

-- ================================
-- END OF SAFE MIGRATION
-- ================================