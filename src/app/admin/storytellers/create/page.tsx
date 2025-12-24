'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function CreateStorytellerPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    bio: '',
    years_of_experience: '0',
    is_elder: false,
    cultural_background: '',
    location: '',
    organisation: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.display_name) {
      alert('Please fill in at least the display name')
      return
    }

    // Generate email if not provided
    const email = formData.email || `${formData.display_name.toLowerCase().replace(/\s+/g, '.')}@storyteller.local`

    setLoading(true)
    try {
      const response = await fetch('/api/admin/storytellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: formData.display_name,
          email: email,
          bio: formData.bio || null,
          years_of_experience: parseInt(formData.years_of_experience),
          is_elder: formData.is_elder,
          cultural_background: formData.cultural_background || null,
          location: formData.location || null,
          organisation: formData.organisation || null,
          created_via: 'admin_interface'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create storyteller')
      }

      const result = await response.json()
      alert(`Storyteller "${formData.display_name}" created successfully!`)
      router.push('/admin/storytellers')
    } catch (error) {
      console.error('Error creating storyteller:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to create storyteller: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-stone-600 mb-6">You need to be signed in to create storytellers.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/storytellers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Storytellers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Add New Storyteller</h1>
          <p className="text-stone-600">Quick admin form for adding storytellers</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Storyteller Details</span>
          </CardTitle>
          <CardDescription>
            Essential information for creating a new storyteller profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Essential Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Display Name *
                </label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => handleChange('display_name', e.target.value)}
                  placeholder="e.g., Mary Running Bear"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email <span className="text-stone-400">(optional)</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="mary@example.com (auto-generated if empty)"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Bio / About
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Brief description of their background and storytelling style..."
                rows={3}
              />
            </div>

            {/* Experience & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Years of Experience
                </label>
                <Select value={formData.years_of_experience} onValueChange={(value) => handleChange('years_of_experience', value)}>
                  <SelectTrigger className="bg-white border-stone-300 text-stone-900">
                    <SelectValue className="text-stone-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="0">New storyteller</SelectItem>
                    <SelectItem value="1">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="11">11-20 years</SelectItem>
                    <SelectItem value="21">20+ years</SelectItem>
                    <SelectItem value="50">Lifelong storyteller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Elder Status
                </label>
                <Select value={formData.is_elder ? "true" : "false"} onValueChange={(value) => handleChange('is_elder', value === "true")}>
                  <SelectTrigger className="bg-white border-stone-300 text-stone-900">
                    <SelectValue className="text-stone-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="false">Community member</SelectItem>
                    <SelectItem value="true">Recognized Elder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cultural & Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Cultural Background
                </label>
                <Input
                  value={formData.cultural_background}
                  onChange={(e) => handleChange('cultural_background', e.target.value)}
                  placeholder="e.g., Lakota, Cherokee, Inuit..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., Pine Ridge, SD"
                />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Organization
              </label>
              <Input
                value={formData.organisation}
                onChange={(e) => handleChange('organisation', e.target.value)}
                placeholder="e.g., Snow Foundation, Tribal Council..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-6 border-t">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Storyteller'}
              </Button>
              <Link href="/admin/storytellers">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}