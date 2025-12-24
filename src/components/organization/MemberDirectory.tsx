'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StorytellerProfileCard, CompactStorytellerCard } from '@/components/ui/storyteller-profile-card'
import {
  Search,
  MapPin,
  Calendar,
  Mail,
  ExternalLink,
  UserCheck,
  Users,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  UserMinus,
  Trash2,
  Briefcase,
  BookOpen,
  Heart,
  Clock,
  Globe
} from 'lucide-react'

interface Profile {
  id: string
  display_name: string | null
  full_name: string | null
  email: string | null
  current_role: string | null
  cultural_background: string | null
  tenant_roles: string[] | null
  skills: string[] | null
  interests: string[] | null
  mentoring_availability: boolean | null
  created_at: string
  profile_image_url: string | null
  avatar_url: string | null
  bio: string | null
  organization_role: string
  joined_at: string
  stories_count: number
  projects: Array<{
    id: string
    name: string
    role: string
  }>
  locations: Array<{
    id: string
    name: string
    city: string | null
    state: string | null
    country: string | null
    is_primary: boolean
  }>
}

interface MemberDirectoryProps {
  members: Profile[]
  organizationId: string
  canManage?: boolean
  isSuperAdmin?: boolean
}

export function MemberDirectory({ members, organizationId, canManage = false, isSuperAdmin = false }: MemberDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [localMembers, setLocalMembers] = useState(members)
  
  // Debug log to see what we're receiving
  useEffect(() => {
    console.log('👥 MemberDirectory received', members.length, 'members')
    console.log('👥 Member names:', members.map(m => m.display_name || m.full_name))
    console.log('👥 Full member data:', members)
    setLocalMembers(members)
  }, [members])
  const [storytellers, setStorytellers] = useState<Profile[]>([])
  const [isStorytellersDialogOpen, setIsStorytellersDialogOpen] = useState(false)
  const [storytellerSearchTerm, setStorytellerSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    display_name: '',
    full_name: '',
    email: '',
    current_role: '',
    cultural_background: ''
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const loadStorytellers = async () => {
    try {
      const response = await fetch('/api/storytellers?limit=100')
      const data = await response.json()
      console.log('📋 Loaded storytellers data:', data.storytellers)
      if (data.storytellers) {
        // Filter out storytellers who are already members
        const currentMemberIds = localMembers.map(m => m.id)
        console.log('👥 Current member IDs:', currentMemberIds)
        console.log('👥 Current member names:', localMembers.map(m => m.display_name || m.full_name))

        const availableStorytellers = data.storytellers
          .filter((s: any) => {
            const isAlreadyMember = currentMemberIds.includes(s.id)
            if ((s.display_name || s.fullName || '').toLowerCase().includes('kristy')) {
              console.log('🔍 Kristy check:', {
                name: s.display_name || s.fullName,
                id: s.id,
                isAlreadyMember,
                willBeFiltered: isAlreadyMember
              })
            }
            return !isAlreadyMember
          })
          .map((s: any) => ({
            id: s.id,
            display_name: s.display_name || s.fullName || s.full_name,
            full_name: s.fullName || s.full_name || s.display_name,
            email: s.profile?.email || s.email || 'No email',
            current_role: 'Storyteller',
            cultural_background: s.cultural_background,
            location: s.location,
            tenant_roles: null,
            skills: s.specialties || [],
            interests: s.preferred_topics || [],
            mentoring_availability: null,
            created_at: new Date().toISOString(),
            profile_image_url: s.profile?.avatar_url || s.avatarUrl,
            avatar_url: s.profile?.avatar_url || s.avatarUrl,
            bio: s.bio,
            story_count: s.story_count || 0
          }))
        console.log('✅ Available storytellers after mapping:', availableStorytellers)
        setStorytellers(availableStorytellers)
      }
    } catch (error) {
      console.error('Error loading storytellers:', error)
    }
  }

  useEffect(() => {
    if (isStorytellersDialogOpen) {
      loadStorytellers()
    } else {
      // Clear search when dialog closes
      setStorytellerSearchTerm('')
    }
  }, [isStorytellersDialogOpen, localMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/organisations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Add the new member to local state
        setLocalMembers(prev => [result.member, ...prev])
        // Reset form
        setFormData({
          display_name: '',
          full_name: '',
          email: '',
          current_role: '',
          cultural_background: ''
        })
        // Close dialog after a delay
        setTimeout(() => {
          setIsAddDialogOpen(false)
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error adding member:', error)
      setMessage({ type: 'error', text: 'Failed to add member. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addExistingStoryteller = async (storytellerId: string) => {
    try {
      const response = await fetch(`/api/organisations/${organizationId}/members/add-existing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storytellerId })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Add the storyteller to local members
        setLocalMembers(prev => [result.member, ...prev])
        // Remove from available storytellers
        setStorytellers(prev => prev.filter(s => s.id !== storytellerId))
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error adding storyteller:', error)
      setMessage({ type: 'error', text: 'Failed to add storyteller. Please try again.' })
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the organisation?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/organisations/${organizationId}/members?memberId=${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Remove member from local state
        setLocalMembers(prev => prev.filter(m => m.id !== memberId))
        // Clear message after delay
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error removing member:', error)
      setMessage({ type: 'error', text: 'Failed to remove member. Please try again.' })
    }
  }

  const makeStoryteller = async (memberId: string) => {
    try {
      const response = await fetch(`/api/organisations/${organizationId}/storytellers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileId: memberId })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Member promoted to storyteller!' })
        // Update local state to show storyteller badge
        setLocalMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, tenant_roles: [...(m.tenant_roles || []), 'storyteller'] }
            : m
        ))
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create storyteller profile' })
      }
    } catch (error) {
      console.error('Error making storyteller:', error)
      setMessage({ type: 'error', text: 'Failed to promote to storyteller. Please try again.' })
    }
  }

  // Filter storytellers based on search term
  const filteredStorytellers = storytellers.filter(storyteller => {
    const name = storyteller.display_name || storyteller.full_name || ''
    const email = storyteller.email || ''
    const role = storyteller.current_role || ''
    const background = storyteller.cultural_background || ''

    const searchLower = storytellerSearchTerm.toLowerCase().trim()

    // If no search term, return all
    if (!searchLower) return true

    const matches = name.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower) ||
           role.toLowerCase().includes(searchLower) ||
           background.toLowerCase().includes(searchLower)

    if (searchLower === 'k' || searchLower.startsWith('kr')) {
      console.log('🔍 Testing storyteller:', {
        name,
        searchTerm: searchLower,
        matches,
        nameMatches: name.toLowerCase().includes(searchLower)
      })
    }

    return matches
  })

  // Debug logging
  console.log('🔍 Search term:', storytellerSearchTerm)
  console.log('🔍 Total storytellers:', storytellers.length)
  console.log('🔍 Filtered storytellers:', filteredStorytellers.length)
  if (storytellerSearchTerm) {
    console.log('🔍 Storyteller names:', storytellers.map(s => s.display_name || s.full_name))
  }

  const filteredMembers = localMembers.filter(member => {
    const name = member.display_name || member.full_name || ''
    const role = member.current_role || ''
    const background = member.cultural_background || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      background.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'all' || 
      role.toLowerCase().includes(selectedRole.toLowerCase()) ||
      (member.tenant_roles || []).includes(selectedRole)

    return matchesSearch && matchesRole
  })

  const roles = [
    'all',
    ...new Set(localMembers.flatMap(m => [
      m.current_role,
      ...(m.tenant_roles || [])
    ]).filter(Boolean))
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-r from-earth-50 to-sage-50 rounded-lg p-8 border border-earth-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Our Community</h2>
            <p className="text-sage-700">
              {localMembers.length} storytellers, knowledge keepers, and community members
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center bg-white/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-earth-700">{localMembers.length}</div>
              <div className="text-sm text-stone-600 mt-1">Members</div>
            </div>
            <div className="text-center bg-white/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-sage-700">
                {localMembers.reduce((sum, m) => sum + (m.stories_count || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 mt-1">Stories</div>
            </div>
            <div className="text-center bg-white/50 rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-clay-700">
                {localMembers.reduce((sum, m) => sum + (m.projects?.length || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 mt-1">Projects</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 pt-4 border-t border-earth-200/50">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-sm text-stone-700">
              {localMembers.filter(m => m.locations && m.locations.length > 0).length} members with locations
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-sage-500" />
            <span className="text-sm text-stone-700">
              {localMembers.filter(m => m.projects && m.projects.length > 0).length} active in projects
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-green-500" />
            <span className="text-sm text-stone-700">
              {new Set(localMembers.flatMap(m => m.locations?.map(l => l.city || l.name) || [])).size} locations
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sage-600 hover:bg-sage-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your organisation community.
                </DialogDescription>
              </DialogHeader>
              
              {message && (
                <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="How they want to be known"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Full legal name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="member@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current_role">Role</Label>
                    <Input
                      id="current_role"
                      value={formData.current_role}
                      onChange={(e) => handleInputChange('current_role', e.target.value)}
                      placeholder="Community Member, Elder, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cultural_background">Cultural Background</Label>
                    <Input
                      id="cultural_background"
                      value={formData.cultural_background}
                      onChange={(e) => handleInputChange('cultural_background', e.target.value)}
                      placeholder="Cultural heritage or background"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isStorytellersDialogOpen} onOpenChange={setIsStorytellersDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Users className="h-4 w-4 mr-2" />
                Add from Storytellers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Existing Storytellers</DialogTitle>
                <DialogDescription>
                  Select storytellers from the platform to add to your organisation.
                </DialogDescription>
              </DialogHeader>
              
              {message && (
                <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Search input for storytellers */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search storytellers by name, email, role, or background..."
                  value={storytellerSearchTerm}
                  onChange={(e) => setStorytellerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-4">
                {storytellers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No available storytellers to add.
                  </div>
                ) : filteredStorytellers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No storytellers found matching "{storytellerSearchTerm}"</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  <>
                    {storytellerSearchTerm && (
                      <p className="text-sm text-muted-foreground">
                        Found {filteredStorytellers.length} storyteller{filteredStorytellers.length !== 1 ? 's' : ''} matching "{storytellerSearchTerm}"
                      </p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredStorytellers.map((storyteller) => (
                      <Card key={storyteller.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={storyteller.profile_image_url || storyteller.avatar_url || ''} 
                                alt={storyteller.display_name || storyteller.full_name || 'Storyteller'}
                              />
                              <AvatarFallback>
                                {(storyteller.display_name || storyteller.full_name || 'S')
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {storyteller.display_name || storyteller.full_name || 'Storyteller'}
                              </h4>
                              {storyteller.current_role && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {storyteller.current_role}
                                </p>
                              )}
                              {storyteller.cultural_background && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {storyteller.cultural_background}
                                </p>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => addExistingStoryteller(storyteller.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8 p-4 bg-stone-50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members by name, role, or background..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="rounded-md border border-input bg-background px-4 py-3 text-sm min-w-[140px]"
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role === 'all' ? 'All Roles' : role}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-2">
            {/* Profile Image at Top */}
            <div className="relative h-36 bg-gradient-to-br from-earth-50 to-sage-50 flex items-center justify-center">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage
                  src={member.profile_image_url || member.avatar_url || ''}
                  alt={member.display_name || member.full_name || 'Member'}
                />
                <AvatarFallback className="bg-earth-100 text-earth-700 text-xl font-bold">
                  {(member.display_name || member.full_name || 'M')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {(canManage || isSuperAdmin) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(member.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Information Below */}
            <CardContent className="p-6 text-center space-y-4">
              <div>
                <h3 className="font-bold text-lg text-stone-900">
                  {(member.display_name || member.full_name || 'Member').trim()}
                </h3>

                {member.current_role && (
                  <p className="text-sm text-earth-600 mt-1">
                    {member.current_role}
                  </p>
                )}

                {member.cultural_background && (
                  <p className="text-xs text-sage-600 italic mt-2">
                    {member.cultural_background}
                  </p>
                )}
              </div>

              {/* Location */}
              {member.locations && member.locations.length > 0 && (
                <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {member.locations[0].city ?
                      `${member.locations[0].city}${member.locations[0].state ? `, ${member.locations[0].state}` : ''}` :
                      member.locations[0].name
                    }
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {member.organization_role}
                </Badge>
                {member.stories_count > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {member.stories_count}
                  </Badge>
                )}
              </div>

              {/* Projects */}
              {member.projects && member.projects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-stone-500 mb-1">Projects</p>
                  <div className="flex justify-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {member.projects[0].name}
                    </Badge>
                    {member.projects.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.projects.length - 1}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(member.joined_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                <div className="flex gap-1">
                  {(canManage || isSuperAdmin) && !member.tenant_roles?.includes('storyteller') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makeStoryteller(member.id)}
                      className="text-earth-600 hover:text-earth-700 h-7 px-2 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Make Storyteller
                    </Button>
                  )}
                  <Link href={`/storytellers/${member.id}`}>
                    <Button variant="ghost" size="sm" className="text-earth-600 hover:text-earth-700 h-7 px-2 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No members found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  )
}