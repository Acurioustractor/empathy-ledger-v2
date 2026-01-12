'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  ImageIcon,
  Video,
  CheckCircle,
  Loader2,
  X,
  User,
  Building2,
  FolderKanban,
  Filter,
  Grid3X3,
  LayoutGrid
} from 'lucide-react'

interface MediaAsset {
  id: string
  title?: string
  original_filename: string
  cdn_url?: string
  thumbnail_url?: string
  file_type: string
  organization_id?: string
  project_id?: string
  storyteller_ids?: string[]
  cultural_sensitivity_level?: string
  created_at: string
  organization?: {
    id: string
    name: string
  }
  project?: {
    id: string
    name: string
  }
}

interface Organization {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface Storyteller {
  id: string
  display_name: string
  avatar_url?: string
}

interface EnhancedMediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: MediaAsset) => void
  filterType?: 'image' | 'video' | 'all'
  title?: string
  currentStoryId?: string
  currentStorytellerId?: string
}

export default function EnhancedMediaPicker({
  open,
  onOpenChange,
  onSelect,
  filterType = 'all',
  title = 'Select Media',
  currentStoryId,
  currentStorytellerId
}: EnhancedMediaPickerProps) {
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStoryteller, setSelectedStoryteller] = useState<string>('all')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [gridSize, setGridSize] = useState<'small' | 'large'>('small')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch filter options on mount
  useEffect(() => {
    if (open) {
      fetchFilterOptions()
      fetchMedia()
    }
  }, [open])

  // Re-fetch media when filters change
  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [selectedOrg, selectedProject, selectedStoryteller, filterType])

  const fetchFilterOptions = async () => {
    try {
      // Fetch organizations
      const orgsRes = await fetch('/api/organizations?limit=50')
      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations || data || [])
      }

      // Fetch projects
      const projectsRes = await fetch('/api/projects?limit=50')
      if (projectsRes.ok) {
        const data = await projectsRes.json()
        setProjects(data.projects || data || [])
      }

      // Fetch storytellers
      const storytellersRes = await fetch('/api/storytellers?limit=100')
      if (storytellersRes.ok) {
        const data = await storytellersRes.json()
        setStorytellers(data.storytellers || data || [])
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchMedia = async () => {
    try {
      setLoading(true)
      let url = '/api/media?limit=200'

      if (selectedOrg && selectedOrg !== 'all') {
        url += `&organization_id=${selectedOrg}`
      }
      if (selectedProject && selectedProject !== 'all') {
        url += `&project_id=${selectedProject}`
      }
      if (filterType === 'image') {
        url += '&file_type=image'
      } else if (filterType === 'video') {
        url += '&file_type=video'
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter media client-side for search and storyteller
  const filteredMedia = media.filter(item => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        item.title?.toLowerCase().includes(search) ||
        item.original_filename?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }

    // Storyteller filter (if we had storyteller_ids on media)
    if (selectedStoryteller && selectedStoryteller !== 'all') {
      // For now, this would require the detected_people_ids field to be populated
      // We'll add this functionality when we implement person tagging
    }

    return true
  })

  // Sort: prioritize media featuring the current storyteller
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    // If current storyteller is set, prioritize their photos
    if (currentStorytellerId) {
      const aHasStoryteller = a.storyteller_ids?.includes(currentStorytellerId)
      const bHasStoryteller = b.storyteller_ids?.includes(currentStorytellerId)
      if (aHasStoryteller && !bHasStoryteller) return -1
      if (!aHasStoryteller && bHasStoryteller) return 1
    }
    // Then sort by date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const clearFilters = () => {
    setSelectedOrg('all')
    setSelectedProject('all')
    setSelectedStoryteller('all')
    setSearchTerm('')
  }

  const hasActiveFilters = selectedOrg !== 'all' || selectedProject !== 'all' || selectedStoryteller !== 'all' || searchTerm

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-sage-500 text-sage-700' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setGridSize(gridSize === 'small' ? 'large' : 'small')}
            >
              {gridSize === 'small' ? <LayoutGrid className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
              {/* Organization Filter */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-500" />
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-stone-500" />
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(proj => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Storyteller Filter */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-stone-500" />
                <Select value={selectedStoryteller} onValueChange={setSelectedStoryteller}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All People" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All People</SelectItem>
                    {currentStorytellerId && (
                      <SelectItem value={currentStorytellerId}>
                        Current Storyteller
                      </SelectItem>
                    )}
                    {storytellers.map(st => (
                      <SelectItem key={st.id} value={st.id}>{st.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>{sortedMedia.length} photos found</span>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-sage-600">
                Filters active
              </Badge>
            )}
          </div>

          {/* Media Grid */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
              </div>
            ) : sortedMedia.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No media found</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters to see all media
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-3 pb-4 ${
                gridSize === 'small'
                  ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}>
                {sortedMedia.map((item) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-stone-100 aspect-square"
                    onClick={() => {
                      onSelect(item)
                      onOpenChange(false)
                    }}
                  >
                    {/* Thumbnail */}
                    {item.cdn_url || item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url || item.cdn_url || ''}
                        alt={item.title || item.original_filename}
                        fill
                        sizes={gridSize === 'small' ? '150px' : '200px'}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-200">
                        {item.file_type === 'video' ? (
                          <Video className="w-8 h-8 text-stone-400" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-stone-400" />
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Video Badge */}
                    {item.file_type === 'video' && (
                      <Badge className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5">
                        <Video className="w-3 h-3" />
                      </Badge>
                    )}

                    {/* Storyteller Match Indicator */}
                    {currentStorytellerId && item.storyteller_ids?.includes(currentStorytellerId) && (
                      <Badge className="absolute top-1 right-1 bg-sage-500 text-white text-xs px-1.5 py-0.5">
                        <User className="w-3 h-3" />
                      </Badge>
                    )}

                    {/* Title Tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {item.title || item.original_filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
