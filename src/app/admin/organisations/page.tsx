'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Building2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Shield,
  Clock,
  Hash,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  MoreHorizontal
} from 'lucide-react'

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

export default function OrganizationsAdminPage() {
  const router = useRouter()
  const [organisations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [activityFilter, setActivityFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    filterOrganizations()
  }, [organisations, searchTerm, statusFilter, typeFilter, verificationFilter, activityFilter])

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
    if (!confirm(`Are you sure you want to delete "${organizationName}"? This action cannot be undone and will remove all associated data including projects, stories, and member relationships.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orgs?id=${organizationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setOrganizations(prev => prev.filter(org => org.id !== organizationId))
        alert('Organization deleted successfully')
      } else {
        const data = await response.json()
        alert(`Failed to delete organisation: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting organisation:', error)
      alert('Failed to delete organisation')
    }
  }

  const filterOrganizations = () => {
    let filtered = organisations

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.cultural_significance?.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(org => org.verification_status === verificationFilter)
    }

    // Activity filter
    if (activityFilter !== 'all') {
      if (activityFilter === 'active') {
        filtered = filtered.filter(org => org.is_recently_active)
      } else if (activityFilter === 'inactive') {
        filtered = filtered.filter(org => !org.is_recently_active)
      }
    }

    setFilteredOrganizations(filtered)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nonprofit': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-green-100 text-green-800' 
      case 'educational': return 'bg-purple-100 text-purple-800'
      case 'cultural_center': return 'bg-orange-100 text-orange-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-300 text-green-700'
      case 'inactive': return 'border-red-300 text-red-700'
      case 'pending': return 'border-yellow-300 text-yellow-700'
      default: return 'border-grey-300 text-grey-700'
    }
  }

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case 'verified': return 'border-green-300 text-green-700'
      case 'unverified': return 'border-red-300 text-red-700'
      case 'pending': return 'border-yellow-300 text-yellow-700'
      default: return 'border-grey-300 text-grey-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2">Loading organisations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-grey-900 mb-2">
              Organizations Admin
            </h1>
            <p className="text-grey-600">
              Manage organisations and their tenant settings
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{organisations.length}</p>
                <p className="text-grey-600">Total Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{organisations.filter(o => o.type === 'community').length}</p>
                <p className="text-grey-600">Community</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{organisations.filter(o => o.type === 'nonprofit').length}</p>
                <p className="text-grey-600">Nonprofit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plus className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{organisations.filter(o => o.type === 'cultural_center').length}</p>
                <p className="text-grey-600">Cultural Centers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-grey-400" />
                <Input
                  type="text"
                  placeholder="Search organisations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="community">Community</option>
              <option value="educational">Educational</option>
              <option value="cultural_center">Cultural Center</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-4 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Activity</option>
              <option value="active">Recently Active</option>
              <option value="inactive">Inactive 30+ days</option>
            </select>
            
            <Button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('all')
                setStatusFilter('all')
                setVerificationFilter('all')
                setActivityFilter('all')
              }}
              variant="outline"
              size="sm"
            >
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg truncate mr-2">
                  {org.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(org.type)}>
                    {org.type}
                  </Badge>
                </div>
              </div>
              
              {/* Status and Verification Badges */}
              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                <Badge className={getStatusColor(org.status || 'active')} variant="outline">
                  <div className="flex items-center space-x-1">
                    {org.status === 'active' ? <CheckCircle className="w-3 h-3" /> :
                     org.status === 'inactive' ? <XCircle className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    <span className="text-xs">{org.status || 'active'}</span>
                  </div>
                </Badge>
                
                {/* Verification Badge */}
                <Badge className={getVerificationColor(org.verification_status || 'verified')} variant="outline">
                  <div className="flex items-center space-x-1">
                    {org.verification_status === 'verified' ? <CheckCircle className="w-3 h-3" /> :
                     org.verification_status === 'unverified' ? <XCircle className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    <span className="text-xs">{org.verification_status || 'verified'}</span>
                  </div>
                </Badge>
                
                {/* Activity Indicator */}
                {org.is_recently_active && (
                  <Badge className="bg-green-100 text-green-800" variant="outline">
                    <Activity className="w-3 h-3 mr-1" />
                    <span className="text-xs">Active</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {org.description && (
                <p className="text-sm text-grey-600 line-clamp-2">
                  {org.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm">
                {org.location && (
                  <div className="flex items-center text-grey-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{org.location}</span>
                  </div>
                )}

                <div className="flex items-center text-grey-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(org.created_at).toLocaleDateString()}</span>
                </div>

                {org.contact_email && (
                  <div className="flex items-center text-grey-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{org.contact_email}</span>
                  </div>
                )}

                {org.website_url && (
                  <div className="flex items-center text-grey-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={org.website_url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline truncate flex items-center">
                      {org.website_url.replace(/https?:\/\//g, '')}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Cultural Significance */}
              {org.cultural_significance && (
                <div className="p-3 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-800 font-medium">Cultural Focus</p>
                  <p className="text-xs text-orange-700 mt-1">{org.cultural_significance}</p>
                </div>
              )}


              {/* Activity Metrics */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-grey-50 rounded-md">
                <div className="text-center">
                  <div className="text-lg font-bold text-grey-900">{org.story_count || 0}</div>
                  <div className="text-xs text-grey-600">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-grey-900">{org.member_count || 0}</div>
                  <div className="text-xs text-grey-600">Members</div>
                </div>
              </div>

              {/* Organization Details */}
              <div className="flex items-center justify-between text-xs text-grey-500">
                <div className="flex items-center">
                  <Hash className="w-3 h-3 mr-1" />
                  <span>ID: {org.id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{org.days_since_update || 0} days ago</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => router.push(`/organisations/${org.id}/dashboard`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => router.push(`/admin/organisations/${org.id}/edit`)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => deleteOrganization(org.id, org.name)}
                  variant="outline"
                  size="sm"
                  className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete organisation"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-grey-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-grey-900 mb-2">No organisations found</h3>
          <p className="text-grey-600">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No organisations have been created yet.'}
          </p>
        </div>
      )}
    </div>
  )
}