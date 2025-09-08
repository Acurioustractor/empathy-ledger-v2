'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FolderOpen, 
  ExternalLink, 
  Calendar,
  ArrowRight,
  Activity,
  MapPin,
  Building2,
  Users
} from 'lucide-react'

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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-300'
      case 'completed': return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300'
      case 'paused': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Recent Projects
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href={`/organizations/${organizationId}/projects`}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Link 
                    href={`/projects/${project.id}`}
                    className="font-medium hover:underline line-clamp-2 block"
                  >
                    {project.name}
                  </Link>
                  
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      <Activity className="h-3 w-3 mr-1" />
                      {project.status}
                    </Badge>
                    
                    {!project.organization_id && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Community Project
                      </Badge>
                    )}
                    
                    {project.organization_id && (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        Organization Project
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/projects/${project.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent projects</p>
            <p className="text-sm">Projects will appear here as they are created</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}