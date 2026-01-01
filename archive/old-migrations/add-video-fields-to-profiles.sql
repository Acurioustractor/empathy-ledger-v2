-- Add video fields to profiles table for storyteller video organization
-- This enhances the storyteller video system within projects

-- Add video introduction URL for storytellers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS video_introduction_url TEXT;

-- Add array of portfolio video URLs
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS video_portfolio_urls TEXT[] DEFAULT '{}';

-- Add featured video URL for storytellers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS featured_video_url TEXT;

-- Add video metadata for additional context
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS video_metadata JSONB DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN profiles.video_introduction_url IS 'Primary introduction video URL for storyteller';
COMMENT ON COLUMN profiles.video_portfolio_urls IS 'Array of portfolio/showcase video URLs';
COMMENT ON COLUMN profiles.featured_video_url IS 'Featured/highlight video URL for storyteller profile';
COMMENT ON COLUMN profiles.video_metadata IS 'Additional video metadata like titles, descriptions, durations';

-- Create indexes for video fields
CREATE INDEX IF NOT EXISTS idx_profiles_video_introduction ON profiles(video_introduction_url) 
WHERE video_introduction_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_featured_video ON profiles(featured_video_url) 
WHERE featured_video_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_video_portfolio ON profiles USING GIN(video_portfolio_urls) 
WHERE video_portfolio_urls != '{}';

-- Insert some sample video data for testing
UPDATE profiles 
SET 
  video_introduction_url = 'https://vimeo.com/123456789',
  video_portfolio_urls = ARRAY['https://vimeo.com/111111111', 'https://youtube.com/watch?v=abc123'],
  featured_video_url = 'https://vimeo.com/987654321',
  video_metadata = '{"introduction_title": "Meet the Storyteller", "portfolio_titles": ["Community Stories", "Traditional Practices"], "featured_title": "Highlight Reel"}'::jsonb
WHERE email = 'benjamin@act.place' 
  AND video_introduction_url IS NULL;