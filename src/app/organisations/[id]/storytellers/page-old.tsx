'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  FileText,
  BookOpen,
  Users,
  Video,
  ChevronRight,
  MessageCircle,
  UserPlus,
  UserMinus,
  Trash2,
  Search,
  VideoIcon
} from 'lucide-react'
import { VideoManager } from '@/components/storyteller/VideoManager'

interface TranscriptSummary {
  id: string
  title: string
  wordCount: number
  characterCount: number
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  status: string
  createdAt: string
}

interface StorySummary {
  id: string
  title: string
  status: string
  hasVideo: boolean
  themes: string[]
  createdAt: string
}

interface StorytellerData {
  id: string
  fullName: string
  displayName: string
  bio?: string
  avatarUrl?: string
  videoIntroductionUrl?: string
  featuredVideoUrl?: string
  transcripts: TranscriptSummary[]
  stories: StorySummary[]
  stats: {
    totalTranscripts: number
    totalStories: number
    totalVideos: number
    totalCharacters: number
  }
}

interface OrganizationStorytellerStats {
  totalStorytellers: number
  totalTranscripts: number
  totalStories: number
  totalVideos: number
  storytellersWithTranscripts: number
  storytellersWithStories: number
  storytellersWithVideos: number
}

interface ApiResponse {
  success: boolean
  organisation: {
    id: string
    name: string
  }
  storytellers: StorytellerData[]
  stats: OrganizationStorytellerStats
}

interface SearchUser {
  id: string
  name: string
  fullName: string
  displayName: string
  email: string
  bio?: string
  avatarUrl?: string
  isStoryteller: boolean
}

export default function OrganizationStorytellersPage() {
  const params = useParams()
  const organizationId = params.id as string
  
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [videoManagerStorytellerId, setVideoManagerStorytellerId] = useState<string | null>(null)

  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/organisations/${organizationId}/storytellers`)
        const result: ApiResponse = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch storytellers')
        }
        
        setData(result)
      } catch (err) {
        console.error('Error fetching storytellers:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (organizationId) {
      fetchStorytellers()
    }
  }, [organizationId])

  const removeStoryteller = async (storytellerId: string, storytellerName: string) => {
    if (!confirm(`Are you sure you want to remove ${storytellerName} from this organisation?`)) {
      return
    }

    try {
      setIsRemoving(storytellerId)

      // Call API to remove storyteller from organisation
      const response = await fetch(`/api/organisations/${organizationId}/storytellers/${storytellerId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        // Remove from local state
        setData(prev => prev ? {
          ...prev,
          storytellers: prev.storytellers.filter(s => s.id !== storytellerId),
          stats: {
            ...prev.stats,
            totalStorytellers: prev.stats.totalStorytellers - 1
          }
        } : null)

        // Show success message
        alert(result.message || 'Storyteller removed successfully')
      } else {
        const errorMessage = result.error || result.message || 'Failed to remove storyteller'
        console.error('Remove error:', result)
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error removing storyteller:', error)
      alert('Failed to remove storyteller')
    } finally {
      setIsRemoving(null)
    }
  }

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&excludeOrg=${organizationId}`)
      const result = await response.json()

      if (result.success) {
        setSearchResults(result.users)
      } else {
        console.error('Search failed:', result.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showAddDialog && searchQuery) {
        searchUsers(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, showAddDialog, organizationId])

  const addStoryteller = async (userId: string, userName: string) => {
    try {
      setIsAdding(userId)

      const response = await fetch(`/api/organisations/${organizationId}/storytellers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh the storytellers list
        const refreshResponse = await fetch(`/api/organisations/${organizationId}/storytellers`)
        const refreshResult = await refreshResponse.json()

        if (refreshResult.success) {
          setData(refreshResult)
        }

        // Close dialog and reset state
        setShowAddDialog(false)
        setSearchQuery('')
        setSearchResults([])

        alert(result.message || `${userName} has been added successfully`)
      } else {
        alert(`Error: ${result.error || 'Failed to add storyteller'}`)
      }
    } catch (error) {
      console.error('Error adding storyteller:', error)
      alert('Failed to add storyteller')
    } finally {
      setIsAdding(null)
    }
  }

  const openAddDialog = () => {
    setShowAddDialog(true)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleVideoSave = (videos: { videoIntroUrl: string; featuredVideoUrl: string }) => {
    // Update the storyteller in local state with new video URLs
    setData(prev => prev ? {
      ...prev,
      storytellers: prev.storytellers.map(storyteller =>
        storyteller.id === videoManagerStorytellerId
          ? {
              ...storyteller,
              videoIntroductionUrl: videos.videoIntroUrl,
              featuredVideoUrl: videos.featuredVideoUrl
            }
          : storyteller
      )
    } : null)
  }


  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Storytellers</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading storytellers...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Storytellers</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error || 'Failed to load storytellers'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Storytellers</h1>
          <Badge variant="secondary">{data.stats.totalStorytellers}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openAddDialog} className="bg-earth-600 hover:bg-earth-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Storyteller
          </Button>
          <Badge variant="outline">
            {data.organisation.name}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transcripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sage-500" />
              <span className="text-2xl font-bold">{data.stats.totalTranscripts}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{data.stats.totalStories}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Video Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-clay-500" />
              <span className="text-2xl font-bold">{data.stats.totalVideos}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">
                {data.stats.storytellersWithTranscripts + data.stats.storytellersWithStories}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storytellers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.storytellers.map((storyteller) => {
          const displayName = storyteller.displayName || storyteller.fullName
          const themes = storyteller.stories.flatMap(s => s.themes || []).filter(theme => theme && theme.length > 3).slice(0, 3)

          return (
            <Card key={storyteller.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-earth-200">
              {/* Header with Avatar and Name */}
              <div className="bg-gradient-to-r from-earth-50 to-sage-50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-16 w-16 ring-3 ring-white shadow-md">
                    <AvatarImage src={storyteller.avatarUrl || ''} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 font-semibold text-lg">
                      {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-stone-900 truncate">{displayName}</h3>
                    <div className="flex items-center gap-3 text-sm text-stone-600 mt-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{storyteller.stats.totalStories}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>{storyteller.stats.totalVideos}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Link href={`/storytellers/${storyteller.id}/dashboard?org=${organizationId}`} className="flex-1 min-w-0">
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs px-2 bg-white/80 hover:bg-white">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      <span className="truncate">Dashboard</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-white/80 hover:bg-white shrink-0"
                    onClick={() => setVideoManagerStorytellerId(storyteller.id)}
                    title="Manage Videos"
                  >
                    <VideoIcon className="h-3 w-3 text-sage-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-white/80 hover:bg-white shrink-0"
                    onClick={() => removeStoryteller(storyteller.id, displayName)}
                    disabled={isRemoving === storyteller.id}
                    title="Remove Storyteller"
                  >
                    {isRemoving === storyteller.id ? (
                      <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="h-3 w-3 text-red-600" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                {/* Bio */}
                {storyteller.bio && (
                  <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                    {storyteller.bio}
                  </p>
                )}

                {/* Story Themes */}
                {themes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-stone-500 mb-2">Story Themes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {themes.map((theme, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-earth-50 text-earth-700 border-earth-200"
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-sm">
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{storyteller.stats.totalTranscripts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{storyteller.stats.totalStories}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>{storyteller.stats.totalVideos}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {data.storytellers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No storytellers found</h3>
            <p className="text-muted-foreground">
              No storytellers are currently connected to {data.organisation.name}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Storyteller Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Storyteller</DialogTitle>
            <DialogDescription>
              Search for users to add as storytellers to {data?.organisation.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addStoryteller(user.id, user.name)}
                        disabled={isAdding === user.id}
                        className="bg-earth-600 hover:bg-earth-700"
                      >
                        {isAdding === user.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">No users found</p>
                </div>
              ) : searchQuery.length > 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Manager Dialog */}
      {videoManagerStorytellerId && (
        <VideoManager
          storytellerId={videoManagerStorytellerId}
          storytellerName={
            data.storytellers.find(s => s.id === videoManagerStorytellerId)?.displayName ||
            data.storytellers.find(s => s.id === videoManagerStorytellerId)?.fullName ||
            'Storyteller'
          }
          currentVideoIntroUrl={
            data.storytellers.find(s => s.id === videoManagerStorytellerId)?.videoIntroductionUrl || ''
          }
          currentFeaturedVideoUrl={
            data.storytellers.find(s => s.id === videoManagerStorytellerId)?.featuredVideoUrl || ''
          }
          onClose={() => setVideoManagerStorytellerId(null)}
          onSave={handleVideoSave}
        />
      )}
    </div>
  )
}