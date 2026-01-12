/**
 * Organization ALMA Dashboard
 *
 * Visualizes ALMA-aligned impact intelligence at the organization level
 * ACT Framework: Aggregate patterns across storytellers, NOT individual profiling
 *
 * Displays:
 * - 6 ALMA Signals radar chart
 * - LCAA Rhythm cycle
 * - Theme aggregation
 * - Beautiful Obsolescence progress
 * - Sovereignty health
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import {
  Shield,
  CheckCircle,
  Heart,
  Lightbulb,
  Gift,
  Users,
  Leaf,
  TrendingUp,
  AlertCircle,
  Ear,
  HelpCircle,
  Zap,
  Palette,
  Building2,
  FileText
} from 'lucide-react';

interface OrganizationImpactData {
  organization: {
    id: string;
    name: string;
    description: string;
    logo_url: string;
  };
  summary: {
    project_count: number;
    storyteller_count: number;
    transcript_count: number;
    analyzed_at: string;
  };
  alma_signals: {
    authority: {
      lived_experience_count: number;
      secondary_count: number;
      lived_experience_centered: boolean;
    };
    evidence_strength: {
      average_score: number;
      rating: string;
    };
    harm_prevention: {
      safety_score: number;
      cultural_protocols_met: boolean;
    };
    capability: {
      pathways_opened: number;
    };
    option_value: {
      handover_readiness: string;
      readiness_percentage: number;
    };
    community_value: {
      fair_value_protection: boolean;
      consent_violations: number;
    };
  };
  lcaa_rhythm: {
    listen: { sessions: number; depth: string };
    curiosity: { themes_emerged: number; connections_made: number };
    action: { insights_captured: number; pathways_opened: number };
    art: { stories_created: number; returns_to_listen: boolean };
  };
  themes: Array<{
    theme: string;
    frequency: number;
    storyteller_count: number;
  }>;
  beautiful_obsolescence: {
    overall_readiness: string;
    readiness_percentage: number;
    projects_with_capacity: number;
    total_projects: number;
    stepping_back_on_track: boolean;
  };
  sovereignty: {
    OCAP_compliance_rate: number;
    CARE_principles_met: boolean;
    consent_violations: number;
    voice_control_maintained: boolean;
  };
  projects: Array<{
    id: string;
    name: string;
    storyteller_count: number;
    transcript_count: number;
    top_themes: string[];
    analyzed_at: string;
  }>;
  top_storytellers: Array<{
    id: string;
    name: string;
    transcript_count: number;
    top_themes: string[];
  }>;
}

interface Props {
  organizationId: string;
}

const THEME_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
];

export default function OrganizationALMADashboard({ organizationId }: Props) {
  const [data, setData] = useState<OrganizationImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/impact-dashboard`);

        if (!response.ok) {
          throw new Error('Failed to fetch impact data');
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
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading ALMA impact intelligence...</p>
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
            Error Loading Impact Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No impact data available'}</p>
          <p className="text-xs mt-2">
            Run the rollup pipeline: <code>npx tsx scripts/rollup-organization-intelligence-v2.ts</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare radar chart data
  const radarData = [
    {
      signal: 'Authority',
      value: data.alma_signals.authority.lived_experience_centered ? 90 : 60,
      fullMark: 100
    },
    {
      signal: 'Evidence',
      value: Math.round(data.alma_signals.evidence_strength.average_score * 100),
      fullMark: 100
    },
    {
      signal: 'Safety',
      value: Math.round(data.alma_signals.harm_prevention.safety_score * 100),
      fullMark: 100
    },
    {
      signal: 'Capability',
      value: Math.min(100, data.alma_signals.capability.pathways_opened * 10),
      fullMark: 100
    },
    {
      signal: 'Option',
      value: data.alma_signals.option_value.readiness_percentage || 50,
      fullMark: 100
    },
    {
      signal: 'Community',
      value: data.alma_signals.community_value.consent_violations === 0 ? 100 : 70,
      fullMark: 100
    }
  ];

  // Theme chart data
  const themeChartData = data.themes.slice(0, 10).map((t, idx) => ({
    name: t.theme.length > 15 ? t.theme.substring(0, 15) + '...' : t.theme,
    frequency: t.frequency,
    color: THEME_COLORS[idx % THEME_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{data.organization.name}</h2>
          <p className="text-muted-foreground mt-1">ALMA-Aligned Impact Intelligence</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-purple-50">
              <Building2 className="h-3 w-3 mr-1" />
              {data.summary.project_count} Projects
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              <Users className="h-3 w-3 mr-1" />
              {data.summary.storyteller_count} Storytellers
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              <FileText className="h-3 w-3 mr-1" />
              {data.summary.transcript_count} Analyses
            </Badge>
          </div>
        </div>
        {data.summary.analyzed_at && (
          <div className="text-right text-sm text-muted-foreground">
            <p>Last analyzed</p>
            <p className="font-medium">{new Date(data.summary.analyzed_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Philosophy Notice */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">ALMA Philosophy: System-Level Patterns</p>
              <p className="text-xs text-muted-foreground mt-1">
                This dashboard shows aggregate patterns across all storytellers.
                Individual analysis is never exposed. All data respects sovereignty and consent.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alma" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alma">ALMA Signals</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="lcaa">LCAA Rhythm</TabsTrigger>
          <TabsTrigger value="obsolescence">Obsolescence</TabsTrigger>
          <TabsTrigger value="sovereignty">Sovereignty</TabsTrigger>
        </TabsList>

        {/* ALMA Signals Tab */}
        <TabsContent value="alma" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6 ALMA Signals</CardTitle>
                <CardDescription>
                  Aggregate impact measurement across all dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="signal"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Radar
                      name="Impact"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Signal Details */}
            <div className="space-y-4">
              {/* Authority */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Authority</span>
                    </div>
                    <Badge variant={data.alma_signals.authority.lived_experience_centered ? 'default' : 'secondary'}>
                      {data.alma_signals.authority.lived_experience_centered ? 'Lived Experience Centered' : 'Building'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Primary sources: {data.alma_signals.authority.lived_experience_count} |
                    Secondary: {data.alma_signals.authority.secondary_count}
                  </p>
                </CardContent>
              </Card>

              {/* Evidence Strength */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Evidence Strength</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(data.alma_signals.evidence_strength.average_score * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={data.alma_signals.evidence_strength.average_score * 100}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>

              {/* Cultural Safety */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Cultural Safety</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(data.alma_signals.harm_prevention.safety_score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    High score = culturally safe content (inverted from harm risk)
                  </p>
                </CardContent>
              </Card>

              {/* Capability */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Capability Pathways</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {data.alma_signals.capability.pathways_opened} Opened
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Option Value */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Handover Readiness</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-50">
                      {data.alma_signals.option_value.readiness_percentage}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Community Value */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Community Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.alma_signals.community_value.consent_violations === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Zero Violations
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Aggregation</CardTitle>
              <CardDescription>
                Most frequent themes across all storytellers (consent-protected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {themeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={themeChartData} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                      {themeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No themes extracted yet. Run analysis pipeline first.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Extracted Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.themes.map((theme, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    style={{ borderColor: THEME_COLORS[idx % THEME_COLORS.length] }}
                  >
                    {theme.theme}
                    <span className="ml-1 text-xs opacity-60">({theme.frequency})</span>
                  </Badge>
                ))}
                {data.themes.length === 0 && (
                  <p className="text-muted-foreground text-sm">No themes available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LCAA Rhythm Tab */}
        <TabsContent value="lcaa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LCAA Rhythm: Seasonal Cycles</CardTitle>
              <CardDescription>
                Listen → Curiosity → Action → Art (cyclical, not linear)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Listen */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Ear className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Listen Phase</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sessions</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.listen.sessions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Depth</p>
                    <Badge variant="outline">{data.lcaa_rhythm.listen.depth}</Badge>
                  </div>
                </div>
              </div>

              {/* Curiosity */}
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold">Curiosity Phase</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Themes Emerged</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.curiosity.themes_emerged}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.curiosity.connections_made}</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold">Action Phase</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Insights Captured</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.action.insights_captured}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pathways Opened</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.action.pathways_opened}</p>
                  </div>
                </div>
              </div>

              {/* Art */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">Art Phase</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stories Created</p>
                    <p className="text-2xl font-bold">{data.lcaa_rhythm.art.stories_created}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cyclical</p>
                    {data.lcaa_rhythm.art.returns_to_listen && (
                      <Badge className="bg-purple-100 text-purple-800">Returns to Listen</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beautiful Obsolescence Tab */}
        <TabsContent value="obsolescence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Beautiful Obsolescence
              </CardTitle>
              <CardDescription>
                Progress toward community self-sufficiency and system handover
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Readiness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Handover Readiness</span>
                  <span className="text-2xl font-bold text-green-600">
                    {data.beautiful_obsolescence.readiness_percentage}%
                  </span>
                </div>
                <Progress
                  value={data.beautiful_obsolescence.readiness_percentage}
                  className="h-4"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Goal: System becomes unnecessary as community capacity grows
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {data.beautiful_obsolescence.overall_readiness}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Projects with Capacity</p>
                  <p className="text-lg font-semibold">
                    {data.beautiful_obsolescence.projects_with_capacity} / {data.beautiful_obsolescence.total_projects}
                  </p>
                </div>
              </div>

              {/* On Track */}
              {data.beautiful_obsolescence.stepping_back_on_track && (
                <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Stepping Back On Track</span>
                </div>
              )}

              {/* Philosophy Note */}
              <Card className="border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm italic text-muted-foreground">
                    "The ultimate success of this system is its own obsolescence -
                    when communities no longer need external tools because they've built
                    their own capacity for storytelling, impact measurement, and knowledge preservation."
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sovereignty Tab */}
        <TabsContent value="sovereignty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Sovereignty Health
              </CardTitle>
              <CardDescription>
                OCAP/CARE principles enforcement and data sovereignty status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* OCAP Compliance */}
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  data.sovereignty.OCAP_compliance_rate >= 1.0 ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    data.sovereignty.OCAP_compliance_rate >= 1.0 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-medium">OCAP Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(data.sovereignty.OCAP_compliance_rate * 100)}%
                    </p>
                  </div>
                </div>

                {/* CARE Principles */}
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  data.sovereignty.CARE_principles_met ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    data.sovereignty.CARE_principles_met ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-medium">CARE Principles</p>
                    <p className="text-sm text-muted-foreground">
                      {data.sovereignty.CARE_principles_met ? 'Met' : 'In Progress'}
                    </p>
                  </div>
                </div>

                {/* Consent Violations */}
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  data.sovereignty.consent_violations === 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {data.sovereignty.consent_violations === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">Consent Violations</p>
                    <p className="text-sm text-muted-foreground">
                      {data.sovereignty.consent_violations}
                    </p>
                  </div>
                </div>

                {/* Voice Control */}
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  data.sovereignty.voice_control_maintained ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${
                    data.sovereignty.voice_control_maintained ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-medium">Voice Control</p>
                    <p className="text-sm text-muted-foreground">
                      {data.sovereignty.voice_control_maintained ? 'Maintained' : 'Reviewing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* OCAP Explanation */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">OCAP Principles</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>O</strong>wnership - Communities own their data</div>
                  <div><strong>C</strong>ontrol - Communities control use</div>
                  <div><strong>A</strong>ccess - Communities decide access</div>
                  <div><strong>P</strong>ossession - Data stays with community</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Summary */}
          {data.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Impact Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.storyteller_count} storytellers | {project.transcript_count} analyses
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {project.top_themes.slice(0, 2).map((theme, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
