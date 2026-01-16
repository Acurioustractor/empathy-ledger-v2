'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
  Eye,
  BookOpen,
  FileText,
  Mic
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  location?: string
  startDate?: string
  endDate?: string
  createdAt: string
  organizationId?: string
  tenantId?: string
  organisation?: {
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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
    const filtered = projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.organisation?.name.toLowerCase().includes(searchTerm.toLowerCase())

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
            // Handle edit form submission
            const response = await fetch('/api/admin/projects', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: projectId, ...projectData })
            })
            
            if (response.ok) {
              await fetchProjects()
              setIsEditDialogOpen(false)
              setEditingProject(null)
              console.log('Project updated successfully')
            } else {
              console.error('Failed to update project')
            }
          } else {
            // Open edit dialog
            const project = projects.find(p => p.id === projectId)
            if (project) {
              setEditingProject(project)
              setIsEditDialogOpen(true)
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
              return Promise.resolve()
            } else {
              const errorData = await response.json()
              console.error('Failed to create project:', errorData)
              throw new Error(errorData.error || 'Failed to create project')
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
          <div className="h-8 bg-grey-200 rounded w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-grey-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-grey-900">Project Management</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Manage community projects and initiatives across organisations
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details and settings
              </DialogDescription>
            </DialogHeader>
            {editingProject && (
              <EditProjectForm 
                project={editingProject}
                onSubmit={(data) => handleProjectAction('edit', editingProject.id, data)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search projects by name, description, or organisation..."
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
                    {project.location && (
                      <Badge variant="outline">{project.location}</Badge>
                    )}
                  </div>
                  <CardDescription className="max-w-2xl">
                    {project.description || 'No description provided'}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                    {project.organisation && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {project.organisation.name}
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
    location: '',
    startDate: '',
    endDate: '',
    organizationId: ''
  })
  const [organisations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch organisations for selection
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/admin/orgs')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organisations || [])
        }
      } catch (error) {
        console.error('Error fetching organisations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.organizationId) {
      alert('Please select an organisation')
      return
    }
    
    setSubmitting(true)
    setSuccess(false)
    
    try {
      await onSubmit(formData)
      setSuccess(true)
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        status: 'active',
        location: '',
        startDate: '',
        endDate: '',
        organizationId: ''
      })
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Project created successfully! You can now add storytellers, stories, and media.
          </div>
        </div>
      )}
      
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
      <div>
        <Label htmlFor="organizationId">Organization</Label>
        <Select value={formData.organizationId} onValueChange={(value) => setFormData({ ...formData, organizationId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select an organisation" />
          </SelectTrigger>
          <SelectContent>
            {organisations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name} ({org.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.organizationId === '' && (
          <p className="text-sm text-red-600 mt-1">Organization is required</p>
        )}
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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Calgary, Alberta"
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
        <Button 
          type="submit" 
          disabled={loading || submitting || !formData.organizationId || !formData.name}
          className="min-w-[140px]"
        >
          {submitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </form>
  )
}

// Edit project form component
const EditProjectForm: React.FC<{ project: Project; onSubmit: (data: any) => void }> = ({ project, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'active',
    location: '',
    startDate: project.startDate || '',
    endDate: project.endDate || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Project Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-location">Location</Label>
          <Input
            id="edit-location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Calgary, Alberta"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-startDate">Start Date</Label>
          <Input
            id="edit-startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-endDate">End Date</Label>
          <Input
            id="edit-endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Update Project</Button>
      </div>
    </form>
  )
}

// Project details view component
const ProjectDetailsView: React.FC<{ project: Project }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('overview')
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="storytellers">Storytellers</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
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
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="mt-1">{project.location || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="mt-1 text-sm">{project.description}</div>
                </div>
                {project.organisation && (
                  <div>
                    <Label className="text-sm font-medium">Organization</Label>
                    <div className="mt-1">{project.organisation.name}</div>
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
        </TabsContent>
        
        <TabsContent value="storytellers">
          <ProjectStorytellersTab projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="stories">
          <ProjectStoriesTab projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="transcripts">
          <ProjectTranscriptsTab projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="media">
          <ProjectMediaTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Project storytellers tab component
const ProjectStorytellersTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchStorytellers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
      if (response.ok) {
        const data = await response.json()
        setStorytellers(data.storytellers || [])
      } else {
        console.error('Failed to fetch storytellers')
      }
    } catch (error) {
      console.error('Error fetching storytellers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorytellers()
  }, [projectId])

  const handleAddStoryteller = async (storytellerId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/storytellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storytellerId })
      })

      if (response.ok) {
        await fetchStorytellers()
        setIsAddDialogOpen(false)
        console.log('Storyteller added successfully')
      } else {
        console.error('Failed to add storyteller')
      }
    } catch (error) {
      console.error('Error adding storyteller:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading storytellers...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Storytellers</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Storyteller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Storyteller to Project</DialogTitle>
              <DialogDescription>
                Select storytellers from your organisation to add to this project
              </DialogDescription>
            </DialogHeader>
            <AddStorytellerForm 
              projectId={projectId}
              onAdd={handleAddStoryteller}
              existingStorytellers={storytellers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {storytellers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No storytellers assigned</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Add storytellers to this project to start collecting their stories and media
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Storyteller
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {storytellers.map((storyteller) => (
            <Card key={storyteller.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                    {storyteller.avatar ? (
                      <img src={storyteller.avatar} alt={storyteller.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-stone-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{storyteller.name}</h4>
                      <Badge variant="outline">{storyteller.role}</Badge>
                      {storyteller.isElder && (
                        <Badge variant="secondary">Elder</Badge>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                      {storyteller.bio ? storyteller.bio.substring(0, 100) + '...' : 'No bio available'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                      <span>{storyteller.storyCount} stories</span>
                      {storyteller.culturalBackground && (
                        <span>{storyteller.culturalBackground}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Add storyteller form component
const AddStorytellerForm: React.FC<{
  projectId: string
  onAdd: (storytellerId: string) => void
  existingStorytellers: any[]
}> = ({ projectId, onAdd, existingStorytellers }) => {
  const [availableStorytellers, setAvailableStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStoryteller, setSelectedStoryteller] = useState('')

  useEffect(() => {
    const fetchAvailableStorytellers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          // Filter out already assigned storytellers
          const assignedIds = existingStorytellers.map(s => s.id)
          const available = (data.storytellers || []).filter((s: any) => !assignedIds.includes(s.id))
          setAvailableStorytellers(available)
        }
      } catch (error) {
        console.error('Error fetching available storytellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableStorytellers()
  }, [projectId, existingStorytellers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStoryteller) {
      onAdd(selectedStoryteller)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading available storytellers...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="storyteller">Select Storyteller</Label>
        <Select value={selectedStoryteller} onValueChange={setSelectedStoryteller}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a storyteller to add" />
          </SelectTrigger>
          <SelectContent>
            {availableStorytellers.map((storyteller) => (
              <SelectItem key={storyteller.id} value={storyteller.id}>
                <div className="flex items-center gap-2">
                  <span>{storyteller.name}</span>
                  {storyteller.isElder && (
                    <Badge variant="secondary">Elder</Badge>
                  )}
                  <span className="text-xs text-stone-500">({storyteller.storyCount} stories)</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {availableStorytellers.length === 0 && (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          No additional storytellers available in this organisation.
        </p>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!selectedStoryteller}>
          Add Storyteller
        </Button>
      </div>
    </form>
  )
}

// Project stories tab component
const ProjectStoriesTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<any>(null)
  const [stats, setStats] = useState<any>({})

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/stories`)
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch stories')
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [projectId])

  const handleCreateStory = async (storyData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      })

      if (response.ok) {
        await fetchStories()
        setIsCreateDialogOpen(false)
        console.log('Story created successfully')
      } else {
        const error = await response.json()
        alert(`Failed to create story: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Failed to create story')
    }
  }

  const handleEditStory = async (storyData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: editingStory.id, ...storyData })
      })

      if (response.ok) {
        await fetchStories()
        setIsEditDialogOpen(false)
        setEditingStory(null)
        console.log('Story updated successfully')
      } else {
        console.error('Failed to update story')
      }
    } catch (error) {
      console.error('Error updating story:', error)
    }
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories?storyId=${storyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStories()
        console.log('Story deleted successfully')
      } else {
        console.error('Failed to delete story')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Published</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-700">In Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading stories...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Stories</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Stories created within this project by assigned storytellers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>
              <DialogDescription>
                Create a new story within this project
              </DialogDescription>
            </DialogHeader>
            <CreateStoryForm projectId={projectId} onSubmit={handleCreateStory} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Story</DialogTitle>
              <DialogDescription>
                Update story details and content
              </DialogDescription>
            </DialogHeader>
            {editingStory && (
              <EditStoryForm story={editingStory} onSubmit={handleEditStory} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Story Stats */}
      {stats.totalStories > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStories}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Stories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.elderApproved}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Elder Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.totalWords?.toLocaleString()}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Words</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stories List */}
      {stories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories created yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create stories within this project to organise content by storytellers and themes.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{story.title}</h4>
                      {getStatusBadge(story.status)}
                      {story.culturalSensitivity !== 'standard' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {story.culturalSensitivity}
                        </Badge>
                      )}
                      {story.elderApproved && (
                        <Badge className="bg-green-100 text-green-700">Elder Approved</Badge>
                      )}
                    </div>
                    
                    {story.summary && (
                      <p className="text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                        {story.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      {story.author && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{story.author.name}</span>
                          {story.author.isElder && <Badge variant="secondary">Elder</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{story.wordCount} words</span>
                      </div>
                      <Badge variant="outline">{story.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/stories/${story.id}`} target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingStory(story)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteStory(story.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Create story form component
const CreateStoryForm: React.FC<{
  projectId: string
  onSubmit: (data: any) => void
}> = ({ projectId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    authorId: '',
    category: 'personal',
    type: 'written',
    privacy: 'organisation',
    culturalSensitivity: 'standard',
    requiresElderApproval: false,
    status: 'draft'
  })
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project storytellers
  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          setStorytellers(data.storytellers || [])
        }
      } catch (error) {
        console.error('Error fetching storytellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStorytellers()
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Story Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter story title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="author">Storyteller</Label>
          <Select value={formData.authorId} onValueChange={(value) => setFormData({ ...formData, authorId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select storyteller" />
            </SelectTrigger>
            <SelectContent>
              {storytellers.map((storyteller) => (
                <SelectItem key={storyteller.id} value={storyteller.id}>
                  <div className="flex items-center gap-2">
                    <span>{storyteller.name}</span>
                    {storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select value={formData.culturalSensitivity} onValueChange={(value) => setFormData({ ...formData, culturalSensitivity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="privacy">Privacy Level</Label>
          <Select value={formData.privacy} onValueChange={(value) => setFormData({ ...formData, privacy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organisation">Organization Only</SelectItem>
              <SelectItem value="project">Project Team Only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary (Optional)</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief summary of the story..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="content">Story Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your story here..."
          rows={8}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="elderApproval"
          checked={formData.requiresElderApproval}
          onChange={(e) => setFormData({ ...formData, requiresElderApproval: e.target.checked })}
        />
        <Label htmlFor="elderApproval">Requires Elder Approval</Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="outline" onClick={() => setFormData({ ...formData, status: 'draft' })}>
          Save as Draft
        </Button>
        <Button type="submit" onClick={() => setFormData({ ...formData, status: 'published' })}>
          Publish Story
        </Button>
      </div>
    </form>
  )
}

// Edit story form component
const EditStoryForm: React.FC<{
  story: any
  onSubmit: (data: any) => void
}> = ({ story, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: story.title || '',
    content: story.content || '',
    summary: story.summary || '',
    category: story.category || 'personal',
    privacy: story.privacy || 'organisation',
    culturalSensitivity: story.culturalSensitivity || 'standard',
    requiresElderApproval: story.requiresElderApproval || false,
    status: story.status || 'draft'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="edit-title">Story Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-summary">Summary</Label>
        <Textarea
          id="edit-summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="edit-content">Story Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Update Story</Button>
      </div>
    </form>
  )
}

// Project media tab component
const ProjectMediaTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [media, setMedia] = useState<any[]>([])
  const [galleries, setGalleries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [stats, setStats] = useState<any>({})
  const [selectedGallery, setSelectedGallery] = useState<string>('all')

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/media`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch media')
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleries = async () => {
    try {
      // For now, we'll simulate galleries. Later this could be a separate API
      const galleryData = [
        { id: 'all', name: 'All Media', count: media.length },
        { id: 'photos', name: 'Photos', count: media.filter(m => m.type?.startsWith('image')).length },
        { id: 'videos', name: 'Videos', count: media.filter(m => m.type?.startsWith('video')).length },
        { id: 'documents', name: 'Documents', count: media.filter(m => m.type?.includes('pdf') || m.type?.includes('document')).length }
      ]
      setGalleries(galleryData)
    } catch (error) {
      console.error('Error setting up galleries:', error)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [projectId])

  useEffect(() => {
    fetchGalleries()
  }, [media])

  const handleFileUpload = async (file: File, metadata: any) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', metadata.description || '')
      formData.append('altText', metadata.altText || '')
      formData.append('culturalSensitivity', metadata.culturalSensitivity || 'standard')
      formData.append('privacy', metadata.privacy || 'organisation')

      const response = await fetch(`/api/admin/projects/${projectId}/media`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchMedia()
        setIsUploadDialogOpen(false)
        console.log('Media uploaded successfully')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMedia()
        console.log('Media deleted successfully')
      } else {
        console.error('Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-8">Loading media...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Media & Galleries</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Organize photos, videos, documents, and other media files into galleries
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Create Gallery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Gallery</DialogTitle>
                <DialogDescription>
                  Create a themed gallery to organise your project media
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="galleryName">Gallery Name</Label>
                  <Input id="galleryName" placeholder="e.g. Elder Interviews, Community Events..." />
                </div>
                <div>
                  <Label htmlFor="galleryDescription">Description</Label>
                  <Textarea id="galleryDescription" placeholder="Describe what this gallery contains..." rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>Cancel</Button>
                  <Button>Create Gallery</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Media to Project</DialogTitle>
                <DialogDescription>
                  Upload photos, videos, documents, or other media files to this project
                </DialogDescription>
              </DialogHeader>
              <MediaUploadForm onUpload={handleFileUpload} uploading={uploading} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Media Stats */}
      {stats.totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFiles}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.images}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Videos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.audio}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Audio</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{formatFileSize(stats.totalSize)}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Size</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Filters */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b pb-4">
          {galleries.map((gallery) => (
            <Button
              key={gallery.id}
              variant={selectedGallery === gallery.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGallery(gallery.id)}
              className="flex items-center gap-2"
            >
              {gallery.name}
              <Badge variant="secondary" className="ml-1">
                {gallery.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media uploaded yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Upload photos, videos, documents, and other media files to organise your project content.
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload First Media
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.filter(item => {
            if (selectedGallery === 'all') return true
            if (selectedGallery === 'photos') return item.type?.startsWith('image')
            if (selectedGallery === 'videos') return item.type?.startsWith('video')
            if (selectedGallery === 'documents') return item.type?.includes('pdf') || item.type?.includes('document')
            return true
          }).map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-stone-100 dark:bg-stone-800 relative">
                {item.type?.startsWith('image/') ? (
                  <img 
                    src={item.thumbnail || item.url} 
                    alt={item.altText || item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.type?.startsWith('video/') ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-12 h-12 text-stone-400" />
                    <span className="ml-2 text-stone-600">Video</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-12 h-12 text-stone-400" />
                    <span className="ml-2 text-stone-600">File</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold truncate" title={item.name}>{item.name}</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
                {item.description && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {item.culturalSensitivity}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteMedia(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Media upload form component
const MediaUploadForm: React.FC<{
  onUpload: (file: File, metadata: any) => void
  uploading: boolean
}> = ({ onUpload, uploading }) => {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    description: '',
    altText: '',
    culturalSensitivity: 'standard',
    privacy: 'organisation'
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      onUpload(file, metadata)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label>File</Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colours",
            dragActive ? "border-blue-500 bg-blue-50" : "border-stone-300 hover:border-stone-400",
            file ? "border-green-500 bg-green-50" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.txt"
          />
          {file ? (
            <div>
              <p className="font-semibold text-green-600">{file.name}</p>
              <p className="text-sm text-stone-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <Plus className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p>Drop a file here or click to select</p>
              <p className="text-xs text-stone-500 mt-1">
                Images, videos, audio, PDFs (max 50MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Fields */}
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          placeholder="Describe this media file..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="altText">Alt Text (Optional)</Label>
        <Input
          id="altText"
          value={metadata.altText}
          onChange={(e) => setMetadata({ ...metadata, altText: e.target.value })}
          placeholder="Alternative text for accessibility..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select 
            value={metadata.culturalSensitivity} 
            onValueChange={(value) => setMetadata({ ...metadata, culturalSensitivity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="privacy">Privacy Level</Label>
          <Select 
            value={metadata.privacy} 
            onValueChange={(value) => setMetadata({ ...metadata, privacy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organisation">Organization Only</SelectItem>
              <SelectItem value="project">Project Team Only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </div>
    </form>
  )
}

// Project transcripts tab component
const ProjectTranscriptsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTranscript, setEditingTranscript] = useState<any>(null)
  const [stats, setStats] = useState<any>({})

  const fetchTranscripts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`)
      if (response.ok) {
        const data = await response.json()
        setTranscripts(data.transcripts || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch transcripts')
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranscripts()
  }, [projectId])

  const handleCreateTranscript = async (transcriptData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transcriptData)
      })

      if (response.ok) {
        await fetchTranscripts()
        setIsCreateDialogOpen(false)
        console.log('Transcript created successfully')
      } else {
        const error = await response.json()
        alert(`Failed to create transcript: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating transcript:', error)
      alert('Failed to create transcript')
    }
  }

  const handleEditTranscript = async (transcriptData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId: editingTranscript.id, ...transcriptData })
      })

      if (response.ok) {
        await fetchTranscripts()
        setIsEditDialogOpen(false)
        setEditingTranscript(null)
        console.log('Transcript updated successfully')
      } else {
        console.error('Failed to update transcript')
      }
    } catch (error) {
      console.error('Error updating transcript:', error)
    }
  }

  const handleDeleteTranscript = async (transcriptId: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts?transcriptId=${transcriptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTranscripts()
        console.log('Transcript deleted successfully')
      } else {
        console.error('Failed to delete transcript')
      }
    } catch (error) {
      console.error('Error deleting transcript:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-8">Loading transcripts...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Transcripts</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Audio and video transcripts for storyteller interviews and recordings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Transcript
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Transcript</DialogTitle>
              <DialogDescription>
                Create a new transcript within this project
              </DialogDescription>
            </DialogHeader>
            <CreateTranscriptForm projectId={projectId} onSubmit={handleCreateTranscript} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Transcript</DialogTitle>
              <DialogDescription>
                Update transcript details and content
              </DialogDescription>
            </DialogHeader>
            {editingTranscript && (
              <EditTranscriptForm transcript={editingTranscript} onSubmit={handleEditTranscript} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Transcript Stats */}
      {stats.totalTranscripts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTranscripts}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Transcripts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.elderReviewed}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Elder Reviewed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.floor((stats.totalDuration || 0) / 60)}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Minutes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.totalWords?.toLocaleString()}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Words</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transcripts List */}
      {transcripts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transcripts created yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create transcripts from storyteller interviews, recordings, and other audio/video content.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Transcript
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transcripts.map((transcript) => (
            <Card key={transcript.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{transcript.title}</h4>
                      {getStatusBadge(transcript.status)}
                      {transcript.culturalSensitivity !== 'standard' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {transcript.culturalSensitivity}
                        </Badge>
                      )}
                      {transcript.elderReviewed && (
                        <Badge className="bg-green-100 text-green-700">Elder Reviewed</Badge>
                      )}
                      {transcript.requiresElderReview && !transcript.elderReviewed && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Needs Elder Review
                        </Badge>
                      )}
                    </div>
                    
                    {transcript.content && (
                      <p className="text-stone-600 dark:text-stone-400 mb-3 line-clamp-3">
                        {transcript.content.substring(0, 200)}...
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      {transcript.storyteller && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{transcript.storyteller.name}</span>
                          {transcript.storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{transcript.recordingDate ? new Date(transcript.recordingDate).toLocaleDateString() : new Date(transcript.createdAt).toLocaleDateString()}</span>
                      </div>
                      {transcript.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(transcript.duration)}</span>
                        </div>
                      )}
                      {transcript.wordCount && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{transcript.wordCount} words</span>
                        </div>
                      )}
                      {transcript.confidence && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>{Math.round(transcript.confidence * 100)}% accuracy</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {transcript.audioUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={transcript.audioUrl} target="_blank">
                          <Mic className="w-4 h-4 mr-2" />
                          Audio
                        </a>
                      </Button>
                    )}
                    {transcript.videoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={transcript.videoUrl} target="_blank">
                          <Activity className="w-4 h-4 mr-2" />
                          Video
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingTranscript(transcript)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteTranscript(transcript.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Create transcript form component
const CreateTranscriptForm: React.FC<{
  projectId: string
  onSubmit: (data: any) => void
}> = ({ projectId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    storytellerId: '',
    recordingDate: '',
    duration: '',
    audioUrl: '',
    videoUrl: '',
    videoTitle: '',
    culturalSensitivity: 'standard',
    requiresElderReview: false,
    quality: 'good',
    status: 'completed'
  })
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project storytellers
  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          setStorytellers(data.storytellers || [])
        }
      } catch (error) {
        console.error('Error fetching storytellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStorytellers()
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Transcript Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter transcript title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="storyteller">Storyteller</Label>
          <Select value={formData.storytellerId} onValueChange={(value) => setFormData({ ...formData, storytellerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select storyteller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific storyteller</SelectItem>
              {storytellers.map((storyteller) => (
                <SelectItem key={storyteller.id} value={storyteller.id}>
                  <div className="flex items-center gap-2">
                    <span>{storyteller.name}</span>
                    {storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recordingDate">Recording Date</Label>
          <Input
            id="recordingDate"
            type="date"
            value={formData.recordingDate}
            onChange={(e) => setFormData({ ...formData, recordingDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="Duration in seconds"
          />
        </div>

        <div>
          <Label htmlFor="quality">Quality</Label>
          <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="audioUrl">Audio URL (Optional)</Label>
          <Input
            id="audioUrl"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Video URL (Optional)</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="videoTitle">Video Title (Optional)</Label>
        <Input
          id="videoTitle"
          value={formData.videoTitle}
          onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
          placeholder="Title of the video recording"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select value={formData.culturalSensitivity} onValueChange={(value) => setFormData({ ...formData, culturalSensitivity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Transcript Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Paste or type the transcript content here..."
          rows={8}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="elderReview"
          checked={formData.requiresElderReview}
          onChange={(e) => setFormData({ ...formData, requiresElderReview: e.target.checked })}
        />
        <Label htmlFor="elderReview">Requires Elder Review</Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading || !formData.title}>
          {loading ? 'Loading...' : 'Create Transcript'}
        </Button>
      </div>
    </form>
  )
}

// Edit transcript form component
const EditTranscriptForm: React.FC<{
  transcript: any
  onSubmit: (data: any) => void
}> = ({ transcript, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: transcript.title || '',
    content: transcript.content || '',
    recordingDate: transcript.recordingDate || '',
    duration: transcript.duration ? transcript.duration.toString() : '',
    audioUrl: transcript.audioUrl || '',
    videoUrl: transcript.videoUrl || '',
    videoTitle: transcript.videoTitle || '',
    culturalSensitivity: transcript.culturalSensitivity || 'standard',
    requiresElderReview: transcript.requiresElderReview || false,
    quality: transcript.quality || 'good',
    status: transcript.status || 'completed'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="edit-title">Transcript Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-recordingDate">Recording Date</Label>
          <Input
            id="edit-recordingDate"
            type="date"
            value={formData.recordingDate}
            onChange={(e) => setFormData({ ...formData, recordingDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="edit-duration">Duration (seconds)</Label>
          <Input
            id="edit-duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-quality">Quality</Label>
          <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-audioUrl">Audio URL</Label>
          <Input
            id="edit-audioUrl"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="edit-videoUrl">Video URL</Label>
          <Input
            id="edit-videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-content">Transcript Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Update Transcript</Button>
      </div>
    </form>
  )
}

export default ProjectManagement