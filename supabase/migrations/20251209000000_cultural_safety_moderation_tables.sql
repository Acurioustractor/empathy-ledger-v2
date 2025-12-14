-- Cultural Safety Moderation System Tables
-- Supports elder review workflows, AI moderation tracking, and appeals

-- =====================================================
-- 1. ELDER REVIEW QUEUE
-- Stores pending cultural content reviews for elders
-- =====================================================
CREATE TABLE IF NOT EXISTS elder_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'media', 'gallery', 'profile', 'comment')),
  cultural_issues JSONB DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_elder_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_consultation')),
  community_input_required BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_status ON elder_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_assigned_elder ON elder_review_queue(assigned_elder_id);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_priority ON elder_review_queue(priority);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_content ON elder_review_queue(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_due_date ON elder_review_queue(due_date);

-- =====================================================
-- 2. MODERATION RESULTS
-- Stores outcomes of AI and elder moderation decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_results (
  id TEXT PRIMARY KEY, -- Format: mod_timestamp_random
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'media', 'gallery', 'profile', 'comment')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'flagged', 'blocked', 'elder_review_required')),
  moderation_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  elder_assignment JSONB,
  review_deadline TIMESTAMPTZ,
  appeals_available BOOLEAN DEFAULT true,
  moderated_by TEXT NOT NULL DEFAULT 'ai_system', -- 'ai_system' or elder UUID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_moderation_results_status ON moderation_results(status);
CREATE INDEX IF NOT EXISTS idx_moderation_results_content ON moderation_results(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_results_created ON moderation_results(created_at);

-- =====================================================
-- 3. MODERATION APPEALS
-- Tracks appeals submitted for moderation decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderation_request_id TEXT NOT NULL REFERENCES moderation_results(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  appeal_reason TEXT NOT NULL,
  additional_context TEXT,
  appeal_status TEXT NOT NULL DEFAULT 'pending' CHECK (appeal_status IN ('pending', 'under_review', 'approved', 'denied')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_status ON moderation_appeals(appeal_status);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_user ON moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_appeals_moderation ON moderation_appeals(moderation_request_id);

-- =====================================================
-- 4. AI MODERATION LOGS
-- Audit trail for all moderation activity
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  moderation_status TEXT,
  cultural_issues_detected INTEGER DEFAULT 0,
  elder_review_required BOOLEAN DEFAULT false,
  moderated_at TIMESTAMPTZ,
  -- Elder decision fields (populated when elder reviews)
  elder_id UUID REFERENCES profiles(id),
  elder_decision TEXT CHECK (elder_decision IS NULL OR elder_decision IN ('approved', 'rejected', 'needs_consultation')),
  elder_notes TEXT,
  elder_conditions TEXT[],
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_content ON ai_moderation_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_author ON ai_moderation_logs(author_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_created ON ai_moderation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_elder ON ai_moderation_logs(elder_id);

-- =====================================================
-- 5. AI SAFETY LOGS
-- Audit trail for AI safety checks (from middleware)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_safety_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation TEXT NOT NULL,
  context_type TEXT,
  content_preview TEXT, -- First 500 chars for audit
  safety_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  safety_level TEXT CHECK (safety_level IN ('safe', 'review_required', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_user ON ai_safety_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_operation ON ai_safety_logs(operation);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_level ON ai_safety_logs(safety_level);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_created ON ai_safety_logs(created_at);

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE elder_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_logs ENABLE ROW LEVEL SECURITY;

-- Elder Review Queue Policies
DROP POLICY IF EXISTS "Elders can view their assigned reviews" ON elder_review_queue;
CREATE POLICY "Elders can view their assigned reviews"
  ON elder_review_queue FOR SELECT
  TO authenticated
  USING (
    assigned_elder_id = auth.uid()
    OR assigned_elder_id IS NULL
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true)
  );

DROP POLICY IF EXISTS "System can insert review items" ON elder_review_queue;
CREATE POLICY "System can insert review items"
  ON elder_review_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Elders can update their reviews" ON elder_review_queue;
CREATE POLICY "Elders can update their reviews"
  ON elder_review_queue FOR UPDATE
  TO authenticated
  USING (
    assigned_elder_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true)
  );

-- Moderation Results Policies
DROP POLICY IF EXISTS "Authors can view their content moderation" ON moderation_results;
CREATE POLICY "Authors can view their content moderation"
  ON moderation_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories WHERE id = content_id AND (author_id = auth.uid() OR storyteller_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true)
  );

DROP POLICY IF EXISTS "System can insert moderation results" ON moderation_results;
CREATE POLICY "System can insert moderation results"
  ON moderation_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Moderation Appeals Policies
DROP POLICY IF EXISTS "Users can view their own appeals" ON moderation_appeals;
CREATE POLICY "Users can view their own appeals"
  ON moderation_appeals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true));

DROP POLICY IF EXISTS "Users can create appeals" ON moderation_appeals;
CREATE POLICY "Users can create appeals"
  ON moderation_appeals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Elders can update appeals" ON moderation_appeals;
CREATE POLICY "Elders can update appeals"
  ON moderation_appeals FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true));

-- AI Moderation Logs Policies (read-only for most users)
DROP POLICY IF EXISTS "Elders and content authors can view logs" ON ai_moderation_logs;
CREATE POLICY "Elders and content authors can view logs"
  ON ai_moderation_logs FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true)
  );

DROP POLICY IF EXISTS "System can insert logs" ON ai_moderation_logs;
CREATE POLICY "System can insert logs"
  ON ai_moderation_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- AI Safety Logs Policies
DROP POLICY IF EXISTS "Users can view their own safety logs" ON ai_safety_logs;
CREATE POLICY "Users can view their own safety logs"
  ON ai_safety_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true));

DROP POLICY IF EXISTS "System can insert safety logs" ON ai_safety_logs;
CREATE POLICY "System can insert safety logs"
  ON ai_safety_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 7. HELPER VIEWS
-- =====================================================

-- View for elder dashboard showing pending reviews with content details
CREATE OR REPLACE VIEW elder_review_dashboard AS
SELECT
  erq.*,
  CASE
    WHEN erq.content_type = 'story' THEN (SELECT title FROM stories WHERE id = erq.content_id)
    WHEN erq.content_type = 'gallery' THEN (SELECT title FROM galleries WHERE id = erq.content_id)
    ELSE 'Untitled'
  END as content_title,
  CASE
    WHEN erq.content_type = 'story' THEN (SELECT LEFT(content, 300) FROM stories WHERE id = erq.content_id)
    ELSE NULL
  END as content_preview,
  p.display_name as assigned_elder_name
FROM elder_review_queue erq
LEFT JOIN profiles p ON erq.assigned_elder_id = p.id;

-- View for moderation statistics
CREATE OR REPLACE VIEW moderation_statistics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_moderated,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'flagged') as flagged_count,
  COUNT(*) FILTER (WHERE status = 'blocked') as blocked_count,
  COUNT(*) FILTER (WHERE status = 'elder_review_required') as elder_review_count
FROM moderation_results
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =====================================================
-- 8. UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_cultural_safety_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_elder_review_queue_timestamp ON elder_review_queue;
CREATE TRIGGER update_elder_review_queue_timestamp
  BEFORE UPDATE ON elder_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_cultural_safety_timestamp();

-- =====================================================
-- 9. NOTIFICATION FUNCTION (placeholder for webhooks)
-- =====================================================
CREATE OR REPLACE FUNCTION notify_elder_review_assigned()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be extended to call a webhook or queue a notification
  -- For now, it just logs the assignment
  IF NEW.assigned_elder_id IS NOT NULL AND (OLD.assigned_elder_id IS NULL OR OLD.assigned_elder_id != NEW.assigned_elder_id) THEN
    RAISE NOTICE 'Elder review assigned: % to elder %', NEW.id, NEW.assigned_elder_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS elder_review_assignment_notification ON elder_review_queue;
CREATE TRIGGER elder_review_assignment_notification
  AFTER INSERT OR UPDATE ON elder_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION notify_elder_review_assigned();

COMMENT ON TABLE elder_review_queue IS 'Queue of content requiring elder cultural review';
COMMENT ON TABLE moderation_results IS 'Results from AI and elder cultural safety moderation';
COMMENT ON TABLE moderation_appeals IS 'Appeals submitted for moderation decisions';
COMMENT ON TABLE ai_moderation_logs IS 'Audit trail for all moderation activity';
COMMENT ON TABLE ai_safety_logs IS 'Audit trail for AI safety middleware checks';
