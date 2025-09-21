'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  MapPin,
  DollarSign,
  ExternalLink,
  Users,
  Building2,
  Activity,
  Image as ImageIcon,
  ArrowLeft,
  Settings
} from 'lucide-react'

interface ProjectDetailsProps {
  project: any
  relationships: {
    organisations: any[]
    storytellers: any[]
    galleries: any[]
  }
}

export function ProjectDetails({ project, relationships }: ProjectDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'completed': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'paused': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-grey-50 text-grey-700 dark:bg-grey-950 dark:text-grey-300'
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

  const primaryOrg = relationships.organisations.find(org => org.role === 'lead') || relationships.organisations[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        
        {primaryOrg && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/organisations/${primaryOrg.organisation.id}/projects/${project.id}/manage`}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Project
            </Link>
          </Button>
        )}
      </div>

      {/* Project Info */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge className={getStatusColor(project.status)}>
                <Activity className="h-3 w-3 mr-1" />
                {project.status}
              </Badge>
              
              {project.organisation ? (
                <Badge variant="outline">
                  <Building2 className="h-3 w-3 mr-1" />
                  {project.organisation.name}
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  Community Project
                </Badge>
              )}
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground text-lg mb-4">
            {project.description}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {project.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{project.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Started {new Date(project.created_at).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          {project.budget && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{formatCurrency(project.budget)} budget</span>
            </div>
          )}

          {project.created_by_profile && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                Created by {project.created_by_profile.display_name || project.created_by_profile.full_name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizations ({relationships.organisations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.organisations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{org.organisation.name}</div>
                    <div className="text-sm text-muted-foreground">{org.organisation.type}</div>
                  </div>
                  <Badge variant={org.role === 'lead' ? 'default' : 'secondary'}>
                    {org.role}
                  </Badge>
                </div>
              ))}
              
              {relationships.organisations.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No organisations linked
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storytellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Storytellers ({relationships.storytellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.storytellers.map((storyteller) => (
                <div key={storyteller.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={storyteller.storyteller?.profile_image_url || ''} 
                      alt={storyteller.storyteller?.display_name || 'Storyteller'}
                    />
                    <AvatarFallback>
                      {(storyteller.storyteller?.display_name || storyteller.storyteller?.full_name || 'S')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {storyteller.storyteller?.display_name || storyteller.storyteller?.full_name}
                    </div>
                    {storyteller.storyteller?.cultural_background && (
                      <div className="text-xs text-muted-foreground truncate">
                        {storyteller.storyteller.cultural_background}
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={storyteller.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {storyteller.role}
                  </Badge>
                </div>
              ))}
              
              {relationships.storytellers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No storytellers assigned
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Galleries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Galleries ({relationships.galleries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.galleries.map((gallery) => (
                <div key={gallery.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{gallery.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {gallery.photo_count || 0} photos
                  </div>
                  {gallery.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {gallery.description}
                    </div>
                  )}
                </div>
              ))}
              
              {relationships.galleries.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No galleries linked
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}