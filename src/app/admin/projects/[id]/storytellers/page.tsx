'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  ChevronLeft,
  Calendar,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

interface Storyteller {
  id: string
  display_name: string
  name: string
  bio: string
  avatar?: string
  avatar_url?: string
  culturalBackground?: string
  isElder: boolean
  elder_status: boolean
  featured: boolean
  status: string
  storyCount: number
  story_count: number
  isAssigned: boolean
  role?: string
  joinedAt?: string
  last_active?: string
}

interface Project {
  id: string
  name: string
  tenantId: string
  organizationId?: string
}

export default function ProjectStorytellersPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStorytellers, setSelectedStorytellers] = useState<string[]>([])
  const [assignLoading, setAssignLoading] = useState(false)

  // Fetch project storytellers data
  const fetchProjectStorytellers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
      if (!response.ok) throw new Error('Failed to fetch project storytellers')

      const data = await response.json()
      setProject(data.project)
      setStorytellers(data.storytellers || [])
    } catch (error) {
      console.error('Error fetching project storytellers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add storytellers to project
  const handleAssignStorytellers = async () => {
    if (selectedStorytellers.length === 0) return

    try {
      setAssignLoading(true)

      for (const storytellerId of selectedStorytellers) {
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storytellerId
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          console.error(`Failed to assign storyteller ${storytellerId}:`, error)
        }
      }

      // Refresh the list
      await fetchProjectStorytellers()
      setShowAddModal(false)
      setSelectedStorytellers([])
    } catch (error) {
      console.error('Error assigning storytellers:', error)
      alert('Failed to assign storytellers. Please try again.')
    } finally {
      setAssignLoading(false)
    }
  }

  // Remove storyteller from project
  const handleRemoveStoryteller = async (storytellerId: string) => {
    if (!confirm('Are you sure you want to remove this storyteller from the project?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/storytellers?storytellerId=${storytellerId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to remove storyteller')

      // Refresh the list
      await fetchProjectStorytellers()
    } catch (error) {
      console.error('Error removing storyteller:', error)
      alert('Failed to remove storyteller. Please try again.')
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProjectStorytellers()
    }
  }, [projectId])

  // Filter storytellers based on search
  const filteredStorytellers = storytellers.filter(s =>
    s.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.culturalBackground?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const assignedStorytellers = filteredStorytellers.filter(s => s.isAssigned)
  const unassignedStorytellers = filteredStorytellers.filter(s => !s.isAssigned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">
              Project Storytellers
            </h1>
            <p className="text-grey-600">
              {project ? `Manage storytellers for: ${project.name}` : 'Loading project...'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Storytellers
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
                <Input
                  placeholder="Search storytellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-grey-600">Total Storytellers</p>
                <p className="text-2xl font-bold">{storytellers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-grey-600">Assigned</p>
                <p className="text-2xl font-bold">{assignedStorytellers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-grey-600">Available</p>
                <p className="text-2xl font-bold">{unassignedStorytellers.length}</p>
              </div>
              <UserX className="h-8 w-8 text-grey-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Storytellers */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Storytellers ({assignedStorytellers.length})</CardTitle>
          <CardDescription>
            Storytellers currently assigned to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading storytellers...</div>
          ) : assignedStorytellers.length === 0 ? (
            <div className="text-center py-8 text-grey-500">
              No storytellers assigned to this project yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedStorytellers.map((storyteller) => (
                <Card key={storyteller.id} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={storyteller.avatar_url} />
                        <AvatarFallback>
                          {storyteller.display_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {storyteller.display_name}
                          </h3>
                          {storyteller.elder_status && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-grey-600 line-clamp-2">
                          {storyteller.bio || 'No bio available'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            {storyteller.role || 'Participant'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStoryteller(storyteller.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Storytellers Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Storytellers to Project</DialogTitle>
            <DialogDescription>
              Select storytellers to add to {project?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                Available Storytellers ({unassignedStorytellers.length})
              </p>

              {unassignedStorytellers.length === 0 ? (
                <p className="text-grey-500 text-center py-8">
                  All storytellers are already assigned to this project.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {unassignedStorytellers.map((storyteller) => (
                    <div
                      key={storyteller.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-grey-50"
                    >
                      <Checkbox
                        checked={selectedStorytellers.includes(storyteller.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStorytellers([...selectedStorytellers, storyteller.id])
                          } else {
                            setSelectedStorytellers(selectedStorytellers.filter(id => id !== storyteller.id))
                          }
                        }}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={storyteller.avatar_url} />
                        <AvatarFallback>
                          {storyteller.display_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{storyteller.display_name}</h4>
                          {storyteller.elder_status && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-grey-600 line-clamp-1">
                          {storyteller.bio || 'No bio available'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {storyteller.story_count} stories
                          </Badge>
                          {storyteller.culturalBackground && (
                            <Badge variant="outline" className="text-xs">
                              {storyteller.culturalBackground}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setSelectedStorytellers([])
              }}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignStorytellers}
              disabled={assignLoading || selectedStorytellers.length === 0}
            >
              {assignLoading
                ? 'Adding...'
                : `Add ${selectedStorytellers.length} Storyteller${selectedStorytellers.length !== 1 ? 's' : ''}`
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}