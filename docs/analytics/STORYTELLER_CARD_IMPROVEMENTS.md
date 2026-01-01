# Storyteller Card Improvements

## Current Issues
1. Missing project context
2. Unclear numeric displays
3. No location consistency
4. AI themes not properly displayed
5. No cultural markers visible

## Proposed Enhanced Card Layout

### Header Section
- **Name** (prominent, consistent)
- **Location** (always show if available)
- **Elder/Featured badges** (consistent positioning)

### Context Section
- **Primary Project Affiliation** (e.g., "Deadly Hearts Trek", "Snow Foundation")
- **Cultural Background** (if available)
- **Role/Specialty** (if available)

### Content Metrics (Clear Labels)
- **Transcripts: X** (instead of just "4")
- **Stories: X** (instead of just "0")
- **Videos: X** (clear count)
- **Themes Analyzed: X** (from AI analysis)

### AI Insights Section
- **Top 3 Story Themes** (from AI analysis)
  - Theme name + count (e.g., "Community: 3", "Heritage: 2")
- **Cultural Markers** (if identified by AI)

### Quick Stats Bar
- **Years Active** (if available)
- **Last Activity** (when last content was added)
- **Engagement Level** (based on content frequency)

## Data Requirements

### From API Enhancement Needed:
1. **Project Affiliations** - which projects storyteller contributes to
2. **Location Standardization** - consistent location field
3. **AI Theme Integration** - pull themes from transcript analysis
4. **Content Counts** - clear separation of different content types
5. **Cultural Markers** - from AI analysis of their stories

### Example Enhanced Card Data Structure:
```typescript
interface EnhancedStorytellerCard {
  // Basic Info
  id: string
  name: string
  location: string
  avatarUrl?: string

  // Context
  primaryProject?: string
  culturalBackground?: string
  role?: string
  isElder: boolean
  isFeatured: boolean

  // Content Metrics
  contentStats: {
    transcripts: number
    stories: number
    videos: number
    analyzedContent: number
  }

  // AI Insights
  aiInsights?: {
    topThemes: Array<{ theme: string; count: number }>
    culturalMarkers: string[]
    lastAnalyzed?: string
  }

  // Engagement
  lastActive?: string
  yearsActive?: number
}
```

## Implementation Priority

### Phase 1: Fix Current Display
1. Add clear labels to all numbers
2. Standardize location display
3. Show project affiliations
4. Consistent theme display

### Phase 2: Enhanced Insights
1. Integrate AI analysis themes
2. Add cultural markers
3. Show content timeline
4. Improve visual hierarchy

### Phase 3: Advanced Features
1. Interactive theme exploration
2. Project-based filtering
3. Cultural background insights
4. Engagement analytics