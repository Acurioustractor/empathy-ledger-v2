-- Migration: Add checksum for file deduplication
-- This allows detecting duplicate uploads and reusing existing media

-- Add checksum column to media_assets
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS checksum TEXT;

-- Add file_hash for additional integrity verification (SHA-256)
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- Create index for fast duplicate lookups
CREATE INDEX IF NOT EXISTS idx_media_assets_checksum ON public.media_assets(checksum) WHERE checksum IS NOT NULL;

-- Create index for hash lookups
CREATE INDEX IF NOT EXISTS idx_media_assets_file_hash ON public.media_assets(file_hash) WHERE file_hash IS NOT NULL;

-- Add source_type to track where media came from (upload, descript, youtube, etc)
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'upload';

-- Add source_url for external media references
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add transcript_file_path for storing uploaded transcript files (TXT, SRT, VTT)
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS transcript_file_path TEXT;

-- Add transcript_format to track transcript file type
ALTER TABLE public.media_assets
ADD COLUMN IF NOT EXISTS transcript_format TEXT;
