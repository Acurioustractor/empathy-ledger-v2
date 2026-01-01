'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Award, 
  MapPin, 
  Eye,
  MessageSquare,
  Heart,
  Calendar,
  Globe,
  Phone,
  Video,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

interface AdminStoryteller {
  id: string
  displayName: string
  email: string
  bio: string
  culturalBackground: string
  occupation: string
  location: string
  organisation?: string
  projects?: string[]
  profileImageUrl?: string
  storyCount: number
  engagementRate: number
  isElder: boolean
  isFeatured: boolean
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  createdAt: string
  lastActive: string
  verificationStatus: {
    email: boolean
    identity: boolean
    cultural: boolean
  }
  stats: {
    storiesShared: number
    storiesRead: number
    communityEngagement: number
    followersCount: number
    viewsTotal: number
  }
  languages: string[]
  specialties: string[]
  preferences: {
    availability: string
    travelWilling: boolean
    virtualSessions: boolean
    groupSessions: boolean
  }
}

interface StorytellersResponse {
  storytellers: AdminStoryteller[]
  total: number
  summary: {
    total: number
    active: number
    featured: number
    elders: number
    totalStories: number
    totalViews: number
    averageEngagement: number
  }
}

const StorytellerManagement: React.FC = () => {
  const [storytellers, setStorytellers] = useState<AdminStoryteller[]>([])
  const [summary, setSummary] = useState<StorytellersResponse['summary'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')
  const [elderFilter, setElderFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [organizationFilter, setOrganizationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('displayName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // UI state
  const [selectedStorytellers, setSelectedStorytellers] = useState<string[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStoryteller, setEditingStoryteller] = useState<AdminStoryteller | null>(null)
  
  // Dynamic filter options
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableOrganizations, setAvailableOrganizations] = useState<string[]>([])
  const [availableProjects, setAvailableProjects] = useState<string[]>([])
  
  // All available options for selectors
  const [allLocations, setAllLocations] = useState<{id: string, name: string, display: string}[]>([])
  const [allOrganizations, setAllOrganizations] = useState<{id: string, name: string}[]>([])
  const [allProjects, setAllProjects] = useState<{id: string, name: string}[]>([])

  const fetchOptions = async () => {
    console.log('Fetching options for selectors...')
    
    // Fetch locations
    try {
      const locationsResponse = await fetch('/api/admin/locations')
      if (locationsResponse.ok) {
        const locations = await locationsResponse.json()
        console.log('Fetched locations:', locations.length)
        setAllLocations(locations)
      } else {
        console.error('Failed to fetch locations:', locationsResponse.status)
      }
    } catch (locError) {
      console.error('Error fetching locations:', locError)
    }
    
    // Fetch organisations  
    try {
      const orgsResponse = await fetch('/api/admin/orgs')
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json()
        const organisations = orgsData.organisations?.map((org: any) => ({
          id: org.id,
          name: org.name
        })) || []
        console.log('Fetched organisations:', organisations.length)
        setAllOrganizations(organisations)
      } else {
        console.error('Failed to fetch organisations:', orgsResponse.status)
      }
    } catch (orgError) {
      console.error('Error fetching organisations:', orgError)
    }
    
    // Fetch projects
    try {
      const projectsResponse = await fetch('/api/admin/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        const projects = projectsData.projects?.map((project: any) => ({
          id: project.id,
          name: project.name
        })) || []
        console.log('Fetched projects:', projects.length)
        setAllProjects(projects)
      } else {
        console.error('Failed to fetch projects:', projectsResponse.status)
      }
    } catch (projectError) {
      console.error('Error fetching projects:', projectError)
    }
  }

  const fetchStorytellers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        featured: featuredFilter,
        elder: elderFilter,
        project: projectFilter,
        location: locationFilter,
        organisation: organizationFilter,
        limit: '1000', // Get more storytellers instead of just 20
        page: '1'
      })

      const response = await fetch(`/api/admin/storytellers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch storytellers')

      const data: StorytellersResponse = await response.json()
      console.log('📊 Fetched storytellers:', data.storytellers.length, 'out of', data.total, 'total')
      setStorytellers(data.storytellers)
      setSummary(data.summary)
      
      // Extract unique filter values from the data
      const locations = [...new Set(data.storytellers.map(s => s.location).filter(l => l && l !== 'Not specified'))]
      const organisations = [...new Set(data.storytellers.map(s => s.organisation).filter(o => o && o !== 'None'))]
      const projects = [...new Set(data.storytellers.flatMap(s => s.projects || []).filter(Boolean))]
      
      setAvailableLocations(locations.sort())
      setAvailableOrganizations(organisations.sort())
      setAvailableProjects(projects.sort())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('StorytellerManagement: Fetching storytellers...')
    fetchStorytellers()
  }, [searchTerm, statusFilter, featuredFilter, elderFilter, projectFilter, locationFilter, organizationFilter])

  useEffect(() => {
    console.log('StorytellerManagement: Component mounted, fetching options...')
    fetchOptions()
  }, [])

  const handleStorytellerAction = async (action: string, storytellerId: string, data?: any) => {
    try {
      let response
      switch (action) {
        case 'edit':
          response = await fetch('/api/admin/storytellers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: storytellerId, ...data })
          })
          break
        case 'toggleFeatured':
          response = await fetch('/api/admin/storytellers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: storytellerId, isFeatured: data.isFeatured })
          })
          break
        case 'deactivate':
          response = await fetch(`/api/admin/storytellers?id=${storytellerId}`, {
            method: 'DELETE'
          })
          break
      }
      
      if (response && response.ok) {
        fetchStorytellers()
        setShowEditModal(false)
        setEditingStoryteller(null)
      }
    } catch (error) {
      console.error('Error performing storyteller action:', error)
    }
  }

  const handleOrganizationChange = async (storytellerId: string, organizationId: string) => {
    try {
      const response = await fetch('/api/admin/storytellers/relationships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: storytellerId, 
          organizationId: organizationId === 'none' ? null : organizationId,
          type: 'organisation'
        })
      })
      
      if (response.ok) {
        fetchStorytellers()
      }
    } catch (error) {
      console.error('Error updating organisation:', error)
    }
  }

  const handleLocationChange = async (storytellerId: string, locationId: string) => {
    try {
      const response = await fetch('/api/admin/storytellers/relationships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: storytellerId, 
          locationId: locationId === 'none' ? null : locationId,
          type: 'location'
        })
      })
      
      if (response.ok) {
        fetchStorytellers()
      }
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const handleProjectsChange = async (storytellerId: string, projectIds: string[]) => {
    try {
      const response = await fetch('/api/admin/storytellers/relationships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: storytellerId, 
          projectIds,
          type: 'projects'
        })
      })
      
      if (response.ok) {
        fetchStorytellers()
      }
    } catch (error) {
      console.error('Error updating projects:', error)
    }
  }

  const sortedStorytellers = [...storytellers].sort((a, b) => {
    let aValue = a[sortBy as keyof AdminStoryteller] as any
    let bValue = b[sortBy as keyof AdminStoryteller] as any
    
    if (sortBy === 'storyCount' || sortBy === 'engagementRate') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading storytellers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Total Storytellers</p>
                <p className="text-lg font-semibold">{summary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Active</p>
                <p className="text-lg font-semibold">{summary.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Featured</p>
                <p className="text-lg font-semibold">{summary.featured}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Elders</p>
                <p className="text-lg font-semibold">{summary.elders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Total Stories</p>
                <p className="text-lg font-semibold">{summary.totalStories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Total Views</p>
                <p className="text-lg font-semibold">{summary.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-grey-500">Avg Engagement</p>
                <p className="text-lg font-semibold">{summary.averageEngagement}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search storytellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Locations</option>
              <option value="not-specified">Not Specified</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Organizations</option>
              <option value="none">No Organization</option>
              {availableOrganizations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
            
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Projects</option>
              <option value="none">No Projects</option>
              {availableProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 border border-grey-300 rounded-md"
            >
              <option value="all">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={fetchStorytellers}
              className="px-4 py-2 bg-grey-100 text-grey-700 rounded-md hover:bg-grey-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Storytellers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStorytellers(storytellers.map(s => s.id))
                      } else {
                        setSelectedStorytellers([])
                      }
                    }}
                    checked={selectedStorytellers.length === storytellers.length}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => {
                      setSortBy('displayName')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}>
                  Storyteller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => {
                      setSortBy('storyCount')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}>
                  Stories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => {
                      setSortBy('engagementRate')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}>
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Status & Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {sortedStorytellers.map((storyteller) => (
                <tr key={storyteller.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStorytellers.includes(storyteller.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStorytellers([...selectedStorytellers, storyteller.id])
                        } else {
                          setSelectedStorytellers(selectedStorytellers.filter(id => id !== storyteller.id))
                        }
                      }}
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {storyteller.profileImageUrl ? (
                          <img
                            src={storyteller.profileImageUrl}
                            alt={storyteller.displayName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {storyteller.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-grey-900">
                          {storyteller.displayName}
                        </div>
                        <div className="text-sm text-grey-500">{storyteller.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      <select
                        value={storyteller.location === 'Not specified' ? 'none' : allLocations.find(l => l.display === storyteller.location)?.id || 'none'}
                        onChange={(e) => handleLocationChange(storyteller.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-grey-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={allLocations.length === 0}
                      >
                        <option value="none">Not specified</option>
                        {allLocations.length === 0 ? (
                          <option disabled>Loading locations...</option>
                        ) : (
                          allLocations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.display}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      <select
                        value={storyteller.organisation === 'Independent' ? 'none' : allOrganizations.find(o => o.name === storyteller.organisation)?.id || 'none'}
                        onChange={(e) => handleOrganizationChange(storyteller.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-grey-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={allOrganizations.length === 0}
                      >
                        <option value="none">Independent</option>
                        {allOrganizations.length === 0 ? (
                          <option disabled>Loading organisations...</option>
                        ) : (
                          allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-grey-500">
                          {storyteller.projects?.length || 0} projects
                        </div>
                        <select
                          onChange={(e) => {
                            const selectedProjectId = e.target.value
                            if (selectedProjectId && selectedProjectId !== 'none') {
                              const currentProjects = storyteller.projects || []
                              const currentProjectIds = currentProjects.map(p => 
                                allProjects.find(proj => proj.name === p)?.id
                              ).filter(Boolean)
                              
                              if (!currentProjectIds.includes(selectedProjectId)) {
                                handleProjectsChange(storyteller.id, [...currentProjectIds, selectedProjectId])
                              }
                            }
                            e.target.value = 'none' // Reset selector
                          }}
                          className="w-full px-2 py-1 text-xs border border-grey-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={allProjects.length === 0}
                        >
                          <option value="none">
                            {allProjects.length === 0 ? 'Loading...' : '+ Add Project'}
                          </option>
                          {allProjects.length > 0 && allProjects.filter(project => 
                            !storyteller.projects?.includes(project.name)
                          ).map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        {storyteller.projects && storyteller.projects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {storyteller.projects.map(projectName => (
                              <span
                                key={projectName}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                                onClick={() => {
                                  const currentProjectIds = storyteller.projects
                                    ?.map(p => allProjects.find(proj => proj.name === p)?.id)
                                    .filter(Boolean) || []
                                  const projectToRemove = allProjects.find(p => p.name === projectName)?.id
                                  if (projectToRemove) {
                                    handleProjectsChange(storyteller.id, currentProjectIds.filter(id => id !== projectToRemove))
                                  }
                                }}
                                title="Click to remove"
                              >
                                {projectName}
                                <span className="ml-1">×</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{storyteller.storyCount}</span>
                        <span className="text-grey-500">stories</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-grey-500">
                        <Eye className="h-3 w-3" />
                        <span>{storyteller.stats.viewsTotal.toLocaleString()} views</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      <div className="flex items-center">
                        <div className="flex-1 bg-grey-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, storyteller.engagementRate)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{storyteller.engagementRate}%</span>
                      </div>
                      <div className="text-xs text-grey-500 mt-1">
                        {storyteller.stats.followersCount} followers
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        storyteller.status === 'active' ? 'bg-green-100 text-green-800' :
                        storyteller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        storyteller.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-grey-100 text-grey-800'
                      }`}>
                        {storyteller.status}
                      </span>
                      
                      <div className="flex gap-1">
                        {storyteller.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-500" title="Featured" />
                        )}
                        {storyteller.isElder && (
                          <Award className="h-4 w-4 text-purple-500" title="Elder" />
                        )}
                        {storyteller.preferences.virtualSessions && (
                          <Video className="h-4 w-4 text-blue-500" title="Virtual Sessions" />
                        )}
                        {storyteller.preferences.travelWilling && (
                          <MapPin className="h-4 w-4 text-green-500" title="Travel Willing" />
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStorytellerAction('toggleFeatured', storyteller.id, { isFeatured: !storyteller.isFeatured })}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colours ${
                        storyteller.isFeatured 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${storyteller.isFeatured ? 'fill-current' : ''}`} />
                      {storyteller.isFeatured ? 'Featured' : 'Feature'}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingStoryteller(storyteller)
                          setShowEditModal(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleStorytellerAction('deactivate', storyteller.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Deactivate"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {storytellers.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-grey-400" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">No storytellers found</h3>
            <p className="mt-1 text-sm text-grey-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingStoryteller && (
        <div className="fixed inset-0 bg-grey-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Storyteller</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-grey-400 hover:text-grey-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const updateData = {
                displayName: formData.get('displayName'),
                bio: formData.get('bio'),
                occupation: formData.get('occupation'),
                culturalBackground: formData.get('culturalBackground'),
                isElder: formData.get('isElder') === 'true',
                languages: formData.get('languages')?.toString().split(',').map(l => l.trim()).filter(Boolean) || []
              }
              handleStorytellerAction('edit', editingStoryteller.id, updateData)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={editingStoryteller.displayName}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    defaultValue={editingStoryteller.occupation}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">Cultural Background</label>
                  <input
                    type="text"
                    name="culturalBackground"
                    defaultValue={editingStoryteller.culturalBackground}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={editingStoryteller.bio}
                    rows={4}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Languages (comma-separated)</label>
                  <input
                    type="text"
                    name="languages"
                    defaultValue={editingStoryteller.languages.join(', ')}
                    className="w-full px-3 py-2 border border-grey-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isElder"
                      value="true"
                      defaultChecked={editingStoryteller.isElder}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-grey-700">Elder Status</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-grey-700 bg-grey-100 rounded-md hover:bg-grey-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorytellerManagement