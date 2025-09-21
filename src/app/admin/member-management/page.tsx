'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Users,
  UserMinus,
  UserPlus,
  Building2,
  AlertTriangle,
  CheckCircle,
  Filter,
  MoreVertical
} from 'lucide-react'

interface Member {
  id: string
  display_name: string | null
  full_name: string | null
  email: string | null
  current_role: string | null
  cultural_background: string | null
  organization_role: string
  organization_id: string
  organization_name: string
  organization_slug: string
  joined_at: string
  profile_image_url?: string
  avatar_url?: string
}

interface Organization {
  id: string
  name: string
  slug: string
  member_count?: number
}

export default function SuperAdminMemberManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [organisations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)

      // Load members
      const membersResponse = await fetch(`/api/admin/members?organisation=${selectedOrg}&search=${searchTerm}&limit=100`)
      const membersData = await membersResponse.json()

      if (membersData.success) {
        setMembers(membersData.members)
      }

      // Load organisations
      const orgsResponse = await fetch('/api/admin/orgs')
      const orgsData = await orgsResponse.json()

      if (orgsData.success) {
        setOrganizations(orgsData.organisations)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedOrg, searchTerm])

  const removeMember = async (memberId: string, organizationId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this organisation?`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/members?memberId=${memberId}&organizationId=${organizationId}`,
        { method: 'DELETE' }
      )

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Remove from local state
        setMembers(prev => prev.filter(m => !(m.id === memberId && m.organization_id === organizationId)))
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error removing member:', error)
      setMessage({ type: 'error', text: 'Failed to remove member' })
    }
  }

  const getOrgMemberCount = (orgId: string) => {
    return members.filter(m => m.organization_id === orgId).length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grey-900 mx-auto"></div>
          <p className="mt-4 text-grey-600">Loading member data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Super Admin - Member Management</h1>
        <p className="text-grey-600 mt-2">
          Manage members across all organisations
        </p>
      </div>

      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">All Members ({members.length})</TabsTrigger>
          <TabsTrigger value="organisations">Organizations ({organisations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, role, or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="all">All Organizations</option>
              {organisations.map(org => (
                <option key={org.id} value={org.name}>
                  {org.name} ({getOrgMemberCount(org.id)})
                </option>
              ))}
            </select>
          </div>

          {/* Members Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={`${member.id}-${member.organization_id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={member.profile_image_url || member.avatar_url || ''}
                        alt={member.display_name || member.full_name || 'Member'}
                      />
                      <AvatarFallback>
                        {(member.display_name || member.full_name || 'M')
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {member.display_name || member.full_name || 'Member'}
                      </h4>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      )}
                      {member.current_role && (
                        <p className="text-sm text-muted-foreground truncate">
                          {member.current_role}
                        </p>
                      )}
                      {member.cultural_background && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.cultural_background}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {member.organization_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {member.organization_role}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMember(
                        member.id,
                        member.organization_id,
                        member.display_name || member.full_name || 'Member'
                      )}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="organisations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {organisations.map((org) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{org.name}</span>
                    <Badge variant="secondary">
                      {getOrgMemberCount(org.id)} members
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Organization ID:</span>
                      <span className="font-mono text-xs">{org.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-mono text-xs">{org.slug}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrg(org.name)}
                      className="w-full"
                    >
                      View Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}