-- Syndication Webhooks Migration
-- Adds webhook support to syndication system for notifying external partners

-- Add webhook columns to syndication_sites
ALTER TABLE syndication_sites
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS webhook_events TEXT[] DEFAULT ARRAY['consent.granted', 'consent.revoked'];

-- Add comment explaining webhook fields
COMMENT ON COLUMN syndication_sites.webhook_url IS 'URL to send webhook notifications when consent status changes';
COMMENT ON COLUMN syndication_sites.webhook_secret IS 'Shared secret for HMAC signature verification';
COMMENT ON COLUMN syndication_sites.webhook_events IS 'Array of event types this site wants to receive';

-- Create webhook delivery logs table
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
    status_code INTEGER,
    error_message TEXT,
    retryable BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding failed webhooks to retry
CREATE INDEX IF NOT EXISTS idx_webhook_logs_retry
ON webhook_delivery_logs(status, retryable, retry_count, created_at)
WHERE status = 'failed' AND retryable = true;

-- Index for finding webhooks by site
CREATE INDEX IF NOT EXISTS idx_webhook_logs_site
ON webhook_delivery_logs(site_id, created_at DESC);

-- Index for finding webhooks by event type
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event
ON webhook_delivery_logs(event_type, created_at DESC);

-- RLS policies for webhook_delivery_logs
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins can view webhook logs"
ON webhook_delivery_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- System (service role) can insert logs
CREATE POLICY "System can insert webhook logs"
ON webhook_delivery_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- System can update logs (for retries)
CREATE POLICY "System can update webhook logs"
ON webhook_delivery_logs
FOR UPDATE
TO service_role
USING (true);

-- Update JusticeHub site with webhook URL (example)
-- Note: In production, update this with actual webhook URL
UPDATE syndication_sites
SET
    webhook_url = 'https://justicehub.org.au/api/webhooks/empathy-ledger',
    webhook_events = ARRAY['consent.granted', 'consent.revoked', 'content.updated', 'content.unpublished']
WHERE slug = 'justicehub';

-- Grant permissions
GRANT SELECT ON webhook_delivery_logs TO authenticated;
GRANT INSERT, UPDATE ON webhook_delivery_logs TO service_role;
