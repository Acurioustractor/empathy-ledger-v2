# Database Visual Diagrams

## 📊 Complete Entity Relationship Diagram

```mermaid
erDiagram
    %% Core Identity Layer
    TENANTS ||--o{ PROFILES : "has members"
    TENANTS ||--o{ STORIES : "owns content"
    TENANTS ||--o{ TRANSCRIPTS : "owns data"
    TENANTS ||--o{ PROJECTS : "manages"

    %% Storyteller Core
    PROFILES ||--o{ STORIES : "authors"
    PROFILES ||--o{ TRANSCRIPTS : "storyteller"
    PROFILES ||--o{ MEDIA_ASSETS : "uploads"
    PROFILES ||--o{ STORYTELLER_ANALYTICS : "measured by"

    %% Content Relationships
    STORIES ||--o{ STORY_MEDIA_LINKS : "contains"
    MEDIA_ASSETS ||--o{ STORY_MEDIA_LINKS : "used in"
    STORIES ||--o{ STORY_ACCESS_TOKENS : "shared via"
    STORIES ||--o{ STORY_ENGAGEMENT_EVENTS : "tracked by"

    %% Project System
    PROJECTS ||--o{ TRANSCRIPTS : "contains"
    PROJECTS ||--o{ PROJECT_ANALYSES : "analyzed by"
    PROJECTS ||--o{ PROJECT_CONTEXTS : "configured by"

    %% Analytics Flow
    PROFILES ||--o{ STORYTELLER_IMPACT_METRICS : "impact"
    STORIES ||--o{ STORY_ENGAGEMENT_DAILY : "metrics"
    TENANTS ||--o{ ORGANIZATION_IMPACT_METRICS : "org metrics"

    %% Media System
    MEDIA_ASSETS ||--o{ MEDIA_USAGE_TRACKING : "tracked"
    MEDIA_ASSETS ||--o{ STORYTELLER_MEDIA_LIBRARY : "organized"

    %% Access Control
    STORIES ||--o{ STORY_REVIEW_INVITATIONS : "shared for review"
    TENANTS ||--o{ ORGANIZATION_INVITATIONS : "invites"
    STORIES ||--o{ STORY_SYNDICATION_CONSENT : "consent"

    %% Cultural Safety
    STORIES ||--o{ MODERATION_RESULTS : "reviewed"
    MODERATION_RESULTS ||--o{ MODERATION_APPEALS : "appealed"

    TENANTS {
        uuid id PK
        text name
        jsonb cultural_identity
        timestamp created_at
    }

    PROFILES {
        uuid id PK
        uuid tenant_id FK
        text display_name
        text avatar_url
        text cultural_background
        boolean is_elder
        boolean is_featured
    }

    STORIES {
        uuid id PK
        uuid tenant_id FK
        uuid author_id FK
        uuid project_id FK
        text title
        text content
        text[] themes
        timestamp created_at
    }

    TRANSCRIPTS {
        uuid id PK
        uuid tenant_id FK
        uuid storyteller_id FK
        uuid project_id FK
        text title
        integer word_count
        timestamp created_at
    }

    MEDIA_ASSETS {
        uuid id PK
        uuid tenant_id FK
        uuid uploaded_by FK
        text cdn_url
        text mime_type
        integer file_size
    }

    PROJECTS {
        uuid id PK
        uuid tenant_id FK
        text name
        text description
        timestamp created_at
    }
```

## 🏗️ System Architecture Diagram

```mermaid
graph TB
    %% Multi-Tenant Foundation
    subgraph FOUNDATION["🏢 Multi-Tenant Foundation"]
        TENANT[Tenants<br/>Organizations]
        RLS[RLS Policies<br/>210 total]
        TENANT_ID[tenant_id<br/>Isolation Key]
    end

    %% Core Systems
    subgraph IDENTITY["👤 Identity System"]
        PROFILES[Profiles<br/>Storytellers]
        AUTH[Authentication]
        ROLES[Organization Roles]
    end

    subgraph CONTENT["📝 Content System"]
        STORIES[Stories<br/>3 tables]
        TRANSCRIPTS[Transcripts]
        QUOTES[Quotes]
        DRAFTS[Story Drafts]
    end

    subgraph MEDIA["🎬 Media System"]
        ASSETS[Media Assets]
        CDN[CDN URLs]
        GALLERIES[Galleries]
        USAGE[Usage Tracking]
        LIBRARY[Media Library]
    end

    subgraph PROJECTS["📁 Project System"]
        PROJ[Projects]
        CONTEXTS[Project Contexts]
        ANALYSIS[Project Analysis]
        ACT[ACT Integration<br/>3 tables]
    end

    subgraph ANALYTICS["📊 Analytics System"]
        ST_ANALYTICS[Storyteller Analytics]
        ORG_METRICS[Org Impact Metrics]
        ENGAGEMENT[Engagement Events]
        PLATFORM[Platform Stats]
    end

    subgraph CULTURAL["🛡️ Cultural Safety"]
        MODERATION[AI Moderation]
        CONSENT[Consent Management]
        APPEALS[Appeals Process]
        ELDER[Elder Review]
    end

    subgraph ACCESS["🔐 Access Control"]
        TOKENS[Access Tokens]
        INVITATIONS[Invitations]
        PARTNER[Partner Portal<br/>6 tables]
        SHARING[Story Sharing]
    end

    subgraph SYSTEM["⚙️ System Layer"]
        ACTIVITY[Activity Log]
        AUDIT[Audit Logs]
        NOTIFICATIONS[Notifications]
        WEBHOOKS[Webhooks]
        AI_USAGE[AI Usage Events]
    end

    %% Relationships
    FOUNDATION --> IDENTITY
    FOUNDATION --> CONTENT
    FOUNDATION --> MEDIA
    FOUNDATION --> PROJECTS

    IDENTITY --> CONTENT
    IDENTITY --> MEDIA
    IDENTITY --> ANALYTICS

    CONTENT --> MEDIA
    CONTENT --> CULTURAL
    CONTENT --> ACCESS
    CONTENT --> ANALYTICS

    PROJECTS --> TRANSCRIPTS
    PROJECTS --> ANALYSIS

    CONTENT --> SYSTEM
    IDENTITY --> SYSTEM
    ACCESS --> SYSTEM

    ANALYTICS --> SYSTEM
    CULTURAL --> SYSTEM

    style FOUNDATION fill:#e1f5ff
    style IDENTITY fill:#fff3e0
    style CONTENT fill:#f3e5f5
    style MEDIA fill:#e8f5e9
    style PROJECTS fill:#fff9c4
    style ANALYTICS fill:#fce4ec
    style CULTURAL fill:#ffebee
    style ACCESS fill:#e0f2f1
    style SYSTEM fill:#f5f5f5
```

## 🔄 Data Flow Diagram

```mermaid
flowchart LR
    %% Story Creation Flow
    subgraph CREATE["Story Creation Flow"]
        U1[User] --> D1[Create Draft]
        D1 --> M1[Upload Media]
        M1 --> L1[Link Media]
        L1 --> P1[Publish Story]
        P1 --> A1[Trigger Analytics]
    end

    %% Sharing Flow
    subgraph SHARE["Story Sharing Flow"]
        S1[Story] --> C1{Check Consent}
        C1 -->|Approved| T1[Create Token]
        T1 --> PA1[Partner Access]
        PA1 --> LOG1[Log Access]
        LOG1 --> M2[Update Metrics]
    end

    %% Analytics Flow
    subgraph ANALYTICS["Analytics Flow"]
        E1[User Events] --> E2[Engagement Events]
        E2 --> D2[Daily Rollup]
        D2 --> ST1[Storyteller Metrics]
        ST1 --> ORG1[Org Metrics]
        ORG1 --> DASH1[Dashboards]
    end

    %% Cultural Safety Flow
    subgraph SAFETY["Cultural Safety Flow"]
    C2[Submit Content] --> AI1[AI Moderation]
        AI1 --> R1{Risk Level}
        R1 -->|Low| APP1[Auto Approve]
        R1 -->|High| E3[Elder Review]
        E3 --> F1[Final Decision]
    end

    CREATE --> SHARE
    SHARE --> ANALYTICS
    CREATE --> SAFETY

    style CREATE fill:#e3f2fd
    style SHARE fill:#f3e5f5
    style ANALYTICS fill:#fff3e0
    style SAFETY fill:#ffebee
```

## 📈 Table Size & Complexity Chart

```mermaid
quadrantChart
    title Database Table Complexity vs Volume
    x-axis Low Volume --> High Volume
    y-axis Simple --> Complex

    quadrant-1 High Complexity, High Volume
    quadrant-2 High Complexity, Low Volume
    quadrant-3 Low Complexity, Low Volume
    quadrant-4 Low Complexity, High Volume

    story_engagement_events: [0.9, 0.4]
    activity_log: [0.85, 0.3]
    media_usage_tracking: [0.8, 0.5]
    ai_usage_events: [0.75, 0.4]

    profiles: [0.5, 0.7]
    stories: [0.6, 0.8]
    transcripts: [0.55, 0.75]
    media_assets: [0.5, 0.6]

    organization_roles: [0.2, 0.6]
    tenants: [0.15, 0.5]
    project_contexts: [0.3, 0.7]

    notifications: [0.7, 0.2]
    story_access_tokens: [0.65, 0.3]
    webhooks: [0.4, 0.35]
```

## 🎯 Security Layers Diagram

```mermaid
graph TD
    subgraph PUBLIC["Public Layer"]
        PUB1[Public Stories]
        PUB2[Embed Tokens]
        PUB3[Syndicated Content]
    end

    subgraph AUTH["Authenticated Layer"]
        AUTH1[User Profile]
        AUTH2[View Stories]
        AUTH3[Upload Media]
    end

    subgraph TENANT["Tenant-Isolated Layer"]
        TEN1[Tenant Stories]
        TEN2[Tenant Members]
        TEN3[Tenant Analytics]
    end

    subgraph OWNER["Owner-Only Layer"]
        OWN1[Personal Drafts]
        OWN2[Private Media]
        OWN3[Account Settings]
    end

    subgraph ADMIN["Admin Layer"]
        ADM1[User Management]
        ADM2[Moderation Queue]
        ADM3[System Settings]
    end

    PUBLIC --> AUTH
    AUTH --> TENANT
    TENANT --> OWNER
    OWNER --> ADMIN

    RLS1[RLS Policy: PUBLIC READ]
    RLS2[RLS Policy: USER = auth.uid]
    RLS3[RLS Policy: tenant_id = jwt.tenant_id]
    RLS4[RLS Policy: owner_id = auth.uid]
    RLS5[RLS Policy: is_admin = true]

    RLS1 -.-> PUBLIC
    RLS2 -.-> AUTH
    RLS3 -.-> TENANT
    RLS4 -.-> OWNER
    RLS5 -.-> ADMIN

    style PUBLIC fill:#e8f5e9
    style AUTH fill:#fff3e0
    style TENANT fill:#e3f2fd
    style OWNER fill:#f3e5f5
    style ADMIN fill:#ffebee
```

## 🔗 Relationship Strength Map

```mermaid
graph LR
    %% Strong relationships
    PROFILES ==strong==> STORIES
    PROFILES ==strong==> TRANSCRIPTS
    TENANTS ==strong==> PROFILES

    %% Medium relationships
    STORIES --medium--> MEDIA_ASSETS
    PROJECTS --medium--> TRANSCRIPTS
    STORIES --medium--> PROJECTS

    %% Weak/Optional relationships
    PROFILES -.optional.-> MEDIA_ASSETS
    STORIES -.optional.-> STORY_TOKENS
    PROFILES -.optional.-> ANALYTICS

    %% Analytics flow
    STORIES ==> ENGAGEMENT_EVENTS
    ENGAGEMENT_EVENTS ==> DAILY_METRICS
    DAILY_METRICS ==> ST_ANALYTICS

    style PROFILES fill:#fff3e0
    style STORIES fill:#e3f2fd
    style TENANTS fill:#f3e5f5
    style MEDIA_ASSETS fill:#e8f5e9
```

## 📊 Table Count by System

```mermaid
pie title Database Tables by System (87 total)
    "Organization (13)" : 13
    "Analytics (13)" : 13
    "Projects (11)" : 11
    "Access Control (10)" : 10
    "System Events (10)" : 10
    "Media (5)" : 5
    "Cultural Safety (5)" : 5
    "Content (3)" : 3
    "Uncategorized (17)" : 17
```

## 🚀 Function Categories

```mermaid
pie title Database Functions by Category (82 total)
    "Analytics (25)" : 25
    "Access Control (15)" : 15
    "Permissions (12)" : 12
    "Triggers (10)" : 10
    "Utilities (10)" : 10
    "Integration (10)" : 10
```

## 📋 How to View These Diagrams

### In GitHub/GitLab
These Mermaid diagrams render automatically in:
- GitHub README/markdown files
- GitLab documentation
- Many markdown editors

### In VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file
3. Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows)

### Online Viewers
- [Mermaid Live Editor](https://mermaid.live)
- Copy any diagram code block and paste

### Export as Image
1. Open in Mermaid Live Editor
2. Click "Export" → PNG/SVG
3. Save for presentations/docs

---

**Next**: See [INTERACTIVE_DIAGRAM.html](./INTERACTIVE_DIAGRAM.html) for clickable visualization!
