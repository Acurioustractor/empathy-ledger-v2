'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { StorytellerCard } from '@/components/storyteller/storyteller-card'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { 
  Search, 
  Filter, 
  Crown, 
  MapPin, 
  Users, 
  BookOpen,
  Star,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Storyteller {
  id: string
  display_name: string
  bio: string | null
  cultural_background: string | null
  specialties: string[] | null
  years_of_experience: number | null
  preferred_topics: string[] | null
  story_count: number
  featured: boolean
  status: 'active' | 'inactive' | 'pending'
  elder_status: boolean
  storytelling_style: string[] | null
  profile?: {
    avatar_url?: string
    cultural_affiliations?: string[]
    pronouns?: string
    display_name?: string
    bio?: string
  }
}

interface StorytellerFilters {
  search: string
  culturalBackground: string
  specialty: string
  status: string
  elder: string
  featured: string
  sortBy: string
}

const initialFilters: StorytellerFilters = {
  search: '',
  culturalBackground: 'all',
  specialty: 'all',
  status: 'active',
  elder: 'all',
  featured: 'all',
  sortBy: 'display_name'
}

const culturalBackgrounds = [
  'First Nations',
  'Inuit',
  'Métis',
  'Aboriginal Australian',
  'Torres Strait Islander',
  'Māori',
  'Native American',
  'African Diaspora',
  'Pacific Islander'
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
  'Youth Education'
]

const storytellingStyles = [
  'Oral Tradition',
  'Digital Storytelling',
  'Performance',
  'Written Narrative',
  'Visual Storytelling',
  'Song & Music',
  'Dance & Movement',
  'Interactive'
]

export default function StorytellerDirectoryPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StorytellerFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const stats = useMemo(() => {
    const totalStorytellers = storytellers.length
    const activeStorytellers = storytellers.filter(s => s.status === 'active').length
    const elders = storytellers.filter(s => s.elder_status).length
    const featuredStorytellers = storytellers.filter(s => s.featured).length
    const totalStories = storytellers.reduce((sum, s) => sum + s.story_count, 0)

    return {
      total: totalStorytellers,
      active: activeStorytellers,
      elders,
      featured: featuredStorytellers,
      stories: totalStories
    }
  }, [storytellers])

  // Filtered storytellers
  const filteredStorytellers = useMemo(() => {
    return storytellers.filter(storyteller => {
      // Search filter
      if (filters.search && !storyteller.display_name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !storyteller.bio?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !storyteller.cultural_background?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Cultural background filter
      if (filters.culturalBackground !== 'all' && 
          storyteller.cultural_background !== filters.culturalBackground) {
        return false
      }

      // Specialty filter
      if (filters.specialty !== 'all' && 
          (!storyteller.specialties || !storyteller.specialties.includes(filters.specialty))) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && storyteller.status !== filters.status) {
        return false
      }

      // Elder filter
      if (filters.elder === 'true' && !storyteller.elder_status) {
        return false
      }
      if (filters.elder === 'false' && storyteller.elder_status) {
        return false
      }

      // Featured filter
      if (filters.featured === 'true' && !storyteller.featured) {
        return false
      }
      if (filters.featured === 'false' && storyteller.featured) {
        return false
      }

      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'display_name':
          return a.display_name.localeCompare(b.display_name)
        case 'story_count':
          return b.story_count - a.story_count
        case 'experience':
          return (b.years_of_experience || 0) - (a.years_of_experience || 0)
        case 'featured':
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.display_name.localeCompare(b.display_name)
        default:
          return a.display_name.localeCompare(b.display_name)
      }
    })
  }, [storytellers, filters])

  // Fetch storytellers
  useEffect(() => {
    async function fetchStorytellers() {
      try {
        setLoading(true)
        const response = await fetch('/api/storytellers?status=active&limit=1000')
        if (!response.ok) {
          throw new Error('Failed to fetch storytellers')
        }
        const data = await response.json()
        setStorytellers(data.storytellers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStorytellers()
  }, [])

  const updateFilter = (key: keyof StorytellerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-earth-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-earth-200 rounded-lg"></div>
              ))}
            </div>
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
              Unable to Load Storytellers
            </Typography>
            <Typography variant="body" className="text-gray-600 mb-6">
              {error}
            </Typography>
            <Button onClick={() => window.location.reload()}>
              Try Again
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
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h1" className="mb-4 text-earth-800">
            Community Storytellers
          </Typography>
          <Typography variant="body" className="text-gray-600 max-w-3xl mx-auto">
            Discover the voices that carry our cultural stories forward. Meet our community of storytellers, 
            from traditional knowledge keepers to emerging voices sharing their unique perspectives.
          </Typography>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Typography variant="h2" className="text-slate-800 font-bold">
              {stats.total}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              Community Storytellers
            </Typography>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <Typography variant="h2" className="text-amber-600 font-bold">
              {stats.elders}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              Elder Storytellers
            </Typography>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <Typography variant="h2" className="text-emerald-600 font-bold">
              {stats.stories}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              Stories Shared
            </Typography>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Typography variant="h2" className="text-purple-600 font-bold">
              {stats.featured}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              Featured Stories
            </Typography>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search storytellers by name, background, or bio..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('lg:w-auto', showFilters && 'bg-earth-50')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(filters).some(v => v !== initialFilters[Object.keys(filters).find(k => filters[k] === v) as keyof StorytellerFilters]) && (
                <Badge className="ml-2 bg-earth-600">Active</Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Cultural Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Background
                </label>
                <Select value={filters.culturalBackground} onValueChange={(value) => updateFilter('culturalBackground', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Backgrounds</SelectItem>
                    {culturalBackgrounds.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <Select value={filters.specialty} onValueChange={(value) => updateFilter('specialty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Elder Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elder Status
                </label>
                <Select value={filters.elder} onValueChange={(value) => updateFilter('elder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Storytellers</SelectItem>
                    <SelectItem value="true">Elders Only</SelectItem>
                    <SelectItem value="false">Non-Elders Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="display_name">Name</SelectItem>
                    <SelectItem value="story_count">Story Count</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <div className="md:col-span-2 lg:col-span-4">
                <Button variant="ghost" onClick={resetFilters} className="text-sm">
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <Typography variant="body" className="text-gray-600">
            Showing {filteredStorytellers.length} of {storytellers.length} storytellers
            {filters.search && (
              <span> matching "{filters.search}"</span>
            )}
          </Typography>
        </div>

        {/* Storytellers Grid */}
        {filteredStorytellers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-600 mb-2">
              No Storytellers Found
            </Typography>
            <Typography variant="body" className="text-gray-500 mb-6">
              {filters.search || filters.culturalBackground !== 'all' || filters.specialty !== 'all'
                ? "Try adjusting your search or filters to find storytellers."
                : "No storytellers are currently available."
              }
            </Typography>
            {(filters.search || filters.culturalBackground !== 'all' || filters.specialty !== 'all') && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStorytellers.map((storyteller) => (
              <StorytellerCard
                key={storyteller.id}
                storyteller={storyteller}
                variant="default"
                showStories={true}
              />
            ))}
          </div>
        )}

        {/* Load More (if implementing pagination later) */}
        {filteredStorytellers.length >= 50 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Storytellers
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}