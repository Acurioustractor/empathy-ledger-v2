# Backfilling Profile Locations Guide

## Overview
**Status**: 41/235 profiles (17%) have locations
**Missing**: 194 profiles need locations
**Tool**: [Admin Location Manager](http://localhost:3030/admin/locations)

---

## Priority Order

### Phase 1: High-Value Profiles (Immediate)
1. **Elders** - Cultural significance
2. **Featured storytellers** - Public-facing
3. **Profiles with published stories** - Active content creators
4. **Profiles with transcripts** - Interview subjects

### Phase 2: Active Users (Week 2)
5. Profiles with recent activity
6. Profiles linked to active projects
7. Team members and staff

### Phase 3: Remaining (Ongoing)
8. All other profiles
9. Test/demo accounts (optional)

---

## How to Use the Admin Location Tool

### Step 1: Access the Tool
Visit: [http://localhost:3030/admin/locations](http://localhost:3030/admin/locations)

### Step 2: Filter to "Missing Locations"
- The checkbox "Show only profiles without locations" is checked by default
- This filters to 194 profiles

### Step 3: Search (Optional)
- Use the search box to find specific profiles by name or email
- Helpful for priority assignments

### Step 4: Select a Profile
- Click any profile card in the left panel
- The right panel shows location assignment form

### Step 5: Assign Locations

#### Primary Location (Required)
- Type in the location picker to search existing locations
- Australia locations will auto-suggest
- If location doesn't exist, you can create it
- Examples: "Melbourne", "Katherine", "Palm Island"

#### Traditional Territory (Optional)
- Important for Indigenous storytellers
- Can be specific (e.g., "Wiradjuri Country") or general
- Use "Traditional Territory" if unknown but culturally relevant

### Step 6: Save
- Click "Save Locations" button
- Profile updates immediately
- Select next profile and repeat

---

## Tips for Efficient Backfilling

### 1. Extract from Bios
Many profiles have location info in their bio fields:
```
Display Name: John Smith
Bio: "Elder from Tennant Creek, sharing stories..."
```
→ Assign: Primary Location = "Tennant Creek"

### 2. Organization Locations
Check if profile's organization has a known location:
```
Profile: Jane Doe
Organization: Palm Island Community Company
```
→ Likely: Primary Location = "Palm Island"

### 3. Story Content
Check stories/transcripts for location mentions:
```
Story Title: "Growing up in Katherine"
```
→ Assign: Primary Location = "Katherine"

### 4. Batch by Organization
Process all profiles from one organization together:
1. Search for "Orange Sky" in profile search
2. Assign locations to all Orange Sky members
3. Move to next organization

### 5. Use Existing Locations
Search before creating new locations to avoid duplicates:
- Type "Mel" → "Melbourne" will appear
- Type "Syd" → "Sydney" will appear
- Only create if truly doesn't exist

---

## Location Data Standards

### Australian Cities (Use these exact names)
- Sydney, NSW, Australia
- Melbourne, VIC, Australia
- Brisbane, QLD, Australia
- Perth, WA, Australia
- Adelaide, SA, Australia
- Hobart, TAS, Australia
- Darwin, NT, Australia
- Canberra, ACT, Australia

### Regional Centers
- Newcastle, NSW
- Wollongong, NSW
- Geelong, VIC
- Cairns, QLD
- Townsville, QLD
- Hobart, TAS
- Katherine, NT
- Alice Springs, NT
- Mount Isa, QLD
- Palm Island, QLD

### Indigenous Territories
- Use "Traditional Territory" if specific territory unknown
- Add specific territories when known:
  - Wiradjuri Country
  - Yawuru Country
  - Wurundjeri Country
  - etc.

---

## Progress Tracking

### Current Status (as of 2025-09-30)
```
Total: 235 profiles
With locations: 41 (17%)
Missing: 194 (83%)
```

### Target Milestones
- **Week 1**: 100 profiles (43% coverage)
- **Week 2**: 150 profiles (64% coverage)
- **Week 3**: 200 profiles (85% coverage)
- **Week 4**: 235 profiles (100% coverage)

### Check Progress
Run this script anytime:
```bash
node scripts/analyze-location-data.js
```

---

## Common Scenarios

### Scenario 1: Profile has clear location in bio
```
Bio: "Proud Yawuru woman from Broome"
```
**Action**:
- Primary Location: Broome, WA
- Traditional Territory: Yawuru Country

### Scenario 2: Profile location unknown
```
Name: Test User
Bio: null
Stories: 0
```
**Action**:
- Skip for now (Phase 3)
- Or use organization's default location

### Scenario 3: Multiple locations mentioned
```
Bio: "Born in Darwin, lived in Sydney, now in Melbourne"
```
**Action**:
- Primary Location: Melbourne (current)
- Add note in bio about journey

### Scenario 4: Remote community
```
Bio: "From Hermannsburg community"
```
**Action**:
- Search for "Hermannsburg"
- If not found, create new location:
  - Name: Hermannsburg
  - State: NT
  - Country: Australia

---

## Quality Checks

After batch assignments, verify:

### 1. No Duplicates
```bash
# Check for duplicate locations
node scripts/analyze-location-data.js
```
Should show high % of complete locations, low duplicates

### 2. Consistent Naming
- Melbourne (not "melbourne" or "MELBOURNE")
- Sydney, NSW (not "Sydney NSW" or "Sydney,NSW")

### 3. Valid References
All location_id values should reference real locations in locations table

---

## Automation Opportunities (Future)

### 1. AI-Assisted Extraction
```javascript
// Extract location from bio using AI
const location = await extractLocationFromText(profile.bio)
// Suggest to admin for approval
```

### 2. Bulk Import
```csv
profile_id,primary_location,traditional_territory
abc-123,Melbourne,"Wurundjeri Country"
def-456,Sydney,"Eora Nation"
```

### 3. Organization Defaults
```javascript
// Auto-assign org location to new members
if (!profile.location && profile.organization.location) {
  suggestLocation(profile.organization.location)
}
```

---

## Need Help?

- **Tool not loading?**: Check server is running on port 3030
- **Location not saving?**: Check browser console for errors
- **Can't find location?**: Create new location with accurate data
- **Duplicate locations?**: Use existing one, note for cleanup later

---

## Summary

**Goal**: 100% location coverage for all profiles
**Tool**: Admin Location Manager at `/admin/locations`
**Strategy**: Priority-based backfilling (high-value first)
**Timeline**: 4 weeks to complete
**Current**: 194 profiles to go

Start with elders and featured storytellers, work through systematically!