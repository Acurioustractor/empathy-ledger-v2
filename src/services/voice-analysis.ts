/**
 * Voice Analysis Service
 *
 * TypeScript wrapper for Praat-based voice analysis.
 * Calls Python service and stores results in Supabase.
 */

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import {
  AudioProsodicAnalysis,
  AudioEmotionAnalysis,
  EmotionLabel
} from '@/lib/database/types/impact-analysis'

export interface VoiceAnalysisOptions {
  pitchFloor?: number  // Hz, default 75 (lower for male voices)
  pitchCeiling?: number  // Hz, default 500 (higher for female/child voices)
  timeStep?: number  // Auto by default
  intensityMinPitch?: number  // Hz, default 100
}

export interface PraatPitchResult {
  mean_f0: number
  median_f0: number
  std_f0: number
  min_f0: number
  max_f0: number
  range_f0: number
  range_semitones: number
  voiced_fraction: number
}

export interface PraatIntensityResult {
  mean_intensity: number
  median_intensity: number
  std_intensity: number
  min_intensity: number
  max_intensity: number
  dynamic_range: number
}

export interface PraatRhythmResult {
  speech_rate: number
  articulation_rate: number
  pause_count: number
  mean_pause_duration: number
  total_pause_time: number
  speaking_time: number
  total_duration: number
}

export interface PraatVoiceQualityResult {
  jitter_local: number
  shimmer_local: number
  hnr_mean: number
  crest_factor: number
}

export interface PraatEmotionalResult {
  arousal_estimate: number
  valence_estimate: number
  pitch_variability: 'low' | 'medium' | 'high'
  intensity_variability: 'low' | 'medium' | 'high'
  speaking_pace: 'slow' | 'moderate' | 'fast'
  voice_quality_rating: 'clear' | 'moderate' | 'rough' | 'breathy'
}

export interface PraatAnalysisResult {
  success: boolean
  file_path: string
  duration: number
  pitch: PraatPitchResult
  intensity: PraatIntensityResult
  rhythm: PraatRhythmResult
  voice_quality: PraatVoiceQualityResult
  emotional_prosody: PraatEmotionalResult
  error?: string
}

/**
 * Run Praat analysis on an audio file
 */
export async function analyzeProsody(
  audioFilePath: string,
  options: VoiceAnalysisOptions = {}
): Promise<PraatAnalysisResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      'src/services/voice-analysis/praat_analyzer.py'
    )

    const args = ['analyze', audioFilePath]

    // Spawn Python process
    const pythonProcess = spawn('python3', [scriptPath, ...args])

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout) as PraatAnalysisResult
        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`))
      }
    })

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error}`))
    })
  })
}

/**
 * Analyze audio and save results to database
 */
export async function analyzeAndSaveAudioProsody(
  audioId: string,
  audioFilePath: string,
  storyId?: string,
  options: VoiceAnalysisOptions = {}
): Promise<{
  prosodic: AudioProsodicAnalysis
  emotion: AudioEmotionAnalysis
}> {
  // Run Praat analysis
  const analysis = await analyzeProsody(audioFilePath, options)

  if (!analysis.success) {
    throw new Error(`Voice analysis failed: ${analysis.error}`)
  }

  const supabase = await createClient()

  // Save prosodic analysis
  const prosodicData: Omit<AudioProsodicAnalysis, 'id' | 'created_at' | 'updated_at'> = {
    audio_id: audioId,
    story_id: storyId,
    mean_pitch_hz: analysis.pitch.mean_f0,
    pitch_range_hz: analysis.pitch.range_f0,
    pitch_std_hz: analysis.pitch.std_f0,
    pitch_range_semitones: analysis.pitch.range_semitones,
    mean_intensity_db: analysis.intensity.mean_intensity,
    intensity_range_db: analysis.intensity.dynamic_range,
    intensity_std_db: analysis.intensity.std_intensity,
    speech_rate_sps: analysis.rhythm.speech_rate,
    articulation_rate_sps: analysis.rhythm.articulation_rate,
    pause_count: analysis.rhythm.pause_count,
    mean_pause_duration_s: analysis.rhythm.mean_pause_duration,
    voiced_fraction: analysis.pitch.voiced_fraction,
    jitter: analysis.voice_quality.jitter_local,
    shimmer: analysis.voice_quality.shimmer_local,
    hnr_db: analysis.voice_quality.hnr_mean,
    speaking_time_s: analysis.rhythm.speaking_time,
    total_duration_s: analysis.rhythm.total_duration,
    analysis_method: 'praat_parselmouth',
    analysis_version: '1.0.0'
  }

  const { data: prosodicResult, error: prosodicError } = await supabase
    .from('audio_prosodic_analysis')
    .insert(prosodicData)
    .select()
    .single()

  if (prosodicError) {
    throw new Error(`Failed to save prosodic analysis: ${prosodicError.message}`)
  }

  // Map emotional prosody to emotion labels
  const emotionLabel = mapProsodyToEmotion(analysis.emotional_prosody)

  // Save emotion analysis
  const emotionData: Omit<AudioEmotionAnalysis, 'id' | 'created_at' | 'updated_at'> = {
    audio_id: audioId,
    story_id: storyId,
    emotion_label: emotionLabel,
    arousal: analysis.emotional_prosody.arousal_estimate,
    valence: analysis.emotional_prosody.valence_estimate,
    confidence: calculateEmotionConfidence(analysis),
    temporal_segments: null, // Could segment long audio in future
    analysis_method: 'praat_prosodic_mapping',
    model_version: '1.0.0',
    culturally_validated: false
  }

  const { data: emotionResult, error: emotionError } = await supabase
    .from('audio_emotion_analysis')
    .insert(emotionData)
    .select()
    .single()

  if (emotionError) {
    throw new Error(`Failed to save emotion analysis: ${emotionError.message}`)
  }

  return {
    prosodic: prosodicResult,
    emotion: emotionResult
  }
}

/**
 * Map prosodic features to emotion label using arousal-valence model
 */
function mapProsodyToEmotion(prosody: PraatEmotionalResult): EmotionLabel {
  const { arousal_estimate, valence_estimate } = prosody

  // Russell's circumplex model of affect
  if (arousal_estimate > 0.6) {
    // High arousal
    if (valence_estimate > 0.3) {
      return 'joy'  // High arousal, positive valence
    } else if (valence_estimate < -0.3) {
      return 'anger'  // High arousal, negative valence
    } else {
      return 'surprise'  // High arousal, neutral valence
    }
  } else if (arousal_estimate < 0.4) {
    // Low arousal
    if (valence_estimate > 0.3) {
      return 'calm'  // Low arousal, positive valence
    } else if (valence_estimate < -0.3) {
      return 'sadness'  // Low arousal, negative valence
    } else {
      return 'neutral'  // Low arousal, neutral valence
    }
  } else {
    // Medium arousal
    if (valence_estimate > 0.3) {
      return 'pride'  // Medium arousal, positive valence
    } else if (valence_estimate < -0.3) {
      return 'fear'  // Medium arousal, negative valence
    } else {
      return 'neutral'  // Medium arousal, neutral valence
    }
  }
}

/**
 * Calculate confidence score for emotion classification
 */
function calculateEmotionConfidence(analysis: PraatAnalysisResult): number {
  // Higher confidence when:
  // - Good voice quality (high HNR)
  // - High voiced fraction
  // - Clear prosodic patterns

  const hnrFactor = Math.min(1.0, analysis.voice_quality.hnr_mean / 20)
  const voicedFactor = analysis.pitch.voiced_fraction
  const variabilityFactor = analysis.emotional_prosody.pitch_variability === 'medium' ? 1.0 : 0.7

  const confidence = (hnrFactor + voicedFactor + variabilityFactor) / 3

  return Math.max(0.3, Math.min(0.95, confidence))
}

/**
 * Batch analyze multiple audio files
 */
export async function batchAnalyzeAudio(
  audioFiles: Array<{
    id: string
    filePath: string
    storyId?: string
  }>,
  options: VoiceAnalysisOptions = {}
): Promise<Array<{
  audioId: string
  success: boolean
  error?: string
}>> {
  const results = []

  for (const file of audioFiles) {
    try {
      await analyzeAndSaveAudioProsody(file.id, file.filePath, file.storyId, options)
      results.push({
        audioId: file.id,
        success: true
      })
    } catch (error) {
      results.push({
        audioId: file.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

/**
 * Get prosodic analysis for comparison
 */
export async function compareProsody(
  audioId1: string,
  audioId2: string
): Promise<{
  audio1: AudioProsodicAnalysis
  audio2: AudioProsodicAnalysis
  differences: {
    pitch_difference_hz: number
    intensity_difference_db: number
    speech_rate_difference_sps: number
    emotional_distance: number
  }
}> {
  const supabase = await createClient()

  const { data: audio1, error: error1 } = await supabase
    .from('audio_prosodic_analysis')
    .select('*')
    .eq('audio_id', audioId1)
    .single()

  const { data: audio2, error: error2 } = await supabase
    .from('audio_prosodic_analysis')
    .select('*')
    .eq('audio_id', audioId2)
    .single()

  if (error1 || error2) {
    throw new Error('Failed to fetch prosodic analyses')
  }

  // Get emotion analyses for emotional distance
  const { data: emotion1 } = await supabase
    .from('audio_emotion_analysis')
    .select('arousal, valence')
    .eq('audio_id', audioId1)
    .single()

  const { data: emotion2 } = await supabase
    .from('audio_emotion_analysis')
    .select('arousal, valence')
    .eq('audio_id', audioId2)
    .single()

  // Calculate differences
  const pitchDiff = Math.abs(audio1.mean_pitch_hz - audio2.mean_pitch_hz)
  const intensityDiff = Math.abs(audio1.mean_intensity_db - audio2.mean_intensity_db)
  const speechRateDiff = Math.abs(audio1.speech_rate_sps - audio2.speech_rate_sps)

  // Emotional distance (Euclidean distance in arousal-valence space)
  let emotionalDistance = 0
  if (emotion1 && emotion2) {
    const arousalDiff = emotion1.arousal - emotion2.arousal
    const valenceDiff = emotion1.valence - emotion2.valence
    emotionalDistance = Math.sqrt(arousalDiff ** 2 + valenceDiff ** 2)
  }

  return {
    audio1,
    audio2,
    differences: {
      pitch_difference_hz: pitchDiff,
      intensity_difference_db: intensityDiff,
      speech_rate_difference_sps: speechRateDiff,
      emotional_distance: emotionalDistance
    }
  }
}

/**
 * Detect prosodic markers of cultural linguistics
 * (code-switching, traditional formulae, ceremonial speech)
 */
export async function detectCulturalMarkers(
  audioId: string
): Promise<{
  has_pitch_patterns: boolean  // Specific pitch contours
  has_rhythm_patterns: boolean  // Specific rhythmic patterns
  has_intensity_patterns: boolean  // Specific intensity patterns
  cultural_confidence: number
  recommendations: string[]
}> {
  const supabase = await createClient()

  const { data: prosody, error } = await supabase
    .from('audio_prosodic_analysis')
    .select('*')
    .eq('audio_id', audioId)
    .single()

  if (error || !prosody) {
    throw new Error('Failed to fetch prosodic analysis')
  }

  // Detect patterns (this is simplified - real implementation would use ML)
  const hasPitchPatterns = prosody.pitch_range_semitones > 15  // Wide pitch range
  const hasRhythmPatterns = prosody.pause_count > 5  // Ceremonial pauses
  const hasIntensityPatterns = prosody.intensity_range_db > 25  // Dynamic storytelling

  const confidence = (
    (hasPitchPatterns ? 0.33 : 0) +
    (hasRhythmPatterns ? 0.33 : 0) +
    (hasIntensityPatterns ? 0.34 : 0)
  )

  const recommendations: string[] = []

  if (hasPitchPatterns) {
    recommendations.push('Consider community validation of pitch patterns for cultural significance')
  }

  if (hasRhythmPatterns) {
    recommendations.push('Pauses may indicate ceremonial or formulaic speech - consult with storyteller')
  }

  if (hasIntensityPatterns) {
    recommendations.push('Dynamic intensity suggests performative storytelling tradition')
  }

  return {
    has_pitch_patterns: hasPitchPatterns,
    has_rhythm_patterns: hasRhythmPatterns,
    has_intensity_patterns: hasIntensityPatterns,
    cultural_confidence: confidence,
    recommendations
  }
}
