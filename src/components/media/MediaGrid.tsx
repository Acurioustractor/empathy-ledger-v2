'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Edit, Trash2, Image as ImageIcon, Music, Video, FileText } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  caption?: string
  file_size: number
  created_at: string
}

interface MediaGridProps {
  media: MediaAsset[]
  viewMode: 'grid' | 'list'
  selectedMedia: MediaAsset[]
  onSelect: (media: MediaAsset) => void
  onEdit: (media: MediaAsset) => void
  onDelete: (id: string) => void
}

export function MediaGrid({ media, viewMode, selectedMedia, onSelect, onEdit, onDelete }: MediaGridProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-6 h-6" />
      case 'audio': return <Music className="w-6 h-6" />
      case 'video': return <Video className="w-6 h-6" />
      default: return <FileText className="w-6 h-6" />
    }
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer border-2 overflow-hidden transition-all hover:shadow-lg",
              selectedMedia.find(m => m.id === item.id) && "border-[#D97757] ring-2 ring-[#D97757]/20"
            )}
            onClick={() => onSelect(item)}
          >
            <div className="aspect-square bg-[#F8F6F1] relative">
              {item.type === 'image' ? (
                <Image src={item.url} alt={item.caption || ''} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2C2C2C]/40">
                  {getIcon(item.type)}
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                      <Edit className="w-4 h-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-[#2C2C2C]/60 truncate">{item.caption || 'Untitled'}</p>
              <p className="text-xs text-[#2C2C2C]/40 mt-1">{(item.file_size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {media.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "p-4 cursor-pointer border-2 transition-all hover:shadow-md",
            selectedMedia.find(m => m.id === item.id) && "border-[#D97757] bg-[#D97757]/5"
          )}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-[#F8F6F1] flex-shrink-0 overflow-hidden">
              {item.type === 'image' ? (
                <Image src={item.url} alt="" width={64} height={64} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2C2C2C]/40">
                  {getIcon(item.type)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.caption || 'Untitled'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                <span className="text-xs text-[#2C2C2C]/60">{(item.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                  <Edit className="w-4 h-4 mr-2" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )
}
