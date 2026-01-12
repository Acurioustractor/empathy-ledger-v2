# Security & RLS Patterns

## RLS Patterns
```sql
-- Pattern 1: Tenant Isolation (most common)
CREATE POLICY tenant_isolation ON table FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Pattern 2: Owner-Only
CREATE POLICY owner_access ON table FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Pattern 3: Role-Based
CREATE POLICY admin_access ON table FOR ALL
  USING (user_has_role('admin'));

-- Pattern 4: Public Read, Auth Write
CREATE POLICY public_read ON table FOR SELECT USING (true);
CREATE POLICY auth_write ON table FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

## Policy Consolidation
```sql
-- ❌ Don't: 4 separate policies
CREATE POLICY select ON t FOR SELECT...
CREATE POLICY insert ON t FOR INSERT...

-- ✅ Do: 1 consolidated policy
CREATE POLICY all_access ON t FOR ALL USING (...) WITH CHECK (...);
```

## Best Practices
- Never bypass RLS in client code
- Use server-side admin client only
- Validate input with Zod
- Store secrets in env vars
- Audit sensitive operations
