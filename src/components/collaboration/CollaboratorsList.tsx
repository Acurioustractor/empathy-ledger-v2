'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, UserPlus, MoreVertical, Edit, Trash2, Mail, CheckCircle, Clock, Loader2 } from 'lucide-react'

interface Collaborator {
  id: string
  collaborator_id: string
  collaborator: {
    id: string
    full_name: string
    avatar_url?: string
    email?: string
  }
  role: 'viewer' | 'editor' | 'co-author'
  can_edit: boolean
  can_publish: boolean
  invited_by: {
    full_name: string
  }
  status: 'pending' | 'accepted' | 'declined'
  invited_at: string
  accepted_at?: string
}

interface CollaboratorsListProps {
  storyId: string
  isOwner: boolean
  onInvite?: () => void
  onEditPermissions?: (collaboratorId: string) => void
  onRemove?: (collaboratorId: string) => void
}

export function CollaboratorsList({
  storyId,
  isOwner,
  onInvite,
  onEditPermissions,
  onRemove
}: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollaborators()
  }, [storyId])

  const loadCollaborators = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/collaborators`)
      if (!response.ok) throw new Error('Failed to load collaborators')
      const data = await response.json()
      setCollaborators(data.collaborators || [])
    } catch (error) {
      console.error('Error loading collaborators:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'co-author': return 'bg-[#D97757] text-white'
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'co-author': return 'Co-Author'
      case 'editor': return 'Editor'
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />
      case 'declined': return null
      default: return null
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
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#D97757]" />
        <p className="text-sm text-[#2C2C2C]/60">Loading collaborators...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#2C2C2C]" />
          <h3 className="font-serif text-xl font-bold">Collaborators</h3>
          <Badge variant="secondary">{collaborators.length}</Badge>
        </div>
        {isOwner && onInvite && (
          <Button onClick={onInvite} className="bg-[#D97757] hover:bg-[#D97757]/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Collaborator
          </Button>
        )}
      </div>

      {/* Collaborators List */}
      {collaborators.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed">
          <Users className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/40" />
          <p className="text-[#2C2C2C]/60 mb-4">
            No collaborators yet. Invite others to work together!
          </p>
          {isOwner && onInvite && (
            <Button onClick={onInvite} className="bg-[#D97757] hover:bg-[#D97757]/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Your First Collaborator
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <Card key={collaborator.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={collaborator.collaborator.avatar_url} />
                  <AvatarFallback className="bg-[#D97757]/10 text-[#D97757]">
                    {getInitials(collaborator.collaborator.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#2C2C2C] truncate">
                      {collaborator.collaborator.full_name}
                    </h4>
                    {getStatusIcon(collaborator.status)}
                  </div>
                  {collaborator.collaborator.email && (
                    <div className="flex items-center gap-1 text-xs text-[#2C2C2C]/60">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{collaborator.collaborator.email}</span>
                    </div>
                  )}
                  {collaborator.status === 'pending' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Invitation pending since {new Date(collaborator.invited_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Role & Permissions */}
                <div className="text-right">
                  <Badge className={getRoleColor(collaborator.role)}>
                    {getRoleLabel(collaborator.role)}
                  </Badge>
                  <div className="flex gap-1 mt-2">
                    {collaborator.can_edit && (
                      <Badge variant="outline" className="text-xs">Edit</Badge>
                    )}
                    {collaborator.can_publish && (
                      <Badge variant="outline" className="text-xs">Publish</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditPermissions?.(collaborator.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onRemove?.(collaborator.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Collaborator
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
