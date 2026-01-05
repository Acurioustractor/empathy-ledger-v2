'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryData {
  title: string
  content: string
  excerpt: string
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  cultural_tags: string[]
  cultural_protocols: string[]
  sensitivity_level: 'public' | 'sensitive' | 'sacred'
  trigger_warnings?: string[]
  cultural_context?: string
}

interface EditorPreviewProps {
  story: StoryData
  className?: string
}

export function EditorPreview({ story, className }: EditorPreviewProps) {
  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = story.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className={cn("p-8 max-w-4xl mx-auto space-y-8", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2C2C2C]/10">
        <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-800">
          <Eye className="w-3 h-3 mr-1" />
          Preview Mode
        </Badge>
        <p className="text-xs text-[#2C2C2C]/60">
          This is how your story will appear to readers
        </p>
      </div>

      {/* Featured Image */}
      {story.featured_image_url && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-[#F8F6F1]">
          <Image
            src={story.featured_image_url}
            alt={story.title || 'Story image'}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Story Header */}
      <div className="space-y-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2C2C2C]">
          {story.title || 'Untitled Story'}
        </h1>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-[#2C2C2C]/60">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
          <Badge className="bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20">
            {story.story_type}
          </Badge>
        </div>

        {/* Excerpt */}
        {story.excerpt && (
          <p className="text-lg text-[#2C2C2C]/80 leading-relaxed">
            {story.excerpt}
          </p>
        )}

        {/* Cultural Tags */}
        {story.cultural_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.cultural_tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-[#D4A373]/20 text-[#2C2C2C] border border-[#D4A373]/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Trigger Warnings */}
      {story.trigger_warnings && story.trigger_warnings.length > 0 && (
        <Card className="p-5 bg-amber-50 border-2 border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">Content Warning</h4>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">
            This story contains content that may be sensitive or triggering for some readers:
          </p>
          <ul className="space-y-1">
            {story.trigger_warnings.map((warning, index) => (
              <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Cultural Context */}
      {story.cultural_context && (
        <Card className="p-5 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20">
          <h4 className="font-semibold text-[#2D5F4F] mb-2">Cultural Context</h4>
          <p className="text-sm text-[#2C2C2C]/80 leading-relaxed">
            {story.cultural_context}
          </p>
        </Card>
      )}

      {/* Cultural Protocols */}
      {story.cultural_protocols.length > 0 && (
        <Card className="p-5 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20">
          <h4 className="font-semibold text-[#2D5F4F] mb-2">Cultural Protocols</h4>
          <p className="text-sm text-[#2C2C2C]/80 mb-3">
            Please observe the following protocols when engaging with this story:
          </p>
          <ul className="space-y-2">
            {story.cultural_protocols.map((protocol, index) => (
              <li key={index} className="text-sm text-[#2C2C2C]/80 flex items-start gap-2">
                <span>•</span>
                <span>{protocol}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Story Content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: story.content || '<p class="text-gray-400 italic">No content yet. Start writing to see your story here.</p>' }}
      />

      {/* Preview Footer */}
      <div className="pt-8 border-t border-[#2C2C2C]/10">
        <p className="text-sm text-[#2C2C2C]/60 text-center">
          End of preview
        </p>
      </div>
    </div>
  )
}
