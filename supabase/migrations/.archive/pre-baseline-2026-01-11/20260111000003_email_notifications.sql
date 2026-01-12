-- Email Notifications System
-- Tracks all email notifications sent from the platform

-- Email notifications log
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'story_submitted',
    'story_approved',
    'story_published',
    'story_rejected',
    'changes_requested',
    'review_assigned',
    'elder_escalation',
    'consent_pending',
    'community_mention',
    'weekly_digest'
  )),
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
  message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email preferences per user
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Story notifications
  notify_story_approved BOOLEAN DEFAULT TRUE,
  notify_story_published BOOLEAN DEFAULT TRUE,
  notify_story_rejected BOOLEAN DEFAULT TRUE,
  notify_changes_requested BOOLEAN DEFAULT TRUE,

  -- Review notifications (for reviewers/elders)
  notify_review_assigned BOOLEAN DEFAULT TRUE,
  notify_new_submissions BOOLEAN DEFAULT TRUE,
  notify_elder_escalation BOOLEAN DEFAULT TRUE,

  -- Community notifications
  notify_community_mention BOOLEAN DEFAULT TRUE,
  notify_story_comments BOOLEAN DEFAULT FALSE,

  -- Digest emails
  weekly_digest BOOLEAN DEFAULT FALSE,
  monthly_summary BOOLEAN DEFAULT FALSE,

  -- Global opt-out
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events from email provider (Resend, SendGrid)
CREATE TABLE IF NOT EXISTS public.email_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'unsubscribed'
  )),
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  raw_payload JSONB,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user ON public.email_notifications(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_message_id ON public.email_notifications(message_id) WHERE message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON public.email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_email_webhook_message ON public.email_webhook_events(message_id);
CREATE INDEX IF NOT EXISTS idx_email_webhook_type ON public.email_webhook_events(event_type);

-- RLS Policies
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_webhook_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own email notifications
CREATE POLICY "Users can view own email notifications"
  ON public.email_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can manage their own email preferences
CREATE POLICY "Users can view own email preferences"
  ON public.email_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email preferences"
  ON public.email_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all email notifications"
  ON public.email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Service role can insert notifications
GRANT INSERT ON public.email_notifications TO service_role;
GRANT INSERT ON public.email_webhook_events TO service_role;

-- Function to update email notification status from webhook
CREATE OR REPLACE FUNCTION update_email_notification_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.email_notifications
  SET
    status = NEW.event_type,
    delivered_at = CASE WHEN NEW.event_type = 'delivered' THEN NEW.received_at ELSE delivered_at END,
    opened_at = CASE WHEN NEW.event_type = 'opened' THEN NEW.received_at ELSE opened_at END,
    clicked_at = CASE WHEN NEW.event_type = 'clicked' THEN NEW.received_at ELSE clicked_at END
  WHERE message_id = NEW.message_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update notification status
CREATE TRIGGER email_webhook_status_update
  AFTER INSERT ON public.email_webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_email_notification_status();

-- Function to check if user wants this notification type
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences RECORD;
  v_should_send BOOLEAN := TRUE;
BEGIN
  -- Get user preferences
  SELECT * INTO v_preferences
  FROM public.email_preferences
  WHERE user_id = p_user_id;

  -- If no preferences exist, send by default
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  -- Check global unsubscribe
  IF v_preferences.unsubscribed THEN
    RETURN FALSE;
  END IF;

  -- Check specific notification type
  CASE p_notification_type
    WHEN 'story_approved' THEN
      v_should_send := v_preferences.notify_story_approved;
    WHEN 'story_published' THEN
      v_should_send := v_preferences.notify_story_published;
    WHEN 'story_rejected' THEN
      v_should_send := v_preferences.notify_story_rejected;
    WHEN 'changes_requested' THEN
      v_should_send := v_preferences.notify_changes_requested;
    WHEN 'review_assigned' THEN
      v_should_send := v_preferences.notify_review_assigned;
    WHEN 'elder_escalation' THEN
      v_should_send := v_preferences.notify_elder_escalation;
    WHEN 'community_mention' THEN
      v_should_send := v_preferences.notify_community_mention;
    WHEN 'weekly_digest' THEN
      v_should_send := v_preferences.weekly_digest;
    ELSE
      -- Default to true for new notification types
      v_should_send := TRUE;
  END CASE;

  RETURN v_should_send;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.email_notifications IS 'Log of all email notifications sent from the platform';
COMMENT ON TABLE public.email_preferences IS 'User preferences for email notifications';
COMMENT ON TABLE public.email_webhook_events IS 'Webhook events from email provider (delivery, opens, clicks)';
COMMENT ON FUNCTION should_send_notification IS 'Check if user wants to receive a specific notification type';
