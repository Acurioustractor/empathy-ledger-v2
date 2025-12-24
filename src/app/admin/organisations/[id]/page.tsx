'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminNavigation from '@/components/admin/AdminNavigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  Users, 
  Globe, 
  MapPin,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Activity,
  FileText,
  Settings,
  ExternalLink
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  description: string | null
  type: string
  location: string | null
  website_url: string | null
  contact_email: string | null
  contact_phone: string | null
  status: string
  verification_status: string
  member_count: number
  story_count: number
  created_at: string
  updated_at: string
  cultural_protocols: any
  mission_statement: string | null
}

export default function AdminOrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  
  const [organisation, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchOrganization()
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/admin/orgs`)
      if (response.ok) {
        const data = await response.json()
        const org = data.organisations.find((o: any) => o.id === organizationId)
        if (org) {
          setOrganization(org)
        }
      }
    } catch (error) {
      console.error('Error fetching organisation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this organisation? This action cannot be undone.')) {
      // Implement delete functionality
      router.push('/admin/organisations')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-sage-100 text-sage-800"><Shield className="w-3 h-3 mr-1" />Verified</Badge>
      case 'unverified':
        return <Badge className="bg-stone-100 text-stone-800">Unverified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-64 mb-4"></div>
            <div className="h-64 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!organisation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Organization Not Found</h2>
            <Button onClick={() => router.push('/admin/organisations')}>
              Back to Organizations
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation className="mb-8" />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/admin/organisations')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/admin/organisations/${organizationId}/edit`)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-sage-600" />
                {organisation.name}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(organisation.status)}
                {getVerificationBadge(organisation.verification_status)}
                <Badge variant="outline">{organisation.type}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-500">Description</label>
                    <p className="mt-1">{organisation.description || 'No description provided'}</p>
                  </div>
                  
                  {organisation.mission_statement && (
                    <div>
                      <label className="text-sm font-medium text-stone-500">Mission Statement</label>
                      <p className="mt-1">{organisation.mission_statement}</p>
                    </div>
                  )}
                  
                  {organisation.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span>{organisation.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <span>Created {new Date(organisation.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {organisation.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-stone-400" />
                      <a 
                        href={organisation.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sage-600 hover:underline flex items-center gap-1"
                      >
                        {organisation.website_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
                  {organisation.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <a href={`mailto:${organisation.contact_email}`} className="text-sage-600 hover:underline">
                        {organisation.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {organisation.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <span>{organisation.contact_phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-sage-50 rounded-lg">
                      <Users className="w-8 h-8 text-sage-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{organisation.member_count || 0}</div>
                      <div className="text-sm text-stone-600">Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{organisation.story_count || 0}</div>
                      <div className="text-sm text-stone-600">Stories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Activity</span>
                      <span className="text-sm text-stone-600">
                        {new Date(organisation.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusBadge(organisation.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Verification</span>
                      {getVerificationBadge(organisation.verification_status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  {organisation.member_count || 0} members associated with this organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-stone-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p>Member management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Stories</CardTitle>
                <CardDescription>
                  {organisation.story_count || 0} stories from this organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-stone-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p>Story management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Activity log for this organisation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-stone-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p>Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage organisation configuration and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-stone-500">
                  <Settings className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p>Settings management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}