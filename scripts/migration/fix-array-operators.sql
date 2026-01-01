-- Fix for array operator issues in storyteller analytics

-- Update RLS policies to use proper array contains operations
DROP POLICY IF EXISTS "System can manage analytics" ON storyteller_analytics;
DROP POLICY IF EXISTS "Admins can manage themes" ON narrative_themes;
DROP POLICY IF EXISTS "Admins can view platform analytics" ON platform_analytics;
DROP POLICY IF EXISTS "Users can view relevant jobs" ON analytics_processing_jobs;

-- Recreate policies with proper array syntax
CREATE POLICY "System can manage analytics" ON storyteller_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                (p.tenant_roles::jsonb ? 'admin') OR
                (p.tenant_roles::jsonb ? 'super_admin')
            )
        )
    );

CREATE POLICY "Admins can manage themes" ON narrative_themes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                (p.tenant_roles::jsonb ? 'admin') OR
                (p.tenant_roles::jsonb ? 'super_admin')
            )
        )
    );

CREATE POLICY "Admins can view platform analytics" ON platform_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                (p.tenant_roles::jsonb ? 'admin') OR
                (p.tenant_roles::jsonb ? 'super_admin')
            )
        )
    );

CREATE POLICY "Users can view relevant jobs" ON analytics_processing_jobs
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                (p.tenant_roles::jsonb ? 'admin') OR
                (p.tenant_roles::jsonb ? 'super_admin')
            )
        )
    );