'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Video,
  X,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  FileVideo,
  Cloud
} from 'lucide-react'
import { formatFileSize } from '@/lib/media/video-processing'

interface VideoUploaderProps {
  storyId?: string
  transcriptId?: string
  onUploadComplete?: (result: UploadResult) => void
  onCancel?: () => void
  maxSizeMB?: number
}

interface UploadResult {
  videoId: string
  playbackUrl?: string
  thumbnailUrl?: string
  status: string
}

type UploadStatus = 'idle' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'error'

export function VideoUploader({
  storyId,
  transcriptId,
  onUploadComplete,
  onCancel,
  maxSizeMB = 500
}: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type. Supported: MP4, WebM, MOV, AVI`)
      return
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size: ${maxSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    setError(null)
    setStatus('idle')
  }

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Trigger validation via file input
      const dt = new DataTransfer()
      dt.items.add(file)
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files
        handleFileSelect({ target: fileInputRef.current } as any)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Upload video
  const handleUpload = async () => {
    if (!selectedFile) return

    setStatus('preparing')
    setProgress(0)
    setError(null)

    try {
      // Step 1: Create upload URL
      const createResponse = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          storyId,
          transcriptId,
          options: {
            generateThumbnails: true
          }
        })
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || 'Failed to create upload')
      }

      const { videoId: newVideoId, uploadUrl, useDirectUpload, directUploadPath } = await createResponse.json()
      setVideoId(newVideoId)

      setStatus('uploading')

      // Step 2: Upload the file
      if (uploadUrl) {
        // Mux direct upload
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type
          }
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload video to processing service')
        }
      } else if (useDirectUpload && directUploadPath) {
        // Direct upload to our API
        const formData = new FormData()
        formData.append('file', selectedFile)

        // Use XMLHttpRequest for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setProgress(pct)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error('Upload failed'))
            }
          }

          xhr.onerror = () => reject(new Error('Upload failed'))

          xhr.open('POST', directUploadPath)
          xhr.send(formData)
        })
      }

      setProgress(100)
      setStatus('processing')

      // Step 3: Poll for processing completion
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000)) // 5 second intervals

        const statusResponse = await fetch(`/api/videos/upload?videoId=${newVideoId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'ready') {
          setStatus('complete')
          const result: UploadResult = {
            videoId: newVideoId,
            playbackUrl: statusData.playbackUrl,
            thumbnailUrl: statusData.thumbnailUrl,
            status: 'ready'
          }
          setUploadResult(result)
          onUploadComplete?.(result)
          return
        }

        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Video processing failed')
        }

        attempts++
      }

      // If we get here, processing timed out but may still complete
      setStatus('complete')
      const result: UploadResult = {
        videoId: newVideoId,
        status: 'processing'
      }
      setUploadResult(result)
      onUploadComplete?.(result)

    } catch (err) {
      console.error('Upload error:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  // Reset uploader
  const handleReset = () => {
    setSelectedFile(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
    setVideoId(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload Video
        </CardTitle>
        <CardDescription>
          Upload a video file for processing. Supported formats: MP4, WebM, MOV
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'idle' && (
          <>
            {/* Drag and drop zone */}
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Drop video here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum size: {maxSizeMB}MB • MP4, WebM, MOV supported
              </p>
            </div>

            {/* Selected file info */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileVideo className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReset()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload button */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!selectedFile}
                onClick={handleUpload}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Upload & Process
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}

        {(status === 'preparing' || status === 'uploading' || status === 'processing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">
                {status === 'preparing' && 'Preparing upload...'}
                {status === 'uploading' && 'Uploading video...'}
                {status === 'processing' && 'Processing video...'}
              </span>
            </div>

            {status === 'uploading' && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {progress}% uploaded
                </p>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Your video is being processed. This may take a few minutes.</p>
                <p>You can close this dialog - processing will continue in the background.</p>
              </div>
            )}

            {selectedFile && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <FileVideo className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
        )}

        {status === 'complete' && uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-lg font-medium">Upload Complete!</span>
            </div>

            {uploadResult.thumbnailUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={uploadResult.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">
                Video ID: {uploadResult.videoId}
              </Badge>
              <Badge className={uploadResult.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {uploadResult.status === 'ready' ? 'Ready' : 'Processing'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleReset}>
                Upload Another
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Done
                </Button>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-red-600">
              <AlertTriangle className="h-8 w-8" />
              <span className="text-lg font-medium">Upload Failed</span>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleReset}>
                Try Again
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
