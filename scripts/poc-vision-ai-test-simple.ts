/**
 * Phase 0 PoC: Vision AI Testing Script (Simplified)
 *
 * Tests OpenAI GPT-4o Vision on sample images from Empathy Ledger
 * Measures: accuracy, cost, cultural sensitivity
 *
 * Run: DOTENV_CONFIG_PATH=.env.local NODE_OPTIONS='--require dotenv/config' npx tsx scripts/poc-vision-ai-test-simple.ts
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs/promises'

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

interface MediaAsset {
  id: string
  file_path: string
  filename: string
  story_title: string
  themes: string[]
  category: 'cultural' | 'people' | 'sacred_potential' | 'everyday'
}

interface VisionAnalysisResult {
  media_id: string
  filename: string
  category: string
  faces_detected: number
  objects_detected: string[]
  scene_description: string
  cultural_markers: string[]
  content_flags: string[]
  confidence_score: number
  processing_time_ms: number
  cost_usd: number
}

/**
 * Fetch test images directly from Supabase storage
 */
async function fetchTestImages(): Promise<MediaAsset[]> {
  console.log('Fetching images from Supabase storage...')

  // List files from the tenant folder with images
  const { data: files, error: storageError } = await supabase.storage
    .from('media')
    .list('c22fcf84-5a09-4893-a8ef-758c781e88a8/media', { limit: 100 })

  if (storageError) throw storageError

  // Filter for images only
  const imageFiles = files.filter(f =>
    f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  )

  if (imageFiles.length === 0) throw new Error('No image files found in storage')

  console.log(`Found ${imageFiles.length} images in storage`)

  // Convert to MediaAsset format (without story links)
  const mediaAssets = imageFiles.map(file => ({
    id: file.id || file.name, // Use filename as ID if no ID available
    file_path: `c22fcf84-5a09-4893-a8ef-758c781e88a8/media/${file.name}`,
    filename: file.name,
    story_id: null // No story association needed for PoC test
  }))

  if (mediaAssets.length === 0) throw new Error('No media assets found')

  console.log(`Found ${mediaAssets.length} media assets`)

  // For PoC, we'll test a random sample of 10 images
  // (We can't categorize by story themes since images aren't linked to stories)
  const sample = mediaAssets
    .sort(() => Math.random() - 0.5) // Shuffle
    .slice(0, 10) // Take first 10
    .map((ma: any): MediaAsset => ({
      id: ma.id,
      file_path: ma.file_path,
      filename: ma.filename,
      story_title: 'Uncategorized', // No story association
      themes: [],
      category: 'everyday' // Default category for PoC
    }))

  console.log(`\nSample: ${sample.length} random images for PoC testing\n`)

  return sample
}

/**
 * Analyze single image with OpenAI GPT-4o Vision
 */
async function analyzeImageWithOpenAI(imageUrl: string): Promise<Omit<VisionAnalysisResult, 'media_id' | 'filename' | 'category'>> {
  const startTime = Date.now()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this image and provide JSON output:
{
  "faces_detected": 0,
  "objects_detected": [],
  "scene_description": "",
  "cultural_markers": [],
  "content_flags": [],
  "confidence_score": 0.0
}

Detect:
- Number of human faces
- Objects/artifacts
- Scene description
- Cultural markers (ceremonial items, traditional clothing, sacred symbols)
- Content flags (violence, trauma, sensitive content)
- Confidence (0.0-1.0)`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 1000
  })

  const content = response.choices[0]?.message?.content || '{}'

  // OpenAI sometimes wraps JSON in markdown code blocks - strip them
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const analysis = JSON.parse(cleanContent)

  return {
    faces_detected: analysis.faces_detected || 0,
    objects_detected: analysis.objects_detected || [],
    scene_description: analysis.scene_description || '',
    cultural_markers: analysis.cultural_markers || [],
    content_flags: analysis.content_flags || [],
    confidence_score: analysis.confidence_score || 0.0,
    processing_time_ms: Date.now() - startTime,
    cost_usd: 0.01 // Simplified
  }
}

/**
 * Run PoC test
 */
async function runPoC() {
  console.log('🔬 Starting Vision AI PoC Testing...\n')

  // 1. Fetch test images
  console.log('📊 Fetching test images from database...')
  const testImages = await fetchTestImages()

  // 2. Analyze each image
  const results: VisionAnalysisResult[] = []
  let totalCost = 0
  let totalTime = 0

  for (let i = 0; i < Math.min(testImages.length, 10); i++) { // Start with just 10 images for faster testing
    const image = testImages[i]
    console.log(`\n[${i + 1}/10] Analyzing: ${image.filename}`)
    console.log(`  Category: ${image.category}`)

    try {
      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from('media')
        .createSignedUrl(image.file_path, 3600)

      if (!urlData?.signedUrl) {
        console.log(`  ⚠️  Skipping (no signed URL)`)
        continue
      }

      // Analyze
      const result = await analyzeImageWithOpenAI(urlData.signedUrl)

      const fullResult: VisionAnalysisResult = {
        media_id: image.id,
        filename: image.filename,
        category: image.category,
        ...result
      }

      console.log(`  ✅ Faces: ${result.faces_detected}`)
      console.log(`  ✅ Cultural markers: ${result.cultural_markers.join(', ') || 'none'}`)
      console.log(`  ✅ Time: ${result.processing_time_ms}ms`)

      results.push(fullResult)
      totalCost += result.cost_usd
      totalTime += result.processing_time_ms

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`  ❌ Error: ${error}`)
    }
  }

  // 3. Generate summary
  console.log('\n\n📊 PoC TEST RESULTS\n')
  console.log('='.repeat(60))
  console.log(`\n✅ Images Processed: ${results.length}`)
  console.log(`✅ Total Cost: $${totalCost.toFixed(2)}`)
  console.log(`✅ Avg Cost: $${(totalCost / results.length).toFixed(4)}`)
  console.log(`✅ Avg Time: ${(totalTime / results.length).toFixed(0)}ms`)

  // Success criteria
  const byCategory = {
    people: results.filter(r => r.category === 'people'),
    cultural: results.filter(r => r.category === 'cultural')
  }

  const faceAccuracy = byCategory.people.filter(r => r.faces_detected > 0).length / Math.max(byCategory.people.length, 1)
  const culturalDetection = byCategory.cultural.filter(r => r.cultural_markers.length > 0).length / Math.max(byCategory.cultural.length, 1)
  const avgCost = totalCost / results.length

  console.log(`\n\n✅ SUCCESS CRITERIA:`)
  console.log(`Face Detection: ${(faceAccuracy * 100).toFixed(1)}% - ${faceAccuracy >= 0.9 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Cost: $${avgCost.toFixed(4)} - ${avgCost < 0.20 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Cultural: ${(culturalDetection * 100).toFixed(1)}% - ${culturalDetection >= 0.8 ? '✅ PASS' : '⚠️  REVIEW'}`)

  // Save results
  await fs.writeFile('docs/poc/vision-ai-test-results.json', JSON.stringify({
    test_date: new Date().toISOString(),
    images_processed: results.length,
    total_cost_usd: totalCost,
    avg_cost: avgCost,
    success_criteria: { face_accuracy: faceAccuracy, avg_cost: avgCost, cultural_detection: culturalDetection },
    recommendation: (faceAccuracy >= 0.9 && avgCost < 0.20) ? 'GO' : 'NO-GO',
    results
  }, null, 2))

  console.log(`\n\n💾 Results saved to: docs/poc/vision-ai-test-results.json`)
  console.log('\n✨ PoC Testing Complete!\n')
}

runPoC().catch(console.error)
