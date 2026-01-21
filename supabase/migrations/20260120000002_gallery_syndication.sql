-- Migration: Gallery Syndication Tables
-- Purpose: Enable galleries to be syndicated to external sites like The Harvest
-- Date: 2026-01-20

-- ============================================
-- 1. Gallery Syndication Consent Table
-- ============================================
-- Tracks which galleries have been approved for syndication to which sites
CREATE TABLE IF NOT EXISTS "public"."gallery_syndication_consent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "site_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,

    -- Consent status
    "status" "text" DEFAULT 'pending' NOT NULL,
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",

    -- Permissions
    "allow_full_resolution" boolean DEFAULT false,   -- Allow full-res images
    "allow_download" boolean DEFAULT false,          -- Allow visitors to download
    "allow_embedding" boolean DEFAULT true,          -- Allow embed widget
    "allow_hotlinking" boolean DEFAULT false,        -- Allow direct image URLs

    -- Cultural safety
    "requires_elder_approval" boolean DEFAULT false,
    "elder_approved_by" "uuid",
    "elder_approved_at" timestamp with time zone,
    "cultural_notes" "text",

    -- Expiration
    "expires_at" timestamp with time zone,

    -- Timestamps
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,

    CONSTRAINT "gallery_syndication_consent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gallery_syndication_consent_unique" UNIQUE ("gallery_id", "site_id"),
    CONSTRAINT "gallery_syndication_consent_gallery_fkey" FOREIGN KEY ("gallery_id")
        REFERENCES "public"."galleries"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_syndication_consent_site_fkey" FOREIGN KEY ("site_id")
        REFERENCES "public"."syndication_sites"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_syndication_consent_created_by_fkey" FOREIGN KEY ("created_by")
        REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    CONSTRAINT "gallery_syndication_consent_approved_by_fkey" FOREIGN KEY ("approved_by")
        REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    CONSTRAINT "gallery_syndication_consent_elder_fkey" FOREIGN KEY ("elder_approved_by")
        REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    CONSTRAINT "gallery_syndication_consent_status_check" CHECK (
        "status" = ANY (ARRAY['pending', 'approved', 'denied', 'revoked', 'expired'])
    )
);

ALTER TABLE "public"."gallery_syndication_consent" OWNER TO "postgres";

CREATE INDEX "idx_gallery_syndication_gallery" ON "public"."gallery_syndication_consent" ("gallery_id");
CREATE INDEX "idx_gallery_syndication_site" ON "public"."gallery_syndication_consent" ("site_id");
CREATE INDEX "idx_gallery_syndication_status" ON "public"."gallery_syndication_consent" ("status");
CREATE INDEX "idx_gallery_syndication_tenant" ON "public"."gallery_syndication_consent" ("tenant_id");

-- ============================================
-- 2. Gallery Embed Tokens Table
-- ============================================
-- Secure tokens for external sites to embed galleries
CREATE TABLE IF NOT EXISTS "public"."gallery_embed_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "site_id" "uuid",  -- Optional: link to specific site
    "tenant_id" "uuid" NOT NULL,

    -- Token
    "token" "text" NOT NULL,
    "token_hash" "text" NOT NULL,

    -- Restrictions
    "allowed_domains" "text"[] DEFAULT '{}',
    "allowed_ips" "text"[] DEFAULT '{}',

    -- Status
    "status" "text" DEFAULT 'active' NOT NULL,
    "expires_at" timestamp with time zone,
    "revoked_at" timestamp with time zone,
    "revocation_reason" "text",

    -- Usage tracking
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "last_used_domain" "text",
    "last_used_ip" "text",

    -- Display options
    "show_attribution" boolean DEFAULT true,
    "show_captions" boolean DEFAULT true,
    "max_photos" integer,  -- NULL = show all
    "layout" "text" DEFAULT 'grid',  -- grid, masonry, carousel
    "theme" "text" DEFAULT 'light',  -- light, dark, auto

    -- Timestamps
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",

    CONSTRAINT "gallery_embed_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "gallery_embed_tokens_token_unique" UNIQUE ("token"),
    CONSTRAINT "gallery_embed_tokens_gallery_fkey" FOREIGN KEY ("gallery_id")
        REFERENCES "public"."galleries"("id") ON DELETE CASCADE,
    CONSTRAINT "gallery_embed_tokens_site_fkey" FOREIGN KEY ("site_id")
        REFERENCES "public"."syndication_sites"("id") ON DELETE SET NULL,
    CONSTRAINT "gallery_embed_tokens_created_by_fkey" FOREIGN KEY ("created_by")
        REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    CONSTRAINT "gallery_embed_tokens_status_check" CHECK (
        "status" = ANY (ARRAY['active', 'revoked', 'expired'])
    ),
    CONSTRAINT "gallery_embed_tokens_layout_check" CHECK (
        "layout" = ANY (ARRAY['grid', 'masonry', 'carousel', 'slideshow'])
    )
);

ALTER TABLE "public"."gallery_embed_tokens" OWNER TO "postgres";

CREATE INDEX "idx_gallery_embed_tokens_gallery" ON "public"."gallery_embed_tokens" ("gallery_id");
CREATE INDEX "idx_gallery_embed_tokens_token_hash" ON "public"."gallery_embed_tokens" ("token_hash");
CREATE INDEX "idx_gallery_embed_tokens_status" ON "public"."gallery_embed_tokens" ("status");
CREATE INDEX "idx_gallery_embed_tokens_site" ON "public"."gallery_embed_tokens" ("site_id") WHERE "site_id" IS NOT NULL;

-- ============================================
-- 3. RLS Policies for gallery_syndication_consent
-- ============================================
ALTER TABLE "public"."gallery_syndication_consent" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view syndication consents for their tenant
CREATE POLICY "Gallery syndication viewable by tenant members"
ON "public"."gallery_syndication_consent"
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.tenant_id = gallery_syndication_consent.tenant_id
            OR profiles.tenant_roles && ARRAY['super_admin']
        )
    )
);

-- Admins can manage syndication consents
CREATE POLICY "Gallery syndication manageable by admins"
ON "public"."gallery_syndication_consent"
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.tenant_roles && ARRAY['admin', 'super_admin']
    )
);

-- ============================================
-- 4. RLS Policies for gallery_embed_tokens
-- ============================================
ALTER TABLE "public"."gallery_embed_tokens" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view embed tokens for their tenant
CREATE POLICY "Gallery embed tokens viewable by tenant members"
ON "public"."gallery_embed_tokens"
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.tenant_id = gallery_embed_tokens.tenant_id
            OR profiles.tenant_roles && ARRAY['super_admin']
        )
    )
);

-- Admins can manage embed tokens
CREATE POLICY "Gallery embed tokens manageable by admins"
ON "public"."gallery_embed_tokens"
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.tenant_roles && ARRAY['admin', 'super_admin']
    )
);

-- Service role can read tokens for validation
CREATE POLICY "Service role can read gallery embed tokens"
ON "public"."gallery_embed_tokens"
FOR SELECT TO service_role
USING (true);

-- ============================================
-- 5. Comments
-- ============================================
COMMENT ON TABLE "public"."gallery_syndication_consent" IS 'Tracks consent for syndicating galleries to external sites like The Harvest';
COMMENT ON TABLE "public"."gallery_embed_tokens" IS 'Secure tokens for external sites to embed gallery widgets';

COMMENT ON COLUMN "public"."gallery_syndication_consent"."allow_full_resolution" IS 'Whether to allow access to full resolution images (vs thumbnails only)';
COMMENT ON COLUMN "public"."gallery_syndication_consent"."allow_hotlinking" IS 'Whether to allow direct image URLs (vs embed widget only)';
COMMENT ON COLUMN "public"."gallery_syndication_consent"."requires_elder_approval" IS 'Whether cultural content requires elder/community approval';

COMMENT ON COLUMN "public"."gallery_embed_tokens"."token" IS 'The actual token value (shown once on creation)';
COMMENT ON COLUMN "public"."gallery_embed_tokens"."token_hash" IS 'SHA-256 hash for server-side validation';
COMMENT ON COLUMN "public"."gallery_embed_tokens"."layout" IS 'Default layout style: grid, masonry, carousel, slideshow';

-- ============================================
-- 6. Grant Permissions
-- ============================================
GRANT SELECT ON "public"."gallery_syndication_consent" TO authenticated;
GRANT ALL ON "public"."gallery_syndication_consent" TO service_role;

GRANT SELECT ON "public"."gallery_embed_tokens" TO authenticated;
GRANT ALL ON "public"."gallery_embed_tokens" TO service_role;
