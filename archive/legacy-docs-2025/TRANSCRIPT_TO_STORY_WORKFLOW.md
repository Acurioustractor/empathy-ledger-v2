# Transcript → Story Workflow Guide

## 🎯 Complete Content Creation Pipeline

This guide explains how transcripts flow through AI analysis to enrich profiles and create shareable stories.

---

## 📝 Step 1: Add New Transcripts

### How to Add Transcripts to Kristy's Profile

**Option A: Via UI (Current)**
1. Go to: http://localhost:3030/admin/storytellers/[kristy-id]/edit
2. Click **"Transcripts"** tab
3. Click **"Add New Transcript"** button
4. Fill in:
   - **Title**: "Kristy Bloomfield - [Topic]"
   - **Transcript Content**: Paste the raw transcript text
   - **Duration**: Approximate length in seconds
   - **Status**: Set to "completed"
5. Click **Save**

**Option B: Via API Upload (Bulk)**
```bash
curl -X POST http://localhost:3030/api/transcripts \
  -H "Content-Type: application/json" \
  -d '{
    "storyteller_id": "b59a1f4c-94fd-4805-a2c5-cac0922133e0",
    "title": "Kristy Bloomfield - Community Leadership",
    "transcript_content": "[Your transcript text here...]",
    "status": "completed",
    "word_count": 5000
  }'
```

---

## 🤖 Step 2: AI Analysis (Automatic)

### What Happens When You Click "Analyze"

1. **Transcript queued** for processing (status: "queued")
2. **Inngest job starts** in background
3. **Hybrid Analysis runs:**
   - **Phase 1**: Pattern matching (100+ Indigenous impact indicators)
     - Cultural protocols
     - Knowledge transmission markers
     - Community leadership signals
     - Relationship building patterns
   - **Phase 2**: GPT-4o-mini deep analysis
     - Extracts 5-8 themes
     - Identifies 5 impactful quotes with context
     - Generates 300-500 word summary
     - Assesses cultural sensitivity
     - Flags if elder review needed
4. **Results stored:**
   - `themes` → array of theme strings
   - `key_quotes` → array of quote texts
   - `ai_summary` → rich summary
   - `ai_processing_status` → "completed"
5. **Profile updated:**
   - `total_impact_insights` incremented
   - Themes aggregated across all transcripts
   - Profile bio can be enhanced with insights

**Processing Time:** 15-30 seconds per transcript
**Cost:** ~$0.01 per transcript (GPT-4o-mini)

---

## 👤 Step 3: Profile Enrichment

### How Transcripts Build Kristy's Profile

**Automatic Profile Updates:**

1. **Themes Aggregation**
   - Each transcript's themes feed into profile's `narrative_themes`
   - Most common themes bubble up to profile summary
   - Example: "Cultural connection", "Youth empowerment", "Two worlds navigation"

2. **Impact Metrics**
   - `total_impact_insights`: Count of all analyzed transcripts
   - `primary_impact_type`: Most frequent theme across transcripts
   - `impact_confidence_score`: Average quality of insights

3. **Bio Enhancement** (Manual step)
   - Review AI summaries from all transcripts
   - Edit Kristy's profile bio to incorporate key themes
   - Example bio enhancement:
     ```
     Kristy Bloomfield is a pioneering advocate for Indigenous youth,
     bridging cultural and Western worlds through legal expertise and
     community leadership. With deep roots in Eastern Arrernte country,
     she champions intergenerational knowledge transmission and systemic
     change for Aboriginal communities.
     ```

4. **Expertise Areas**
   - Automatically tagged based on themes:
     - Legal advocacy
     - Youth mentorship
     - Cultural preservation
     - Community leadership
     - System navigation

---

## 📖 Step 4: Story Creation

### Creating Stories from Analyzed Transcripts

**Method 1: Quick Story from Transcript**

1. Go to transcript card → Click **"Create Story"** button
2. Story pre-populates with:
   - **Title**: From transcript title
   - **Summary**: AI-generated summary
   - **Key Quotes**: Auto-selected quotes
   - **Themes**: Tagged automatically
3. Enhance the story:
   - Add **intro paragraph** (human-written context)
   - Select **best quotes** (from AI suggestions)
   - Add **storyteller reflection** (if available)
   - Set **cultural sensitivity level**
   - Choose **privacy level** (public/community/private)

**Method 2: Curated Story (Multiple Transcripts)**

1. Go to: http://localhost:3030/stories/create
2. Select **Storyteller**: Kristy Bloomfield
3. Choose **multiple transcripts** as sources
4. Merge insights:
   - Combine themes from 2-3 related transcripts
   - Pull best quotes from each
   - Create narrative arc across multiple conversations
5. Example: "Kristy's Journey: Legal Advocacy to Community Leadership"
   - Transcript 1: Early legal career
   - Transcript 2: Working with youth
   - Transcript 3: Vision for future

---

## 🎨 Step 5: Media Enhancement

### Adding Photos & Videos to Stories

**Photo Upload:**
```
Story Editor → Media Section → Upload Photo
- Accept: JPG, PNG, WebP
- Auto-resize: thumbnail, medium, large
- Alt text: Required for accessibility
- Caption: Optional context
```

**Video Embed:**
```
Story Editor → Video Section → Paste URL
- YouTube: Auto-embed
- Vimeo: Auto-embed
- Custom: iframe code
```

**Gallery Creation:**
1. Create gallery: http://localhost:3030/galleries/create
2. Upload multiple photos from event/interview
3. Link gallery to story
4. Auto-generates photo carousel

**Example Story Media Layout:**
```
Hero Image: Kristy portrait photo
Section 1: Quote + landscape photo
Section 2: Community work photos (3-image grid)
Section 3: Embedded video interview
Footer: Call-to-action with contact info
```

---

## 📱 Step 6: Shareable Content Creation

### Auto-Generated Content Types

**A. Blog Posts**
- **URL**: `/stories/[story-id]`
- **Auto-generated:**
  - Open Graph image (story hero)
  - SEO meta description (from summary)
  - Related stories widget
  - Share buttons (Twitter, Facebook, LinkedIn)

**B. Social Media Cards**
```
Story → Share → Generate Cards:
- Instagram: 1080x1080 quote card
- Twitter: 1200x675 story preview
- LinkedIn: Article format with bio
- Facebook: Link preview with photo
```

**C. Email Newsletter Content**
```
Story → Export → Email Template:
- Subject: Auto-generated from title
- Preview text: First sentence
- Body: Summary + photo + CTA
- Footer: Profile link + unsubscribe
```

**D. PDF Download**
```
Story → Export → PDF:
- Formatted report with photos
- Quote callouts
- Storyteller bio sidebar
- QR code to online version
```

---

## 🚀 Complete Workflow Example

### Creating "Kristy's Story: Bridging Two Worlds"

**Week 1: Collection**
1. Record 3 interviews with Kristy:
   - Session 1: Cultural heritage & family (45 min)
   - Session 2: Legal career & advocacy (60 min)
   - Session 3: Youth work & future vision (50 min)

2. Transcribe all 3 (using Rev.com, Otter.ai, or manual)

3. Upload to platform:
   ```bash
   for each transcript:
     - Add via UI
     - Click "Analyze"
     - Wait 30 seconds
     - Review AI results
     - Edit quotes/summary if needed
   ```

**Week 2: Profile Enhancement**
4. Review Kristy's profile dashboard
5. See aggregated themes:
   - Cultural connection (3 transcripts)
   - Legal advocacy (2 transcripts)
   - Youth empowerment (3 transcripts)
   - Intergenerational knowledge (2 transcripts)

6. Update profile bio using AI insights
7. Tag expertise areas
8. Set primary impact type: "Community Leadership"

**Week 3: Story Creation**
9. Create main story: "Kristy Bloomfield: From Legal Advocate to Cultural Bridge-Builder"

10. Story structure:
    ```
    Introduction (human-written):
    Context about Kristy's background and why her story matters

    Section 1: Cultural Roots
    - Quote: "Yipa-Rinya means belonging to place and country"
    - Photo: Kristy on country
    - Context from Transcript 1

    Section 2: Legal Journey
    - Quote: "We were navigating... for unnecessary reasons"
    - Photo: Courthouse or legal setting
    - Context from Transcript 2

    Section 3: Youth Work
    - Quote: "Our kids are really failing in this space"
    - Photo: Kristy with youth group
    - Context from Transcript 3

    Conclusion:
    - Call to action
    - Link to related stories
    - Contact info
    ```

11. Add media:
    - Upload 5-7 photos
    - Embed video snippet (2-3 min highlight reel)
    - Create photo gallery for full interview

**Week 4: Distribution**
12. Publish story (public)

13. Generate shareable content:
    - Social media cards (4 variations)
    - Email newsletter template
    - PDF download version
    - Blog post excerpt

14. Share across channels:
    - Website blog
    - LinkedIn article
    - Instagram carousel
    - Twitter thread
    - Email to community
    - Print for events

---

## 📊 Content Impact Tracking

### Metrics Auto-Generated

**Story Performance:**
- Views
- Time on page
- Shares (social)
- Downloads (PDF)
- Related story clicks

**Profile Growth:**
- Stories published: 12
- Transcripts analyzed: 8
- Total insights: 800+
- Primary themes: 5
- Media items: 45 photos, 3 videos

**Community Impact:**
- Stories featuring Kristy: 12
- Cross-references to other storytellers: 5
- Quotes used in other stories: 15
- External shares: 200+

---

## 🎯 Best Practices

### For Best AI Analysis Results

1. **Clean transcripts**: Remove filler words in excess, fix obvious errors
2. **Add context**: Include interviewer questions as context
3. **Length**: 2,000-15,000 words ideal (shorter = less context, longer = better themes)
4. **Review & Edit**: Always review AI suggestions before publishing

### For Compelling Stories

1. **Human intro**: Write a strong 2-3 paragraph introduction (don't use AI)
2. **Best quotes first**: Lead with most impactful quote
3. **Visual breaks**: Photo every 200-300 words
4. **Cultural respect**: Always review for cultural sensitivity
5. **Elder review**: For sacred/sensitive topics, get elder approval

### For Shareable Content

1. **Strong headline**: Clear, compelling, under 60 characters
2. **Hero image**: High-quality portrait or landscape
3. **Quote cards**: Pull 3-5 standalone quote graphics
4. **Short & long**: Create both 2-min read summary and full 10-min deep dive
5. **CTA**: Always include clear next action (donate, learn more, share)

---

## 🔄 Continuous Improvement

### The Flywheel

```
More Transcripts
    ↓
Better AI Analysis
    ↓
Richer Profiles
    ↓
Compelling Stories
    ↓
More Engagement
    ↓
More Interviews
    ↓
[loop back to top]
```

---

## 🆘 Quick Reference

### Key URLs
- Add Transcript: `/admin/storytellers/[id]/edit` → Transcripts tab
- Create Story: `/stories/create`
- View Stories: `/stories`
- Kristy's Profile: `/storytellers/[id]`
- Analytics: `/admin/analytics`

### Keyboard Shortcuts
- `Cmd/Ctrl + S`: Save story/transcript
- `Cmd/Ctrl + K`: Quick analyze
- `Cmd/Ctrl + E`: Edit mode
- `Cmd/Ctrl + P`: Publish story

---

## 💡 Pro Tips

1. **Batch analysis**: Upload 5-10 transcripts, analyze all at once
2. **Theme clustering**: Group related transcripts by theme for multi-part stories
3. **Quote library**: Build a searchable database of best quotes across all storytellers
4. **Photo tagging**: Tag photos with themes for easy discovery
5. **Template stories**: Create story templates for common narrative arcs
6. **Cross-promotion**: Link related storytellers in each story

---

## 🎉 You're Ready!

You now have:
- ✅ AI-powered transcript analysis
- ✅ Profile enrichment pipeline
- ✅ Story creation workflow
- ✅ Media management system
- ✅ Shareable content generation

**Next Steps:**
1. Add 2-3 more transcripts to Kristy's profile
2. Click "Analyze" on each
3. Review the aggregated themes
4. Create your first full story
5. Add photos/video
6. Publish & share!

🚀 **Let's create amazing content!**
