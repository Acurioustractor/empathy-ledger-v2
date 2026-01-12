'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface SimilarMediaItem {
  id: string
  title: string
  thumbnailUrl: string
  cdnUrl: string
  fileType: string
  similarityScore: number
  matchReasons: string[]
}

interface SimilarMediaProps {
  mediaId: string
  onSelect?: (mediaId: string) => void
  limit?: number
}

export function SimilarMedia({ mediaId, onSelect, limit = 8 }: SimilarMediaProps) {
  const [similar, setSimilar] = useState<SimilarMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<{ id: string; title: string; thumbnailUrl: string } | null>(null)

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!mediaId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/media/similar?id=${mediaId}&limit=${limit}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to find similar media')
        }

        setSimilar(data.similar || [])
        setSource(data.source || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load similar media')
        setSimilar([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilar()
  }, [mediaId, limit])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sage-600" />
            Similar Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-32 h-32 rounded-lg shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sage-600" />
            Similar Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (similar.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sage-600" />
            Similar Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No similar media found. Add more tags or metadata to improve recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sage-600" />
          Similar Media
        </CardTitle>
        <CardDescription>
          Based on shared tags, people, location, and visual similarity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {similar.map((item) => (
              <div
                key={item.id}
                className="group relative w-36 shrink-0 cursor-pointer"
                onClick={() => onSelect?.(item.id)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-sage-400 transition-colors">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.fileType === 'video' && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs px-1">
                        <Video className="h-3 w-3" />
                      </Badge>
                    </div>
                  )}
                  {/* Similarity Score */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`text-xs ${
                        item.similarityScore >= 60
                          ? 'bg-sage-600'
                          : item.similarityScore >= 30
                          ? 'bg-amber-500'
                          : 'bg-stone-500'
                      }`}
                    >
                      {Math.round(item.similarityScore)}%
                    </Badge>
                  </div>
                  {/* Hover overlay with match reasons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <div className="text-center">
                      <p className="text-white text-xs font-medium mb-1">Match reasons:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {item.matchReasons.slice(0, 3).map((reason, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
