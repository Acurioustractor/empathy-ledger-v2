/**
 * Project Management Component - Refactored Version
 *
 * Simplified main component that delegates to specialized tab components
 * and reusable primitives for better maintainability.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FolderOpen, Search, Plus, Edit, Trash2, Eye } from 'lucide-react'

// Import types
import { Project, ProjectManagementProps } from './project-management/types'

// Import constants
import {
  STATUS_FILTER_OPTIONS,
  PROJECT_TABS,
  EMPTY_STATE_MESSAGES,
  CONFIRMATION_MESSAGES,
  SUCCESS_MESSAGES
} from './project-management/constants'

// Import utilities
import {
  filterProjectsBySearch,
  filterProjectsByStatus,
  getProjectStats,
  formatDate
} from './project-management/utilities'

// Import API functions
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} from './project-management/api'

// Import primitive components
import {
  StatusBadge,
  StatCard,
  EmptyState,
  ActionButtons,
  LoadingState,
  SectionHeader
} from './project-management/primitives'

// Import tab components
import { ProjectDetailsView } from './project-management/ProjectDetailsView'
import { ProjectStorytellersTab } from './project-management/ProjectStorytellersTab'
import { ProjectStoriesTab } from './project-management/ProjectStoriesTab'
import { ProjectMediaTab } from './project-management/ProjectMediaTab'
import { ProjectTranscriptsTab } from './project-management/ProjectTranscriptsTab'

// Import form components
import { CreateProjectForm } from './project-management/forms/CreateProjectForm'
import { EditProjectForm } from './project-management/forms/EditProjectForm'

/**
 * Main Project Management Component
 */
function ProjectManagement({ adminLevel }: ProjectManagementProps) {
  // State management
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects on mount and when filter changes
  useEffect(() => {
    loadProjects()
  }, [filterStatus])

  // Apply search and filter when projects or filters change
  useEffect(() => {
    let filtered = filterProjectsByStatus(projects, filterStatus)
    filtered = filterProjectsBySearch(filtered, searchTerm)
    setFilteredProjects(filtered)
  }, [projects, searchTerm, filterStatus])

  /**
   * Load projects from API
   */
  async function loadProjects() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjects({ status: filterStatus })
      setProjects(data)
      setFilteredProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      setProjects([])
      setFilteredProjects([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle project creation
   */
  async function handleCreateProject(projectData: any) {
    try {
      await createProject(projectData)
      await loadProjects()
      setIsCreateDialogOpen(false)
      console.log(SUCCESS_MESSAGES.project_created)
    } catch (err) {
      throw err // Let form handle the error
    }
  }

  /**
   * Handle project update
   */
  async function handleUpdateProject(projectId: string, projectData: any) {
    try {
      await updateProject(projectId, projectData)
      await loadProjects()
      setIsEditDialogOpen(false)
      setEditingProject(null)
      console.log(SUCCESS_MESSAGES.project_updated)
    } catch (err) {
      throw err // Let form handle the error
    }
  }

  /**
   * Handle project deletion
   */
  async function handleDeleteProject(projectId: string) {
    if (!confirm(CONFIRMATION_MESSAGES.delete_project)) {
      return
    }

    try {
      await deleteProject(projectId)
      await loadProjects()
      console.log(SUCCESS_MESSAGES.project_deleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  /**
   * Open edit dialog for a project
   */
  function openEditDialog(project: Project) {
    setEditingProject(project)
    setIsEditDialogOpen(true)
  }

  /**
   * Open project details dialog
   */
  function openProjectDetails(project: Project) {
    setSelectedProject(project)
    setIsProjectDialogOpen(true)
  }

  // Loading state
  if (loading && projects.length === 0) {
    return <LoadingState message="Loading projects..." />
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <EmptyState
        title="Error loading projects"
        description={error}
        action={{
          label: 'Try Again',
          onClick: loadProjects
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Project Management"
        description={`Manage all projects across your ${adminLevel === 'super_admin' ? 'platform' : 'organization'}`}
        action={{
          label: 'Create Project',
          onClick: () => setIsCreateDialogOpen(true),
          icon: Plus
        }}
      />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Projects</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={projects.length === 0 ? EMPTY_STATE_MESSAGES.no_projects.title : EMPTY_STATE_MESSAGES.no_filtered_projects.title}
          description={projects.length === 0 ? EMPTY_STATE_MESSAGES.no_projects.description : EMPTY_STATE_MESSAGES.no_filtered_projects.description}
          action={projects.length === 0 ? {
            label: EMPTY_STATE_MESSAGES.no_projects.actionLabel!,
            onClick: () => setIsCreateDialogOpen(true),
            icon: Plus
          } : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project)
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Stories</div>
                      <div className="font-medium">{stats.storyCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Participants</div>
                      <div className="font-medium">{stats.participantCount}</div>
                    </div>
                  </div>

                  {/* Meta info */}
                  {project.organisation && (
                    <div className="text-xs text-muted-foreground">
                      {project.organisation.name}
                    </div>
                  )}
                  {project.startDate && (
                    <div className="text-xs text-muted-foreground">
                      Started: {formatDate(project.startDate)}
                    </div>
                  )}

                  {/* Actions */}
                  <ActionButtons
                    actions={[
                      {
                        label: 'View',
                        onClick: () => openProjectDetails(project),
                        icon: Eye,
                        variant: 'default'
                      },
                      {
                        label: 'Edit',
                        onClick: () => openEditDialog(project),
                        icon: Edit,
                        variant: 'outline'
                      },
                      {
                        label: 'Delete',
                        onClick: () => handleDeleteProject(project.id),
                        icon: Trash2,
                        variant: 'ghost'
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to organize stories and storytellers
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm onSubmit={handleCreateProject} />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <EditProjectForm
              project={editingProject}
              onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>{selectedProject?.description}</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <Tabs defaultValue={PROJECT_TABS.overview.id}>
              <TabsList className="grid w-full grid-cols-6">
                {Object.values(PROJECT_TABS).map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={PROJECT_TABS.overview.id}>
                <ProjectDetailsView project={selectedProject} />
              </TabsContent>

              <TabsContent value={PROJECT_TABS.storytellers.id}>
                <ProjectStorytellersTab projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value={PROJECT_TABS.stories.id}>
                <ProjectStoriesTab projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value={PROJECT_TABS.media.id}>
                <ProjectMediaTab projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value={PROJECT_TABS.transcripts.id}>
                <ProjectTranscriptsTab projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value={PROJECT_TABS.analytics.id}>
                <div className="p-4">
                  <p className="text-muted-foreground">Analytics coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectManagement
