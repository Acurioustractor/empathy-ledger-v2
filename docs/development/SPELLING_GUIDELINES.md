# Spelling Guidelines - Empathy Ledger v2

## Overview
This document establishes clear guidelines for when to use Australian vs American spelling to prevent future routing conflicts and maintain consistency.

## 🚨 Critical Rules - NEVER BREAK THESE

### 1. **Routes & URLs**
- **ALWAYS use Australian spelling in routes**: `/organisations`, `/api/organisations`
- **REASON**: Database uses Australian spelling, user-facing consistency
- **EXAMPLES**:
  - ✅ `/organisations/[id]/dashboard`
  - ✅ `/api/organisations/[id]/members`
  - ❌ `/organizations/[id]/dashboard`

### 2. **Database References**
- **Table names**: Already use Australian spelling (`organisations`, `analysed_transcripts`)
- **Column names**: Use Australian spelling for new columns
- **EXAMPLES**:
  - ✅ `.from('organisations')`
  - ✅ `organisation_id`
  - ❌ `.from('organizations')`

### 3. **Directory Structure**
- **ALWAYS use Australian spelling for directories**:
  - ✅ `src/app/organisations/`
  - ✅ `src/app/api/organisations/`
  - ❌ `src/app/organizations/`

## 📋 Context-Based Guidelines

### Frontend Components & Variables
**Rule**: Use context-appropriate spelling

#### User-Facing Content (Australian Spelling)
- UI text, labels, headings
- Error messages shown to users
- Documentation for end-users
- Component display text

```typescript
// ✅ User-facing
<h1>Organisation Settings</h1>
<p>Analyse your data</p>
const errorMessage = "Organisation not found"
```

#### Technical Code (Flexible)
- Variable names (can be American for technical clarity)
- Function names (use most clear/standard spelling)
- Internal comments (Australian preferred)
- Type definitions (use database consistency)

```typescript
// ✅ Technical flexibility
const organizationData = fetchOrganisation() // Variable can be American
function analyzeContent() {} // Standard function name
interface OrganisationResponse {} // Match database
```

### API Responses
- **Field names**: Match database (Australian spelling)
- **Error messages**: Australian spelling
- **Documentation**: Australian spelling

```typescript
// ✅ API Response
{
  "organisation": {
    "name": "Snow Foundation",
    "colour_scheme": "blue"
  },
  "error": "Organisation not found"
}
```

### Comments & Documentation
- **Code comments**: Australian spelling preferred
- **README files**: Australian spelling
- **API documentation**: Australian spelling
- **Inline documentation**: Australian spelling

```typescript
// ✅ Comments
// Analyse user behaviour patterns
// Centre the modal dialogue
// Get organisation details
```

## 🔧 Technical Exceptions

### Library & Framework Terms
**Rule**: Keep standard technical terms in their original spelling

```typescript
// ✅ Technical terms keep original spelling
import { ColorPicker } from 'react-color'
style={{ backgroundColor: '#fff' }}
const synchronized = true // Standard tech term
```

### External APIs
**Rule**: Match external service requirements

```typescript
// ✅ External API requirements
// If Google Analytics API requires "organization"
await analytics.getOrganizationData()
```

### Package Names
**Rule**: Always use exact package spelling

```typescript
// ✅ Package names unchanged
import { organize } from 'organize-imports'
```

## 🛡️ Validation Rules

### Automated Checks
1. **Route validation**: No `/organizations` in route files
2. **API validation**: No `/api/organizations` in fetch calls
3. **Directory validation**: No `organizations` directories in src/
4. **Database validation**: Consistent field naming

### Manual Review
1. **User-facing text**: Australian spelling
2. **Error messages**: Australian spelling
3. **Documentation**: Australian spelling
4. **Component names**: Logical consistency

## 🚀 Implementation Strategy

### For New Features
1. **Start with routes**: Use Australian spelling
2. **Database design**: Australian field names
3. **UI text**: Australian spelling
4. **Technical code**: Context-appropriate

### For Bug Fixes
1. **Check route consistency**: Must use Australian
2. **Verify API calls**: Must match directory structure
3. **Update tests**: Match new spelling

## 📊 Common Patterns

### Route Patterns
```typescript
// ✅ Correct patterns
/organisations/[id]/dashboard
/api/organisations/[id]/analytics
/admin/organisations/create
```

### Component Patterns
```typescript
// ✅ User-facing components
export const OrganisationHeader = () => {
  return <h1>Organisation Dashboard</h1>
}

// ✅ Technical utilities
const getOrganizationData = (orgId: string) => {
  // Function names can be technical
  return fetchFrom('organisations') // But DB calls use AU
}
```

### API Patterns
```typescript
// ✅ API Route structure
// File: /api/organisations/[id]/route.ts
export async function GET() {
  const organisation = await supabase
    .from('organisations')
    .select('*')

  return Response.json({
    organisation,
    message: "Organisation retrieved successfully"
  })
}
```

## 🎯 Quick Reference

| Context | Spelling | Example |
|---------|----------|---------|
| **Routes** | Australian | `/organisations` |
| **API Endpoints** | Australian | `/api/organisations` |
| **Database** | Australian | `organisations` table |
| **UI Text** | Australian | "Organisation Settings" |
| **Error Messages** | Australian | "Organisation not found" |
| **Variable Names** | Flexible | `organizationData` or `organisationData` |
| **Function Names** | Clear/Standard | `analyzeContent()` |
| **Comments** | Australian | `// Analyse the data` |
| **Documentation** | Australian | Australian spelling throughout |
| **Package Names** | Original | `react-router` |
| **External APIs** | Required | Match API requirements |

## 🔄 Migration Notes

- **Completed**: Directory structure consolidated to Australian spelling
- **Completed**: All route references updated to Australian spelling
- **Completed**: API endpoints use Australian spelling
- **Next**: Implement automated validation (see validation script)

---

*Last updated: September 2024*
*Next review: December 2024*