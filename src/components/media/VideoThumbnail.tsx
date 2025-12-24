'use client'

import { useState } from 'react'
import { Play, Video } from 'lucide-react'

interface VideoThumbnailProps {
  url: string
  title: string
  className?: string
  onClick?: () => void
}

export function VideoThumbnail({ url, title, className, onClick }: VideoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  // Extract video ID and generate thumbnail URL
  const getVideoThumbnail = (videoUrl: string) => {
    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      // For Vimeo, we'd need to make an API call to get the thumbnail
      // For now, return null and show play icon
      return null
    }

    // For other platforms like Descript, we can't generate thumbnails
    return null
  }

  const thumbnail = getVideoThumbnail(url)

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden ${className}`}
      onClick={onClick}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setThumbnailUrl(null)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-sage-500 to-clay-600 flex items-center justify-center">
          <Video className="w-12 h-12 text-white" />
        </div>
      )}

      {/* Play overlay */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/90 rounded-full p-3">
          <Play className="w-6 h-6 text-stone-800 ml-1" />
        </div>
      </div>

      {/* Video indicator */}
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        <Video className="w-3 h-3" />
        Video
      </div>
    </div>
  )
}