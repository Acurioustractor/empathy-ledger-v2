# Empathy Ledger v2 - Comprehensive Codebase Deep Dive

**Generated:** December 22, 2025
**Purpose:** Complete analysis of codebase architecture, data connections, AI processes, and cleanup opportunities

---

## Executive Summary

| Category | Status | Key Finding |
|----------|--------|-------------|
| Database Schema | ✅ Strong | 50+ tables, well-structured multi-tenant architecture |
| AI/ML Systems | ✅ Strong | Comprehensive analysis pipeline with OCAP safety |
| Service Layer | ⚠️ Good with Issues | 14 services, 2 critical bugs found |
| Dead Code | ⚠️ Needs Cleanup | 20+ unused routes, 8+ orphaned components |
| Components | ⚠️ Needs Consolidation | 4+ duplicate storyteller cards |
| Data Flow | ✅ Strong | Complete consent → distribution → revocation chain |

---

## 1. Database Architecture

### Table Inventory: 50+ Tables

**Core Content**
| Table | Purpose |
|-------|---------|
| `stories` | Core storytelling content with consent tracking |
| `transcripts` | Audio/video transcriptions with AI analysis |
| `projects` | Story collections by organization |
| `media_assets` | Images, videos, audio files |

**Organization & Multi-Tenancy**
| Table | Purpose |
|-------|---------|
| `tenants` | Top-level tenant isolation |
| `organisations` | Community organizations with tier/policy |
| `organization_roles` | RBAC within organizations |
| `profiles` | User accounts with cultural permissions |

**Distribution & Consent**
| Table | Purpose |
|-------|---------|
| `story_distributions` | External platform tracking |
| `embed_tokens` | Secure embed access |
| `story_syndication_consent` | Partner consent |
| `consent_proofs` | GDPR consent records |
| `audit_logs` | Complete action trail |

### Orphaned Tables (12+)
Tables created but NOT used in codebase:
- `storyteller_demographics`
- `storyteller_connections`
- `storyteller_recommendations`
- `cross_sector_insights`
- `geographic_impact_patterns`
- `theme_evolution_tracking`
- `analytics_processing_jobs`
- `storyteller_dashboard_config`
- `storyteller_milestones`
- `moderation_appeals`
- `ai_moderation_logs`
- `ai_safety_logs`

---

## 2. AI/ML Architecture

### Active AI Capabilities
- ✅ Transcript analysis & theme extraction
- ✅ Quote identification & impact scoring
- ✅ Storyteller bio generation
- ✅ Story generation from transcripts
- ✅ Personalized recommendations
- ✅ Semantic search
- ✅ Cultural safety moderation
- ✅ Content quality enhancement

### Key AI Files
| File | Purpose |
|------|---------|
| `src/lib/ai/llm-client.ts` | Universal LLM (Ollama + OpenAI) |
| `src/lib/ai/transcript-analyzer-v2.ts` | Hybrid analysis |
| `src/lib/ai/cultural-safety-moderation.ts` | OCAP enforcement |
| `src/lib/ai/story-recommendations-engine.ts` | Personalized recs |
| `src/lib/ai/intelligent-search-system.ts` | Semantic search |

### AI Cost Control
- Per-tenant budgets ($100/month default)
- Auto-downgrade at 80% threshold
- Rate limiting (60 req/min, 500 req/hour)
- Usage tracking in `ai_usage_events` table

### Duplicate AI Modules (Cleanup Candidates)
- `transcript-analyzer.ts` vs `transcript-analyzer-v2.ts`
- `outcome-matcher.ts` vs `intelligent-outcome-matcher.ts`
- `claude-quote-extractor.ts` vs `claude-quote-extractor-v2.ts`
- `profile-enhancement-analyzer.ts` vs `profile-enhancement-engine.ts`

---

## 3. Service Layer

### Active Services (14)
| Service | Purpose | Status |
|---------|---------|--------|
| `consent.service.ts` | GDPR consent proof | ✅ Active |
| `distribution.service.ts` | Story distribution | ✅ Active |
| `revocation.service.ts` | One-click revoke | ⚠️ BUG |
| `embed.service.ts` | Embed tokens | ✅ Active |
| `gdpr.service.ts` | Data privacy | ⚠️ BUG |
| `audit.service.ts` | Compliance logging | ✅ Active |
| `organization.service.ts` | Org management | ✅ Active |
| `webhook.service.ts` | Event delivery | ✅ Active |
| `notification.service.ts` | In-app alerts | ✅ Active |
| `email.service.ts` | Email delivery | ✅ Active |
| `sms.service.ts` | SMS via Twilio | ✅ Active |
| `magic-link.service.ts` | Passwordless auth | ✅ Active |
| `syndication-consent.service.ts` | Partner consent | ✅ Active |
| `consent-proxy.service.ts` | Central enforcement | ✅ Active |

### Critical Bugs Found
1. **gdpr.service.ts:114** - `resolvedTenantId` undefined
2. **revocation.service.ts:341** - Same issue in `cascadeConsentWithdrawal()`

### Code Duplication (7 files)
`resolveTenantContext()` method duplicated across 7 services - should be extracted.

---

## 4. Dead Code & Unused Routes

### Unused API Routes (20+)
**Admin/AI Routes**
- `/api/admin/ai-jobs` - No frontend calls
- `/api/admin/analytics/overview` - No frontend calls
- `/api/admin/apply-migration` - Dev utility
- `/api/admin/fix-profile` - Orphaned tool
- `/api/media-test` - Debug endpoint

**Partner Portal (Experimental?)**
- `/api/partner/*` (all routes) - May be inactive
- `/api/world-tour/*` (all routes) - Experimental feature
- `/api/external/*` (all routes) - External integration
- `/api/vault/stories` - Story vault
- `/api/beacon` - Purpose unclear

### Unused Components (8+)
- `storyteller-card-demo.tsx`
- `unified-storyteller-card.tsx`
- `enhanced-storyteller-card.tsx`
- `elegant-storyteller-card.tsx`
- `AdminDashboard-simple.tsx`
- `StorytellerManagement-simple.tsx`
- `StoryTemplates.tsx`
- `GuidedStoryCreator.tsx`

### Unused Libraries/Utilities
- `src/lib/storyteller-utils.tsx` - Entire file unused
- `src/lib/stores/admin.store.ts` - Zero imports
- `src/lib/ai/research-helper.ts` - Never called
- `src/lib/adapters/storyteller-data-adapter.ts` - Not imported

### Unused npm Packages
- `@faker-js/faker` - No imports found
- `react-is` - No imports found

---

## 5. Component Architecture

### Inventory
| Category | Count |
|----------|-------|
| UI Library (shadcn) | 40 |
| Admin Components | 26 |
| Storyteller Components | 24 |
| Profile Components | 17 |
| Organization Components | 24 |
| Feature Components | 10 |

### Duplicate Components (Consolidation Needed)
**Storyteller Cards (4+ variants):**
- `storyteller-card.tsx`
- `enhanced-storyteller-card.tsx`
- `unified-storyteller-card.tsx`
- `elegant-storyteller-card.tsx`

**Profile Implementations (2 independent):**
- `ImmersiveStorytellerProfile.tsx`
- `EnhancedStorytellerProfile.tsx`

**Story Cards (3 implementations):**
- `story/story-card.tsx`
- `ui/story-card.tsx`
- `ui/storytelling-card.tsx`

### Accessibility Issues
- No ARIA attributes detected
- No keyboard navigation patterns
- No role attributes in custom components

---

## 6. Data Flow Architecture

### Consent → Distribution → Revocation Chain

```
1. STORY UPLOAD
   └─ has_consent: false

2. GRANT CONSENT
   └─ POST /api/stories/[id]/consent
   └─ Creates ConsentProof
   └─ Audit log entry

3. ELDER VERIFICATION (if required)
   └─ PATCH /api/stories/[id]/consent
   └─ consent_verified: true

4. REGISTER DISTRIBUTION
   └─ POST /api/stories/[id]/distributions
   └─ Cultural safety check
   └─ Consent snapshot stored

5. SERVE EMBEDS
   └─ GET /api/embed/stories/[id]/token
   └─ Domain validation
   └─ Analytics tracking

6. REVOCATION (one-click)
   └─ POST /api/stories/[id]/revoke
   └─ Invalidates all tokens
   └─ Sends webhooks to partners
   └─ Archives story
```

### Cultural Safety Gates
1. Sacred content → ALWAYS BLOCK
2. High sensitivity → Requires elder approval
3. Traditional knowledge → Check cultural_permissions
4. All sharing → Consent verified first

---

## 7. Recommendations

### High Priority
1. **Fix critical bugs** in gdpr.service.ts and revocation.service.ts
2. **Consolidate storyteller cards** - 4 variants → 1 with variants prop
3. **Remove dead code** - Delete *-simple.tsx stubs
4. **Clean orphaned routes** - Partner portal, world-tour decision

### Medium Priority
5. **Extract shared utilities** - resolveTenantContext(), ownership checks
6. **Add accessibility** - ARIA attributes, keyboard navigation
7. **Enable vector search** - Semantic theme/quote search
8. **Add input validation layer**

### Low Priority
9. **Implement caching service**
10. **Add structured logging**
11. **Create component documentation**
12. **Consolidate AI modules**

---

## 8. Quick Reference

### Key File Locations
| Need | Location |
|------|----------|
| Database types | `src/types/database/*.ts` |
| Services | `src/lib/services/*.ts` |
| AI modules | `src/lib/ai/*.ts` |
| API routes | `src/app/api/**/*.ts` |
| Components | `src/components/**/*.tsx` |
| Migrations | `supabase/migrations/*.sql` |

### Type Files by Domain
| Domain | File |
|--------|------|
| Users/Profiles | `user-profile.ts` |
| Organizations | `organization-tenant.ts` |
| Projects | `project-management.ts` |
| Stories | `content-media.ts` |
| Distribution | `story-ownership.ts` |
| Cultural Safety | `cultural-sensitivity.ts` |

---

## 9. Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 50+ |
| Total Migrations | 33 |
| Total Services | 14 |
| Total AI Modules | 25+ |
| Total Components | 150+ |
| Total API Routes | 50+ |
| Orphaned Tables | 12+ |
| Dead Routes | 20+ |
| Duplicate Components | 10+ |

---

*This report was generated using comprehensive codebase analysis across database, services, AI, components, and data flow patterns.*
