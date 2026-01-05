'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { X, UserPlus, Loader2, Mail, Info } from 'lucide-react'

interface InviteCollaboratorProps {
  storyId: string
  isOpen: boolean
  onClose: () => void
  onInvited: () => void
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

export function InviteCollaborator({ storyId, isOpen, onClose, onInvited }: InviteCollaboratorProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor' | 'co-author'>('editor')
  const [canEdit, setCanEdit] = useState(true)
  const [canPublish, setCanPublish] = useState(false)
  const [message, setMessage] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setInviting(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          can_edit: canEdit,
          can_publish: canPublish,
          message: message.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to invite collaborator')
      }

      onInvited()
      handleClose()
    } catch (error: any) {
      console.error('Error inviting collaborator:', error)
      setError(error.message)
    } finally {
      setInviting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('editor')
    setCanEdit(true)
    setCanPublish(false)
    setMessage('')
    setError(null)
    onClose()
  }

  const selectedRoleOption = ROLE_OPTIONS.find(opt => opt.value === role)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl">Invite Collaborator</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Collaborators will receive an email invitation and must accept before they can access the story.
            </AlertDescription>
          </Alert>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@example.com"
                className="pl-10"
              />
            </div>
          </div>

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
            <Label className="text-sm font-semibold">Permissions</Label>
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

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to your invitation..."
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={inviting}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={inviting || !email}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {inviting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
