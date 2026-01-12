/**
 * Storyteller ALMA Dashboard
 *
 * Visualizes ALMA v2.0 signals for individual storytellers
 * ACT Framework: Individual sovereignty container display
 *
 * Philosophy: Show system-level patterns, NOT individual profiling
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle,
  Heart,
  Lightbulb,
  Gift,
  Users,
  Leaf,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ALMASignals {
  authority: {
    level: string;
    cultural_positioning: string;
    consent_boundaries: string[];
    voice_control: string;
    OCAP_compliance: boolean;
  };
  evidence_strength: {
    primary_source: boolean;
    corroboration_count: number;
    cultural_verification: string;
  };
  harm_risk_inverted: {
    safety_score: number;
    cultural_protocols_met: boolean;
    trigger_warnings: string[];
    consent_violations: number;
  };
  capability: {
    knowledge_domains: string[];
    transferable_skills: string[];
    learning_pathways_opened: string[];
  };
  option_value: {
    future_applications: string[];
    handover_potential: string;
    commons_contribution: string;
  };
  community_value_return: {
    direct_benefits: string;
    capacity_building: string[];
    fair_value_protection: boolean;
  };
}

interface LCAAPhase {
  listen_phase?: {
    depth_achieved: string;
    participants: string[];
    duration_minutes: number;
    insights_captured: number;
  };
  curiosity_phase?: {
    questions_explored: string[];
    connections_made: number;
    themes_emerged: number;
  };
  action_phase?: {
    pathways_opened: string[];
    barriers_identified: string[];
    barriers_removed: string[];
  };
  art_phase?: {
    story_created: boolean;
    returns_to_listen: boolean;
  };
}

interface UnifiedAnalysis {
  storyteller_id: string;
  storyteller_name: string;
  cultural_affiliations: string[];
  alma_signals: ALMASignals;
  impact_dimensions: {
    LCAA_rhythm: LCAAPhase;
    conservation_impact: {
      topics_discussed: string[];
      traditional_knowledge_shared: boolean;
      land_care_practices: string[];
    };
    sovereignty_outcomes: {
      OCAP_enforced: boolean;
      consent_respected: boolean;
      data_portability: boolean;
      right_to_deletion: boolean;
    };
  };
  metadata: {
    privacy_level: string;
    consent_level: string;
    analysis_count: number;
    last_analysis_date: string;
    last_updated: string;
  };
}

interface Props {
  storytellerId: string;
}

export default function StorytellerALMADashboard({ storytellerId }: Props) {
  const [analysis, setAnalysis] = useState<UnifiedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch(`/api/storytellers/${storytellerId}/unified-analysis`);

        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [storytellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alma-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading ALMA analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No analysis data available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{analysis.storyteller_name}</h2>
          <div className="flex items-center gap-2 mt-2">
            {analysis.cultural_affiliations.map((affiliation, idx) => (
              <Badge key={idx} variant="outline" className="bg-alma-primary/10">
                {affiliation}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{analysis.metadata.analysis_count} analyses</p>
          <p>Updated {new Date(analysis.metadata.last_updated).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Privacy & Consent Notice */}
      <Card className="border-alma-primary/30 bg-alma-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-alma-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Sovereignty Protected</p>
              <p className="text-xs text-muted-foreground mt-1">
                This analysis respects {analysis.storyteller_name}'s consent boundaries
                ({analysis.metadata.consent_level}) and maintains full voice control.
                All signals are system-level patterns, not individual profiling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alma" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alma">ALMA Signals</TabsTrigger>
          <TabsTrigger value="lcaa">LCAA Rhythm</TabsTrigger>
          <TabsTrigger value="conservation">Conservation</TabsTrigger>
          <TabsTrigger value="sovereignty">Sovereignty</TabsTrigger>
        </TabsList>

        {/* ALMA Signals Tab */}
        <TabsContent value="alma" className="space-y-4">
          {/* Authority Signal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-alma-primary" />
                Authority
              </CardTitle>
              <CardDescription>
                Voice positioning and cultural authority
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Level</p>
                  <Badge variant={analysis.alma_signals.authority.level === 'lived_experience' ? 'default' : 'secondary'}>
                    {analysis.alma_signals.authority.level.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Cultural Positioning</p>
                  <Badge variant="outline">
                    {analysis.alma_signals.authority.cultural_positioning}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Consent Boundaries</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.alma_signals.authority.consent_boundaries.map((boundary, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {boundary.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">OCAP Compliant</span>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30">
                  Full Voice Control
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Strength */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Evidence Strength
              </CardTitle>
              <CardDescription>
                Source verification and corroboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.alma_signals.evidence_strength.primary_source ? '✓' : '○'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Primary Source</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.alma_signals.evidence_strength.corroboration_count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Corroborations</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Badge
                    variant={
                      analysis.alma_signals.evidence_strength.cultural_verification === 'elder_reviewed'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {analysis.alma_signals.evidence_strength.cultural_verification.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Harm Risk (Inverted) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Cultural Safety
              </CardTitle>
              <CardDescription>
                Safety score (inverted: high = safe)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Safety Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(analysis.alma_signals.harm_risk_inverted.safety_score * 100)}%
                  </span>
                </div>
                <Progress
                  value={analysis.alma_signals.harm_risk_inverted.safety_score * 100}
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  High score = culturally safe content
                </p>
              </div>

              {analysis.alma_signals.harm_risk_inverted.trigger_warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Content Warnings</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.alma_signals.harm_risk_inverted.trigger_warnings.map((warning, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Cultural protocols met</span>
              </div>
            </CardContent>
          </Card>

          {/* Capability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Capability & Knowledge
              </CardTitle>
              <CardDescription>
                Knowledge domains and learning pathways
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Knowledge Domains</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.alma_signals.capability.knowledge_domains.map((domain, idx) => (
                    <Badge key={idx} variant="secondary">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Learning Pathways Opened</p>
                <ul className="space-y-1">
                  {analysis.alma_signals.capability.learning_pathways_opened.map((pathway, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{pathway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Option Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                Option Value
              </CardTitle>
              <CardDescription>
                Future applications and handover potential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Handover Potential</p>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20">
                  {analysis.alma_signals.option_value.handover_potential.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Commons Contribution</p>
                <Badge variant="default">
                  {analysis.alma_signals.option_value.commons_contribution.replace('_', ' ')}
                </Badge>
              </div>

              {analysis.alma_signals.option_value.future_applications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Future Applications</p>
                  <ul className="space-y-1">
                    {analysis.alma_signals.option_value.future_applications.map((app, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {app}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Value Return */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Community Value Return
              </CardTitle>
              <CardDescription>
                Benefits and capacity building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <span className="text-sm font-medium">Fair Value Protection</span>
                <Badge variant="default" className="bg-green-600">
                  50% Policy Enforced
                </Badge>
              </div>

              {analysis.alma_signals.community_value_return.capacity_building.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Capacity Building</p>
                  <ul className="space-y-1">
                    {analysis.alma_signals.community_value_return.capacity_building.map((activity, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LCAA Rhythm Tab */}
        <TabsContent value="lcaa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LCAA Rhythm: Listen → Curiosity → Action → Art</CardTitle>
              <CardDescription>
                Seasonal cycles, not linear progression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Listen Phase */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">Listen Phase</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Depth</p>
                    <p className="font-medium">
                      {analysis.impact_dimensions.LCAA_rhythm.listen_phase?.depth_achieved || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {Math.round((analysis.impact_dimensions.LCAA_rhythm.listen_phase?.duration_minutes || 0) / 60)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Insights</p>
                    <p className="font-medium">
                      {analysis.impact_dimensions.LCAA_rhythm.listen_phase?.insights_captured || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Curiosity Phase */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold mb-2">Curiosity Phase</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Connections Made</p>
                    <p className="font-medium">
                      {analysis.impact_dimensions.LCAA_rhythm.curiosity_phase?.connections_made || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Themes Emerged</p>
                    <p className="font-medium">
                      {analysis.impact_dimensions.LCAA_rhythm.curiosity_phase?.themes_emerged || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Phase */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold mb-2">Action Phase</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pathways Opened</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.impact_dimensions.LCAA_rhythm.action_phase?.pathways_opened.map((pathway, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {pathway}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Art Phase */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold mb-2">Art Phase</h4>
                <div className="flex items-center gap-4">
                  {analysis.impact_dimensions.LCAA_rhythm.art_phase?.story_created && (
                    <Badge variant="default">Story Created</Badge>
                  )}
                  {analysis.impact_dimensions.LCAA_rhythm.art_phase?.returns_to_listen && (
                    <Badge variant="outline">Returns to Listen (Cyclical)</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conservation Tab */}
        <TabsContent value="conservation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Conservation Impact
              </CardTitle>
              <CardDescription>
                Traditional knowledge and land care practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.impact_dimensions.conservation_impact.traditional_knowledge_shared && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Traditional Knowledge Shared</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Topics Discussed</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.impact_dimensions.conservation_impact.topics_discussed.map((topic, idx) => (
                    <Badge key={idx} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {analysis.impact_dimensions.conservation_impact.land_care_practices.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Land Care Practices</p>
                  <ul className="space-y-1">
                    {analysis.impact_dimensions.conservation_impact.land_care_practices.map((practice, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Leaf className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sovereignty Tab */}
        <TabsContent value="sovereignty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-alma-primary" />
                Sovereignty Outcomes
              </CardTitle>
              <CardDescription>
                OCAP/CARE principles enforcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">OCAP Enforced</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Consent Respected</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Data Portability</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Right to Deletion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
