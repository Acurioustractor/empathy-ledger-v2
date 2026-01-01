# Smart Gallery System - Quick Reference

**Quick guide for developers implementing galleries across the platform**

---

## Usage Examples

### Storyteller Profile Gallery

```tsx
import { SmartGallery } from '@/components/gallery/SmartGallery'

<SmartGallery
  entityType="storyteller"
  entityId={storytellerId}
  layout="masonry"
  showSacredProtection={true}
  showCaptions={true}
  linkToStories={true}
/>
```

### Organization Event Gallery

```tsx
<SmartGallery
  entityType="organization"
  entityId={orgId}
  layout="hero-grid"
  mediaTypes={['image', 'video']}
  tags={['events', 'community']}
  showDownload={false}
/>
```

### Project Timeline Gallery

```tsx
<SmartGallery
  entityType="project"
  entityId={projectId}
  layout="timeline"
  showStorytellerAvatars={true}
  linkToStorytellers={true}
  dateRange={{ start: projectStart, end: projectEnd }}
/>
```

### Story Inline Gallery

```tsx
<SmartGallery
  entityType="story"
  entityId={storyId}
  layout="inline"
  showCaptions={true}
  showMetadata={false}
  culturalTags={story.cultural_affiliations}
/>
```

### Campaign Featured Gallery

```tsx
<SmartGallery
  entityType="campaign"
  entityId={campaignId}
  layout="carousel"
  showStorytellerAvatars={true}
  linkToStories={true}
  showDownload={true}
/>
```

---

## Layout Options

| Layout | Best For | Responsive |
|--------|----------|------------|
| `grid` | General galleries, even spacing | 1 → 2 → 3 → 4 cols |
| `masonry` | Mixed aspect ratios, Pinterest-style | Yes, staggered |
| `carousel` | Featured content, hero sections | Auto-scrolling |
| `timeline` | Chronological events, project history | Vertical flow |
| `hero-grid` | Emphasize first image, then grid | Large hero + grid |
| `inline` | Story narrative flow, article photos | Centered, vertical |

---

## Avatar Component

### Basic Usage

```tsx
import { Avatar } from '@/components/shared/Avatar'

<Avatar
  entityType="storyteller"
  entityId={storytellerId}
  size="lg"
  fallback="JD" // Initials
/>
```

### Size Options

| Size | Dimensions | Use Case |
|------|------------|----------|
| `xs` | 24px | Network nodes, tiny avatars |
| `sm` | 32px | Comments, notifications |
| `md` | 48px | Story cards, search results |
| `lg` | 64px | Profile cards, member directory |
| `xl` | 96px | Featured storytellers, campaign heroes |
| `2xl` | 128px | Profile headers, dashboard welcome |

### All Display Locations

```tsx
// Storyteller profile page header
<Avatar entityType="storyteller" entityId={id} size="2xl" />

// Story card
<Avatar entityType="storyteller" entityId={story.author_id} size="md" />

// Network graph node
<Avatar entityType="storyteller" entityId={nodeId} size="xs" />

// Organization logo
<Avatar entityType="organization" entityId={orgId} size="lg" />

// Project cover (uses participant avatars as fallback)
<Avatar entityType="project" entityId={projectId} size="xl" />
```

---

## Cultural Protection

### Sacred Content Overlay

Automatically applied when `media.is_sacred = true`:

```tsx
<SmartGallery
  entityType="storyteller"
  entityId={storytellerId}
  showSacredProtection={true} // Default: true
  culturalTags={culturalAffiliations}
/>
```

### Visual Effect

- Blur + ochre gradient overlay
- Shield icon + "Sacred Content" heading
- Cultural protocol description
- "Request Access" button (if applicable)
- "Elder Review Required" badge (if `requires_elder_review = true`)

### Bypass for Authorized Users

```typescript
// Sacred content automatically shows if:
// 1. User is the uploader
// 2. User has elder role
// 3. User has explicit permission in cultural_protocols table
```

---

## Media Upload

### Upload Zone for Dashboard

```tsx
import { MediaUploadZone } from '@/components/gallery/MediaUploadZone'

<MediaUploadZone
  entityType="storyteller"
  entityId={storytellerId}
  allowedTypes={['image', 'video', 'audio']}
  maxSizeMB={50}
  culturalSensitivity={true}
  onUpload={handleUpload}
/>
```

### Cultural Sensitivity Modal

When `culturalSensitivity={true}`, upload shows checklist:

- [ ] Does this contain sacred knowledge?
- [ ] Should this require elder review?
- [ ] Are there cultural protocols to note?
- [ ] Who can view this content?

---

## Gallery Filtering

### Built-in Filters

```tsx
<SmartGallery
  entityType="organization"
  entityId={orgId}
  // Filter by media type
  mediaTypes={['image', 'video']} // Exclude audio

  // Filter by tags
  tags={['events', 'storytellers']}

  // Filter by date range
  dateRange={{
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }}

  // Filter by sacred status
  showSacredOnly={false}
/>
```

### Custom Filter UI

```tsx
import { MediaFilters } from '@/components/gallery/MediaFilters'

<MediaFilters
  onFilterChange={setFilters}
  showTypeFilter={true}
  showTagFilter={true}
  showDateFilter={true}
  showSacredFilter={true}
/>

<SmartGallery
  {...filters}
  entityType="storyteller"
  entityId={storytellerId}
/>
```

---

## Gallery Connections

### Link Photos to Stories

```tsx
<SmartGallery
  entityType="storyteller"
  entityId={storytellerId}
  linkToStories={true} // Shows "Appears in 3 stories" on hover
/>
```

### Link Photos to Storytellers (Face Tagging)

```tsx
<SmartGallery
  entityType="organization"
  entityId={orgId}
  linkToStorytellers={true} // Shows "3 storytellers in this photo"
/>
```

### Link Photos to Projects

```tsx
<SmartGallery
  entityType="storyteller"
  entityId={storytellerId}
  linkToProjects={true} // Shows "From Project: Youth Voices"
/>
```

---

## Lightbox / Fullscreen View

### Automatic Lightbox

Click any photo to open fullscreen:

```tsx
// Lightbox shows:
// - Full resolution image/video
// - Caption
// - Cultural tags
// - Metadata (date, location, photographer)
// - Links (stories, storytellers, projects)
// - Download button (if allowed)
// - Navigation arrows (prev/next)
```

### Manual Lightbox Control

```tsx
import { MediaLightbox } from '@/components/gallery/MediaLightbox'

const [selectedMedia, setSelectedMedia] = useState(null)

<SmartGallery
  onMediaSelect={setSelectedMedia}
  // ... other props
/>

{selectedMedia && (
  <MediaLightbox
    media={selectedMedia}
    onClose={() => setSelectedMedia(null)}
  />
)}
```

---

## Performance Optimization

### Lazy Loading (Automatic)

```tsx
<SmartGallery
  entityType="storyteller"
  entityId={storytellerId}
  // Lazy loading enabled by default
  // Only loads images when scrolled into view
/>
```

### Image Optimization (Automatic)

```typescript
// Images automatically:
// 1. Generate WebP + AVIF formats
// 2. Create thumbnails (300px, 600px, 1200px)
// 3. Serve appropriate size based on viewport
// 4. Use Supabase CDN for fast delivery
```

### Skeleton Loaders

```tsx
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton'

{isLoading ? (
  <GallerySkeleton layout="grid" count={12} />
) : (
  <SmartGallery {...props} />
)}
```

---

## Accessibility

### Keyboard Navigation

- `Tab` - Focus next media item
- `Enter` - Open lightbox
- `Esc` - Close lightbox
- `Arrow Left/Right` - Navigate in lightbox
- `Space` - Play/pause video

### Screen Reader Support

```tsx
// All images have:
// - alt text (from media.alt_text)
// - aria-label for interactive elements
// - role="img" or role="figure"
// - aria-describedby for captions

<img
  src={media.file_url}
  alt={media.alt_text}
  role="img"
  aria-describedby={`caption-${media.id}`}
/>

<figcaption id={`caption-${media.id}`}>
  {media.caption}
</figcaption>
```

---

## Database Queries

### Fetch Media for Entity

```typescript
const { data: media } = await supabase
  .from('media_assets')
  .select('*')
  .eq('entity_type', 'storyteller')
  .eq('entity_id', storytellerId)
  .order('display_order', { ascending: true })
  .order('created_at', { ascending: false })
```

### Fetch with Story Links

```typescript
const { data: media } = await supabase
  .from('media_assets')
  .select(`
    *,
    stories:story_ids (
      id,
      title,
      slug
    )
  `)
  .eq('entity_type', 'storyteller')
  .eq('entity_id', storytellerId)
```

### Fetch with Storyteller Tags

```typescript
const { data: media } = await supabase
  .from('media_assets')
  .select(`
    *,
    storytellers:storyteller_ids (
      id,
      display_name,
      avatar_url
    )
  `)
  .eq('entity_type', 'organization')
  .eq('entity_id', orgId)
```

---

## Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { SmartGallery } from '@/components/gallery/SmartGallery'

test('renders storyteller gallery', async () => {
  render(
    <SmartGallery
      entityType="storyteller"
      entityId="uuid-123"
      layout="grid"
    />
  )

  // Wait for media to load
  await screen.findByTestId('smart-gallery')

  // Check media items render
  const mediaItems = screen.getAllByTestId('media-item')
  expect(mediaItems).toHaveLength(12)
})

test('sacred content shows overlay', async () => {
  render(<SmartGallery entityType="storyteller" entityId="uuid-123" />)

  const sacredMedia = screen.getByTestId('media-item-sacred')
  expect(sacredMedia).toHaveTextContent('Sacred Content')
  expect(sacredMedia).toHaveTextContent('Request Access')
})
```

### Visual Regression Tests

```typescript
import { test, expect } from '@playwright/test'

test('storyteller gallery matches snapshot', async ({ page }) => {
  await page.goto('/storytellers/uuid-123')

  const gallery = page.locator('[data-testid="smart-gallery"]')
  await expect(gallery).toHaveScreenshot('storyteller-gallery.png')
})
```

---

## Common Patterns

### Profile Page Gallery

```tsx
function StorytellerProfile({ storytellerId }) {
  return (
    <div>
      <ProfileHeader storytellerId={storytellerId} />

      <section className="my-12">
        <h2 className="text-2xl font-serif mb-6">My Photos & Videos</h2>
        <SmartGallery
          entityType="storyteller"
          entityId={storytellerId}
          layout="masonry"
          showSacredProtection={true}
          linkToStories={true}
          linkToProjects={true}
        />
      </section>
    </div>
  )
}
```

### Organization Page Gallery

```tsx
function OrganizationProfile({ orgId }) {
  return (
    <div>
      <OrganizationHero orgId={orgId} />

      <section className="my-12">
        <h2 className="text-2xl font-serif mb-6">Our Work</h2>
        <SmartGallery
          entityType="organization"
          entityId={orgId}
          layout="hero-grid"
          mediaTypes={['image', 'video']}
          tags={['events', 'impact']}
          showStorytellerAvatars={true}
        />
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-serif mb-6">Our Storytellers</h2>
        <StorytellerDirectory organizationId={orgId} />
      </section>
    </div>
  )
}
```

### Dashboard Media Manager

```tsx
function StorytellerDashboard({ storytellerId }) {
  return (
    <div>
      <DashboardHeader storytellerId={storytellerId} />

      <section className="my-12">
        <h2 className="text-2xl font-serif mb-6">Manage Media</h2>

        <MediaUploadZone
          entityType="storyteller"
          entityId={storytellerId}
          culturalSensitivity={true}
        />

        <SmartGallery
          entityType="storyteller"
          entityId={storytellerId}
          layout="grid"
          allowDelete={true}
          showMetadata={true}
          onMediaSelect={handleEdit}
        />
      </section>
    </div>
  )
}
```

---

## Migration from Old Gallery

### Before (Custom Gallery)

```tsx
// Old code - custom implementation
function StorytellerGallery({ storytellerId }) {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('storyteller_id', storytellerId)
      setPhotos(data)
    }
    fetchPhotos()
  }, [storytellerId])

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <img key={photo.id} src={photo.url} alt={photo.caption} />
      ))}
    </div>
  )
}
```

### After (SmartGallery)

```tsx
// New code - SmartGallery
import { SmartGallery } from '@/components/gallery/SmartGallery'

function StorytellerGallery({ storytellerId }) {
  return (
    <SmartGallery
      entityType="storyteller"
      entityId={storytellerId}
      layout="grid"
      showCaptions={true}
    />
  )
}
```

**Benefits**:
- ✅ Automatic lazy loading
- ✅ Sacred content protection
- ✅ Responsive layouts
- ✅ Lightbox included
- ✅ Image optimization
- ✅ Accessibility built-in
- ✅ 90% less code

---

## Troubleshooting

### Images Not Loading

```typescript
// Check:
1. media_assets.file_url is valid Supabase storage URL
2. Storage bucket is public or has correct RLS policies
3. entity_type and entity_id match correctly
4. No CORS issues (check browser console)
```

### Sacred Content Not Showing Overlay

```typescript
// Check:
1. media_assets.is_sacred = true
2. showSacredProtection={true} prop is set
3. User doesn't have bypass permission
```

### Avatar Fallback Not Working

```typescript
// Check fallback chain:
1. profiles.avatar_url exists
2. media_assets has is_profile_image=true
3. Fallback initials are provided
4. Cultural color gradient is applied
```

### Gallery Performance Issues

```typescript
// Optimize:
1. Enable lazy loading (default)
2. Limit initial query to 50 items
3. Use pagination for large galleries
4. Generate thumbnails (not full-size images)
5. Use WebP format
```

---

**End of Quick Reference**

For complete implementation details, see [COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md](./COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md)
