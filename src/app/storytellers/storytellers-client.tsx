'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { StorytellerCard } from '@/components/storyteller/storyteller-card'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import {
  Search,
  Crown,
  MapPin,
  Users,
  BookOpen,
  Star,
  User,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Calendar,
  TrendingUp,
  Heart,
  Globe,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CULTURAL_BACKGROUNDS,
  SPECIALTIES,
  THEME_CATEGORIES,
  formatThemeLabel
} from '@/lib/constants/themes'

export interface Storyteller {
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
  avatar_url?: string // CRITICAL: Top-level avatar URL for card components
  location?: string | null
  traditional_territory?: string | null
  geographic_scope?: 'local' | 'regional' | 'national' | 'international'
  languages?: string[] | null
  traditional_knowledge_keeper?: boolean
  // AI-enriched fields
  themes?: string[] | null
  ai_summary?: string | null
  profile_completeness?: number | null
  profile?: {
    avatar_url?: string
    cultural_affiliations?: string[]
    pronouns?: string
    display_name?: string
    bio?: string
    languages_spoken?: string[]
  }
  organisations?: Array<{
    id: string
    name: string
    role: string
  }>
  projects?: Array<{
    id: string
    name: string
    role: string
  }>
}

interface StorytellerFilters {
  search: string
  culturalBackground: string
  specialty: string
  theme: string
  status: string
  elder: string
  featured: string
  sortBy: string
}

const initialFilters: StorytellerFilters = {
  search: '',
  culturalBackground: 'all',
  specialty: 'all',
  theme: 'all',
  status: 'all',
  elder: 'all',
  featured: 'all',
  sortBy: 'display_name'
}

// Get all themes as a flat array for filtering
const allThemes = Object.entries(THEME_CATEGORIES).flatMap(([category, data]) =>
  data.themes.map(theme => ({ category, theme }))
)

interface StorytellerDirectoryClientProps {
  initialStorytellers: Storyteller[]
}

export default function StorytellerDirectoryClient({ initialStorytellers }: StorytellerDirectoryClientProps) {
  const [storytellers] = useState<Storyteller[]>(initialStorytellers)
  const [filters, setFilters] = useState<StorytellerFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Debug: Check if avatar_url is present
  if (storytellers.length > 0) {
    console.log('DEBUG: First storyteller data:', {
      name: storytellers[0].display_name,
      avatar_url: storytellers[0].avatar_url,
      profile_avatar_url: storytellers[0].profile?.avatar_url,
      has_avatar: !!(storytellers[0].avatar_url || storytellers[0].profile?.avatar_url)
    })
  }

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

      // Theme filter
      if (filters.theme !== 'all' &&
          (!storyteller.themes || !storyteller.themes.includes(filters.theme))) {
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

  const updateFilter = (key: keyof StorytellerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  // List View Component
  const StorytellerListCard = ({ storyteller }: { storyteller: Storyteller }) => {
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    return (
      <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-100 to-terracotta-100 dark:from-sage-900 dark:to-terracotta-900 flex items-center justify-center border-2 border-background shadow-md">
              {storyteller.profile?.avatar_url ? (
                <img
                  src={storyteller.profile.avatar_url}
                  alt={storyteller.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-foreground/80 font-semibold text-lg">
                  {getInitials(storyteller.display_name)}
                </span>
              )}
            </div>

            {/* Status Indicators */}
            <div className="absolute -top-1 -right-1 flex gap-1">
              {storyteller.featured && (
                <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
              {storyteller.elder_status && (
                <div className="w-5 h-5 bg-clay-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {storyteller.display_name}
                </h3>
                {storyteller.cultural_background && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{storyteller.cultural_background}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/storytellers/${storyteller.id}`}>
                    <User className="w-4 h-4 mr-1" />
                    View Profile
                  </a>
                </Button>
              </div>
            </div>

            {/* Bio Preview */}
            {storyteller.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                {storyteller.bio.length > 150
                  ? `${storyteller.bio.substring(0, 150)}...`
                  : storyteller.bio
                }
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span className="font-medium">{storyteller.story_count}</span>
                <span>{storyteller.story_count === 1 ? 'Story' : 'Stories'}</span>
              </div>

              {storyteller.years_of_experience && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{storyteller.years_of_experience}</span>
                  <span>Years Experience</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-clay-600 dark:text-clay-400" />
                <span className="font-medium capitalize">{storyteller.status}</span>
              </div>
            </div>

            {/* Specialties */}
            {storyteller.specialties && storyteller.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {storyteller.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {storyteller.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{storyteller.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="relative mb-12 overflow-hidden rounded-2xl">
          {/* Background with gradient and subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-sage-100 via-earth-50 to-amber-50 dark:from-sage-900/50 dark:via-earth-900/30 dark:to-amber-900/20"></div>

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-20 w-16 h-16 bg-sage-300 dark:bg-sage-700 rounded-full blur-lg"></div>
            <div className="absolute top-20 right-32 w-12 h-12 bg-earth-300 dark:bg-earth-700 rounded-full blur-lg"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-amber-300 dark:bg-amber-700 rounded-full blur-xl"></div>
          </div>

          <div className="relative px-8 py-16 text-center">
            {/* Main heading with enhanced styling */}
            <div className="mb-6">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-sage-500 to-earth-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <Typography variant="h1" className="text-foreground font-bold">
                  Community Storytellers
                </Typography>
                <div className="w-8 h-8 bg-gradient-to-r from-earth-500 to-amber-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Subtitle badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-sm rounded-full border border-border/40 shadow-sm">
                <Heart className="w-4 h-4 text-primary" />
                <Typography variant="small" className="text-foreground/80 font-medium">
                  Preserving Culture Through Story
                </Typography>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            {/* Enhanced description */}
            <Typography variant="body" className="text-muted-foreground max-w-4xl mx-auto text-lg leading-relaxed">
              Discover the voices that carry our cultural stories forward. Meet our community of storytellers,
              from traditional knowledge keepers to emerging voices sharing their unique perspectives and wisdom
              across generations.
            </Typography>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-sage-600 to-earth-600 hover:from-sage-700 hover:to-earth-700 text-white shadow-lg">
                <Search className="w-4 h-4 mr-2" />
                Explore Stories
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted" asChild>
                <Link href="/about">
                  <Globe className="w-4 h-4 mr-2" />
                  Learn About Our Mission
                </Link>
              </Button>
            </div>

            {/* Featured highlight */}
            <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 dark:bg-amber-900/30 backdrop-blur-sm rounded-full border border-amber-200/60 dark:border-amber-700/60">
              <TrendingUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <Typography variant="small" className="text-amber-700 dark:text-amber-300 font-medium">
                {stats.total} storytellers sharing {stats.stories} stories
              </Typography>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-sage-100 dark:bg-sage-900/50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-sage-600 dark:text-sage-400" />
              </div>
            </div>
            <Typography variant="h2" className="text-foreground font-bold">
              {stats.total}
            </Typography>
            <Typography variant="small" className="text-muted-foreground font-medium">
              Community Storytellers
            </Typography>
          </div>

          <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <Typography variant="h2" className="text-amber-600 dark:text-amber-400 font-bold">
              {stats.elders}
            </Typography>
            <Typography variant="small" className="text-muted-foreground font-medium">
              Elder Storytellers
            </Typography>
          </div>

          <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Typography variant="h2" className="text-emerald-600 dark:text-emerald-400 font-bold">
              {stats.stories}
            </Typography>
            <Typography variant="small" className="text-muted-foreground font-medium">
              Stories Shared
            </Typography>
          </div>

          <div className="text-center p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-clay-100 dark:bg-clay-900/50 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-clay-600 dark:text-clay-400" />
              </div>
            </div>
            <Typography variant="h2" className="text-clay-600 dark:text-clay-400 font-bold">
              {stats.featured}
            </Typography>
            <Typography variant="small" className="text-muted-foreground font-medium">
              Featured Stories
            </Typography>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              className={cn(
                'lg:w-auto flex items-center gap-2 transition-all duration-200',
                showFilters && 'bg-muted border-primary/30'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {Object.values(filters).some(v => v !== initialFilters[Object.keys(filters).find(k => filters[k as keyof StorytellerFilters] === v) as keyof StorytellerFilters]) && (
                <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5">Active</Badge>
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showFilters && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {/* Cultural Background */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Cultural Background
                </label>
                <Select value={filters.culturalBackground} onValueChange={(value) => updateFilter('culturalBackground', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Backgrounds</SelectItem>
                    {CULTURAL_BACKGROUNDS.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>{bg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Specialty
                </label>
                <Select value={filters.specialty} onValueChange={(value) => updateFilter('specialty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>{specialty.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  Theme
                </label>
                <Select value={filters.theme} onValueChange={(value) => updateFilter('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {Object.entries(THEME_CATEGORIES).map(([category, data]) => (
                      <React.Fragment key={category}>
                        <SelectItem value={`__category_${category}`} disabled className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          {data.label}
                        </SelectItem>
                        {data.themes.map((theme) => (
                          <SelectItem key={theme} value={theme} className="pl-6">
                            {formatThemeLabel(theme)}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Elder Status */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
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
                <label className="block text-sm font-medium text-foreground/80 mb-2">
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
              <div className="sm:col-span-2 xl:col-span-5">
                <Button variant="ghost" onClick={resetFilters} className="text-sm">
                  Reset All Filters
                </Button>
              </div>
            </div>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <Typography variant="body" className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredStorytellers.length}</span> of {storytellers.length} storytellers
            {filters.search && (
              <span> matching <span className="font-semibold text-foreground">"{filters.search}"</span></span>
            )}
          </Typography>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm transition-all',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm transition-all',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
              title="List view"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Storytellers Grid */}
        {filteredStorytellers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <Typography variant="h3" className="text-muted-foreground mb-2">
              No Storytellers Found
            </Typography>
            <Typography variant="body" className="text-muted-foreground/70 mb-6">
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
          <div className={cn(
            "transition-all duration-300",
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              : "space-y-4"
          )}>
            {filteredStorytellers.map((storyteller) => {
              if (viewMode === 'list') {
                return (
                  <StorytellerListCard
                    key={storyteller.id}
                    storyteller={storyteller}
                  />
                )
              }

              // Grid view - Use refined storyteller card
              return (
                <StorytellerCard
                  key={storyteller.id}
                  storyteller={storyteller}
                  variant="default"
                />
              )
            })}
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
