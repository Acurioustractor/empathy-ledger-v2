'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Type,
  Image,
  Video,
  Music,
  Quote,
  MapPin,
  Link,
  Trash2,
  GripVertical,
  Eye,
  Settings,
  Upload,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  Camera,
  Mic,
  Globe,
  Users,
  Heart,
  Star
} from 'lucide-react'

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'audio' | 'quote' | 'gallery' | 'embed' | 'interactive'
  content: any
  metadata: {
    culturalSensitivity?: 'low' | 'medium' | 'high' | 'restricted'
    order: number
    visibility: 'public' | 'community' | 'restricted'
  }
}

interface MediaCanvasProps {
  storyId?: string
  initialBlocks?: ContentBlock[]
  culturalContext: 'low' | 'medium' | 'high' | 'restricted'
  onBlocksChange: (blocks: ContentBlock[]) => void
  onSave: () => void
  isPreviewMode?: boolean
}

interface BlockTemplate {
  type: ContentBlock['type']
  icon: React.ElementType
  label: string
  description: string
  culturallyApproved: boolean
}

const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    type: 'text',
    icon: Type,
    label: 'Rich Text',
    description: 'Add formatted text with cultural context',
    culturallyApproved: true
  },
  {
    type: 'image',
    icon: Image,
    label: 'Image',
    description: 'Single image with cultural metadata',
    culturallyApproved: true
  },
  {
    type: 'gallery',
    icon: Camera,
    label: 'Photo Gallery',
    description: 'Multiple images with stories',
    culturallyApproved: true
  },
  {
    type: 'video',
    icon: Video,
    label: 'Video',
    description: 'YouTube, Vimeo, or upload video',
    culturallyApproved: true
  },
  {
    type: 'audio',
    icon: Music,
    label: 'Audio',
    description: 'Voice recordings or music',
    culturallyApproved: true
  },
  {
    type: 'quote',
    icon: Quote,
    label: 'Quote Block',
    description: 'Highlighted quotes with attribution',
    culturallyApproved: true
  },
  {
    type: 'embed',
    icon: Globe,
    label: 'Embed',
    description: 'External content and maps',
    culturallyApproved: false
  },
  {
    type: 'interactive',
    icon: Star,
    label: 'Interactive',
    description: 'Polls, hotspots, branching content',
    culturallyApproved: false
  }
]

export function MediaCanvasEditor({
  storyId,
  initialBlocks = [],
  culturalContext,
  onBlocksChange,
  onSave,
  isPreviewMode = false
}: MediaCanvasProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [showBlockPalette, setShowBlockPalette] = useState(false)

  const createNewBlock = useCallback((type: ContentBlock['type']): ContentBlock => {
    const baseBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      metadata: {
        order: blocks.length,
        visibility: 'public' as const,
        culturalSensitivity: culturalContext
      }
    }

    switch (type) {
      case 'text':
        return {
          ...baseBlock,
          content: {
            text: '',
            format: 'rich',
            culturalNotes: ''
          }
        }
      case 'image':
        return {
          ...baseBlock,
          content: {
            src: '',
            alt: '',
            caption: '',
            culturalContext: '',
            permissions: 'community'
          }
        }
      case 'gallery':
        return {
          ...baseBlock,
          content: {
            images: [],
            layout: 'grid',
            culturalTheme: ''
          }
        }
      case 'video':
        return {
          ...baseBlock,
          content: {
            url: '',
            title: '',
            description: '',
            chapters: [],
            culturalWarning: ''
          }
        }
      case 'audio':
        return {
          ...baseBlock,
          content: {
            src: '',
            title: '',
            transcript: '',
            speaker: '',
            culturalSignificance: ''
          }
        }
      case 'quote':
        return {
          ...baseBlock,
          content: {
            text: '',
            speaker: '',
            context: '',
            source: '',
            culturalProtocol: ''
          }
        }
      case 'embed':
        return {
          ...baseBlock,
          content: {
            url: '',
            type: 'link',
            title: '',
            description: ''
          }
        }
      case 'interactive':
        return {
          ...baseBlock,
          content: {
            type: 'poll',
            question: '',
            options: [],
            culturalGuidance: ''
          }
        }
      default:
        return baseBlock as ContentBlock
    }
  }, [blocks.length, culturalContext])

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock = createNewBlock(type)
    const updatedBlocks = [...blocks, newBlock]
    setBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
    setSelectedBlockId(newBlock.id)
    setShowBlockPalette(false)
  }

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    setBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
  }

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId)
    setBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
    setSelectedBlockId(null)
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...blocks]
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1)
    updatedBlocks.splice(toIndex, 0, movedBlock)

    // Update order metadata
    updatedBlocks.forEach((block, index) => {
      block.metadata.order = index
    })

    setBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
  }

  const renderBlock = (block: ContentBlock, index: number) => {
    const isSelected = selectedBlockId === block.id
    const isHighSensitivity = block.metadata.culturalSensitivity === 'high' ||
                             block.metadata.culturalSensitivity === 'restricted'

    return (
      <Card
        key={block.id}
        className={`mb-4 transition-all duration-200 ${
          isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-grey-50'
        } ${isHighSensitivity ? 'border-orange-300' : ''}`}
        onClick={() => setSelectedBlockId(block.id)}
      >
        {/* Block Header */}
        <div className="flex items-center justify-between p-3 border-b bg-grey-50">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-grey-400 cursor-move" />
            {(() => {
              const template = BLOCK_TEMPLATES.find(t => t.type === block.type)
              const Icon = template?.icon || Type
              return <Icon className="w-4 h-4 text-grey-600" />
            })()}
            <Typography variant="subtitle2" className="font-medium capitalize">
              {block.type} Block
            </Typography>
            {isHighSensitivity && (
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                Cultural Review
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Toggle block settings
              }}
              className="h-7 w-7 p-0"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                deleteBlock(block.id)
              }}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Block Content */}
        <div className="p-4">
          {renderBlockContent(block)}
        </div>
      </Card>
    )
  }

  const renderBlockContent = (block: ContentBlock) => {
    if (isPreviewMode) {
      return renderBlockPreview(block)
    }

    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, text: e.target.value }
              })}
              placeholder="Write your story content here..."
              rows={6}
              className="min-h-[150px]"
            />
            <Input
              value={block.content.culturalNotes || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, culturalNotes: e.target.value }
              })}
              placeholder="Cultural context or notes (optional)"
              className="text-sm"
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-grey-300 rounded-lg p-6 text-center">
              {block.content.src ? (
                <div className="space-y-2">
                  <img src={block.content.src} alt={block.content.alt} className="max-h-48 mx-auto rounded" />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-grey-400" />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}
            </div>
            <Input
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, caption: e.target.value }
              })}
              placeholder="Image caption"
            />
            <Input
              value={block.content.culturalContext || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, culturalContext: e.target.value }
              })}
              placeholder="Cultural context or significance"
              className="text-sm"
            />
          </div>
        )

      case 'video':
        return (
          <div className="space-y-3">
            <Input
              value={block.content.url || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, url: e.target.value }
              })}
              placeholder="YouTube, Vimeo, or video URL"
            />
            <Input
              value={block.content.title || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, title: e.target.value }
              })}
              placeholder="Video title"
            />
            <Textarea
              value={block.content.description || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, description: e.target.value }
              })}
              placeholder="Video description"
              rows={3}
            />
            {culturalContext !== 'low' && (
              <Input
                value={block.content.culturalWarning || ''}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, culturalWarning: e.target.value }
                })}
                placeholder="Cultural content warning (if needed)"
                className="text-sm"
              />
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-grey-300 rounded-lg p-6 text-center">
              <Mic className="w-12 h-12 mx-auto text-grey-400 mb-2" />
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Audio
              </Button>
            </div>
            <Input
              value={block.content.title || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, title: e.target.value }
              })}
              placeholder="Audio title"
            />
            <Input
              value={block.content.speaker || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, speaker: e.target.value }
              })}
              placeholder="Speaker name"
            />
            <Textarea
              value={block.content.transcript || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, transcript: e.target.value }
              })}
              placeholder="Transcript (optional)"
              rows={3}
            />
          </div>
        )

      case 'quote':
        return (
          <div className="space-y-3">
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, text: e.target.value }
              })}
              placeholder="Enter the quote..."
              rows={4}
              className="font-serif text-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={block.content.speaker || ''}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, speaker: e.target.value }
                })}
                placeholder="Speaker name"
              />
              <Input
                value={block.content.context || ''}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, context: e.target.value }
                })}
                placeholder="Context or date"
              />
            </div>
            {culturalContext !== 'low' && (
              <Input
                value={block.content.culturalProtocol || ''}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, culturalProtocol: e.target.value }
                })}
                placeholder="Cultural sharing protocol"
                className="text-sm"
              />
            )}
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-grey-300 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 mx-auto text-grey-400 mb-2" />
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Add Photos to Gallery
              </Button>
            </div>
            <Input
              value={block.content.culturalTheme || ''}
              onChange={(e) => updateBlock(block.id, {
                content: { ...block.content, culturalTheme: e.target.value }
              })}
              placeholder="Gallery theme or cultural significance"
            />
          </div>
        )

      default:
        return (
          <div className="text-center text-grey-500 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <Typography variant="caption">
              Content editor for {block.type} blocks coming soon
            </Typography>
          </div>
        )
    }
  }

  const renderBlockPreview = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{block.content.text}</div>
            {block.content.culturalNotes && (
              <Alert className="mt-3 p-3 bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm">
                  <strong>Cultural Context:</strong> {block.content.culturalNotes}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 'quote':
        return (
          <blockquote className="border-l-4 border-purple-500 pl-4 py-2 italic text-lg">
            <div className="mb-2">{block.content.text}</div>
            <cite className="text-sm text-grey-600 not-italic">
              — {block.content.speaker} {block.content.context && `(${block.content.context})`}
            </cite>
          </blockquote>
        )

      default:
        return (
          <div className="flex items-center justify-center py-8 text-grey-500">
            <Typography variant="caption">
              {block.type.toUpperCase()} Block Preview
            </Typography>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h3" className="text-xl font-semibold">
            Story Canvas
          </Typography>
          <Typography variant="body2" className="text-grey-600">
            Build your multimedia story with drag-and-drop blocks
          </Typography>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowBlockPalette(!showBlockPalette)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
          <Button onClick={onSave}>
            Save Story
          </Button>
        </div>
      </div>

      {/* Cultural Context Alert */}
      {culturalContext !== 'low' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Heart className="h-4 w-4" />
          <AlertDescription>
            <strong>Cultural Story Mode:</strong> This story includes culturally sensitive content.
            Additional protocols and community review may be required.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Block Palette */}
        {showBlockPalette && (
          <Card className="lg:col-span-1 p-4 h-fit">
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Content Blocks
            </Typography>

            <div className="space-y-2">
              {BLOCK_TEMPLATES.map(template => {
                const Icon = template.icon
                const isApproved = template.culturallyApproved || culturalContext === 'low'

                return (
                  <Button
                    key={template.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(template.type)}
                    disabled={!isApproved}
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{template.label}</div>
                      <div className="text-xs text-grey-500">{template.description}</div>
                      {!isApproved && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Requires Review
                        </Badge>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          </Card>
        )}

        {/* Story Canvas */}
        <div className={showBlockPalette ? "lg:col-span-3" : "lg:col-span-4"}>
          {blocks.length === 0 ? (
            <Card className="p-12 text-center">
              <Type className="w-16 h-16 mx-auto text-grey-300 mb-4" />
              <Typography variant="h4" className="text-grey-500 mb-2">
                Start Building Your Story
              </Typography>
              <Typography variant="body2" className="text-grey-400 mb-4">
                Click "Add Block" to begin creating your multimedia story
              </Typography>
              <Button
                variant="outline"
                onClick={() => setShowBlockPalette(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Block
              </Button>
            </Card>
          ) : (
            <div>
              {blocks.map((block, index) => renderBlock(block, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}