'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft,
  Camera,
  Crown,
  Eye,
  User,
  Plus,
  Calendar,
  MapPin,
  Users,
  Star,
  ExternalLink
} from 'lucide-react'

interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  cultural_theme: string | null
  cultural_significance: string | null
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  ceremony_type: string | null
  ceremony_date: string | null
  ceremony_location: string | null
  photo_count: number
  view_count: number
  featured: boolean
  status: 'active' | 'archived' | 'draft'
  created_at: string
  cover_image?: {
    id: string
    public_url?: string
    thumbnail_url?: string
    alt_text?: string
    title?: string
  }
  creator?: {
    id: string
    display_name: string
    avatar_url?: string
  }
}

interface Storyteller {
  id: string
  display_name: string
}

const culturalSensitivityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800'
}

export default function StorytellerGalleriesPage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [featuredInGalleries, setFeaturedInGalleries] = useState<Gallery[]>([])
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    async function fetchGalleries() {
      try {
        setLoading(true)
        const response = await fetch(`/api/storytellers/${storytellerId}/galleries`)
        if (!response.ok) {
          throw new Error('Failed to fetch galleries')
        }

        const data = await response.json()
        setGalleries(data.galleries || [])
        setFeaturedInGalleries(data.featured_in || [])
        setStoryteller(data.storyteller)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (storytellerId) {
      fetchGalleries()
    }
  }, [storytellerId])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-200 rounded w-64 mb-4"></div>
            <div className="h-32 bg-earth-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-earth-200 rounded-lg"></div>
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
              Unable to Load Galleries
            </Typography>
            <Typography variant="body" className="text-gray-600 mb-6">
              {error}
            </Typography>
            <Button asChild>
              <Link href={`/storytellers/${storytellerId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const GalleryCard = ({ gallery, isCreated = true }: { gallery: Gallery, isCreated?: boolean }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {gallery.cover_image?.public_url || gallery.cover_image?.thumbnail_url ? (
          <Image
            src={gallery.cover_image.thumbnail_url || gallery.cover_image.public_url || ''}
            alt={gallery.cover_image.alt_text || gallery.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-earth-100 to-sage-100">
            <Camera className="w-16 h-16 text-earth-300" />
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {gallery.featured && (
            <Badge className="bg-amber-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge className={cn('text-xs', culturalSensitivityColors[gallery.cultural_sensitivity_level])}>
            {gallery.cultural_sensitivity_level} sensitivity
          </Badge>
        </div>

        {/* Photo Count */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {gallery.photo_count} photos
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <Link href={`/galleries/${gallery.id}`}>
            <Typography 
              variant="h4" 
              className="group-hover:text-earth-700 transition-colors cursor-pointer line-clamp-2"
            >
              {gallery.title}
            </Typography>
          </Link>
          
          {!isCreated && (
            <Typography variant="small" className="text-purple-600 font-medium">
              Featured in this gallery
            </Typography>
          )}
        </div>

        {gallery.description && (
          <Typography variant="small" className="text-gray-600 mb-3 line-clamp-2">
            {gallery.description}
          </Typography>
        )}

        {/* Cultural Info */}
        <div className="space-y-2 mb-4">
          {gallery.cultural_theme && (
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-sage-500" />
              <Typography variant="small" className="text-sage-700">
                {gallery.cultural_theme}
              </Typography>
            </div>
          )}

          {gallery.ceremony_location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-earth-500" />
              <Typography variant="small" className="text-earth-700">
                {gallery.ceremony_location}
              </Typography>
            </div>
          )}

          {gallery.ceremony_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-500" />
              <Typography variant="small" className="text-blue-700">
                {formatDate(gallery.ceremony_date)}
              </Typography>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{gallery.view_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>{gallery.photo_count}</span>
            </div>
          </div>
          <Typography variant="small" className="text-gray-400">
            {formatDate(gallery.created_at)}
          </Typography>
        </div>

        {/* Action */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group/button"
          asChild
        >
          <Link href={`/galleries/${gallery.id}`}>
            View Gallery
            <ExternalLink className="w-3 h-3 ml-2 group-hover/button:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/storytellers/${storytellerId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-6">
              {storyteller && (
                <>
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={galleries[0]?.creator?.avatar_url} 
                      alt={storyteller.display_name}
                    />
                    <AvatarFallback className="bg-earth-200 text-earth-700 text-lg">
                      {getInitials(storyteller.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h1" className="text-earth-800">
                        Photo Galleries by {storyteller.display_name}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        <span>{galleries.length} created galleries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{featuredInGalleries.length} featured appearances</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/storytellers/${storytellerId}/stories`}>
                        View Stories
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/galleries/create?storyteller=${storytellerId}`}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Gallery
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Created Galleries Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h2" className="text-earth-800">
              Created Galleries ({galleries.length})
            </Typography>
            {galleries.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/galleries?creator=${storytellerId}`}>
                  View All
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>

          {galleries.length === 0 ? (
            <Card className="p-12 text-center">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h3" className="text-gray-600 mb-2">
                No Galleries Created Yet
              </Typography>
              <Typography variant="body" className="text-gray-500 mb-6">
                {storyteller?.display_name || 'This storyteller'} hasn't created any photo galleries yet.
              </Typography>
              <Button asChild>
                <Link href={`/galleries/create?storyteller=${storytellerId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Gallery
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <GalleryCard key={gallery.id} gallery={gallery} isCreated={true} />
              ))}
            </div>
          )}
        </div>

        {/* Featured In Galleries Section */}
        {featuredInGalleries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h2" className="text-earth-800">
                Featured In Galleries ({featuredInGalleries.length})
              </Typography>
            </div>

            <Typography variant="body" className="text-gray-600 mb-6">
              Photo galleries where {storyteller?.display_name || 'this storyteller'} appears in the photos.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredInGalleries.map((galleryData) => (
                <GalleryCard 
                  key={galleryData.id} 
                  gallery={galleryData as Gallery} 
                  isCreated={false} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Content */}
        {galleries.length === 0 && featuredInGalleries.length === 0 && (
          <Card className="p-12 text-center">
            <Camera className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <Typography variant="h2" className="text-gray-600 mb-4">
              No Photo Galleries Yet
            </Typography>
            <Typography variant="body" className="text-gray-500 mb-8 max-w-2xl mx-auto">
              {storyteller?.display_name || 'This storyteller'} hasn't created any photo galleries 
              and doesn't appear in any existing galleries yet. Start building visual stories by 
              creating the first gallery.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href={`/galleries/create?storyteller=${storytellerId}`}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Gallery
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/galleries">
                  Explore All Galleries
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}