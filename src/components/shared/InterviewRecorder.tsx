'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import type { InterviewQuestion } from '@/lib/interview-scripts'

interface InterviewRecorderProps {
  script: InterviewQuestion[]
  onComplete: (transcript: string, audioBlob: Blob) => void
  onCancel: () => void
  type: 'project' | 'organization'
  saving?: boolean
}

export default function InterviewRecorder({
  script,
  onComplete,
  onCancel,
  type,
  saving = false
}: InterviewRecorderProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const currentQuestion = script[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / script.length) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
      }

      mediaRecorder.start()
      setRecording(true)
      setPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Could not access microphone. Please check your browser permissions.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      setPaused(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (paused) {
        mediaRecorderRef.current.resume()
        setPaused(false)
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setPaused(true)
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }

  // Reset recording
  const resetRecording = () => {
    stopRecording()
    setAudioBlob(null)
    setRecordingTime(0)
    audioChunksRef.current = []
  }

  // Transcribe audio
  const transcribeAudio = async () => {
    if (!audioBlob) return

    try {
      setTranscribing(true)
      setError(null)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'interview.webm')
      formData.append('type', type)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      setTranscript(data.transcript)

      // Call onComplete with transcript and audio
      onComplete(data.transcript, audioBlob)
    } catch (err) {
      console.error('Error transcribing audio:', err)
      setError('Failed to transcribe audio. Please try again.')
    } finally {
      setTranscribing(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-600">Interview Progress</span>
          <span className="font-medium">
            Question {currentQuestionIndex + 1} of {script.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Question */}
      <Card className="p-6 bg-sage-50 border-sage-200">
        <div className="space-y-4">
          <div>
            <Badge className="mb-2">{currentQuestion.section}</Badge>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.guidingNotes && (
              <p className="text-sm text-stone-600 italic">
                Note: {currentQuestion.guidingNotes}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Recording Controls */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Recording Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!recording && !audioBlob && !transcribing && !saving && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-stone-300" />
                  <span className="font-medium text-stone-600">Ready to Record</span>
                </div>
              )}
              {recording && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${paused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="font-medium text-red-700">
                    {paused ? 'Paused' : 'Recording...'}
                  </span>
                </div>
              )}
              {audioBlob && !recording && !transcribing && !saving && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">Recording Complete</span>
                </div>
              )}
              {transcribing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-sage-500 animate-spin" />
                  <span className="font-medium text-sage-700">Transcribing Audio...</span>
                </div>
              )}
              {saving && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-clay-500 animate-spin" />
                  <span className="font-medium text-clay-700">Saving Interview...</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-mono font-bold text-stone-900">
              {formatTime(recordingTime)}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            {!recording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                className="w-40"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}

            {recording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={togglePause}
                  className="w-32"
                >
                  {paused ? (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="w-32 bg-red-600 hover:bg-red-700"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {audioBlob && !recording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetRecording}
                  className="w-40"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Re-record
                </Button>
                <Button
                  size="lg"
                  onClick={transcribeAudio}
                  disabled={transcribing || saving}
                  className="w-48"
                >
                  {transcribing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Transcribe & Save
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Question Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous Question
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.min(script.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === script.length - 1}
        >
          Next Question
        </Button>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={onCancel} disabled={recording}>
          Cancel Interview
        </Button>
      </div>
    </div>
  )
}
