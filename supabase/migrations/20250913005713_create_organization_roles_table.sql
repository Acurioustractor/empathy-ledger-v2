-- Create organization_roles table for managing user roles within organizations
CREATE TABLE IF NOT EXISTS organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  role organization_role NOT NULL DEFAULT 'member',
  granted_by UUID NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ NULL,
  is_active BOOLEAN GENERATED ALWAYS AS (revoked_at IS NULL) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_organization_roles_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_organization_roles_profile 
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_organization_roles_granted_by 
    FOREIGN KEY (granted_by) REFERENCES profiles(id) ON DELETE SET NULL,
    
  -- Ensure unique active role per user per organization
  UNIQUE (organization_id, profile_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance
CREATE INDEX idx_organization_roles_organization_id ON organization_roles(organization_id);
CREATE INDEX idx_organization_roles_profile_id ON organization_roles(profile_id);
CREATE INDEX idx_organization_roles_role ON organization_roles(role);
CREATE INDEX idx_organization_roles_active ON organization_roles(is_active) WHERE is_active = true;
CREATE INDEX idx_organization_roles_granted_at ON organization_roles(granted_at);

-- Enable RLS
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own organization roles" ON organization_roles
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Organization admins can view all roles for their organization" ON organization_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_roles 
      WHERE profile_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
  );

CREATE POLICY "Organization admins can manage roles in their organization" ON organization_roles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_roles 
      WHERE profile_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
  );

-- Create function to handle role changes
CREATE OR REPLACE FUNCTION handle_organization_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- If revoking a role, set revoked_at
  IF OLD.is_active = true AND NEW.is_active = false THEN
    NEW.revoked_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
CREATE TRIGGER trigger_organization_role_change
  BEFORE UPDATE ON organization_roles
  FOR EACH ROW
  EXECUTE FUNCTION handle_organization_role_change();

-- Create function to get user's role in organization
CREATE OR REPLACE FUNCTION get_user_organization_role(org_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS organization_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM organization_roles 
    WHERE organization_id = org_id 
      AND profile_id = user_id 
      AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has role in organization
CREATE OR REPLACE FUNCTION user_has_organization_role(
  org_id UUID, 
  required_role organization_role,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role organization_role;
BEGIN
  user_role := get_user_organization_role(org_id, user_id);
  
  -- Check role hierarchy: super_admin > admin > moderator > contributor > member
  RETURN CASE
    WHEN required_role = 'member' THEN user_role IS NOT NULL
    WHEN required_role = 'contributor' THEN user_role IN ('contributor', 'moderator', 'admin', 'super_admin')
    WHEN required_role = 'moderator' THEN user_role IN ('moderator', 'admin', 'super_admin')
    WHEN required_role = 'admin' THEN user_role IN ('admin', 'super_admin')
    WHEN required_role = 'super_admin' THEN user_role = 'super_admin'
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE organization_roles IS 'Manages user roles within organizations with full audit trail';
COMMENT ON COLUMN organization_roles.is_active IS 'Computed column: true when role is not revoked';
COMMENT ON COLUMN organization_roles.granted_by IS 'The user who granted this role (NULL for system/initial grants)';
COMMENT ON FUNCTION get_user_organization_role IS 'Returns the active role of a user in an organization';
COMMENT ON FUNCTION user_has_organization_role IS 'Checks if user has required role or higher in organization';