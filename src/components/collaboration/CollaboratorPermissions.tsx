'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Save, Loader2, Shield } from 'lucide-react'

interface Collaborator {
  id: string
  collaborator: {
    full_name: string
    avatar_url?: string
    email?: string
  }
  role: 'viewer' | 'editor' | 'co-author'
  can_edit: boolean
  can_publish: boolean
}

interface CollaboratorPermissionsProps {
  storyId: string
  collaboratorId: string
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
}

const ROLE_OPTIONS = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view the story but cannot make changes'
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit content but cannot publish'
  },
  {
    value: 'co-author',
    label: 'Co-Author',
    description: 'Full editing and publishing rights'
  }
]

export function CollaboratorPermissions({
  storyId,
  collaboratorId,
  isOpen,
  onClose,
  onUpdated
}: CollaboratorPermissionsProps) {
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null)
  const [role, setRole] = useState<'viewer' | 'editor' | 'co-author'>('editor')
  const [canEdit, setCanEdit] = useState(true)
  const [canPublish, setCanPublish] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCollaborator()
    }
  }, [isOpen, collaboratorId])

  const loadCollaborator = async () => {
    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}`)
      if (!response.ok) throw new Error('Failed to load collaborator')

      const data = await response.json()
      setCollaborator(data.collaborator)
      setRole(data.collaborator.role)
      setCanEdit(data.collaborator.can_edit)
      setCanPublish(data.collaborator.can_publish)
    } catch (error) {
      console.error('Error loading collaborator:', error)
      setError('Failed to load collaborator details')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (newRole: 'viewer' | 'editor' | 'co-author') => {
    setRole(newRole)
    // Auto-set permissions based on role
    switch (newRole) {
      case 'viewer':
        setCanEdit(false)
        setCanPublish(false)
        break
      case 'editor':
        setCanEdit(true)
        setCanPublish(false)
        break
      case 'co-author':
        setCanEdit(true)
        setCanPublish(true)
        break
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          can_edit: canEdit,
          can_publish: canPublish
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update permissions')
      }

      onUpdated()
      onClose()
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#D97757]" />
            <p className="text-sm text-[#2C2C2C]/60">Loading permissions...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!collaborator) {
    return null
  }

  const selectedRoleOption = ROLE_OPTIONS.find(opt => opt.value === role)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl">Edit Permissions</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Collaborator Info */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={collaborator.collaborator.avatar_url} />
                <AvatarFallback className="bg-[#D97757]/10 text-[#D97757]">
                  {getInitials(collaborator.collaborator.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-[#2C2C2C]">
                  {collaborator.collaborator.full_name}
                </h4>
                {collaborator.collaborator.email && (
                  <p className="text-xs text-[#2C2C2C]/60">
                    {collaborator.collaborator.email}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Role */}
          <div className="space-y-2">
            <Label>Collaboration Role</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-[#2C2C2C]/60">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleOption && (
              <p className="text-xs text-[#2C2C2C]/60">
                {selectedRoleOption.description}
              </p>
            )}
          </div>

          {/* Custom Permissions */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2C2C2C]" />
              <Label className="text-sm font-semibold">Permissions</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="can-edit"
                  checked={canEdit}
                  onCheckedChange={(checked) => setCanEdit(!!checked)}
                  disabled={role === 'viewer'}
                />
                <div>
                  <Label htmlFor="can-edit" className="text-sm cursor-pointer">
                    Can edit story content
                  </Label>
                  <p className="text-xs text-[#2C2C2C]/60">
                    Edit text, add media, and make changes to the story
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="can-publish"
                  checked={canPublish}
                  onCheckedChange={(checked) => setCanPublish(!!checked)}
                  disabled={role === 'viewer'}
                />
                <div>
                  <Label htmlFor="can-publish" className="text-sm cursor-pointer">
                    Can publish story
                  </Label>
                  <p className="text-xs text-[#2C2C2C]/60">
                    Publish, unpublish, and schedule the story
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
