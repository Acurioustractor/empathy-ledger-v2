'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaLibrary } from './MediaLibrary'
import { MediaUploader } from './MediaUploader'
import { X } from 'lucide-react'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  caption?: string
  alt_text?: string
  width?: number
  height?: number
}

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaAsset | MediaAsset[]) => void
  multiSelect?: boolean
  allowedTypes?: Array<'image' | 'audio' | 'video' | 'document'>
  title?: string
}

export function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  allowedTypes = ['image', 'audio', 'video', 'document'],
  title = 'Select Media'
}: MediaSelectorProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([])

  const handleLibrarySelect = (media: MediaAsset | MediaAsset[]) => {
    if (multiSelect) {
      setSelectedMedia(Array.isArray(media) ? media : [media])
    } else {
      onSelect(media)
      onClose()
    }
  }

  const handleUploadComplete = (newMedia: MediaAsset[]) => {
    if (multiSelect) {
      setSelectedMedia(prev => [...prev, ...newMedia])
      setActiveTab('library')
    } else {
      onSelect(newMedia[0])
      onClose()
    }
  }

  const handleConfirmSelection = () => {
    if (selectedMedia.length > 0) {
      onSelect(multiSelect ? selectedMedia : selectedMedia[0])
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedMedia([])
    setActiveTab('library')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto mt-4">
            <MediaLibrary
              onSelect={handleLibrarySelect}
              multiSelect={multiSelect}
              allowedTypes={allowedTypes}
            />
          </TabsContent>

          <TabsContent value="upload" className="flex-1 overflow-y-auto mt-4">
            <MediaUploader
              onUploadComplete={handleUploadComplete}
              acceptedTypes={allowedTypes.map(t => `${t}/*`)}
              maxFiles={multiSelect ? 10 : 1}
            />
          </TabsContent>
        </Tabs>

        {multiSelect && selectedMedia.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#2C2C2C]/70">
                {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedMedia([])}>
                  Clear
                </Button>
                <Button onClick={handleConfirmSelection} className="bg-[#D97757] hover:bg-[#D97757]/90">
                  Insert Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
