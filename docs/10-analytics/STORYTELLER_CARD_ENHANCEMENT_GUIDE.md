# Enhanced Storyteller Cards - Implementation Guide

## Overview

The Enhanced Storyteller Card system integrates organization/project tagging, enhanced location context, and AI-driven profile development into a unified, powerful component for displaying storyteller information.

## Key Features

### 🏢 Organization & Project Tagging
- **Color-coded affiliations** by type (tribal, nonprofit, community, government)
- **Status indicators** (active, completed, planning, paused)
- **Role details** displayed in expanded view
- **Smart overflow** with "show more" functionality

### 🗺️ Enhanced Location Context
- **Traditional territories** alongside modern locations
- **Geographic scope** indicators (local, regional, national, international)
- **Cultural geography** connections
- **Respectful territorial** acknowledgment

### 🤖 AI-Driven Profile Enhancement
- **Profile completeness** scoring
- **Story theme extraction** from content analysis
- **Cultural marker identification**
- **Smart tag suggestions** with confidence scores
- **Evidence-based recommendations**

## Components

### 1. UnifiedStorytellerCard
**Location**: `src/components/storyteller/unified-storyteller-card.tsx`

Main component that renders individual storyteller cards with all enhanced features.

```tsx
import { UnifiedStorytellerCard } from '@/components/storyteller/unified-storyteller-card'

<UnifiedStorytellerCard
  storyteller={storytellerData}
  variant="default" // 'default' | 'featured' | 'compact' | 'detailed'
  showAIInsights={true}
  showActions={true}
  onApplyAISuggestion={handleAISuggestion}
/>
```

**Props:**
- `storyteller`: Enhanced storyteller profile data
- `variant`: Card display variant
- `showAIInsights`: Toggle AI insights section
- `showActions`: Show action buttons
- `onApplyAISuggestion`: Callback for AI suggestion actions

### 2. StorytellerCardCollection
**Location**: `src/components/storyteller/storyteller-card-collection.tsx`

Collection component with filtering, sorting, and search capabilities.

```tsx
import { StorytellerCardCollection } from '@/components/storyteller/storyteller-card-collection'

<StorytellerCardCollection
  storytellers={storytellersData}
  variant="default"
  showAIInsights={true}
  callbacks={{
    onApplyAISuggestion: handleAISuggestion,
    onUpdateProfile: handleProfileUpdate
  }}
/>
```

**Features:**
- Search and filter functionality
- Multiple view modes (grid/list)
- Sorting options
- Pagination support
- Loading and error states

### 3. StorytellerCardDemo
**Location**: `src/components/storyteller/storyteller-card-demo.tsx`

Demo component showcasing all features with sample data.

## Data Transformation

### StorytellerCardAdapter
**Location**: `src/lib/adapters/storyteller-card-adapter.ts`

Transforms existing storyteller data into enhanced format.

```tsx
import { StorytellerCardAdapter } from '@/lib/adapters/storyteller-card-adapter'

// Transform single storyteller
const enhanced = await StorytellerCardAdapter.transformToEnhancedProfile(
  existingData,
  {
    includeAIInsights: true,
    includeLocationEnhancement: true,
    generateMissingData: false
  }
)

// Transform batch
const enhancedBatch = await StorytellerCardAdapter.transformBatch(
  storytellersArray,
  options
)
```

## Type Definitions

### Core Types
**Location**: `src/types/storyteller-card.ts`

```tsx
import type {
  EnhancedStorytellerProfile,
  OrganizationAffiliation,
  ProjectAffiliation,
  LocationContext,
  AIProfileInsights,
  AISuggestionAction
} from '@/types/storyteller-card'
```

## Migration Guide

### From Existing Components

#### 1. Replace Basic StorytellerCard
```tsx
// Before
import { StorytellerCard } from '@/components/storyteller/storyteller-card'

<StorytellerCard
  storyteller={storyteller}
  variant="default"
  showStories={true}
  showActions={true}
/>

// After
import { UnifiedStorytellerCard } from '@/components/storyteller/unified-storyteller-card'
import { StorytellerCardAdapter } from '@/lib/adapters/storyteller-card-adapter'

const enhancedStoryteller = StorytellerCardAdapter.transformLegacyCardData(storyteller)

<UnifiedStorytellerCard
  storyteller={enhancedStoryteller}
  variant="default"
  showAIInsights={true}
  showActions={true}
/>
```

#### 2. Replace Enhanced StorytellerCard
```tsx
// Before
import { EnhancedStorytellerCard } from '@/components/storyteller/enhanced-storyteller-card'

// After
import { UnifiedStorytellerCard } from '@/components/storyteller/unified-storyteller-card'
// Data should already be compatible or need minimal transformation
```

#### 3. Replace Profile Card
```tsx
// Before
import { StorytellerProfileCard } from '@/components/ui/storyteller-profile-card'

// After
import { UnifiedStorytellerCard } from '@/components/storyteller/unified-storyteller-card'
// Use 'compact' variant for similar display
```

### Data Structure Updates

#### Organization Data
```tsx
// Before
organizations: Array<{
  id: string
  name: string
  role: string
}>

// After
organizations: Array<{
  id: string
  name: string
  role: string
  status?: 'active' | 'completed' | 'paused'
  type?: 'nonprofit' | 'community' | 'government' | 'tribal'
  start_date?: string
  end_date?: string
}>
```

#### Location Data
```tsx
// Before
location?: string

// After
location_context: {
  modern_location?: string
  traditional_territory?: string
  geographic_scope?: 'local' | 'regional' | 'national' | 'international'
  cultural_geography?: string[]
}
```

#### AI Insights
```tsx
// New addition
ai_insights?: {
  profile_completeness: number
  top_themes: Array<{
    theme: string
    count: number
    confidence: number
  }>
  cultural_markers?: string[]
  suggested_tags: Array<{
    category: string
    value: string
    confidence: number
    evidence_count: number
  }>
}
```

## Implementation Steps

### 1. Install Enhanced Components
```bash
# Copy new components to your project
cp src/components/storyteller/unified-storyteller-card.tsx your-project/src/components/storyteller/
cp src/components/storyteller/storyteller-card-collection.tsx your-project/src/components/storyteller/
cp src/lib/adapters/storyteller-card-adapter.ts your-project/src/lib/adapters/
cp src/types/storyteller-card.ts your-project/src/types/
```

### 2. Update Data Sources
```tsx
// Add AI insights endpoint
export async function getStorytellerAIInsights(storytellerId: string) {
  // Implement AI analysis integration
  const analysis = await ProfileEnhancementAnalyzer.analyzeProfile(...)
  return transformToAIInsights(analysis)
}

// Enhance organization data
export async function getStorytellerOrganizations(storytellerId: string) {
  // Add status and type information
  return organizations.map(org => ({
    ...org,
    status: inferStatus(org),
    type: inferType(org.name)
  }))
}
```

### 3. Update API Endpoints
```tsx
// Add AI insights to storyteller API response
app.get('/api/storytellers/:id', async (req, res) => {
  const storyteller = await getStoryteller(req.params.id)
  const aiInsights = await getStorytellerAIInsights(req.params.id)

  res.json({
    ...storyteller,
    ai_insights: aiInsights,
    location_context: enhanceLocationContext(storyteller.location),
    organizations: await enhanceOrganizations(storyteller.organizations),
    projects: await enhanceProjects(storyteller.projects)
  })
})
```

### 4. Implement AI Suggestion Handling
```tsx
const handleAISuggestion = async (action: AISuggestionAction) => {
  switch (action.type) {
    case 'apply':
      await updateStorytellerProfile(storytellerId, {
        [action.suggestion.category]: [
          ...existingValues,
          action.suggestion.value
        ]
      })
      break

    case 'reject':
      await markAISuggestionRejected(
        storytellerId,
        action.suggestion
      )
      break

    case 'modify':
      await updateStorytellerProfile(storytellerId, {
        [action.suggestion.category]: [
          ...existingValues,
          action.modified_value
        ]
      })
      break
  }

  // Refresh data
  await refreshStorytellerData()
}
```

### 5. Update Pages/Views
```tsx
// storytellers/page.tsx
import { StorytellerCardCollection } from '@/components/storyteller/storyteller-card-collection'

export default function StorytellersPage() {
  const [storytellers, setStorytellers] = useState([])

  return (
    <StorytellerCardCollection
      storytellers={storytellers}
      variant="default"
      callbacks={{
        onApplyAISuggestion: handleAISuggestion,
        onUpdateProfile: handleProfileUpdate
      }}
    />
  )
}
```

## Configuration Options

### Variant Types
- **`default`**: Standard card with all features
- **`featured`**: Highlighted card for featured storytellers
- **`compact`**: Minimal card for list views
- **`detailed`**: Expanded card with all information

### Display Options
```tsx
const displayOptions = {
  showActions: true,
  showStatusBadges: true,
  showLocationContext: true,
  showCulturalMarkers: true,
  showLastActive: true,
  enableHoverEffects: true,
  enableExpandCollapse: true,
  compactMode: false
}
```

### Filter Options
```tsx
const filterOptions = {
  status: ['active'],
  elder_status: true,
  featured: undefined,
  has_ai_insights: true,
  profile_completeness_min: 60,
  organization_types: ['tribal', 'nonprofit'],
  project_types: ['cultural', 'educational'],
  geographic_scope: ['regional', 'national'],
  story_count_min: 5,
  years_experience_min: 10,
  last_active_within_days: 30
}
```

## Best Practices

### 1. Data Loading
- Use `StorytellerCardAdapter.transformBatch()` for efficient data transformation
- Implement loading states with skeleton components
- Handle errors gracefully with fallback data

### 2. AI Insights
- Only show AI insights when data is available and fresh
- Provide clear confidence indicators
- Allow users to accept/reject suggestions
- Track suggestion acceptance rates

### 3. Performance
- Use React.memo for card components
- Implement virtual scrolling for large collections
- Lazy load AI insights data
- Cache transformed data appropriately

### 4. Accessibility
- Ensure all interactive elements have proper ARIA labels
- Provide keyboard navigation support
- Use semantic HTML structure
- Include alt text for avatars

### 5. Cultural Sensitivity
- Respect traditional territory acknowledgments
- Use appropriate cultural terminology
- Allow storytellers to control their own data
- Implement proper consent workflows

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react'
import { UnifiedStorytellerCard } from '../unified-storyteller-card'

test('displays storyteller information correctly', () => {
  const storyteller = createMockStoryteller()
  render(<UnifiedStorytellerCard storyteller={storyteller} />)

  expect(screen.getByText(storyteller.display_name)).toBeInTheDocument()
  expect(screen.getByText(storyteller.bio)).toBeInTheDocument()
})
```

### Integration Tests
```tsx
test('applies AI suggestions correctly', async () => {
  const onApplyAISuggestion = jest.fn()
  render(
    <UnifiedStorytellerCard
      storyteller={storytellerWithAIInsights}
      onApplyAISuggestion={onApplyAISuggestion}
    />
  )

  await user.click(screen.getByText('Apply Suggestion'))
  expect(onApplyAISuggestion).toHaveBeenCalledWith(expectedAction)
})
```

## Troubleshooting

### Common Issues

1. **Data transformation errors**
   - Check that all required fields are present
   - Use fallback data for missing information
   - Validate data structure before transformation

2. **AI insights not loading**
   - Verify AI service endpoints are accessible
   - Check for proper authentication
   - Implement retry logic for failed requests

3. **Performance issues**
   - Profile large data sets
   - Implement pagination for collections
   - Use React DevTools to identify re-renders

4. **Styling conflicts**
   - Check Tailwind CSS configuration
   - Ensure custom styles don't conflict
   - Use CSS-in-JS for dynamic styling

## Future Enhancements

- **Real-time updates** via WebSocket connections
- **Advanced AI features** like story recommendation
- **Collaborative filtering** for suggestions
- **Mobile-optimized** layouts
- **Offline support** with service workers
- **Export functionality** for storyteller data

## Support

For implementation support or questions:
- Review the demo component for examples
- Check type definitions for data structure requirements
- Use the adapter for seamless data transformation
- Refer to existing component patterns in the codebase