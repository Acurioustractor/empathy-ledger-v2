'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BookOpen,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  themes: string[]
  stories_count: number
  is_active: boolean
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // In production, this would come from auth context
  const appId = 'act-place-001'

  useEffect(() => {
    fetchProjects()
  }, [appId])

  async function fetchProjects() {
    setLoading(true)
    try {
      const response = await fetch(`/api/partner/projects?app_id=${appId}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/partner/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          name: newProjectName,
          description: newProjectDescription
        })
      })

      if (response.ok) {
        setCreateDialogOpen(false)
        setNewProjectName('')
        setNewProjectDescription('')
        fetchProjects()
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  function copyEmbedCode(project: Project) {
    const code = `<div data-empathy-stories="true" data-project="${project.slug}" data-layout="grid"></div>
<script src="https://empathyledger.com/embed/stories.js"></script>`
    navigator.clipboard.writeText(code)
  }

  // Mock data if no real projects
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Climate Justice Stories',
      slug: 'climate-justice',
      description: 'Stories from communities affected by climate change',
      themes: ['climate', 'justice', 'community'],
      stories_count: 12,
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Community Voices',
      slug: 'community-voices',
      description: 'Local stories of resilience and hope',
      themes: ['community', 'resilience', 'hope'],
      stories_count: 8,
      is_active: true,
      created_at: '2024-01-10'
    },
    {
      id: '3',
      name: 'First Nations Perspectives',
      slug: 'first-nations',
      description: 'Indigenous stories and cultural narratives',
      themes: ['culture', 'tradition', 'identity'],
      stories_count: 15,
      is_active: true,
      created_at: '2024-01-05'
    }
  ]

  const displayProjects = projects.length > 0 ? projects : mockProjects
  const filteredProjects = displayProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-sage-600" />
            Projects
          </h1>
          <p className="text-stone-500 mt-1">
            Organize stories into themed collections
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-sage-600 hover:bg-sage-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-sage-100 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-sage-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-xs text-stone-400">/{project.slug}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyEmbedCode(project)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Embed Code
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-stone-600 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {project.themes.slice(0, 3).map((theme) => (
                    <Badge key={theme} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <BookOpen className="h-4 w-4" />
                    <span>{project.stories_count} stories</span>
                  </div>
                  <Link href={`/portal/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-stone-400">
              <FolderKanban className="h-12 w-12 mb-3 opacity-50" />
              <p>No projects found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first project
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Projects help you organize stories by campaign, theme, or purpose.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Climate Justice Stories"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="What stories will this project feature?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createProject}
              disabled={!newProjectName.trim() || creating}
              className="bg-sage-600 hover:bg-sage-700"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
