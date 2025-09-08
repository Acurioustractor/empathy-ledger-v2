'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Users, 
  BarChart3, 
  Calendar,
  Building2,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  type: string
  startDate?: string
  endDate?: string
  createdAt: string
  organizationId?: string
  tenantId?: string
  organization?: {
    id: string
    name: string
    type: string
  }
  tenant?: {
    id: string
    name: string
    status: string
  }
  storyCount: number
  participantCount: number
  engagementRate: number
}

interface ProjectManagementProps {
  adminLevel: 'super_admin' | 'tenant_admin'
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ adminLevel }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      if (filterStatus !== 'all') searchParams.set('status', filterStatus)
      
      const response = await fetch(`/api/admin/projects?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
      setFilteredProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setProjects([])
      setFilteredProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [filterStatus])

  // Filter projects
  useEffect(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || project.status === filterStatus

      return matchesSearch && matchesStatus
    })

    setFilteredProjects(filtered)
  }, [projects, searchTerm, filterStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Completed</Badge>
      case 'paused':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Paused</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleProjectAction = async (action: string, projectId: string, projectData?: any) => {
    try {
      switch (action) {
        case 'edit':
          if (projectData) {
            const response = await fetch('/api/admin/projects', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: projectId, ...projectData })
            })
            
            if (response.ok) {
              await fetchProjects()
              console.log('Project updated successfully')
            } else {
              console.error('Failed to update project')
            }
          }
          break
          
        case 'delete':
          if (confirm('Are you sure you want to delete this project?')) {
            const response = await fetch(`/api/admin/projects?id=${projectId}`, {
              method: 'DELETE'
            })
            
            if (response.ok) {
              await fetchProjects()
              console.log('Project deleted successfully')
            } else {
              console.error('Failed to delete project')
            }
          }
          break
          
        case 'create':
          if (projectData) {
            const response = await fetch('/api/admin/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(projectData)
            })
            
            if (response.ok) {
              await fetchProjects()
              setIsCreateDialogOpen(false)
              console.log('Project created successfully')
            } else {
              console.error('Failed to create project')
            }
          }
          break
          
        default:
          console.log(`Action: ${action} for project: ${projectId}`)
      }
    } catch (error) {
      console.error(`Error performing ${action} on project:`, error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Manage community projects and initiatives across organizations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to track community initiatives and stories
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm onSubmit={(data) => handleProjectAction('create', '', data)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search projects by name, description, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                    {project.type && (
                      <Badge variant="outline">{project.type}</Badge>
                    )}
                  </div>
                  <CardDescription className="max-w-2xl">
                    {project.description || 'No description provided'}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                    {project.organization && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {project.organization.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Started: {formatDate(project.startDate)}
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ends: {formatDate(project.endDate)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog open={isProjectDialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                    setIsProjectDialogOpen(open)
                    if (!open) setSelectedProject(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <FolderOpen className="w-5 h-5" />
                          {selectedProject?.name} - Project Details
                        </DialogTitle>
                        <DialogDescription>
                          Comprehensive project information and metrics
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedProject && (
                        <ProjectDetailsView project={selectedProject} />
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleProjectAction('edit', project.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  {adminLevel === 'super_admin' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleProjectAction('delete', project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{project.storyCount}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{project.participantCount}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{project.engagementRate}%</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {project.startDate ? Math.floor((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Try adjusting your search terms or filters to find projects.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Simple create project form component
const CreateProjectForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    type: 'general',
    startDate: '',
    endDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g. community, health, education"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Create Project</Button>
      </div>
    </form>
  )
}

// Project details view component
const ProjectDetailsView: React.FC<{ project: Project }> = ({ project }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <div className="mt-1">{project.status}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Type</Label>
            <div className="mt-1">{project.type}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <div className="mt-1 text-sm">{project.description}</div>
          </div>
          {project.organization && (
            <div>
              <Label className="text-sm font-medium">Organization</Label>
              <div className="mt-1">{project.organization.name}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Start Date</Label>
            <div className="mt-1">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">End Date</Label>
            <div className="mt-1">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Created</Label>
            <div className="mt-1">{new Date(project.createdAt).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export default ProjectManagement