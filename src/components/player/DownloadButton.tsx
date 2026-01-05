'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileAudio, FileVideo, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DownloadButtonProps {
  mediaUrl: string
  mediaType: 'audio' | 'video'
  title: string
  className?: string
}

export function DownloadButton({
  mediaUrl,
  mediaType,
  title,
  className
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (format: 'original' | 'transcript') => {
    if (!mediaUrl) return

    setDownloading(true)

    try {
      if (format === 'original') {
        // Download the media file
        const response = await fetch(mediaUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Get file extension from URL or use default
        const extension = mediaUrl.split('.').pop()?.split('?')[0] || (mediaType === 'audio' ? 'mp3' : 'mp4')
        const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`

        // Create download link
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Clean up
        window.URL.revokeObjectURL(url)
      } else if (format === 'transcript') {
        // TODO: Implement transcript download when available
        console.log('Transcript download not yet implemented')
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Could add toast notification here
    } finally {
      setDownloading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={downloading}
          className={cn(
            "border-[#2C2C2C]/20 hover:bg-[#D97757]/5 hover:border-[#D97757]",
            className
          )}
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleDownload('original')}>
          {mediaType === 'audio' ? (
            <FileAudio className="w-4 h-4 mr-2" />
          ) : (
            <FileVideo className="w-4 h-4 mr-2" />
          )}
          <div className="flex flex-col">
            <span className="font-medium">Download {mediaType}</span>
            <span className="text-xs text-[#2C2C2C]/60">Original quality</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleDownload('transcript')} disabled>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex flex-col">
            <span className="font-medium">Download transcript</span>
            <span className="text-xs text-[#2C2C2C]/60">Text format (.txt)</span>
          </div>
        </DropdownMenuItem>

        {/* Cultural notice */}
        <div className="px-2 py-3 border-t border-[#2C2C2C]/10 mt-2">
          <p className="text-xs text-[#2C2C2C]/60 leading-relaxed">
            By downloading, you agree to respect the cultural protocols and use this content
            in accordance with OCAP® principles.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
