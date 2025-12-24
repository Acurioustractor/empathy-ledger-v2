'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileVideo,
  Shield,
  MessageSquare,
  Save,
  Eye,
  Volume2,
  VolumeX
} from 'lucide-react'
import type { MediaAsset } from '@/types/database'

interface VideoReviewModalProps {
  isOpen: boolean
  onClose: () => void
  mediaAsset: MediaAsset | null
  onReviewComplete?: (decision: 'approved' | 'rejected', notes: string) => void
  currentUser?: {
    id: string
    display_name: string
    is_elder: boolean
    community_roles?: string[]
  }
}

interface ReviewDecision {
  decision: 'approved' | 'rejected' | null
  notes: string
  culturalSensitivityLevel: 'low' | 'medium' | 'high'
  requiresElderApproval: boolean
  ceremonialContent: boolean
  traditionalKnowledge: boolean
}

export default function VideoReviewModal({
  isOpen,
  onClose,
  mediaAsset,
  onReviewComplete,
  currentUser
}: VideoReviewModalProps) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [review, setReview] = useState<ReviewDecision>({
    decision: null,
    notes: '',
    culturalSensitivityLevel: 'medium',
    requiresElderApproval: false,
    ceremonialContent: false,
    traditionalKnowledge: false
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && mediaAsset) {
      setReview({
        decision: null,
        notes: '',
        culturalSensitivityLevel: mediaAsset.cultural_sensitivity_level as 'low' | 'medium' | 'high',
        requiresElderApproval: false,
        ceremonialContent: mediaAsset.ceremonial_content || false,
        traditionalKnowledge: mediaAsset.traditional_knowledge || false
      })
      setError(null)
    }
  }, [isOpen, mediaAsset])

  const handleVideoPlay = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoMute = () => {
    if (videoElement) {
      videoElement.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoElement) {
      setCurrentTime(videoElement.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoElement) {
      setDuration(videoElement.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoElement) {
      videoElement.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleSubmitReview = async () => {
    if (!review.decision || !mediaAsset) {
      setError('Please select approved or rejected')
      return
    }

    if (review.decision === 'rejected' && !review.notes.trim()) {
      setError('Please provide notes explaining why this content was rejected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/media/${mediaAsset.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: review.decision,
          notes: review.notes,
          cultural_sensitivity_level: review.culturalSensitivityLevel,
          ceremonial_content: review.ceremonialContent,
          traditional_knowledge: review.traditionalKnowledge,
          reviewer_id: currentUser?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      onReviewComplete?.(review.decision, review.notes)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getSensitivityLabel = (level: string) => {
    switch (level) {
      case 'high': return 'High - Cultural Guidance Required'
      case 'medium': return 'Medium - Respectful Viewing'
      default: return 'Low - Community Open'
    }
  }

  if (!mediaAsset || mediaAsset.file_type !== 'video') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileVideo className="w-5 h-5 mr-2" />
            Video Review: {mediaAsset.title || mediaAsset.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <Card>
            <CardContent className="p-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={setVideoElement}
                  className="w-full h-auto max-h-96"
                  src={mediaAsset.public_url || ''}
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster={mediaAsset.thumbnail_url || ''}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex items-center space-x-3 text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVideoPlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVideoMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1 flex items-center space-x-2">
                      <span className="text-xs">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-white/30 rounded-lg appearance-none slider"
                      />
                      <span className="text-xs">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-stone-900 mb-2">Media Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-600">Filename:</span>
                      <span className="font-medium">{mediaAsset.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Duration:</span>
                      <span className="font-medium">{mediaAsset.duration ? `${Math.floor(mediaAsset.duration / 60)}:${(mediaAsset.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">File Size:</span>
                      <span className="font-medium">{(mediaAsset.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Upload Date:</span>
                      <span className="font-medium">{new Date(mediaAsset.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-stone-900 mb-2">Current Status</h4>
                  <div className="space-y-2">
                    <Badge className={getSensitivityColor(mediaAsset.cultural_sensitivity_level)}>
                      {getSensitivityLabel(mediaAsset.cultural_sensitivity_level)}
                    </Badge>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={mediaAsset.consent_status === 'granted' ? 'default' : 'secondary'}>
                        Consent: {mediaAsset.consent_status}
                      </Badge>
                      
                      {mediaAsset.ceremonial_content && (
                        <Badge variant="outline" className="border-clay-200 text-clay-800">
                          Ceremonial Content
                        </Badge>
                      )}
                      
                      {mediaAsset.traditional_knowledge && (
                        <Badge variant="outline" className="border-sage-200 text-sage-800">
                          Traditional Knowledge
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-stone-600">
                      Status: <span className="font-medium capitalize">{mediaAsset.cultural_review_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {mediaAsset.description && (
                <div className="mt-4">
                  <h4 className="font-medium text-stone-900 mb-2">Description</h4>
                  <p className="text-sm text-stone-600">{mediaAsset.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-stone-900 mb-4">Cultural Review</h4>
              
              {/* Decision Buttons */}
              <div className="flex space-x-3 mb-4">
                <Button
                  variant={review.decision === 'approved' ? 'default' : 'outline'}
                  onClick={() => setReview(prev => ({ ...prev, decision: 'approved' }))}
                  className={review.decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  variant={review.decision === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setReview(prev => ({ ...prev, decision: 'rejected' }))}
                  className={review.decision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              {/* Cultural Sensitivity Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Cultural Sensitivity Level
                </label>
                <select
                  value={review.culturalSensitivityLevel}
                  onChange={(e) => setReview(prev => ({ 
                    ...prev, 
                    culturalSensitivityLevel: e.target.value as 'low' | 'medium' | 'high' 
                  }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Low - Community Open</option>
                  <option value="medium">Medium - Respectful Viewing</option>
                  <option value="high">High - Cultural Guidance Required</option>
                </select>
              </div>

              {/* Cultural Content Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={review.ceremonialContent}
                    onChange={(e) => setReview(prev => ({ ...prev, ceremonialContent: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                  />
                  <span className="text-sm">Contains ceremonial content</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={review.traditionalKnowledge}
                    onChange={(e) => setReview(prev => ({ ...prev, traditionalKnowledge: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                  />
                  <span className="text-sm">Contains traditional knowledge</span>
                </label>
              </div>

              {/* Review Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Review Notes {review.decision === 'rejected' && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={review.notes}
                  onChange={(e) => setReview(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={review.decision === 'approved' 
                    ? 'Optional notes about cultural protocols or usage guidelines...'
                    : 'Please explain why this content was rejected and what changes are needed...'
                  }
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                
                <Button 
                  onClick={handleSubmitReview}
                  disabled={loading || !review.decision}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review History */}
          {mediaAsset.cultural_review_notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-stone-900 mb-2">Previous Review Notes</h4>
                <p className="text-sm text-stone-600">{mediaAsset.cultural_review_notes}</p>
                {mediaAsset.cultural_review_date && (
                  <div className="mt-2 text-xs text-stone-500">
                    Reviewed on {new Date(mediaAsset.cultural_review_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}