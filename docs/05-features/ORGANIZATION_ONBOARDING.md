# Organization Onboarding Guide

> A step-by-step guide for onboarding new organizations to the Empathy Ledger platform.

## Prerequisites

Before starting:
- Organization has agreed to ALMA principles
- Primary contact identified
- Cultural context understood

## Onboarding Steps

### Step 1: Organization Profile (5 minutes)

#### Required Information
| Field | Description | Example |
|-------|-------------|---------|
| Name | Legal or common name | "Orange Sky Australia" |
| Type | Organization classification | community_org, ngo, research, government |
| Slug | URL-friendly identifier | "orange-sky" |
| Description | Brief mission statement | "Mobile laundry service..." |

#### Cultural Context
| Field | Description | Options |
|-------|-------------|---------|
| Cultural Focus | Primary cultural context | indigenous, multicultural, general |
| Geographic Focus | Where stories originate | state, region, or nationwide |
| Language Support | Languages needed | English, Indigenous languages |

#### API Call
```typescript
POST /api/admin/organizations
{
  "name": "Orange Sky Australia",
  "slug": "orange-sky",
  "type": "ngo",
  "description": "Mobile laundry and shower service...",
  "cultural_focus": "general",
  "geographic_focus": "Australia-wide"
}
```

---

### Step 2: Cultural Protocols (10 minutes)

Define how stories should be handled:

#### Elder Review Settings
```typescript
{
  "elder_review_required": true,  // Require cultural review
  "review_workflow": "standard",   // standard | expedited | none
  "reviewer_role": "elder",        // Who can review
  "auto_publish_threshold": 0.9    // Auto-publish if safety > 0.9
}
```

#### Consent Template
```typescript
{
  "consent_type": "informed",
  "consent_duration": "indefinite",  // or specific date
  "revocation_allowed": true,
  "data_export_allowed": true,
  "syndication_default": false,      // Opt-in for sharing
  "attribution_required": true
}
```

#### Privacy Defaults
```typescript
{
  "default_visibility": "organization",  // organization | public | private
  "default_anonymization": false,
  "location_precision": "suburb",        // exact | suburb | region | country
  "sensitive_content_filter": true
}
```

---

### Step 3: First Project Setup (5 minutes)

Create the organization's first project:

#### Project Fields
| Field | Description | Required |
|-------|-------------|----------|
| Name | Project title | Yes |
| Description | What the project aims to achieve | Yes |
| Start Date | When project begins | Yes |
| End Date | When project ends (optional) | No |
| Expected Outcomes | What success looks like | Recommended |
| Target Population | Who the project serves | Recommended |

#### API Call
```typescript
POST /api/admin/organizations/{orgId}/projects
{
  "name": "Community Voices 2026",
  "description": "Capturing stories from community members...",
  "start_date": "2026-01-01",
  "expected_outcomes": [
    "Collect 50 storyteller narratives",
    "Identify common themes across experiences",
    "Generate impact report for funders"
  ],
  "target_population": "Adults experiencing homelessness"
}
```

---

### Step 4: Invite Organization Admins (2 minutes)

Set up admin access:

#### Admin Roles
| Role | Permissions |
|------|-------------|
| owner | Full access, billing, delete org |
| admin | Manage projects, storytellers, settings |
| editor | Create/edit stories, manage content |
| viewer | View dashboard and reports only |

#### Invitation Flow
1. Enter admin email(s)
2. Select role
3. System sends invitation email
4. Admin clicks link to accept
5. Admin completes profile setup

---

### Step 5: Storyteller Invitation Setup (5 minutes)

Configure how storytellers join:

#### Invitation Methods
- **Direct Link**: Share a signup URL
- **Email Invitation**: Send personalized invites
- **QR Code**: For in-person events
- **Bulk Import**: CSV upload for existing contacts

#### Storyteller Onboarding Flow
```
1. Click invitation link
2. Create account (or link existing)
3. Review consent agreement
4. Accept data sovereignty terms
5. Complete profile (optional fields)
6. Ready to share story
```

#### Default Storyteller Settings
```typescript
{
  "profile_visibility": "organization",
  "story_default_visibility": "organization",
  "consent_template": "standard",
  "newsletter_opt_in": false,
  "platform_communications": true
}
```

---

### Step 6: Dashboard Tour (10 minutes)

Guide the organization through their new dashboard:

#### Dashboard Sections

**1. Overview**
- Total storytellers
- Total stories/transcripts
- Analysis status

**2. ALMA Signals**
- Authority indicators
- Evidence strength
- Harm prevention score
- Capability pathways
- Community value metrics

**3. Themes**
- Top themes across stories
- Theme frequency chart
- Theme evolution over time

**4. Projects**
- Project list with stats
- Impact per project
- Cross-project patterns

**5. Beautiful Obsolescence**
- Handover readiness score
- Capacity building progress
- Recommendations for independence

---

## Post-Onboarding Checklist

- [ ] Organization profile complete
- [ ] Cultural protocols configured
- [ ] First project created
- [ ] At least one admin invited
- [ ] Storyteller invitation method chosen
- [ ] Dashboard tour completed
- [ ] First storyteller invited (recommended)

---

## Support Resources

### Documentation
- [STORYTELLER_AS_A_SERVICE.md](./STORYTELLER_AS_A_SERVICE.md) - Service tiers
- [ALMA Framework](../02-methods/ALMA_FRAMEWORK.md) - Impact methodology
- [Data Sovereignty](../01-principles/DATA_SOVEREIGNTY.md) - OCAP/CARE

### Help
- Email: support@empathyledger.org
- Community: community.empathyledger.org
- In-app: Click "?" icon for contextual help

---

## Onboarding API Reference

### Create Organization
```
POST /api/admin/organizations
```

### Configure Protocols
```
PATCH /api/admin/organizations/{id}/settings
```

### Create Project
```
POST /api/admin/organizations/{id}/projects
```

### Invite Admin
```
POST /api/admin/organizations/{id}/invitations
```

### Generate Storyteller Link
```
POST /api/admin/organizations/{id}/storyteller-invite
```

---

*Last updated: January 2026*
