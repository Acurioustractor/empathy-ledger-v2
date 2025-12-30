# Storyteller User Journey Analysis

## Current State Assessment

### ✅ What Exists
1. **Beautiful Signup UI** (`/auth/signup`)
   - Cultural design with OCAP principles
   - Form fields for name, email, password, cultural background
   - Terms acceptance checkboxes
   - **BUT: No backend functionality - form doesn't actually work!**

2. **Database Schema**
   - `profiles` table with storyteller fields
   - Multi-tenant architecture
   - RLS policies for data security

3. **Profile Dashboard** (`/profile`)
   - Comprehensive profile management
   - Story control settings
   - Privacy controls

### ❌ What's Missing

1. **Signup Backend**
   - No form submission handler
   - No Supabase auth integration
   - No profile creation after signup

2. **Onboarding Flow**
   - No welcome/onboarding after signup
   - No guided tour of features
   - No profile completion prompts

3. **Story Creation**
   - Story creator exists but needs testing
   - Upload flow unclear
   - Media handling incomplete

## Ideal Storyteller Journey

### Phase 1: Discovery & Signup (5 minutes)
```
1. Land on homepage → See value proposition
2. Click "Join" → Beautiful signup page ✅
3. Fill form → **BROKEN: Form doesn't submit** ❌
4. Email verification → Not implemented ❌
5. Welcome screen → Not implemented ❌
```

**Current Experience**: User fills beautiful form, clicks submit, **nothing happens** 😞

### Phase 2: Profile Setup (10 minutes)
```
1. Guided profile completion
   - Upload profile picture
   - Add cultural background details
   - Set privacy preferences
   - Choose story sharing settings

2. Tour of platform features
   - How to create stories
   - How to manage privacy
   - How to connect with community
```

**Current Status**: ❌ Not implemented

### Phase 3: First Story Creation (15-30 minutes)
```
1. Click "Share a Story"
2. Choose story type:
   - Written story
   - Upload transcript
   - Voice recording

3. Add story details:
   - Title
   - Content/transcript
   - Cultural context
   - Location (optional)
   - Media (photos/audio)

4. Set permissions:
   - Who can see this story?
   - Consent for sharing
   - Cultural sensitivity level

5. Preview & publish
```

**Current Status**: ⚠️ Partially implemented

### Phase 4: Engage & Grow
```
1. View own stories
2. See analytics/impact
3. Connect with other storytellers
4. Get story recommendations
5. Participate in community
```

**Current Status**: ⚠️ Basic functionality exists

## Critical Path Issues

### 🔴 CRITICAL: Signup Doesn't Work
**Impact**: Users can't actually join the platform!

**What's needed**:
1. Server action for signup form
2. Supabase auth.signUp() integration
3. Profile creation in `profiles` table
4. Email confirmation flow
5. Redirect to onboarding

### 🟡 HIGH: No Onboarding Experience
**Impact**: New users are confused about what to do next

**What's needed**:
1. Welcome modal after signup
2. Profile completion wizard
3. Feature tour
4. First story creation prompt

### 🟢 MEDIUM: Story Creation UX
**Impact**: Story creation works but could be smoother

**What's needed**:
1. Clearer story creation CTA
2. Better media upload UI
3. Permission setting guidance
4. Preview before publish

## Recommended Implementation Plan

### Sprint 1: Make Signup Work (2-4 hours)
**Goal**: Users can actually create accounts!

1. ✅ Create signup server action
2. ✅ Integrate Supabase auth
3. ✅ Create profile record
4. ✅ Handle errors gracefully
5. ✅ Email verification flow
6. ✅ Redirect to onboarding

**Files to create/modify**:
- `src/app/actions/auth-actions.ts` - Server actions
- `src/app/auth/signup/page.tsx` - Add form handler
- `src/app/auth/verify-email/page.tsx` - Email verification
- `src/app/onboarding/page.tsx` - Onboarding flow

### Sprint 2: Onboarding Experience (3-5 hours)
**Goal**: New users understand the platform

1. ✅ Welcome screen
2. ✅ Profile completion wizard
3. ✅ Quick platform tour
4. ✅ Prompt to create first story

**Files to create**:
- `src/app/onboarding/` - Onboarding flow
- `src/components/onboarding/` - Onboarding components

### Sprint 3: Story Creation Polish (4-6 hours)
**Goal**: First story creation is delightful

1. ✅ Improved story creation UI
2. ✅ Media upload with preview
3. ✅ Permission wizard
4. ✅ Story preview
5. ✅ Celebration on publish

## Current Journey Map

```
┌──────────────────┐
│   Homepage       │  ✅ Exists, looks good
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Signup Page    │  ⚠️  Beautiful UI, NO BACKEND
└────────┬─────────┘
         │
         ▼
    ❌ STOPS HERE
    User clicks submit → Nothing happens

WHAT SHOULD HAPPEN:
         │
         ▼
┌──────────────────┐
│  Email Verify    │  ❌ Not implemented
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Welcome/Tour    │  ❌ Not implemented
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Complete Profile │  ⚠️  Dashboard exists
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Create Story    │  ⚠️  Partially works
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  View Stories    │  ✅ Works
└──────────────────┘
```

## Test Scenarios

### Scenario 1: New Storyteller Signup
**Goal**: Successfully create account and reach dashboard

**Steps**:
1. Go to http://localhost:3000/auth/signup
2. Fill in all fields
3. Click "Create Account"
4. **EXPECTED**: Email verification, then dashboard
5. **ACTUAL**: Form doesn't submit ❌

### Scenario 2: Profile Completion
**Goal**: Complete storyteller profile

**Steps**:
1. After signup, land on profile page
2. Add cultural details
3. Upload profile picture
4. Set privacy preferences
5. **CURRENT**: Can do manually but no guidance

### Scenario 3: First Story Creation
**Goal**: Publish first story successfully

**Steps**:
1. Click "Share a Story"
2. Write story
3. Add cultural context
4. Set permissions
5. Publish
6. **CURRENT**: Needs testing

## Data Flow Requirements

### Signup → Profile Creation
```typescript
// User submits signup form
{
  email: "storyteller@example.com",
  password: "securepass",
  firstName: "Maria",
  lastName: "Chen",
  culturalBackground: "Coast Salish"
}

// 1. Create Supabase auth user
auth.signUp({ email, password })

// 2. Create profile record
profiles.insert({
  id: user.id,
  email: email,
  display_name: `${firstName} ${lastName}`,
  first_name: firstName,
  last_name: lastName,
  cultural_background: culturalBackground,
  is_storyteller: true,
  tenant_id: default_tenant_id,
  created_at: now()
})

// 3. Send verification email
// 4. Redirect to /auth/verify-email
```

### Profile → Dashboard
```typescript
// After email verified, redirect to /onboarding
// Show welcome wizard
// Guide through profile completion
// Prompt for first story
```

## Next Steps

1. **IMMEDIATE**: Fix signup form
   - Add server action
   - Wire up Supabase auth
   - Test end-to-end

2. **SHORT TERM**: Add onboarding
   - Welcome screen
   - Profile wizard
   - Feature tour

3. **MEDIUM TERM**: Polish story creation
   - Better UX
   - Media handling
   - Permission clarity

## Success Metrics

- ✅ User can signup successfully
- ✅ User receives email verification
- ✅ User completes onboarding
- ✅ User creates first story
- ✅ User publishes story
- ✅ User views their stories
- ✅ Time to first story < 30 minutes

---

**Status**: Ready to implement signup backend
**Priority**: CRITICAL - Users can't join the platform!
**Estimated effort**: 2-4 hours for basic signup flow
