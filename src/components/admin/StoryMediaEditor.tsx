'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoEmbed } from '@/components/media/VideoEmbed'
import EnhancedMediaPicker from './EnhancedMediaPicker'
import {
  ImageIcon,
  Video,
  Link as LinkIcon,
  Plus,
  X,
  Star,
  Upload,
  Search,
  ExternalLink,
  Trash2,
  Eye,
  Play,
  FileText,
  Quote,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface MediaAsset {
  id: string
  filename: string
  title?: string
  file_type: string
  public_url?: string
  thumbnail_url?: string
  duration?: number
  cultural_sensitivity_level: string
  created_at: string
}

interface StoryMediaData {
  hero_image_url?: string
  hero_image_caption?: string
  video_url?: string
  video_platform?: string
  video_embed_code?: string
  inline_media?: Array<{
    id: string
    url: string
    type: 'image' | 'video'
    caption?: string
    position?: number
  }>
}

interface TranscriptQuote {
  id: string
  quote_text: string
  speaker?: string
  timestamp?: number
  themes?: string[]
}

interface StoryMediaEditorProps {
  storyId: string
  storyTitle: string
  mediaData: StoryMediaData
  transcriptId?: string
  transcriptQuotes?: TranscriptQuote[]
  onMediaChange: (data: Partial<StoryMediaData>) => void
  isEditing: boolean
  storytellerId?: string
}

export default function StoryMediaEditor({
  storyId,
  storyTitle,
  mediaData,
  transcriptId,
  transcriptQuotes = [],
  onMediaChange,
  isEditing,
  storytellerId
}: StoryMediaEditorProps) {
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [availableMedia, setAvailableMedia] = useState<MediaAsset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'hero' | 'inline'>('hero')
  const [loading, setLoading] = useState(false)
  const [descriptUrl, setDescriptUrl] = useState(mediaData.video_url || '')
  const [expandedQuotes, setExpandedQuotes] = useState(false)

  useEffect(() => {
    fetchAvailableMedia()
  }, [])

  const fetchAvailableMedia = async () => {
    try {
      const response = await fetch('/api/media?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAvailableMedia(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    }
  }

  const handleDescriptUrlChange = (url: string) => {
    setDescriptUrl(url)

    // Parse Descript share URL and extract embed code
    if (url.includes('share.descript.com')) {
      // Descript share URLs can be used directly in iframe
      // Format: https://share.descript.com/view/XXXXX
      const embedCode = url.replace('/view/', '/embed/')
      onMediaChange({
        video_url: url,
        video_platform: 'descript',
        video_embed_code: embedCode
      })
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      onMediaChange({
        video_url: url,
        video_platform: 'youtube',
        video_embed_code: undefined
      })
    } else if (url.includes('vimeo.com')) {
      onMediaChange({
        video_url: url,
        video_platform: 'vimeo',
        video_embed_code: undefined
      })
    } else if (url) {
      onMediaChange({
        video_url: url,
        video_platform: 'other',
        video_embed_code: undefined
      })
    }
  }

  const handleSelectHeroImage = (media: MediaAsset | any) => {
    // Support both old format (public_url) and new format (cdn_url)
    const imageUrl = media.cdn_url || media.public_url || media.thumbnail_url
    onMediaChange({
      hero_image_url: imageUrl
    })
    setIsMediaPickerOpen(false)
  }

  const handleRemoveHeroImage = () => {
    onMediaChange({
      hero_image_url: undefined,
      hero_image_caption: undefined
    })
  }

  const handleAddInlineMedia = (media: MediaAsset | any) => {
    // Support both old format (public_url) and new format (cdn_url)
    const mediaUrl = media.cdn_url || media.public_url || media.thumbnail_url || ''
    const fileType = media.file_type || 'image'
    const newInlineMedia = [
      ...(mediaData.inline_media || []),
      {
        id: media.id,
        url: mediaUrl,
        type: fileType === 'video' || fileType.startsWith('video') ? 'video' as const : 'image' as const,
        caption: media.title || media.original_filename || '',
        position: (mediaData.inline_media?.length || 0)
      }
    ]
    onMediaChange({ inline_media: newInlineMedia })
    setIsMediaPickerOpen(false)
  }

  const handleRemoveInlineMedia = (mediaId: string) => {
    const newInlineMedia = (mediaData.inline_media || []).filter(m => m.id !== mediaId)
    onMediaChange({ inline_media: newInlineMedia })
  }

  const handleInlineCaptionChange = (mediaId: string, caption: string) => {
    const newInlineMedia = (mediaData.inline_media || []).map(m =>
      m.id === mediaId ? { ...m, caption } : m
    )
    onMediaChange({ inline_media: newInlineMedia })
  }

  const filteredMedia = availableMedia.filter(media =>
    searchTerm === '' ||
    media.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openMediaPicker = (target: 'hero' | 'inline') => {
    setMediaPickerTarget(target)
    setIsMediaPickerOpen(true)
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
        </TabsList>

        {/* Hero Image Section */}
        <TabsContent value="hero" className="mt-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Hero Image
              </CardTitle>
              <CardDescription>
                The featured image that appears at the top of the story and in previews
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mediaData.hero_image_url ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden">
                    <Image
                      src={mediaData.hero_image_url}
                      alt="Hero image"
                      fill
                      className="object-cover"
                    />
                    {isEditing && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openMediaPicker('hero')}
                        >
                          <ImageIcon className="w-4 h-4 mr-1" />
                          Change
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveHeroImage}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Image Caption (optional)
                      </label>
                      <Input
                        value={mediaData.hero_image_caption || ''}
                        onChange={(e) => onMediaChange({ hero_image_caption: e.target.value })}
                        placeholder="Add a caption for the hero image..."
                      />
                    </div>
                  ) : mediaData.hero_image_caption && (
                    <p className="text-sm text-stone-600 italic">{mediaData.hero_image_caption}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-700 mb-2">No Hero Image</h3>
                  <p className="text-stone-500 mb-4">Add a featured image to make your story stand out</p>
                  {isEditing && (
                    <Button type="button" onClick={() => openMediaPicker('hero')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Hero Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video/Descript Section */}
        <TabsContent value="video" className="mt-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-sage-600" />
                Video Content
              </CardTitle>
              <CardDescription>
                Add a video from Descript, YouTube, or Vimeo to your story
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Video URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={descriptUrl}
                        onChange={(e) => handleDescriptUrlChange(e.target.value)}
                        placeholder="Paste Descript, YouTube, or Vimeo URL..."
                        className="flex-1"
                      />
                      {descriptUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDescriptUrl('')
                            onMediaChange({
                              video_url: undefined,
                              video_platform: undefined,
                              video_embed_code: undefined
                            })
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <span className="font-semibold text-sage-600">Descript</span>
                        : share.descript.com/view/...
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <span className="font-semibold text-red-600">YouTube</span>
                        : youtube.com/watch?v=...
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <span className="font-semibold text-blue-600">Vimeo</span>
                        : vimeo.com/...
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {mediaData.video_url ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={
                      mediaData.video_platform === 'descript' ? 'bg-sage-100 text-sage-700' :
                      mediaData.video_platform === 'youtube' ? 'bg-red-100 text-red-700' :
                      mediaData.video_platform === 'vimeo' ? 'bg-blue-100 text-blue-700' :
                      'bg-stone-100 text-stone-700'
                    }>
                      {mediaData.video_platform || 'Video'}
                    </Badge>
                    <a
                      href={mediaData.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sage-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in new tab
                    </a>
                  </div>
                  <VideoEmbed
                    videoUrl={mediaData.video_url}
                    videoPlatform={mediaData.video_platform}
                    videoEmbedCode={mediaData.video_embed_code}
                    title={storyTitle}
                    showControls={false}
                  />
                </div>
              ) : !isEditing && (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-lg">
                  <Video className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-700 mb-2">No Video Added</h3>
                  <p className="text-stone-500">
                    Edit the story to add a video from Descript, YouTube, or Vimeo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery/Inline Media Section */}
        <TabsContent value="gallery" className="mt-6">
          <Card className="border-stone-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-earth-600" />
                    Story Gallery
                  </CardTitle>
                  <CardDescription>
                    Add photos and videos that appear throughout your story
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button type="button" onClick={() => openMediaPicker('inline')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Media
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {mediaData.inline_media && mediaData.inline_media.length > 0 ? (
                <div className="space-y-4">
                  {mediaData.inline_media.map((media, index) => (
                    <div
                      key={media.id}
                      className="flex gap-4 p-4 bg-stone-50 rounded-lg"
                    >
                      {isEditing && (
                        <div className="flex items-center cursor-grab">
                          <GripVertical className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div className="w-32 h-24 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                        {media.type === 'image' ? (
                          <Image
                            src={media.url}
                            alt={media.caption || 'Gallery image'}
                            width={128}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-800">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {media.type}
                          </Badge>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInlineMedia(media.id)}
                              className="text-clay-600 hover:text-clay-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {isEditing ? (
                          <Input
                            value={media.caption || ''}
                            onChange={(e) => handleInlineCaptionChange(media.id, e.target.value)}
                            placeholder="Add a caption..."
                            className="text-sm"
                          />
                        ) : media.caption && (
                          <p className="text-sm text-stone-600">{media.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-700 mb-2">No Gallery Media</h3>
                  <p className="text-stone-500 mb-4">
                    Add photos and videos to illustrate your story
                  </p>
                  {isEditing && (
                    <Button type="button" onClick={() => openMediaPicker('inline')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Media
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Quotes Section */}
        <TabsContent value="transcript" className="mt-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-600" />
                Transcript Highlights
              </CardTitle>
              <CardDescription>
                Key quotes and moments from the source transcript
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transcriptId ? (
                transcriptQuotes.length > 0 ? (
                  <div className="space-y-4">
                    {(expandedQuotes ? transcriptQuotes : transcriptQuotes.slice(0, 3)).map((quote) => (
                      <div
                        key={quote.id}
                        className="border-l-4 border-amber-200 pl-4 py-2 hover:bg-amber-50 rounded-r transition-colors"
                      >
                        <p className="text-stone-700 italic">"{quote.quote_text}"</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                          {quote.speaker && (
                            <span>— {quote.speaker}</span>
                          )}
                          {quote.timestamp && (
                            <Badge variant="outline" className="text-xs">
                              {Math.floor(quote.timestamp / 60)}:{(quote.timestamp % 60).toString().padStart(2, '0')}
                            </Badge>
                          )}
                        </div>
                        {quote.themes && quote.themes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {quote.themes.map((theme, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-sage-600"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add to Story
                          </Button>
                        )}
                      </div>
                    ))}
                    {transcriptQuotes.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => setExpandedQuotes(!expandedQuotes)}
                      >
                        {expandedQuotes ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Show {transcriptQuotes.length - 3} More Quotes
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      No highlighted quotes found in the transcript. Run AI analysis to extract key quotes.
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-lg">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-700 mb-2">No Linked Transcript</h3>
                  <p className="text-stone-500">
                    This story is not linked to a transcript
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Media Picker */}
      <EnhancedMediaPicker
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(media) => {
          if (mediaPickerTarget === 'hero') {
            handleSelectHeroImage(media as any)
          } else {
            handleAddInlineMedia(media as any)
          }
        }}
        filterType={mediaPickerTarget === 'hero' ? 'image' : 'all'}
        title={mediaPickerTarget === 'hero' ? 'Select Hero Image' : 'Add Media to Gallery'}
        currentStoryId={storyId}
        currentStorytellerId={storytellerId}
      />
    </div>
  )
}
