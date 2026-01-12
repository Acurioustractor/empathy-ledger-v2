-- Sprint 3: Comments System Schema
-- Creates tables for story comments, likes, reports, and moderation

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0
);

-- Indexes for comments
CREATE INDEX idx_comments_story_id ON comments(story_id);
CREATE INDEX idx_comments_commenter_id ON comments(commenter_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_flagged_for_review ON comments(flagged_for_review) WHERE flagged_for_review = TRUE;

-- =====================================================
-- COMMENT LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  liker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, liker_id) -- Prevent duplicate likes
);

-- Indexes for comment_likes
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_liker_id ON comment_likes(liker_id);

-- =====================================================
-- COMMENT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Allow anonymous reports
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'harassment',
    'misinformation',
    'cultural-insensitivity',
    'inappropriate',
    'other'
  )),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comment_reports
CREATE INDEX idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON comment_reports(status);
CREATE INDEX idx_comment_reports_reason ON comment_reports(reason);

-- =====================================================
-- STORY VIEWS TABLE (for analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  viewer_ip TEXT,
  viewing_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for story_views
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_viewer_id ON story_views(viewer_id) WHERE viewer_id IS NOT NULL;
CREATE INDEX idx_story_views_viewing_at ON story_views(viewing_at DESC);

-- =====================================================
-- STORY SHARES TABLE (for analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS story_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  sharer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  platform TEXT NOT NULL CHECK (platform IN (
    'copy_link',
    'twitter',
    'facebook',
    'linkedin',
    'email'
  )),
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for story_shares
CREATE INDEX idx_story_shares_story_id ON story_shares(story_id);
CREATE INDEX idx_story_shares_sharer_id ON story_shares(sharer_id) WHERE sharer_id IS NOT NULL;
CREATE INDEX idx_story_shares_platform ON story_shares(platform);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET likes_count = likes_count + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment likes
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment story views
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update replies_count when comment is created
CREATE OR REPLACE FUNCTION update_parent_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments
    SET replies_count = replies_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parent_replies_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_parent_replies_count();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = commenter_id);

-- Comment likes policies
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = liker_id);

-- Comment reports policies
CREATE POLICY "Users can create reports"
  ON comment_reports FOR INSERT
  WITH CHECK (true); -- Allow anonymous reports

-- Story views policies
CREATE POLICY "Anyone can insert story views"
  ON story_views FOR INSERT
  WITH CHECK (true);

-- Story shares policies
CREATE POLICY "Anyone can insert story shares"
  ON story_shares FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ADD COLUMNS TO EXISTING STORIES TABLE
-- =====================================================

-- Add comment-related columns to stories table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'allow_comments') THEN
    ALTER TABLE stories ADD COLUMN allow_comments BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'requires_moderation') THEN
    ALTER TABLE stories ADD COLUMN requires_moderation BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'views_count') THEN
    ALTER TABLE stories ADD COLUMN views_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'stories' AND column_name = 'shares_count') THEN
    ALTER TABLE stories ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;
END $$;

COMMENT ON TABLE comments IS 'User comments on published stories with moderation support';
COMMENT ON TABLE comment_likes IS 'Tracks which users have liked which comments';
COMMENT ON TABLE comment_reports IS 'Reports of inappropriate comments for moderation';
COMMENT ON TABLE story_views IS 'Analytics tracking for story views';
COMMENT ON TABLE story_shares IS 'Analytics tracking for story shares across platforms';
