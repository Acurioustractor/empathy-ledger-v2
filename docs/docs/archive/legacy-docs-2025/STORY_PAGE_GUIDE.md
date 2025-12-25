# Story Reading Page - Implementation Guide

Complete documentation for the beautiful story reading experience at `/stories/[id]`.

## Overview

The story reading page provides a world-class reading experience inspired by Medium, Substack, and the New York Times, while maintaining cultural sensitivity and celebrating storytellers.

## Page Structure

```
/stories/[id]
├── Header (site navigation)
├── Back Button
├── Story Header
│   ├── Badges (featured, type, sensitivity, elder approval)
│   ├── Title (4xl-5xl)
│   ├── Excerpt (optional)
│   └── Metadata (reading time, location, date, views)
├── Storyteller Card (compact)
│   ├── Avatar with profile image
│   ├── Name + Elder badge
│   ├── Cultural background
│   ├── Bio snippet
│   └── Link to all stories
├── Story Content (prose typography)
├── Theme Badges
├── Engagement Bar (like, share, save)
├── About the Storyteller (expanded)
│   ├── Large avatar
│   ├── Full bio
│   └── View Profile button
└── Footer
```

## Key Components

### Story Header

**Features:**
- Large, bold title (text-4xl md:text-5xl)
- Optional excerpt subtitle
- Badge row showing story metadata
- Metadata icons (reading time, location, date, views)

**Badges:**
- Featured Story (amber gradient)
- Story Type (secondary badge)
- Cultural Sensitivity (color-coded: emerald/amber/purple)
- Elder Approval (amber with check icon)

### Storyteller Card

**Compact Version (before content):**
- 64px avatar with profile image
- Name + elder crown icon
- Cultural background
- Bio snippet
- Link to view all stories

**Expanded Version (after content):**
- 96px avatar with profile image
- Name + elder badge pill
- Cultural background with map icon
- Full bio text
- "View Profile" button

### Story Content

**Typography:**
- Uses `prose prose-lg` for optimal readability
- Automatic paragraph formatting
- Line-height: `leading-relaxed`
- Color: `text-foreground/90` for subtle softness

**Formatting:**
- Splits content on newlines (`\n` or `\n\n`)
- Filters empty paragraphs
- 24px margin between paragraphs
- Max-width for optimal line length

### Engagement Bar

**Actions:**
- **Like**: Toggle heart, shows count, fills when liked
- **Share**: Native Web Share API or clipboard fallback
- **Save**: Bookmark toggle, persists state

**Layout:**
- Border top and bottom
- Left: Like and Share buttons
- Right: Save button

## Data Requirements

### Story Object

```typescript
interface Story {
  id: string
  title: string
  content: string
  excerpt?: string

  // Metadata
  created_at: string
  publication_date?: string
  reading_time_minutes?: number
  location?: string

  // Classification
  status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organisation' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  story_type?: string

  // Features
  featured?: boolean
  elder_approval?: boolean

  // Taxonomy
  themes?: string[]
  tags?: string[]

  // Engagement
  views_count?: number
  likes_count?: number
  shares_count?: number

  // Relations
  storyteller?: Storyteller
  author?: Author
}
```

### Storyteller Object

```typescript
interface Storyteller {
  id: string
  display_name: string
  bio?: string
  cultural_background?: string
  is_elder?: boolean
  profile_image_url?: string
}
```

## API Integration

### GET /api/stories/[id]

**Request:**
```
GET /api/stories/abc-123
```

**Response:**
```json
{
  "id": "abc-123",
  "title": "Story Title",
  "content": "Story content with paragraphs...",
  "excerpt": "Brief summary",
  "reading_time_minutes": 5,
  "location": "Sydney, Australia",
  "cultural_sensitivity_level": "medium",
  "story_type": "personal",
  "featured": true,
  "elder_approval": true,
  "views_count": 1234,
  "likes_count": 56,
  "shares_count": 12,
  "storyteller": {
    "id": "user-123",
    "display_name": "John Doe",
    "bio": "Elder from Wurundjeri Country",
    "cultural_background": "Wurundjeri",
    "is_elder": true,
    "profile_image_url": "https://..."
  }
}
```

## Visual Design

### Typography Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Story Title | `text-4xl md:text-5xl` | 36-48px | bold |
| Excerpt | `text-xl` | 20px | normal |
| Section Heading | `text-2xl` | 24px | bold |
| Storyteller Name | `text-lg` | 18px | semibold |
| Body Content | `prose-lg` | 18px | normal |
| Metadata | `text-sm` | 14px | normal |

### Spacing Scale

| Gap | Value | Usage |
|-----|-------|-------|
| `gap-1.5` | 6px | Icon + text pairs |
| `gap-2` | 8px | Badge groups |
| `gap-4` | 16px | Avatar + content |
| `gap-6` | 24px | Section elements |
| `mb-6` | 24px | Paragraph spacing |
| `mb-12` | 48px | Major section spacing |

### Color Palette

**Cultural Sensitivity:**
- Low: `bg-emerald-100 text-emerald-800`
- Medium: `bg-amber-100 text-amber-800`
- High: `bg-purple-100 text-purple-800`

**Elder Indicators:**
- Crown icon: `text-amber-500`
- Elder badge: `bg-amber-100 text-amber-800`

**Featured Story:**
- Badge: `bg-gradient-to-r from-amber-400 to-amber-600`

## Responsive Behavior

### Mobile (< 640px)
- Title: `text-4xl`
- Single column layout
- Full-width engagement bar
- Avatar sizes: 64px → 80px

### Tablet (640px - 1024px)
- Title: `text-5xl`
- Proper padding: `px-6`
- Avatar sizes maintain

### Desktop (> 1024px)
- Max-width: 896px (4xl container)
- Larger padding: `px-8`
- Optimal line length for reading

## Loading States

**Skeleton Loader:**
```tsx
<div className="animate-pulse space-y-8">
  <div className="h-8 bg-muted rounded w-1/4"></div>
  <div className="h-16 bg-muted rounded"></div>
  <div className="space-y-4">
    <div className="h-4 bg-muted rounded"></div>
    <div className="h-4 bg-muted rounded"></div>
    <div className="h-4 bg-muted rounded w-5/6"></div>
  </div>
</div>
```

## Error Handling

### Story Not Found
- Calls Next.js `notFound()` function
- Renders 404 page
- Triggers on API 404 or fetch error

### Missing Data
- Avatar fallback: Shows initials
- Missing excerpt: Section hidden
- Missing bio: Shows name only
- Missing metadata: Icon/value pair hidden

## Accessibility

### Semantic HTML
```html
<article>
  <header>
    <h1>Story Title</h1>
    <p>Excerpt</p>
  </header>
  <!-- Content -->
</article>
```

### ARIA Labels
- Avatar images have alt text
- Buttons have descriptive labels
- Links show destination context

### Keyboard Navigation
- All interactive elements focusable
- Proper focus indicators
- Tab order follows visual flow

## Cultural Sensitivity

### Elder Status
- Crown icon (prominent visual indicator)
- Elder badge pill in expanded section
- "Elder" text label
- Amber color (wisdom, respect)

### Cultural Background
- Map pin icon for location context
- Displayed early (storyteller card)
- Respectful presentation
- No stereotyping

### Approval Indicators
- Elder Approval badge (when applicable)
- Cultural sensitivity level (always shown)
- Clear, non-judgmental language

## Performance

### Optimization
- Client-side rendering (`'use client'`)
- Dynamic route (`force-dynamic`)
- Single API call for all data
- Optimistic UI updates (like/save)

### Image Loading
- Avatar images lazy-load
- Fallback initials (no flash)
- Proper alt text for SEO

## Future Enhancements

### Phase 3 (Rich Content)
- [ ] Image galleries within content
- [ ] Video embeds
- [ ] Audio players
- [ ] Pull quotes
- [ ] Photo captions

### Phase 4 (Engagement)
- [ ] Comment system
- [ ] Related stories carousel
- [ ] Story collections
- [ ] Reading progress indicator
- [ ] Print-friendly view

### Phase 5 (Social)
- [ ] Share to specific platforms
- [ ] Embed code generation
- [ ] Story reactions (beyond like)
- [ ] Reading lists

## Testing Checklist

**Visual:**
- [ ] Title displays correctly
- [ ] Badges show appropriate colors
- [ ] Profile images load
- [ ] Elder crown appears for elders
- [ ] Content formats into paragraphs
- [ ] Engagement buttons work

**Responsive:**
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Typography scales properly

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus indicators visible
- [ ] Alt text present

**Data:**
- [ ] Handles missing excerpt
- [ ] Handles missing bio
- [ ] Handles missing metadata
- [ ] Avatar fallback works
- [ ] 404 handling works

## Usage Example

```typescript
// Navigate to story
router.push(`/stories/${storyId}`)

// Direct URL
https://empathy-ledger-v2.vercel.app/stories/abc-123

// From story card
<Link href={`/stories/${story.id}`}>
  Read Story
</Link>
```

## Related Documentation

- [Admin Stories Page](./ADMIN_STORIES_REDESIGN.md)
- [Story Quality Guide](../STORY_QUALITY_ACTION_PLAN.md)
- [Story Craft Skill](../.claude/skills/story-craft/skill.md)
- [Design System](./design-component.md)

---

**Status**: ✅ Complete
**Last Updated**: 2025-12-23
**Maintained By**: Empathy Ledger Team
