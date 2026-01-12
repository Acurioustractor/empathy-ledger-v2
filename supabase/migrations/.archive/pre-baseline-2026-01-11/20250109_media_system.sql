-- Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- File information
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document', 'file')),
  url TEXT NOT NULL,
  
  -- Metadata
  title TEXT,
  description TEXT,
  alt_text TEXT,
  tags TEXT[],
  
  -- Relationships
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  transcript_id UUID,
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  duration FLOAT, -- in seconds for audio/video
  
  -- Cultural safety
  cultural_sensitivity TEXT CHECK (cultural_sensitivity IN ('public', 'community', 'restricted', 'sacred')),
  elder_approved BOOLEAN DEFAULT false,
  consent_obtained BOOLEAN DEFAULT false,
  usage_rights TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'archived', 'deleted')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'community', 'restricted')),
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  -- Additional metadata as JSON
  metadata JSONB DEFAULT '{}',
  
  -- Indexing
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(filename, '')), 'C')
  ) STORED
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationship to media
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
  
  -- Transcript content
  text TEXT,
  formatted_text TEXT,
  segments JSONB, -- Array of {start, end, text} objects
  
  -- Metadata
  language TEXT DEFAULT 'en',
  duration FLOAT,
  word_count INTEGER,
  speaker_labels JSONB, -- Speaker identification data
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')),
  error_message TEXT,
  
  -- Quality metrics
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Cultural review
  cultural_review_status TEXT CHECK (cultural_review_status IN ('pending', 'approved', 'needs_edits', 'restricted')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  
  -- Editing
  edited_text TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ,
  
  -- Processing info
  created_by UUID REFERENCES auth.users(id),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(text, '') || ' ' || coalesce(formatted_text, '') || ' ' || coalesce(edited_text, ''))
  ) STORED
);

-- Create transcription_jobs table for queue management
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

-- Add missing avatar_url column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_story_id ON public.media_assets(story_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_organization_id ON public.media_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_media_type ON public.media_assets(media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON public.media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_search ON public.media_assets USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_transcripts_media_asset_id ON public.transcripts(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON public.transcripts(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_language ON public.transcripts(language);
CREATE INDEX IF NOT EXISTS idx_transcripts_search ON public.transcripts USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_transcription_jobs_status ON public.transcription_jobs(status);
CREATE INDEX IF NOT EXISTS idx_transcription_jobs_media_asset_id ON public.transcription_jobs(media_asset_id);

CREATE INDEX IF NOT EXISTS idx_media_usage_media_asset_id ON public.media_usage_tracking(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_used_in ON public.media_usage_tracking(used_in_type, used_in_id);

-- Create RLS policies
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcription_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Media assets policies
CREATE POLICY "Public media assets are viewable by everyone" 
  ON public.media_assets FOR SELECT 
  USING (visibility = 'public');

CREATE POLICY "Users can view their own media assets" 
  ON public.media_assets FOR SELECT 
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can upload media assets" 
  ON public.media_assets FOR INSERT 
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own media assets" 
  ON public.media_assets FOR UPDATE 
  USING (uploaded_by = auth.uid());

-- Transcripts policies
CREATE POLICY "Public transcripts are viewable by everyone" 
  ON public.transcripts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_assets 
      WHERE media_assets.id = transcripts.media_asset_id 
      AND media_assets.visibility = 'public'
    )
  );

CREATE POLICY "Users can view transcripts for their media" 
  ON public.transcripts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.media_assets 
      WHERE media_assets.id = transcripts.media_asset_id 
      AND media_assets.uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Users can create transcripts for their media" 
  ON public.transcripts FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Transcription jobs policies
CREATE POLICY "Users can view their own transcription jobs" 
  ON public.transcription_jobs FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "Users can create transcription jobs" 
  ON public.transcription_jobs FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Media usage tracking policies
CREATE POLICY "Media usage is viewable by everyone" 
  ON public.media_usage_tracking FOR SELECT 
  USING (true);

CREATE POLICY "Users can track media usage" 
  ON public.media_usage_tracking FOR INSERT 
  WITH CHECK (added_by = auth.uid());

-- Create storage bucket for media if it doesn't exist
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('media', 'media', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload media files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own media files" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "Users can delete their own media files" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "Public media files are viewable by everyone" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'media');

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transcripts_updated_at
  BEFORE UPDATE ON public.transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();