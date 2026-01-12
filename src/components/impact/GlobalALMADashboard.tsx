/**
 * Global ALMA Dashboard
 *
 * Platform-wide impact intelligence visualization
 * Shows aggregate patterns across ALL organizations
 *
 * Philosophy: Commons health, cross-cultural patterns, Beautiful Obsolescence at scale
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Globe,
  Building2,
  Users,
  FileText,
  Shield,
  CheckCircle,
  TrendingUp,
  Leaf,
  Heart,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface GlobalImpactData {
  summary: {
    organization_count: number;
    project_count: number;
    storyteller_count: number;
    transcript_count: number;
    analyzed_at: string;
  };
  alma_global: {
    authority: {
      lived_experience_centered: boolean;
      primary_source_count: number;
      secondary_source_count: number;
    };
    harm_prevention: {
      global_score: number;
      cultural_safety: number;
    };
    capability: {
      pathways_worldwide: number;
    };
    community_value: {
      principle: string;
    };
  };
  global_themes: Array<{
    theme: string;
    frequency: number;
    organizations_count: number;
    storyteller_reach: number;
  }>;
  cross_cultural_patterns: Array<{
    pattern: string;
    organizations_count: number;
    commonality: string;
    transferability: string;
  }>;
  regenerative_patterns: any[];
  commons_health: {
    consent_violations_total: number;
    OCAP_compliance_global: number;
    knowledge_shared_freely: boolean;
    no_extractive_patterns: boolean;
    beautiful_obsolescence: {
      organizations_building_capacity: number;
      stepping_back_on_track: boolean;
    };
  };
  organizations: Array<{
    id: string;
    name: string;
    project_count: number;
    storyteller_count: number;
    transcript_count: number;
    top_themes: string[];
  }>;
}

const THEME_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
];

export default function GlobalALMADashboard() {
  const [data, setData] = useState<GlobalImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/impact/global');

        if (!response.ok) {
          throw new Error('Failed to fetch global impact data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading global impact intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Global Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No global data available'}</p>
          <p className="text-xs mt-2">
            Run: <code>npx tsx scripts/rollup-global-intelligence-v2.ts</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Theme chart data
  const themeChartData = data.global_themes.slice(0, 10).map((t, idx) => ({
    name: t.theme.length > 20 ? t.theme.substring(0, 20) + '...' : t.theme,
    frequency: t.frequency,
    organizations: t.organizations_count,
    color: THEME_COLORS[idx % THEME_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">Global ALMA Impact</h1>
          </div>
          <p className="text-muted-foreground mt-1">Platform-wide impact intelligence across all communities</p>
        </div>
        {data.summary.analyzed_at && (
          <div className="text-right text-sm text-muted-foreground">
            <p>Last rollup</p>
            <p className="font-medium">{new Date(data.summary.analyzed_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-3xl font-bold text-purple-600">{data.summary.organization_count}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-3xl font-bold text-blue-600">{data.summary.project_count}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storytellers</p>
                <p className="text-3xl font-bold text-green-600">{data.summary.storyteller_count}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analyses</p>
                <p className="text-3xl font-bold text-orange-600">{data.summary.transcript_count}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Themes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Global Theme Frequency</CardTitle>
            <CardDescription>
              Most common themes across all organizations (consent-protected aggregates)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {themeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={themeChartData} layout="vertical" margin={{ left: 120 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white p-3 shadow-lg rounded-lg border">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Frequency: {item.frequency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Organizations: {item.organizations}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                    {themeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No global themes yet. Run analysis pipeline first.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cross-Cultural Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Cross-Cultural Patterns
            </CardTitle>
            <CardDescription>
              Themes that resonate across multiple organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.cross_cultural_patterns.length > 0 ? (
                data.cross_cultural_patterns.map((pattern, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{pattern.pattern}</p>
                      <p className="text-xs text-muted-foreground">
                        {pattern.organizations_count} organizations
                      </p>
                    </div>
                    <Badge
                      variant={pattern.transferability === 'high' ? 'default' : 'secondary'}
                    >
                      {pattern.transferability} transferability
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No cross-cultural patterns detected yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commons Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Commons Health
            </CardTitle>
            <CardDescription>
              Platform-wide sovereignty and consent status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OCAP Compliance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">OCAP Compliance</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.round(data.commons_health.OCAP_compliance_global * 100)}%
                </span>
              </div>
              <Progress value={data.commons_health.OCAP_compliance_global * 100} className="h-2" />
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                data.commons_health.consent_violations_total === 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <CheckCircle className={`h-4 w-4 ${
                  data.commons_health.consent_violations_total === 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className="text-xs">
                  {data.commons_health.consent_violations_total} Violations
                </span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                data.commons_health.knowledge_shared_freely ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <CheckCircle className={`h-4 w-4 ${
                  data.commons_health.knowledge_shared_freely ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <span className="text-xs">Knowledge Shared</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                data.commons_health.no_extractive_patterns ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <Shield className={`h-4 w-4 ${
                  data.commons_health.no_extractive_patterns ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className="text-xs">Non-Extractive</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                data.commons_health.beautiful_obsolescence.stepping_back_on_track ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <Leaf className={`h-4 w-4 ${
                  data.commons_health.beautiful_obsolescence.stepping_back_on_track ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <span className="text-xs">Stepping Back</span>
              </div>
            </div>

            {/* Beautiful Obsolescence */}
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Beautiful Obsolescence</p>
              <p className="text-xs text-green-600 mt-1">
                {data.commons_health.beautiful_obsolescence.organizations_building_capacity} organizations
                building community capacity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Impact Overview</CardTitle>
          <CardDescription>
            All organizations with ALMA impact intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.organizations.map((org) => (
              <Link
                key={org.id}
                href={`/organisations/${org.id}/impact`}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {org.project_count} projects | {org.storyteller_count} storytellers | {org.transcript_count} analyses
                  </p>
                  {org.top_themes.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {org.top_themes.map((theme, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
            {data.organizations.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No organizations with impact data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Philosophy Note */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Platform Philosophy: Anti-Extractive Commons</p>
              <p className="text-xs text-muted-foreground mt-1">
                This global view shows patterns that can be shared to benefit all communities.
                Individual storyteller data is never exposed. Cross-cultural patterns emerge
                only when themes appear across multiple organizations, representing shared
                human experiences that transcend organizational boundaries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
