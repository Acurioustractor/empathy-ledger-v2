# 🏢 Organization Dashboard Routes & Navigation Guide

## 🎯 **QUICK ACCESS - SNOW FOUNDATION DASHBOARD**

### **Main Dashboard URL**
```
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard
```

### **All Pages Quick Links**
```bash
# Dashboard Overview
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard

# Members Directory (5 members)
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/members

# Stories Collection (0 stories)
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/stories

# Projects Portfolio (1 project: "Deadly Hearts")
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/projects

# Analytics Insights (1/5 members with analytics)
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/analytics

# Organization Settings
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/settings
```

---

## 🗺️ **COMPLETE ROUTE STRUCTURE**

### **Organization Route Pattern**
```
/organizations/[organizationId]/[page]
```

### **Snow Foundation Specific Routes**
```bash
Organization ID: 4a1c31e8-89b7-476d-a74b-0c8b37efc850
Tenant ID: 96197009-c7bb-4408-89de-cd04085cdf44
Organization Type: Nonprofit
```

---

## 🎨 **DESIGN SYSTEM & STYLES**

### **UI Components Used**
- **Framework**: Next.js 14 App Router + React Server Components
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui component library
- **Icons**: Lucide React icons
- **Typography**: Inter font family

### **Color Scheme**
```css
/* Primary Organization Colors */
--primary: Blue-based theme
--secondary: Gray-based accents
--success: Green (Active projects, metrics)
--warning: Yellow (Warnings, pending states)
--destructive: Red (Errors, critical alerts)

/* Status Colors */
Active Projects: Green (#16a34a)
Completed: Blue (#2563eb) 
Paused: Yellow (#ca8a04)
Cancelled: Red (#dc2626)
```

### **Layout Structure**
```
┌─────────────────────────────────────┐
│ Organization Header (Blue banner)    │
├─────────────────────────────────────┤
│ Container (max-width + padding)      │
│ ┌─────────┐ ┌─────────────────────┐ │
│ │ Sidebar │ │ Main Content Area   │ │
│ │ Nav     │ │                     │ │
│ │ (240px) │ │ (Responsive grid)   │ │
│ │         │ │                     │ │
│ └─────────┘ └─────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔐 **AUTHENTICATION & ACCESS**

### **Current Authentication Status**
- **No explicit authentication required** for development testing
- **Tenant isolation** implemented at database level
- **Organization access** controlled by `tenant_id` matching

### **Access Control Pattern**
```typescript
// Authentication check in layout.tsx
async function verifyOrganizationAccess(organizationId: string) {
  // 1. Get current user from Supabase auth
  // 2. Check user's tenant_id matches organization's tenant_id  
  // 3. Allow admin roles cross-tenant access
  // 4. Return 404 if no access
}
```

### **For Production Authentication**
```typescript
// Future authentication flow:
1. User logs in → gets user ID
2. Check user's profile → get tenant_id and roles
3. Verify user can access organization
4. Allow/deny access to organization dashboard
```

---

## 📊 **DATA & CONTENT OVERVIEW**

### **Snow Foundation Current Data**
```yaml
Organization: Snow Foundation
Type: Nonprofit
Members: 5 total
  - Aunty Vicky Wade (Elder, Traditional Owner)
  - Heather Mundo (Community Storyteller)  
  - Aunty Diganbal May Rose (Community Storyteller)
  - Dr Boe Remenyi (Community Storyteller)
  - Cissy Johns (Community Storyteller)

Stories: 0 (empty - ready for content)

Projects: 1 total
  - "Deadly Hearts" (Active, Community Project)

Analytics: 1/5 members
  - Aunty Vicky Wade has completed analytics
  - Themes: leadership, community
  - Values: family, culture
  - Strengths: communication, empathy
```

### **Database Tables Used**
```sql
-- Core organization data
organizations (Snow Foundation details)
profiles (5 members with tenant_id)
stories (0 stories with tenant_id)  
projects (1 project with tenant_id)
personal_insights (1 analytics record)
```

---

## 🧪 **PAGE-BY-PAGE TESTING GUIDE**

### **1. 📊 Dashboard Overview** 
**URL**: `/dashboard`
**Key Elements**:
- Organization header with "Snow Foundation" + nonprofit badge
- 4 metric cards: Members(5), Stories(0), Projects(1), Analytics(1), Engagement(20%)
- Recent Activities: Stories (empty), Projects ("Deadly Hearts"), Members (5 recent)
- Navigation sidebar with 6 tabs

**Test**: All metrics load, recent data displays, navigation works

---

### **2. 👥 Members Directory**
**URL**: `/members`  
**Key Elements**:
- 5 member cards with avatars and details
- Search functionality (try "Aunty" or "Elder")
- Role filtering dropdown
- Member profile links
- Email contact buttons

**Test**: Search works, filters work, profile links navigate correctly

---

### **3. 📚 Stories Collection** 
**URL**: `/stories`
**Key Elements**:
- Empty state with book icon
- "0 stories shared by your community" message
- Search and filter controls (functional but no results)
- Ready for story content when added

**Test**: Empty state displays correctly, search/filter controls present

---

### **4. 🗂️ Projects Portfolio** (NEW!)
**URL**: `/projects`
**Key Elements**:
- 1 project card: "Deadly Hearts"
- Active status (green badge)
- Community Project indicator
- Search and status filtering
- Project detail view links

**Test**: "Deadly Hearts" project displays, search works, filters work

---

### **5. 📈 Analytics Insights**
**URL**: `/analytics`
**Key Elements**:
- Analytics coverage: "1/5 members (20%)"
- Community themes from Aunty Vicky's analytics
- Aggregated values and strengths
- Visual progress indicators

**Test**: Analytics data displays, coverage metrics correct

---

### **6. ⚙️ Organization Settings**
**URL**: `/settings`
**Key Elements**:
- Snow Foundation organization details
- Tenant ID and privacy settings
- Community statistics
- Cultural protocols (if configured)

**Test**: Organization info accurate, tenant details displayed

---

## 🔄 **NAVIGATION FLOW**

### **Navigation Sidebar**
```
📊 Dashboard     - Overview and metrics
👥 Members       - Community directory  
📚 Stories       - Story collection
🗂️ Projects      - Community projects (NEW!)
📈 Analytics     - Insights and trends
⚙️ Settings      - Organization settings
```

### **Breadcrumb Pattern**
```
Snow Foundation > [Current Page]
```

### **Inter-Page Links**
- Dashboard widgets link to full pages
- "View All" buttons on recent widgets
- Member cards link to individual profiles
- Project cards link to project details

---

## 🚀 **QUICK START TESTING SEQUENCE**

### **Essential Test Flow** (5 minutes)
1. **Start**: Visit dashboard URL above
2. **Overview**: Check metrics show 5/0/1/1 (members/stories/projects/analytics)  
3. **Members**: Click Members tab → see 5 Snow Foundation members
4. **Projects**: Click Projects tab → see "Deadly Hearts" project
5. **Analytics**: Click Analytics tab → see 1/5 coverage with Aunty Vicky's data
6. **Navigation**: Test all 6 tabs work smoothly

### **Detailed Test Flow** (15 minutes)
1. **Dashboard Deep Dive**: Test all recent widgets and metrics
2. **Member Search**: Search for "Aunty" → should find 2 members
3. **Project Details**: View "Deadly Hearts" project details
4. **Analytics Exploration**: Review community insights aggregation
5. **Settings Review**: Verify organization configuration
6. **Responsive Design**: Test on different screen sizes

---

## 🎯 **BOOKMARK THESE URLS**

**Save these for easy access:**

```bash
# Main Dashboard (bookmark this!)
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard

# Quick Test Pages
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/members    # 5 members
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/projects  # "Deadly Hearts"
http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/analytics # 1/5 analytics

# Development Server
http://localhost:3001
```

**The complete organization dashboard is ready for comprehensive testing!** 🎉

**Start with the main dashboard URL above and explore all 6 tabs to see the full system in action.**