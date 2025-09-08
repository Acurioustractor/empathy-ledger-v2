'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Typography } from '@/components/ui/typography'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft,
  Save,
  User,
  Settings,
  Crown,
  Users,
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  MapPin
} from 'lucide-react'

interface StorytellerFormData {
  display_name: string
  bio: string
  cultural_background: string
  specialties: string[]
  years_of_experience: number | null
  preferred_topics: string[]
  storytelling_style: string[]
  elder_status: boolean
  featured: boolean
  status: 'active' | 'inactive' | 'pending'
  community_recognition: any
  availability: any
  cultural_protocols: any
  performance_preferences: any
  compensation_preferences: any
  travel_availability: any
  technical_requirements: any
}

const culturalBackgrounds = [
  'First Nations', 'Inuit', 'Métis', 'Aboriginal Australian', 'Torres Strait Islander',
  'Māori', 'Native American', 'African Diaspora', 'Pacific Islander', 'Other'
]

const specialties = [
  'Traditional Stories', 'Historical Narratives', 'Healing Stories', 'Cultural Teachings',
  'Language Preservation', 'Ceremonial Knowledge', 'Land Connection', 'Family Histories',
  'Community Stories', 'Youth Education', 'Elder Wisdom', 'Creation Stories',
  'Seasonal Teachings', 'Plant Medicine', 'Animal Stories'
]

const storytellingStyles = [
  'Oral Tradition', 'Digital Storytelling', 'Performance', 'Written Narrative',
  'Visual Storytelling', 'Song & Music', 'Dance & Movement', 'Interactive'
]

const preferredTopics = [
  'Creation Stories', 'Cultural Identity', 'Family Heritage', 'Land and Environment',
  'Healing and Wellness', 'Traditional Knowledge', 'Modern Challenges', 'Youth Guidance',
  'Community Building', 'Language Revitalization', 'Seasonal Cycles',
  'Plant and Animal Relations', 'Ceremonial Practices', 'Historical Events', 'Migration Stories'
]

export default function StorytellerEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const storytellerId = params.id as string

  const [formData, setFormData] = useState<Partial<StorytellerFormData>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [originalData, setOriginalData] = useState<Partial<StorytellerFormData>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Check authorization
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/storytellers/' + storytellerId + '/edit')
    }
  }, [isAuthenticated, router, storytellerId])

  // Fetch storyteller data
  useEffect(() => {
    async function fetchStoryteller() {
      try {
        setLoading(true)
        const response = await fetch(`/api/storytellers/${storytellerId}`)
        if (!response.ok) {
          throw new Error('Storyteller not found')
        }
        const data = await response.json()
        
        // Check if user can edit this storyteller
        if (data.profile_id !== profile?.id && profile?.id !== 'admin') {
          setError('You do not have permission to edit this storyteller profile.')
          return
        }

        const formData = {
          display_name: data.display_name || '',
          bio: data.bio || '',
          cultural_background: data.cultural_background || '',
          specialties: data.specialties || [],
          years_of_experience: data.years_of_experience,
          preferred_topics: data.preferred_topics || [],
          storytelling_style: data.storytelling_style || [],
          elder_status: data.elder_status || false,
          featured: data.featured || false,
          status: data.status || 'active',
          community_recognition: data.community_recognition,
          availability: data.availability || {},
          cultural_protocols: data.cultural_protocols || {},
          performance_preferences: data.performance_preferences || {},
          compensation_preferences: data.compensation_preferences || {},
          travel_availability: data.travel_availability || {},
          technical_requirements: data.technical_requirements || {}
        }
        
        setFormData(formData)
        setOriginalData({ ...formData })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (storytellerId && profile?.id) {
      fetchStoryteller()
    }
  }, [storytellerId, profile?.id])

  // Check for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(hasChanges)
  }, [formData, originalData])

  const updateFormData = (field: keyof StorytellerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleArrayItem = (array: string[], item: string): string[] => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/storytellers/${storytellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update storyteller')
      }

      const updatedData = await response.json()
      setOriginalData({ ...formData })
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({ ...originalData })
    setHasChanges(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-earth-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Typography variant="h2" className="text-red-600 mb-4">
              {error.includes('permission') ? 'Access Denied' : 'Error'}
            </Typography>
            <Typography variant="body" className="text-gray-600 mb-6">
              {error}
            </Typography>
            <Button asChild>
              <a href={`/storytellers/${storytellerId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href={`/storytellers/${storytellerId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </a>
            </Button>
            <div>
              <Typography variant="h1" className="text-earth-800">
                Edit Storyteller Profile
              </Typography>
              <Typography variant="body" className="text-gray-600">
                Update your storytelling profile and preferences
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel Changes
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-earth-600 hover:bg-earth-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your storyteller profile has been updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card className="p-8">
          <Tabs defaultValue="basic" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="protocols">Protocols</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-earth-600" />
                <Typography variant="h2">Basic Information</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => updateFormData('display_name', e.target.value)}
                    placeholder="Your storyteller name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <Textarea
                    value={formData.bio || ''}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    placeholder="Tell your story and background..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Background
                  </label>
                  <Select 
                    value={formData.cultural_background || ''} 
                    onValueChange={(value) => updateFormData('cultural_background', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cultural background" />
                    </SelectTrigger>
                    <SelectContent>
                      {culturalBackgrounds.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="80"
                    value={formData.years_of_experience || ''}
                    onChange={(e) => updateFormData('years_of_experience', 
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Elder Status
                      </label>
                      <Typography variant="small" className="text-gray-500">
                        Are you recognized as an Elder in your community?
                      </Typography>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.elder_status || false}
                        onCheckedChange={(checked) => updateFormData('elder_status', checked)}
                      />
                      <Crown className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Expertise Tab */}
            <TabsContent value="expertise" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-earth-600" />
                <Typography variant="h2">Storytelling Expertise</Typography>
              </div>

              <div className="space-y-8">
                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty}
                        onClick={() => updateFormData('specialties', 
                          toggleArrayItem(formData.specialties || [], specialty)
                        )}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-all text-center',
                          (formData.specialties || []).includes(specialty)
                            ? 'border-earth-500 bg-earth-50 text-earth-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Typography variant="small" className="font-medium">
                          {specialty}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storytelling Styles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Storytelling Styles
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {storytellingStyles.map((style) => (
                      <div
                        key={style}
                        onClick={() => updateFormData('storytelling_style',
                          toggleArrayItem(formData.storytelling_style || [], style)
                        )}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-all text-center',
                          (formData.storytelling_style || []).includes(style)
                            ? 'border-earth-500 bg-earth-50 text-earth-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Typography variant="small" className="font-medium">
                          {style}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Topics
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {preferredTopics.map((topic) => (
                      <div
                        key={topic}
                        onClick={() => updateFormData('preferred_topics',
                          toggleArrayItem(formData.preferred_topics || [], topic)
                        )}
                        className={cn(
                          'p-2 border rounded-md cursor-pointer transition-all text-center text-sm',
                          (formData.preferred_topics || []).includes(topic)
                            ? 'border-earth-400 bg-earth-25 text-earth-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Cultural Protocols Tab */}
            <TabsContent value="protocols" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-earth-600" />
                <Typography variant="h2">Cultural Protocols</Typography>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  These settings help ensure your storytelling follows appropriate cultural protocols.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Switch
                      checked={formData.cultural_protocols?.requires_introduction || false}
                      onCheckedChange={(checked) => 
                        updateFormData('cultural_protocols', {
                          ...formData.cultural_protocols,
                          requires_introduction: checked
                        })
                      }
                    />
                    <div>
                      <Typography variant="body" className="font-medium">
                        Requires Proper Introduction
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        I prefer to be introduced by someone who knows me and my background
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Switch
                      checked={formData.cultural_protocols?.gender_specific || false}
                      onCheckedChange={(checked) =>
                        updateFormData('cultural_protocols', {
                          ...formData.cultural_protocols,
                          gender_specific: checked
                        })
                      }
                    />
                    <div>
                      <Typography variant="body" className="font-medium">
                        Gender-Specific Content
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        Some of my stories are appropriate for specific genders only
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Switch
                      checked={formData.cultural_protocols?.age_restricted || false}
                      onCheckedChange={(checked) =>
                        updateFormData('cultural_protocols', {
                          ...formData.cultural_protocols,
                          age_restricted: checked
                        })
                      }
                    />
                    <div>
                      <Typography variant="body" className="font-medium">
                        Age-Restricted Content
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        Some of my stories are appropriate for specific age groups only
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Switch
                      checked={formData.cultural_protocols?.community_approval || false}
                      onCheckedChange={(checked) =>
                        updateFormData('cultural_protocols', {
                          ...formData.cultural_protocols,
                          community_approval: checked
                        })
                      }
                    />
                    <div>
                      <Typography variant="body" className="font-medium">
                        Requires Community Approval
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        I need approval from community members before sharing certain stories
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-earth-600" />
                <Typography variant="h2">Profile Settings</Typography>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Status
                  </label>
                  <Select 
                    value={formData.status || 'active'} 
                    onValueChange={(value) => updateFormData('status', value)}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active - Visible to public</SelectItem>
                      <SelectItem value="inactive">Inactive - Hidden from public</SelectItem>
                      <SelectItem value="pending">Pending - Under review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <Typography variant="body" className="font-medium">
                      Featured Storyteller
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Featured storytellers appear prominently in searches
                    </Typography>
                  </div>
                  <Switch
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => updateFormData('featured', checked)}
                    disabled={!profile?.is_elder} // Only elders or admins can feature themselves
                  />
                </div>

                {!profile?.is_elder && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Featured status can only be set by community elders or administrators.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Save/Cancel Actions */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 flex gap-2 bg-white rounded-lg shadow-lg border p-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel Changes
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-earth-600 hover:bg-earth-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}