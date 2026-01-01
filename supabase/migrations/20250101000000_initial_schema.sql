-- Initial Schema Migration
-- Created: 2026-01-02
-- Purpose: Establish core tables that were originally created manually in Supabase Studio
-- Risk: LOW (idempotent with IF NOT EXISTS on tables)
-- Reversible: NO (but safe - won't drop existing tables)

-- This migration creates the foundational tables that all other migrations depend on.
-- Tables are created in dependency order to satisfy foreign key constraints.

-- ============================================================================
-- 1. TENANTS (Multi-tenant isolation root)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_read" ON public.tenants;
CREATE POLICY "tenants_read" ON public.tenants
  FOR SELECT USING (true);

-- ============================================================================
-- 2. ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_organizations_tenant ON public.organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

DROP POLICY IF EXISTS "organizations_read" ON public.organizations;
CREATE POLICY "organizations_read" ON public.organizations
  FOR SELECT USING (true);

-- ============================================================================
-- 3. PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_storyteller BOOLEAN DEFAULT false,
  is_community_representative BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- ============================================================================
-- 4. PROFILE_ORGANIZATIONS (Junction for roles - CRITICAL!)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'elder', 'project_leader', 'member', 'viewer')),
  UNIQUE(profile_id, organization_id)
);

ALTER TABLE public.profile_organizations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profile_orgs_profile ON public.profile_organizations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_orgs_org ON public.profile_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_profile_orgs_composite ON public.profile_organizations(organization_id, profile_id, role);

DROP POLICY IF EXISTS "profile_orgs_read_own" ON public.profile_organizations;
CREATE POLICY "profile_orgs_read_own" ON public.profile_organizations
  FOR SELECT USING (auth.uid() = profile_id);

-- ============================================================================
-- 5. PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_organization ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON public.projects(tenant_id);

DROP POLICY IF EXISTS "projects_read" ON public.projects;
CREATE POLICY "projects_read" ON public.projects
  FOR SELECT USING (true);

-- ============================================================================
-- 6. STORIES (Core content)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  storyteller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'private')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'community', 'restricted')),
  consent_obtained BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  cultural_themes TEXT[],
  ai_themes TEXT[]
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stories_organization ON public.stories(organization_id);
CREATE INDEX IF NOT EXISTS idx_stories_project ON public.stories(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON public.stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_tenant ON public.stories(tenant_id);

DROP POLICY IF EXISTS "stories_read_published" ON public.stories;
CREATE POLICY "stories_read_published" ON public.stories
  FOR SELECT USING (status = 'published');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.tenants;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.organizations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.stories;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
