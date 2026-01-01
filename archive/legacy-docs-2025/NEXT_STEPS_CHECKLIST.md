# Next Steps Checklist: Super Admin Multi-Tenant Implementation

**Current Status:** Phase 1 & 2 Complete ✅
**Next Phase:** Phase 3 - Stories Management

---

## Phase 3: Stories Management 📖

### Goal
Extend the organization-aware pattern to the Stories admin page, allowing super admin to view and manage stories filtered by organization.

### Tasks

#### 1. Update Stories List Page
- [ ] Read current implementation: [src/app/admin/stories/page.tsx](../src/app/admin/stories/page.tsx)
- [ ] Add `useOrganizationContext()` hook
- [ ] Create organization-aware API endpoint: `/api/admin/organizations/[orgId]/stories`
- [ ] Update fetch logic to use selected organization
- [ ] Add organization column to stories table
- [ ] Show organization badge for each story

#### 2. API Endpoints
- [ ] Create `/api/admin/stats/stories` (platform-wide stories)
- [ ] Create `/api/admin/organizations/[orgId]/stories` (org-specific)
- [ ] Use `getOrganizationStories()` helper
- [ ] Add pagination support
- [ ] Add filtering by status
- [ ] Add sorting options

#### 3. UI Enhancements
- [ ] Add organization filter dropdown (in addition to global selector)
- [ ] Add "Organization" column to table
- [ ] Color-code by organization
- [ ] Add bulk actions (publish, archive, delete)
- [ ] Add export functionality per organization

#### 4. Testing
- [ ] Test switching between organizations
- [ ] Verify story counts match dashboard
- [ ] Test filtering and pagination
- [ ] Verify data isolation (no cross-contamination)

---

## Phase 4: Other Admin Pages 📋

### Transcripts Page
- [ ] Add organization context to transcripts page
- [ ] Create `/api/admin/organizations/[orgId]/transcripts`
- [ ] Use `getOrganizationTranscripts()` helper
- [ ] Add organization column
- [ ] Test data isolation

### Blog Posts Page
- [ ] Add organization context to blog posts page
- [ ] Create `/api/admin/organizations/[orgId]/blog-posts`
- [ ] Use `getOrganizationBlogPosts()` helper
- [ ] Add organization column
- [ ] Test data isolation

### Users/Storytellers Page
- [ ] Add organization context to users page
- [ ] Create `/api/admin/organizations/[orgId]/members`
- [ ] Use `getOrganizationMembers()` helper
- [ ] Show which organizations each user belongs to
- [ ] Add bulk invite/remove functionality

### Projects Page
- [ ] Add organization context to projects page
- [ ] Create `/api/admin/organizations/[orgId]/projects`
- [ ] Use `getOrganizationProjects()` helper
- [ ] Add organization column
- [ ] Test data isolation

### Galleries/Photos Page
- [ ] Add organization context to galleries page
- [ ] Create `/api/admin/organizations/[orgId]/galleries`
- [ ] Filter photos by organization
- [ ] Add organization tagging

---

## Phase 5: Enhanced Features 🚀

### 1. Audit Log System
**Purpose:** Track all super admin actions for compliance and security

- [ ] Create `admin_audit_log` table
  ```sql
  CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
    entity_type TEXT NOT NULL, -- 'story', 'transcript', 'user', etc.
    entity_id UUID,
    changes JSONB, -- What changed
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
  ```
- [ ] Add audit logging middleware
- [ ] Log all super admin CRUD operations
- [ ] Create audit log viewer UI
- [ ] Add filtering by date, action, entity
- [ ] Add export to CSV

### 2. Organization Management CRUD
**Purpose:** Allow super admin to manage organizations

- [ ] Create organization detail page
- [ ] Add create organization form
- [ ] Add edit organization form
- [ ] Add delete organization (with confirmation)
- [ ] Add organization settings management
- [ ] Add organization member management
- [ ] Add organization projects overview

### 3. Bulk Operations
**Purpose:** Allow super admin to perform actions across multiple entities

- [ ] Bulk publish stories
- [ ] Bulk archive stories
- [ ] Bulk delete stories
- [ ] Bulk assign to organization
- [ ] Bulk export data
- [ ] Progress indicator for bulk operations

### 4. Data Export Tools
**Purpose:** Allow super admin to export data per organization

- [ ] Export organization stories to CSV
- [ ] Export organization transcripts to JSON
- [ ] Export organization members list
- [ ] Export complete organization backup (ZIP)
- [ ] Schedule automated backups
- [ ] Add date range filtering

### 5. Organization Comparison Dashboard
**Purpose:** Compare metrics across organizations

- [ ] Create comparison table
  ```
  | Organization      | Stories | Transcripts | Members | Projects |
  |-------------------|---------|-------------|---------|----------|
  | Oonchiumpa        | 6       | 0           | 0       | 2        |
  | Community Elder   | 10      | 0           | 0       | 0        |
  | A Curious Tractor | 0       | 0           | 0       | 1        |
  ```
- [ ] Add sorting by column
- [ ] Add growth metrics (week over week)
- [ ] Add activity heatmap
- [ ] Add charts (bar, pie, line)

### 6. Advanced Filtering
**Purpose:** More granular data exploration

- [ ] Multi-organization selection (compare 2-3 orgs)
- [ ] Date range filtering
- [ ] Status filtering across all entities
- [ ] Search across all organizations
- [ ] Save filter presets

---

## Technical Improvements 🔧

### Performance Optimization
- [ ] Add Redis caching for platform stats
- [ ] Implement pagination for large datasets
- [ ] Add database indexes on organization_id
- [ ] Optimize N+1 queries
- [ ] Add loading skeletons for better UX

### Security Enhancements
- [ ] Add rate limiting to admin APIs
- [ ] Add IP whitelisting for super admin
- [ ] Add 2FA requirement for super admin
- [ ] Add session timeout (15 minutes)
- [ ] Add suspicious activity detection

### Code Quality
- [ ] Add unit tests for helper functions
- [ ] Add integration tests for API endpoints
- [ ] Add E2E tests for user flows
- [ ] Add TypeScript strict mode
- [ ] Add ESLint rules for consistency

---

## Documentation Updates 📚

### User Documentation
- [ ] Create super admin user guide
- [ ] Create organization management guide
- [ ] Create video walkthrough
- [ ] Create FAQ document

### Developer Documentation
- [ ] Document all API endpoints
- [ ] Create architecture decision records (ADRs)
- [ ] Document helper function usage
- [ ] Create onboarding guide for new developers

---

## Testing Strategy 🧪

### Manual Testing Checklist
- [ ] Test all pages with "All Organizations" selected
- [ ] Test all pages with specific organization selected
- [ ] Test switching between organizations
- [ ] Test with Oonchiumpa (has 6 stories)
- [ ] Test with A Curious Tractor (has 0 stories)
- [ ] Verify no data leakage between orgs
- [ ] Test on mobile devices
- [ ] Test on different browsers

### Automated Testing
- [ ] Write unit tests for context management
- [ ] Write integration tests for API endpoints
- [ ] Write E2E tests for organization switching
- [ ] Add CI/CD pipeline for automated testing

---

## Deployment Checklist 🚀

### Pre-Deployment
- [ ] Run all tests
- [ ] Update environment variables
- [ ] Review security settings
- [ ] Test on staging environment
- [ ] Create deployment plan
- [ ] Create rollback plan

### Deployment
- [ ] Deploy database migrations
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify all API endpoints working
- [ ] Monitor error logs
- [ ] Check performance metrics

### Post-Deployment
- [ ] Verify super admin access
- [ ] Test organization switching
- [ ] Check data integrity
- [ ] Monitor for 24 hours
- [ ] Gather user feedback

---

## Success Metrics 📊

### Quantitative
- [ ] 100% data isolation between organizations
- [ ] < 500ms API response time
- [ ] Zero data leakage incidents
- [ ] 100% test coverage for critical paths
- [ ] < 1% error rate

### Qualitative
- [ ] Super admin can easily switch between organizations
- [ ] Clear visual indicators of current context
- [ ] Intuitive user interface
- [ ] Fast and responsive
- [ ] Meets user requirements

---

## Priority Matrix

### High Priority (Do First)
1. ✅ Phase 1: Core Components (DONE)
2. ✅ Phase 2: Dashboard & APIs (DONE)
3. 🔄 Phase 3: Stories Management
4. Phase 4: Other Admin Pages

### Medium Priority (Do Next)
5. Enhanced Features - Organization CRUD
6. Audit Log System
7. Data Export Tools

### Low Priority (Do Later)
8. Organization Comparison Dashboard
9. Advanced Filtering
10. Performance Optimization

---

## Current Progress

```
Phase 1: Core Components          ████████████████████ 100%
Phase 2: Dashboard & APIs         ████████████████████ 100%
Phase 3: Stories Management       ░░░░░░░░░░░░░░░░░░░░   0%
Phase 4: Other Admin Pages        ░░░░░░░░░░░░░░░░░░░░   0%
Phase 5: Enhanced Features        ░░░░░░░░░░░░░░░░░░░░   0%

Overall Progress                  ██████░░░░░░░░░░░░░░  30%
```

---

## Questions to Answer

### Before Starting Phase 3:
- [ ] Which story statuses should be filterable?
- [ ] Should super admin be able to publish stories directly?
- [ ] What bulk actions are most important?
- [ ] Should we show author/storyteller in stories list?

### Before Starting Phase 5:
- [ ] What information should be in audit logs?
- [ ] How long should audit logs be retained?
- [ ] What export formats are needed (CSV, JSON, PDF)?
- [ ] Should there be limits on bulk operations?

---

## Resources

### Documentation
- [SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md](./SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md)
- [SUPER_ADMIN_ARCHITECTURE_DIAGRAM.md](./SUPER_ADMIN_ARCHITECTURE_DIAGRAM.md)
- [SUPER_ADMIN_TESTING_RESULTS.md](./SUPER_ADMIN_TESTING_RESULTS.md)
- [MULTI_TENANT_BEST_PRACTICES.md](./MULTI_TENANT_BEST_PRACTICES.md)

### Code Examples
- Organization Context: [src/lib/contexts/OrganizationContext.tsx](../src/lib/contexts/OrganizationContext.tsx)
- Organization Selector: [src/components/admin/OrganizationSelector.tsx](../src/components/admin/OrganizationSelector.tsx)
- Platform Stats API: [src/app/api/admin/stats/platform/route.ts](../src/app/api/admin/stats/platform/route.ts)
- Query Helpers: [src/lib/multi-tenant/queries.ts](../src/lib/multi-tenant/queries.ts)

### Test Scripts
- Platform Stats Test: [scripts/test-super-admin-stats.ts](../scripts/test-super-admin-stats.ts)
- Oonchiumpa Test: [scripts/test-oonchiumpa-stats.ts](../scripts/test-oonchiumpa-stats.ts)

---

## Notes for Future Developers

### Key Principles
1. **Always use organization context** - Don't bypass the context system
2. **Always use helper functions** - Don't write raw queries with organization_id
3. **Always verify data isolation** - Test with multiple organizations
4. **Always log super admin actions** - Audit trail is critical
5. **Always show current context** - User should know which org they're viewing

### Common Patterns

#### Adding a New Organization-Aware Page
```typescript
// 1. Import context
import { useOrganizationContext } from '@/lib/contexts/OrganizationContext'

// 2. Get selected org
const { selectedOrgId } = useOrganizationContext()

// 3. Fetch data based on selection
useEffect(() => {
  if (selectedOrgId === 'all') {
    fetchPlatformData()
  } else {
    fetchOrganizationData(selectedOrgId)
  }
}, [selectedOrgId])
```

#### Creating a New Organization-Aware API
```typescript
// 1. Require super admin auth
const authResult = await requireSuperAdminAuth(request)
if (authResult instanceof NextResponse) return authResult

// 2. Use service role client
const supabase = createServiceRoleClient()

// 3. Use helper function
const data = await getOrganizationXYZ(supabase, orgId)
```

---

**Last Updated:** October 26, 2025
**Status:** Ready for Phase 3 Implementation
