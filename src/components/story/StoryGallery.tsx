'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'video'
  caption?: string
  cultural_tags?: string[]
  alt_text?: string
}

interface StoryGalleryProps {
  media: MediaAsset[]
  className?: string
}

export function StoryGallery({ media, className }: StoryGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!media || media.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  const currentMedia = media[currentIndex]

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("space-y-4", className)}>
        <h3 className="font-serif text-2xl font-bold text-[#2C2C2C]">
          Media Gallery
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-[#F8F6F1] hover:ring-2 hover:ring-[#D97757] transition-all"
            >
              {item.type === 'image' ? (
                <Image
                  src={item.url}
                  alt={item.alt_text || item.caption || 'Gallery image'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="text-white text-4xl">▶</span>
                </div>
              )}

              {/* Cultural Tags Overlay */}
              {item.cultural_tags && item.cultural_tags.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-white/90 text-[#2C2C2C] backdrop-blur-sm"
                  >
                    {item.cultural_tags[0]}
                  </Badge>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 text-white hover:bg-white/10"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Content */}
          <div className="max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center p-4">
            {/* Image */}
            <div className="relative flex-1 w-full max-h-[calc(90vh-150px)] flex items-center justify-center">
              {currentMedia.type === 'image' ? (
                <div className="relative w-full h-full">
                  <Image
                    src={currentMedia.url}
                    alt={currentMedia.alt_text || currentMedia.caption || 'Gallery image'}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <video
                  src={currentMedia.url}
                  controls
                  className="max-w-full max-h-full"
                />
              )}
            </div>

            {/* Caption & Metadata */}
            {(currentMedia.caption || currentMedia.cultural_tags) && (
              <div className="mt-4 w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                {currentMedia.caption && (
                  <p className="text-sm mb-2">{currentMedia.caption}</p>
                )}
                {currentMedia.cultural_tags && currentMedia.cultural_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentMedia.cultural_tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-white/90 text-[#2C2C2C]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Counter */}
            {media.length > 1 && (
              <div className="mt-2 text-white/70 text-sm">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
