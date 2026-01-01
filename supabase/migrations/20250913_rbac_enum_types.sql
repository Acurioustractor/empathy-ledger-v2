-- Migration: RBAC Enum Types for Indigenous Cultural Governance
-- Created: 2025-09-13
-- Description: Comprehensive enum types for Role-Based Access Control system
--              Built with indigenous governance principles and cultural sensitivity
-- Reference: docs/specs/phase-2-organizational-access-tagging/design.md lines 909-978

-- ============================================================================
-- ORGANIZATION ROLE HIERARCHY
-- ============================================================================
-- Represents the indigenous-first role hierarchy where Elder authority takes precedence
-- and cultural knowledge keepers have special privileges for sensitive content

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_role') THEN
        CREATE TYPE organization_role AS ENUM (
            'elder',               -- Highest authority, access to all sacred content
            'cultural_keeper',     -- Guardians of traditional knowledge and practices  
            'knowledge_holder',    -- Specialized keepers of specific cultural domains
            'admin',              -- Technical administrators with system privileges
            'project_leader',     -- Leaders of specific storytelling initiatives
            'storyteller',        -- Community members sharing their stories
            'community_member',   -- General community participants
            'guest',              -- Visitors with limited access
            'cultural_liaison',   -- Bridge-builders between communities
            'archivist'           -- Specialists in cultural preservation and organization
        );
        
        COMMENT ON TYPE organization_role IS 
        'Indigenous-first role hierarchy respecting traditional governance structures. '
        'Elder authority supersedes all other roles, with cultural keepers having '
        'special privileges for sacred and restricted content.';
    END IF;
END
$$;

-- ============================================================================
-- CULTURAL PERMISSION LEVELS
-- ============================================================================
-- Defines access levels for culturally sensitive content with explicit
-- respect for indigenous protocols around sacred and restricted knowledge

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cultural_permission_level') THEN
        CREATE TYPE cultural_permission_level AS ENUM (
            'sacred',        -- Highest restriction: elders only, ceremonial content
            'restricted',    -- Cultural keepers and above: sensitive traditional knowledge
            'community_only', -- Community members and above: internal sharing only
            'educational',   -- Can be shared for approved educational purposes
            'public'         -- Public access allowed: general cultural content
        );
        
        COMMENT ON TYPE cultural_permission_level IS 
        'Cultural sensitivity levels for content access control. Sacred content '
        'requires elder approval, restricted content needs cultural keeper oversight, '
        'and community content is limited to verified community members.';
    END IF;
END
$$;

-- ============================================================================
-- COLLABORATION TYPES
-- ============================================================================
-- Defines different types of cross-organizational partnerships and collaborations
-- that respect indigenous protocols for knowledge sharing and cultural exchange

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_type') THEN
        CREATE TYPE collaboration_type AS ENUM (
            'shared_project',           -- Joint storytelling or preservation projects
            'knowledge_exchange',       -- Formal cultural knowledge sharing agreements
            'ceremonial_partnership',   -- Sacred ceremonial collaborations
            'educational_alliance',     -- Teaching and learning partnerships
            'cultural_preservation',    -- Joint preservation and archival efforts
            'research_partnership',     -- Academic or institutional research collaboration
            'language_revitalization'   -- Language preservation and teaching initiatives
        );
        
        COMMENT ON TYPE collaboration_type IS 
        'Types of inter-organizational collaborations supporting indigenous '
        'cultural preservation, knowledge sharing, and community building efforts.';
    END IF;
END
$$;

-- ============================================================================
-- TAG CATEGORIES
-- ============================================================================
-- Comprehensive categorization system for cultural content that respects
-- indigenous knowledge organization and traditional ways of understanding

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tag_category') THEN
        CREATE TYPE tag_category AS ENUM (
            'traditional_knowledge',   -- Traditional ecological, cultural, and practical knowledge
            'ceremonial',             -- Sacred ceremonies, rituals, and spiritual practices
            'ecological_knowledge',   -- Traditional environmental and land management knowledge
            'medicinal_knowledge',    -- Traditional healing practices and plant knowledge
            'language_preservation',  -- Indigenous language documentation and teaching
            'cultural_practice',      -- Daily cultural practices and social customs
            'historical_event',       -- Significant historical events and oral histories
            'geographical_place',     -- Sacred sites, traditional territories, and place names
            'family_clan',           -- Family histories, clan stories, and genealogical records
            'seasonal_activity',     -- Traditional seasonal practices and ecological calendars
            'artistic_tradition',    -- Traditional arts, crafts, music, and creative expression
            'spiritual_practice'     -- Spiritual beliefs, practices, and sacred knowledge
        );
        
        COMMENT ON TYPE tag_category IS 
        'Cultural content categorization system based on indigenous knowledge '
        'organization principles and traditional ways of understanding the world.';
    END IF;
END
$$;

-- ============================================================================
-- TAG SOURCE TRACKING
-- ============================================================================
-- Tracks the origin and authority of content tags to maintain cultural
-- integrity and respect elder/community designation of sensitive content

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tag_source') THEN
        CREATE TYPE tag_source AS ENUM (
            'manual',              -- Manually applied by users
            'ai_generated',        -- Generated by AI analysis (requires review)
            'community_suggested', -- Suggested by community members
            'elder_designated',    -- Designated by elders (highest authority)
            'imported'            -- Imported from external systems
        );
        
        COMMENT ON TYPE tag_source IS 
        'Source tracking for content tags with special recognition of elder '
        'authority in cultural content designation and community input validation.';
    END IF;
END
$$;

-- ============================================================================
-- SHARING POLICIES
-- ============================================================================
-- Defines organizational policies for content sharing that respect indigenous
-- protocols around knowledge sharing and cultural sensitivity

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sharing_policy') THEN
        CREATE TYPE sharing_policy AS ENUM (
            'open',           -- Open sharing with proper attribution
            'request_based',  -- Sharing requires explicit permission request
            'elder_approved', -- Sharing requires elder approval
            'restricted',     -- Limited sharing within cultural protocols
            'never'          -- Content should never be shared externally
        );
        
        COMMENT ON TYPE sharing_policy IS 
        'Organizational policies for content sharing that respect indigenous '
        'cultural protocols and maintain appropriate access controls.';
    END IF;
END
$$;

-- ============================================================================
-- CONTENT TYPES
-- ============================================================================
-- Defines the various types of cultural content managed within the platform
-- to enable appropriate access controls and cultural handling

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM (
            'story',        -- Individual stories and narratives
            'transcript',   -- Audio/video transcriptions
            'media_asset',  -- Photos, videos, audio recordings
            'gallery',      -- Collections of related media
            'project'       -- Storytelling projects and initiatives
        );
        
        COMMENT ON TYPE content_type IS 
        'Types of cultural content managed within the platform for appropriate '
        'access control and cultural sensitivity handling.';
    END IF;
END
$$;

-- ============================================================================
-- VALIDATION AND INDEXES
-- ============================================================================
-- Add any necessary validation or supporting structures

-- Create a function to validate role hierarchy for future use
CREATE OR REPLACE FUNCTION validate_role_hierarchy(
    assigner_role organization_role,
    assigned_role organization_role
) RETURNS BOOLEAN AS $$
BEGIN
    -- Elder can assign any role
    IF assigner_role = 'elder' THEN
        RETURN TRUE;
    END IF;
    
    -- Cultural keepers can assign roles below them in hierarchy
    IF assigner_role = 'cultural_keeper' AND assigned_role NOT IN ('elder', 'cultural_keeper') THEN
        RETURN TRUE;
    END IF;
    
    -- Knowledge holders can assign storyteller, community_member, guest roles
    IF assigner_role = 'knowledge_holder' AND assigned_role IN ('storyteller', 'community_member', 'guest') THEN
        RETURN TRUE;
    END IF;
    
    -- Admins can assign technical roles but not cultural authority roles
    IF assigner_role = 'admin' AND assigned_role IN ('admin', 'project_leader', 'storyteller', 'community_member', 'guest', 'archivist') THEN
        RETURN TRUE;
    END IF;
    
    -- Project leaders can assign limited roles
    IF assigner_role = 'project_leader' AND assigned_role IN ('storyteller', 'community_member', 'guest') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_role_hierarchy IS 
'Validates role assignment permissions based on indigenous hierarchy principles. '
'Ensures cultural authority roles (elder, cultural_keeper) maintain proper oversight '
'over role assignments while allowing technical roles appropriate permissions.';

-- Add audit logging for enum usage (for future implementation)
COMMENT ON SCHEMA public IS 
'Enhanced with RBAC enum types supporting indigenous governance structures and cultural sensitivity protocols.';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RBAC enum types migration completed successfully. Created 6 enum types with indigenous-first design:';
    RAISE NOTICE '  ✓ organization_role - Indigenous hierarchy with elder authority';
    RAISE NOTICE '  ✓ cultural_permission_level - Cultural sensitivity levels';
    RAISE NOTICE '  ✓ collaboration_type - Cross-organizational partnership types';
    RAISE NOTICE '  ✓ tag_category - Indigenous knowledge organization categories';
    RAISE NOTICE '  ✓ tag_source - Tag origin tracking with elder designation';
    RAISE NOTICE '  ✓ sharing_policy - Cultural protocol-aware sharing policies';
    RAISE NOTICE '  ✓ content_type - Platform content type definitions';
    RAISE NOTICE '  ✓ validate_role_hierarchy() - Role assignment validation function';
END
$$;