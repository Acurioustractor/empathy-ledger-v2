'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Mic
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface MediaFile {
  id: string
  file: File
  url?: string
  type: 'image' | 'video' | 'audio'
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'transcribing'
  progress: number
  error?: string
  mediaId?: string
  transcriptId?: string
}

interface MediaUploaderProps {
  storyId?: string
  onUploadComplete?: (media: any[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  enableTranscription?: boolean
}

export function MediaUploader({
  storyId,
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  enableTranscription = true
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map(file => {
      let type: 'image' | 'video' | 'audio' = 'image'
      if (file.type.startsWith('video/')) type = 'video'
      if (file.type.startsWith('audio/')) type = 'audio'
      
      return {
        id: crypto.randomUUID(),
        file,
        type,
        status: 'pending',
        progress: 0,
        url: URL.createObjectURL(file)
      }
    })
    
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      if (type === 'image/*') {
        acc['image/jpeg'] = ['.jpg', '.jpeg']
        acc['image/png'] = ['.png']
        acc['image/webp'] = ['.webp']
      }
      if (type === 'video/*') {
        acc['video/mp4'] = ['.mp4']
        acc['video/webm'] = ['.webm']
        acc['video/quicktime'] = ['.mov']
      }
      if (type === 'audio/*') {
        acc['audio/mpeg'] = ['.mp3']
        acc['audio/wav'] = ['.wav']
        acc['audio/ogg'] = ['.ogg']
      }
      return acc
    }, {} as Record<string, string[]>),
    maxFiles: maxFiles - files.length,
    disabled: uploading
  })

  const uploadFile = async (mediaFile: MediaFile) => {
    const formData = new FormData()
    formData.append('file', mediaFile.file)
    if (storyId) formData.append('storyId', storyId)
    formData.append('title', mediaFile.file.name)

    try {
      // Update status to uploading with initial progress
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // Get the current session token (bypass in development)
      const { data: { session } } = await supabase.auth.getSession()
      const isDevelopment = process.env.NODE_ENV === 'development'

      if (!session?.access_token && !isDevelopment) {
        throw new Error('Not authenticated')
      }

      // Use XMLHttpRequest for real progress tracking
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setFiles(prev => prev.map(f =>
              f.id === mediaFile.id
                ? { ...f, progress: percentComplete }
                : f
            ))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              reject(new Error('Invalid response'))
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              console.error('❌ API Error Response:', errorData)
              reject(new Error(`Upload failed: ${errorData.error} - ${errorData.details || ''}`))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`))
            }
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('POST', '/api/media/upload')
        // Only set Authorization header if we have a session token
        if (session?.access_token) {
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        }
        xhr.send(formData)
      })
      
      // Update with upload results
      setFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { 
              ...f, 
              status: data.media.needsTranscription ? 'transcribing' : 'completed',
              progress: data.media.needsTranscription ? 50 : 100,
              mediaId: data.media.id
            }
          : f
      ))

      // If needs transcription, start transcription
      if (data.media.needsTranscription && enableTranscription) {
        await transcribeMedia(mediaFile.id, data.media.id)
      }

      return data.media

    } catch (error: any) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, status: 'failed', error: error.message }
          : f
      ))
      throw error
    }
  }

  const transcribeMedia = async (fileId: string, mediaAssetId: string) => {
    try {
      const response = await fetch('/api/media/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaAssetId })
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'completed',
              progress: 100,
              transcriptId: data.transcript.id
            }
          : f
      ))

    } catch (error: any) {
      console.error('Transcription error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed', progress: 100 } // Still mark as complete even if transcription fails
          : f
      ))
    }
  }

  const uploadAll = async () => {
    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    const uploadedMedia = []

    for (const file of pendingFiles) {
      try {
        const media = await uploadFile(file)
        uploadedMedia.push(media)
      } catch (error) {
        console.error('Failed to upload file:', file.file.name)
      }
    }

    setUploading(false)
    if (onUploadComplete && uploadedMedia.length > 0) {
      onUploadComplete(uploadedMedia)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (type: 'image' | 'video' | 'audio') => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'audio': return <Music className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: MediaFile['status']) => {
    switch (status) {
      case 'uploading': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'transcribing': return <Mic className="h-4 w-4 animate-pulse" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colours",
          isDragActive ? "border-primary bg-primary/5" : "border-grey-300 hover:border-grey-400",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-grey-400" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop media files here
            </p>
            <p className="text-sm text-grey-500">
              or click to browse from your device
            </p>
            <p className="text-xs text-grey-400 mt-2">
              Supports images, videos, and audio files (max {maxFiles} files)
            </p>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <div 
              key={file.id}
              className="flex items-center gap-3 p-3 bg-grey-50 rounded-lg"
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file.type)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-grey-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {/* Progress bar with percentage */}
                {(file.status === 'uploading' || file.status === 'transcribing') && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-grey-600 mb-1">
                      <span>
                        {file.status === 'uploading' ? 'Uploading...' : 'Transcribing...'}
                      </span>
                      <span className="font-medium">{file.progress}%</span>
                    </div>
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}

                {/* Status text */}
                {file.status === 'transcribing' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Generating transcript - this may take a few minutes for longer files
                  </p>
                )}

                {/* Upload status text */}
                {file.status === 'uploading' && file.progress < 100 && (
                  <p className="text-xs text-grey-500 mt-1">
                    Please keep this window open while uploading
                  </p>
                )}
                
                {/* Error message */}
                {file.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {file.error}
                  </p>
                )}
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(file.status)}
              </div>

              {/* Remove button */}
              {file.status === 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(file.id)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.some(f => f.status === 'pending') && (
        <Button
          onClick={uploadAll}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.filter(f => f.status === 'pending').length} file(s)
            </>
          )}
        </Button>
      )}

      {/* Transcription notice */}
      {enableTranscription && files.some(f => f.type === 'audio' || f.type === 'video') && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Audio and video files will be automatically transcribed after upload
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}