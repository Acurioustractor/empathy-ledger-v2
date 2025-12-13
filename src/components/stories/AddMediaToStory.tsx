'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import {
  Upload,
  Image,
  Video,
  Music,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mic,
  Link2,
  Copy,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MediaFile {
  id: string
  file: File
  transcriptFile?: File
  url?: string
  type: 'image' | 'video' | 'audio' | 'document'
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'transcribing' | 'duplicate'
  progress: number
  error?: string
  mediaId?: string
  transcriptId?: string
  duplicateInfo?: {
    existingId: string
    existingUrl: string
    existingFilename: string
  }
}

interface ExistingMedia {
  id: string
  url: string
  filename: string
  media_type: string
  title: string
  file_size: number
  created_at: string
  has_transcript?: boolean
}

interface AddMediaToStoryProps {
  storyId: string
  storyTitle?: string
  onMediaAdded?: (media: ExistingMedia[]) => void
  onClose?: () => void
}

export function AddMediaToStory({
  storyId,
  storyTitle,
  onMediaAdded,
  onClose
}: AddMediaToStoryProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [duplicateDialog, setDuplicateDialog] = useState<{
    open: boolean
    file: MediaFile | null
    existingMedia: any
  }>({ open: false, file: null, existingMedia: null })

  // Fetch existing media for this story
  useEffect(() => {
    fetchExistingMedia()
  }, [storyId])

  const fetchExistingMedia = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`/api/media/upload?storyId=${storyId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExistingMedia(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching existing media:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map(file => {
      let type: 'image' | 'video' | 'audio' | 'document' = 'document'
      if (file.type.startsWith('image/')) type = 'image'
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

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    disabled: uploading
  })

  const addTranscriptToFile = (fileId: string, transcriptFile: File) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, transcriptFile } : f
    ))
  }

  const uploadFile = async (mediaFile: MediaFile, skipDuplicateCheck = false): Promise<boolean> => {
    const formData = new FormData()
    formData.append('file', mediaFile.file)
    formData.append('storyId', storyId)
    formData.append('title', mediaFile.file.name)
    if (mediaFile.transcriptFile) {
      formData.append('transcriptFile', mediaFile.transcriptFile)
    }
    if (skipDuplicateCheck) {
      formData.append('skipDuplicateCheck', 'true')
    }

    try {
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id
          ? { ...f, status: 'uploading', progress: 10 }
          : f
      ))

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      })

      const data = await response.json()

      // Handle duplicate detection
      if (response.status === 409 && data.duplicate) {
        setFiles(prev => prev.map(f =>
          f.id === mediaFile.id
            ? {
                ...f,
                status: 'duplicate',
                duplicateInfo: {
                  existingId: data.existingMedia.id,
                  existingUrl: data.existingMedia.url,
                  existingFilename: data.existingMedia.filename
                }
              }
            : f
        ))
        setDuplicateDialog({
          open: true,
          file: mediaFile,
          existingMedia: data.existingMedia
        })
        return false
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // If it's an existing duplicate for same story, just mark complete
      if (data.duplicate && data.media?.isExisting) {
        setFiles(prev => prev.map(f =>
          f.id === mediaFile.id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                mediaId: data.media.id
              }
            : f
        ))
        return true
      }

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

      // If needs transcription and no transcript file provided, trigger it
      if (data.media.needsTranscription && !mediaFile.transcriptFile) {
        await transcribeMedia(mediaFile.id, data.media.id)
      }

      return true

    } catch (error: any) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id
          ? { ...f, status: 'failed', error: error.message }
          : f
      ))
      return false
    }
  }

  const transcribeMedia = async (fileId: string, mediaAssetId: string) => {
    try {
      const response = await fetch('/api/media/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaAssetId })
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                transcriptId: data.transcript?.id
              }
            : f
        ))
      }
    } catch (error) {
      console.error('Transcription error:', error)
      // Still mark as complete even if transcription fails
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
      ))
    }
  }

  const uploadAll = async () => {
    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')

    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    setUploading(false)
    await fetchExistingMedia() // Refresh media list

    if (onMediaAdded) {
      onMediaAdded(existingMedia)
    }
  }

  const handleDuplicateAction = async (action: 'link' | 'upload-new' | 'cancel') => {
    const { file, existingMedia } = duplicateDialog

    if (!file) return

    if (action === 'link') {
      // Link existing media to this story
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch('/api/media/link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mediaId: existingMedia.id,
            storyId: storyId
          })
        })
      }
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'completed', progress: 100, mediaId: existingMedia.id } : f
      ))
    } else if (action === 'upload-new') {
      // Upload as new copy
      await uploadFile(file, true)
    } else {
      // Cancel - remove from queue
      setFiles(prev => prev.filter(f => f.id !== file.id))
    }

    setDuplicateDialog({ open: false, file: null, existingMedia: null })
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to remove this media from the story?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    await fetch(`/api/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
  }

  const getFileIcon = (type: 'image' | 'video' | 'audio' | 'document') => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'audio': return <Music className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: MediaFile['status']) => {
    switch (status) {
      case 'uploading': return <Badge variant="secondary"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading</Badge>
      case 'transcribing': return <Badge variant="secondary"><Mic className="h-3 w-3 animate-pulse mr-1" /> Transcribing</Badge>
      case 'completed': return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Complete</Badge>
      case 'failed': return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      case 'duplicate': return <Badge variant="outline" className="border-amber-500 text-amber-600"><Copy className="h-3 w-3 mr-1" /> Duplicate</Badge>
      default: return <Badge variant="outline">Pending</Badge>
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Add Media to Story</h2>
          {storyTitle && (
            <p className="text-sm text-muted-foreground">"{storyTitle}"</p>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Attached Media ({existingMedia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingMedia.map(media => (
                <div
                  key={media.id}
                  className="relative group rounded-lg border overflow-hidden bg-muted/50"
                >
                  {media.media_type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.title}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      {getFileIcon(media.media_type as any)}
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{media.title || media.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(media.file_size)}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMedia(media.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop media files here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse from your device
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports: Images, Videos, Audio, PDFs, Transcripts (.txt, .srt, .vtt)
            </p>
          </>
        )}
      </div>

      {/* Pending Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Upload Queue</h3>
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {/* Preview/Icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                {file.type === 'image' && file.url ? (
                  <img src={file.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file.size)}
                  {file.transcriptFile && (
                    <span className="ml-2 text-green-600">
                      + transcript: {file.transcriptFile.name}
                    </span>
                  )}
                </p>

                {/* Progress bar */}
                {(file.status === 'uploading' || file.status === 'transcribing') && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}

                {/* Error message */}
                {file.error && (
                  <p className="text-xs text-destructive mt-1">{file.error}</p>
                )}
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(file.status)}
              </div>

              {/* Add transcript button for video/audio */}
              {file.status === 'pending' && (file.type === 'video' || file.type === 'audio') && !file.transcriptFile && (
                <div className="flex-shrink-0">
                  <Label htmlFor={`transcript-${file.id}`} className="cursor-pointer">
                    <div className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="h-3 w-3" />
                      Add transcript
                    </div>
                    <input
                      id={`transcript-${file.id}`}
                      type="file"
                      accept=".txt,.srt,.vtt"
                      className="hidden"
                      onChange={(e) => {
                        const transcriptFile = e.target.files?.[0]
                        if (transcriptFile) addTranscriptToFile(file.id, transcriptFile)
                      }}
                    />
                  </Label>
                </div>
              )}

              {/* Remove button */}
              {file.status === 'pending' && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeFile(file.id)}
                  disabled={uploading}
                  className="flex-shrink-0 h-8 w-8"
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
          size="lg"
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
      {files.some(f => (f.type === 'audio' || f.type === 'video') && !f.transcriptFile) && (
        <Alert>
          <Mic className="h-4 w-4" />
          <AlertDescription>
            Audio and video files without a transcript will be automatically transcribed after upload.
            To use your own transcript (e.g., from Descript), click "Add transcript" next to the file.
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialog.open} onOpenChange={(open) => !open && setDuplicateDialog({ open: false, file: null, existingMedia: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Duplicate File Detected
            </DialogTitle>
            <DialogDescription>
              This file already exists in the system. What would you like to do?
            </DialogDescription>
          </DialogHeader>

          {duplicateDialog.existingMedia && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium">{duplicateDialog.existingMedia.filename}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Already attached to another story
              </p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleDuplicateAction('cancel')}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleDuplicateAction('link')}>
              <Link2 className="h-4 w-4 mr-2" />
              Link Existing
            </Button>
            <Button onClick={() => handleDuplicateAction('upload-new')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddMediaToStory
