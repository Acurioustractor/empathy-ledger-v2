# Themes and Quotes: AI Analysis Structure

## Overview
The platform uses AI analysis to extract themes, quotes, and summaries from transcripts and stories. This document explains how these are stored and used across the site.

---

## Database Schema

### **transcripts** table
Located in `transcripts` table with these AI-related fields:

```typescript
{
  // Core content
  title: string
  content: string  // Full transcript text
  word_count: number

  // AI Analysis Fields
  ai_summary: string | null           // AI-generated summary
  ai_processing_status: string | null // 'pending' | 'processing' | 'completed' | 'failed'
  themes: string[] | null             // Extracted themes
  key_quotes: string[] | null         // Extracted key quotes as array
  tags: string[] | null               // Content tags

  // Cultural context
  cultural_context: Json | null
  cultural_sensitivity_level: string | null

  // Metadata
  metadata: Json | null
  processing_notes: string | null
  status: string | null
}
```

### **extracted_quotes** table
Separate table for rich quote management:

```typescript
{
  id: string
  quote_text: string                 // The actual quote
  context: string | null             // Surrounding context

  // Source linking
  source_id: string | null           // transcript_id or story_id
  source_type: string | null         // 'transcript' | 'story'

  // Attribution
  author_id: string | null           // profile_id
  author_name: string | null

  // Organization
  themes: string[] | null            // Associated themes
  sentiment: string | null           // 'positive' | 'neutral' | 'negative'
  impact_score: number | null        // 0-100 impact rating

  // Relationships
  organization_id: string | null
  project_id: string | null

  // Search
  search_vector: unknown | null      // Full-text search
}
```

### **stories** table
Similar AI analysis fields:

```typescript
{
  title: string
  content: string

  // AI Analysis
  ai_generated_summary: string | null
  ai_processed: boolean | null
  ai_themes: string[] | null
  generated_themes: string[] | null
  cultural_themes: string[] | null

  // Content organization
  tags: string[] | null
  excerpt: string | null
}
```

---

## How AI Analysis Works

### 1. **Transcript Processing Pipeline**

```
1. Upload Transcript
   ↓
2. Set ai_processing_status = 'processing'
   ↓
3. AI Analysis:
   - Extract key themes
   - Identify important quotes
   - Generate summary
   - Analyze sentiment
   - Calculate impact scores
   ↓
4. Save to Database:
   - themes[] → transcript.themes
   - quotes[] → transcript.key_quotes
   - summary → transcript.ai_summary
   - Individual quotes → extracted_quotes table
   ↓
5. Set ai_processing_status = 'completed'
```

### 2. **Quote Extraction Process**

When a transcript is analyzed:
1. AI identifies 3-5 key quotes
2. Quotes saved as array in `transcript.key_quotes`
3. Rich quote records created in `extracted_quotes`:
   - Links to source transcript
   - Associates with themes
   - Adds context
   - Calculates impact score
   - Enables cross-platform searching

### 3. **Theme Generation**

Themes can come from multiple sources:
- **AI-generated**: Auto-extracted from content
- **Cultural themes**: Manually tagged cultural concepts
- **Project themes**: Associated with specific projects
- **Organization themes**: Org-wide thematic categories

---

## Usage Across the Platform

### **Transcript List View** (Current location)
Should display:
- ✅ Title
- ✅ Word count
- ✅ Status badge
- ❌ **Missing**: Theme badges
- ❌ **Missing**: Summary preview (collapsed)
- ❌ **Missing**: Key quotes (expandable)

### **Transcript Detail Page**
Should display:
- Full content
- AI-generated summary
- Theme badges (clickable to see related content)
- Key quotes section
- Related stories with similar themes

### **Storyteller Profile**
Should show:
- Common themes across all their transcripts
- Most impactful quotes
- Theme cloud visualization

### **Organization Dashboard**
Should aggregate:
- Top themes across all transcripts
- Most shared quotes
- Theme trends over time

### **Project Pages**
Should display:
- Project-specific themes
- Quotes relevant to project goals
- Cross-storyteller theme analysis

### **Search & Discovery**
Quotes in `extracted_quotes` have `search_vector` for:
- Full-text search across quotes
- Theme-based filtering
- Author filtering
- Impact-based sorting

---

## Proposed UI Improvements

### **1. Enhanced Transcript List Card**

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Kristy Bloomfield - Interview Transcript       ⌄ │
│                                                         │
│ pending   0:00   12,528 words   04/02/2025           │
│                                                         │
│ [Theme Badge] [Theme Badge] [Theme Badge] +2 more    │
│                                                         │
│ ▼ Summary & Quotes                                     │
│ ┌───────────────────────────────────────────────────┐ │
│ │ 📝 AI Summary:                                     │ │
│ │ Kristy discusses sustainable tourism and cultural  │ │
│ │ preservation at Napa Homestead...                  │ │
│ │                                                     │ │
│ │ 💬 Key Quotes (3):                                 │ │
│ │ • "We're blending history with environmental..."   │ │
│ │ • "Technology can serve cultural preservation..."  │ │
│ │ • "Community connections are everything..."        │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│ [View] [Edit] [Create Story] [Delete]                │
└─────────────────────────────────────────────────────────┘
```

### **2. Theme Badge Component**

```tsx
<Badge variant="secondary" className="bg-purple-100 text-purple-700">
  <Sparkles className="w-3 h-3 mr-1" />
  Community Leadership
</Badge>
```

### **3. Expandable Summary Section**

- Collapsed by default
- Click to expand/collapse
- Shows AI summary + key quotes
- Quick context without opening full transcript

---

## Implementation Priority

### **Phase 1: Display existing data** ✅ DO THIS FIRST
1. Fetch themes + quotes from existing transcripts
2. Add theme badges to transcript cards
3. Add expandable summary/quotes section
4. Style with existing design system

### **Phase 2: AI Processing (if not done)**
1. Check if Kristy's transcript has been analyzed
2. If not, trigger AI analysis
3. Save themes/quotes to database
4. Update UI to reflect analysis

### **Phase 3: Cross-platform integration**
1. Link themes across transcripts/stories
2. Enable theme-based navigation
3. Build quote browsing interface
4. Add theme analytics to dashboards

---

## API Endpoints Needed

### **Get transcript with themes/quotes**
```
GET /api/transcripts/:id
Returns: {
  transcript: {
    ...
    ai_summary,
    themes[],
    key_quotes[]
  }
}
```

### **Get quotes for transcript**
```
GET /api/quotes?source_id=:transcript_id
Returns: {
  quotes: [
    { quote_text, context, themes, impact_score }
  ]
}
```

### **Trigger AI analysis**
```
POST /api/transcripts/:id/analyze
Triggers: AI processing pipeline
Returns: { job_id, status }
```

---

## Next Steps

1. ✅ **Check Kristy's transcript** - Does it have themes/quotes already?
2. ✅ **Update transcript list UI** - Add theme badges and expandable summary
3. ⏳ **Trigger AI analysis** - If data missing
4. ⏳ **Build quote browsing** - Dedicated quotes page
5. ⏳ **Cross-platform linking** - Connect themes across content

---

## Questions to Answer

1. **Has Kristy's transcript been AI-analyzed?**
   - Check `ai_processing_status`
   - Check if `themes[]` and `key_quotes[]` are populated

2. **Is the AI pipeline already built?**
   - Look for `/api/transcripts/:id/analyze` endpoint
   - Check `src/lib/workflows/transcript-processing-pipeline.ts`

3. **How should themes be clickable?**
   - Link to search results for that theme?
   - Filter page showing all content with theme?
   - Dedicated theme detail page?

Let me check Kristy's transcript to see what data we already have!
