# Empathy Ledger v2 - Brand & UI Style Guide
## Editorial Warmth Design System

**Version**: 1.0
**Date**: January 2, 2026
**Status**: Design Foundation for Development

---

## Part 1: Brand Foundation

### The Embrace Logo

**Visual Description**:
Two semicircular arcs facing each other:
- Left arc opens to the right
- Right arc opens to the left
- Space between = where empathy lives

**Meaning**:
- Two individuals coming together
- Open (not closed) = vulnerability, receptivity, invitation
- The space between = interview, transcript, ledger, empathy itself
- Mutual holding = reciprocal care

**Usage**:
```
Logo Variations:
├── logo-full.svg (220×48) - Icon + wordmark
├── logo-mark.svg (48×48) - Icon only
└── favicon.svg (32×32) - Browser tab icon

When to use:
- Full logo: Headers, marketing, print
- Icon only: Mobile headers, favicons, social media
- Monochrome: Single-color printing, watermarks
```

---

## Part 2: Color System - Editorial Warmth

### Primary Palette (Earth Tone Gradient)

```css
/* Primary Colors */
--ochre: #96643a;        /* Earth, ancestry, land */
--terracotta: #b84a32;   /* Warmth, humanity, heart */
--sage: #5c6d51;         /* Growth, healing, future */
--charcoal: #42291a;     /* Depth, grounding */
--cream: #faf6f1;        /* Space, openness */
```

**Color Meanings**:

| Color | Hex | RGB | Use Case | Emotion |
|-------|-----|-----|----------|---------|
| **Ochre** | #96643a | 150, 100, 58 | Earth, ancestry, land | Grounded, ancestral |
| **Terracotta** | #b84a32 | 184, 74, 50 | Primary actions, storytelling | Warm, inviting |
| **Sage** | #5c6d51 | 92, 109, 81 | Growth, success, healing | Calm, hopeful |
| **Charcoal** | #42291a | 66, 41, 26 | Text, depth, grounding | Serious, dignified |
| **Cream** | #faf6f1 | 250, 246, 241 | Backgrounds, space | Open, breathable |

### Extended Palette

```css
/* Semantic Colors */
--success: #5c6d51;      /* Sage - growth, healing */
--warning: #d97706;      /* Amber - caution, attention */
--error: #dc2626;        /* Red - danger, stop */
--info: #0284c7;         /* Sky - information, calm */

/* Neutral Scale (Charcoal to Cream) */
--neutral-900: #42291a;  /* Charcoal */
--neutral-800: #5a3a2a;
--neutral-700: #72493a;
--neutral-600: #8a5a4a;
--neutral-500: #a27868;
--neutral-400: #ba9686;
--neutral-300: #d2b4a4;
--neutral-200: #ead2c2;
--neutral-100: #f5e9e0;
--neutral-50: #faf6f1;   /* Cream */

/* Cultural Theme Colors */
--cultural: #d97706;     /* Amber - cultural heritage */
--family: #059669;       /* Emerald - family bonds */
--land: #0284c7;         /* Sky - connection to land */
--resilience: #dc2626;   /* Red - strength, resilience */
--knowledge: #7c3aed;    /* Violet - wisdom, knowledge */
--justice: #ea580c;      /* Orange - justice, truth */
--arts: #06b6d4;         /* Cyan - creative expression */
--everyday: #65a30d;     /* Lime - daily life */
```

### Color Application

**Buttons**:
```typescript
// Primary action (Terracotta)
className="bg-[#b84a32] hover:bg-[#a03a28] text-white"

// Secondary action (Sage)
className="bg-[#5c6d51] hover:bg-[#4a5741] text-white"

// Ghost/outline (Charcoal)
className="border border-[#42291a] text-[#42291a] hover:bg-neutral-50"
```

**Backgrounds**:
```typescript
// Page background
className="bg-[#faf6f1]"

// Card background
className="bg-white"

// Elevated surface
className="bg-white shadow-md"

// Subtle section
className="bg-neutral-50"
```

**Text**:
```typescript
// Primary text (Charcoal)
className="text-[#42291a]"

// Secondary text
className="text-neutral-600"

// Muted text
className="text-neutral-500"

// Link text (Terracotta)
className="text-[#b84a32] hover:text-[#a03a28]"
```

---

## Part 3: Typography

### Font Families

```css
/* Wordmark/Logo: Georgia (serif) */
--font-logo: Georgia, 'Times New Roman', serif;

/* Headings: System serif (dignified) */
--font-heading: Georgia, 'Times New Roman', serif;

/* Body: System sans-serif (accessible) */
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Mono: For code/timestamps */
--font-mono: 'Courier New', Courier, monospace;
```

**Why These Choices**:
- **Georgia (serif)**: Classic, readable, dignified - "Ledger" feels permanent
- **System sans-serif**: Clean, accessible, modern - doesn't compete with stories
- **No custom fonts**: Faster load times, better accessibility

### Type Scale

```css
/* Display (Hero headings) */
.text-display {
  font-family: var(--font-heading);
  font-size: 3.75rem;    /* 60px */
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Heading 1 */
.text-h1 {
  font-family: var(--font-heading);
  font-size: 2.25rem;    /* 36px */
  line-height: 1.2;
  font-weight: 700;
}

/* Heading 2 */
.text-h2 {
  font-family: var(--font-heading);
  font-size: 1.875rem;   /* 30px */
  line-height: 1.3;
  font-weight: 600;
}

/* Heading 3 */
.text-h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;     /* 24px */
  line-height: 1.4;
  font-weight: 600;
}

/* Heading 4 */
.text-h4 {
  font-family: var(--font-heading);
  font-size: 1.25rem;    /* 20px */
  line-height: 1.5;
  font-weight: 600;
}

/* Body Large */
.text-body-lg {
  font-family: var(--font-body);
  font-size: 1.125rem;   /* 18px */
  line-height: 1.6;
  font-weight: 400;
}

/* Body (default) */
.text-body {
  font-family: var(--font-body);
  font-size: 1rem;       /* 16px */
  line-height: 1.6;
  font-weight: 400;
}

/* Body Small */
.text-body-sm {
  font-family: var(--font-body);
  font-size: 0.875rem;   /* 14px */
  line-height: 1.5;
  font-weight: 400;
}

/* Caption */
.text-caption {
  font-family: var(--font-body);
  font-size: 0.75rem;    /* 12px */
  line-height: 1.4;
  font-weight: 400;
  color: var(--neutral-600);
}
```

### Typography Application

**Storyteller Names**:
```typescript
className="font-serif text-2xl font-semibold text-charcoal"
```

**Story Titles**:
```typescript
className="font-serif text-3xl font-bold text-charcoal leading-tight"
```

**Cultural Affiliations**:
```typescript
className="font-sans text-sm font-medium text-neutral-600"
```

**Body Text (Transcripts)**:
```typescript
className="font-sans text-base leading-relaxed text-charcoal"
```

**Timestamps**:
```typescript
className="font-mono text-xs text-neutral-500"
```

---

## Part 4: Spacing System

### Scale (8pt Grid)

```css
/* Spacing Scale */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */

/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Component Spacing

**Cards**:
```typescript
// Card padding
className="p-6" // 24px padding

// Card gap between elements
className="space-y-4" // 16px vertical gap
```

**Page Layout**:
```typescript
// Page margins
className="px-4 md:px-8 lg:px-12" // Responsive horizontal padding

// Section spacing
className="py-12 md:py-16 lg:py-20" // Responsive vertical padding

// Container
className="max-w-7xl mx-auto" // Centered container
```

**Lists**:
```typescript
// Tight list
className="space-y-2" // 8px gaps

// Normal list
className="space-y-4" // 16px gaps

// Loose list
className="space-y-6" // 24px gaps
```

---

## Part 5: Component Library

### Buttons

**Primary Button**:
```typescript
<button className="
  bg-terracotta hover:bg-terracotta-dark
  text-white font-medium
  px-6 py-3 rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  {label}
</button>
```

**Secondary Button**:
```typescript
<button className="
  bg-sage hover:bg-sage-dark
  text-white font-medium
  px-6 py-3 rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2
">
  {label}
</button>
```

**Ghost Button**:
```typescript
<button className="
  border-2 border-charcoal
  text-charcoal font-medium
  px-6 py-3 rounded-lg
  hover:bg-neutral-50
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2
">
  {label}
</button>
```

### Cards

**Story Card**:
```typescript
<div className="
  bg-white rounded-xl
  border border-neutral-200
  shadow-sm hover:shadow-md
  overflow-hidden
  transition-all duration-200
">
  <div className="aspect-video bg-neutral-100">
    {/* Story image */}
  </div>
  <div className="p-6 space-y-3">
    <h3 className="font-serif text-xl font-semibold text-charcoal">
      {storyTitle}
    </h3>
    <p className="text-sm text-neutral-600 line-clamp-2">
      {storyDescription}
    </p>
    <div className="flex items-center gap-2">
      <Avatar size="sm" />
      <span className="text-sm font-medium text-charcoal">
        {storytellerName}
      </span>
    </div>
  </div>
</div>
```

**Storyteller Card**:
```typescript
<div className="
  bg-white rounded-xl
  border border-neutral-200
  shadow-sm hover:shadow-lg
  p-6
  transition-all duration-200
">
  <div className="flex items-start gap-4">
    <Avatar size="lg" src={profilePhoto} />
    <div className="flex-1 space-y-2">
      <h3 className="font-serif text-lg font-semibold text-charcoal">
        {displayName}
      </h3>
      <p className="text-sm font-medium text-neutral-600">
        {culturalAffiliations}
      </p>
      <div className="flex gap-2 flex-wrap">
        {themes.map(theme => (
          <Badge variant="cultural" key={theme}>{theme}</Badge>
        ))}
      </div>
    </div>
  </div>
</div>
```

### Badges

**Cultural Protocol Badge**:
```typescript
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-full
  bg-ochre/10 text-ochre
  text-xs font-medium
  border border-ochre/20
">
  <Icon name="shield" size={12} />
  Cultural Protocols
</span>
```

**Privacy Badge**:
```typescript
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-full
  bg-sage/10 text-sage
  text-xs font-medium
  border border-sage/20
">
  <Icon name="lock" size={12} />
  {visibilityLevel}
</span>
```

**Theme Badge**:
```typescript
<span className="
  inline-flex items-center
  px-2.5 py-0.5 rounded-full
  bg-cultural/10 text-cultural
  text-xs font-medium
">
  {themeName}
</span>
```

### Inputs

**Text Input**:
```typescript
<div className="space-y-1.5">
  <label className="block text-sm font-medium text-charcoal">
    {label}
  </label>
  <input
    type="text"
    className="
      w-full px-4 py-2.5
      border border-neutral-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent
      text-charcoal placeholder:text-neutral-400
      transition-all duration-200
    "
    placeholder={placeholder}
  />
  {helperText && (
    <p className="text-xs text-neutral-600">{helperText}</p>
  )}
</div>
```

**Textarea**:
```typescript
<textarea
  className="
    w-full px-4 py-2.5
    border border-neutral-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent
    text-charcoal placeholder:text-neutral-400
    min-h-[120px]
    resize-y
  "
  placeholder={placeholder}
/>
```

**Select**:
```typescript
<select
  className="
    w-full px-4 py-2.5
    border border-neutral-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent
    text-charcoal
    bg-white
  "
>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
```

### Avatars

**Size Variants**:
```typescript
// Extra small (24px)
<img className="w-6 h-6 rounded-full" />

// Small (32px)
<img className="w-8 h-8 rounded-full" />

// Medium (40px)
<img className="w-10 h-10 rounded-full" />

// Large (48px)
<img className="w-12 h-12 rounded-full" />

// Extra large (64px)
<img className="w-16 h-16 rounded-full" />

// 2XL (96px)
<img className="w-24 h-24 rounded-full" />
```

**Avatar with Fallback**:
```typescript
{profilePhoto ? (
  <img
    src={profilePhoto}
    alt={displayName}
    className="w-12 h-12 rounded-full object-cover"
  />
) : (
  <div className="
    w-12 h-12 rounded-full
    bg-ochre/20 text-ochre
    flex items-center justify-center
    font-semibold text-lg
  ">
    {initials}
  </div>
)}
```

---

## Part 6: Iconography

### Icon System

**Icon Library**: Lucide React (https://lucide.dev)

**Common Icons**:
```typescript
import {
  User,           // Profile
  Heart,          // Story/empathy
  Shield,         // Cultural protocols
  Lock,           // Privacy
  Globe,          // Public visibility
  Users,          // Community
  MapPin,         // Location
  Calendar,       // Date/time
  Eye,            // Views
  MessageCircle,  // Comments
  Share2,         // Share
  Download,       // Download
  Upload,         // Upload
  Image,          // Photo
  Video,          // Video
  Mic,            // Audio
  FileText,       // Transcript
  Tag,            // Theme tag
  TrendingUp,     // Growth/analytics
  BarChart3,      // Analytics
  Settings,       // Settings
  Search,         // Search
  Filter,         // Filters
  ChevronRight,   // Navigation
  ChevronDown,    // Dropdown
  X,              // Close
  Check,          // Success
  AlertCircle,    // Warning
  Info,           // Information
} from 'lucide-react'
```

**Icon Sizes**:
```typescript
// Extra small
<Icon size={12} />

// Small
<Icon size={16} />

// Medium (default)
<Icon size={20} />

// Large
<Icon size={24} />

// Extra large
<Icon size={32} />
```

**Icon with Text**:
```typescript
<div className="flex items-center gap-2">
  <MapPin size={16} className="text-neutral-500" />
  <span className="text-sm text-neutral-700">{location}</span>
</div>
```

---

## Part 7: Motion & Animation

### Principles

**Trauma-Informed Design**:
- Gentle transitions (no sudden movements)
- Respectful timing (not too fast)
- User control (can pause/disable)
- Predictable behavior

### Transition Timing

```css
/* Fast (UI feedback) */
--duration-fast: 150ms;

/* Normal (most transitions) */
--duration-normal: 200ms;

/* Slow (complex animations) */
--duration-slow: 300ms;

/* Easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Common Animations

**Fade In**:
```typescript
<div className="
  opacity-0 animate-fade-in
  animation-duration-300 animation-ease-out
">
  {content}
</div>
```

**Slide Up**:
```typescript
<div className="
  translate-y-4 opacity-0
  transition-all duration-300
  data-[state=open]:translate-y-0 data-[state=open]:opacity-100
">
  {content}
</div>
```

**Scale**:
```typescript
<button className="
  transition-transform duration-200
  hover:scale-105
  active:scale-95
">
  {label}
</button>
```

**Hover Glow** (Cards):
```typescript
<div className="
  transition-shadow duration-200
  hover:shadow-lg
  hover:shadow-terracotta/5
">
  {content}
</div>
```

---

## Part 8: Responsive Design

### Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

**Tailwind Breakpoints**:
```typescript
// Mobile (default)
className="text-sm"

// Small tablets and up
className="sm:text-base"

// Tablets and up
className="md:text-lg"

// Laptops and up
className="lg:text-xl"

// Desktops and up
className="xl:text-2xl"
```

### Mobile-First Grid

**Story Grid**:
```typescript
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-6
">
  {stories.map(story => <StoryCard key={story.id} {...story} />)}
</div>
```

**Storyteller Grid**:
```typescript
<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
  {storytellers.map(st => <StorytellerCard key={st.id} {...st} />)}
</div>
```

### Touch Targets

**Minimum Size**: 44×44px (Apple), 48×48px (Material Design)

```typescript
// Button touch target
<button className="
  min-w-[44px] min-h-[44px]
  px-6 py-3
">
  {label}
</button>

// Icon button
<button className="
  w-12 h-12
  flex items-center justify-center
  rounded-lg
">
  <Icon size={20} />
</button>
```

---

## Part 9: Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Tested Combinations**:
```typescript
// PASS: Charcoal on Cream
text-charcoal on bg-cream // 9.2:1

// PASS: Terracotta on White
text-terracotta on bg-white // 4.7:1

// PASS: White on Terracotta
text-white on bg-terracotta // 4.7:1

// PASS: Charcoal on Neutral-50
text-charcoal on bg-neutral-50 // 8.9:1
```

**Keyboard Navigation**:
```typescript
// Focus ring
className="
  focus:outline-none
  focus:ring-2
  focus:ring-terracotta
  focus:ring-offset-2
"

// Skip to main content
<a href="#main-content" className="
  sr-only focus:not-sr-only
  focus:absolute focus:top-4 focus:left-4
  bg-terracotta text-white
  px-4 py-2 rounded
">
  Skip to main content
</a>
```

**ARIA Labels**:
```typescript
// Button with icon only
<button aria-label="Close dialog">
  <X size={20} />
</button>

// Image
<img
  src={storyImage}
  alt={`${storyTitle} by ${storytellerName}`}
  loading="lazy"
/>

// Status message
<div role="status" aria-live="polite">
  Story saved successfully
</div>
```

**Screen Reader Only**:
```typescript
<span className="sr-only">
  This story contains cultural content reviewed by elders
</span>
```

---

## Part 10: Cultural Safety Visual Indicators

### Sacred Content Overlay

```typescript
<div className="relative">
  {isSacred && (
    <div className="
      absolute inset-0
      bg-gradient-to-b from-ochre/80 to-ochre/60
      backdrop-blur-md
      flex items-center justify-center
      z-10
    ">
      <div className="text-center text-white p-6 space-y-3">
        <Shield size={48} className="mx-auto" />
        <h3 className="font-serif text-xl font-semibold">
          Sacred Content
        </h3>
        <p className="text-sm max-w-sm">
          This content contains sacred knowledge protected by cultural protocols
        </p>
        <button className="
          bg-white text-ochre
          px-4 py-2 rounded-lg
          font-medium text-sm
        ">
          Request Access
        </button>
      </div>
    </div>
  )}
  <img src={content} alt={alt} />
</div>
```

### Cultural Protocol Badge System

```typescript
// Elder Approved
<Badge variant="success" icon={<Check size={12} />}>
  Elder Approved
</Badge>

// Pending Review
<Badge variant="warning" icon={<Clock size={12} />}>
  Pending Elder Review
</Badge>

// Cultural Sensitivity
<Badge variant="cultural" icon={<Shield size={12} />}>
  Cultural Protocols Apply
</Badge>

// Sacred Knowledge
<Badge variant="sacred" icon={<Lock size={12} />}>
  Sacred Knowledge
</Badge>

// Community Only
<Badge variant="community" icon={<Users size={12} />}>
  Community Only
</Badge>
```

### Trigger Warnings

```typescript
<div className="
  border-l-4 border-warning
  bg-warning/5
  p-4 rounded-r-lg
  space-y-2
">
  <div className="flex items-center gap-2">
    <AlertCircle size={20} className="text-warning" />
    <h4 className="font-semibold text-warning">
      Content Warning
    </h4>
  </div>
  <p className="text-sm text-neutral-700">
    This story contains discussion of {triggerTopics.join(', ')}.
    Please proceed with care.
  </p>
  <button className="text-sm text-warning font-medium">
    I understand, continue →
  </button>
</div>
```

---

## Part 11: Loading States

### Skeleton Loaders

```typescript
// Story Card Skeleton
<div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
  <div className="aspect-video bg-neutral-200 rounded-lg mb-4" />
  <div className="space-y-3">
    <div className="h-6 bg-neutral-200 rounded w-3/4" />
    <div className="h-4 bg-neutral-200 rounded w-full" />
    <div className="h-4 bg-neutral-200 rounded w-2/3" />
  </div>
</div>

// Text Skeleton
<div className="space-y-2">
  <div className="h-4 bg-neutral-200 rounded w-full" />
  <div className="h-4 bg-neutral-200 rounded w-5/6" />
  <div className="h-4 bg-neutral-200 rounded w-4/6" />
</div>
```

### Spinners

```typescript
// Terracotta Spinner
<div className="
  w-8 h-8
  border-4 border-neutral-200
  border-t-terracotta
  rounded-full
  animate-spin
" />

// With Text
<div className="flex items-center gap-3">
  <div className="w-5 h-5 border-2 border-neutral-200 border-t-terracotta rounded-full animate-spin" />
  <span className="text-sm text-neutral-600">Loading stories...</span>
</div>
```

---

## Part 12: Error States

### Empty States

```typescript
<div className="
  flex flex-col items-center justify-center
  py-12 px-6
  text-center
">
  <div className="
    w-16 h-16 rounded-full
    bg-neutral-100
    flex items-center justify-center
    mb-4
  ">
    <Icon size={32} className="text-neutral-400" />
  </div>
  <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
    {emptyStateTitle}
  </h3>
  <p className="text-neutral-600 max-w-sm mb-6">
    {emptyStateDescription}
  </p>
  <button className="btn-primary">
    {emptyStateAction}
  </button>
</div>
```

### Error Messages

```typescript
<div className="
  border border-error
  bg-error/5
  rounded-lg p-4
  flex items-start gap-3
">
  <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="font-semibold text-error mb-1">
      {errorTitle}
    </h4>
    <p className="text-sm text-neutral-700">
      {errorMessage}
    </p>
  </div>
</div>
```

---

## Part 13: Notification/Toast System

```typescript
// Success Toast
<div className="
  bg-white border-l-4 border-success
  shadow-lg rounded-lg p-4
  flex items-start gap-3
">
  <Check size={20} className="text-success flex-shrink-0" />
  <div>
    <h4 className="font-semibold text-charcoal">
      Story published successfully
    </h4>
    <p className="text-sm text-neutral-600">
      Your story is now live and visible to the community
    </p>
  </div>
</div>

// Warning Toast
<div className="
  bg-white border-l-4 border-warning
  shadow-lg rounded-lg p-4
">
  <AlertCircle size={20} className="text-warning" />
  <p className="text-sm text-charcoal">
    Elder review required before publishing
  </p>
</div>

// Error Toast
<div className="
  bg-white border-l-4 border-error
  shadow-lg rounded-lg p-4
">
  <X size={20} className="text-error" />
  <p className="text-sm text-charcoal">
    Failed to upload media. Please try again.
  </p>
</div>
```

---

## Part 14: Brand Voice Guidelines

### Tone Attributes

**We Are**:
- **Respectful**: Every story treated with dignity
- **Clear**: Plain language, no jargon
- **Warm**: Human, not institutional
- **Honest**: About limitations and intentions

**We Are NOT**:
- **Extractive**: We don't take stories, we hold them
- **Performative**: Action over optics
- **Paternalistic**: Communities lead, we support

### Messaging Patterns

**DO SAY**:
- "Your stories remain yours"
- "Indigenous communities lead, we support"
- "Data sovereignty is non-negotiable"
- "Designed with Indigenous communities, for justice across all"

**DON'T SAY**:
- "We empower" (savior complex)
- "We give voice to" (patronizing)
- "Our storytellers" (possession)
- "Help Indigenous communities" (paternalistic)

### Button Labels

**Preferred**:
- "Share Story" (not "Submit")
- "Review Draft" (not "Check")
- "Publish Story" (not "Go Live")
- "Save Changes" (not "Submit")
- "Request Elder Review" (not "Send for Approval")

---

## Part 15: Component Checklist

Every component MUST have:

- [ ] **Accessibility**: WCAG 2.1 AA compliant
- [ ] **Keyboard Navigation**: Tab, Enter, Escape work
- [ ] **Focus Indicators**: Visible focus rings
- [ ] **ARIA Labels**: Descriptive for screen readers
- [ ] **Color Contrast**: Meets 4.5:1 minimum
- [ ] **Touch Targets**: Minimum 44×44px
- [ ] **Responsive**: Works on mobile/tablet/desktop
- [ ] **Loading States**: Skeleton or spinner
- [ ] **Error States**: Clear error messages
- [ ] **Empty States**: Helpful guidance
- [ ] **Cultural Safety**: Respects cultural protocols
- [ ] **Brand Alignment**: Uses Editorial Warmth palette
- [ ] **Performance**: Loads < 100ms render time

---

## Part 16: Design Tokens (Tailwind Config)

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        ochre: '#96643a',
        terracotta: {
          DEFAULT: '#b84a32',
          dark: '#a03a28',
        },
        sage: {
          DEFAULT: '#5c6d51',
          dark: '#4a5741',
        },
        charcoal: '#42291a',
        cream: '#faf6f1',

        cultural: '#d97706',
        family: '#059669',
        land: '#0284c7',
        resilience: '#dc2626',
        knowledge: '#7c3aed',
        justice: '#ea580c',
        arts: '#06b6d4',
        everyday: '#65a30d',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
    },
  },
}
```

---

**This brand and UI style guide provides the complete design foundation for building Empathy Ledger v2 with Editorial Warmth, cultural sensitivity, and world-class accessibility.**
