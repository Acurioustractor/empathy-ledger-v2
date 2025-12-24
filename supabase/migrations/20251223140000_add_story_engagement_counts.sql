-- Add engagement tracking columns to stories table
-- For the beautiful story reading page

-- Add engagement count columns
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0 NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_views_count ON public.stories(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_stories_likes_count ON public.stories(likes_count DESC);

-- Add comment
COMMENT ON COLUMN public.stories.views_count IS 'Total number of times this story has been viewed';
COMMENT ON COLUMN public.stories.likes_count IS 'Total number of likes/hearts this story has received';
COMMENT ON COLUMN public.stories.shares_count IS 'Total number of times this story has been shared';

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION public.increment_story_view_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET views_count = views_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_story_view_count TO authenticated, anon;

-- Create a function to increment like count
CREATE OR REPLACE FUNCTION public.increment_story_like_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = likes_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_story_like_count TO authenticated, anon;

-- Create a function to decrement like count
CREATE OR REPLACE FUNCTION public.decrement_story_like_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.decrement_story_like_count TO authenticated, anon;

-- Create a function to increment share count
CREATE OR REPLACE FUNCTION public.increment_story_share_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET shares_count = shares_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_story_share_count TO authenticated, anon;
