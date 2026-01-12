'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import EnhancedMediaPicker from './EnhancedMediaPicker'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
  AlignLeft,
  Minus,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryContentEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  isEditing?: boolean
  storytellerId?: string
}

export default function StoryContentEditor({
  content,
  onChange,
  placeholder = 'Start writing your story...',
  className,
  isEditing = true,
  storytellerId
}: StoryContentEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto my-4'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sage-600 underline hover:text-sage-700'
        }
      }),
      Underline,
      Placeholder.configure({
        placeholder
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg overflow-hidden mx-auto my-4'
        }
      })
    ],
    content,
    editable: isEditing,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-stone prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4'
      }
    }
  })

  // Dynamically update editable state when isEditing prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing)
    }
  }, [editor, isEditing])

  const handleSetLink = () => {
    if (linkUrl) {
      if (linkText && !editor?.state.selection.empty) {
        editor?.chain().focus().setLink({ href: linkUrl }).run()
      } else {
        editor?.chain().focus().setLink({ href: linkUrl }).run()
      }
    } else {
      editor?.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setLinkText('')
    setShowLinkDialog(false)
  }

  const handleInsertImage = useCallback((media: any) => {
    const imageUrl = media.cdn_url || media.public_url || media.thumbnail_url
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: media.title || '' }).run()
    }
    setShowMediaPicker(false)
  }, [editor])

  const handleInsertVideo = () => {
    if (videoUrl && editor) {
      // Check if it's a YouTube URL
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run()
      } else {
        // For other video URLs, insert as a figure with video tag
        const videoHtml = `<figure class="my-4"><video src="${videoUrl}" controls class="rounded-lg w-full"></video></figure>`
        editor.chain().focus().insertContent(videoHtml).run()
      }
    }
    setVideoUrl('')
    setShowVideoDialog(false)
  }

  if (!editor) {
    return (
      <div className={cn("flex flex-col border border-stone-200 rounded-lg overflow-hidden bg-white", className)}>
        <div className="p-6 min-h-[400px] animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || !isEditing}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-sage-100 text-sage-700"
      )}
    >
      {children}
    </Button>
  )

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-stone-200 mx-1" />
  )

  return (
    <div className={cn("flex flex-col border border-stone-200 rounded-lg overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      {isEditing && (
        <div className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
          <div className="flex items-center gap-0.5 flex-wrap">
            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Normal Text"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Lists & Block */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Insert */}
            <ToolbarButton
              onClick={() => setShowLinkDialog(true)}
              isActive={editor.isActive('link')}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowMediaPicker(true)}
              title="Insert Image from Library"
            >
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowVideoDialog(true)}
              title="Insert Video"
            >
              <Video className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Undo/Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Word Count */}
      <div className="px-4 py-2 border-t border-stone-200 bg-stone-50 text-xs text-stone-500 flex justify-between">
        <span>
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
        <span>
          ~{Math.ceil(editor.getText().split(/\s+/).filter(Boolean).length / 200)} min read
        </span>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to external content or resources.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetLink} className="bg-sage-600 hover:bg-sage-700">
              {editor.isActive('link') ? 'Update Link' : 'Insert Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Video</DialogTitle>
            <DialogDescription>
              Paste a YouTube, Vimeo, or direct video URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsertVideo()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInsertVideo} className="bg-sage-600 hover:bg-sage-700">
              Insert Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Picker */}
      <EnhancedMediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleInsertImage}
        filterType="image"
        title="Insert Image"
        currentStorytellerId={storytellerId}
      />
    </div>
  )
}
