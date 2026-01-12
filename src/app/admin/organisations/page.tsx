'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Building2,
  Edit,
  Eye,
  MapPin,
  Globe,
  Mail,
  Users,
  BookOpen,
  Plus,
  Trash2,
  LayoutGrid,
  LayoutList,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MoreHorizontal,
  Filter,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Organization {
  id: string
  name: string
  description?: string
  type: string
  location?: string
  website_url?: string
  contact_email?: string
  logo_url?: string
  cultural_protocols?: Record<string, unknown>
  cultural_significance?: string
  created_at: string
  updated_at: string
  slug: string
  tenant_id: string
  status?: string
  verification_status?: string
  verified_at?: string
  is_recently_active?: boolean
  days_since_update?: number
  story_count?: number
  member_count?: number
}

type SortField = 'name' | 'type' | 'story_count' | 'member_count' | 'created_at' | 'days_since_update'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'table' | 'cards'

export default function OrganizationsAdminPage() {
  const router = useRouter()
  const [organisations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orgs')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organisations || [])
      } else {
        console.error('Failed to fetch organisations')
        setOrganizations([])
      }
    } catch (error) {
      console.error('Error fetching organisations:', error)
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  const deleteOrganization = async (organizationId: string, organizationName: string) => {
    if (!confirm(`Are you sure you want to delete "${organizationName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orgs?id=${organizationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOrganizations(prev => prev.filter(org => org.id !== organizationId))
      } else {
        const data = await response.json()
        alert(`Failed to delete organisation: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting organisation:', error)
      alert('Failed to delete organisation')
    }
  }

  // Filtered and sorted organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organisations

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(term) ||
        org.description?.toLowerCase().includes(term) ||
        org.location?.toLowerCase().includes(term)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'type':
          aVal = a.type || ''
          bVal = b.type || ''
          break
        case 'story_count':
          aVal = a.story_count || 0
          bVal = b.story_count || 0
          break
        case 'member_count':
          aVal = a.member_count || 0
          bVal = b.member_count || 0
          break
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        case 'days_since_update':
          aVal = a.days_since_update || 0
          bVal = b.days_since_update || 0
          break
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [organisations, searchTerm, typeFilter, statusFilter, sortField, sortDirection])

  // Stats
  const stats = useMemo(() => ({
    total: organisations.length,
    active: organisations.filter(o => o.status === 'active').length,
    verified: organisations.filter(o => o.verification_status === 'verified').length,
    totalStories: organisations.reduce((sum, o) => sum + (o.story_count || 0), 0),
    totalMembers: organisations.reduce((sum, o) => sum + (o.member_count || 0), 0),
  }), [organisations])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-30" />
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'community': 'Community',
      'nonprofit': 'Nonprofit',
      'educational': 'Educational',
      'cultural_center': 'Cultural',
      'aboriginal_community': 'Aboriginal',
      'philanthropy': 'Philanthropy',
    }
    return labels[type] || type
  }

  const getTypeBadgeStyle = (type: string) => {
    const styles: Record<string, string> = {
      'community': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'nonprofit': 'bg-blue-50 text-blue-700 border-blue-200',
      'educational': 'bg-purple-50 text-purple-700 border-purple-200',
      'cultural_center': 'bg-amber-50 text-amber-700 border-amber-200',
      'aboriginal_community': 'bg-orange-50 text-orange-700 border-orange-200',
      'philanthropy': 'bg-pink-50 text-pink-700 border-pink-200',
    }
    return styles[type] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading organisations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} organizations · {stats.totalStories} stories · {stats.totalMembers} members
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/organisations/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-emerald-600">{stats.active}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-blue-600">{stats.totalStories}</p>
              <p className="text-sm text-slate-500">Stories</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-purple-600">{stats.totalMembers}</p>
              <p className="text-sm text-slate-500">Members</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="community">Community</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="aboriginal_community">Aboriginal</option>
              <option value="philanthropy">Philanthropy</option>
              <option value="educational">Educational</option>
              <option value="cultural_center">Cultural Center</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}

            {/* View Toggle */}
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden ml-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                title="Table view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 ${viewMode === 'cards' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter count */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredOrganizations.length} of {organisations.length} organizations</span>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Organization
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      <SortIcon field="type" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('story_count')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Stories
                      <SortIcon field="story_count" />
                    </div>
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('member_count')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Members
                      <SortIcon field="member_count" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {org.logo_url ? (
                            <img src={org.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{org.name}</p>
                          {org.contact_email && (
                            <p className="text-xs text-slate-500 truncate">{org.contact_email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeStyle(org.type)}`}>
                        {getTypeLabel(org.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-sm text-slate-600 capitalize">{org.status || 'active'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {org.location ? (
                        <span className="text-sm text-slate-600 truncate block max-w-[180px]">{org.location}</span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-slate-900">{org.story_count || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-slate-900">{org.member_count || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => router.push(`/organisations/${org.id}/dashboard`)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => router.push(`/admin/organisations/${org.id}/edit`)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {org.website_url && (
                              <DropdownMenuItem onClick={() => window.open(org.website_url, '_blank')}>
                                <Globe className="w-4 h-4 mr-2" />
                                Visit Website
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteOrganization(org.id, org.name)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No organizations found</p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="link" className="mt-2 text-blue-600">
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-0">
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{org.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getTypeBadgeStyle(org.type)}`}>
                          {getTypeLabel(org.type)}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {org.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Description */}
                  {org.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{org.description}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-1.5 text-sm">
                    {org.location && (
                      <div className="flex items-center text-slate-500">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{org.location}</span>
                      </div>
                    )}
                    {org.contact_email && (
                      <div className="flex items-center text-slate-500">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{org.contact_email}</span>
                      </div>
                    )}
                    {org.website_url && (
                      <div className="flex items-center text-slate-500">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a
                          href={org.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate flex items-center"
                        >
                          {org.website_url.replace(/https?:\/\/(www\.)?/g, '')}
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{org.story_count || 0}</span>
                      <span className="text-slate-500">stories</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{org.member_count || 0}</span>
                      <span className="text-slate-500">members</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Created {new Date(org.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => router.push(`/organisations/${org.id}/dashboard`)}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => router.push(`/admin/organisations/${org.id}/edit`)}
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {org.website_url && (
                          <DropdownMenuItem onClick={() => window.open(org.website_url, '_blank')}>
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteOrganization(org.id, org.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'cards' && filteredOrganizations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No organizations found</p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="link" className="mt-2 text-blue-600">
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
