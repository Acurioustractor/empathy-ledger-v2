'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Calendar, 
  ExternalLink,
  BookOpen,
  Heart,
  Eye,
  Filter
} from 'lucide-react'

interface Story {
  id: string
  title: string
  author_id: string
  story_type: string | null
  privacy_level: string
  cultural_sensitivity_level: string | null
  status: string | null
  themes: string[] | null
  created_at: string
  author?: {
    display_name: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

interface StoryCollectionProps {
  stories: Story[]
  organizationId: string
}

export function StoryCollection({ stories, organizationId }: StoryCollectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all')

  const filteredStories = stories.filter(story => {
    const title = story.title || ''
    const themes = (story.themes || []).join(' ')
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      themes.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === 'all' || story.story_type === selectedType
    const matchesPrivacy = selectedPrivacy === 'all' || story.privacy_level === selectedPrivacy

    return matchesSearch && matchesType && matchesPrivacy
  })

  const storyTypes = [
    'all',
    ...new Set(stories.map(s => s.story_type).filter(Boolean))
  ]

  const privacyLevels = [
    'all',
    ...new Set(stories.map(s => s.privacy_level).filter(Boolean))
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Story Collection</h2>
          <p className="text-muted-foreground">
            {stories.length} stories shared by your community
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-2">
          <BookOpen className="h-4 w-4" />
          {stories.length} Stories
        </Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stories by title or themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {storyTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPrivacy}
            onChange={(e) => setSelectedPrivacy(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {privacyLevels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Privacy' : level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <Card key={story.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2 mb-2">
                    {story.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={story.author?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {(story.author?.display_name || story.author?.full_name || 'A')
                          .charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">
                      {story.author?.display_name || story.author?.full_name || 'Anonymous'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {story.story_type && (
                    <Badge variant="outline" className="text-xs">
                      {story.story_type}
                    </Badge>
                  )}
                  
                  {story.privacy_level === 'private' && (
                    <Badge variant="secondary" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{new Date(story.created_at).toLocaleDateString()}</span>
                
                {story.status && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {story.status}
                    </Badge>
                  </>
                )}
              </div>
              
              {story.cultural_sensitivity_level && (
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {story.cultural_sensitivity_level} sensitivity
                  </span>
                </div>
              )}
              
              {story.themes && story.themes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Themes</p>
                  <div className="flex flex-wrap gap-1">
                    {story.themes.slice(0, 3).map((theme, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                    {story.themes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{story.themes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/stories/${story.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Story
                  </Link>
                </Button>
                
                <Button size="sm" variant="ghost">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stories found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  )
}