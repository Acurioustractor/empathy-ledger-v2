/**
 * Beautiful Obsolescence Dashboard
 *
 * Tracks handover readiness across all projects
 * ACT Framework: Design for transfer, not perpetual dependency
 *
 * Philosophy: "The goal is to become unnecessary"
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HandHeart,
  TrendingDown,
  BookOpen,
  Users,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProjectHandoverReadiness {
  project_id: string;
  project_name: string;
  project_age_months: number;
  handover_readiness: {
    documentation_complete: number;
    dependency_reduced: number;
    stepping_back_timeline: string;
    community_capacity_built: boolean;
    handover_plan_exists: boolean;
    knowledge_transferred: boolean;
  };
  readiness_score: number;
  recommendation: string;
  storyteller_count: number;
  last_updated: string;
}

interface Props {
  organizationId?: string;
}

export default function BeautifulObsolescenceDashboard({ organizationId }: Props) {
  const [projects, setProjects] = useState<ProjectHandoverReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch all project impact analyses
        const response = await fetch(
          `/api/analytics/beautiful-obsolescence${organizationId ? `?organization_id=${organizationId}` : ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Beautiful Obsolescence data');
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading Beautiful Obsolescence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall metrics
  const totalProjects = projects.length;
  const avgReadiness = projects.reduce((sum, p) => sum + p.readiness_score, 0) / (totalProjects || 1);
  const readyForHandover = projects.filter(p => p.readiness_score >= 0.80).length;
  const avgDependencyReduction = projects.reduce(
    (sum, p) => sum + p.handover_readiness.dependency_reduced,
    0
  ) / (totalProjects || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Beautiful Obsolescence</h2>
        <p className="text-muted-foreground mt-2">
          "The goal is to become unnecessary" - Tracking handover readiness across projects
        </p>
      </div>

      {/* Philosophy Card */}
      <Card className="border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <HandHeart className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">ACT Philosophy</p>
              <p className="text-xs text-muted-foreground mt-1">
                We design for transfer, not perpetual dependency. Beautiful Obsolescence means building
                community capacity so they can continue the work without us. Success = becoming unnecessary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Tracked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {readyForHandover} ready for handover
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Readiness</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgReadiness * 100)}%</div>
            <Progress value={avgReadiness * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependency Reduction</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDependencyReduction * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Lower dependency on external support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Built</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.handover_readiness.community_capacity_built).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects with capacity built
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Project Handover Readiness</h3>

        {projects.map((project) => (
          <Card key={project.project_id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.project_name}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.project_age_months} months old
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.storyteller_count} storytellers
                    </span>
                  </CardDescription>
                </div>
                <ReadinessBadge score={project.readiness_score} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Overall Readiness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Readiness</span>
                  <span className="text-sm font-bold">{Math.round(project.readiness_score * 100)}%</span>
                </div>
                <Progress value={project.readiness_score * 100} className="h-2" />
              </div>

              {/* Readiness Components */}
              <div className="grid grid-cols-2 gap-3">
                <ReadinessMetric
                  label="Documentation"
                  value={project.handover_readiness.documentation_complete}
                  icon={BookOpen}
                />
                <ReadinessMetric
                  label="Dependency Reduced"
                  value={project.handover_readiness.dependency_reduced}
                  icon={TrendingDown}
                />
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2">
                {project.handover_readiness.community_capacity_built && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Capacity Built
                  </Badge>
                )}
                {project.handover_readiness.knowledge_transferred && (
                  <Badge variant="default" className="bg-blue-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Knowledge Transferred
                  </Badge>
                )}
                {project.handover_readiness.handover_plan_exists && (
                  <Badge variant="default" className="bg-purple-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Plan Exists
                  </Badge>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Stepping Back Timeline:</span>{' '}
                  {project.handover_readiness.stepping_back_timeline.replace('_', ' ')}
                </span>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <p className="text-sm">
                  <span className="font-medium text-purple-900 dark:text-purple-100">Recommendation:</span>{' '}
                  <span className="text-purple-700 dark:text-purple-300">{project.recommendation}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No project data available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Run the rollup scripts to populate Beautiful Obsolescence tracking
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Philosophy Footer */}
      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <blockquote className="border-l-4 border-purple-600 pl-4 italic text-muted-foreground">
            "Beautiful Obsolescence is the art of building capacity in others so thoroughly that
            our continued presence becomes optional. It's not about abandonment—it's about
            successful transfer of knowledge, skills, and ownership to the community."
            <footer className="text-xs mt-2 not-italic">— ACT Framework, A Curious Tractor</footer>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  );
}

function ReadinessBadge({ score }: { score: number }) {
  const percentage = Math.round(score * 100);

  if (score >= 0.80) {
    return (
      <Badge className="bg-green-600 hover:bg-green-700">
        {percentage}% Ready
      </Badge>
    );
  } else if (score >= 0.60) {
    return (
      <Badge className="bg-yellow-600 hover:bg-yellow-700">
        {percentage}% Approaching
      </Badge>
    );
  } else if (score >= 0.40) {
    return (
      <Badge className="bg-blue-600 hover:bg-blue-700">
        {percentage}% Building
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline">
        {percentage}% Early
      </Badge>
    );
  }
}

function ReadinessMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress value={value * 100} className="h-1.5" />
        </div>
        <span className="text-xs font-medium">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}
