# Empathy Ledger Data Flow & Relationships

**Visual guide to how data lives in the platform and connects across entities**

---

## 📊 Overview: The Data Ecosystem

### Core Entities

```
┌─────────────┐
│ Storyteller │ ──────────────────┐
│  (Profile)  │                   │
└─────────────┘                   │
                                  ▼
┌──────────────┐           ┌──────────┐           ┌─────────────┐
│ Organization │◄─────────►│  Story   │◄─────────►│   Project   │
└──────────────┘           └──────────┘           └─────────────┘
                                  │
                                  ▼
                           ┌─────────────┐
                           │  Transcript │
                           │   Analysis  │
                           └─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              ┌─────────┐   ┌─────────┐   ┌─────────┐
              │ Themes  │   │ Quotes  │   │Analytics│
              └─────────┘   └─────────┘   └─────────┘
```

---

## 🌳 Entity Relationship Diagram (Detailed)

```mermaid
erDiagram
    %% Core Identity
    PROFILES ||--o{ STORIES : creates
    PROFILES ||--o{ ORGANIZATIONS : belongs_to
    PROFILES ||--o{ PROJECTS : participates_in
    PROFILES ||--|| STORYTELLER_ANALYTICS : has
    PROFILES ||--|| CONSENT_SETTINGS : controls

    %% Organizations & Projects
    ORGANIZATIONS ||--o{ PROJECTS : runs
    ORGANIZATIONS ||--o{ ORG_MEMBERS : has
    PROJECTS ||--o{ PROJECT_STORIES : contains
    PROJECTS ||--o{ PROJECT_PARTICIPANTS : involves

    %% Stories & Content
    STORIES ||--o{ TRANSCRIPTS : has
    STORIES ||--o{ MEDIA_ASSETS : includes
    STORIES ||--o{ PROJECT_STORIES : tagged_in
    STORIES ||--o{ STORY_THEMES : explores
    STORIES ||--o{ STORY_SITE_VISIBILITY : shared_on

    %% Analysis Layer
    TRANSCRIPTS ||--o{ STORYTELLER_QUOTES : contains
    TRANSCRIPTS ||--o{ CULTURAL_PROTOCOLS : follows
    STORIES ||--|| STORY_ANALYSIS : analyzed_by

    %% Thematic Network
    NARRATIVE_THEMES ||--o{ STORY_THEMES : applied_to
    NARRATIVE_THEMES ||--o{ THEME_EVOLUTION : tracks
    STORY_THEMES }|--|| THEME_CONNECTIONS : links_to

    %% Analytics & Insights
    STORYTELLER_ANALYTICS ||--o{ STORYTELLER_ENGAGEMENT : measures
    STORYTELLER_ANALYTICS ||--o{ IMPACT_METRICS : quantifies
    STORYTELLER_ANALYTICS ||--o{ CONNECTIONS : discovers
    STORYTELLER_ANALYTICS ||--o{ RECOMMENDATIONS : suggests

    %% Multi-Site Sharing
    SITES ||--o{ STORY_SITE_VISIBILITY : displays
    STORY_SITE_VISIBILITY ||--|| CONSENT_SETTINGS : governed_by
    STORY_SITE_VISIBILITY ||--o{ API_ACCESS_LOG : tracked_by

    %% Attributes
    PROFILES {
        uuid id PK
        string email
        string display_name
        enum profile_type
        string avatar_url
    }

    STORIES {
        uuid id PK
        uuid storyteller_id FK
        string title
        enum status
        timestamp created_at
    }

    TRANSCRIPTS {
        uuid id PK
        uuid story_id FK
        text content
        text summary
        jsonb metadata
    }

    NARRATIVE_THEMES {
        uuid id PK
        string theme_name
        string theme_category
        vector embedding
        int usage_count
    }

    STORYTELLER_ANALYTICS {
        uuid id PK
        uuid storyteller_id FK
        int total_stories
        decimal engagement_score
        decimal impact_score
        jsonb primary_themes
    }
```

---

## 🔄 Data Flow: From Story Creation to Analysis

```mermaid
flowchart TB
    Start([Storyteller logs in]) --> Upload[Upload audio/video]
    Upload --> Process{Processing Pipeline}

    Process --> Transcribe[Transcription]
    Process --> Extract[Media extraction]

    Transcribe --> AI{AI Analysis}
    AI --> Themes[Extract themes]
    AI --> Quotes[Identify quotes]
    AI --> Sentiment[Analyze sentiment]
    AI --> Cultural[Check cultural markers]

    Themes --> DB[(Database)]
    Quotes --> DB
    Sentiment --> DB
    Cultural --> DB
    Extract --> DB

    DB --> Analytics[Generate Analytics]
    Analytics --> Connections[Discover connections]
    Analytics --> Impact[Calculate impact]
    Analytics --> Recommend[AI recommendations]

    Connections --> Network[Connection Network]
    Impact --> Dashboard[Storyteller Dashboard]
    Recommend --> Suggestions[Suggestion Cards]

    Network --> CrossSite{Cross-Site Sharing?}
    CrossSite -->|Yes with consent| Sites[ACT Sites]
    CrossSite -->|No| Private[Private only]

    Sites --> API[Public API]

    style Start fill:#E07A5F
    style AI fill:#8B5CF6
    style DB fill:#059669
    style CrossSite fill:#D97706
    style API fill:#06B6D4
```

---

## 👤 Storyteller-Centric View

```mermaid
graph TB
    Storyteller[👤 Storyteller Profile]

    Storyteller --> Stories[📖 Stories Created]
    Storyteller --> Orgs[🏢 Organization Memberships]
    Storyteller --> Projects[📋 Project Participation]
    Storyteller --> Analytics[📊 Analytics Dashboard]
    Storyteller --> Consent[🔐 Consent Settings]

    Stories --> S1[Story 1: Winter Teaching]
    Stories --> S2[Story 2: Land Connection]
    Stories --> S3[Story 3: Youth Voices]

    S1 --> T1[Transcript]
    T1 --> Themes1[Themes: Wisdom, Land]
    T1 --> Quotes1[Quotes: High impact]
    T1 --> Media1[Media: Audio + Photos]

    S1 --> Sites[🌐 Visible on Sites]
    Sites --> MainSite[ACT Main]
    Sites --> YouthSite[Youth Stories]
    Sites --> LandSite[Land Rights]

    Analytics --> Engagement[Engagement Metrics]
    Analytics --> Impact[Impact Scores]
    Analytics --> Network[Connection Network]
    Analytics --> AI[AI Insights]

    Network --> Conn1[Connected to Elder Mary]
    Network --> Conn2[Connected to Jordan]
    Network --> Conn3[Connected to Alex]

    Consent --> Global[Global Preferences]
    Consent --> PerStory[Per-Story Consent]

    PerStory --> Site1Consent[Main Site: ✓ Granted]
    PerStory --> Site2Consent[Youth: ✓ Granted]
    PerStory --> Site3Consent[Land: ✗ Revoked]

    style Storyteller fill:#E07A5F
    style Stories fill:#059669
    style Analytics fill:#8B5CF6
    style Consent fill:#D97706
    style Sites fill:#06B6D4
```

---

## 🏢 Organization → Projects → Stories Flow

```mermaid
flowchart LR
    Org[🏢 A Curious Tractor<br/>Organization]

    Org --> P1[📋 Youth Voices 2024<br/>Project]
    Org --> P2[📋 Land Rights<br/>Project]
    Org --> P3[📋 Elders Wisdom<br/>Project]

    P1 --> P1S1[📖 Climate Action<br/>Story by Jordan]
    P1 --> P1S2[📖 School Strike<br/>Story by Maria]
    P1 --> P1S3[📖 Future Vision<br/>Story by Kai]

    P2 --> P2S1[📖 Land Remembers<br/>Story by Alex]
    P2 --> P2S2[📖 Water Rights<br/>Story by River]

    P3 --> P3S1[📖 Winter Teaching<br/>Story by Elder Sarah]
    P3 --> P3S2[📖 Medicine Ways<br/>Story by Elder Tom]

    P1S1 --> YouthSite[🌐 Youth Site]
    P2S1 --> LandSite[🌐 Land Site]
    P3S1 --> AllSites[🌐 All Sites]

    P3S1 -.also in.-> P1

    style Org fill:#E07A5F
    style P1 fill:#06B6D4
    style P2 fill:#059669
    style P3 fill:#8B5CF6
    style AllSites fill:#D97706
```

---

## 🎯 Thematic Analysis Network

```mermaid
graph TB
    subgraph "Storyteller Themes"
        ST1[Elder Sarah<br/>Wisdom, Land, Family]
        ST2[Jordan<br/>Climate, Youth, Activism]
        ST3[Alex<br/>Land, Rights, Sovereignty]
    end

    subgraph "Theme Network"
        T1[Knowledge & Wisdom]
        T2[Land & Territory]
        T3[Climate Action]
        T4[Family & Kinship]
        T5[Justice & Rights]
        T6[Youth Voices]
    end

    subgraph "Connections Discovered"
        C1[Sarah ↔️ Alex<br/>Shared: Land]
        C2[Sarah ↔️ Jordan<br/>Shared: Wisdom]
        C3[Alex ↔️ Jordan<br/>Shared: Activism]
    end

    ST1 --> T1
    ST1 --> T2
    ST1 --> T4

    ST2 --> T3
    ST2 --> T6
    ST2 --> T5

    ST3 --> T2
    ST3 --> T5

    T1 -.links to.-> T2
    T2 -.links to.-> T5
    T3 -.links to.-> T6

    T1 --> C2
    T2 --> C1
    T2 --> C3
    T5 --> C3

    C1 --> Collab1[Collaboration:<br/>Land Teaching Series]
    C2 --> Collab2[Collaboration:<br/>Youth Mentorship]
    C3 --> Collab3[Collaboration:<br/>Climate Justice]

    style T1 fill:#8B5CF6
    style T2 fill:#059669
    style T3 fill:#06B6D4
    style T5 fill:#EA580C
    style T6 fill:#D97706
```

---

## 🔗 Story → Analysis → Insights Pipeline

```mermaid
sequenceDiagram
    participant S as Storyteller
    participant Sys as System
    participant AI as AI Analysis
    participant DB as Database
    participant Dash as Dashboard

    S->>Sys: Upload story (audio/video)
    Sys->>Sys: Store media
    Sys->>AI: Send for transcription

    AI->>AI: Transcribe audio
    AI->>AI: Extract themes
    AI->>AI: Identify quotes
    AI->>AI: Analyze sentiment
    AI->>AI: Check cultural markers

    AI->>DB: Store transcript
    AI->>DB: Store themes with embeddings
    AI->>DB: Store quotes with scores
    AI->>DB: Store cultural metadata

    DB->>DB: Calculate connections
    DB->>DB: Compute impact scores
    DB->>DB: Generate recommendations

    DB->>Dash: Update analytics
    Dash->>S: Show insights

    S->>Dash: Review AI suggestions
    S->>Dash: Accept/reject themes
    S->>DB: Update preferences

    DB->>AI: Learn from feedback
    AI->>AI: Improve future analysis
```

---

## 🌐 Cross-Site Story Sharing Flow

```mermaid
flowchart TB
    Story[📖 Story Created<br/>in Empathy Ledger]

    Story --> Check{Storyteller wants<br/>to share?}

    Check -->|No| Private[🔒 Private<br/>Profile only]
    Check -->|Yes| Consent[💭 Grant Consent]

    Consent --> Sites{Which sites?}

    Sites -->|Youth| YouthSite[🌐 Youth Stories]
    Sites -->|Land| LandSite[🌐 Land Rights]
    Sites -->|Main| MainSite[🌐 ACT Main]

    YouthSite --> YouthAPI[API: Check consent]
    LandSite --> LandAPI[API: Check consent]
    MainSite --> MainAPI[API: Check consent]

    YouthAPI -->|✓ Valid| YouthDisplay[Display on youth.act.org]
    LandAPI -->|✓ Valid| LandDisplay[Display on land.act.org]
    MainAPI -->|✓ Valid| MainDisplay[Display on acurioustractor.org]

    YouthDisplay --> Views[📊 Track views]
    LandDisplay --> Views
    MainDisplay --> Views

    Views --> Analytics[Update analytics]

    Consent -.storyteller can.-> Revoke[❌ Revoke Consent]
    Revoke --> Remove[Story removed<br/>from site instantly]
    Remove --> Webhook[Webhook notifies site]

    style Story fill:#E07A5F
    style Consent fill:#059669
    style Revoke fill:#DC2626
    style Private fill:#6B7280
```

---

## 📊 Analytics Data Model

```mermaid
graph LR
    subgraph "Core Metrics"
        Profile[👤 Storyteller Profile]
        Profile --> Analytics[📊 Analytics Record]

        Analytics --> Core[Core Stats]
        Core --> TotalStories[Total Stories: 12]
        Core --> TotalViews[Total Views: 3,421]
        Core --> EngageScore[Engagement: 0.87]
        Core --> ImpactScore[Impact: 0.92]
    end

    subgraph "Time-Series Data"
        Analytics --> Engagement[📈 Engagement History]
        Engagement --> E1[Week 1: 234 views]
        Engagement --> E2[Week 2: 312 views]
        Engagement --> E3[Week 3: 289 views]
    end

    subgraph "Thematic Analysis"
        Analytics --> Themes[🎯 Top Themes]
        Themes --> Theme1[Land: 0.85 prominence]
        Themes --> Theme2[Wisdom: 0.78]
        Themes --> Theme3[Family: 0.65]
    end

    subgraph "Quote Analysis"
        Analytics --> Quotes[💬 Top Quotes]
        Quotes --> Q1[Quote 1: 0.95 wisdom]
        Quotes --> Q2[Quote 2: 0.88 quotability]
        Quotes --> Q3[Quote 3: 0.92 inspiration]
    end

    subgraph "Connection Network"
        Analytics --> Connections[🤝 Connections]
        Connections --> Conn1[Elder Mary: 0.87 strength]
        Connections --> Conn2[Jordan: 0.72]
        Connections --> Conn3[Alex: 0.68]

        Conn1 --> ConnType1[Type: Thematic]
        Conn2 --> ConnType2[Type: Generational]
        Conn3 --> ConnType3[Type: Geographic]
    end

    subgraph "AI Insights"
        Analytics --> AI[✨ AI Recommendations]
        AI --> Rec1[Add theme: Resilience]
        AI --> Rec2[Connect with River]
        AI --> Rec3[Share on Land site]

        Rec1 --> Conf1[Confidence: 0.89]
        Rec2 --> Conf2[Confidence: 0.82]
        Rec3 --> Conf3[Confidence: 0.91]
    end

    style Analytics fill:#E07A5F
    style Engagement fill:#06B6D4
    style Themes fill:#8B5CF6
    style Quotes fill:#059669
    style Connections fill:#D97706
    style AI fill:#EA580C
```

---

## 🎨 Theme Evolution & Cross-Narrative Insights

```mermaid
timeline
    title Theme Evolution: "Land & Territory" across stories

    section 2024 Q1
        Elder Sarah<br/>Winter Teaching : Land as teacher : Prominence 0.85
        Alex<br/>Sovereignty Story : Land rights focus : Prominence 0.92

    section 2024 Q2
        River<br/>Water Rights : Water-land connection : Prominence 0.78
        Maria<br/>Sacred Sites : Protection urgency : Prominence 0.88

    section 2024 Q3
        Jordan<br/>Climate Action : Land-climate link : Prominence 0.75
        Tom<br/>Medicine Ways : Healing relationship : Prominence 0.82

    section 2024 Q4
        Kai<br/>Future Vision : Next generation : Prominence 0.79
        Sarah<br/>Spring Teaching : Renewal & growth : Prominence 0.87
```

**Theme Trend:**
```
0.95 |                     ● Alex
0.90 |                    ╱│
0.85 | ● Sarah          ╱  │  ● Maria
0.80 |        ╲       ╱    │ ╱       ● Tom    ● Sarah
0.75 |         ╲    ╱      ●       ╱           │
0.70 |          ╲ ●              ╱             ● Kai
     └─────────────────────────────────────────────→
       Jan    Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   Dec
```

---

## 🔍 Connection Discovery Algorithm

```mermaid
flowchart TB
    Start[👤 Storyteller Profile]

    Start --> Extract[Extract all themes<br/>from stories]
    Extract --> Embed[Get theme embeddings<br/>1536-dimensional vectors]

    Embed --> Compare{For each other<br/>storyteller}

    Compare --> Similarity[Calculate vector<br/>similarity]
    Similarity --> Score[Generate<br/>connection score]

    Score --> Types{Determine<br/>connection types}

    Types --> Thematic[Thematic<br/>Shared themes > 0.7]
    Types --> Geographic[Geographic<br/>Same region]
    Types --> Cultural[Cultural<br/>Similar markers]
    Types --> Generational[Generational<br/>Age cohort]

    Thematic --> Combine[Combine scores]
    Geographic --> Combine
    Cultural --> Combine
    Generational --> Combine

    Combine --> Threshold{Score > 0.6?}

    Threshold -->|Yes| Create[Create connection<br/>record]
    Threshold -->|No| Skip[Skip]

    Create --> Areas[Identify collaboration<br/>opportunities]
    Areas --> Recommend[Generate AI<br/>recommendations]

    Recommend --> Dashboard[Add to storyteller<br/>dashboard]

    style Start fill:#E07A5F
    style Embed fill:#8B5CF6
    style Types fill:#059669
    style Recommend fill:#D97706
```

---

## 💾 Database Table Relationships (Simplified)

```mermaid
erDiagram
    %% Core trilogy
    STORYTELLER ||--o{ STORY : creates
    ORGANIZATION ||--o{ PROJECT : manages
    PROJECT ||--o{ STORY : contains

    %% Story content
    STORY ||--|| TRANSCRIPT : has
    STORY ||--o{ MEDIA : includes

    %% Analysis outputs
    TRANSCRIPT ||--o{ THEME : extracts
    TRANSCRIPT ||--o{ QUOTE : identifies
    STORY ||--|| ANALYSIS : generates

    %% Analytics
    STORYTELLER ||--|| ANALYTICS : measures
    ANALYTICS ||--o{ ENGAGEMENT_HISTORY : tracks
    ANALYTICS ||--o{ CONNECTIONS : discovers
    ANALYTICS ||--o{ RECOMMENDATIONS : suggests

    %% Multi-site
    STORY ||--o{ SITE_VISIBILITY : shared_on
    SITE_VISIBILITY }|--|| SITE : displays_on
    STORYTELLER ||--|| CONSENT_SETTINGS : controls

    STORYTELLER {
        uuid id
        string name
        string email
    }

    STORY {
        uuid id
        uuid storyteller_id
        string title
        enum status
    }

    THEME {
        uuid id
        string name
        vector embedding
        decimal prominence
    }

    ANALYTICS {
        uuid id
        uuid storyteller_id
        int total_stories
        decimal impact_score
    }

    SITE_VISIBILITY {
        uuid story_id
        uuid site_id
        bool consent
        timestamp expires_at
    }
```

---

## 📈 Data Volume & Growth

```mermaid
pie title Current Data Distribution
    "Stories" : 1247
    "Transcripts" : 1247
    "Themes" : 342
    "Quotes" : 4521
    "Connections" : 8934
    "Analytics Records" : 456
```

**Growth Projection:**
```
Stories Created per Month

1500 |                                    ●
1400 |                                 ●╱
1300 |                              ●╱
1200 |                           ●╱
1100 |                        ●╱
1000 |                     ●╱
 900 |                  ●╱
 800 |               ●╱
 700 |            ●╱
 600 |         ●╱
 500 |      ●╱
     └──────────────────────────────────────→
       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug
```

---

## 🎯 Key Data Relationships Summary

### 1. **Storyteller → Stories** (1:many)
- One storyteller creates multiple stories
- Each story has exactly one storyteller
- Stories can be shared across multiple sites with consent

### 2. **Organization → Projects** (1:many)
- One org manages multiple projects
- Projects belong to one organization
- Projects can have multiple stories

### 3. **Story → Transcript → Analysis** (1:1:1)
- Each story has one transcript
- Each transcript generates one analysis record
- Analysis produces themes, quotes, insights

### 4. **Story → Themes** (many:many)
- Stories explore multiple themes
- Themes appear in multiple stories
- Prominence scores track relevance

### 5. **Storyteller → Analytics → Connections** (1:1:many)
- Each storyteller has one analytics record
- Analytics discovers multiple connections
- Connections link storytellers via themes, geography, etc.

### 6. **Story → Sites** (many:many via consent)
- Stories can appear on multiple sites
- Each visibility requires storyteller consent
- Consent can be revoked instantly

---

## 🔄 Data Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Storyteller creates story
    Draft --> Processing: Upload complete
    Processing --> Transcribing: AI transcription
    Transcribing --> Analyzing: Extract themes/quotes
    Analyzing --> Review: Storyteller review
    Review --> Published: Approve & publish
    Review --> Draft: Request changes
    Published --> Shared: Grant site consent
    Shared --> Published: Revoke consent
    Published --> Archived: Archive story
    Archived --> [*]

    note right of Processing
        Media upload
        Validation
        Storage
    end note

    note right of Analyzing
        AI analysis:
        - Themes
        - Quotes
        - Sentiment
        - Cultural markers
    end note

    note right of Shared
        Visible on ACT sites
        with storyteller consent
    end note
```

---

**Next:** Connect this to the **thematic network analysis** and show how AI discovers patterns across stories!
