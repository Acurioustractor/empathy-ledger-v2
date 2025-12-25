/**
 * Narrative Analysis Service
 *
 * Analyzes story transcripts to extract emotional trajectory,
 * classify narrative arc type, and identify key moments.
 */

import OpenAI from 'openai'
import {
  StoryNarrativeArc,
  ArcType,
  TrajectoryPoint,
  NarrativeSegment
} from '@/lib/database/types/impact-analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze sentiment of text using OpenAI
 */
async function analyzeSentiment(text: string): Promise<{
  valence: number    // -1 (negative) to 1 (positive)
  arousal: number    // 0 (calm) to 1 (energized)
  dominant_emotion: string
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert at analyzing emotional content in narratives, particularly Indigenous storytelling.

Analyze the emotional tone of the text and respond with JSON only.

Return:
{
  "valence": number (-1.0 to 1.0, where -1 is very negative/sad and 1 is very positive/joyful),
  "arousal": number (0.0 to 1.0, where 0 is calm/peaceful and 1 is energized/intense),
  "dominant_emotion": string (one of: joy, sadness, anger, fear, surprise, trust, anticipation, disgust, neutral)
}

Be sensitive to cultural context. Some narratives may express strength through apparent sadness, or wisdom through struggle.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(response.choices[0].message.content!)

  return {
    valence: Math.max(-1, Math.min(1, result.valence)),
    arousal: Math.max(0, Math.min(1, result.arousal)),
    dominant_emotion: result.dominant_emotion
  }
}

// ============================================================================
// STORY ARC DETECTION
// ============================================================================

/**
 * Split transcript into segments for analysis
 */
function splitIntoSegments(transcript: string, numSegments: number = 20): string[] {
  const words = transcript.split(/\s+/)
  const wordsPerSegment = Math.ceil(words.length / numSegments)

  const segments: string[] = []

  for (let i = 0; i < numSegments; i++) {
    const start = i * wordsPerSegment
    const end = Math.min((i + 1) * wordsPerSegment, words.length)
    const segment = words.slice(start, end).join(' ')

    if (segment.trim()) {
      segments.push(segment)
    }
  }

  return segments
}

/**
 * Classify narrative arc based on emotional trajectory
 *
 * Based on research from University of Vermont:
 * https://arxiv.org/abs/1606.07772
 */
function classifyArc(trajectory: TrajectoryPoint[]): {
  arc_type: ArcType
  confidence: number
} {
  if (trajectory.length < 3) {
    return { arc_type: 'linear', confidence: 0.5 }
  }

  const valences = trajectory.map(t => t.valence)

  const start = average(valences.slice(0, 3))
  const middle = average(valences.slice(
    Math.floor(valences.length * 0.4),
    Math.floor(valences.length * 0.6)
  ))
  const end = average(valences.slice(-3))

  // Thresholds for classification
  const RISE_THRESHOLD = 0.15
  const FALL_THRESHOLD = -0.15

  const startToMiddle = middle - start
  const middleToEnd = end - middle
  const startToEnd = end - start

  // Rags to Riches: steady rise
  if (startToEnd > RISE_THRESHOLD && startToMiddle > 0 && middleToEnd > 0) {
    return { arc_type: 'rags_to_riches', confidence: 0.85 }
  }

  // Tragedy: steady fall
  if (startToEnd < FALL_THRESHOLD && startToMiddle < 0 && middleToEnd < 0) {
    return { arc_type: 'tragedy', confidence: 0.85 }
  }

  // Man in a Hole: fall then rise
  if (middle < start - 0.1 && end > middle + 0.1) {
    return { arc_type: 'man_in_hole', confidence: 0.8 }
  }

  // Icarus: rise then fall
  if (middle > start + 0.1 && end < middle - 0.1) {
    return { arc_type: 'icarus', confidence: 0.8 }
  }

  // Cinderella: rise-fall-rise
  const firstThird = average(valences.slice(0, Math.floor(valences.length / 3)))
  const secondThird = average(valences.slice(
    Math.floor(valences.length / 3),
    Math.floor(valences.length * 2 / 3)
  ))
  const lastThird = average(valences.slice(Math.floor(valences.length * 2 / 3)))

  if (secondThird > firstThird && lastThird < secondThird && lastThird > firstThird) {
    return { arc_type: 'cinderella', confidence: 0.75 }
  }

  // Oedipus: fall-rise-fall
  if (secondThird < firstThird && lastThird > secondThird && lastThird < firstThird) {
    return { arc_type: 'oedipus', confidence: 0.75 }
  }

  // Cyclical: for seasonal/ceremonial stories
  const variance = standardDeviation(valences)
  if (variance > 0.3 && Math.abs(start - end) < 0.1) {
    return { arc_type: 'cyclical', confidence: 0.6 }
  }

  // Linear: no clear pattern
  return { arc_type: 'linear', confidence: 0.5 }
}

/**
 * Identify narrative segments (acts)
 */
async function identifySegments(
  transcript: string,
  trajectory: TrajectoryPoint[]
): Promise<NarrativeSegment[]> {
  // Find key moments (peaks and valleys)
  const valences = trajectory.map(t => t.valence)

  const peakIdx = valences.indexOf(Math.max(...valences))
  const valleyIdx = valences.indexOf(Math.min(...valences))

  const segments: NarrativeSegment[] = []

  // Opening (0 to first major change)
  const firstChange = Math.min(peakIdx, valleyIdx)
  if (firstChange > 2) {
    segments.push({
      start: 0,
      end: trajectory[firstChange].time,
      label: 'opening',
      emotion: trajectory[0].valence > 0 ? 'hopeful' : 'challenging'
    })
  }

  // Middle/Crisis (around valley or peak)
  const crisisStart = Math.max(0, Math.min(peakIdx, valleyIdx) - 2)
  const crisisEnd = Math.min(trajectory.length - 1, Math.max(peakIdx, valleyIdx) + 2)

  segments.push({
    start: trajectory[crisisStart].time,
    end: trajectory[crisisEnd].time,
    label: valleyIdx < peakIdx ? 'struggle' : 'triumph',
    emotion: trajectory[Math.min(peakIdx, valleyIdx)].valence > 0 ? 'joy' : 'sadness'
  })

  // Resolution (final quarter)
  const resolutionStart = Math.floor(trajectory.length * 0.75)
  segments.push({
    start: trajectory[resolutionStart].time,
    end: 1.0,
    label: 'resolution',
    emotion: trajectory[trajectory.length - 1].valence > 0 ? 'hope' : 'acceptance'
  })

  return segments
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface AnalyzeStoryOptions {
  numSegments?: number
  includeSegments?: boolean
}

/**
 * Analyze a story's narrative arc
 *
 * @param transcript - Full story transcript text
 * @param options - Analysis options
 * @returns Narrative arc analysis
 */
export async function analyzeStoryNarrativeArc(
  transcript: string,
  options: AnalyzeStoryOptions = {}
): Promise<Omit<StoryNarrativeArc, 'id' | 'story_id' | 'created_at' | 'updated_at'>> {
  const { numSegments = 20, includeSegments = true } = options

  // Split into segments
  const segments = splitIntoSegments(transcript, numSegments)

  // Analyze sentiment for each segment
  const trajectory: TrajectoryPoint[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const sentiment = await analyzeSentiment(segment)

    trajectory.push({
      time: i / (segments.length - 1), // 0.0 to 1.0
      valence: sentiment.valence,
      arousal: sentiment.arousal
    })
  }

  // Classify arc type
  const { arc_type, confidence } = classifyArc(trajectory)

  // Calculate metrics
  const valences = trajectory.map(t => t.valence)
  const emotional_range = Math.max(...valences) - Math.min(...valences)
  const volatility = standardDeviation(valences)
  const transformation_score = valences[valences.length - 1] - valences[0]

  const peak_moment = trajectory[valences.indexOf(Math.max(...valences))].time
  const valley_moment = trajectory[valences.indexOf(Math.min(...valences))].time

  // Identify narrative segments
  const narrative_segments = includeSegments
    ? await identifySegments(transcript, trajectory)
    : undefined

  return {
    arc_type,
    arc_confidence: confidence,
    trajectory_data: trajectory,
    segments: narrative_segments,
    emotional_range,
    volatility,
    transformation_score,
    peak_moment,
    valley_moment,
    analyzed_at: new Date().toISOString(),
    analysis_version: 'v1.0',
    analysis_method: 'openai_gpt4',
    community_validated: false
  }
}

/**
 * Batch analyze multiple stories
 */
export async function batchAnalyzeStories(
  stories: Array<{ id: string; transcript: string }>
): Promise<Map<string, StoryNarrativeArc>> {
  const results = new Map<string, StoryNarrativeArc>()

  for (const story of stories) {
    try {
      const analysis = await analyzeStoryNarrativeArc(story.transcript)

      results.set(story.id, {
        id: '', // Will be set by database
        story_id: story.id,
        ...analysis,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as StoryNarrativeArc)

      // Rate limiting: wait 1 second between API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error analyzing story ${story.id}:`, error)
    }
  }

  return results
}

// ============================================================================
// ALTERNATIVE: LEXICON-BASED SENTIMENT (faster, no API needed)
// ============================================================================

/**
 * Simple lexicon-based sentiment analysis
 * Much faster than AI, good for initial processing
 */
export function analyzeSentimentLexicon(text: string): {
  valence: number
  word_count: number
} {
  // Simplified sentiment lexicon
  // In production, use a full lexicon like AFINN or SentiWordNet
  const positiveWords = new Set([
    'love', 'joy', 'happy', 'peace', 'hope', 'beautiful', 'wonderful',
    'healing', 'strength', 'proud', 'grateful', 'thankful', 'together',
    'community', 'sacred', 'honor', 'respect', 'wisdom', 'light'
  ])

  const negativeWords = new Set([
    'pain', 'hurt', 'sad', 'anger', 'fear', 'loss', 'struggle',
    'difficult', 'hard', 'challenge', 'dark', 'broken', 'alone',
    'suffering', 'grief', 'violence', 'trauma'
  ])

  const words = text.toLowerCase().match(/\b\w+\b/g) || []

  let positiveCount = 0
  let negativeCount = 0

  for (const word of words) {
    if (positiveWords.has(word)) positiveCount++
    if (negativeWords.has(word)) negativeCount++
  }

  const total = positiveCount + negativeCount
  const valence = total === 0
    ? 0
    : (positiveCount - negativeCount) / Math.max(total, words.length * 0.1)

  return {
    valence: Math.max(-1, Math.min(1, valence)),
    word_count: words.length
  }
}

/**
 * Quick lexicon-based arc analysis (no AI)
 */
export function analyzeStoryArcLexicon(transcript: string, numSegments: number = 20) {
  const segments = splitIntoSegments(transcript, numSegments)

  const trajectory: TrajectoryPoint[] = segments.map((segment, i) => {
    const sentiment = analyzeSentimentLexicon(segment)
    return {
      time: i / (segments.length - 1),
      valence: sentiment.valence,
      arousal: 0.5 // No arousal from lexicon
    }
  })

  const { arc_type, confidence } = classifyArc(trajectory)

  const valences = trajectory.map(t => t.valence)

  return {
    arc_type,
    arc_confidence: confidence * 0.7, // Lower confidence for lexicon
    trajectory_data: trajectory,
    emotional_range: Math.max(...valences) - Math.min(...valences),
    volatility: standardDeviation(valences),
    transformation_score: valences[valences.length - 1] - valences[0],
    analysis_method: 'lexicon' as const
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

function standardDeviation(numbers: number[]): number {
  const avg = average(numbers)
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2))
  return Math.sqrt(average(squareDiffs))
}

/**
 * Get human-readable arc description
 */
export function getArcDescription(arcType: ArcType): {
  name: string
  description: string
  example: string
} {
  const descriptions: Record<ArcType, { name: string; description: string; example: string }> = {
    rags_to_riches: {
      name: 'Rising Hope',
      description: 'A journey from challenge to triumph, showing steady growth and transformation.',
      example: 'Beginning with struggle, ending with strength and achievement.'
    },
    tragedy: {
      name: 'Descending Journey',
      description: 'A story of increasing difficulty, loss, or challenge over time.',
      example: 'Chronicles hardship and the weight of difficult experiences.'
    },
    man_in_hole: {
      name: 'Overcoming Struggle',
      description: 'Falls into difficulty but rises again, showing resilience and recovery.',
      example: 'Facing a crisis and emerging stronger on the other side.'
    },
    icarus: {
      name: 'Rise and Fall',
      description: 'Reaches a peak but then declines, often carrying a lesson or warning.',
      example: 'Achievement followed by loss or deeper understanding.'
    },
    cinderella: {
      name: 'Transformation Journey',
      description: 'Multiple peaks and valleys, showing a complex journey with ultimate transformation.',
      example: 'Hope, challenge, and renewal in cycles.'
    },
    oedipus: {
      name: 'Complex Revelation',
      description: 'Apparent recovery reveals deeper challenges, showing layers of truth.',
      example: 'What seemed like progress reveals harder truths.'
    },
    cyclical: {
      name: 'Seasonal Journey',
      description: 'Returns to where it began, honoring cycles and natural patterns.',
      example: 'Stories that follow seasonal or ceremonial patterns.'
    },
    linear: {
      name: 'Steady Path',
      description: 'Maintains consistent emotional tone throughout, focusing on theme over transformation.',
      example: 'Teachings that remain steady and grounded.'
    }
  }

  return descriptions[arcType]
}
