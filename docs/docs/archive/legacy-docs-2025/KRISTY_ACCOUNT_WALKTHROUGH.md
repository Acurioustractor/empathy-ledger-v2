# Kristy Bloomfield - Account Walkthrough 🌏

## Overview
Complete guide for how Kristy Bloomfield can set up and use her Empathy Ledger account to share her stories about sustainable tourism, cultural preservation, and the Napa Homestead walking trail project.

---

## 🎯 Who is Kristy?

**Background:**
- Visionary leader in sustainable tourism and cultural preservation
- Working on transformative walking trail at Napa Homestead
- Collaborates with Minga Minga Rangers on cultural heritage projects
- Innovating with technology (underwater drones) for Indigenous storytelling
- Working with Yipa-Rinya Cheddar on Caterpillar Dreaming projects

**Organization:** Oonchiumpa (Team Member)

---

## 📱 Step 1: Account Setup (First Login)

### What Kristy Sees:
When Kristy first logs in to Empathy Ledger, she'll see:

1. **Welcome Screen**
   - "Welcome to Empathy Ledger!"
   - "Let's set up your storyteller profile"

2. **Profile Setup Form**
   ```
   Display Name: Kristy Bloomfield
   Bio: [Text about sustainable tourism, cultural preservation work]
   Profile Photo: [Upload kristy_bloomfield.jpg]
   Location: Napa Homestead, [Region]
   ```

3. **Organization Connection**
   - Join existing organization: "Oonchiumpa"
   - Role: Team Member

### What Gets Created:
```sql
-- Profile record
INSERT INTO profiles (id, display_name, bio, avatar_media_id)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  'Kristy Bloomfield',
  'Kristy Bloomfield is a visionary leader...',
  [avatar_id]
);

-- Organization link
INSERT INTO profile_organizations (profile_id, organization_id, role)
VALUES (
  'b59a1f4c-94fd-4805-a2c5-cac0922133e0',
  'c53077e1-98de-4216-9149-6268891ff62e', -- Oonchiumpa
  'team_member'
);
```

---

## 🏠 Step 2: Kristy's Dashboard

### After Setup, Kristy Lands on Her Dashboard:

```
╔══════════════════════════════════════════════════════════╗
║  Welcome back, Kristy! 🌿                                ║
║                                                          ║
║  Your Story Stats:                                       ║
║  📖 2 Published Stories                                  ║
║  🎙️ 1 Recording Ready to Review                         ║
║  📸 0 Photos Uploaded                                    ║
║  👁️ 0 Total Views                                        ║
║                                                          ║
║  Quick Actions:                                          ║
║  [+ Upload Recording]  [+ Add Story]  [+ Upload Photos]  ║
╚══════════════════════════════════════════════════════════╝

Recent Activity:
─────────────────────────────────────────────────────────
✨ Your profile is live at: /storytellers/b59a1f4c...
📝 1 recording is ready to be turned into a story
🏢 You're part of Oonchiumpa organization

What's Next?
─────────────────────────────────────────────────────────
1. Review your audio recording transcript
2. Upload photos from Napa Homestead
3. Create your first project gallery
```

### Navigation Menu:
```
┌─────────────────────────────────┐
│ Kristy Bloomfield              │
│ Team Member @ Oonchiumpa       │
├─────────────────────────────────┤
│ 📊 Dashboard                    │
│ 📖 My Stories (2)               │
│ 🎙️ Recordings (1)               │
│ 📸 My Media (0)                 │
│ 🗺️ Projects                     │
│ 🏢 Oonchiumpa Organization      │
│ ⚙️ Settings                     │
└─────────────────────────────────┘
```

---

## 🎙️ Step 3: Working with Recordings

### Scenario: Kristy uploads a recording about the Napa Homestead walking trail

**What Kristy Does:**
1. Clicks **[+ Upload Recording]**
2. Uploads audio file: `napa_homestead_interview.mp3`
3. Adds title: "Developing the Napa Homestead Walking Trail"
4. Waits for AI transcription...

**What Happens (Admin Backend - Kitchen):**
```
Recording Upload → AI Transcription → Theme Extraction → Story Creation
     ↓                    ↓                  ↓                ↓
  Upload             Whisper API        GPT Analysis    Draft Story
  Audio File         Transcribes        Finds Themes    Ready to Edit
                     Speech             Tags Topics
```

**What Kristy Sees (Clean Frontend - Restaurant):**
```
╔══════════════════════════════════════════════════════╗
║ ✅ Recording Processed!                              ║
║                                                      ║
║ Your recording is ready to become a story.           ║
║ We've prepared a draft for you to review.            ║
║                                                      ║
║ Title: "Developing the Napa Homestead Walking Trail" ║
║ Duration: 12 minutes                                 ║
║ Word Count: 1,847 words                              ║
║                                                      ║
║ [View Draft Story] [Edit] [Add Photos]               ║
╚══════════════════════════════════════════════════════╝
```

**No AI Mentioned!** Kristy just sees:
- ✅ "Recording processed"
- ✅ "Draft story ready"
- ❌ Not: "AI analyzed your transcript"
- ❌ Not: "Whisper transcription complete"

---

## 📝 Step 4: Creating a Story from Recording

### Kristy Clicks [View Draft Story]

She sees a clean story editor:

```
┌─────────────────────────────────────────────────────┐
│ Story Editor                                        │
├─────────────────────────────────────────────────────┤
│ Title: Developing the Napa Homestead Walking Trail │
│                                                     │
│ Story:                                              │
│ ┌─────────────────────────────────────────────┐   │
│ │ The vision for the Napa Homestead walking   │   │
│ │ trail began with a deep connection to the   │   │
│ │ land and its stories. Working alongside the │   │
│ │ Minga Minga Rangers, we've been mapping     │   │
│ │ historical sites and cultural significance  │   │
│ │ points along the route...                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Themes: [Sustainable Tourism] [Cultural Heritage]  │
│         [Land Connection] [Community Partnership]  │
│                                                     │
│ Location: 📍 Napa Homestead                        │
│                                                     │
│ Photos: [+ Add Photos]                             │
│                                                     │
│ [Save Draft] [Preview] [Publish]                   │
└─────────────────────────────────────────────────────┘
```

### What Kristy Can Edit:
1. **Title** - Change or keep suggested title
2. **Story Text** - Edit, add, remove content
3. **Themes/Tags** - Add or remove suggested themes
4. **Location** - Link to Napa Homestead
5. **Photos** - Upload trail photos, cultural sites
6. **Visibility** - Public or Private

---

## 📸 Step 5: Adding Photos

### Kristy Clicks [+ Add Photos]

```
┌─────────────────────────────────────────────────┐
│ Add Photos to Story                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Drag & Drop Photos Here                         │
│ or                                              │
│ [Browse Files]                                  │
│                                                 │
│ Suggested photos to upload:                     │
│ • Walking trail views                           │
│ • Cultural heritage sites                       │
│ • Collaboration with Rangers                    │
│ • Landscape of Napa Homestead                   │
│                                                 │
│ Auto-detected locations: ✅ Enabled             │
│ Cultural sensitivity check: ✅ Enabled          │
│                                                 │
│ [Upload] [Cancel]                               │
└─────────────────────────────────────────────────┘
```

**After Upload:**
- Photos automatically link to story
- Metadata extracted (location, date)
- Cultural sensitivity check runs
- Photos added to Kristy's media library

---

## 🌍 Step 6: Kristy's Public Profile

### What Visitors See at `/storytellers/b59a1f4c-94fd-4805-a2c5-cac0922133e0`

```
╔══════════════════════════════════════════════════════════╗
║                    Kristy Bloomfield                     ║
║                  [Profile Photo]                         ║
║                                                          ║
║  Team Member @ Oonchiumpa                                ║
║  📍 Napa Homestead                                       ║
║                                                          ║
║  Kristy Bloomfield is a visionary leader and            ║
║  passionate advocate for sustainable tourism and         ║
║  cultural preservation...                                ║
║                                                          ║
║  📖 2 Stories  |  🗺️ 3 Projects  |  📸 12 Photos         ║
║                                                          ║
║  [View Stories] [Contact]                                ║
╚══════════════════════════════════════════════════════════╝

Stories by Kristy
─────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────┐
│ 🌿 Developing the Napa Homestead Walking Trail       │
│                                                      │
│ The vision for the Napa Homestead walking trail     │
│ began with a deep connection to the land...          │
│                                                      │
│ 📍 Napa Homestead  |  🏷️ Sustainable Tourism         │
│ 👁️ 245 views  |  ❤️ 18 likes                         │
│                                                      │
│ [Read Full Story]                                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 🦋 Caterpillar Dreaming & Cultural Technology        │
│                                                      │
│ Working with the Yipa-Rinya Cheddar, we're          │
│ exploring how underwater drones can capture...       │
│                                                      │
│ 📍 Traditional Territory  |  🏷️ Cultural Innovation  │
│ 👁️ 189 views  |  ❤️ 24 likes                         │
│                                                      │
│ [Read Full Story]                                    │
└──────────────────────────────────────────────────────┘
```

### What Kristy Sees (When Logged In):
- Same public view PLUS:
- **[Edit Story]** buttons
- **[Add New Story]** button
- **Analytics** link (shows views, likes, engagement)
- **Enhanced View** button (admin only - shows transcript, AI analysis)

---

## 🗂️ Step 7: Creating Project Galleries

### Kristy Can Organize Her Work into Projects:

**Example Project: "Napa Homestead Walking Trail"**

```
┌─────────────────────────────────────────────────┐
│ Create New Project                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Project Name:                                   │
│ Napa Homestead Walking Trail Development       │
│                                                 │
│ Description:                                    │
│ A collaborative project to develop a walking    │
│ trail that blends historical insights with      │
│ environmental stewardship...                    │
│                                                 │
│ Location: 📍 Napa Homestead                     │
│                                                 │
│ Link Stories:                                   │
│ ☑️ Developing the Napa Homestead Walking Trail  │
│ ☐ Other stories...                              │
│                                                 │
│ Add Photos: [+ Upload]                          │
│                                                 │
│ Visibility: ◉ Public  ○ Private                 │
│                                                 │
│ [Create Project] [Cancel]                       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow Example

### From Recording → Published Story

**Week 1: Recording**
```
Day 1: Kristy uploads audio recording
       ↓
       AI transcribes (backend - invisible to Kristy)
       ↓
       Kristy sees: "Recording processed! Draft ready."
```

**Week 2: Story Creation**
```
Day 5: Kristy reviews draft story
       ↓
       Edits content, adds details
       ↓
       Uploads 5 photos from walking trail
       ↓
       Adds location: Napa Homestead
       ↓
       Tags: Sustainable Tourism, Cultural Heritage
       ↓
       Saves as draft
```

**Week 3: Review & Publish**
```
Day 12: Kristy previews story on public page
        ↓
        Shares with Minga Minga Rangers for review
        ↓
        Gets approval
        ↓
        Clicks [Publish]
        ↓
        Story goes live at:
        - /storytellers/kristy/stories/walking-trail
        - /organisations/oonchiumpa/stories
        - /projects/napa-homestead
```

**Ongoing: Engagement**
```
Week 4+: Kristy checks dashboard
         ↓
         Sees: 245 views, 18 likes
         ↓
         Receives message from visitor
         ↓
         Responds through platform
         ↓
         Story shared by Oonchiumpa
```

---

## 👩‍💼 What Admin Sees (vs What Kristy Sees)

### Admin Backend View (Kitchen):
```
Kristy's Account - Admin Dashboard
─────────────────────────────────────────────
📊 Analytics:
   - Total engagement: 434 views
   - Story completion rate: 78%
   - Avg. reading time: 3m 24s

🎙️ Recordings:
   - 1 recording uploaded
   - Transcription: ✅ Complete (Whisper API)
   - AI Analysis: ✅ Themes extracted
   - Draft Story: ✅ Created

🤖 AI Processing:
   - Themes found: Sustainable Tourism, Cultural Heritage,
     Land Connection, Community Partnership
   - Locations detected: Napa Homestead, Traditional Territory
   - Entities: Minga Minga Rangers, Yipa-Rinya Cheddar,
     Caterpillar Dreaming

📝 Stories:
   - Published: 2
   - Draft: 0
   - Under Review: 0

[Edit Transcript] [View AI Analysis] [Manage Content]
```

### Kristy's View (Restaurant):
```
My Dashboard
─────────────────────────────────────────────
📖 My Stories: 2 published
📸 My Photos: 12 uploaded
👁️ Total Views: 434

Recent Activity:
✨ Your story reached 245 people this week!
💬 You have 1 new message
🏢 Oonchiumpa shared your story

[View Stories] [Upload Photos] [Messages]
```

**Zero AI Mentions in Kristy's View!**

---

## 🎯 Key Features for Kristy

### 1. **Simple Recording Upload**
- Drag & drop audio file
- Automatic processing
- Draft story ready to review
- No technical complexity

### 2. **Easy Story Editing**
- Clean, intuitive editor
- Pre-filled with transcribed content
- Add/remove content as needed
- Tag themes and locations

### 3. **Photo Management**
- Upload photos from projects
- Auto-link to stories
- Create galleries
- Cultural sensitivity checks

### 4. **Project Organization**
- Group related stories
- Create thematic collections
- Link to Oonchiumpa work
- Share with collaborators

### 5. **Public Profile**
- Beautiful storyteller page
- Stories automatically displayed
- Organization affiliation shown
- Contact form enabled

### 6. **Privacy Control**
- Choose public/private for each story
- Cultural protocol compliance
- Approval workflows for sensitive content
- Control who sees what

---

## 📊 Success Metrics Kristy Can Track

### In Her Dashboard:
```
This Month:
─────────────────────────────────────────
📖 Stories Published: 2
📸 Photos Uploaded: 12
👁️ Total Views: 434
❤️ Total Likes: 42
💬 Messages Received: 3
🔗 Times Shared: 8

Top Story:
"Developing the Napa Homestead Walking Trail"
245 views | 18 likes | 78% completion rate

Top Photo:
"Walking Trail Sunset View"
89 views | 12 likes

Organization Engagement:
Oonchiumpa shared your content 3 times
```

---

## 🌟 What Makes This Special for Kristy?

### Traditional Approach (Before Empathy Ledger):
```
❌ Record interview → Manual transcription →
   Type up story → Find website platform →
   Upload photos separately → Hope people find it →
   No analytics → No organization integration

Time: 10+ hours per story
Result: Static, disconnected content
```

### Empathy Ledger Approach:
```
✅ Upload recording → Auto-transcription →
   Review draft → Add photos → Publish →
   Automatic integration with Oonchiumpa →
   Live on profile, organization, projects →
   Real-time engagement tracking

Time: 1-2 hours per story
Result: Dynamic, connected storytelling ecosystem
```

---

## 🎬 Next Steps to Set Up Kristy's Account

1. **Create Profile Record**
   ```sql
   INSERT INTO profiles (id, display_name, bio, avatar_media_id)
   VALUES (...);
   ```

2. **Link to Oonchiumpa**
   ```sql
   INSERT INTO profile_organizations (profile_id, organization_id, role)
   VALUES (...);
   ```

3. **Add Napa Homestead Location**
   ```sql
   INSERT INTO profile_locations (profile_id, location_name, ...)
   VALUES (...);
   ```

4. **Upload Initial Content**
   - Profile photo
   - 1 sample transcript
   - Draft 2 stories
   - Upload 5 photos

5. **Test Workflow**
   - Upload recording → Review transcript → Create story → Publish
   - Verify public page displays correctly
   - Check Oonchiumpa integration
   - Test photo gallery

---

## 🎯 Summary

Kristy's Empathy Ledger account is:
- **Simple** - Upload recording, get story draft
- **Beautiful** - Clean public profile, no tech jargon
- **Connected** - Linked to Oonchiumpa, projects, themes
- **Private** - Full control over what's public/private
- **Engaging** - Track views, likes, shares
- **Cultural** - Respects protocols, sensitive content
- **Organized** - Projects, galleries, themed collections

All while **hiding the AI complexity** in the admin backend! 🎨

**Kitchen = Admin tools (AI, transcription, analysis)**
**Restaurant = Public view (beautiful stories, zero tech mentions)**

Perfect for showcasing sustainable tourism, cultural preservation, and the Napa Homestead walking trail project! 🌿
