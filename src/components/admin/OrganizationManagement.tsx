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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Users, 
  BarChart3, 
  Settings, 
  Globe,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Crown,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Trash2,
  Eye
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  type: 'cultural_center' | 'educational' | 'healthcare' | 'tribal_government' | 'nonprofit' | 'community_group'
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval'
  tier: 'basic' | 'standard' | 'premium' | 'enterprise'
  contact: {
    email: string
    phone?: string
    website?: string
    address?: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }
  }
  adminContact: {
    name: string
    email: string
    role: string
  }
  settings: {
    culturalProtocols: boolean
    elderOversight: boolean
    publicVisibility: boolean
    dataRetention: number // days
    contentModeration: 'none' | 'basic' | 'strict'
  }
  stats: {
    memberCount: number
    activeMembers: number
    storiesShared: number
    storiesThisMonth: number
    engagement: number
    dataUsage: number // GB
  }
  billing: {
    planName: string
    monthlyFee: number
    lastPayment: string
    status: 'active' | 'overdue' | 'suspended'
  }
  createdAt: string
  lastActivity: string
}

interface OrganizationManagementProps {
  adminLevel: 'super_admin' | 'tenant_admin'
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({ adminLevel }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false)

  // Fetch organizations from API
  const fetchOrganizations = async () => {
    try {
      const searchParams = new URLSearchParams()
      if (filterStatus !== 'all') searchParams.set('status', filterStatus)
      if (filterTier !== 'all') searchParams.set('tier', filterTier)
      
      const response = await fetch(`/api/admin/organizations?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch organizations')
      }
      
      const data = await response.json()
      const apiOrgs = data.organizations
      
      // Transform API data to match component interface
      const transformedOrgs: Organization[] = apiOrgs.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        type: org.type,
        status: org.status === 'pending' ? 'pending_approval' : org.status,
        tier: org.tier,
        contact: {
          email: org.email,
          phone: org.phone,
          website: org.website,
          address: org.address ? {
            street: org.address.street,
            city: org.address.city,
            state: org.address.state,
            country: org.address.country,
            postalCode: org.address.zip
          } : undefined
        },
        adminContact: {
          name: 'Admin User',
          email: org.email,
          role: 'Administrator'
        },
        settings: {
          culturalProtocols: org.settings?.culturalProtocols || false,
          elderOversight: org.settings?.elderReviewRequired || false,
          publicVisibility: org.settings?.publicStories || false,
          dataRetention: 365,
          contentModeration: 'basic'
        },
        stats: {
          memberCount: org.memberCount,
          activeMembers: Math.round(org.memberCount * (org.engagementRate / 100)),
          storiesShared: org.storyCount,
          storiesThisMonth: Math.round(org.storyCount * 0.1),
          engagement: org.engagementRate,
          dataUsage: org.dataUsage
        },
        billing: {
          planName: org.tier.charAt(0).toUpperCase() + org.tier.slice(1),
          monthlyFee: org.monthlyFee,
          lastPayment: new Date().toISOString(),
          status: org.status === 'active' ? 'active' : 'suspended'
        },
        createdAt: org.createdAt,
        lastActivity: new Date().toISOString(),
        projectCount: org.projectCount || 0
      }))
      
      setOrganizations(transformedOrgs)
      setFilteredOrgs(transformedOrgs)
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
      setOrganizations([])
      setFilteredOrgs([])
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [filterStatus, filterTier])

  // Filter organizations
  useEffect(() => {
    let filtered = organizations.filter(org => {
      const matchesSearch = searchTerm === '' || 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || org.status === filterStatus
      const matchesTier = filterTier === 'all' || org.tier === filterTier

      return matchesSearch && matchesStatus && matchesTier
    })

    setFilteredOrgs(filtered)
  }, [organizations, searchTerm, filterStatus, filterTier])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'pending_approval':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Approval</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge variant="clay-soft" className="gap-1"><Crown className="w-3 h-3" />Enterprise</Badge>
      case 'premium':
        return <Badge variant="sage-soft" className="gap-1"><Shield className="w-3 h-3" />Premium</Badge>
      case 'standard':
        return <Badge variant="outline">Standard</Badge>
      case 'basic':
        return <Badge variant="outline">Basic</Badge>
      default:
        return <Badge variant="outline">{tier}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'cultural_center': 'Cultural Center',
      'educational': 'Educational',
      'healthcare': 'Healthcare',
      'tribal_government': 'Tribal Government',
      'nonprofit': 'Nonprofit',
      'community_group': 'Community Group'
    }
    return <Badge variant="outline">{typeMap[type as keyof typeof typeMap] || type}</Badge>
  }

  const getBillingStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'suspended':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleOrgAction = async (action: string, orgId: string, orgData?: any) => {
    try {
      switch (action) {
        case 'edit':
          if (orgData) {
            const response = await fetch('/api/admin/organizations', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: orgId, ...orgData })
            })
            
            if (response.ok) {
              await fetchOrganizations() // Refresh the list
              console.log('Organization updated successfully')
            } else {
              console.error('Failed to update organization')
            }
          }
          break
          
        case 'delete':
          if (confirm('Are you sure you want to delete this organization?')) {
            const response = await fetch(`/api/admin/organizations?id=${orgId}`, {
              method: 'DELETE'
            })
            
            if (response.ok) {
              await fetchOrganizations() // Refresh the list
              console.log('Organization deleted successfully')
            } else {
              console.error('Failed to delete organization')
            }
          }
          break
          
        case 'create':
          if (orgData) {
            const response = await fetch('/api/admin/organizations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orgData)
            })
            
            if (response.ok) {
              await fetchOrganizations() // Refresh the list
              console.log('Organization created successfully')
            } else {
              console.error('Failed to create organization')
            }
          }
          break
          
        default:
          console.log(`Action: ${action} for organization: ${orgId}`)
      }
    } catch (error) {
      console.error(`Error performing ${action} on organization:`, error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search organizations by name, type, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-6">
        {filteredOrgs.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{org.name}</CardTitle>
                    {getStatusBadge(org.status)}
                    {getTierBadge(org.tier)}
                    {getTypeBadge(org.type)}
                  </div>
                  <CardDescription className="max-w-2xl">
                    {org.description || 'No description provided'}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {org.contact.email}
                    </div>
                    {org.contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {org.contact.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Since {new Date(org.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog open={isOrgDialogOpen && selectedOrg?.id === org.id} onOpenChange={(open) => {
                    setIsOrgDialogOpen(open)
                    if (!open) setSelectedOrg(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <Building2 className="w-5 h-5" />
                          {selectedOrg?.name} - Organization Details
                        </DialogTitle>
                        <DialogDescription>
                          Comprehensive organization management and analytics
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrg && (
                        <Tabs defaultValue="overview" className="space-y-6">
                          <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Key Metrics */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Total Members</span>
                                    <span className="font-semibold">{selectedOrg.stats.memberCount}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Active Members</span>
                                    <span className="font-semibold text-green-600">{selectedOrg.stats.activeMembers}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Stories Shared</span>
                                    <span className="font-semibold">{selectedOrg.stats.storiesShared}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">This Month</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold">{selectedOrg.stats.storiesThisMonth}</span>
                                      <TrendingUp className="w-3 h-3 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Engagement</span>
                                    <span className="font-semibold">{selectedOrg.stats.engagement}%</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Contact Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium">Admin Contact</Label>
                                    <p className="text-sm">{selectedOrg.adminContact.name}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">{selectedOrg.adminContact.role}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">{selectedOrg.adminContact.email}</p>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Organization Email</Label>
                                    <p className="text-sm">{selectedOrg.contact.email}</p>
                                  </div>
                                  
                                  {selectedOrg.contact.phone && (
                                    <div>
                                      <Label className="text-sm font-medium">Phone</Label>
                                      <p className="text-sm">{selectedOrg.contact.phone}</p>
                                    </div>
                                  )}
                                  
                                  {selectedOrg.contact.website && (
                                    <div>
                                      <Label className="text-sm font-medium">Website</Label>
                                      <p className="text-sm">{selectedOrg.contact.website}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* System Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">System Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Data Usage</span>
                                    <span className="font-semibold">{selectedOrg.stats.dataUsage} GB</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Last Activity</span>
                                    <span className="text-sm">{new Date(selectedOrg.lastActivity).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">Created</span>
                                    <span className="text-sm">{new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Cultural Settings</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedOrg.settings.culturalProtocols && <Badge variant="sage-soft" className="text-xs">Cultural Protocols</Badge>}
                                      {selectedOrg.settings.elderOversight && <Badge variant="clay-soft" className="text-xs">Elder Oversight</Badge>}
                                      {selectedOrg.settings.publicVisibility && <Badge variant="outline" className="text-xs">Public</Badge>}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="members">
                            <Card>
                              <CardHeader>
                                <CardTitle>Member Management</CardTitle>
                                <CardDescription>
                                  Manage organization members and their roles
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center py-8 text-stone-600 dark:text-stone-400">
                                  Member management interface would be implemented here
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="content">
                            <Card>
                              <CardHeader>
                                <CardTitle>Content Management</CardTitle>
                                <CardDescription>
                                  Manage organization's stories and content
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center py-8 text-stone-600 dark:text-stone-400">
                                  Content management interface would be implemented here
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="settings">
                            <Card>
                              <CardHeader>
                                <CardTitle>Organization Settings</CardTitle>
                                <CardDescription>
                                  Configure cultural protocols and platform settings
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Content Moderation</Label>
                                    <p className="text-sm capitalize">{selectedOrg.settings.contentModeration}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Data Retention</Label>
                                    <p className="text-sm">{selectedOrg.settings.dataRetention} days</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="billing">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  Billing Information
                                  {getBillingStatusIcon(selectedOrg.billing.status)}
                                </CardTitle>
                                <CardDescription>
                                  Subscription and payment information
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Plan</Label>
                                    <p className="text-lg font-semibold">{selectedOrg.billing.planName}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">
                                      ${selectedOrg.billing.monthlyFee}/month
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Billing Status</Label>
                                    <p className="text-sm capitalize flex items-center gap-2">
                                      {getBillingStatusIcon(selectedOrg.billing.status)}
                                      {selectedOrg.billing.status.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">
                                      Last payment: {new Date(selectedOrg.billing.lastPayment).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleOrgAction('edit', org.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  {adminLevel === 'super_admin' && (
                    <Button variant="outline" size="sm" onClick={() => handleOrgAction('settings', org.id)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-clay-600">{org.stats.memberCount}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sage-600">{org.stats.storiesShared}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-600">{org.stats.engagement}%</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${org.billing.monthlyFee}</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Monthly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{org.stats.dataUsage}GB</div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">Data Used</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Try adjusting your search terms or filters to find organizations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OrganizationManagement