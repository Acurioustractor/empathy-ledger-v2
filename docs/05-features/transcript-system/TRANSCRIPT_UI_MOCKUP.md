# Transcript List UI - With Themes & Quotes

## Current UI (What you see now)
```
┌───────────────────────────────────────────────────┐
│ Kristy Bloomfield - Interview Transcript          │
│ pending  │ 0:00 │ 12528 words │ 04/02/2025       │
│ [View] [Edit] [Create Story] [Delete]            │
└───────────────────────────────────────────────────┘
```

## Proposed UI (With AI Analysis)
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Kristy Bloomfield - Interview Transcript           [▼]  │
│                                                              │
│ pending  │ 0:00 │ 12,528 words │ 04/02/2025                │
│                                                              │
│ 🏷️ Themes:                                                  │
│ [Cultural Preservation] [Sustainable Tourism]               │
│ [Indigenous Technology] [Community Leadership] +2           │
│                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                              │
│ ▼ Summary & Key Quotes                                      │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📝 AI-Generated Summary:                              │  │
│ │                                                        │  │
│ │ Kristy Bloomfield discusses her work at Napa          │  │
│ │ Homestead, focusing on sustainable tourism and        │  │
│ │ cultural preservation. She explores innovative ways   │  │
│ │ to integrate technology with Indigenous storytelling, │  │
│ │ including underwater drones for capturing cultural    │  │
│ │ narratives. Her collaboration with Minga Minga        │  │
│ │ Rangers demonstrates her commitment to community-led  │  │
│ │ knowledge sharing and honoring traditional land       │  │
│ │ management practices...                                │  │
│ │                                                        │  │
│ │ 💬 Key Quotes (3):                                     │  │
│ │                                                        │  │
│ │ 1. "We're blending historical insights with           │  │
│ │     environmental stewardship - it's about creating   │  │
│ │     spaces where culture and nature intersect."       │  │
│ │     Theme: Sustainable Tourism │ Impact: ★★★★☆       │  │
│ │                                                        │  │
│ │ 2. "Technology doesn't have to compete with           │  │
│ │     tradition. When used respectfully, it can amplify │  │
│ │     Indigenous voices and preserve knowledge for      │  │
│ │     future generations."                               │  │
│ │     Theme: Indigenous Technology │ Impact: ★★★★★     │  │
│ │                                                        │  │
│ │ 3. "The Minga Minga Rangers partnership taught me     │  │
│ │     that real cultural preservation happens through   │  │
│ │     community relationships, not institutional        │  │
│ │     programs."                                         │  │
│ │     Theme: Community Leadership │ Impact: ★★★★☆      │  │
│ │                                                        │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                              │
│ [View Full] [Edit] [Create Story] [Analyze] [Delete]      │
└─────────────────────────────────────────────────────────────┘
```

## Benefits of This Design

### 1. **At-a-Glance Context**
- Theme badges immediately show what the transcript is about
- No need to open transcript to understand topics covered
- Easy to see thematic connections across multiple transcripts

### 2. **Quick Quote Access**
- Key insights visible without reading full transcript
- Impact scores help identify most powerful quotes
- Themes linked to quotes for cross-referencing

### 3. **Better Content Organization**
- Transcripts can be filtered by theme
- Similar content can be grouped together
- Storytellers can see their thematic patterns

### 4. **Workflow Integration**
- "Create Story" button can pre-populate with relevant quotes
- Themes can be inherited by created stories
- Projects can aggregate themes from all transcripts

### 5. **AI Analysis Visibility**
- Clear indication when AI analysis is complete
- "Analyze" button to trigger processing if needed
- Processing status badge (pending/processing/completed)

---

## Theme Badge Styles

```tsx
// Cultural themes - Purple
<Badge className="bg-purple-100 text-purple-800 border-purple-300">
  <Crown className="w-3 h-3 mr-1" />
  Cultural Preservation
</Badge>

// Environmental themes - Green
<Badge className="bg-green-100 text-green-800 border-green-300">
  <Leaf className="w-3 h-3 mr-1" />
  Sustainable Tourism
</Badge>

// Technology themes - Blue
<Badge className="bg-blue-100 text-blue-800 border-blue-300">
  <Cpu className="w-3 h-3 mr-1" />
  Indigenous Technology
</Badge>

// Community themes - Amber
<Badge className="bg-amber-100 text-amber-800 border-amber-300">
  <Users className="w-3 h-3 mr-1" />
  Community Leadership
</Badge>

// Generic themes - Grey
<Badge className="bg-grey-100 text-grey-800 border-grey-300">
  <Tag className="w-3 h-3 mr-1" />
  Theme Name
</Badge>
```

---

## Quote Display Component

```tsx
<div className="space-y-4">
  {quotes.map((quote, index) => (
    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
      <blockquote className="text-grey-700 italic">
        "{quote.text}"
      </blockquote>
      <div className="flex items-center gap-3 mt-2 text-sm">
        <Badge variant="outline">{quote.theme}</Badge>
        <div className="flex items-center gap-1 text-amber-600">
          <Sparkles className="w-3 h-3" />
          Impact: {quote.impactScore}/5
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## Collapsible Section

```tsx
const [showSummary, setShowSummary] = useState(false)

<button
  onClick={() => setShowSummary(!showSummary)}
  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
>
  {showSummary ? <ChevronUp /> : <ChevronDown />}
  Summary & Key Quotes
</button>

{showSummary && (
  <div className="mt-4 p-4 bg-grey-50 rounded-lg">
    {/* Summary and quotes content */}
  </div>
)}
```

---

## Interactive Features

### 1. **Click Theme Badge → Filter**
```tsx
<Badge
  onClick={() => router.push(`/transcripts?theme=${theme}`)}
  className="cursor-pointer hover:shadow-md transition-shadow"
>
  {theme}
</Badge>
```

### 2. **Click Quote → Copy to Clipboard**
```tsx
<button
  onClick={() => {
    navigator.clipboard.writeText(quote.text)
    toast.success('Quote copied!')
  }}
  className="text-grey-500 hover:text-grey-700"
>
  <Copy className="w-4 h-4" />
</button>
```

### 3. **Expand/Collapse All**
```tsx
<button onClick={() => setExpandAll(!expandAll)}>
  {expandAll ? 'Collapse All' : 'Expand All'}
</button>
```

---

## Next Steps

1. ✅ Create mock data for Kristy's transcript
2. ✅ Build enhanced UI component
3. ✅ Add theme badges
4. ✅ Add collapsible summary section
5. ⏳ Set up real AI analysis endpoint
6. ⏳ Trigger analysis on Kristy's transcript
7. ⏳ Replace mock data with real data
