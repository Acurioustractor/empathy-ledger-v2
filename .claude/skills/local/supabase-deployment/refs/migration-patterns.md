# Migration Patterns Reference

## Idempotent SQL Patterns

### Tables
```sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Functions
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION my_function IS 'Description';
```

### Policies
```sql
DROP POLICY IF EXISTS my_policy ON my_table;
CREATE POLICY my_policy ON my_table
  FOR SELECT USING (auth.uid() = user_id);
```

### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table(user_id);

-- Partial index
CREATE INDEX IF NOT EXISTS idx_my_table_active
  ON my_table(user_id) WHERE deleted_at IS NULL;
```

### Columns
```sql
-- Conditional column add
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'my_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN my_column TEXT;
  END IF;
END $$;
```

## Foreign Key Patterns

### CASCADE (for dependent data)
```sql
story_id UUID REFERENCES stories(id) ON DELETE CASCADE
```

### RESTRICT (prevent deletion)
```sql
organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT
```

### SET NULL (soft delete)
```sql
deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
```

## RLS Policy Patterns

### Multi-Tenant Isolation
```sql
CREATE POLICY tenant_isolation ON my_table
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

### Role-Based Access
```sql
CREATE POLICY role_based_access ON cultural_content
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
      AND po.organization_id = cultural_content.organization_id
      AND (po.role = 'elder' OR (po.role IN ('admin', 'member') AND status = 'approved'))
    )
  );
```

### Privacy Levels
```sql
CREATE POLICY privacy_levels ON stories
  FOR SELECT TO authenticated
  USING (
    privacy_level = 'public'
    OR (privacy_level = 'community' AND auth.uid() IS NOT NULL)
    OR (privacy_level = 'private' AND auth.uid() = author_id)
    OR (privacy_level = 'restricted' AND EXISTS (
      SELECT 1 FROM story_access_grants WHERE story_id = stories.id AND user_id = auth.uid()
    ))
  );
```

## Updated Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_my_table_updated_at
  BEFORE UPDATE ON my_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
