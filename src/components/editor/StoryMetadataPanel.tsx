'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface StoryData {
  title: string
  excerpt: string
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  cultural_tags: string[]
}

interface StoryMetadataPanelProps {
  story: StoryData
  onChange: (updates: Partial<StoryData>) => void
  className?: string
}

const CULTURAL_THEMES = [
  'Land & Territory',
  'Elders & Wisdom',
  'Language & Culture',
  'Healing & Wellness',
  'Youth & Education',
  'Traditional Knowledge',
  'Ceremony & Spirituality',
  'Art & Creativity',
  'Family & Community',
  'Justice & Rights',
  'Environmental Stewardship',
  'Economic Development',
  'Health & Medicine',
  'Food Sovereignty',
  'Cultural Protocols',
  'Reconciliation',
  'Resilience & Survival',
  'Migration & Diaspora',
  'Gender & Identity',
  'Technology & Innovation'
]

export function StoryMetadataPanel({
  story,
  onChange,
  className
}: StoryMetadataPanelProps) {
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (tagInput && !story.cultural_tags.includes(tagInput)) {
      onChange({
        cultural_tags: [...story.cultural_tags, tagInput]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange({
      cultural_tags: story.cultural_tags.filter(t => t !== tag)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement actual image upload
    // For now, create a local URL
    const url = URL.createObjectURL(file)
    onChange({ featured_image_url: url })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Story Title */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label htmlFor="story-title" className="text-sm font-medium">
            Story Title *
          </Label>
          <Input
            id="story-title"
            value={story.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Enter your story title..."
            className="text-lg font-serif"
          />
        </div>
      </Card>

      {/* Story Type */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label htmlFor="story-type" className="text-sm font-medium">
            Story Type *
          </Label>
          <Select
            value={story.story_type}
            onValueChange={(value: any) => onChange({ story_type: value })}
          >
            <SelectTrigger id="story-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Story</SelectItem>
              <SelectItem value="audio">Audio Story</SelectItem>
              <SelectItem value="video">Video Story</SelectItem>
              <SelectItem value="mixed">Mixed Media</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[#2C2C2C]/60">
            Choose the primary format of your story
          </p>
        </div>
      </Card>

      {/* Featured Image */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Featured Image</Label>

          {story.featured_image_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#F8F6F1]">
              <Image
                src={story.featured_image_url}
                alt="Featured image"
                fill
                className="object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => onChange({ featured_image_url: undefined })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="aspect-video rounded-lg border-2 border-dashed border-[#2C2C2C]/20 hover:border-[#D97757] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#F8F6F1]">
                <ImageIcon className="w-8 h-8 text-[#2C2C2C]/40" />
                <span className="text-sm text-[#2C2C2C]/60">
                  Click to upload image
                </span>
              </div>
            </label>
          )}
        </div>
      </Card>

      {/* Excerpt */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label htmlFor="story-excerpt" className="text-sm font-medium">
            Story Excerpt
          </Label>
          <Textarea
            id="story-excerpt"
            value={story.excerpt}
            onChange={(e) => onChange({ excerpt: e.target.value })}
            placeholder="A brief summary of your story (2-3 sentences)..."
            className="min-h-[80px] resize-none"
            maxLength={300}
          />
          <p className="text-xs text-[#2C2C2C]/60">
            {story.excerpt.length} / 300 characters
          </p>
        </div>
      </Card>

      {/* Cultural Tags */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cultural Themes</Label>

          {/* Tag Input */}
          <div className="flex gap-2">
            <Select value={tagInput} onValueChange={setTagInput}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme..." />
              </SelectTrigger>
              <SelectContent>
                {CULTURAL_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddTag}
              disabled={!tagInput}
              className="bg-[#D97757] hover:bg-[#D97757]/90"
            >
              Add
            </Button>
          </div>

          {/* Selected Tags */}
          {story.cultural_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.cultural_tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[#D4A373]/20 text-[#2C2C2C] border border-[#D4A373]/30"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-[#2C2C2C]/60">
            Add cultural themes to help people discover your story
          </p>
        </div>
      </Card>
    </div>
  )
}
