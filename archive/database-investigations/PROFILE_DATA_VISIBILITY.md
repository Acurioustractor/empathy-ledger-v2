# Profile Data & Visibility Guide

## Overview
This document explains what data storytellers can edit, what appears publicly, and how privacy controls work in the Empathy Ledger platform.

---

## Data Architecture

### Single Source of Truth: `profiles` Table
All user data lives in the `profiles` table. There is NO separate `storyteller_profiles` table.
- Storytellers are profiles with `is_storyteller = true`
- Elders are profiles with `is_elder = true`
- Traditional Knowledge Keepers have `traditional_knowledge_keeper = true`

### Related Tables
- **`profile_locations`**: User's connection to places (current, traditional territory, birthplace)
- **`profile_organizations`**: Organization memberships and roles
- **`profile_projects`**: Project participations and roles

---

## Profile Management Tabs

### 1. **Overview Tab**
**Purpose:** Dashboard summary of your profile
**Visibility:** Private (only you)
**Contains:**
- Profile status (Storyteller, Elder, Knowledge Keeper badges)
- Quick stats
- Recent activity
- Profile completion status

---

### 2. **Personal Information Tab**
**Purpose:** Basic identity information
**Editable Fields:**
- First Name (private)
- Last Name (private)
- **Display Name** → **PUBLIC** on storyteller profile
- Preferred Name (private unless shared)
- **Pronouns** → **PUBLIC** if enabled
- Date of Birth (private)
- **Bio/Summary** → **PUBLIC** on storyteller profile
- Avatar/Profile Image → **PUBLIC**

**Visibility Control:** Individual field toggles in Privacy tab

---

### 3. **Cultural Identity Tab**
**Purpose:** Cultural background and connections
**Editable Fields:**
- **Cultural Background** → **PUBLIC** on storyteller profile
- **Cultural Affiliations** (array) → **PUBLIC** on storyteller profile
- **Languages Spoken** (array) → **PUBLIC** on storyteller profile
- Cultural Protocols (JSON) → Private, for system use
- Cultural Permissions (JSON) → Private, for consent management

**Visibility:** These fields appear prominently on storyteller public profiles with earth-tone badges

---

### 4. **Locations & Traditional Territory Tab** ⭐ NEW
**Purpose:** Connection to place
**Editable Fields:**
- Current Location → **PUBLIC** (with MapPin icon)
- **Traditional Territory** → **PUBLIC** (with Landmark icon, italicized)
- Birthplace → Optional, can be private
- Significant Places → Optional

**Features:**
- Each location has individual public/private toggle
- Traditional Territory is culturally significant
- Geographic scope badge (local/regional/national/international)
- Primary location indicator

**Visibility:** Public locations appear on storyteller profile with appropriate icons

---

### 5. **Organizations & Projects Tab** ⭐ NEW
**Purpose:** View your community connections
**Shows:**
- Organization memberships (name, role, join date, active status)
- Project participations (name, organization, role, status)
- Role badges (Admin/Owner, Manager, Member)

**Visibility:**
- Visible to other members of same organizations
- Can be hidden via Privacy settings
- **Read-only** - organizations control membership

---

### 6. **Storyteller Profile Tab** ⭐ NEW
**Purpose:** Manage your public storyteller presence
**Only visible if:** `is_storyteller = true`

**Editable Fields:**
- **Storyteller Status Toggle** → Controls if you appear in directory
- **Elder Status** → Adds Elder badge
- **Traditional Knowledge Keeper** → Adds special badge
- **Experience Level** → PUBLIC (Beginner/Developing/Experienced/Seasoned/Elder)
- **Years of Experience** → PUBLIC
- **Availability Status** → PUBLIC (Available/Limited/Unavailable)
- **Storytelling Styles** (array) → PUBLIC
  - Traditional Oral, Written Narrative, Visual, Performance, Interactive, Digital
- **Preferred Topics** (array) → PUBLIC
  - Cultural Heritage, Traditional Knowledge, Land & Territory, Language, Community History, etc.

**All data on this tab is PUBLIC** when storyteller profile is active

---

### 7. **Privacy & Consent Tab** ⭐ NEW
**Purpose:** Granular control over data visibility and usage

#### Profile Visibility (Master Setting)
- **Public**: Visible to everyone, search engines
- **Community**: Only authenticated users in organizations
- **Private**: Only you and admins

#### Individual Field Visibility Toggles
- Show Email Address
- Show Phone Number
- Show Location Information
- Show Cultural Background
- Show Languages
- Show Organizations
- Show Projects

#### Interaction Preferences
- Allow Messages from Community
- Allow Story Requests
- Show in Storyteller Directory

#### Data Consent
- Essential Data Collection (required)
- Analytics & Performance
- Cultural Data Sharing (special protocols)
- Third-Party Integrations
- Marketing Communications

---

### 8. **Contact Information Tab**
**Editable Fields:**
- Email (from auth, **private by default**)
- Phone → **Privacy toggle**
- Social Links (JSON) → **Privacy toggle**
- Preferred Communication Methods → Private
- Emergency Contact (JSON) → Always private
- Timezone → Private

---

### 9. **Accessibility & Dietary Tab**
**Editable Fields:**
- Accessibility Needs (array) → Private
- Dietary Requirements (array) → Private

**Purpose:** For event planning, accommodation requests
**Visibility:** Only visible to organization administrators when needed

---

### 10. **Settings Tab**
**Contains:**
- Account settings
- Notification preferences
- Password/authentication settings
- Account deletion options

---

## Public Storyteller Profile Page

### What Appears on `/storytellers/[id]` Page

#### Always Visible (if data exists):
1. **Header Section:**
   - Avatar
   - Display Name
   - Pronouns (if enabled)
   - Status Badges (Elder, Knowledge Keeper, Storyteller)
   - Experience Level

2. **About Section:**
   - Bio/Summary
   - Cultural Background
   - Years of Experience

3. **Cultural Identity:**
   - Cultural Affiliations (earth-tone badges)
   - Languages Spoken (indigo badges with count)
   - Traditional Knowledge Keeper badge (amber)

4. **Location Context:**
   - Current Location (MapPin icon, earth-500)
   - Traditional Territory (Landmark icon, amber, italicized)
   - Geographic Scope badge

5. **Storytelling Information:**
   - Storytelling Styles
   - Preferred Topics
   - Availability Status

6. **Stats Section:**
   - Story Count
   - Project Count
   - Community Engagement

#### Conditionally Visible (Privacy Settings):
- Email (if `show_email = true`)
- Phone (if `show_phone = true`)
- Organization Memberships (if `show_organizations = true`)
- Project Participations (if `show_projects = true`)

#### Never Visible:
- Date of Birth
- Emergency Contact
- Dietary Requirements
- Accessibility Needs
- Private addresses
- Password/authentication info
- Admin flags
- Cultural Protocols (system use only)

---

## Privacy Hierarchy

### Level 1: Master Profile Visibility
Set in Privacy Tab, controls overall access

### Level 2: Field-Specific Toggles
Override master setting for specific fields

### Level 3: Storyteller Directory
Separate toggle for appearing in searchable listings

### Level 4: Interaction Permissions
Control who can message/request stories

---

## Cultural Data Protection

### Special Handling for Indigenous Data
All cultural data follows Indigenous data sovereignty principles:
- Traditional knowledge is protected
- Cultural protocols are enforced
- Consent is explicit and granular
- Data can be withdrawn at any time

### Cultural Sensitivity Levels
- Location data includes traditional territory recognition
- Cultural affiliations are displayed with respect
- Knowledge Keeper status is honored with special badges
- Elder status receives visual distinction

---

## User Control Philosophy

### ✅ **Full Control Areas:**
- All personal information fields
- Cultural identity details
- Storyteller profile content
- Individual field visibility
- Interaction preferences
- Data consent choices

### 🔒 **System-Managed Areas:**
- Organization memberships (managed by orgs)
- Project assignments (managed by projects)
- Story counts (auto-calculated)
- Engagement metrics (auto-calculated)
- Authentication/security settings

### 🔗 **Relationship Data:**
- **Read-only** in profile (view your memberships)
- **Managed** by organizations (they add/remove members)
- **Visible** based on organization settings

---

## Best Practices for Storytellers

### ✅ Recommended Public Settings:
- Display Name: Public
- Bio: Public
- Cultural Background: Public
- Languages: Public
- Traditional Territory: Public
- Current Location: Public (at least city level)
- Storytelling Experience: Public
- Topics & Styles: Public

### 🔒 Recommended Private Settings:
- Date of Birth: Private
- Phone: Private (or Community only)
- Email: Private (or Community only)
- Emergency Contact: Always private
- Dietary/Accessibility: Private

### 🎯 For Maximum Engagement:
- Complete all public fields
- Add Traditional Territory for cultural context
- Select multiple storytelling styles
- Choose relevant topics
- Keep availability status current
- Enable "Show in Storyteller Directory"

---

## Summary

**What You Edit:** Everything in your profile (personal, cultural, storyteller)
**What's Public:** Only what you explicitly make public + storyteller tab if active
**What's Private:** Everything else, especially sensitive data
**What's Protected:** Cultural data with special sovereignty protocols
**What's Read-Only:** Organization/project memberships (managed by those entities)

The system gives you **world-class control** over your data while maintaining **cultural sensitivity** and **community safety**.
