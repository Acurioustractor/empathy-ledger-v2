'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Trash2, Loader2, CheckCircle } from 'lucide-react'

interface Organization {
  id: string
  name: string
  type: string
  location: string
  description: string
  website_url: string
  contact_email: string
  cultural_significance: string
  tenant_id: string
  created_at: string
  stats?: {
    members: number
    stories: number
    projects: number
  }
}

export default function EditOrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const [organisation, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    website_url: '',
    contact_email: '',
    cultural_significance: ''
  })

  useEffect(() => {
    fetchOrganization()
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/admin/orgs/${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organisation)
        setFormData({
          name: data.organisation.name || '',
          type: data.organisation.type || '',
          location: data.organisation.location || '',
          description: data.organisation.description || '',
          website_url: data.organisation.website_url || '',
          contact_email: data.organisation.contact_email || '',
          cultural_significance: data.organisation.cultural_significance || ''
        })
      }
    } catch (error) {
      console.error('Error fetching organisation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      const response = await fetch(`/api/admin/orgs/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organisation)
        setSaveSuccess(true)
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        console.error('Failed to save organisation')
      }
    } catch (error) {
      console.error('Error saving organisation:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <Button
          onClick={() => router.push('/admin/organisations')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Edit Organization
          </h1>
          <p className="text-stone-600">
            {organisation?.name} - {organisation?.stats?.members || 0} members, {organisation?.stats?.projects || 0} projects
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Organization updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter organisation name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Organization Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="cultural_center">Cultural Center</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="non_profit">Non-Profit</SelectItem>
                      <SelectItem value="philanthropy">Philanthropy</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter organisation description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={formData.cultural_significance}
                  onChange={(e) => handleInputChange('cultural_significance', e.target.value)}
                  placeholder="Describe the cultural significance and protocols"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/organisations')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Organization Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-stone-600">Members</span>
                <span className="font-semibold">{organisation?.stats?.members || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Projects</span>
                <span className="font-semibold">{organisation?.stats?.projects || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Stories</span>
                <span className="font-semibold">{organisation?.stats?.stories || 0}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-xs text-stone-500">
                  <strong>Tenant ID:</strong><br />
                  {organisation?.tenant_id}
                </div>
                <div className="text-xs text-stone-500 mt-2">
                  <strong>Created:</strong><br />
                  {organisation?.created_at ? new Date(organisation.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Organization
              </Button>
              <p className="text-xs text-stone-500 mt-2">
                This action cannot be undone. This will permanently delete the organisation and all associated data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}