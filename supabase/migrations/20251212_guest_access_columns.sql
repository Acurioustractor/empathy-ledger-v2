-- Add guest access columns to organisations table
-- Enables PIN-based temporary access for field workers

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS guest_pin VARCHAR(10),
ADD COLUMN IF NOT EXISTS guest_access_enabled BOOLEAN DEFAULT false;

-- Add index for PIN lookups
CREATE INDEX IF NOT EXISTS idx_organisations_guest_pin
ON organisations(guest_pin)
WHERE guest_access_enabled = true;

-- Comment for documentation
COMMENT ON COLUMN organisations.guest_pin IS 'PIN code for field worker guest access (4-6 digits)';
COMMENT ON COLUMN organisations.guest_access_enabled IS 'Whether guest/field worker PIN access is enabled';
