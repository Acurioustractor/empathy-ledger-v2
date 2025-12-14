-- Webhook Subscriptions for Story Syndication
-- Allows external apps to receive real-time notifications when consent changes

-- Webhook subscriptions table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  secret_key TEXT NOT NULL,  -- For HMAC signature verification

  -- Events to subscribe to
  events TEXT[] NOT NULL DEFAULT ARRAY['consent.revoked'],
  -- Available events:
  -- consent.granted, consent.revoked, consent.updated, consent.expired
  -- story.updated, story.deleted
  -- cultural.approval_required, cultural.approved, cultural.denied

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Delivery tracking
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  consecutive_failures INT DEFAULT 0,

  -- Auto-disable after too many failures
  max_consecutive_failures INT DEFAULT 5,

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure unique webhook URL per app
  UNIQUE(app_id, webhook_url)
);

-- Webhook delivery log (audit trail)
CREATE TABLE IF NOT EXISTS webhook_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL,

  -- Delivery attempt
  attempt_number INT DEFAULT 1,
  delivered_at TIMESTAMPTZ DEFAULT now(),

  -- Response
  response_status INT,
  response_body TEXT,
  response_time_ms INT,

  -- Status
  success BOOLEAN DEFAULT false,
  error_message TEXT,

  -- For retry logic
  next_retry_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Consent change history (for audit and webhook triggers)
CREATE TABLE IF NOT EXISTS consent_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id UUID NOT NULL,  -- References story_syndication_consent
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES profiles(id),

  -- Change details
  change_type TEXT NOT NULL,  -- 'granted', 'revoked', 'updated', 'expired'
  previous_state JSONB,
  new_state JSONB,

  -- Who made the change
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,

  -- Webhook delivery status
  webhooks_triggered BOOLEAN DEFAULT false,
  webhooks_delivered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_app_id
  ON webhook_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active
  ON webhook_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_subscription
  ON webhook_delivery_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_pending
  ON webhook_delivery_log(next_retry_at) WHERE success = false AND next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consent_change_log_story
  ON consent_change_log(story_id);
CREATE INDEX IF NOT EXISTS idx_consent_change_log_app
  ON consent_change_log(app_id);

-- RLS Policies
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_change_log ENABLE ROW LEVEL SECURITY;

-- Service role can manage all webhooks
DROP POLICY IF EXISTS "Service role manages webhooks" ON webhook_subscriptions;
CREATE POLICY "Service role manages webhooks"
  ON webhook_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages delivery logs" ON webhook_delivery_log;
CREATE POLICY "Service role manages delivery logs"
  ON webhook_delivery_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages consent logs" ON consent_change_log;
CREATE POLICY "Service role manages consent logs"
  ON consent_change_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update webhook subscription timestamp
CREATE OR REPLACE FUNCTION update_webhook_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS webhook_subscription_updated ON webhook_subscriptions;
CREATE TRIGGER webhook_subscription_updated
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_subscription_timestamp();

-- Function to auto-disable webhooks after too many failures
CREATE OR REPLACE FUNCTION check_webhook_failures()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consecutive_failures >= NEW.max_consecutive_failures THEN
    NEW.is_active = false;
    RAISE NOTICE 'Webhook % disabled after % consecutive failures', NEW.id, NEW.consecutive_failures;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS webhook_failure_check ON webhook_subscriptions;
CREATE TRIGGER webhook_failure_check
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW
  WHEN (NEW.consecutive_failures > OLD.consecutive_failures)
  EXECUTE FUNCTION check_webhook_failures();

-- Comments
COMMENT ON TABLE webhook_subscriptions IS 'Webhook endpoints registered by external apps for real-time notifications';
COMMENT ON TABLE webhook_delivery_log IS 'Audit log of all webhook delivery attempts';
COMMENT ON TABLE consent_change_log IS 'History of all consent changes for audit and webhook triggering';
COMMENT ON COLUMN webhook_subscriptions.secret_key IS 'Used for HMAC-SHA256 signature verification';
COMMENT ON COLUMN webhook_subscriptions.events IS 'Array of event types this webhook subscribes to';
