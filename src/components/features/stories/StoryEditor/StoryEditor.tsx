'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Save,
  Eye,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface StoryEditorProps {
  storyId?: string
  initialData?: {
    title: string
    subtitle?: string
    content: string
    status: 'draft' | 'published'
    tags?: string[]
    culturalSensitivity?: string
    visibility?: string
  }
  onSave?: (data: any) => Promise<void>
  onPublish?: (data: any) => Promise<void>
}

export default function StoryEditor({ storyId, initialData, onSave, onPublish }: StoryEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [currentTag, setCurrentTag] = useState('')
  const [culturalSensitivity, setCulturalSensitivity] = useState(initialData?.culturalSensitivity || 'general')
  const [visibility, setVisibility] = useState(initialData?.visibility || 'public')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: 'Start telling your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sage-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      setWordCount(editor.storage.characterCount.words())
      setHasUnsavedChanges(true)
    },
  })

  // Debounced content for auto-save
  const debouncedContent = useDebounce(editor?.getHTML() || '', 2000)
  const debouncedTitle = useDebounce(title, 2000)

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && debouncedContent && debouncedTitle) {
      handleAutoSave()
    }
  }, [debouncedContent, debouncedTitle])

  const handleAutoSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      await onSave({
        title: title,
        subtitle: subtitle,
        content: editor?.getHTML(),
        tags,
        culturalSensitivity,
        visibility,
        status: 'draft'
      })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      toast.success('Draft saved')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualSave = async () => {
    await handleAutoSave()
  }

  const handlePublish = async () => {
    if (!onPublish) return
    
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }
    
    if (wordCount < 50) {
      toast.error('Story is too short (minimum 50 words)')
      return
    }
    
    setIsSaving(true)
    try {
      await onPublish({
        title: title,
        subtitle: subtitle,
        content: editor?.getHTML(),
        tags,
        culturalSensitivity,
        visibility,
        status: 'published'
      })
      toast.success('Story published successfully!')
      setHasUnsavedChanges(false)
    } catch (error) {
      toast.error('Failed to publish story')
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 10) {
      setTags([...tags, currentTag])
      setCurrentTag('')
      setHasUnsavedChanges(true)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setHasUnsavedChanges(true)
  }

  // Toolbar button component
  const ToolbarButton = ({ onClick, active, children, title }: any) => (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-stone-100 transition-colours',
        active && 'bg-stone-100 text-sage-600'
      )}
      title={title}
      type="button"
    >
      {children}
    </button>
  )

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Story Editor</h1>
          {isSaving && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {!isSaving && lastSaved && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          {hasUnsavedChanges && !isSaving && (
            <Badge variant="warning" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualSave} disabled={isSaving || !hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            <Eye className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <Input
              placeholder="Enter your story title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setHasUnsavedChanges(true)
              }}
              className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-sage-600"
            />
          </div>

          {/* Subtitle */}
          <div>
            <Input
              placeholder="Optional subtitle..."
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value)
                setHasUnsavedChanges(true)
              }}
              className="text-lg border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-sage-600"
            />
          </div>

          {/* Editor Toolbar */}
          <Card>
            <div className="border-b p-2 flex items-center gap-1 flex-wrap">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-300 mx-1" />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-300 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('Enter URL:')
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run()
                  }
                }}
                active={editor.isActive('link')}
                title="Add Link"
              >
                <Link2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('Enter image URL:')
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run()
                  }
                }}
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-300 mx-1" />
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
              <div className="ml-auto text-sm text-stone-500">
                {wordCount} words
              </div>
            </div>
            
            {/* Editor Content */}
            <EditorContent editor={editor} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Story Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Story Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cultural Sensitivity */}
              <div className="space-y-2">
                <Label>Cultural Sensitivity</Label>
                <Select value={culturalSensitivity} onValueChange={setCulturalSensitivity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="cultural">Cultural Content</SelectItem>
                    <SelectItem value="sensitive">Sensitive Material</SelectItem>
                    <SelectItem value="restricted">Restricted Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="community">Community Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    size="sm"
                    onClick={addTag}
                    disabled={!currentTag || tags.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {tags.length >= 10 && (
                  <p className="text-xs text-stone-500">Maximum 10 tags</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <p>Start with a compelling opening that draws readers in.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <p>Use descriptive language to paint a vivid picture.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <p>Share personal experiences and emotions to connect with readers.</p>
                </div>
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  <p>Keep paragraphs short for better readability.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}