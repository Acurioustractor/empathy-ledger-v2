'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FolderOpen, Clock, Users, AlertTriangle, CheckCircle, Circle } from 'lucide-react'
import type { ProjectHealth } from '@/lib/services/organization-dashboard.service'

interface ProjectHealthWidgetProps {
  projects: ProjectHealth[]
  organizationId: string
}

export function ProjectHealthWidget({ projects, organizationId }: ProjectHealthWidgetProps) {
  const getStatusBadge = (status: ProjectHealth['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-sage-100 text-sage-700 border-sage-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'on-track':
        return (
          <Badge className="bg-earth-100 text-earth-700 border-earth-200">
            <Circle className="w-3 h-3 mr-1" />
            On Track
          </Badge>
        )
      case 'at-risk':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            At Risk
          </Badge>
        )
      case 'not-started':
        return (
          <Badge className="bg-stone-100 text-stone-600 border-stone-200">
            Not Started
          </Badge>
        )
    }
  }

  const getProgressColor = (status: ProjectHealth['status'], progress: number) => {
    if (status === 'completed') return 'bg-sage-500'
    if (status === 'at-risk') return 'bg-amber-500'
    if (progress >= 75) return 'bg-sage-500'
    if (progress >= 50) return 'bg-earth-500'
    if (progress >= 25) return 'bg-clay-500'
    return 'bg-stone-400'
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-earth-600" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-stone-500">
            <p>No projects yet</p>
            <p className="text-sm mt-1">Create a project to track its health</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-earth-600" />
            Project Health
          </span>
          <a
            href={`/organisations/${organizationId}/projects`}
            className="text-sm font-normal text-earth-600 hover:text-earth-700"
          >
            View all
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.slice(0, 4).map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-3 rounded-lg border border-stone-200 hover:border-earth-300 hover:bg-stone-50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-earth-800 truncate">{project.name}</h4>
                </div>
                {getStatusBadge(project.status)}
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-stone-500 mb-1">
                  <span>{project.storiesCollected} / {project.targetStories || '?'} stories</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(project.status, project.progress)} transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer stats */}
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{project.participantCount} participants</span>
                </div>
                {project.daysUntilDeadline !== null && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {project.daysUntilDeadline > 0
                        ? `${project.daysUntilDeadline} days left`
                        : project.daysUntilDeadline === 0
                        ? 'Due today'
                        : `${Math.abs(project.daysUntilDeadline)} days overdue`}
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
