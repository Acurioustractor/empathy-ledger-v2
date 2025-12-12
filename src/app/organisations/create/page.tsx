'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  ArrowLeft,
  Loader2,
  CheckCircle
} from 'lucide-react'

interface OrganizationForm {
  name: string
  type: string
  location: string
  description: string
  website_url: string
  contact_email: string
  cultural_significance: string
}

export default function CreateOrganizationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState<OrganizationForm>({
    name: '',
    type: '',
    location: '',
    description: '',
    website_url: '',
    contact_email: '',
    cultural_significance: ''
  })

  const handleInputChange = (field: keyof OrganizationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Basic validation
    if (!formData.name.trim() || !formData.type || !formData.contact_email.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Organization created successfully!' })
        
        // Wait 2 seconds then redirect to the new organisation
        setTimeout(() => {
          router.push(`/organisations/${result.organisation.id}/dashboard`)
        }, 2000)
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to create organisation. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error creating organisation:', error)
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-earth-800 mb-4">
            Register Your Organization
          </h1>
          <p className="text-xl text-grey-600 max-w-2xl mx-auto">
            Join our network of organisations dedicated to preserving cultural stories and heritage
          </p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Organization Details</CardTitle>
              <CardDescription>
                Please provide information about your organisation to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-grey-800">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Organization Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your organisation name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Organization Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organisation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nonprofit">Non-Profit</SelectItem>
                          <SelectItem value="community">Community Organization</SelectItem>
                          <SelectItem value="educational">Educational Institution</SelectItem>
                          <SelectItem value="cultural_center">Cultural Center</SelectItem>
                          <SelectItem value="government">Government Agency</SelectItem>
                          <SelectItem value="religious">Religious Organization</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email">
                        Contact Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="contact@yourorg.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        placeholder="https://yourorganization.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State/Province, Country"
                    />
                  </div>
                </div>

                {/* About Your Organization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-grey-800">About Your Organization</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Organization Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell us about your organisation, its mission, and what you do..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cultural_significance">Cultural Focus</Label>
                    <Textarea
                      id="cultural_significance"
                      value={formData.cultural_significance}
                      onChange={(e) => handleInputChange('cultural_significance', e.target.value)}
                      placeholder="Describe the cultural communities, traditions, or heritage areas your organisation focuses on..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Organization...
                      </>
                    ) : (
                      'Create Organization'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Your organisation will be reviewed for approval</li>
                <li>• You'll receive confirmation via email once approved</li>
                <li>• You can start inviting team members and creating stories</li>
                <li>• Access to advanced organisation management tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}