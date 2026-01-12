-- Phase 2 Task 1.1: Enhanced Organizations Table with Cultural Identity Fields
-- Migration to add cultural identity, governance, and collaboration features

-- Create organization_status enum type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE organization_status AS ENUM ('active', 'inactive', 'under_review', 'suspended', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to organizations table
-- Cultural Identity columns
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS cultural_identity JSONB NOT NULL DEFAULT '{}';

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS governance_structure JSONB NOT NULL DEFAULT '{}';

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS cultural_protocols JSONB NOT NULL DEFAULT '{}';

-- Access Control columns
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS default_permissions JSONB NOT NULL DEFAULT '{}';

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS elder_oversight_required BOOLEAN DEFAULT false;

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS community_approval_required BOOLEAN DEFAULT false;

-- Cross-Organizational Collaboration columns
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS collaboration_settings JSONB NOT NULL DEFAULT '{}';

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS shared_vocabularies TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update the status column to use the new enum type
-- First, add a temporary column with the new enum type
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status_new organization_status DEFAULT 'active';

-- Update existing data: map old status values to new enum values (only if status column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'status'
  ) THEN
    UPDATE public.organizations
    SET status_new = CASE
      WHEN status = 'active' THEN 'active'::organization_status
      WHEN status = 'inactive' THEN 'inactive'::organization_status
      WHEN status = 'suspended' THEN 'suspended'::organization_status
      ELSE 'active'::organization_status
    END
    WHERE status_new IS NULL OR status_new = 'active';
  END IF;
END $$;

-- Drop the old status column if it exists and rename the new one
DO $$ 
BEGIN
  -- Check if old status column exists and is not already the enum type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'status' 
    AND table_schema = 'public'
    AND data_type != 'USER-DEFINED'
  ) THEN
    ALTER TABLE public.organizations DROP COLUMN status;
    ALTER TABLE public.organizations RENAME COLUMN status_new TO status;
  ELSE
    -- If status column doesn't exist or is already enum type, just ensure we have the right column
    ALTER TABLE public.organizations DROP COLUMN IF EXISTS status_new;
    -- Add status column if it doesn't exist
    ALTER TABLE public.organizations 
    ADD COLUMN IF NOT EXISTS status organization_status DEFAULT 'active';
  END IF;
END $$;

-- Add constraints and indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_cultural_identity ON public.organizations USING GIN(cultural_identity);
CREATE INDEX IF NOT EXISTS idx_organizations_governance_structure ON public.organizations USING GIN(governance_structure);
CREATE INDEX IF NOT EXISTS idx_organizations_cultural_protocols ON public.organizations USING GIN(cultural_protocols);
CREATE INDEX IF NOT EXISTS idx_organizations_default_permissions ON public.organizations USING GIN(default_permissions);
CREATE INDEX IF NOT EXISTS idx_organizations_collaboration_settings ON public.organizations USING GIN(collaboration_settings);
CREATE INDEX IF NOT EXISTS idx_organizations_elder_oversight ON public.organizations(elder_oversight_required);
CREATE INDEX IF NOT EXISTS idx_organizations_community_approval ON public.organizations(community_approval_required);
CREATE INDEX IF NOT EXISTS idx_organizations_shared_vocabularies ON public.organizations USING GIN(shared_vocabularies);

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.cultural_identity IS 'JSONB containing cultural identity information including traditions, values, and practices';
COMMENT ON COLUMN public.organizations.governance_structure IS 'JSONB containing governance model, decision-making processes, and leadership structure';
COMMENT ON COLUMN public.organizations.cultural_protocols IS 'JSONB containing cultural protocols, guidelines, and ceremonial practices';
COMMENT ON COLUMN public.organizations.default_permissions IS 'JSONB containing default access permissions for organization members and resources';
COMMENT ON COLUMN public.organizations.elder_oversight_required IS 'Boolean indicating if elder oversight is required for sensitive content';
COMMENT ON COLUMN public.organizations.community_approval_required IS 'Boolean indicating if community approval is required for public content';
COMMENT ON COLUMN public.organizations.collaboration_settings IS 'JSONB containing settings for cross-organizational collaboration';
COMMENT ON COLUMN public.organizations.shared_vocabularies IS 'Array of shared vocabulary terms and cultural concepts';
COMMENT ON COLUMN public.organizations.status IS 'Organization operational status using enum values';

-- Create or update the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure updated_at trigger exists for organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Ensure updated_at column exists (in case it was missing)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create validation functions for JSONB schema validation

-- Function to validate cultural_identity structure
CREATE OR REPLACE FUNCTION public.validate_cultural_identity(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic validation - ensure it's an object
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Add more specific validation as needed
  -- For now, just ensure it's valid JSONB object
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate governance_structure
CREATE OR REPLACE FUNCTION public.validate_governance_structure(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate cultural_protocols
CREATE OR REPLACE FUNCTION public.validate_cultural_protocols(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate default_permissions
CREATE OR REPLACE FUNCTION public.validate_default_permissions(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate collaboration_settings
CREATE OR REPLACE FUNCTION public.validate_collaboration_settings(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraints for JSONB validation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cultural_identity_valid') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT chk_cultural_identity_valid
    CHECK (validate_cultural_identity(cultural_identity));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_governance_structure_valid') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT chk_governance_structure_valid
    CHECK (validate_governance_structure(governance_structure));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cultural_protocols_valid') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT chk_cultural_protocols_valid
    CHECK (validate_cultural_protocols(cultural_protocols));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_default_permissions_valid') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT chk_default_permissions_valid
    CHECK (validate_default_permissions(default_permissions));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_collaboration_settings_valid') THEN
    ALTER TABLE public.organizations ADD CONSTRAINT chk_collaboration_settings_valid
    CHECK (validate_collaboration_settings(collaboration_settings));
  END IF;
END $$;

-- Update RLS policies to account for new columns if needed
-- Note: Existing RLS policies should continue to work, but we may need to add new ones
-- for the enhanced cultural and access control features in future phases

-- Sample data validation removed - tenant_id is required for all organizations
-- Test data should be added manually after migration with proper tenant_id values
-- Commented out to avoid NOT NULL constraint violation on tenant_id:
--
-- INSERT INTO public.organizations (
--   tenant_id, name, slug, cultural_identity, governance_structure, ...
-- ) VALUES (...)

-- Migration completed successfully
-- The organizations table now has enhanced cultural identity and governance features