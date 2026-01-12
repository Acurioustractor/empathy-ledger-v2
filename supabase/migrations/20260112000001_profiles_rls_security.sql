-- Migration: Enable RLS on profiles table (CRITICAL SECURITY FIX)
-- Created: 2026-01-12
-- Author: Database Production Readiness Review
-- Priority: BLOCKING - Profiles table contains PII and has NO RLS

-- CRITICAL SECURITY ISSUE:
-- The profiles table stores:
-- - Email addresses
-- - Phone numbers
-- - Full names
-- - Cultural identity information
-- - Privacy preferences
-- - Consent records
--
-- Currently this table has NO Row-Level Security, exposing all user data.

BEGIN;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 4: Organization admins can view profiles in their org
CREATE POLICY "Org admins can view member profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id IN (
          SELECT organization_id
          FROM organization_members
          WHERE profile_id = profiles.id
        )
        AND om.role IN ('admin', 'elder', 'cultural_advisor', 'board_member')
    )
  );

-- Policy 5: Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions sap
      WHERE sap.profile_id = auth.uid()
        AND sap.is_active = TRUE
        
    )
  );

-- Policy 6: Super admins can update profiles (for support/moderation)
CREATE POLICY "Super admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions sap
      WHERE sap.profile_id = auth.uid()
        AND sap.is_active = TRUE
        
    )
  );

-- Verification query (run after migration)
-- Expected: rowsecurity = TRUE
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'profiles';

  IF NOT rls_enabled THEN
    RAISE EXCEPTION 'CRITICAL: RLS not enabled on profiles table after migration!';
  END IF;

  RAISE NOTICE 'SUCCESS: RLS enabled on profiles table';
END $$;

COMMIT;

-- Down Migration (for rollback - USE WITH EXTREME CAUTION)
-- WARNING: Disabling RLS exposes ALL user PII!
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Org admins can view member profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- COMMIT;
