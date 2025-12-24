'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import type { MediaAsset, CulturalTag } from '@/types/database'

interface PhotoUploadManagerProps {
  galleryId: string
  onPhotosUploaded: (photos: any[]) => void
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  result?: any
}

interface PhotoFormData {
  title: string
  description: string
  alt_text: string
  cultural_context: string
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  ceremonial_content: boolean
  traditional_knowledge: boolean
  visibility: 'public' | 'community' | 'organisation' | 'private'
  tags: string
  caption: string
  location_in_ceremony: string
  people_depicted: string
  capture_date: string
}

export default function PhotoUploadManager({ galleryId, onPhotosUploaded }: PhotoUploadManagerProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null)
  const [photoForms, setPhotoForms] = useState<Record<string, PhotoFormData>>({})
  const [culturalTags, setCulturalTags] = useState<CulturalTag[]>([])

  const defaultFormData: PhotoFormData = {
    title: '',
    description: '',
    alt_text: '',
    cultural_context: '',
    cultural_sensitivity_level: 'medium',
    ceremonial_content: false,
    traditional_knowledge: false,
    visibility: 'private',
    tags: '',
    caption: '',
    location_in_ceremony: '',
    people_depicted: '',
    capture_date: ''
  }

  const fetchCulturalTags = async () => {
    try {
      const response = await fetch('/api/cultural-tags')
      if (response.ok) {
        const data = await response.json()
        setCulturalTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch cultural tags:', error)
    }
  }

  // Fetch cultural tags on component mount
  useEffect(() => {
    fetchCulturalTags()
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))

    setUploads(prev => [...prev, ...newUploads])
    setIsUploading(true)

    // Initialize form data for each file
    const newForms: Record<string, PhotoFormData> = {}
    acceptedFiles.forEach(file => {
      newForms[file.name] = {
        ...defaultFormData,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        alt_text: `Photo from gallery: ${file.name}`
      }
    })
    setPhotoForms(prev => ({ ...prev, ...newForms }))

    // Upload files
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      await uploadFile(file, uploads.length + i)
    }

    setIsUploading(false)
  }, [uploads.length])

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData()
    formData.append('file', file)

    // Add basic metadata
    const photoForm = photoForms[file.name] || defaultFormData
    formData.append('title', photoForm.title)
    formData.append('description', photoForm.description)
    formData.append('alt_text', photoForm.alt_text)
    formData.append('cultural_sensitivity_level', photoForm.cultural_sensitivity_level)
    formData.append('ceremonial_content', photoForm.ceremonial_content.toString())
    formData.append('traditional_knowledge', photoForm.traditional_knowledge.toString())
    formData.append('visibility', photoForm.visibility)
    formData.append('tags', photoForm.tags)
    formData.append('capture_date', photoForm.capture_date)

    try {
      // Update upload progress
      setUploads(prev => prev.map((upload, i) => 
        i === index ? { ...upload, progress: 50, status: 'processing' } : upload
      ))

      // Upload to media API
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add to gallery
      const galleryResponse = await fetch(`/api/galleries/${galleryId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mediaAssetId: result.asset.id,
          caption: photoForm.caption,
          cultural_context: photoForm.cultural_context,
          location_in_ceremony: photoForm.location_in_ceremony,
          people_depicted: photoForm.people_depicted ? photoForm.people_depicted.split(',').map(p => p.trim()) : []
        })
      })

      if (!galleryResponse.ok) {
        const galleryError = await galleryResponse.json()
        throw new Error(galleryError.error || 'Failed to add to gallery')
      }

      const galleryResult = await galleryResponse.json()

      // Update upload status
      setUploads(prev => prev.map((upload, i) => 
        i === index ? { 
          ...upload, 
          progress: 100, 
          status: 'completed', 
          result: galleryResult.association 
        } : upload
      ))

    } catch (error) {
      setUploads(prev => prev.map((upload, i) => 
        i === index ? { 
          ...upload, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : upload
      ))
    }
  }

  const updatePhotoForm = (filename: string, updates: Partial<PhotoFormData>) => {
    setPhotoForms(prev => ({
      ...prev,
      [filename]: { ...prev[filename], ...updates }
    }))
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
    
    // Remove form data
    const upload = uploads[index]
    if (upload) {
      setPhotoForms(prev => {
        const newForms = { ...prev }
        delete newForms[upload.file.name]
        return newForms
      })
    }
  }

  const retryUpload = async (index: number) => {
    const upload = uploads[index]
    if (upload && upload.status === 'error') {
      await uploadFile(upload.file, index)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm']
    },
    multiple: true,
    disabled: isUploading
  })

  const handleFinishUploading = () => {
    const completedUploads = uploads.filter(u => u.status === 'completed' && u.result)
    onPhotosUploaded(completedUploads.map(u => u.result))
    
    // Clear uploads
    setUploads([])
    setPhotoForms({})
    setCurrentPhotoIndex(null)
  }

  const completedCount = uploads.filter(u => u.status === 'completed').length
  const errorCount = uploads.filter(u => u.status === 'error').length
  const inProgressCount = uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colours ${
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : isUploading
            ? 'border-stone-200 bg-stone-50 cursor-not-allowed'
            : 'border-stone-300 hover:border-orange-400 hover:bg-orange-50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <svg
            className={`mx-auto h-16 w-16 ${
              isDragActive ? 'text-orange-400' : 'text-stone-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-stone-900">
              {isDragActive
                ? 'Drop photos here...'
                : isUploading
                ? 'Uploading in progress...'
                : 'Upload Photos'
              }
            </p>
            <p className="text-sm text-stone-600 mt-1">
              {isUploading
                ? 'Please wait while files are being processed'
                : 'Drag and drop photos here, or click to select files'
              }
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Supports JPEG, PNG, WebP, GIF images and MP4, WebM videos
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-stone-900">
                Upload Progress ({completedCount}/{uploads.length})
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                {inProgressCount > 0 && (
                  <span className="text-sage-600">
                    {inProgressCount} uploading
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-600">
                    {errorCount} failed
                  </span>
                )}
                {completedCount > 0 && (
                  <span className="text-green-600">
                    {completedCount} completed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {uploads.map((upload, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-stone-50 rounded-lg"
                >
                  {/* File Preview */}
                  <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {upload.file.type.startsWith('image/') ? (
                      <Image
                        src={URL.createObjectURL(upload.file)}
                        alt=""
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        onLoad={() => URL.revokeObjectURL(URL.createObjectURL(upload.file))}
                      />
                    ) : (
                      <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {upload.status === 'uploading' || upload.status === 'processing' ? (
                      <>
                        <div className="w-8 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sage-500 transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-sage-600 min-w-0">
                          {upload.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                        </span>
                      </>
                    ) : upload.status === 'completed' ? (
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs ml-1">Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-red-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs ml-1">Error</span>
                        </div>
                        <button
                          onClick={() => retryUpload(index)}
                          className="text-xs text-sage-600 hover:text-sage-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeUpload(index)}
                      className="text-stone-400 hover:text-red-500 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          {completedCount > 0 && (
            <div className="p-4 border-t border-stone-200">
              <div className="flex justify-end">
                <button
                  onClick={handleFinishUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colours"
                >
                  Add {completedCount} Photos to Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}