# How to Add Project Context

## Where to Find It

You're seeing this message:

```
No Project Context Defined
Add project context to enable outcome tracking and project-specific AI analysis.
```

This is the **correct location**! You should see **3 buttons** below this message.

## Why Aren't the Buttons Showing?

The buttons only appear if you have **edit permissions**. The component checks:

```typescript
{canEdit && (
  <div className="flex gap-2 justify-center">
    <Button>Create Manually</Button>
    <Button>Seed Interview</Button>
    <Button>Import Document</Button>
  </div>
)}
```

## How to Get Edit Permissions

You need to be:
- **Admin** of the organization that owns the project, OR
- **Project Manager** role in that organization

## Access the Page

1. **Via Organization Dashboard**:
   - Go to: `/organisations/{org-id}/projects/{project-id}/manage`
   - Click the **"Context & Outcomes"** tab
   - You should see the buttons if you're an admin/project manager

2. **Via Public Project Page**:
   - Go to: `/projects/{project-id}`
   - The ProjectContextManager component appears at the top
   - Buttons only show if you have permissions

## Test URLs

For the **Goods project** (ID: `6bd47c8a-e676-456f-aa25-ddcbb5a31047`):

**Organization Manage Page** (Best option):
```
http://localhost:3030/organisations/{org-id}/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/manage
```

**Public Project Page**:
```
http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047
```

## Debug: Check Your Permissions

Open browser console and look for this in the page source/network tab when loading the page. The page should be checking your role in the `organization_members` table.

## What Each Button Does

### 1. Create Manually
- Opens inline editing mode
- Fill in fields directly:
  - Purpose
  - Context (why it exists)
  - Target Population
  - Expected Outcomes (manual entry)
  - Success Criteria
  - Program Model
  - Cultural Approaches
  - Key Activities
- Click "Save Changes"

### 2. Seed Interview (Recommended)
- Opens a **14-question wizard**
- Questions about:
  - Project purpose & goals
  - Target population
  - Expected outcomes
  - Success indicators
  - Cultural approaches
  - Community engagement
- **AI extracts** structured context from your answers
- Shows quality score on completion
- Automatically fills all fields

### 3. Import Document
- Paste existing document text (100-50,000 characters)
- Supported document types:
  - Project Charter
  - Logic Model
  - Project Plan
  - Evaluation Framework
  - Impact Assessment
  - Project Proposal
- **AI extracts** context from document
- Shows quality score on completion
- Review and edit extracted content

## Quick Fix: If You Don't See Buttons

### Option 1: Check You're Logged In
```javascript
// In browser console
console.log(document.cookie) // Should show auth cookies
```

### Option 2: Check Your Role
The page checks this query:
```sql
SELECT role FROM organization_members
WHERE organization_id = {org_id}
  AND profile_id = {your_user_id}
```

You need `role = 'admin'` or `role = 'project_manager'`

### Option 3: Temporarily Test Without Auth (Dev Only)
If you're testing locally and want to bypass permission checks, you can temporarily modify the page to always pass `canEdit={true}`, but **this should only be for local testing!**

## After Adding Context

Once context is saved, you'll see:

1. **Four tabs appear**:
   - Overview (purpose, context, target population, inheritance toggle)
   - Outcomes (structured outcome cards with timeframes)
   - Approach (program model, cultural approaches, activities)
   - Metadata (quality score, AI model used, dates)

2. **Inheritance features**:
   - Toggle to inherit cultural frameworks from organization
   - See inherited frameworks with Link icons
   - Turn on/off anytime

3. **Expected Outcomes display**:
   - Cards showing categories (e.g., "Sleep Quality", "Manufacturing Capacity")
   - Timeframe badges (short/medium/long-term)
   - Measurable indicators
   - Descriptions of success

## Troubleshooting

### I see the message but no buttons
- ❌ You don't have edit permissions
- ✅ Solution: Log in as organization admin or project manager

### The page won't load
- ❌ Server error or missing API route
- ✅ Check browser console for errors
- ✅ Check server logs: `npm run dev` output

### I get "Unauthorized" error
- ❌ Not logged in or not a member of the organization
- ✅ Log in with correct account
- ✅ Check `organization_members` table

### I clicked "Seed Interview" but nothing happens
- ❌ Dialog component may not be loading
- ✅ Check browser console for errors
- ✅ Refresh page and try again

## Example: Adding Context for Goods Project

**Recommended: Use Seed Interview**

1. Navigate to:
   ```
   http://localhost:3030/organisations/{org-id}/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/manage
   ```

2. Click **"Seed Interview"** button

3. Answer 14 questions (examples):
   - **Purpose**: "Manufacturing beds for Indigenous children to improve sleep quality and health outcomes"
   - **Success**: "Children sleeping through the night, reduced hospital visits, increased school attendance"
   - **Target Population**: "Indigenous children in remote communities in Australia"
   - **Expected Outcomes**:
     - "Improved sleep quality"
     - "Better health indicators"
     - "Increased manufacturing capacity in community"
     - "Community ownership of production"
   - **Cultural Approaches**: "Community-led design, local manufacturing, cultural protocols respected"
   - etc.

4. Complete all questions

5. AI will extract:
   - Purpose
   - Context
   - Target population
   - **Expected outcomes** (structured with timeframes and indicators)
   - Success criteria
   - Program model
   - Cultural approaches
   - Key activities

6. Review extracted context (should show 80%+ quality score)

7. Context is saved automatically!

## What Happens Next

Once context is added, the AI analysis will:

1. **Replace generic Indigenous framework** with project-specific outcomes
2. **Track outcomes** like "Sleep Quality" and "Manufacturing Capacity"
3. **Find evidence** in transcripts for each outcome
4. **Score outcomes** with actual quotes (e.g., "Kids sleeping through the night" → Sleep Quality: 85/100)
5. **Show relevant metrics** instead of generic "Cultural Continuity"

This makes the analysis **actually useful** for your specific project!
