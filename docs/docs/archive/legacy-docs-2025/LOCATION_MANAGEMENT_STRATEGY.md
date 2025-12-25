# Location Management Strategy

## Current State Analysis

### Data Quality (40 locations total)
- ✅ **Complete**: 29 locations (73%) - Have name, city, state, country properly structured
- ⚠️ **Name only**: 8 locations (20%) - Full address stored in `name` field (e.g., "Hobart, TAS, Australia")
- ⚠️ **Partial**: 3 locations (7%) - Missing some structured fields

### Profile Coverage
- **Total profiles**: 235
- **Profiles with locations**: 41 (17%)
- **Profiles without locations**: 194 (83%)

### Key Issues
1. Some locations have full address in `name` field instead of structured data
2. Only 17% of profiles have location data
3. Inconsistent data entry patterns

---

## Recommended Strategy

### 1. **Normalize Existing Location Data**

#### Phase 1: Parse Name-Only Locations
Create a migration script to parse locations like "Hobart, TAS, Australia" into structured fields:

```javascript
// Example parsing logic
"Hobart, TAS, Australia" →
  name: "Hobart"
  city: "Hobart"
  state: "TAS"
  country: "Australia"
```

**Affected locations** (8 total):
- Melbourne, VIC, Australia
- Sydney, NSW, Australia
- Brisbane, QLD, Australia
- Hobart, TAS, Australia
- Adelaide, SA, Australia
- Mount Isa, Qld
- Gladstone, Qld

#### Phase 2: Standardize State Names
- Convert abbreviations to full names OR maintain consistent abbreviations
- Current: Mix of "NSW", "New South Wales", "Qld", "Queensland"
- **Recommendation**: Keep abbreviations (NSW, VIC, QLD, etc.) for Australian states

---

### 2. **Location Entry Workflow** (For Future Data)

#### Option A: Autocomplete with Validation (Recommended)
Use the LocationPicker component that's already created:

**Benefits:**
- Searches existing locations first (reduces duplicates)
- Enforces structured data entry (city, state, country fields)
- Allows fallback to free text if needed
- Auto-creates location records with proper structure

**Implementation:**
```tsx
<LocationPicker
  value={locationId}
  textValue={locationText}
  onChange={(id, text) => handleLocationChange(id, text)}
  allowFreeText={true}          // Fallback for unusual locations
  createIfNotFound={true}        // Auto-create new locations
  showCoordinates={true}         // Optional: for mapping
  filterByCountry="Australia"    // Default to Australia
/>
```

#### Option B: Manual Entry with Structured Fields
Separate input fields for city, state, country:
- **Pros**: Guaranteed structured data
- **Cons**: More friction, duplicate entries, typos

**Recommendation**: Use Option A (LocationPicker)

---

### 3. **Data Governance Rules**

#### Location Record Standards
```typescript
{
  name: "City Name",           // City name only (no state/country)
  city: "City Name",           // Same as name for cities
  state: "STATE",              // Abbreviation (NSW, VIC, QLD, etc.)
  country: "Australia",        // Full country name
  postal_code: "2000",         // Optional
  latitude: -33.8688,          // Optional but recommended
  longitude: 151.2093,         // Optional but recommended
  indigenous_territory: "...", // Cultural significance
  language_group: "..."        // Indigenous language
}
```

#### Special Location Types
1. **Traditional Territory**: For Indigenous connections without specific city
   - name: "Traditional Territory"
   - country: "Indigenous Territory"
   - Populate indigenous_territory and language_group fields

2. **Remote Communities**: Small communities not in standard databases
   - Use closest major city as reference
   - Add description field with detail

---

### 4. **Profile Location Workflow**

#### Current: Junction Table `profile_locations`
```sql
profile_locations (
  profile_id → profiles.id
  location_id → locations.id
  is_primary BOOLEAN       -- Primary location
  location_type TEXT       -- 'mentioned_in_bio', 'current', 'traditional', etc.
)
```

#### Recommended Location Types
- `current` - Where they currently live
- `traditional` - Traditional country/territory
- `born` - Birthplace
- `mentioned_in_bio` - Extracted from profile text
- `story_location` - Frequently mentioned in stories

#### Best Practice: Allow Multiple Locations Per Profile
```typescript
// Example: Profile can have multiple locations
{
  primary: "Sydney, NSW, Australia" (current)
  secondary: "Traditional Territory" (traditional)
  tertiary: "Katherine, NT, Australia" (born)
}
```

---

### 5. **Migration Plan for Existing Data**

#### Step 1: Parse Name-Only Locations (8 locations)
```sql
-- Example for "Hobart, TAS, Australia"
UPDATE locations
SET
  name = 'Hobart',
  city = 'Hobart',
  state = 'TAS'
WHERE name = 'Hobart, TAS, Australia';
```

#### Step 2: Backfill Profile Locations (194 profiles without locations)

**Sources for location data:**
1. Extract from bio/personal statement fields
2. Infer from email domain (if organization-based)
3. Check organization's location
4. Review story/transcript content
5. Manual review for high-profile storytellers

**Recommended**: Create an admin tool to assist with bulk location assignment

#### Step 3: Validate All Locations
- Ensure no duplicate entries
- Verify state/country combinations
- Add coordinates for mapping (can use geocoding API)

---

### 6. **UI Integration Points**

#### Where to Add Location Pickers
1. ✅ **Profile Edit Page** - Primary and traditional locations
2. ✅ **Story Creation** - Where the story took place
3. ✅ **Transcript Creation** - Interview location
4. ✅ **Organization Settings** - Org headquarters
5. ✅ **Project Settings** - Project location/region

#### Display Guidelines
- **Profile Cards**: Show primary location only
- **Full Profile**: Show all locations with type labels
- **Admin Lists**: Show primary location in table
- **Maps**: Plot all locations with type filtering

---

### 7. **Technical Implementation Checklist**

#### Immediate Actions (Already Complete ✅)
- [x] LocationPicker component created
- [x] `/api/locations` endpoints (GET, POST)
- [x] `/api/locations/[id]` endpoints (GET, PUT, DELETE)
- [x] API integration with admin storytellers list
- [x] Fixed duplicate location string display

#### Next Steps (Recommended Priority Order)
1. **Create location normalization script** (parse name-only locations)
   - Script to update 8 name-only locations
   - Test on staging before production

2. **Add LocationPicker to profile edit pages**
   - Replace any text inputs with LocationPicker
   - Support multiple locations per profile

3. **Create admin location management page**
   - View all locations
   - Merge duplicates
   - Bulk edit/normalize

4. **Backfill missing profile locations**
   - Extract from bios (AI-assisted)
   - Manual review for accuracy
   - Batch import tool

5. **Add coordinates to locations**
   - Use Google Maps Geocoding API
   - Enables map visualizations

6. **Create location-based insights**
   - Stories by region
   - Storyteller distribution map
   - Cultural territory visualization

---

## Summary: Best Practice Going Forward

### For New Profiles
1. **Require location during onboarding** (at least city/state)
2. **Use LocationPicker component** for all location inputs
3. **Support multiple locations** (current + traditional at minimum)

### For Existing Data
1. **Run normalization script** to fix 8 name-only locations
2. **Backfill 194 profiles** without locations (phased approach)
3. **Add coordinates** to enable mapping features

### For Long-term Maintenance
1. **Prevent duplicate locations** via LocationPicker autocomplete
2. **Regular audits** of location data quality
3. **Cultural sensitivity** for Indigenous territories
4. **User control** over location privacy/visibility

---

## Example Implementation Code

### Profile Edit - Add Location
```tsx
import { LocationPicker } from '@/components/ui/location-picker'

export function ProfileEditForm({ profile }) {
  const [primaryLocationId, setPrimaryLocationId] = useState(profile.primary_location_id)
  const [traditionalLocationId, setTraditionalLocationId] = useState(null)

  return (
    <form>
      {/* Current Location */}
      <div>
        <label>Current Location</label>
        <LocationPicker
          value={primaryLocationId}
          onChange={(id) => setPrimaryLocationId(id)}
          filterByCountry="Australia"
          createIfNotFound={true}
        />
      </div>

      {/* Traditional Territory */}
      <div>
        <label>Traditional Country/Territory</label>
        <LocationPicker
          value={traditionalLocationId}
          onChange={(id) => setTraditionalLocationId(id)}
          allowFreeText={true}
          showCulturalInfo={true}
        />
      </div>
    </form>
  )
}
```

### Save Multiple Locations
```typescript
async function saveProfileLocations(profileId: string, locations: Array<{
  location_id: string
  location_type: string
  is_primary: boolean
}>) {
  // Delete existing locations
  await supabase
    .from('profile_locations')
    .delete()
    .eq('profile_id', profileId)

  // Insert new locations
  await supabase
    .from('profile_locations')
    .insert(locations.map(loc => ({
      profile_id: profileId,
      location_id: loc.location_id,
      location_type: loc.location_type,
      is_primary: loc.is_primary
    })))
}
```

---

## Key Metrics to Track

### Data Quality
- % of locations with complete structured data (target: 100%)
- % of profiles with at least one location (target: 90%+)
- Number of duplicate locations (target: 0)

### Usage
- Stories mapped by location
- Most common locations
- Cultural territory coverage

### Privacy
- % of profiles with public vs private location
- User control over location visibility