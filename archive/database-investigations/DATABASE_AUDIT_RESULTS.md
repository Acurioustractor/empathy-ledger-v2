# Database Audit Results - Storyteller Wizard

## ✅ What We Have (Good News!)

### Profiles Table
- ✅ All core fields exist: id, full_name, display_name, bio, email, phone_number
- ✅ profile_image_url - ready for photo uploads
- ✅ location_id - ready for location linking
- ✅ tenant_id, tenant_roles - multi-tenancy ready
- ✅ is_storyteller - flag for storytellers
- ❌ **MISSING**: created_by (need to add)

### Transcripts Table
- ✅ storyteller_id - links to profiles
- ✅ title, tenant_id, status, metadata
- ✅ created_by - **already exists!**
- ❌ **ISSUE**: Has neither `content` NOR `transcript_text` field
  - Need to check actual field name

### Project Storytellers Table
- ✅ **Table exists!** No need to create
- ✅ Has: project_id, storyteller_id, role, status, joined_at

### Media Assets Table
- ✅ **Table exists and ready**
- ✅ Has: id, url, thumbnail_url, uploaded_by, created_at

### Locations Table
- ✅ **Table exists**
- ✅ Has: name, city, state, country, lat/long

### Projects & Galleries
- ✅ Projects have organization_id
- ✅ Galleries have organization_id
- ❌ Galleries missing tenant_id (not critical)

## 🔧 What Needs Fixing

### 1. Add `created_by` to profiles table
```sql
ALTER TABLE profiles
ADD COLUMN created_by UUID REFERENCES profiles(id);
```

### 2. Check transcript text field name
The transcript table has neither `content` nor `transcript_text` in the sample.
Need to check what the actual field name is.

Possibilities:
- `text`
- `transcript`
- `raw_text`
- It's in `metadata` as JSON

### 3. Optional: Add `tenant_id` to galleries
```sql
ALTER TABLE galleries
ADD COLUMN tenant_id UUID REFERENCES tenants(id);
```

## 📋 Next Steps

1. ✅ Check actual transcript text field name
2. ✅ Add `created_by` to profiles (or document why not needed)
3. ✅ Start building wizard components

## 🎯 Ready to Build

All core tables exist! We can start building the wizard now and handle the minor field additions as we go.
