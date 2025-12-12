'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Eye, Edit, MoreHorizontal, Users, BookOpen, Activity, MapPin, Building2, Star, Crown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminStore } from '@/lib/stores/admin.store'
import { StorytellerRelationshipManager } from '@/components/admin/StorytellerRelationshipManager'
import { LocationEditor } from '@/components/admin/LocationEditor'
import { StatusEditor } from '@/components/admin/StatusEditor'

interface Storyteller {
  id: string
  display_name: string
  full_name: string
  email: string
  profile_visibility: 'active' | 'pending' | 'suspended' | 'inactive' | 'public' | 'private' | 'draft'
  featured: boolean
  elder: boolean
  story_count: number
  published_stories?: number
  draft_stories?: number
  last_active: string
  location: string | null
  organisation: string | null
  created_at: string
  bio?: string
  cultural_background?: string
  profile_image_url?: string
  projects?: string[]
  engagement_rate?: number
  organisations?: Array<{
    organization_id: string
    organization_name: string
    role: 'storyteller' | 'member'
  }>
  project_relationships?: Array<{
    project_id: string
    project_name: string
    role: string
  }>
  total_views?: number
  transcript_count?: number
  active_transcripts?: number
}

export default function AdminStorytellersPage() {
  const router = useRouter()
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    featured: 0,
    elders: 0,
    totalStories: 0,
    totalViews: 0,
    averageEngagement: 0
  })

  const {
    storytellerFilters,
    updateStorytellerFilters,
    resetStorytellerFilters,
    viewMode,
    setViewMode,
    selectedStorytellers,
    toggleStoryteller,
    clearSelectedStorytellers
  } = useAdminStore()

  const fetchStorytellers = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: storytellerFilters.search,
        status: storytellerFilters.status,
        featured: storytellerFilters.featured,
        elder: storytellerFilters.elder,
        sortBy: storytellerFilters.sortBy,
        sortOrder: storytellerFilters.sortOrder
      })

      if (storytellerFilters.organisation) {
        params.append('organisation', storytellerFilters.organisation)
      }
      if (storytellerFilters.location) {
        params.append('location', storytellerFilters.location)
      }

      const response = await fetch(`/api/admin/storytellers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch storytellers')

      const data = await response.json()
      setStorytellers(data.storytellers || [])
      setTotalPages(Math.ceil(data.total / 20))
      setTotalCount(data.total)

      // Update summary stats from API response
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching storytellers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorytellers(currentPage)
  }, [currentPage, storytellerFilters])

  const handleSearch = (value: string) => {
    updateStorytellerFilters({ search: value })
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    updateStorytellerFilters({ [key]: value })
    setCurrentPage(1)
  }

  const handleRelationshipUpdate = async (storytellerId: string, type: 'organisation' | 'project', relationships: any[]) => {
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}/relationships`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          relationships
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update relationships')
      }

      // Update only the specific storyteller in local state (no full refresh)
      setStorytellers(prevStorytellers =>
        prevStorytellers.map(storyteller =>
          storyteller.id === storytellerId
            ? {
                ...storyteller,
                [type === 'organisation' ? 'organisations' : 'project_relationships']: relationships
              }
            : storyteller
        )
      )
    } catch (error) {
      console.error('Error updating relationships:', error)
    }
  }

  const handleLocationUpdate = async (storytellerId: string, location: string | null) => {
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update location')
      }

      // Update only the specific storyteller's location in local state
      setStorytellers(prevStorytellers =>
        prevStorytellers.map(storyteller =>
          storyteller.id === storytellerId
            ? { ...storyteller, location }
            : storyteller
        )
      )
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const handleStatusUpdate = async (storytellerId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update only the specific storyteller's status in local state
      setStorytellers(prevStorytellers =>
        prevStorytellers.map(storyteller =>
          storyteller.id === storytellerId
            ? { ...storyteller, profile_visibility: status as any, status: status }
            : storyteller
        )
      )
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleExport = async () => {
    try {
      // For now, create a CSV from the current storytellers data
      const csvContent = [
        // CSV headers
        ['Name', 'Email', 'Status', 'Stories', 'Location', 'Organization', 'Elder', 'Featured', 'Created'].join(','),
        // CSV data rows
        ...storytellers.map(s => [
          `"${s.display_name || s.full_name}"`,
          `"${s.email}"`,
          s.profile_visibility,
          s.story_count || '',
          `"${s.location || ''}"`,
          `"${s.organisation || ''}"`,
          s.elder ? 'Yes' : 'No',
          s.featured ? 'Yes' : 'No',
          new Date(s.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `storytellers-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting storytellers:', error)
      alert('Failed to export storytellers. Please try again.')
    }
  }

  const handleAddStoryteller = () => {
    router.push('/admin/storytellers/create')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-grey-100 text-grey-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Storytellers</h1>
          <p className="text-grey-600">
            Manage storytellers, review profiles, and monitor community activity
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddStoryteller}>
            <Users className="w-4 h-4 mr-2" />
            Add Storyteller
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storytellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary.active} active members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Storytellers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.featured.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Community highlights
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elder Storytellers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.elders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Cultural wisdom keepers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalStories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all storytellers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
                <Input
                  placeholder="Search storytellers..."
                  value={storytellerFilters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={storytellerFilters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.featured}
                onValueChange={(value) => handleFilterChange('featured', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.elder}
                onValueChange={(value) => handleFilterChange('elder', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Elder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Elders</SelectItem>
                  <SelectItem value="false">Not Elders</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.organisation || 'all'}
                onValueChange={(value) => handleFilterChange('organisation', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="Snow Foundation">Snow Foundation</SelectItem>
                  <SelectItem value="Orange Sky">Orange Sky</SelectItem>
                  <SelectItem value="A Curious Tractor">A Curious Tractor</SelectItem>
                  <SelectItem value="MMEIC">MMEIC</SelectItem>
                  <SelectItem value="Diagrama">Diagrama</SelectItem>
                  <SelectItem value="Independent Storytellers">Independent</SelectItem>
                  <SelectItem value="Community Elder">Community Elder</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="stories">Story Count</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A-Z</SelectItem>
                  <SelectItem value="desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={storytellerFilters.project || 'all'}
                onValueChange={(value) => handleFilterChange('project', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="Deadly Hearts Trek">Deadly Hearts Trek</SelectItem>
                  <SelectItem value="Orange Sky Community Services">Orange Sky</SelectItem>
                  <SelectItem value="MMEIC Cultural Initiative">MMEIC Cultural</SelectItem>
                  <SelectItem value="Diagrama Youth Support">Diagrama Youth</SelectItem>
                  <SelectItem value="Community Stories">Community Stories</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={resetStorytellerFilters}
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Storytellers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Storytellers ({totalCount})</CardTitle>
            {selectedStorytellers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-grey-600">
                  {selectedStorytellers.length} selected
                </span>
                <Button size="sm" variant="outline">
                  Bulk Actions
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelectedStorytellers}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead>Storyteller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stories</TableHead>
                  <TableHead>Transcripts</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading storytellers...
                    </TableCell>
                  </TableRow>
                ) : storytellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No storytellers found
                    </TableCell>
                  </TableRow>
                ) : (
                  storytellers.map((storyteller) => (
                    <TableRow key={storyteller.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedStorytellers.includes(storyteller.id)}
                          onChange={() => toggleStoryteller(storyteller.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={storyteller.profile_image_url || `/placeholder-avatar.jpg`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                              {getInitials(storyteller.display_name || storyteller.full_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/storytellers/${storyteller.id}`}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {storyteller.display_name || storyteller.full_name || 'Unnamed User'}
                              </Link>
                              {storyteller.featured && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {storyteller.elder && (
                                <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Elder
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-grey-500 mt-1">
                              <span>{storyteller.email || 'No email'}</span>
                              {storyteller.cultural_background && (
                                <span className="text-xs bg-grey-100 px-2 py-1 rounded">
                                  {storyteller.cultural_background}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="group">
                          <StatusEditor
                            storytellerId={storyteller.id}
                            currentStatus={storyteller.profile_visibility}
                            onUpdate={handleStatusUpdate}
                            compact={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{storyteller.story_count > 0 ? storyteller.story_count : '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{storyteller.transcript_count && storyteller.transcript_count > 0 ? storyteller.transcript_count : '—'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="group">
                          <StorytellerRelationshipManager
                            storytellerId={storyteller.id}
                            currentOrganizations={storyteller.organisations || []}
                            currentProjects={storyteller.project_relationships || []}
                            onUpdate={(type, relationships) => handleRelationshipUpdate(storyteller.id, type, relationships)}
                            type="project"
                            compact={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(storyteller.last_active)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="group">
                          <StorytellerRelationshipManager
                            storytellerId={storyteller.id}
                            currentOrganizations={storyteller.organisations || []}
                            currentProjects={storyteller.project_relationships || []}
                            onUpdate={(type, relationships) => handleRelationshipUpdate(storyteller.id, type, relationships)}
                            type="organisation"
                            compact={true}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <LocationEditor
                          storytellerId={storyteller.id}
                          currentLocation={storyteller.location}
                          onUpdate={handleLocationUpdate}
                          compact={true}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(storyteller.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/storytellers/${storyteller.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Public Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/storytellers/${storyteller.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/stories?storyteller=${storyteller.id}`}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Stories ({storyteller.story_count})
                              </Link>
                            </DropdownMenuItem>
                            {storyteller.transcript_count && storyteller.transcript_count > 0 && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/transcripts?storyteller=${storyteller.id}`}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Transcripts ({storyteller.transcript_count})
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {storyteller.organisation && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/organisations?search=${encodeURIComponent(storyteller.organisation)}`}>
                                  <Building2 className="w-4 h-4 mr-2" />
                                  View Organization
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              {storyteller.featured ? 'Remove from Featured' : 'Add to Featured'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Users className="w-4 h-4 mr-2" />
                              {storyteller.profile_visibility === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-grey-600">
                Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} storytellers
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}