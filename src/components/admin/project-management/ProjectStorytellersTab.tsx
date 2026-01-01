'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Users,
  Eye,
  Trash2
} from 'lucide-react'
import { ProjectStorytellersTabProps } from './types'

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
          // Filter out storytellers already in the project
          const existingIds = existingStorytellers.map(s => s.id)
          const available = (data.availableStorytellers || []).filter(
            (s: any) => !existingIds.includes(s.id)
          )
          setAvailableStorytellers(available)
        } else {
          console.error('Failed to fetch available storytellers')
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

export const ProjectStorytellersTab: React.FC<ProjectStorytellersTabProps> = ({ projectId }) => {
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