# 🎨 Organization Dashboard Design System Reference

## 🏗️ **ARCHITECTURE & TECH STACK**

### **Framework Stack**
```typescript
// Core Framework
Next.js 14.2+ (App Router)
React 18+ (Server Components + Client Components)
TypeScript 5+ (Strict mode)

// Styling & UI
Tailwind CSS 3+ (Utility-first CSS)
shadcn/ui (Component library)
Radix UI (Headless component primitives) 
Lucide React (Icon system)

// Backend Integration
Supabase (PostgreSQL + Auth + Real-time)
Server Components (Data fetching)
```

### **File Structure**
```
src/
├── app/organizations/[id]/          # Organization routes
│   ├── layout.tsx                   # Organization layout + auth
│   ├── page.tsx                     # Redirect to dashboard
│   ├── dashboard/page.tsx           # Dashboard overview
│   ├── members/page.tsx             # Member directory
│   ├── stories/page.tsx             # Story collection
│   ├── projects/page.tsx            # Projects portfolio (NEW!)
│   ├── analytics/page.tsx           # Analytics insights
│   └── settings/page.tsx            # Organization settings
│
├── components/organization/         # Organization UI components
│   ├── OrganizationHeader.tsx       # Header with org branding
│   ├── OrganizationNavigation.tsx   # Sidebar navigation
│   ├── OrganizationMetrics.tsx      # Dashboard metrics cards
│   ├── MemberDirectory.tsx          # Member grid with search
│   ├── StoryCollection.tsx          # Story grid with filters
│   ├── ProjectsCollection.tsx       # Projects grid (NEW!)
│   ├── OrganizationAnalytics.tsx    # Analytics aggregation
│   ├── RecentActivity.tsx           # Recent stories widget
│   ├── RecentProjects.tsx           # Recent projects widget (NEW!)
│   └── MemberHighlights.tsx         # Recent members widget
│
└── lib/services/
    └── organization.service.ts      # Organization data layer
```

---

## 🎨 **DESIGN TOKENS & THEME**

### **Color Palette**
```css
/* CSS Variables (Tailwind Integration) */
:root {
  --background: 0 0% 100%;           /* White background */
  --foreground: 222 84% 5%;          /* Near-black text */
  --primary: 221 83% 53%;            /* Blue primary */
  --primary-foreground: 210 40% 98%; /* White on primary */
  --secondary: 210 40% 96%;          /* Light gray secondary */
  --muted: 210 40% 96%;              /* Muted background */
  --border: 214 32% 91%;             /* Border color */
  --accent: 210 40% 96%;             /* Accent background */
}

/* Status Colors */
.status-active    { @apply bg-green-50 text-green-700 dark:bg-green-950; }
.status-completed { @apply bg-blue-50 text-blue-700 dark:bg-blue-950; }
.status-paused    { @apply bg-yellow-50 text-yellow-700 dark:bg-yellow-950; }
.status-cancelled { @apply bg-red-50 text-red-700 dark:bg-red-950; }
```

### **Typography Scale**
```css
/* Font Sizes (Tailwind Classes) */
.text-xs     /* 12px - Small labels, badges */
.text-sm     /* 14px - Secondary text, descriptions */
.text-base   /* 16px - Body text, default */
.text-lg     /* 18px - Card titles, section headers */
.text-xl     /* 20px - Page titles */
.text-2xl    /* 24px - Main dashboard title */
.text-3xl    /* 30px - Organization name */

/* Font Weights */
.font-medium /* 500 - Card titles, navigation items */
.font-semibold /* 600 - Section headers */
.font-bold   /* 700 - Page titles, metrics */
```

### **Spacing System**
```css
/* Tailwind Spacing (rem-based) */
.p-1  /* 0.25rem - 4px  - Tight inner spacing */
.p-2  /* 0.5rem  - 8px  - Small padding */
.p-3  /* 0.75rem - 12px - Standard padding */
.p-4  /* 1rem    - 16px - Card padding */
.p-6  /* 1.5rem  - 24px - Section padding */

.gap-1 /* 0.25rem - 4px  - Tight gaps */
.gap-2 /* 0.5rem  - 8px  - Small gaps */  
.gap-3 /* 0.75rem - 12px - Standard gaps */
.gap-4 /* 1rem    - 16px - Card gaps */
.gap-6 /* 1.5rem  - 24px - Section gaps */
```

---

## 🧩 **COMPONENT SYSTEM**

### **Layout Components**

**OrganizationHeader**
```tsx
// Organization branding header
<OrganizationHeader organization={org} />
// Renders: Org icon + name + type badge + description
```

**OrganizationNavigation** 
```tsx
// Sidebar navigation with 6 tabs
<OrganizationNavigation organizationId={id} />
// Auto-highlights current page, responsive collapse
```

### **Content Components**

**Dashboard Metrics Cards**
```tsx
<OrganizationMetrics metrics={{
  memberCount: 5,
  storyCount: 0, 
  projectCount: 1,
  analyticsCount: 1
}} />
// 4 metric cards in responsive grid
```

**Data Collection Components**
```tsx
// Member directory with search/filter
<MemberDirectory members={members} organizationId={id} />

// Story grid with search/filter  
<StoryCollection stories={stories} organizationId={id} />

// Projects grid with search/filter (NEW!)
<ProjectsCollection projects={projects} organizationId={id} />
```

**Dashboard Widgets**
```tsx
// Recent activity widgets (3-column layout)
<RecentActivity stories={recentStories} />
<RecentProjects projects={recentProjects} />  // NEW!
<MemberHighlights members={recentMembers} />
```

### **UI Primitives (shadcn/ui)**

**Cards**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content area
  </CardContent>
</Card>
```

**Badges** 
```tsx
<Badge variant="secondary">5 Members</Badge>
<Badge className="bg-green-50 text-green-700">Active</Badge>
```

**Buttons**
```tsx
<Button asChild size="sm" variant="outline">
  <Link href="/path">Action</Link>
</Button>
```

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoint System**
```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices and up */
md: 768px   /* Medium devices and up */  
lg: 1024px  /* Large devices and up */
xl: 1280px  /* Extra large devices and up */
2xl: 1536px /* 2X large devices and up */
```

### **Layout Patterns**

**Dashboard Grid**
```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>
```

**Content Grid**
```tsx
// Responsive content cards
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <ContentCard key={item.id} {...item} />)}
</div>
```

**Sidebar Layout**
```tsx
// Desktop: sidebar + content, Mobile: stacked
<div className="flex gap-6">
  <aside className="w-64 flex-shrink-0">
    <Navigation />
  </aside>
  <main className="flex-1">
    <Content />
  </main>
</div>
```

---

## 🎯 **INTERACTION PATTERNS**

### **Navigation Flow**
1. **Organization Header** → Shows current org context
2. **Sidebar Navigation** → 6 main sections with active states
3. **Breadcrumbs** → Organization > Current Page
4. **Page Actions** → "View All", "Search", "Filter" controls
5. **Inter-page Links** → Smooth navigation between sections

### **Search & Filter Pattern**
```tsx
// Consistent search/filter UI across all collection pages
<div className="flex flex-col gap-4 sm:flex-row">
  <Input 
    placeholder="Search..." 
    icon={Search}
    className="flex-1"
  />
  <Select>
    <option>All Categories</option>
  </Select>
</div>
```

### **Status Indicators**
```tsx
// Consistent status badges across components
<Badge className={getStatusColor(status)}>
  <Activity className="h-3 w-3 mr-1" />
  {status}
</Badge>
```

---

## 🔐 **AUTHENTICATION & ACCESS PATTERNS**

### **Layout Authentication**
```tsx
// layout.tsx - Organization-level access control
async function verifyOrganizationAccess(orgId: string) {
  // Check user tenant_id matches organization tenant_id
  // Return 404 if no access, continue if authorized
}
```

### **Data Access Pattern**
```tsx
// Consistent tenant-based data filtering
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('tenant_id', organization.tenant_id) // Tenant isolation
  .order('created_at', { ascending: false })
```

---

## 🎨 **VISUAL DESIGN PRINCIPLES**

### **Information Hierarchy**
1. **Organization Header** (High contrast, branded)
2. **Page Titles** (Large, bold typography)
3. **Metric Cards** (Color-coded, prominent numbers)
4. **Content Cards** (Consistent card pattern)
5. **Supporting Info** (Muted colors, smaller text)

### **Color Usage**
- **Primary Blue**: Navigation, links, primary actions
- **Status Colors**: Green (success), Yellow (warning), Red (error)
- **Neutral Gray**: Supporting text, borders, backgrounds
- **White Space**: Generous padding, clean layouts

### **Iconography**
```tsx
// Consistent icon usage (Lucide React)
Dashboard: LayoutDashboard
Members: Users
Stories: BookOpen
Projects: FolderOpen  // NEW!
Analytics: BarChart3
Settings: Settings
```

---

## 🚀 **COMPONENT USAGE EXAMPLES**

### **Typical Dashboard Page Structure**
```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Organization Dashboard</h1>
        <p className="text-muted-foreground">Overview and metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OrganizationMetrics metrics={metrics} />
      </div>

      {/* Content Widgets */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <RecentActivity stories={stories} />
        <RecentProjects projects={projects} />
        <MemberHighlights members={members} />
      </div>
    </div>
  )
}
```

### **Typical Collection Page Structure**
```tsx
export default function CollectionPage() {
  return (
    <div className="space-y-6">
      {/* Page Header with Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collection Name</h2>
          <p className="text-muted-foreground">{count} items</p>
        </div>
        <Badge variant="secondary">{count} Total</Badge>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput />
        <FilterSelect />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => <ItemCard key={item.id} {...item} />)}
      </div>

      {/* Empty State */}
      {items.length === 0 && <EmptyState />}
    </div>
  )
}
```

---

## ✅ **DESIGN SYSTEM CHECKLIST**

**Visual Consistency**
- [ ] Consistent spacing using Tailwind scale
- [ ] Unified color palette across components
- [ ] Typography hierarchy maintained
- [ ] Icon usage standardized (Lucide React)

**Interaction Consistency** 
- [ ] Navigation patterns consistent
- [ ] Search/filter UI standardized
- [ ] Button styles and states unified
- [ ] Loading and empty states designed

**Responsive Design**
- [ ] Mobile-first approach
- [ ] Breakpoint usage consistent
- [ ] Touch targets appropriately sized
- [ ] Content reflows properly

**Accessibility**
- [ ] Color contrast ratios meet WCAG standards
- [ ] Keyboard navigation supported
- [ ] Screen reader friendly markup
- [ ] Focus indicators visible

This design system provides a solid foundation for the organization dashboard and can be extended for future features while maintaining consistency! 🎨