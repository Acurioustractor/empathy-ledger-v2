"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, Check, Loader2, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  displayName: string
  onUploadComplete?: (url: string) => void
  className?: string
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  displayName,
  onUploadComplete,
  className
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseBrowserClient()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profile-images/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      // Success!
      setPreviewUrl(publicUrl)
      setSelectedFile(null)
      onUploadComplete?.(publicUrl)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(currentAvatarUrl || null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-background shadow-md">
              <AvatarImage
                src={previewUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Camera icon overlay when hovering */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              disabled={uploading}
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-base font-semibold">Profile Photo</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a photo to personalize your profile. JPG, PNG or GIF (max 5MB)
              </p>
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!selectedFile ? (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose Photo
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Photo
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={uploading}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Success Message */}
            {!selectedFile && previewUrl && previewUrl !== currentAvatarUrl && (
              <div className="text-sm text-success flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile photo updated successfully
              </div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Photo Guidelines:</strong> Choose a clear, well-lit photo where your face is visible.
            Avoid images with text, logos, or multiple people. Your photo helps build trust and connection
            with the community.
          </p>
        </div>
      </div>
    </Card>
  )
}
