'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Shield, Building2, FileText, Users, BarChart3, Share2, MoreVertical, AlertCircle } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  status: string
  created_at: string
}

interface Story {
  id: string
  title: string
  slug: string
  status: string
  article_type?: string
  organization_id?: string
  organization_name?: string
  created_at: string
  updated_at: string
  syndication_enabled?: boolean
  syndication_destinations?: string[]
}

interface AuditLog {
  id: string
  admin_profile_id: string
  admin_name?: string
  action_type: string
  target_type: string
  target_id?: string
  organization_id?: string
  organization_name?: string
  performed_at: string
  success: boolean
  error_message?: string
}

export default function SuperAdminDashboard() {
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [selectedOrg])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Load organizations
      const orgsResponse = await fetch('/api/admin/organizations')
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json()
        setOrganizations(orgsData.organizations || [])
      }

      // Load stories (filtered by org if selected)
      const storiesUrl = selectedOrg === 'all'
        ? '/api/admin/stories?limit=50'
        : `/api/admin/organizations/${selectedOrg}/stories?limit=50`

      const storiesResponse = await fetch(storiesUrl)
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        setStories(storiesData.stories || [])
      }

      // Load audit logs (simulated for now - will be implemented)
      // In production, this would call /api/admin/super-admin/audit-logs
      setAuditLogs([])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePullDown(storyId: string) {
    if (!confirm('Are you sure you want to pull down this story from all sites? This will:\n- Archive the story\n- Revoke all syndication consents\n- Delete social media posts\n- Trigger webhooks to all syndication sites')) {
      return
    }

    try {
      const response = await fetch('/api/admin/moderation/pull-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      })

      if (response.ok) {
        alert('Story pulled down successfully')
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(`Failed to pull down story: ${error.message}`)
      }
    } catch (error) {
      console.error('Error pulling down story:', error)
      alert('Failed to pull down story')
    }
  }

  async function handleEdit(storyId: string) {
    window.location.href = `/admin/stories/${storyId}/edit`
  }

  async function handleRefuse(storyId: string) {
    const destinations = prompt('Enter destinations to refuse (comma-separated):')
    if (!destinations) return

    try {
      const response = await fetch('/api/admin/moderation/refuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          destinations: destinations.split(',').map(d => d.trim()),
          reason: 'Refused by super-admin'
        })
      })

      if (response.ok) {
        alert('Publication refused successfully')
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(`Failed to refuse publication: ${error.message}`)
      }
    } catch (error) {
      console.error('Error refusing publication:', error)
      alert('Failed to refuse publication')
    }
  }

  const stats = {
    totalOrganizations: organizations.length,
    activeOrganizations: organizations.filter(o => o.status === 'active').length,
    totalStories: stories.length,
    publishedStories: stories.filter(s => s.status === 'published').length,
    syndicatedStories: stories.filter(s => s.syndication_enabled && (s.syndication_destinations?.length || 0) > 0).length,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Cross-organization content management and moderation
          </p>
        </div>

        {/* Organization Selector */}
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                All Organizations (Super Admin)
              </div>
            </SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {org.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeOrganizations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedOrg === 'all' ? 'All organizations' : 'Current org'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedStories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.publishedStories / (stats.totalStories || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Syndicated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.syndicatedStories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-site distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content Moderation
          </TabsTrigger>
          <TabsTrigger value="syndication">
            <Share2 className="h-4 w-4 mr-2" />
            Syndication
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest content across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.slice(0, 10).map(story => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">{story.title}</TableCell>
                      <TableCell>{story.organization_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{story.article_type || 'story'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(story.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Moderation Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Queue</CardTitle>
              <CardDescription>
                Manage and moderate content across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Syndication</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map(story => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium max-w-md truncate">
                        {story.title}
                      </TableCell>
                      <TableCell>{story.organization_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {story.syndication_enabled ? (
                          <Badge variant="outline" className="text-xs">
                            {story.syndication_destinations?.length || 0} sites
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Disabled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(story.id)}>
                              Edit Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePullDown(story.id)}
                              className="text-destructive"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Pull Down from All Sites
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRefuse(story.id)}>
                              Refuse Publication
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndication Tab */}
        <TabsContent value="syndication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Syndication Management</CardTitle>
              <CardDescription>
                Manage content distribution across all sites and platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Syndication management features coming in Phase 4</p>
                <p className="text-sm mt-2">Will include: ACT sites, social media, and partner platforms</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Manage all organizations in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map(org => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell className="font-mono text-sm">{org.slug}</TableCell>
                      <TableCell>
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/organisations/${org.id}/dashboard`}
                        >
                          View Dashboard
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all super-admin actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audit trail viewer coming soon</p>
                <p className="text-sm mt-2">Will display all super-admin actions with full metadata</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
