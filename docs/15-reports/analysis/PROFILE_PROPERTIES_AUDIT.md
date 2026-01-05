# Profile/Storyteller Properties Audit & Standardization Guide

Generated: 2025-09-30

## Executive Summary

- **115 total columns** in profiles table
- **71 columns populated** in sample data (62%)
- **Significant inconsistencies** across UI components, APIs, and database
- **Recommendations**: Standardize core properties, deprecate unused fields, create clear property mapping

---

## 1. Database Schema (profiles table)

### Core Identity Properties (REQUIRED)
```typescript
id: string                    // UUID primary key
email: string | null          // Auth email
display_name: string          // Primary display name ✓ POPULATED
full_name: string             // Legal/full name ✓ POPULATED
```

### Image Properties
```typescript
profile_image_url: string     // Main profile photo ✓ POPULATED
avatar_url: string | null     // Alternative avatar (redundant?)
profile_image_alt_text: string | null
cover_image_url: string | null
```

**Issues**:
- `avatar_url` vs `profile_image_url` - **duplicate purpose**
- Components inconsistently use `avatarUrl` vs `profile_image_url`

### Bio/Description Properties
```typescript
bio: string                   // Main bio ✓ POPULATED
short_bio: string | null      // Not used
tagline: string | null        // Not used
about_me: string | null       // Redundant with bio
personal_statement: string | null
```

**Issues**:
- **5 different bio fields** but only `bio` is used
- Recommendation: Use `bio` (250 chars) and `about_me` (unlimited) only

### Cultural Properties
```typescript
cultural_background: string | null
cultural_affiliation: string | null
cultural_themes: json
indigenous_affiliation: string | null
mob: string | null            // Indigenous mob/tribe
language_groups: string[]
```

**Issues**:
- `cultural_background` vs `cultural_affiliation` - **overlapping**
- No clear primary field

### Location Properties
```typescript
location: string | null       // Free text location
country: string | null
region: string | null
city: string | null
postcode: string | null
latitude: number | null
longitude: number | null
location_data: json
```

**Issues**:
- **8 location fields** but mostly use free-text `location`
- Structured data (city, country) rarely populated

### Professional Properties
```typescript
occupation: string | null
current_role: string          // ✓ POPULATED (in sample)
skills: string[]
expertise: string[]
industry: string[]
```

### Organization Relationships
```typescript
tenant_id: string             // ✓ LEGACY - being phased out
primary_organization_id: uuid // ✓ NEW - post-migration
tenant_roles: string[]        // ✓ POPULATED ["storyteller"]
organization_role: string | null
```

**Status**: Post-migration, use `primary_organization_id`

### Status & Visibility Flags
```typescript
is_elder: boolean             // ✓ POPULATED
is_featured: boolean          // ✓ POPULATED
is_storyteller: boolean       // ✓ POPULATED
profile_visibility: string    // ✓ POPULATED ("public")
is_active: boolean | null
is_verified: boolean | null
is_public: boolean | null     // Redundant with profile_visibility?
```

**Issues**:
- `is_public`, `profile_visibility`, and `network_visibility` - **overlapping**
- Need single source of truth for visibility

### AI/Analysis Properties (35+ fields!)
```typescript
ai_processing_consent: boolean       // ✓ POPULATED
ai_consent_date: string              // ✓ POPULATED
ai_themes: json                      // ✓ POPULATED
ai_enhanced_bio: string | null
ai_personality_insights: json
impact_score: number                 // ✓ POPULATED
community_leadership_score: number   // ✓ POPULATED
wisdom_sharing_level: string         // ✓ POPULATED
... (30 more AI/analysis fields)
```

**Issues**:
- Massive number of computed/analysis fields
- Many never displayed in UI
- Should these be in a separate `profile_analytics` table?

### Consent & Privacy (Multiple Fields)
```typescript
consent_given: boolean                    // ✓ POPULATED
consent_date: string | null
consent_version: string                   // ✓ POPULATED
ai_processing_consent: boolean            // ✓ POPULATED
quote_sharing_consent: boolean            // ✓ POPULATED
cross_tenant_sharing: boolean             // ✓ POPULATED
privacy_preferences: json                 // ✓ POPULATED
story_use_permissions: json               // ✓ POPULATED
```

### Legacy/Migration Fields (10+ fields)
```typescript
legacy_storyteller_id: string         // ✓ POPULATED
legacy_airtable_id: string            // ✓ POPULATED
legacy_organization_id: string        // ✓ POPULATED
legacy_project_id: string             // ✓ POPULATED
legacy_location_id: string            // ✓ POPULATED
migrated_at: string                   // ✓ POPULATED
migration_quality_score: number       // ✓ POPULATED
airtable_record_id: string | null
```

**Status**: Needed for migration tracking, can be archived later

---

## 2. UI Component Property Usage

### StorytellerProfileCard Component
**Located**: `src/components/ui/storyteller-profile-card.tsx`

**Properties Used** (22 total):
```typescript
interface StorytellerProfileCardProps {
  // Identity
  storytellerId: string          // ✓ Maps to: id
  name: string                   // ✓ Maps to: full_name OR display_name
  displayName?: string           // ✓ Maps to: display_name
  bio?: string                   // ✓ Maps to: bio
  avatarUrl?: string             // ✓ Maps to: profile_image_url (naming mismatch!)

  // Cultural
  culturalBackground?: string    // ✓ Maps to: cultural_background
  culturalAffiliations?: string[]// ✗ NOT IN DATABASE
  isElder?: boolean              // ✓ Maps to: is_elder
  traditionalKnowledgeKeeper?: boolean // ✗ NOT IN DATABASE
  languages?: string[]           // ✓ Maps to: language_groups?

  // Location
  location?: string              // ✓ Maps to: location
  joinedDate?: string            // ✓ Maps to: created_at

  // Metrics
  storiesCount?: number          // ✗ COMPUTED from stories table
  videosCount?: number           // ✗ NOT IN DATABASE
  communitiesCount?: number      // ✗ COMPUTED from organizations

  // Engagement
  followersCount?: number        // ✗ NOT IN DATABASE
  engagementRate?: number        // ✓ Maps to: engagement_rate? (computed)
  lastActive?: string            // ✓ Maps to: last_active?

  // Content
  themes?: string[]              // ✓ Maps to: narrative_themes? or ai_themes?

  // Actions
  showActions?: boolean          // UI-only
  showRemove?: boolean           // UI-only
  canRemove?: boolean            // UI-only
}
```

**Key Issues**:
1. `avatarUrl` prop vs `profile_image_url` database field - **naming inconsistency**
2. `culturalAffiliations` (array) doesn't map to database
3. `traditionalKnowledgeKeeper` not in database
4. `followersCount` not tracked in database
5. `videosCount` not tracked (should be computed from media?)

### Admin Storyteller List
**Located**: `src/app/admin/storytellers/page.tsx`

**Properties Used** (25+ total):
```typescript
interface Storyteller {
  id: string
  display_name: string
  full_name: string
  email: string
  profile_visibility: string
  featured: boolean              // ✓ Maps to: is_featured
  elder: boolean                 // ✓ Maps to: is_elder
  story_count: number            // COMPUTED
  published_stories?: number     // COMPUTED
  draft_stories?: number         // COMPUTED
  last_active: string
  location: string | null
  organisation: string | null    // COMPUTED from relationships
  created_at: string
  bio?: string
  cultural_background?: string
  profile_image_url?: string     // ✓ Correct mapping!
  projects?: string[]            // COMPUTED from relationships
  engagement_rate?: number
  organisations?: Array<{...}>   // COMPUTED from junction table
  project_relationships?: Array<{...}>
  total_views?: number           // COMPUTED
  transcript_count?: number      // COMPUTED
  active_transcripts?: number    // COMPUTED
}
```

**Key Insights**:
- Admin uses `profile_image_url` (correct!)
- Heavily relies on computed fields
- Fetches relationship data via joins

---

## 3. API Endpoint Property Mapping

### GET /api/admin/storytellers
**Selects from database**:
```typescript
profile_image_url,        // ✓ Used correctly
display_name,
full_name,
email,
bio,
cultural_background,
is_elder,
is_featured,
profile_visibility,
primary_organization_id,  // ✓ NEW (post-migration)
profile_organizations,    // JOIN
project_participants      // JOIN
```

**Returns to frontend**:
```typescript
{
  profileImageUrl: string,     // ✗ Renamed from profile_image_url!
  displayName: string,
  // ... etc
}
```

**Issue**: API converts `profile_image_url` → `profileImageUrl` (camelCase),
but frontend expects `profile_image_url` or `avatarUrl`

### Other API Endpoints
Similar patterns throughout - each API has slightly different property names

---

## 4. Critical Issues & Inconsistencies

### 🔴 CRITICAL: Image Property Naming Chaos
| Location | Property Name | Database Field |
|----------|---------------|----------------|
| Database | `profile_image_url` | PRIMARY |
| Database | `avatar_url` | DUPLICATE (unused) |
| StorytellerProfileCard | `avatarUrl` | MISMATCH! |
| Admin API Response | `profileImageUrl` | MISMATCH! |
| Admin List | `profile_image_url` | CORRECT! |

**Recommendation**:
- Database: Keep `profile_image_url`, remove `avatar_url`
- Frontend: Standardize on `profile_image_url` everywhere
- Create type helper to ensure consistency

### 🔴 CRITICAL: Bio Field Redundancy
- 5 different bio-related fields
- Only `bio` is actually used
- Others are never populated

**Recommendation**:
- Keep: `bio` (short, 250 chars)
- Keep: `about_me` (long form, if needed)
- Deprecate: `short_bio`, `tagline`, `personal_statement`

### 🔴 CRITICAL: Location Data Mess
- 8 location-related fields
- Most only use free-text `location`
- Structured fields (city, country) rarely used

**Recommendation**:
- Primary: `location` (free text)
- Optional: `latitude`, `longitude` (for mapping)
- Deprecate: `country`, `region`, `city`, `postcode` unless you plan to populate them

### 🟡 MEDIUM: Visibility/Privacy Overlapping
- `is_public` (boolean)
- `profile_visibility` (enum: "public"|"private"|"draft")
- `network_visibility` (string)
- `stories_visibility` (string)
- `basic_info_visibility`, `professional_visibility`, etc.

**Recommendation**:
- Single source: `profile_visibility` enum
- Granular permissions: `privacy_preferences` JSON
- Remove: `is_public` (redundant)

### 🟡 MEDIUM: Cultural Fields Need Structure
- `cultural_background` (string)
- `cultural_affiliation` (string?)
- `indigenous_affiliation` (string?)
- `mob` (string?)
- `cultural_themes` (json)

**Recommendation**:
Define clear data structure:
```typescript
{
  cultural_background: string,          // Primary identity
  indigenous_affiliations: string[],    // Array of nations/tribes
  language_groups: string[],            // Languages spoken
  cultural_themes: string[]             // Themes/topics of expertise
}
```

### 🟢 LOW: AI/Analytics Field Explosion
- 35+ AI/computed fields in main profiles table
- Most never displayed to users
- Clutters main table

**Recommendation**:
- Move to separate `profile_analytics` table
- Only keep user-facing scores in main table:
  - `impact_score`
  - `community_leadership_score`
  - `wisdom_sharing_level`

---

## 5. Recommended Standardization

### Core Profile Properties (Always Include)
```typescript
interface CoreProfile {
  id: string
  email: string | null
  display_name: string
  full_name: string
  profile_image_url: string | null
  bio: string | null
  location: string | null
  created_at: string
  updated_at: string
}
```

### Extended Profile Properties (Include When Needed)
```typescript
interface ExtendedProfile extends CoreProfile {
  // Cultural
  cultural_background: string | null
  indigenous_affiliations: string[]
  language_groups: string[]

  // Professional
  current_role: string | null
  expertise_areas: string[]

  // Organization
  primary_organization_id: string

  // Status
  is_elder: boolean
  is_featured: boolean
  is_storyteller: boolean
  profile_visibility: 'public' | 'private' | 'draft'

  // Consent
  ai_processing_consent: boolean
  consent_given: boolean
}
```

### Computed Profile Properties (Never in Database)
```typescript
interface ComputedProfile {
  story_count: number                    // COUNT from stories table
  transcript_count: number               // COUNT from transcripts table
  organizations: Organization[]          // JOIN profile_organizations
  projects: Project[]                    // JOIN project_participants
  engagement_rate: number                // Calculated
}
```

---

## 6. Action Plan for Standardization

### Phase 1: Critical Fixes (Do Now)
1. **Fix image property naming**
   - Create type alias: `type ProfileImageUrl = string`
   - Update all components to use `profile_image_url`
   - Remove `avatar_url` from database

2. **Consolidate bio fields**
   - Keep `bio` only
   - Migrate any `about_me` content to `bio`

3. **Fix API response mapping**
   - Stop converting `profile_image_url` to `profileImageUrl`
   - Return snake_case from APIs to match database

### Phase 2: Cleanup (Next Sprint)
4. **Remove unused fields** (after backup):
   - `short_bio`, `tagline`, `personal_statement`
   - `is_public` (use `profile_visibility`)
   - Unused location fields

5. **Move analytics to separate table**
   - Create `profile_analytics` table
   - Move 30+ AI fields there
   - Keep only user-facing scores in main table

### Phase 3: Documentation (Ongoing)
6. **Create TypeScript types**
   - `CoreProfile`, `ExtendedProfile`, `ComputedProfile`
   - Export from single source
   - Use across entire codebase

7. **API response standards**
   - Document which fields each endpoint returns
   - Create validation schemas
   - Test responses match types

---

## 7. Property Usage Matrix

| Property | Database | Card Component | Admin List | API Response | Recommendation |
|----------|----------|----------------|------------|--------------|----------------|
| `id` | ✓ | ✓ (`storytellerId`) | ✓ | ✓ | ✅ Keep |
| `profile_image_url` | ✓ | ✗ (uses `avatarUrl`) | ✓ | ✗ (renamed) | 🔧 Fix naming |
| `display_name` | ✓ | ✓ | ✓ | ✓ | ✅ Keep |
| `full_name` | ✓ | ✓ (`name`) | ✓ | ✓ | ✅ Keep |
| `bio` | ✓ | ✓ | ✓ | ✓ | ✅ Keep |
| `is_elder` | ✓ | ✓ | ✓ | ✓ | ✅ Keep |
| `is_featured` | ✓ | ✗ | ✓ | ✓ | ⚠️ Add to card |
| `location` | ✓ | ✓ | ✓ | ✓ | ✅ Keep |
| `cultural_background` | ✓ | ✓ | ✓ | ✓ | ✅ Keep |
| `avatar_url` | ✓ | ✗ | ✗ | ✗ | ❌ Remove (duplicate) |
| `short_bio` | ✓ | ✗ | ✗ | ✗ | ❌ Remove (unused) |
| `cultural_affiliations` | ✗ | ✓ | ✗ | ✗ | 🔧 Add to DB or remove from component |
| `traditional_knowledge_keeper` | ✗ | ✓ | ✗ | ✗ | 🔧 Add to DB or remove from component |
| `followers_count` | ✗ | ✓ | ✗ | ✗ | 🔧 Need followers table? |
| `story_count` | ✗ | ✓ | ✓ | ✓ | ✅ Computed (keep) |

---

## 8. Next Steps

1. **Review this document** with team
2. **Prioritize fixes** from Action Plan
3. **Create migration scripts** for Phase 1 changes
4. **Update TypeScript types** across codebase
5. **Test all changes** thoroughly before deploy

---

## Appendix: Full Property List by Category

See database audit output above for complete 115-column breakdown.