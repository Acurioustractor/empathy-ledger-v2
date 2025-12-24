'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, X, Check, Edit2, Briefcase } from 'lucide-react'

interface Organization {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface StorytellerRelationship {
  organization_id: string
  organization_name: string
  role: 'storyteller' | 'member'
}

interface ProjectRelationship {
  project_id: string
  project_name: string
  role: string
}

interface OrganizationApiResponse {
  id: string
  name: string
  type?: string
  status?: string
  description?: string
}

interface ProjectApiResponse {
  id: string
  name: string
  description?: string
  status?: string
  organizationId?: string
}

interface StorytellerRelationshipManagerProps {
  storytellerId: string
  currentOrganizations: StorytellerRelationship[]
  currentProjects: ProjectRelationship[]
  onUpdate: (type: 'organisation' | 'project', relationships: StorytellerRelationship[] | ProjectRelationship[]) => void
  type: 'organisation' | 'project'
  compact?: boolean
}

export function StorytellerRelationshipManager({
  storytellerId,
  currentOrganizations,
  currentProjects,
  onUpdate,
  type,
  compact = false
}: StorytellerRelationshipManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [workingOrganizations, setWorkingOrganizations] = useState<StorytellerRelationship[]>(currentOrganizations)
  const [workingProjects, setWorkingProjects] = useState<ProjectRelationship[]>(currentProjects)

  // Dynamic data loaded from APIs
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Load organisations and projects from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch organisations
        const orgsResponse = await fetch('/api/admin/orgs')
        if (orgsResponse.ok) {
          const orgsData: { success: boolean; organisations: OrganizationApiResponse[] } = await orgsResponse.json()
          if (orgsData.success && orgsData.organisations) {
            setAvailableOrganizations(orgsData.organisations.map((org) => ({
              id: org.id,
              name: org.name
            })))
          }
        }

        // Fetch projects
        const projectsResponse = await fetch('/api/admin/projects')
        if (projectsResponse.ok) {
          const projectsData: { projects: ProjectApiResponse[] } = await projectsResponse.json()
          if (projectsData.projects) {
            setAvailableProjects(projectsData.projects.map((project) => ({
              id: project.id,
              name: project.name
            })))
          }
        }
      } catch (error) {
        console.error('Error loading organisations and projects:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Update working state when props change
  useEffect(() => {
    setWorkingOrganizations(currentOrganizations)
    setWorkingProjects(currentProjects)
  }, [currentOrganizations, currentProjects])

  const isOrgType = type === 'organisation'
  const currentData = isOrgType ? currentOrganizations : currentProjects
  const workingData = isOrgType ? workingOrganizations : workingProjects

  const addOrganization = (orgId: string) => {
    const org = availableOrganizations.find(o => o.id === orgId)
    if (org && !workingOrganizations.find(wo => wo.organization_id === orgId)) {
      setWorkingOrganizations([...workingOrganizations, {
        organization_id: orgId,
        organization_name: org.name,
        role: 'storyteller' // Default to storyteller
      }])
    }
  }

  const removeOrganization = (orgId: string) => {
    setWorkingOrganizations(workingOrganizations.filter(wo => wo.organization_id !== orgId))
  }

  const updateOrganizationRole = (orgId: string, role: 'storyteller' | 'member') => {
    setWorkingOrganizations(workingOrganizations.map(wo =>
      wo.organization_id === orgId ? { ...wo, role } : wo
    ))
  }

  const save = () => {
    if (isOrgType) {
      onUpdate('organisation', workingOrganizations)
    } else {
      onUpdate('project', workingProjects)
    }
    setIsEditing(false)
  }

  const cancel = () => {
    setWorkingOrganizations(currentOrganizations)
    setWorkingProjects(currentProjects)
    setIsEditing(false)
  }

  const addProject = (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId)
    if (project && !workingProjects.find(wp => wp.project_id === projectId)) {
      setWorkingProjects([...workingProjects, {
        project_id: projectId,
        project_name: project.name,
        role: 'contributor'
      }])
    }
  }

  const removeProject = (projectId: string) => {
    setWorkingProjects(workingProjects.filter(wp => wp.project_id !== projectId))
  }

  if (isEditing && isOrgType) {
    return (
      <div className="space-y-2 min-w-[250px]">
        <div className="text-sm font-medium">Edit Organizations</div>

        {/* Current organisations */}
        <div className="space-y-1">
          {workingOrganizations.map((rel) => (
            <div key={rel.organization_id} className="flex items-center gap-2 p-2 border rounded">
              <Building2 className="w-3 h-3" />
              <span className="text-sm flex-1">{rel.organization_name}</span>

              {/* Role selector */}
              <Select
                value={rel.role}
                onValueChange={(value: 'storyteller' | 'member') =>
                  updateOrganizationRole(rel.organization_id, value)
                }
              >
                <SelectTrigger className="w-24 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="storyteller">Storyteller</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOrganization(rel.organization_id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new organisation */}
        <Select onValueChange={addOrganization} disabled={isLoadingData}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder={isLoadingData ? "Loading organisations..." : "Add organisation..."} />
          </SelectTrigger>
          <SelectContent>
            {availableOrganizations
              .filter(org => !workingOrganizations.find(wo => wo.organization_id === org.id))
              .map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" onClick={save} className="h-7">
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={cancel} className="h-7">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (isEditing && !isOrgType) {
    return (
      <div className="space-y-2 min-w-[250px]">
        <div className="text-sm font-medium">Edit Projects</div>

        {/* Current projects */}
        <div className="space-y-1">
          {workingProjects.map((rel) => (
            <div key={rel.project_id} className="flex items-center gap-2 p-2 border rounded">
              <span className="text-sm flex-1">{rel.project_name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeProject(rel.project_id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new project */}
        <Select onValueChange={addProject} disabled={isLoadingData}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder={isLoadingData ? "Loading projects..." : "Add project..."} />
          </SelectTrigger>
          <SelectContent>
            {availableProjects
              .filter(project => !workingProjects.find(wp => wp.project_id === project.id))
              .map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" onClick={save} className="h-7">
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={cancel} className="h-7">
            Cancel
          </Button>
        </div>
      </div>
    )
  }


  // Compact display mode - just show the data with inline edit
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {isOrgType ? (
          <>
            {currentOrganizations.length > 0 ? (
              currentOrganizations.slice(0, 1).map((rel) => (
                <Badge
                  key={rel.organization_id}
                  variant={rel.role === 'member' ? 'default' : 'secondary'}
                  className={`text-xs cursor-pointer hover:opacity-80 ${
                    rel.role === 'member'
                      ? 'bg-sage-100 text-sage-800 hover:bg-sage-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {rel.organization_name}
                </Badge>
              ))
            ) : (
              <span
                className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer flex items-center gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Building2 className="w-3 h-3" />
                Independent
              </span>
            )}
            {currentOrganizations.length > 1 && (
              <span className="text-xs text-stone-400">+{currentOrganizations.length - 1}</span>
            )}
          </>
        ) : (
          <>
            {currentProjects && currentProjects.length > 0 ? (
              currentProjects.slice(0, 1).map((rel) => (
                <Badge
                  key={rel.project_id}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-stone-50 border border-sage-300 bg-sage-50"
                  onClick={() => setIsEditing(true)}
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {rel.project_name}
                </Badge>
              ))
            ) : (
              <span
                className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer flex items-center gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Briefcase className="w-3 h-3" />
                No projects
              </span>
            )}
            {currentProjects && currentProjects.length > 1 && (
              <span className="text-xs text-stone-400">+{currentProjects.length - 1}</span>
            )}
          </>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  // Full display mode (unused now)
  return null
}