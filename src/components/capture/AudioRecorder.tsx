'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mic,
  Square,
  Pause,
  Play,
  Trash2,
  Upload,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onUploadComplete?: (url: string, duration: number) => void
  maxDurationSeconds?: number
  uploadEndpoint?: string
  storyId?: string
  className?: string
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'uploading' | 'complete' | 'error'

export function AudioRecorder({
  onRecordingComplete,
  onUploadComplete,
  maxDurationSeconds = 3600, // 1 hour default
  uploadEndpoint = '/api/stories/upload-audio',
  storyId,
  className = ''
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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

  // Request microphone access and start recording
  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      streamRef.current = stream

      // Create MediaRecorder with best available format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob, duration)
      }

      // Start recording with 1 second chunks for smoother pausing
      mediaRecorder.start(1000)
      setState('recording')
      pausedDurationRef.current = 0
      startTimer()
    } catch (err: unknown) {
      console.error('Failed to start recording:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access to record.')
      } else {
        setError('Failed to start recording. Please check your microphone.')
      }
      setState('error')
    }
  }

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      pausedDurationRef.current = duration
      stopTimer()
      setState('paused')
    }
  }

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimer()
      setState('recording')
    }
  }

  // Stop recording
  const stopRecording = useCallback(() => {
    stopTimer()

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setState('stopped')
  }, [stopTimer])

  // Discard recording
  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setDuration(0)
    pausedDurationRef.current = 0
    audioChunksRef.current = []
    setState('idle')
  }

  // Upload recording
  const uploadRecording = async () => {
    if (!audioChunksRef.current.length) return

    setState('uploading')
    setUploadProgress(0)

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, `recording-${Date.now()}.webm`)
      formData.append('duration', duration.toString())
      if (storyId) {
        formData.append('story_id', storyId)
      }

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setState('complete')
      setUploadProgress(100)

      if (onUploadComplete) {
        onUploadComplete(data.url, duration)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload recording. Please try again.')
      setState('error')
    }
  }

  // Render based on state
  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Timer display */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-mono font-bold ${
            state === 'recording' ? 'text-red-600 animate-pulse' : 'text-stone-700 dark:text-stone-300'
          }`}>
            {formatDuration(duration)}
          </div>
          {state === 'recording' && (
            <div className="flex items-center justify-center gap-2 mt-2 text-red-600">
              <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
          {state === 'paused' && (
            <div className="text-sm text-amber-600 mt-2 font-medium">Paused</div>
          )}
          {maxDurationSeconds && state === 'recording' && (
            <div className="text-xs text-stone-400 mt-1">
              Max: {formatDuration(maxDurationSeconds)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {/* Idle state - show start button */}
          {state === 'idle' && (
            <Button
              size="lg"
              className="w-full max-w-xs bg-red-600 hover:bg-red-700"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {/* Recording state - show pause and stop */}
          {state === 'recording' && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={pauseRecording}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          {/* Paused state - show resume and stop */}
          {state === 'paused' && (
            <>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={resumeRecording}
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          {/* Stopped state - show playback, discard, upload */}
          {state === 'stopped' && audioUrl && (
            <div className="w-full space-y-4">
              {/* Audio playback */}
              <audio src={audioUrl} controls className="w-full" />

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={discardRecording}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button
                  className="flex-1 bg-sage-600 hover:bg-sage-700"
                  onClick={uploadRecording}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Save Recording
                </Button>
              </div>
            </div>
          )}

          {/* Uploading state */}
          {state === 'uploading' && (
            <div className="w-full text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-sage-600" />
              <p className="mt-2 text-sm text-stone-500">Uploading recording...</p>
            </div>
          )}

          {/* Complete state */}
          {state === 'complete' && (
            <div className="w-full text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-medium">Recording saved!</span>
              </div>
              <Button
                variant="outline"
                onClick={discardRecording}
              >
                Record Another
              </Button>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setError(null)
                setState('idle')
              }}
            >
              Try Again
            </Button>
          )}
        </div>

        {/* Recording tips */}
        {state === 'idle' && (
          <div className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            <p>Find a quiet space for best quality</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AudioRecorder
