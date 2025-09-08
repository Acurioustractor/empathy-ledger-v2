'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Calendar, 
  MapPin,
  DollarSign,
  ExternalLink,
  FolderOpen,
  Target,
  Users,
  Building2,
  Activity
} from 'lucide-react'

interface Project {
  id: string
  tenant_id: string
  organization_id: string | null
  name: string
  description: string | null
  location: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ProjectsCollectionProps {
  projects: Project[]
  organizationId: string
}

export function ProjectsCollection({ projects, organizationId }: ProjectsCollectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredProjects = projects.filter(project => {
    const name = project.name || ''
    const description = project.description || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const statuses = [
    'all',
    ...new Set(projects.map(p => p.status).filter(Boolean))
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'completed': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'paused': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Projects</h2>
          <p className="text-muted-foreground">
            {projects.length} projects supporting your community
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          {projects.length} Projects
        </Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {project.name}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getStatusColor(project.status)}>
                      <Activity className="h-3 w-3 mr-1" />
                      {project.status}
                    </Badge>
                    
                    {!project.organization_id && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Community
                      </Badge>
                    )}
                    
                    {project.organization_id && (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        Org
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
              )}
              
              <div className="space-y-2">
                {project.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Started {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {project.budget && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>{formatCurrency(project.budget)} budget</span>
                  </div>
                )}
                
                {project.start_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {project.end_date ? 
                        `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}` :
                        `Started ${new Date(project.start_date).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/projects/${project.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            {projects.length === 0 
              ? "No projects have been created for this organization yet."
              : "Try adjusting your search criteria or filters."
            }
          </p>
        </div>
      )}
    </div>
  )
}