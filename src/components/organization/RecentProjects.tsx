'use client'

import Link from 'next/link'

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

export function RecentProjects({ projects, organizationId }: RecentProjectsProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Projects</h3>
        <Link
          href={`/organisations/${organizationId}/projects`}
          className="text-sm text-sage-600 hover:text-sage-800"
        >
          View All
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border-b border-stone-100 pb-4 last:border-b-0 last:pb-0">
              <Link
                href={`/projects/${project.id}`}
                className="font-medium text-stone-900 hover:text-sage-600 block"
              >
                {project.name}
              </Link>
              {project.description && (
                <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-stone-500">
                  {new Date(project.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
                {project.location && (
                  <p className="text-sm text-stone-500">{project.location}</p>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-stone-500">
          <p>No recent projects</p>
          <p className="text-sm mt-1">Projects will appear here as they are created</p>
        </div>
      )}
    </div>
  )
}