'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mic,
  Square,
  Pause,
  Play,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onUploadComplete?: (url: string, duration: number) => void
  maxDurationSeconds?: number
  uploadEndpoint?: string
  storyId?: string
  className?: string
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'uploading' | 'complete' | 'error'

// Detect iOS for special handling
const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

// Get best supported MIME type
function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/mp4' // Fallback
  }

  // Order of preference - iOS needs different formats
  const mimeTypes = isIOS
    ? ['audio/mp4', 'audio/aac', 'audio/wav']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }

  return 'audio/webm' // Default fallback
}

export function AudioRecorder({
  onRecordingComplete,
  onUploadComplete,
  maxDurationSeconds = 3600,
  uploadEndpoint = '/api/stories/upload-audio',
  storyId,
  className = ''
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  // Check browser support on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false)
      setError('Audio recording is not supported in this browser. Please use Chrome, Safari, or Firefox.')
    } else if (typeof MediaRecorder === 'undefined') {
      setIsSupported(false)
      setError('Audio recording is not supported in this browser.')
    }
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [cleanup, audioUrl])

  // Format duration as MM:SS or HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - (pausedDurationRef.current * 1000)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setDuration(elapsed)

      // Auto-stop at max duration
      if (elapsed >= maxDurationSeconds) {
        stopRecording()
      }
    }, 1000)
  }, [maxDurationSeconds])

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    stopTimer()

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e)
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setState('stopped')
  }, [stopTimer])

  // Request microphone access and start recording
  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []
    setState('requesting')

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      // Get supported MIME type
      const mimeType = getSupportedMimeType()
      console.log('Using MIME type:', mimeType)

      // Create MediaRecorder
      let mediaRecorder: MediaRecorder
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType })
      } catch (e) {
        // Fallback without MIME type
        console.warn('Failed with mimeType, trying default:', e)
        mediaRecorder = new MediaRecorder(stream)
      }
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording error occurred. Please try again.')
        setState('error')
        cleanup()
      }

      mediaRecorder.onstop = () => {
        try {
          if (audioChunksRef.current.length === 0) {
            setError('No audio was recorded. Please try again.')
            setState('error')
            return
          }

          const recordedMimeType = mediaRecorder.mimeType || 'audio/webm'
          const blob = new Blob(audioChunksRef.current, { type: recordedMimeType })
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)
          setAudioBlob(blob)

          // Call the callback with the recorded audio
          const finalDuration = duration > 0 ? duration : Math.floor((Date.now() - startTimeRef.current) / 1000)
          onRecordingComplete(blob, finalDuration)
        } catch (e) {
          console.error('Error processing recording:', e)
          setError('Failed to process recording. Please try again.')
          setState('error')
        }
      }

      // Start recording
      // Use timeslice for Safari compatibility
      mediaRecorder.start(isIOS ? undefined : 1000)
      setState('recording')
      pausedDurationRef.current = 0
      startTimer()
    } catch (err: unknown) {
      console.error('Failed to start recording:', err)
      cleanup()

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone access was denied. Please allow microphone access in your browser settings and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.')
        } else if (err.name === 'NotReadableError') {
          setError('Could not access your microphone. It may be in use by another app.')
        } else {
          setError(`Failed to start recording: ${err.message}`)
        }
      } else {
        setError('Failed to start recording. Please check your microphone permissions.')
      }
      setState('error')
    }
  }

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      try {
        mediaRecorderRef.current.pause()
        pausedDurationRef.current = duration
        stopTimer()
        setState('paused')
      } catch (e) {
        console.error('Pause not supported:', e)
        // Some browsers don't support pause, just continue recording
      }
    }
  }

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && state === 'paused') {
      try {
        mediaRecorderRef.current.resume()
        startTimer()
        setState('recording')
      } catch (e) {
        console.error('Resume not supported:', e)
      }
    }
  }

  // Discard recording
  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    pausedDurationRef.current = 0
    audioChunksRef.current = []
    setState('idle')
    setError(null)
  }

  // Retry after error
  const retryRecording = () => {
    cleanup()
    discardRecording()
  }

  // Check if pause is supported
  const pauseSupported = typeof MediaRecorder !== 'undefined' &&
    typeof MediaRecorder.prototype.pause === 'function' && !isIOS

  // Not supported view
  if (!isSupported) {
    return (
      <div className={cn('rounded-2xl bg-card border border-border p-6', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl bg-card border border-border p-6', className)}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Timer display */}
      <div className="text-center mb-6">
        <div className={cn(
          'text-5xl font-mono font-bold tabular-nums',
          state === 'recording' ? 'text-red-600' : 'text-foreground'
        )}>
          {formatDuration(duration)}
        </div>

        {/* Recording indicator */}
        {state === 'recording' && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-sm font-medium text-red-600">Recording</span>
          </div>
        )}

        {state === 'paused' && (
          <div className="text-sm text-amber-600 mt-3 font-medium">Paused</div>
        )}

        {state === 'requesting' && (
          <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Requesting microphone access...</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Idle state - show start button */}
        {state === 'idle' && (
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 press-effect"
            onClick={startRecording}
          >
            <Mic className="h-6 w-6 mr-3" />
            Start Recording
          </Button>
        )}

        {/* Requesting state - show loading */}
        {state === 'requesting' && (
          <Button
            size="lg"
            className="w-full h-16 text-lg"
            disabled
          >
            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
            Starting...
          </Button>
        )}

        {/* Recording state - show pause and stop */}
        {state === 'recording' && (
          <div className="flex gap-3">
            {pauseSupported && (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-14 press-effect"
                onClick={pauseRecording}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button
              size="lg"
              variant="destructive"
              className={cn('h-14 press-effect', pauseSupported ? 'flex-1' : 'w-full')}
              onClick={stopRecording}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </div>
        )}

        {/* Paused state - show resume and stop */}
        {state === 'paused' && (
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 h-14 bg-green-600 hover:bg-green-700 press-effect"
              onClick={resumeRecording}
            >
              <Play className="h-5 w-5 mr-2" />
              Resume
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="flex-1 h-14 press-effect"
              onClick={stopRecording}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </Button>
          </div>
        )}

        {/* Stopped state - show playback and actions */}
        {state === 'stopped' && audioUrl && (
          <div className="space-y-4">
            {/* Audio playback */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Preview Recording</span>
                <span className="text-sm text-muted-foreground ml-auto">{formatDuration(duration)}</span>
              </div>
              <audio src={audioUrl} controls className="w-full h-10" />
            </div>

            {/* Success indicator */}
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Recording ready!</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 press-effect"
                onClick={discardRecording}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Re-record
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 press-effect"
            onClick={retryRecording}
          >
            <Mic className="h-5 w-5 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Helpful tips */}
      {state === 'idle' && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Tap to start recording the interview
        </p>
      )}
    </div>
  )
}

export default AudioRecorder
