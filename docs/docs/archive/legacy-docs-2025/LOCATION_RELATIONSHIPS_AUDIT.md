# Location & Relationships Audit

Generated: 2025-09-30

## Executive Summary

✅ **Good News**: You have a dedicated `locations` table with 40 records!
❌ **Problem**: Nothing is linked to it! All tables use free-text location fields instead.

### Key Findings:
- **Locations table exists** with structured data (city, state, country, lat/long)
- **0% utilization** - no foreign keys pointing to locations table
- **All tables use free-text `location` fields** instead of FK relationships
- **Stories have NO location field at all** - major gap!
- **Transcripts missing story_id and location_id FKs**

---

## 1. Current Location Table Structure

### ✅ `locations` Table (40 records)
```typescript
{
  id: uuid                      // Primary key
  created_at: timestamp
  updated_at: timestamp
  name: string                  // "Newcastle"
  city: string                  // "Newcastle"
  state: string                 // "NSW"
  country: string               // "Australia"
  postal_code: string | null
  latitude: number | null       // ⚠️ Not populated
  longitude: number | null      // ⚠️ Not populated
}
```

**Status**: Well-structured table, but **completely unused**!

---

## 2. Location Fields by Table

### Stories (252 records)
```
Location Fields: NONE ❌
```

**Critical Issue**: Stories have no way to store location data!

**Relationships Present**:
- ✅ `organization_id` → organizations
- ✅ `author_id` → profiles
- ❌ `project_id` (all null)
- ❌ `storyteller_id` (all null)
- ❌ `location_id` (doesn't exist!)

**Sample Story**:
```json
{
  "organization_id": "612ce757-0a76-4afa-b59c-505bd4880f71",
  "author_id": "337766a9-d0ca-405c-acc1-7be7b13a6d4c",
  "project_id": null,
  "storyteller_id": null
}
```

### Transcripts
```
Location Fields: NONE ❌
```

**Critical Issue**: Transcripts also have no location storage!

**Relationships Present**:
- ❌ `story_id` (missing from sample!)
- ✅ `storyteller_id` → profiles
- ✅ `project_id` → projects
- ❌ `location_id` (doesn't exist!)
- ❌ `organization_id` (doesn't exist!)

**Problem**: Transcripts should link back to stories, but FK may be missing or null.

### Organizations (18 records)
```
Location Fields:
  - location: string (free text) ✓ POPULATED
```

**Sample**: `"Palm Island, Queensland"`

**Issue**: Using free text instead of FK to locations table.

**Relationships**:
- ✅ `tenant_id` (legacy, being phased out)

### Projects (9 records)
```
Location Fields:
  - location: string (free text) ✓ POPULATED
```

**Sample**: `"Indigenous communities across Canada"`

**Issue**: Using free text instead of FK to locations table.

**Relationships**:
- ✅ `organization_id` → organizations ✓
- ✅ `tenant_id` → (legacy)

### Profiles (235 records)
```
Location Fields:
  - location: string (free text)
  - location_data: json | null
  - geographic_connections: array
  - geographic_scope: string
  - legacy_location_id: uuid
  - country, region, city, postcode (structured but mostly empty)
```

**Sample**:
```json
{
  "geographic_connections": ["Spain"],
  "location_data": null,
  "legacy_location_id": "e9fef1b5-e607-4bff-876d-2f6d79a29983",
  "geographic_scope": null
}
```

**Issues**:
- `legacy_location_id` points to old system
- Multiple location representations (free text + structured + json)
- No current FK to locations table

---

## 3. Relationship Mapping

### Current State

```
┌─────────────────┐
│   locations     │  ◄── Orphaned! No FKs point here
│   (40 records)  │
└─────────────────┘

┌─────────────────┐     ┌──────────────────┐
│  organizations  │────►│   projects       │
│   (18 records)  │     │   (9 records)    │
│                 │     │                  │
│ location: text  │     │ location: text   │
└─────────────────┘     └──────────────────┘
         │
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│    profiles     │     │    stories       │
│  (235 records)  │────►│  (252 records)   │
│                 │     │                  │
│ location: text  │     │ NO LOCATION! ❌  │
│ (8 loc fields!) │     └──────────────────┘
└─────────────────┘              │
                                 │ (missing story_id FK?)
                                 ▼
                        ┌──────────────────┐
                        │   transcripts    │
                        │                  │
                        │ NO LOCATION! ❌  │
                        └──────────────────┘
```

### Missing Relationships

1. **Stories → Locations** (doesn't exist)
2. **Transcripts → Stories** (should exist but may be broken)
3. **Transcripts → Locations** (doesn't exist)
4. **Organizations → Locations** (should use FK not text)
5. **Projects → Locations** (should use FK not text)
6. **Profiles → Locations** (has legacy_location_id but not current)

---

## 4. Data Completeness Analysis

### Location Data Population

| Table | Total Records | With Location | % |
|-------|--------------|---------------|---|
| Stories | 252 | 0 | 0% ❌ |
| Transcripts | ? | 0 | 0% ❌ |
| Organizations | 18 | 18 | 100% ✅ (free text) |
| Projects | 9 | 9 | 100% ✅ (free text) |
| Profiles | 235 | ~60% | ~60% (free text) |

### Locations Table Usage
- **40 structured locations** available
- **0 tables** actually use them
- **100% unutilized**

---

## 5. Critical Issues & Recommendations

### 🔴 CRITICAL: Stories Have No Location Field
**Problem**: Stories can't store where they happened.

**Solution**: Add location fields to stories table:
```sql
ALTER TABLE stories
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN location_text TEXT,  -- Free text fallback
  ADD COLUMN latitude DECIMAL,
  ADD COLUMN longitude DECIMAL;

CREATE INDEX idx_stories_location ON stories(location_id);
```

**Use Case**: Map view showing stories by location, filtering by region, etc.

### 🔴 CRITICAL: Transcripts Missing story_id Relationship
**Problem**: Can't link transcript back to original story.

**Investigation Needed**:
```sql
-- Check if column exists but is null
SELECT COUNT(*) FROM transcripts WHERE story_id IS NULL;

-- Check if column doesn't exist
\d transcripts
```

**Solution** (if missing):
```sql
ALTER TABLE transcripts
  ADD COLUMN story_id UUID REFERENCES stories(id);

CREATE INDEX idx_transcripts_story ON transcripts(story_id);
```

### 🔴 CRITICAL: Locations Table Unused
**Problem**: Built a structured locations table but nothing uses it.

**Solution Options**:

**Option A: Full Migration to FK Relationships** (Recommended)
```sql
-- 1. Add location_id to all tables
ALTER TABLE stories ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE transcripts ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE organizations ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE projects ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE profiles ADD COLUMN location_id UUID REFERENCES locations(id);

-- 2. Keep free-text as fallback
-- (Don't remove location/location_text columns)

-- 3. Populate location_id where possible
UPDATE organizations SET location_id = (
  SELECT id FROM locations
  WHERE city = organizations.location
  OR name = organizations.location
  LIMIT 1
);
```

**Option B: Hybrid Approach** (Easier)
```sql
-- Keep free text for flexibility
-- Add FK for when specific location is known
-- Provide autocomplete UI that creates location records
```

### 🟡 MEDIUM: Multiple Location Representations
**Problem**: Profiles have 8+ location fields (free text + structured + json + legacy).

**Solution**: Standardize on:
```typescript
{
  location: string,              // Primary free text (for display)
  location_id: uuid | null,      // FK to locations (when structured)
  latitude: number | null,       // For mapping
  longitude: number | null       // For mapping
}
```

Remove:
- `location_data` (json) - redundant
- `country`, `region`, `city`, `postcode` - use locations table
- `geographic_connections` - unclear purpose
- `geographic_scope` - unclear purpose

### 🟡 MEDIUM: Organizations/Projects Using Free Text
**Problem**: Free text "Palm Island, Queensland" vs structured data.

**Solution**:
1. Add `location_id` FK
2. Keep `location` text for custom descriptions
3. Provide location picker UI that:
   - Searches locations table
   - Creates new location if not found
   - Sets both location_id and location_text

---

## 6. Proposed Schema Changes

### Phase 1: Add Location Support to Stories & Transcripts
```sql
-- Stories
ALTER TABLE stories
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN location_text TEXT,
  ADD COLUMN latitude DECIMAL(10, 8),
  ADD COLUMN longitude DECIMAL(11, 8);

CREATE INDEX idx_stories_location ON stories(location_id);
CREATE INDEX idx_stories_coordinates ON stories(latitude, longitude);

-- Transcripts
ALTER TABLE transcripts
  ADD COLUMN story_id UUID REFERENCES stories(id),  -- If missing
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN organization_id UUID REFERENCES organizations(id);  -- If missing

CREATE INDEX idx_transcripts_story ON transcripts(story_id);
CREATE INDEX idx_transcripts_location ON transcripts(location_id);
CREATE INDEX idx_transcripts_org ON transcripts(organization_id);
```

### Phase 2: Add Location FKs to Existing Tables
```sql
-- Organizations
ALTER TABLE organizations
  ADD COLUMN location_id UUID REFERENCES locations(id);

CREATE INDEX idx_organizations_location ON organizations(location_id);

-- Projects
ALTER TABLE projects
  ADD COLUMN location_id UUID REFERENCES locations(id);

CREATE INDEX idx_projects_location ON projects(location_id);

-- Profiles
ALTER TABLE profiles
  ADD COLUMN location_id UUID REFERENCES locations(id);

CREATE INDEX idx_profiles_location ON profiles(location_id);
```

### Phase 3: Enhance Locations Table
```sql
-- Add missing useful fields
ALTER TABLE locations
  ADD COLUMN description TEXT,
  ADD COLUMN indigenous_territory TEXT,  -- Traditional lands
  ADD COLUMN language_group TEXT,        -- Local indigenous language
  ADD COLUMN cultural_significance TEXT,
  ADD COLUMN timezone TEXT,
  ADD COLUMN region_type TEXT,           -- "community", "city", "territory", etc.
  ADD COLUMN parent_location_id UUID REFERENCES locations(id);  -- Hierarchical

CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_parent ON locations(parent_location_id);
```

---

## 7. Relationship Integrity Checks

### Stories
```sql
-- Check orphaned stories (no organization)
SELECT COUNT(*) FROM stories WHERE organization_id IS NULL;

-- Check stories with invalid organization_id
SELECT COUNT(*)
FROM stories s
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE s.organization_id IS NOT NULL AND o.id IS NULL;

-- Check stories with no author
SELECT COUNT(*) FROM stories WHERE author_id IS NULL;
```

### Transcripts
```sql
-- Check transcripts without story link
SELECT COUNT(*) FROM transcripts WHERE story_id IS NULL;

-- Check transcripts with invalid story_id
SELECT COUNT(*)
FROM transcripts t
LEFT JOIN stories s ON t.story_id = s.id
WHERE t.story_id IS NOT NULL AND s.id IS NULL;
```

### Projects
```sql
-- Check projects without organization
SELECT COUNT(*) FROM projects WHERE organization_id IS NULL;

-- Check projects with invalid organization_id
SELECT COUNT(*)
FROM projects p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.organization_id IS NOT NULL AND o.id IS NULL;
```

---

## 8. Implementation Recommendations

### Immediate Actions (This Sprint)
1. ✅ **Add location_id FK to stories table** (blocking feature work)
2. ✅ **Verify/fix transcripts.story_id FK** (data integrity)
3. ✅ **Add location_id FK to transcripts** (consistency)

### Short Term (Next Sprint)
4. 📍 **Add location_id FK to organizations, projects, profiles**
5. 🗺️ **Build location picker UI component** (autocomplete from locations table)
6. 📊 **Populate existing records with location_id where possible**

### Medium Term (Next Month)
7. 🏗️ **Enhance locations table** (indigenous territories, cultural significance)
8. 🗺️ **Build map view** showing stories/projects by location
9. 🧹 **Clean up redundant location fields** in profiles table

### Long Term (Future)
10. 📱 **Location-based features** (nearby stories, regional filtering)
11. 🌍 **Hierarchical locations** (community → region → country)
12. 🔍 **Advanced search by location**

---

## 9. UI/UX Considerations

### Location Input Component
```typescript
<LocationPicker
  value={locationId}
  onChange={handleLocationChange}
  allowFreeText={true}           // Fallback to text if not in locations table
  createIfNotFound={true}        // Auto-create new location records
  showMap={true}                 // Visual map picker for lat/long
  filterByCountry="Australia"    // Optional filtering
/>
```

### Display Patterns
```typescript
// When location_id exists
<LocationDisplay
  locationId={story.location_id}
  fallback={story.location_text}
  showMap={true}
  showDistance={currentUserLocation}
/>

// When only text exists
<TextLocation text={story.location_text} />
```

---

## 10. Migration Script Example

```sql
-- Migrate organizations to use locations table
DO $$
DECLARE
  org RECORD;
  loc_id UUID;
BEGIN
  FOR org IN SELECT id, location FROM organizations WHERE location IS NOT NULL
  LOOP
    -- Try to find existing location
    SELECT id INTO loc_id FROM locations
    WHERE LOWER(name) = LOWER(org.location)
    OR LOWER(city) = LOWER(org.location)
    LIMIT 1;

    -- If not found, create it
    IF loc_id IS NULL THEN
      INSERT INTO locations (name, city, country, created_at, updated_at)
      VALUES (
        org.location,
        split_part(org.location, ',', 1),  -- Extract city
        'Australia',  -- Default country
        NOW(),
        NOW()
      )
      RETURNING id INTO loc_id;
    END IF;

    -- Update organization
    UPDATE organizations SET location_id = loc_id WHERE id = org.id;
  END LOOP;
END $$;
```

---

## Summary

### Current State
- ✅ Locations table exists and is well-structured
- ❌ Completely unused - no FKs pointing to it
- ❌ Stories have no location storage at all
- ❌ All tables use free-text locations instead
- ❌ Transcripts may be missing story_id FK

### Recommended State
```
locations (structured location data)
    ▲
    │
    ├─► stories.location_id
    ├─► transcripts.location_id
    ├─► organizations.location_id
    ├─► projects.location_id
    └─► profiles.location_id

Each table also keeps:
    - location_text (free text fallback)
    - latitude/longitude (for mapping)
```

### Next Steps
1. Review this document
2. Prioritize which tables need location_id first
3. Run migration scripts to add FK columns
4. Build location picker UI component
5. Gradually populate location_id fields