# Database System Map

**Visual guide to understanding how all database systems connect**

## 🗺️ The Big Picture

```
┌────────────────────────────────────────────────────────────────────┐
│                     EMPATHY LEDGER DATABASE                         │
│                          87 Tables Total                            │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      MULTI-TENANT FOUNDATION                         │
├─────────────────────────────────────────────────────────────────────┤
│  tenants (organizations)                                             │
│    ↓                                                                 │
│  tenant_id (present in 70+ tables for isolation)                    │
│    ↓                                                                 │
│  RLS Policies (210 total) enforce tenant boundaries                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                            │
┌───────▼────────┐                          ┌───────▼────────┐
│  STORYTELLERS  │                          │ ORGANIZATIONS  │
│   (profiles)   │◀────────────────────────▶│   (tenants)    │
└────────┬───────┘                          └───────┬────────┘
         │                                          │
         │ authors                                  │ owns
         ↓                                          ↓
┌────────────────┐                          ┌──────────────┐
│    STORIES     │                          │   PROJECTS   │
│   (content)    │◀─────────part of────────▶│  (contexts)  │
└────────┬───────┘                          └──────┬───────┘
         │                                          │
         │ contains                                 │ analyzes
         ↓                                          ↓
┌────────────────┐                          ┌──────────────┐
│ MEDIA ASSETS   │                          │ TRANSCRIPTS  │
│  (files/CDN)   │                          │ (interviews) │
└────────────────┘                          └──────────────┘

         │                                          │
         └──────────────┬───────────────────────────┘
                        ↓
              ┌──────────────────┐
              │    ANALYTICS     │
              │ (metrics/impact) │
              └──────────────────┘
```

## 📊 System Breakdown

### 1️⃣ Core Identity Layer

**Profiles System** (storyteller identity)
```
profiles (not in summary - check migrations!)
  ↓
  ├── avatar_url / profile_image_url / avatar_media_id
  ├── cultural_background
  ├── is_elder / is_featured
  └── tenant_id (multi-tenant)
```

**Key functions:**
- `create_profile_with_media()` - Create profile with avatar
- `get_storyteller_dashboard_summary()` - Profile overview
- `get_storyteller_recommendations()` - Find similar storytellers

---

### 2️⃣ Content Layer

**Stories System**
```
stories (not listed - check migrations!)
  ├── author_id → profiles
  ├── tenant_id → tenants
  ├── project_id → projects
  └── themes[] (AI-extracted)
```

**Transcripts System**
```
transcripts (public.transcripts)
  ├── storyteller_id → profiles
  ├── project_id → projects
  ├── tenant_id → tenants
  └── analyzed content
```

**Supporting:**
- `storyteller_quotes` - Extracted quotes
- `storyteller_transcripts` - Transcript metadata
- `story_drafts` - Draft content

**Key functions:**
- `archive_story()` / `restore_story()`
- `increment_story_view_count()`
- `public.validate_collaboration_settings()`

---

### 3️⃣ Media Layer

**Media Assets** (5 tables)
```
media_assets
  ├── cdn_url (public URL)
  ├── tenant_id (ownership)
  ├── mime_type / file_size
  └── uploaded_by → profiles

media_usage_tracking
  ├── media_asset_id → media_assets
  ├── accessed_by → profiles
  └── access_type (view/download/share)

storyteller_media_library
  ├── storyteller_id → profiles
  ├── media_asset_id → media_assets
  └── is_profile_image / is_featured
```

**Key functions:**
- `link_media_to_story()` - Associate media with stories
- `get_storyteller_media_stats()` - Usage analytics
- `create_profile_with_media()` - Upload during profile creation

---

### 4️⃣ Organization & Multi-Tenant Layer

**Organizations** (13 tables)
```
tenants (organizations)
  ↓
tenant_members (membership)
  ↓
organization_roles (permissions)
  ↓
tenant_id (isolation boundary)
```

**Supporting:**
- `organization_invitations` - Invite workflow
- `organization_contexts` - Org-specific settings
- `profile_organizations` - User-org relationships
- `organization_storyteller_network` - Connections

**Key functions:**
- `is_organization_admin()` - Permission checks
- `get_user_organization_role()` - Role lookup
- `sync_tenant_members_from_org()` - Member sync

---

### 5️⃣ Project Management Layer

**Projects** (11 tables)
```
projects (not in list - check migrations!)
  ↓
project_contexts (settings)
  ↓
project_analyses (AI insights)
  ↓
project_profiles (participants)
```

**ACT Integration:**
- `act_projects` - ACT-specific projects
- `act_admins` - ACT admin users
- `act_feature_requests` - Feature tagging

**Key functions:**
- `get_project_context()` - Load project settings
- `update_project_stories_count()` - Maintain counts

---

### 6️⃣ Cultural Sensitivity Layer

**Moderation System** (5 tables)
```
ai_moderation_logs
  ├── content_id (story/transcript)
  ├── flags[] (detected issues)
  └── human_reviewed

moderation_results
  ├── approved / rejected
  └── reviewer_notes

moderation_appeals
  ├── moderation_result_id
  └── appeal_reason
```

**Consent:**
- `story_syndication_consent` - Permission to share
- `consent_change_log` - Audit trail

**Key functions:**
- `validate_archive_consent()` - Check permissions
- `notify_elder_review_assigned()` - Escalation

---

### 7️⃣ Analytics & Metrics Layer

**Storyteller Analytics** (13 tables)
```
storyteller_analytics
  ├── storyteller_id → profiles
  ├── total_stories / total_transcripts
  └── engagement_metrics

storyteller_impact_metrics
  ├── community_engagement_score
  ├── cultural_preservation_score
  └── measurement_period

storyteller_engagement
  ├── story_views / shares
  └── calculated metrics
```

**Organization Analytics:**
- `organization_impact_metrics` - Org-level impact
- `organization_theme_analytics` - Theme tracking
- `geographic_impact_patterns` - Location insights

**Platform:**
- `platform_analytics` - System-wide stats
- `ai_usage_daily` - AI consumption tracking

**Key functions:**
- `calculate_storyteller_analytics()` - Compute metrics
- `calculate_organization_impact_metrics()` - Org impact
- `aggregate_daily_engagement()` - Daily rollups
- `update_platform_stats()` - System metrics

---

### 8️⃣ Access Control & Sharing Layer

**Partner Portal** (10 tables)
```
story_access_tokens
  ├── token (UUID)
  ├── story_id → stories
  ├── access_level (view/download/embed)
  └── expires_at

partner_projects
  ├── partner_id
  ├── organization_id
  └── access_permissions

partner_messages
  ├── thread_id
  ├── storyteller_id
  └── read_at
```

**Embedding:**
- `embed_tokens` - Public embed access
- `story_access_log` - Access tracking

**Key functions:**
- `validate_and_increment_token()` - Token auth
- `can_create_share_link()` - Permission check
- `cleanup_expired_tokens()` - Maintenance

---

### 9️⃣ System & Events Layer

**Tracking** (10 tables)
```
activity_log
  ├── user_id → profiles
  ├── action_type
  └── metadata (JSONB)

ai_usage_events
  ├── user_id / tenant_id
  ├── model / tokens
  └── timestamp

notifications
  ├── user_id → profiles
  ├── type / title / message
  └── read_at
```

**Audit:**
- `audit_logs` - Security events
- `webhook_delivery_log` - Integration events
- `ai_safety_logs` - Safety monitoring

**Key functions:**
- `log_activity()` - Track actions
- `update_ai_usage_daily()` - Rollup AI usage
- `cleanup_old_notifications()` - Maintenance

---

## 🔗 Key Relationships

### Storyteller → Content Flow
```
profiles (storyteller)
  ↓ authors
stories (content)
  ↓ contains
media_assets (files)
  ↓ tracked by
media_usage_tracking (analytics)
```

### Organization → Project Flow
```
tenants (organization)
  ↓ owns
projects (initiative)
  ↓ contains
transcripts (interviews)
  ↓ analyzed by
project_analyses (AI insights)
```

### Content → Analytics Flow
```
stories (content)
  ↓ generates
story_engagement_events (views/shares)
  ↓ aggregated into
story_engagement_daily (metrics)
  ↓ contributes to
storyteller_analytics (impact)
```

### Access Control Flow
```
story (content)
  ↓ can create
story_access_tokens (share link)
  ↓ validated by
validate_and_increment_token()
  ↓ logged in
story_access_log (audit trail)
```

## 🎯 Common Data Paths

### Creating a Story
```
1. User creates draft → story_drafts
2. Upload media → media_assets
3. Link media → link_media_to_story()
4. Publish → stories table
5. Trigger analytics → storyteller_analytics
6. Log activity → activity_log
```

### Sharing a Story
```
1. Check consent → story_syndication_consent
2. Create token → story_access_tokens
3. Partner access → validate_and_increment_token()
4. Track usage → story_access_log
5. Update metrics → story_engagement_events
```

### Running Analytics
```
1. Collect events → story_engagement_events
2. Daily rollup → aggregate_daily_engagement()
3. Calculate metrics → calculate_storyteller_analytics()
4. Update dashboard → storyteller_analytics
5. Org rollup → calculate_organization_impact_metrics()
```

## 🔐 Security Boundaries

### Tenant Isolation
```
Every query filtered by:
  tenant_id = (auth.jwt() ->> 'tenant_id')::UUID

Tables with tenant_id:
  - stories
  - transcripts
  - media_assets
  - projects
  - analytics tables
  + 60 more...
```

### RLS Policy Pattern
```sql
-- Standard tenant isolation (used in 150+ policies)
CREATE POLICY table_tenant_isolation
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::UUID
  );

-- Owner-only (used in 30+ policies)
CREATE POLICY table_owner_only
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Public read (used in 20+ policies)
CREATE POLICY table_public_read
  FOR SELECT USING (true);
```

## 📈 Scale Indicators

### High-Volume Tables
- `story_engagement_events` - Grows with every view/share
- `activity_log` - Grows with every user action
- `ai_usage_events` - Grows with every AI call
- `media_usage_tracking` - Grows with every media access

### High-Join Tables
- `profiles` - Referenced by 20+ tables
- `tenants` - Referenced by 70+ tables (via tenant_id)
- `media_assets` - Joins with stories, profiles, galleries

### Performance-Critical
- All analytics tables (daily aggregations)
- Search queries (stories, profiles)
- Dashboard queries (storyteller analytics)

## 🛠️ Finding Things

### "Where is the profiles table?"
```bash
grep -l "CREATE TABLE.*profiles" supabase/migrations/*.sql
# Check: 20250109_media_system.sql and related files
```

### "How do I query storyteller data?"
See: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#get-storyteller-with-stories)

### "What tables store X?"
```bash
# Find by keyword
grep -i "keyword" docs/database/SCHEMA_SUMMARY.md

# Or search migrations
grep -l "keyword" supabase/migrations/*.sql
```

---

**Need more details?**

- Run: `./scripts/analyze-database.sh`
- Read: [DATABASE_README.md](../DATABASE_README.md)
- Check: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
