'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface FormData {
  title: string
  slug: string
  description: string
  cultural_theme: string
  cultural_significance: string
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  ceremony_type: string
  ceremony_date: string
  ceremony_location: string
  seasonal_context: string
  traditional_knowledge_content: boolean
  requires_elder_approval: boolean
  visibility: 'public' | 'community' | 'organisation' | 'private'
  allow_downloads: boolean
  allow_comments: boolean
  show_metadata: boolean
}

const culturalThemes = [
  { value: '', label: 'Select a theme...' },
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'community', label: 'Community Gathering' },
  { value: 'traditional_practices', label: 'Traditional Practices' },
  { value: 'contemporary', label: 'Contemporary Life' },
  { value: 'family', label: 'Family Stories' },
  { value: 'seasonal', label: 'Seasonal Activities' },
  { value: 'art_culture', label: 'Art & Culture' }
]

const sensitivityLevels = [
  { value: 'low', label: 'Community Open', description: 'Suitable for all community members and visitors' },
  { value: 'medium', label: 'Respectful Viewing', description: 'Requires understanding of cultural context' },
  { value: 'high', label: 'Cultural Guidance', description: 'Requires elder guidance or cultural education' }
]

export default function CreateGalleryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    cultural_theme: '',
    cultural_significance: '',
    cultural_sensitivity_level: 'medium',
    ceremony_type: '',
    ceremony_date: '',
    ceremony_location: '',
    seasonal_context: '',
    traditional_knowledge_content: false,
    requires_elder_approval: false,
    visibility: 'private',
    allow_downloads: false,
    allow_comments: true,
    show_metadata: true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugGenerated, setSlugGenerated] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/galleries/create')
    }
  }, [user, authLoading, router])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !slugGenerated) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, slugGenerated])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Track manual slug changes
      if (name === 'slug') {
        setSlugGenerated(true)
      }
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.title.trim()) errors.push('Title is required')
    if (!formData.slug.trim()) errors.push('Slug is required')
    if (formData.cultural_theme === '') errors.push('Cultural theme is required')
    
    // Check slug format
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/galleries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create gallery')
      }
      
      // Redirect to the new gallery
      router.push(`/galleries/${result.gallery.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-stone-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link href="/galleries" className="text-orange-600 hover:text-orange-700">
            Galleries
          </Link>
          <span className="mx-2 text-stone-500">/</span>
          <span className="text-stone-900">Create Gallery</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-4">Create Photo Gallery</h1>
            <p className="text-lg text-stone-700">
              Create a culturally respectful space to share visual stories and memories
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Spring Ceremony 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="spring-ceremony-2024"
                    />
                    <p className="mt-1 text-xs text-stone-500">
                      Used in the gallery URL. Only letters, numbers, and hyphens allowed.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe the context and significance of these photos..."
                  />
                </div>
              </div>

              {/* Cultural Context */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">Cultural Context</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Cultural Theme *
                    </label>
                    <select
                      name="cultural_theme"
                      value={formData.cultural_theme}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {culturalThemes.map(theme => (
                        <option key={theme.value} value={theme.value}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Cultural Sensitivity Level
                    </label>
                    <div className="space-y-3">
                      {sensitivityLevels.map(level => (
                        <label key={level.value} className="flex items-start">
                          <input
                            type="radio"
                            name="cultural_sensitivity_level"
                            value={level.value}
                            checked={formData.cultural_sensitivity_level === level.value}
                            onChange={handleInputChange}
                            className="mt-0.5 h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-stone-900">{level.label}</div>
                            <div className="text-xs text-stone-500">{level.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cultural Significance
                  </label>
                  <textarea
                    name="cultural_significance"
                    value={formData.cultural_significance}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Explain the cultural importance and any protocols to be observed..."
                  />
                </div>
              </div>

              {/* Ceremonial Context (conditional) */}
              {formData.cultural_theme === 'ceremony' && (
                <div>
                  <h3 className="text-lg font-medium text-stone-900 mb-4">Ceremonial Context</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Ceremony Type
                      </label>
                      <input
                        type="text"
                        name="ceremony_type"
                        value={formData.ceremony_type}
                        onChange={handleInputChange}
                        className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Coming of Age, Harvest"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Ceremony Date
                      </label>
                      <input
                        type="date"
                        name="ceremony_date"
                        value={formData.ceremony_date}
                        onChange={handleInputChange}
                        className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Ceremony Location
                      </label>
                      <input
                        type="text"
                        name="ceremony_location"
                        value={formData.ceremony_location}
                        onChange={handleInputChange}
                        className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Location name or description"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Context */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">Additional Context</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Seasonal Context
                  </label>
                  <input
                    type="text"
                    name="seasonal_context"
                    value={formData.seasonal_context}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Spring planting, Winter teachings"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="traditional_knowledge_content"
                      checked={formData.traditional_knowledge_content}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-stone-900">Contains Traditional Knowledge</div>
                      <div className="text-xs text-stone-500">
                        Photos contain traditional practices, teachings, or cultural knowledge
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="requires_elder_approval"
                      checked={formData.requires_elder_approval}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-stone-900">Requires Elder Approval</div>
                      <div className="text-xs text-stone-500">
                        Gallery needs to be reviewed and approved by community elders
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Privacy & Sharing */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">Privacy & Sharing</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="private">Private - Only visible to you</option>
                    <option value="community">Community - Visible to authenticated users</option>
                    <option value="public">Public - Visible to everyone</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_downloads"
                      checked={formData.allow_downloads}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-stone-900">Allow Downloads</div>
                      <div className="text-xs text-stone-500">
                        Viewers can download photos from this gallery
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_comments"
                      checked={formData.allow_comments}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-stone-900">Allow Comments</div>
                      <div className="text-xs text-stone-500">
                        Viewers can leave respectful comments on photos
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="show_metadata"
                      checked={formData.show_metadata}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-stone-900">Show Photo Metadata</div>
                      <div className="text-xs text-stone-500">
                        Display capture date, location, and other photo information
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/galleries"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colours"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colours flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Create Gallery
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}