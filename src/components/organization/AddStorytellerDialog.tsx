'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User, Loader2, UserPlus, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddNewStorytellerForm } from './AddNewStorytellerForm'

interface User {
  id: string
  name: string
  fullName?: string
  displayName?: string
  email?: string
  bio?: string
  avatarUrl?: string
  isStoryteller?: boolean
}

interface AddStorytellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  onAdd: (userId: string, userName: string) => Promise<void>
}

export function AddStorytellerDialog({
  open,
  onOpenChange,
  organizationId,
  onAdd
}: AddStorytellerDialogProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([])
      return
    }

    try {
      setSearching(true)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&excludeOrg=${organizationId}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchUsers(value)
  }

  const handleAddUser = async (user: User) => {
    try {
      setAdding(true)
      setSelectedUserId(user.id)
      await onAdd(user.id, user.name)
      onOpenChange(false)
      setSearchQuery('')
      setUsers([])
      setSelectedUserId(null)
    } catch (error) {
      console.error('Error adding storyteller:', error)
    } finally {
      setAdding(false)
      setSelectedUserId(null)
    }
  }

  const handleNewStorytellerSuccess = async (data: {
    profileId: string
    name: string
    email: string
    requiresInvitation: boolean
  }) => {
    // Call the parent's onAdd handler with the new profile
    await onAdd(data.profileId, data.name)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Storyteller</DialogTitle>
          <DialogDescription>
            Add an existing user or create a new storyteller profile
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'existing' | 'new')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Existing User
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              New Storyteller
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {searching && (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-grey-400" />
                <p className="text-sm text-grey-600 mt-2">Searching...</p>
              </div>
            )}

            {!searching && searchQuery.length >= 2 && users.length === 0 && (
              <div className="text-center py-8">
                <User className="w-8 h-8 mx-auto text-grey-400 mb-2" />
                <p className="text-sm text-grey-600">No users found</p>
                <p className="text-xs text-grey-500 mt-1">
                  Try a different search term
                </p>
              </div>
            )}

            {!searching && users.length > 0 && (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-grey-200 hover:border-earth-400 hover:bg-earth-50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-grey-900 truncate">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-sm text-grey-600 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user)}
                      disabled={adding && selectedUserId === user.id}
                    >
                      {adding && selectedUserId === user.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length < 2 && (
              <div className="text-center py-8 text-grey-500 text-sm">
                Type at least 2 characters to search
              </div>
            )}
          </div>
          </TabsContent>

          <TabsContent value="new" className="py-4">
            <AddNewStorytellerForm
              organizationId={organizationId}
              onSuccess={handleNewStorytellerSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
