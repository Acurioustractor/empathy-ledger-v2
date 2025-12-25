# Admin Stories Page - Redesign Documentation

Complete redesign of the admin stories management interface with improved UX, storyteller integration, and ACT Farm sharing controls.

## Overview

The new admin stories page provides a comprehensive, brand-aligned interface for managing stories with:

- ✅ Beautiful story cards with storyteller information and avatars
- ✅ Grid and List view modes
- ✅ ACT Farm sharing toggle directly on cards
- ✅ Advanced filtering and sorting
- ✅ Responsive design with cultural sensitivity
- ✅ Real-time search
- ✅ Status badges and metrics

## Design System Alignment

### Color Palette

Follows the Empathy Ledger design system:

| Element | Color | Usage |
|---------|-------|-------|
| Elder Badge | Amber/Gold | Crown icon, elder status |
| Published | Emerald | Success states, published stories |
| Draft | Slate | Work in progress |
| Under Review | Amber | Attention needed |
| Flagged | Red | Critical attention |
| ACT Farm Share | Blue | External sharing indicator |
| Featured | Amber gradient | Premium content |

### Typography

- **Headings**: Bold, hierarchical (H1 → H3)
- **Body**: Relaxed line-height for readability
- **Metadata**: Smaller, muted text
- **Storyteller Names**: Semibold for prominence

## Component Architecture

### AdminStoryCard

Located: `src/components/admin/admin-story-card.tsx`

**Props:**
```typescript
interface AdminStoryCardProps {
  story: Story                  // Full story object with storyteller
  shareToActFarm?: boolean      // Current sharing status
  onShareToggle?: (id, share) => Promise<void>
  onView?: (id) => void
  onEdit?: (id) => void
  variant?: 'grid' | 'list'     // View mode
  className?: string
}
```

**Features:**
- Storyteller avatar with initials fallback
- Elder status crown icon
- Featured story badge
- Status indicator
- ACT Farm sharing toggle
- View and Edit actions
- Responsive grid/list layouts

### Grid View

320px min-width cards in responsive grid:

```
Mobile:    1 column
Tablet:    2 columns
Desktop:   3 columns
Wide:      4 columns
```

**Card Layout:**
```
┌─────────────────────────────┐
│ Avatar  Name      [Status]  │
│         Cultural Background │
├─────────────────────────────┤
│ Story Title (bold, 2 lines) │
│ [Featured Badge if present] │
├─────────────────────────────┤
│ Content preview (3 lines)   │
├─────────────────────────────┤
│ 📅 Date  ⏱️ Time  📍 Loc   │
│ [Theme] [Theme] [Theme]     │
├─────────────────────────────┤
│ Share to ACT Farm [Toggle]  │
│ ✓ Shared to registry        │
├─────────────────────────────┤
│ [View Button] [Edit Button] │
└─────────────────────────────┘
```

### List View

Full-width horizontal cards:

```
┌──────────────────────────────────────────────────────────────┐
│ [Avatar] Name (Elder) | Title                    [Status]    │
│          Cultural BG  | Content preview...                   │
│                       | 📅 Date ⏱️ Time 📍 Location         │
│                       | Share [Toggle] [View] [Edit]         │
└──────────────────────────────────────────────────────────────┘
```

## Page Features

### Header Section

**Title Bar:**
- Page title: "Story Management"
- Subtitle: Context and purpose
- Actions: Refresh, Export, New Story

**Filters & Controls:**
1. **Search** - Full-text search across:
   - Story title
   - Story content
   - Storyteller name

2. **Status Filter** - Dropdown with counts:
   - All Stories (125)
   - Published (87)
   - Draft (23)
   - Under Review (8)
   - Flagged (2)
   - Archived (5)

3. **Sort Options**:
   - Newest First (default)
   - Oldest First
   - Title A-Z
   - Storyteller Name

4. **View Toggle**:
   - Grid icon (cards)
   - List icon (rows)

**Stats Bar:**
- "Showing 87 of 125 stories"
- "12 shared to ACT Farm"

### Story Cards

Each card displays:

**TIER 1 - Always Visible:**
- Storyteller avatar (or initials)
- Storyteller name
- Cultural background
- Elder status (if applicable)
- Story title (truncated 2 lines)
- Status badge
- Featured badge (if applicable)

**TIER 2 - Grid View:**
- Content preview (150 chars)
- Created date
- Reading time
- Location
- Up to 3 theme tags
- ACT Farm sharing toggle
- View and Edit buttons

**TIER 3 - List View:**
- Content preview (180 chars)
- All metadata inline
- Compact sharing toggle
- Inline actions

### ACT Farm Sharing

**Toggle States:**
- ⚪ OFF - Not shared
- 🔵 ON - Shared to registry
- ⏳ Loading - API call in progress
- ❌ Error - Show error message

**Success Message:**
```
✓ Shared to registry
```

**Error Message:**
```
⚠ Story is missing storyteller/author ownership
```

**Toggle Location:**
- Grid View: Dedicated section in card
- List View: Inline with metadata

## Data Flow

### Fetching Stories

```typescript
// GET stories with storyteller join
const { data } = await supabase
  .from('stories')
  .select(`
    *,
    storyteller:profiles!stories_storyteller_id_fkey(
      id,
      display_name,
      bio,
      cultural_background,
      is_elder,
      avatar_url
    )
  `)
  .order('created_at', { ascending: false })
```

### Fetching Share Statuses

```typescript
// GET all shared stories
const { data } = await supabase
  .from('story_syndication_consent')
  .select('story_id, consent_granted')
  .eq('consent_granted', true)
```

### Updating Share Status

```typescript
// POST to sharing API
const response = await fetch('/api/admin/story-sharing', {
  method: 'POST',
  body: JSON.stringify({
    story_id: 'uuid',
    share: true,
    share_media: true
  })
})
```

## Cultural Sensitivity

### Respectful Display

1. **Elder Status**:
   - Crown icon (amber/gold)
   - "Elder" badge
   - Positioned prominently

2. **Cultural Background**:
   - Displayed with map pin icon
   - Never truncated
   - Respectful typography

3. **Traditional Territory**:
   - Shown when available
   - Format: "Cultural Background (Territory)"

### Sensitivity Levels

Stories are tagged with cultural sensitivity:

- **Low** (Blue): Public content
- **Medium** (Amber): Community-specific
- **High** (Red): Sacred/sensitive

This affects:
- Visibility controls
- Sharing permissions
- Access restrictions

## Responsive Behavior

### Breakpoints

```css
Mobile:   < 768px   - 1 column grid
Tablet:   768-1024  - 2 column grid
Desktop:  1024-1440 - 3 column grid
Wide:     > 1440px  - 4 column grid
```

### List View

Always full-width, adapts content:
- Mobile: Stack metadata vertically
- Tablet: Inline metadata
- Desktop: Full horizontal layout

## Performance Optimizations

1. **Lazy Loading**: Cards render as they scroll into view
2. **Debounced Search**: 300ms delay on input
3. **Memoized Filters**: Only re-filter when dependencies change
4. **Optimistic Updates**: Toggle UI updates immediately
5. **Error Recovery**: Failed API calls revert state

## Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels on all controls
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Color contrast WCAG AA
- ✅ Semantic HTML

## Files

| File | Purpose |
|------|---------|
| `src/components/admin/admin-story-card.tsx` | Story card component |
| `src/app/admin/stories/page.tsx` | Main admin page |
| `src/app/admin/stories/page-old-backup.tsx` | Original page (backup) |
| `src/app/api/admin/story-sharing/route.ts` | Sharing API |

## Migration Notes

### Old Page → New Page

**Removed Features:**
- Modal-based story viewing (replaced with direct links)
- Inline editing (moved to dedicated edit page)
- Complex filter modal (simplified to dropdowns)

**Added Features:**
- Grid/List view toggle
- Storyteller avatars on cards
- Inline ACT Farm sharing
- Real-time search
- Status counts
- Improved filtering

### Breaking Changes

None - API endpoints remain the same.

### Data Requirements

Stories must have:
- `storyteller_id` or `author_id` (for sharing)
- Join to profiles table for storyteller data

## Usage

### Navigate to Page

```
https://empathy-ledger-v2.vercel.app/admin/stories
```

### View Modes

**Grid View** (default):
- Beautiful cards
- Visual emphasis
- Good for browsing

**List View**:
- Compact rows
- More information
- Good for scanning

### Search Stories

Type in search box:
- Searches title
- Searches content
- Searches storyteller names
- Real-time results

### Filter by Status

Click status dropdown:
- See count for each status
- Select to filter
- "All Stories" to reset

### Share to ACT Farm

1. Find story card
2. Locate "Share to ACT Farm" toggle
3. Click to enable
4. See "✓ Shared to registry" message

### Un-share from ACT Farm

1. Find shared story (toggle is ON)
2. Click toggle to OFF
3. Story removed from registry

## Troubleshooting

### Toggle Disappears After Click

**Issue**: Card re-renders and loses state

**Fix**: State is now managed at page level, not card level

### Story Missing Storyteller

**Issue**: "Story is missing storyteller/author ownership"

**Fix**: Run `node scripts/data-management/fix-story-ownership.js`

### Share Toggle Disabled

**Issue**: Not logged in as super admin

**Fix**: Verify `isSuperAdmin` is true in auth context

### Slow Search

**Issue**: Searching large dataset

**Optimization**: Search is already debounced 300ms

## Future Enhancements

- [ ] Bulk share operations
- [ ] Advanced filters (date range, cultural sensitivity)
- [ ] Export to CSV/JSON
- [ ] Story analytics dashboard
- [ ] Storyteller filtering
- [ ] Theme-based filtering
- [ ] Save filter presets
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop ordering

## Support

For issues or questions:
- GitHub Issues: [empathy-ledger-v2/issues]
- Documentation: This file
- Design System: `docs/design-component.md`
