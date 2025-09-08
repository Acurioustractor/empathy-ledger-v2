'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import { 
  Crown, 
  User, 
  Users, 
  BookOpen,
  Star,
  MapPin,
  Calendar,
  Award,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Mic,
  Video,
  FileText,
  Music,
  Camera,
  Palette
} from 'lucide-react'

const culturalBackgrounds = [
  'First Nations',
  'Inuit', 
  'Métis',
  'Aboriginal Australian',
  'Torres Strait Islander',
  'Māori',
  'Native American',
  'African Diaspora',
  'Pacific Islander',
  'Other'
]

const specialties = [
  'Traditional Stories',
  'Historical Narratives', 
  'Healing Stories',
  'Cultural Teachings',
  'Language Preservation',
  'Ceremonial Knowledge',
  'Land Connection',
  'Family Histories',
  'Community Stories',
  'Youth Education',
  'Elder Wisdom',
  'Creation Stories',
  'Seasonal Teachings',
  'Plant Medicine',
  'Animal Stories'
]

const storytellingStyles = [
  { id: 'oral', name: 'Oral Tradition', icon: <Mic className="w-4 h-4" /> },
  { id: 'digital', name: 'Digital Storytelling', icon: <Video className="w-4 h-4" /> },
  { id: 'performance', name: 'Performance', icon: <Users className="w-4 h-4" /> },
  { id: 'written', name: 'Written Narrative', icon: <FileText className="w-4 h-4" /> },
  { id: 'visual', name: 'Visual Storytelling', icon: <Camera className="w-4 h-4" /> },
  { id: 'music', name: 'Song & Music', icon: <Music className="w-4 h-4" /> },
  { id: 'dance', name: 'Dance & Movement', icon: <User className="w-4 h-4" /> },
  { id: 'interactive', name: 'Interactive', icon: <Palette className="w-4 h-4" /> }
]

const preferredTopics = [
  'Creation Stories',
  'Cultural Identity',
  'Family Heritage',
  'Land and Environment',
  'Healing and Wellness',
  'Traditional Knowledge',
  'Modern Challenges',
  'Youth Guidance',
  'Community Building',
  'Language Revitalization',
  'Seasonal Cycles',
  'Plant and Animal Relations',
  'Ceremonial Practices',
  'Historical Events',
  'Migration Stories'
]

interface StorytellerFormData {
  display_name: string
  bio: string
  cultural_background: string
  specialties: string[]
  years_of_experience: number | null
  preferred_topics: string[]
  storytelling_style: string[]
  elder_status: boolean
  community_recognition: string
  availability: {
    in_person: boolean
    virtual: boolean
    travel_willing: boolean
    booking_required: boolean
  }
  cultural_protocols: {
    requires_introduction: boolean
    gender_specific: boolean
    age_restricted: boolean
    community_approval: boolean
  }
  performance_preferences: {
    audience_size_preference: string
    venue_preferences: string[]
    technical_needs: string[]
  }
}

const initialFormData: StorytellerFormData = {
  display_name: '',
  bio: '',
  cultural_background: '',
  specialties: [],
  years_of_experience: null,
  preferred_topics: [],
  storytelling_style: [],
  elder_status: false,
  community_recognition: '',
  availability: {
    in_person: true,
    virtual: false,
    travel_willing: false,
    booking_required: true
  },
  cultural_protocols: {
    requires_introduction: false,
    gender_specific: false,
    age_restricted: false,
    community_approval: false
  },
  performance_preferences: {
    audience_size_preference: 'any',
    venue_preferences: [],
    technical_needs: []
  }
}

const steps = [
  { id: 'basic', title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 'cultural', title: 'Cultural Background', description: 'Your cultural identity and affiliations' },
  { id: 'expertise', title: 'Storytelling Expertise', description: 'Your skills and experience' },
  { id: 'protocols', title: 'Cultural Protocols', description: 'Important cultural considerations' },
  { id: 'review', title: 'Review & Submit', description: 'Confirm your information' }
]

export default function StorytellerRegistrationPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<StorytellerFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/storytellers/create')
    }
  }, [isAuthenticated, router])

  // Pre-fill form with profile data
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        display_name: profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || '',
        bio: profile.bio || '',
        cultural_background: profile.cultural_background || '',
        years_of_experience: profile.storytelling_experience ? 
          parseInt(profile.storytelling_experience.replace(/\D/g, '')) || null : null
      }))
    }
  }, [profile])

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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitForm = async () => {
    if (!profile?.id) {
      setError('Profile ID is missing. Please try logging out and back in.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const submitData = {
        profile_id: profile.id,
        display_name: formData.display_name,
        bio: formData.bio,
        cultural_background: formData.cultural_background,
        specialties: formData.specialties,
        years_of_experience: formData.years_of_experience,
        preferred_topics: formData.preferred_topics,
        storytelling_style: formData.storytelling_style,
        elder_status: formData.elder_status,
        community_recognition: formData.community_recognition ? {
          description: formData.community_recognition,
          verified: false
        } : null,
        availability: formData.availability,
        cultural_protocols: formData.cultural_protocols,
        performance_preferences: formData.performance_preferences,
        status: 'pending' // Will need approval
      }

      const response = await fetch('/api/storytellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create storyteller profile')
      }

      const newStoryteller = await response.json()
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/storytellers/${newStoryteller.id}`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.display_name && formData.bio
      case 1: // Cultural Background
        return formData.cultural_background
      case 2: // Expertise
        return formData.specialties.length > 0 && formData.storytelling_style.length > 0
      case 3: // Protocols
        return true // Optional step
      case 4: // Review
        return true
      default:
        return false
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50 flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-4">Authentication Required</Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            Please sign in to become a storyteller.
          </Typography>
          <Button asChild>
            <a href="/auth/signin?redirect=/storytellers/create">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-2xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <Typography variant="h2" className="text-green-700 mb-4">
            Application Submitted!
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            Your storyteller application has been submitted for review. You'll receive an email 
            once it's been approved by our cultural review team.
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Redirecting you to your profile...
          </Typography>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <a href="/storytellers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Storytellers
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h1" className="mb-4 text-earth-800">
            Become a Storyteller
          </Typography>
          <Typography variant="body" className="text-gray-600 max-w-3xl mx-auto">
            Join our community of storytellers and share your cultural narratives with the world. 
            This application will help us understand your background and storytelling style.
          </Typography>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium mb-2',
                  index <= currentStep 
                    ? 'bg-earth-600 border-earth-600 text-white'
                    : 'border-gray-300 text-gray-400'
                )}>
                  {index + 1}
                </div>
                <div className="text-center">
                  <Typography variant="small" className={cn(
                    'font-medium mb-1',
                    index <= currentStep ? 'text-earth-700' : 'text-gray-400'
                  )}>
                    {step.title}
                  </Typography>
                  <Typography variant="small" className="text-gray-500 text-xs">
                    {step.description}
                  </Typography>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-full mt-5 absolute',
                    index < currentStep ? 'bg-earth-600' : 'bg-gray-300'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                  <Typography variant="h2" className="mb-2">Basic Information</Typography>
                  <Typography variant="body" className="text-gray-600">
                    Tell us about yourself and your storytelling background
                  </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => updateFormData('display_name', e.target.value)}
                      placeholder="How you'd like to be known as a storyteller"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio / About You *
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      placeholder="Share your story, background, and what storytelling means to you..."
                      rows={4}
                      required
                    />
                    <Typography variant="small" className="text-gray-500 mt-1">
                      This will be displayed on your storyteller profile
                    </Typography>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Storytelling Experience
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elder Status
                    </label>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.elder_status}
                        onCheckedChange={(checked) => updateFormData('elder_status', checked)}
                      />
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 text-purple-500 mr-2" />
                        <Typography variant="small" className="text-gray-700">
                          I am recognized as an Elder in my community
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Cultural Background */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Users className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                  <Typography variant="h2" className="mb-2">Cultural Background</Typography>
                  <Typography variant="body" className="text-gray-600">
                    Help us understand your cultural identity and community connections
                  </Typography>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Cultural Background *
                    </label>
                    <Select 
                      value={formData.cultural_background} 
                      onValueChange={(value) => updateFormData('cultural_background', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary cultural background" />
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
                      Community Recognition (Optional)
                    </label>
                    <Textarea
                      value={formData.community_recognition}
                      onChange={(e) => updateFormData('community_recognition', e.target.value)}
                      placeholder="Describe any formal or informal recognition you have within your cultural community..."
                      rows={3}
                    />
                    <Typography variant="small" className="text-gray-500 mt-1">
                      This information may be verified with community representatives
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Storytelling Expertise */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <BookOpen className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                  <Typography variant="h2" className="mb-2">Storytelling Expertise</Typography>
                  <Typography variant="body" className="text-gray-600">
                    Tell us about your storytelling skills and areas of focus
                  </Typography>
                </div>

                <div className="space-y-8">
                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Specialties * (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specialties.map((specialty) => (
                        <div
                          key={specialty}
                          onClick={() => updateFormData('specialties', 
                            toggleArrayItem(formData.specialties, specialty)
                          )}
                          className={cn(
                            'p-3 border rounded-lg cursor-pointer transition-all text-center',
                            formData.specialties.includes(specialty)
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
                      Storytelling Styles * (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {storytellingStyles.map((style) => (
                        <div
                          key={style.id}
                          onClick={() => updateFormData('storytelling_style',
                            toggleArrayItem(formData.storytelling_style, style.name)
                          )}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all text-center',
                            formData.storytelling_style.includes(style.name)
                              ? 'border-earth-500 bg-earth-50 text-earth-700'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="mb-2 flex justify-center">
                            {style.icon}
                          </div>
                          <Typography variant="small" className="font-medium">
                            {style.name}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Topics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Topics (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {preferredTopics.map((topic) => (
                        <div
                          key={topic}
                          onClick={() => updateFormData('preferred_topics',
                            toggleArrayItem(formData.preferred_topics, topic)
                          )}
                          className={cn(
                            'p-2 border rounded-md cursor-pointer transition-all text-center text-sm',
                            formData.preferred_topics.includes(topic)
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
              </div>
            )}

            {/* Step 3: Cultural Protocols */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Crown className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                  <Typography variant="h2" className="mb-2">Cultural Protocols</Typography>
                  <Typography variant="body" className="text-gray-600">
                    Help us respect your cultural practices and protocols
                  </Typography>
                </div>

                <div className="space-y-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      These settings help ensure your storytelling follows appropriate cultural protocols 
                      and community guidelines.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Switch
                        checked={formData.cultural_protocols.requires_introduction}
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
                        checked={formData.cultural_protocols.gender_specific}
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
                        checked={formData.cultural_protocols.age_restricted}
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
                        checked={formData.cultural_protocols.community_approval}
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
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CheckCircle className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                  <Typography variant="h2" className="mb-2">Review & Submit</Typography>
                  <Typography variant="body" className="text-gray-600">
                    Please review your information before submitting your application
                  </Typography>
                </div>

                <div className="space-y-6">
                  {/* Basic Info Review */}
                  <Card className="p-4 border-l-4 border-l-earth-400">
                    <Typography variant="h4" className="mb-3">Basic Information</Typography>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {formData.display_name}</div>
                      <div><strong>Experience:</strong> {formData.years_of_experience || 'New storyteller'} years</div>
                      <div><strong>Elder Status:</strong> {formData.elder_status ? 'Yes' : 'No'}</div>
                      <div><strong>Bio:</strong> {formData.bio.substring(0, 100)}...</div>
                    </div>
                  </Card>

                  {/* Cultural Background Review */}
                  <Card className="p-4 border-l-4 border-l-sage-400">
                    <Typography variant="h4" className="mb-3">Cultural Background</Typography>
                    <div className="space-y-2 text-sm">
                      <div><strong>Primary Background:</strong> {formData.cultural_background}</div>
                      {formData.community_recognition && (
                        <div><strong>Community Recognition:</strong> Provided</div>
                      )}
                    </div>
                  </Card>

                  {/* Expertise Review */}
                  <Card className="p-4 border-l-4 border-l-purple-400">
                    <Typography variant="h4" className="mb-3">Storytelling Expertise</Typography>
                    <div className="space-y-2 text-sm">
                      <div><strong>Specialties:</strong> {formData.specialties.join(', ')}</div>
                      <div><strong>Styles:</strong> {formData.storytelling_style.join(', ')}</div>
                      {formData.preferred_topics.length > 0 && (
                        <div><strong>Preferred Topics:</strong> {formData.preferred_topics.slice(0, 3).join(', ')}
                        {formData.preferred_topics.length > 3 && ` +${formData.preferred_topics.length - 3} more`}</div>
                      )}
                    </div>
                  </Card>

                  <Alert className="border-amber-200 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      Your application will be reviewed by our cultural team. This process typically takes 
                      3-5 business days. You'll receive an email notification once your application is approved.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 mt-8 border-t">
              <Button 
                variant="ghost" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={submitForm}
                  disabled={loading || !canProceed()}
                  className="bg-earth-600 hover:bg-earth-700"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}