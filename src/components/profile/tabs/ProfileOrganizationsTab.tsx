'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Building2,
  FolderKanban,
  ExternalLink,
  Plus,
  Eye,
  Users,
  Calendar,
  Crown,
  Shield
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  role: string
  joined_at: string
  is_active: boolean
  logo_url?: string
}

interface Project {
  id: string
  name: string
  organization_name: string
  role: string
  joined_at: string
  is_active: boolean
  status: string
}

interface ProfileOrganizationsTabProps {
  organizations: Organization[]
  projects: Project[]
  onViewOrganization: (id: string) => void
  onViewProject: (id: string) => void
}

export function ProfileOrganizationsTab({
  organizations = [],
  projects = [],
  onViewOrganization,
  onViewProject
}: ProfileOrganizationsTabProps) {

  const getRoleBadgeColor = (role: string) => {
    const lowerRole = role?.toLowerCase() || ''
    if (lowerRole.includes('admin') || lowerRole.includes('owner')) {
      return 'bg-clay-100 text-clay-800'
    }
    if (lowerRole.includes('manager') || lowerRole.includes('coordinator')) {
      return 'bg-sage-100 text-sage-800'
    }
    if (lowerRole.includes('member') || lowerRole.includes('contributor')) {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-stone-100 text-stone-800'
  }

  const getRoleIcon = (role: string) => {
    const lowerRole = role?.toLowerCase() || ''
    if (lowerRole.includes('admin') || lowerRole.includes('owner')) {
      return <Crown className="w-3 h-3" />
    }
    if (lowerRole.includes('manager') || lowerRole.includes('coordinator')) {
      return <Shield className="w-3 h-3" />
    }
    return <Users className="w-3 h-3" />
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900">Organizations & Projects</h3>
        <p className="text-sm text-stone-600 mt-1">
          Your memberships and collaborations across the platform
        </p>
      </div>

      {/* Privacy Notice */}
      <Alert className="bg-sage-50 border-sage-200">
        <Eye className="w-4 h-4 text-sage-600" />
        <AlertDescription className="text-sm text-stone-700">
          <strong>Visibility:</strong> Organization and project memberships are visible to other
          members of those organizations. Use the Privacy tab to control general profile visibility.
        </AlertDescription>
      </Alert>

      {/* Organizations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-earth-600" />
            Organizations
          </h4>
          <Badge variant="outline">{organizations.length}</Badge>
        </div>

        {organizations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Building2 className="w-12 h-12 text-stone-300 mb-3" />
              <p className="text-stone-500 text-center">
                You're not a member of any organizations yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className={!org.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-earth-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-earth-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{org.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(org.role)}>
                            {getRoleIcon(org.role)}
                            <span className="ml-1">{org.role}</span>
                          </Badge>
                          {!org.is_active && (
                            <Badge variant="outline" className="text-stone-600">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewOrganization(org.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {formatDate(org.joined_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sage-600" />
            Projects
          </h4>
          <Badge variant="outline">{projects.length}</Badge>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FolderKanban className="w-12 h-12 text-stone-300 mb-3" />
              <p className="text-stone-500 text-center">
                You're not part of any projects yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className={!project.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-sage-100 flex items-center justify-center">
                        <FolderKanban className="w-6 h-6 text-sage-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {project.organization_name}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getRoleBadgeColor(project.role)}>
                            {getRoleIcon(project.role)}
                            <span className="ml-1">{project.role}</span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              project.status === 'active'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-stone-50 text-stone-600'
                            }
                          >
                            {project.status}
                          </Badge>
                          {!project.is_active && (
                            <Badge variant="outline" className="text-stone-600">
                              Left Project
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewProject(project.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {formatDate(project.joined_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-clay-50 border-clay-200">
        <CardContent className="p-4 text-sm text-stone-700 space-y-2">
          <p>
            <strong>How it works:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Organizations invite you to join and assign you roles</li>
            <li>Projects are created within organizations</li>
            <li>Your role determines your permissions within each organization/project</li>
            <li>You can be part of multiple organizations and projects simultaneously</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
