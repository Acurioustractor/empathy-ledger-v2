# Organization Impact Analysis System

## Executive Summary

This document outlines the complete system for organizations to gather insights and measure impact from their connected storytellers and transcripts, using existing database relationships and AI analysis infrastructure.

## Database Architecture for Organization Impact

### Current Relationships (Leveraging Existing Schema)

```
┌──────────────────────────────────────────────────────────────┐
│                    ORGANIZATION IMPACT FLOW                   │
└──────────────────────────────────────────────────────────────┘

organisations
    ├── organization_members (via organization_id)
    │   └── profiles (storytellers with is_storyteller=true)
    │       ├── transcripts (via storyteller_id)
    │       │   ├── themes[] - AI extracted
    │       │   ├── key_quotes[] - AI extracted
    │       │   ├── ai_summary - AI generated
    │       │   └── ai_processing_status
    │       ├── stories (via storyteller_id)
    │       │   ├── themes[]
    │       │   └── cultural_tags[]
    │       └── storyteller_analytics
    │           ├── primary_themes[]
    │           ├── impact_score
    │           └── connection_count
    ├── projects (via organization_id)
    │   └── stories (via project_id)
    └── organization_contexts (AI-extracted org insights)
```

### Missing Tables (Need to Create)

```sql
-- 1. Organization Impact Metrics (Aggregated Analytics)
CREATE TABLE organization_impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Storyteller Metrics
  total_storytellers INTEGER DEFAULT 0,
  active_storytellers INTEGER DEFAULT 0,
  featured_storytellers INTEGER DEFAULT 0,
  elder_storytellers INTEGER DEFAULT 0,

  -- Content Metrics
  total_transcripts INTEGER DEFAULT 0,
  analyzed_transcripts INTEGER DEFAULT 0,
  total_stories INTEGER DEFAULT 0,
  published_stories INTEGER DEFAULT 0,

  -- Theme Analysis
  primary_themes TEXT[] DEFAULT '{}',
  cultural_themes TEXT[] DEFAULT '{}',
  theme_diversity_score DECIMAL(3,2) DEFAULT 0, -- 0-1 score

  -- Quote Analysis
  total_quotes INTEGER DEFAULT 0,
  high_impact_quotes INTEGER DEFAULT 0,
  most_powerful_quotes JSONB DEFAULT '[]', -- Top 10 quotes

  -- Network Metrics
  storyteller_connection_density DECIMAL(3,2) DEFAULT 0,
  cross_cultural_connections INTEGER DEFAULT 0,

  -- Impact Scores
  overall_impact_score DECIMAL(5,2) DEFAULT 0,
  cultural_preservation_score DECIMAL(5,2) DEFAULT 0,
  community_engagement_score DECIMAL(5,2) DEFAULT 0,
  knowledge_transmission_score DECIMAL(5,2) DEFAULT 0,

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculation_version TEXT DEFAULT 'v1',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_impact_org ON organization_impact_metrics(organization_id);
CREATE INDEX idx_org_impact_tenant ON organization_impact_metrics(tenant_id);


-- 2. Organization Theme Analytics (Time-Series Theme Evolution)
CREATE TABLE organization_theme_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  theme TEXT NOT NULL,
  theme_category TEXT, -- cultural, family, land, resilience, knowledge

  -- Occurrence Metrics
  total_occurrences INTEGER DEFAULT 0,
  transcript_count INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  storyteller_count INTEGER DEFAULT 0,

  -- Time-Series Data
  first_occurrence_date TIMESTAMPTZ,
  last_occurrence_date TIMESTAMPTZ,
  monthly_trend JSONB DEFAULT '[]', -- [{month: '2025-01', count: 15}, ...]

  -- Impact Metrics
  average_confidence_score DECIMAL(3,2) DEFAULT 0,
  cultural_relevance TEXT DEFAULT 'medium', -- low, medium, high, sacred

  -- Related Data
  representative_quotes TEXT[] DEFAULT '{}',
  key_storytellers UUID[] DEFAULT '{}',
  related_themes TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_theme_org ON organization_theme_analytics(organization_id);
CREATE INDEX idx_org_theme_theme ON organization_theme_analytics(theme);
CREATE INDEX idx_org_theme_category ON organization_theme_analytics(theme_category);


-- 3. Organization Cross-Transcript Insights (Cached Analysis)
CREATE TABLE organization_cross_transcript_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  insight_type TEXT NOT NULL, -- dominant_pattern, emerging_theme, cultural_marker, etc.
  insight_title TEXT NOT NULL,
  insight_description TEXT,

  -- Supporting Data
  supporting_transcripts UUID[] DEFAULT '{}',
  supporting_quotes JSONB DEFAULT '[]',
  related_themes TEXT[] DEFAULT '{}',

  -- Metrics
  confidence_score DECIMAL(3,2) DEFAULT 0,
  storyteller_coverage INTEGER DEFAULT 0, -- How many storytellers this applies to
  significance TEXT DEFAULT 'medium', -- low, medium, high, critical

  -- AI Metadata
  generated_by TEXT, -- 'hybrid-analyzer', 'claude', 'pattern-matching'
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_insights_org ON organization_cross_transcript_insights(organization_id);
CREATE INDEX idx_org_insights_type ON organization_cross_transcript_insights(insight_type);
CREATE INDEX idx_org_insights_featured ON organization_cross_transcript_insights(is_featured) WHERE is_featured = true;


-- 4. Organization Storyteller Network (Connection Graph)
CREATE TABLE organization_storyteller_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  storyteller_a_id UUID NOT NULL REFERENCES profiles(id),
  storyteller_b_id UUID NOT NULL REFERENCES profiles(id),

  connection_type TEXT NOT NULL, -- theme_overlap, geographic, cultural_affiliation, project_collaboration
  connection_strength DECIMAL(3,2) DEFAULT 0, -- 0-1

  -- Connection Details
  shared_themes TEXT[] DEFAULT '{}',
  shared_projects UUID[] DEFAULT '{}',
  shared_cultural_background TEXT,
  geographic_proximity TEXT,

  -- Metrics
  theme_overlap_count INTEGER DEFAULT 0,
  collaboration_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_storyteller_pair UNIQUE(storyteller_a_id, storyteller_b_id)
);

CREATE INDEX idx_org_network_org ON organization_storyteller_network(organization_id);
CREATE INDEX idx_org_network_storyteller_a ON organization_storyteller_network(storyteller_a_id);
CREATE INDEX idx_org_network_storyteller_b ON organization_storyteller_network(storyteller_b_id);
CREATE INDEX idx_org_network_strength ON organization_storyteller_network(connection_strength DESC);
```

## API Endpoints for Organization Impact

### 1. Organization Dashboard API

```typescript
// GET /api/organizations/[id]/impact-dashboard
interface OrganizationImpactDashboard {
  organization: {
    id: string
    name: string
    tier: string
    member_count: number
  }

  metrics: {
    storytellers: {
      total: number
      active: number
      elders: number
      featured: number
    }
    content: {
      total_transcripts: number
      analyzed_transcripts: number
      analysis_progress: number // percentage
      total_stories: number
      published_stories: number
    }
    themes: {
      total_unique_themes: number
      primary_themes: Array<{
        theme: string
        count: number
        category: string
      }>
      cultural_themes: string[]
      theme_diversity_score: number
    }
    quotes: {
      total: number
      high_impact: number
      featured: Array<{
        text: string
        storyteller: string
        themes: string[]
        impact_score: number
      }>
    }
    impact_scores: {
      overall: number
      cultural_preservation: number
      community_engagement: number
      knowledge_transmission: number
    }
  }

  insights: Array<{
    type: string
    title: string
    description: string
    confidence: number
    supporting_data: any
  }>

  network: {
    connection_density: number
    key_connections: Array<{
      storyteller_a: string
      storyteller_b: string
      connection_strength: number
      shared_themes: string[]
    }>
  }

  last_updated: string
}
```

**Implementation**:

```typescript
// File: src/app/api/organizations/[id]/impact-dashboard/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params
  const supabase = createSupabaseServerClient()

  // 1. Get organization basic info
  const { data: org } = await supabase
    .from('organisations')
    .select('id, name, tier, tenant_id')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // 2. Get storytellers for this org
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      profile:profiles(
        id,
        display_name,
        is_elder,
        is_featured,
        is_storyteller
      )
    `)
    .eq('organization_id', organizationId)

  const storytellers = members
    ?.filter(m => m.profile?.is_storyteller)
    .map(m => m.profile) || []

  const storytellerIds = storytellers.map(s => s.id)

  // 3. Get transcripts for these storytellers
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, themes, key_quotes, ai_summary, ai_processing_status')
    .in('storyteller_id', storytellerIds)

  const analyzedTranscripts = transcripts?.filter(t =>
    t.themes && t.themes.length > 0
  ) || []

  // 4. Get stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, status, themes, cultural_tags')
    .in('storyteller_id', storytellerIds)

  // 5. Extract all themes across transcripts
  const allThemes = transcripts?.flatMap(t => t.themes || []) || []
  const themeCounts = allThemes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedThemes = Object.entries(themeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([theme, count]) => ({
      theme,
      count,
      category: categorizeTheme(theme)
    }))

  // 6. Extract all quotes with impact scores
  const allQuotes = transcripts?.flatMap(t =>
    (t.key_quotes || []).map((quote: string) => ({
      text: quote,
      storyteller_id: t.storyteller_id,
      themes: t.themes || []
    }))
  ) || []

  // 7. Get or calculate organization impact metrics
  const { data: impactMetrics } = await supabase
    .from('organization_impact_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  // 8. Get cross-transcript insights
  const { data: insights } = await supabase
    .from('organization_cross_transcript_insights')
    .select('*')
    .eq('organization_id', organizationId)
    .order('confidence_score', { ascending: false })
    .limit(5)

  return NextResponse.json({
    organization: {
      id: org.id,
      name: org.name,
      tier: org.tier,
      member_count: members?.length || 0
    },
    metrics: {
      storytellers: {
        total: storytellers.length,
        active: storytellers.filter(s => s.is_active).length,
        elders: storytellers.filter(s => s.is_elder).length,
        featured: storytellers.filter(s => s.is_featured).length
      },
      content: {
        total_transcripts: transcripts?.length || 0,
        analyzed_transcripts: analyzedTranscripts.length,
        analysis_progress: transcripts?.length
          ? (analyzedTranscripts.length / transcripts.length) * 100
          : 0,
        total_stories: stories?.length || 0,
        published_stories: stories?.filter(s => s.status === 'published').length || 0
      },
      themes: {
        total_unique_themes: Object.keys(themeCounts).length,
        primary_themes: sortedThemes,
        cultural_themes: sortedThemes
          .filter(t => t.category === 'cultural')
          .map(t => t.theme),
        theme_diversity_score: calculateThemeDiversity(themeCounts)
      },
      quotes: {
        total: allQuotes.length,
        high_impact: allQuotes.filter(q => q.impact_score > 0.7).length,
        featured: allQuotes.slice(0, 10)
      },
      impact_scores: impactMetrics || {
        overall: 0,
        cultural_preservation: 0,
        community_engagement: 0,
        knowledge_transmission: 0
      }
    },
    insights: insights || [],
    last_updated: new Date().toISOString()
  })
}

// Helper function to categorize themes
function categorizeTheme(theme: string): string {
  const THEME_CATEGORIES = {
    cultural: ['identity', 'heritage', 'tradition', 'language', 'ceremony'],
    family: ['kinship', 'elders', 'children', 'ancestors', 'community'],
    land: ['country', 'connection', 'seasons', 'wildlife', 'sacred-sites'],
    resilience: ['survival', 'adaptation', 'strength', 'healing', 'hope'],
    knowledge: ['wisdom', 'teaching', 'learning', 'stories', 'dreams']
  }

  for (const [category, keywords] of Object.entries(THEME_CATEGORIES)) {
    if (keywords.some(keyword => theme.toLowerCase().includes(keyword))) {
      return category
    }
  }

  return 'other'
}

// Calculate theme diversity (Shannon entropy)
function calculateThemeDiversity(themeCounts: Record<string, number>): number {
  const total = Object.values(themeCounts).reduce((a, b) => a + b, 0)
  const probabilities = Object.values(themeCounts).map(count => count / total)

  const entropy = -probabilities.reduce((sum, p) => {
    return sum + (p > 0 ? p * Math.log2(p) : 0)
  }, 0)

  // Normalize to 0-1 scale
  const maxEntropy = Math.log2(Object.keys(themeCounts).length)
  return maxEntropy > 0 ? entropy / maxEntropy : 0
}
```

### 2. Theme Analytics API

```typescript
// GET /api/organizations/[id]/theme-analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') // filter by category
  const timeframe = searchParams.get('timeframe') // last_30_days, last_90_days, all_time

  const supabase = createSupabaseServerClient()

  // Get theme analytics for this organization
  let query = supabase
    .from('organization_theme_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('total_occurrences', { ascending: false })

  if (category) {
    query = query.eq('theme_category', category)
  }

  const { data: themes } = await query

  return NextResponse.json({
    themes: themes || [],
    categories: {
      cultural: themes?.filter(t => t.theme_category === 'cultural').length || 0,
      family: themes?.filter(t => t.theme_category === 'family').length || 0,
      land: themes?.filter(t => t.theme_category === 'land').length || 0,
      resilience: themes?.filter(t => t.theme_category === 'resilience').length || 0,
      knowledge: themes?.filter(t => t.theme_category === 'knowledge').length || 0
    }
  })
}
```

### 3. Storyteller Network API

```typescript
// GET /api/organizations/[id]/storyteller-network
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params
  const supabase = createSupabaseServerClient()

  // Get storyteller network connections
  const { data: connections } = await supabase
    .from('organization_storyteller_network')
    .select(`
      *,
      storyteller_a:profiles!storyteller_a_id(id, display_name),
      storyteller_b:profiles!storyteller_b_id(id, display_name)
    `)
    .eq('organization_id', organizationId)
    .gte('connection_strength', 0.3) // Only show meaningful connections
    .order('connection_strength', { ascending: false })

  // Calculate network metrics
  const storytellers = new Set<string>()
  connections?.forEach(c => {
    storytellers.add(c.storyteller_a_id)
    storytellers.add(c.storyteller_b_id)
  })

  const maxConnections = (storytellers.size * (storytellers.size - 1)) / 2
  const density = maxConnections > 0
    ? (connections?.length || 0) / maxConnections
    : 0

  return NextResponse.json({
    network: {
      nodes: Array.from(storytellers),
      edges: connections || [],
      metrics: {
        total_storytellers: storytellers.size,
        total_connections: connections?.length || 0,
        network_density: density,
        average_connection_strength: connections?.length
          ? connections.reduce((sum, c) => sum + c.connection_strength, 0) / connections.length
          : 0
      }
    }
  })
}
```

### 4. Impact Report Generation API

```typescript
// POST /api/organizations/[id]/generate-impact-report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params
  const body = await request.json()
  const {
    format = 'pdf', // pdf, docx, html
    include_quotes = true,
    include_network_graph = true,
    timeframe = 'all_time'
  } = body

  // Fetch complete impact dashboard data
  const dashboardResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/organizations/${organizationId}/impact-dashboard`
  )
  const dashboard = await dashboardResponse.json()

  // Generate report using template
  const report = await generateImpactReport({
    organization: dashboard.organization,
    metrics: dashboard.metrics,
    insights: dashboard.insights,
    format,
    options: {
      include_quotes,
      include_network_graph,
      timeframe
    }
  })

  return new NextResponse(report.buffer, {
    headers: {
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="impact-report-${organizationId}-${Date.now()}.${format}"`
    }
  })
}
```

## React Components for Organization Impact

### Organization Impact Dashboard

```tsx
// File: src/components/organization/OrganizationImpactDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeChart } from '@/components/analytics/theme-chart'
import { NetworkGraph } from '@/components/analytics/network-graph'
import { QuoteCarousel } from '@/components/analytics/quote-carousel'

interface OrganizationImpactDashboardProps {
  organizationId: string
}

export function OrganizationImpactDashboard({
  organizationId
}: OrganizationImpactDashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/organizations/${organizationId}/impact-dashboard`)
      .then(res => res.json())
      .then(data => {
        setDashboard(data)
        setLoading(false)
      })
  }, [organizationId])

  if (loading) return <div>Loading impact dashboard...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{dashboard.organization.name}</h1>
        <p className="text-muted-foreground">Impact Dashboard</p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Storytellers"
          value={dashboard.metrics.storytellers.total}
          subtitle={`${dashboard.metrics.storytellers.active} active`}
          icon="users"
        />
        <MetricCard
          title="Transcripts Analyzed"
          value={dashboard.metrics.content.analyzed_transcripts}
          subtitle={`${dashboard.metrics.content.analysis_progress.toFixed(0)}% complete`}
          icon="file-text"
        />
        <MetricCard
          title="Unique Themes"
          value={dashboard.metrics.themes.total_unique_themes}
          subtitle={`${(dashboard.metrics.themes.theme_diversity_score * 100).toFixed(0)}% diversity`}
          icon="tag"
        />
        <MetricCard
          title="Impact Score"
          value={dashboard.metrics.impact_scores.overall.toFixed(1)}
          subtitle="Overall"
          icon="trending-up"
        />
      </div>

      {/* Primary Themes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Primary Themes</h2>
        <ThemeChart
          themes={dashboard.metrics.themes.primary_themes}
          showCategory
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {dashboard.metrics.themes.primary_themes.map((theme: any) => (
            <Badge
              key={theme.theme}
              variant={getThemeVariant(theme.category)}
            >
              {theme.theme} ({theme.count})
            </Badge>
          ))}
        </div>
      </Card>

      {/* Powerful Quotes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Powerful Quotes</h2>
        <QuoteCarousel quotes={dashboard.metrics.quotes.featured} />
      </Card>

      {/* Cross-Transcript Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="space-y-4">
          {dashboard.insights.map((insight: any) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </Card>

      {/* Storyteller Network */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Storyteller Network</h2>
        <NetworkGraph organizationId={organizationId} />
      </Card>
    </div>
  )
}
```

## Analytics Calculation Functions

### Calculate Organization Impact Metrics

```typescript
// File: src/lib/analytics/organization-impact.ts
import { createSupabaseServiceClient } from '@/lib/supabase/service-role-client'

export async function calculateOrganizationImpactMetrics(organizationId: string) {
  const supabase = createSupabaseServiceClient()

  // 1. Get all storytellers for this organization
  const { data: members } = await supabase
    .from('organization_members')
    .select('profile_id')
    .eq('organization_id', organizationId)

  const storytellerIds = members?.map(m => m.profile_id) || []

  // 2. Get storyteller details
  const { data: storytellers } = await supabase
    .from('profiles')
    .select('*')
    .in('id', storytellerIds)
    .eq('is_storyteller', true)

  // 3. Get transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('*')
    .in('storyteller_id', storytellerIds)

  const analyzedTranscripts = transcripts?.filter(t => t.themes?.length > 0) || []

  // 4. Get stories
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .in('storyteller_id', storytellerIds)

  // 5. Calculate metrics
  const metrics = {
    organization_id: organizationId,
    tenant_id: storytellers?.[0]?.tenant_id,

    // Storyteller metrics
    total_storytellers: storytellers?.length || 0,
    active_storytellers: storytellers?.filter(s => s.status === 'active').length || 0,
    featured_storytellers: storytellers?.filter(s => s.is_featured).length || 0,
    elder_storytellers: storytellers?.filter(s => s.is_elder).length || 0,

    // Content metrics
    total_transcripts: transcripts?.length || 0,
    analyzed_transcripts: analyzedTranscripts.length,
    total_stories: stories?.length || 0,
    published_stories: stories?.filter(s => s.status === 'published').length || 0,

    // Theme analysis
    primary_themes: extractTopThemes(analyzedTranscripts, 10),
    cultural_themes: extractCulturalThemes(analyzedTranscripts),
    theme_diversity_score: calculateThemeDiversity(analyzedTranscripts),

    // Quote analysis
    total_quotes: analyzedTranscripts.reduce((sum, t) => sum + (t.key_quotes?.length || 0), 0),
    high_impact_quotes: extractHighImpactQuotes(analyzedTranscripts),

    // Impact scores
    overall_impact_score: calculateOverallImpact(storytellers, transcripts, stories),
    cultural_preservation_score: calculateCulturalPreservationScore(analyzedTranscripts),
    community_engagement_score: calculateCommunityEngagement(stories),
    knowledge_transmission_score: calculateKnowledgeTransmission(analyzedTranscripts),

    last_calculated_at: new Date().toISOString()
  }

  // 6. Upsert metrics
  await supabase
    .from('organization_impact_metrics')
    .upsert(metrics, { onConflict: 'organization_id' })

  return metrics
}
```

## Migration File for New Tables

```sql
-- File: supabase/migrations/20251224000001_organization_impact_analytics.sql

-- Organization Impact Metrics Table
CREATE TABLE organization_impact_metrics (
  -- [Full table definition from above]
);

-- Organization Theme Analytics Table
CREATE TABLE organization_theme_analytics (
  -- [Full table definition from above]
);

-- Organization Cross-Transcript Insights Table
CREATE TABLE organization_cross_transcript_insights (
  -- [Full table definition from above]
);

-- Organization Storyteller Network Table
CREATE TABLE organization_storyteller_network (
  -- [Full table definition from above]
);

-- Row Level Security Policies
ALTER TABLE organization_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_theme_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_cross_transcript_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_storyteller_network ENABLE ROW LEVEL SECURITY;

-- Policies: Organization members can read their org's data
CREATE POLICY "Organization members can view impact metrics"
  ON organization_impact_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

## Summary

This system provides organizations with:

1. **Comprehensive Impact Dashboard** - Real-time metrics on storytellers, content, themes, and quotes
2. **Theme Analytics** - Track theme evolution, diversity, and cultural relevance over time
3. **Cross-Transcript Insights** - AI-generated insights from analyzing all transcripts together
4. **Storyteller Network Graph** - Visualize connections between storytellers based on shared themes
5. **Impact Scoring** - Quantifiable metrics for cultural preservation, engagement, and knowledge transmission
6. **Report Generation** - Automated PDF/Word reports for funders and stakeholders

All leveraging the existing AI analysis infrastructure and database relationships.

**Next Steps**:
1. Create migration file for new tables
2. Implement API endpoints
3. Build React dashboard components
4. Activate transcript analysis on all 251 transcripts
5. Calculate initial metrics for all organizations
