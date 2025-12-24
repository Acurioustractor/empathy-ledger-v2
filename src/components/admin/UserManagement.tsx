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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Shield, 
  Crown, 
  Heart, 
  Building2,
  Mail,
  Calendar,
  MapPin,
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  Trash2,
  Settings
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  culturalBackground?: string
  location?: string
  joinedAt: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  roles: ('user' | 'storyteller' | 'elder' | 'moderator' | 'admin' | 'super_admin')[]
  organisation?: {
    id: string
    name: string
  }
  stats: {
    storiesShared: number
    storiesRead: number
    communityEngagement: number
  }
  verificationStatus: {
    email: boolean
    identity: boolean
    cultural: boolean
  }
  flags: {
    count: number
    reasons: string[]
  }
}

interface UserManagementProps {
  adminLevel: 'super_admin' | 'tenant_admin' | 'content_moderator'
  tenantId?: string
}

const UserManagement: React.FC<UserManagementProps> = ({ adminLevel, tenantId }) => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUser, setEditingUser] = useState<Partial<User>>({})

  // Fetch real user data
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error('Failed to fetch users:', data.error)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Mock data disabled - using real API data now

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.culturalBackground?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === 'all' || user.roles.includes(filterRole as any)
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus

      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterRole, filterStatus])

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin')) {
      return <Badge variant="destructive" className="gap-1"><Crown className="w-3 h-3" />Super Admin</Badge>
    } else if (roles.includes('admin')) {
      return <Badge variant="secondary" className="gap-1"><Shield className="w-3 h-3" />Admin</Badge>
    } else if (roles.includes('elder')) {
      return <Badge variant="sage-soft" className="gap-1"><Heart className="w-3 h-3" />Elder</Badge>
    } else if (roles.includes('moderator')) {
      return <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" />Moderator</Badge>
    } else if (roles.includes('storyteller')) {
      return <Badge variant="clay-soft" className="gap-1"><Users className="w-3 h-3" />Storyteller</Badge>
    }
    return <Badge variant="outline">User</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
      case 'inactive':
        return <Badge variant="outline" className="text-stone-600 border-grey-600">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (firstName?: string, lastName?: string, displayName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`
    } else if (displayName) {
      const names = displayName.split(' ')
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0]
    } else if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      // Refresh users list
      await fetchUsers()
      setIsEditMode(false)
      setIsUserDialogOpen(false)
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user changes. Please try again.')
    }
  }

  const handleUserAction = async (action: string, userId: string) => {
    try {
      let endpoint = ''
      let method = 'PATCH'
      let body: any = {}

      switch (action) {
        case 'suspend':
          endpoint = `/api/admin/users/${userId}/status`
          body = { status: 'suspended' }
          break
        case 'activate':
          endpoint = `/api/admin/users/${userId}/status`
          body = { status: 'active' }
          break
        case 'delete':
          if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
          }
          endpoint = `/api/admin/users/${userId}`
          method = 'DELETE'
          break
        case 'edit':
        case 'settings':
          // Enable edit mode for the currently selected user
          setIsEditMode(true)
          if (selectedUser) {
            setEditingUser({ ...selectedUser })
          }
          return
        default:
          console.log(`Unknown action: ${action} for user: ${userId}`)
          return
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }

      // Refresh users list
      await fetchUsers()
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      alert(`Failed to ${action} user. Please try again.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search users by name, email, or cultural background..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="storyteller">Storyteller</SelectItem>
              <SelectItem value="elder">Elder</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" aria-label="Filter users">
            <Filter className="w-4 h-4" />
          </Button>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Loading users...</div>
              <div className="text-muted-foreground">Please wait while we fetch user data</div>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <div className="text-lg font-medium mb-2">No users found</div>
              <div className="text-muted-foreground">Try adjusting your search or filters</div>
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-clay-100 text-clay-700 dark:bg-clay-800 dark:text-clay-300">
                      {getInitials(user.firstName, user.lastName, user.displayName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            {user.displayName || `${user.firstName} ${user.lastName}`}
                          </h3>
                          {getRoleBadge(user.roles)}
                          {getStatusBadge(user.status)}
                          {user.flags.count > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {user.flags.count} Flag{user.flags.count > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.culturalBackground && (
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {user.culturalBackground}
                            </div>
                          )}
                          {user.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Stories Shared</p>
                        <p className="font-semibold">{user.stats.storiesShared}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Stories Read</p>
                        <p className="font-semibold">{user.stats.storiesRead}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Engagement</p>
                        <p className="font-semibold">{user.stats.communityEngagement}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Last Active</p>
                        <p className="font-semibold">{new Date(user.lastActive).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {user.organisation && (
                      <div className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <Building2 className="w-3 h-3" />
                        {user.organisation.name}
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <span>Verified:</span>
                        {user.verificationStatus.email && <Badge variant="outline" className="text-green-600 border-green-600 px-1 py-0 text-xs">Email</Badge>}
                        {user.verificationStatus.identity && <Badge variant="outline" className="text-green-600 border-green-600 px-1 py-0 text-xs">Identity</Badge>}
                        {user.verificationStatus.cultural && <Badge variant="outline" className="text-green-600 border-green-600 px-1 py-0 text-xs">Cultural</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <Dialog open={isUserDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                    setIsUserDialogOpen(open)
                    if (!open) {
                      setSelectedUser(null)
                      setIsEditMode(false)
                      setEditingUser({})
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>User Details: {selectedUser?.displayName}</DialogTitle>
                        <DialogDescription>
                          Comprehensive user information and management options
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* User Information */}
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Profile Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Display Name</Label>
                                  {isEditMode ? (
                                    <Input
                                      value={editingUser.displayName || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                                      className="mt-1"
                                    />
                                  ) : (
                                    <p className="text-sm">{selectedUser.displayName}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  {isEditMode ? (
                                    <Input
                                      value={editingUser.email || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                      className="mt-1"
                                    />
                                  ) : (
                                    <p className="text-sm">{selectedUser.email}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Cultural Background</Label>
                                  {isEditMode ? (
                                    <Input
                                      value={editingUser.culturalBackground || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, culturalBackground: e.target.value })}
                                      className="mt-1"
                                      placeholder="Not specified"
                                    />
                                  ) : (
                                    <p className="text-sm">{selectedUser.culturalBackground || 'Not specified'}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Location</Label>
                                  {isEditMode ? (
                                    <Input
                                      value={editingUser.location || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                                      className="mt-1"
                                      placeholder="Not specified"
                                    />
                                  ) : (
                                    <p className="text-sm">{selectedUser.location || 'Not specified'}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Member Since</Label>
                                  <p className="text-sm">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Admin Actions */}
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Admin Actions</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {!isEditMode ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleUserAction('edit', selectedUser.id)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Profile
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleUserAction('suspend', selectedUser.id)}>
                                      <UserX className="w-4 h-4 mr-2" />
                                      {selectedUser.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleUserAction('activate', selectedUser.id)}>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleUserAction('settings', selectedUser.id)}>
                                      <Settings className="w-4 h-4 mr-2" />
                                      Settings
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={handleSaveUser}>
                                      Save Changes
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                                
                                {adminLevel === 'super_admin' && (
                                  <div className="pt-4 border-t">
                                    <Button variant="destructive" size="sm" onClick={() => handleUserAction('delete', selectedUser.id)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Flags and Issues */}
                            {selectedUser.flags.count > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg text-red-600">Flags & Issues</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedUser.flags.reasons.map((reason, index) => (
                                      <div key={index} className="text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded border-l-4 border-red-500">
                                        {reason}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user)
                      setIsUserDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedUser(user)
                          setIsUserDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('suspend', user.id)}>
                        <UserX className="w-4 h-4 mr-2" />
                        {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('activate', user.id)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUserAction('settings', user.id)}>
                        <Settings className="w-4 h-4 mr-2" />
                        User Settings
                      </DropdownMenuItem>
                      {adminLevel === 'super_admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('delete', user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default UserManagement