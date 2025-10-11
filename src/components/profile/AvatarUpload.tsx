'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userName: string
  onUpload: (file: File) => Promise<string | null>
  isEditing: boolean
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUpload,
  isEditing
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const avatarUrl = await onUpload(file)
      if (avatarUrl) {
        setPreview(avatarUrl)
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
      setPreview(currentAvatarUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-4">
      <Label>Profile Picture</Label>

      <div className="relative">
        <Avatar className="w-32 h-32">
          <AvatarImage src={preview || undefined} alt={userName} />
          <AvatarFallback className="text-3xl bg-gradient-to-br from-clay-500 to-sage-600 text-white">
            {preview ? null : initials || <User className="w-12 h-12" />}
          </AvatarFallback>
        </Avatar>

        {isEditing && preview && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {isEditing && (
        <p className="text-xs text-grey-600 text-center">
          Recommended: Square image, at least 400x400px
          <br />
          Max file size: 5MB
        </p>
      )}
    </div>
  )
}
