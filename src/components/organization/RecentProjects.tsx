'use client'

import Link from 'next/link'
import { FolderOpen, ArrowRight, MapPin, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  location: string | null
  organization_id: string | null
  created_at: string
}

interface RecentProjectsProps {
  projects: Project[]
  organizationId: string
}

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-sage-100 text-sage-700 border-sage-200'
    case 'completed':
      return 'bg-earth-100 text-earth-700 border-earth-200'
    case 'planning':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'paused':
      return 'bg-stone-100 text-stone-600 border-stone-200'
    default:
      return 'bg-stone-100 text-stone-600 border-stone-200'
  }
}

export function RecentProjects({ projects, organizationId }: RecentProjectsProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-clay-50/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-clay-100 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-clay-600" />
          </div>
          <h3 className="text-body-md font-semibold text-stone-800">Recent Projects</h3>
        </div>
        <Link
          href={`/organisations/${organizationId}/projects`}
          className="text-body-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1.5 transition-colors"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/organisations/${organizationId}/projects/${project.id}/manage`}
                className="block p-3 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-medium text-stone-800 group-hover:text-clay-700 transition-colors line-clamp-1">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="text-body-sm text-stone-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-body-xs text-stone-500">
                          {new Date(project.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      {project.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-body-xs text-stone-500 line-clamp-1">{project.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusStyles(project.status)} text-body-xs capitalize shrink-0`}
                  >
                    {project.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-body-md text-stone-600 font-medium">No recent projects</p>
            <p className="text-body-sm text-stone-500 mt-1">Projects will appear here as they are created</p>
          </div>
        )}
      </div>
    </div>
  )
}