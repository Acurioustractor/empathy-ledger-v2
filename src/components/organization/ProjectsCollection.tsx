'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
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
  Activity,
  FileText,
  UserCheck,
  Plus,
  Loader2
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
  storytellerCount?: number
  transcriptCount?: number
}

export function ProjectsCollection({ projects, organizationId, storytellerCount = 0, transcriptCount = 0 }: ProjectsCollectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    location: '',
    startDate: '',
    endDate: '',
    budget: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      location: '',
      startDate: '',
      endDate: '',
      budget: ''
    })
  }

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      alert('Project name is required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/organisations/${organizationId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          location: formData.location,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          budget: formData.budget ? parseFloat(formData.budget) : null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      // Success - close dialog and refresh
      setIsCreateDialogOpen(false)
      resetForm()
      router.refresh()

    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Projects</h2>
          <p className="text-muted-foreground">
            {projects.length} projects supporting your community
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            {projects.length} Projects
          </Badge>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project for your organization. Projects help organize stories, participants, and activities.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the project's goals and activities..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Project location..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating || !formData.name.trim()}
                >
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                    Started {new Date(project.created_at).toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
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
                        `${new Date(project.start_date).toLocaleDateString('en-US', { 
                          month: 'numeric', day: 'numeric', year: 'numeric' 
                        })} - ${new Date(project.end_date).toLocaleDateString('en-US', { 
                          month: 'numeric', day: 'numeric', year: 'numeric' 
                        })}` :
                        `Started ${new Date(project.start_date).toLocaleDateString('en-US', { 
                          month: 'numeric', day: 'numeric', year: 'numeric' 
                        })}`
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
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/organisations/${organizationId}/projects/${project.id}/manage`}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage
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
              ? "No projects have been created for this organisation yet."
              : "Try adjusting your search criteria or filters."
            }
          </p>
        </div>
      )}
    </div>
  )
}