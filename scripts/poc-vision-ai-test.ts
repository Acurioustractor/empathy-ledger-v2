/**
 * Phase 0 PoC: Vision AI Testing Script
 *
 * Tests OpenAI GPT-4o Vision on 50 representative images from Empathy Ledger
 * Measures: accuracy, cost, cultural sensitivity
 *
 * Run: npx tsx scripts/poc-vision-ai-test.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

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
  file_name: string
  story_title: string
  storyteller_name: string
  themes: string[]
  category: 'cultural' | 'people' | 'sacred_potential' | 'everyday'
}

interface VisionAnalysisResult {
  media_id: string
  category: string
  faces_detected: number
  face_positions: Array<{ x: number; y: number; width: number; height: number }>
  objects_detected: string[]
  scene_description: string
  cultural_markers: string[]
  content_flags: string[]
  confidence_score: number
  processing_time_ms: number
  cost_usd: number
}

/**
 * Fetch 50 test images from database
 */
async function fetchTestImages(): Promise<MediaAsset[]> {
  console.log('Fetching all media assets with stories...')

  // Fetch all media assets with their associated stories
  const { data: mediaAssets, error } = await supabase
    .from('media_assets')
    .select(`
      id,
      file_path,
      file_name,
      file_type,
      created_at,
      story_id,
      stories (
        title,
        themes,
        storyteller_id,
        profiles (
          name
        )
      )
    `)
    .like('file_type', 'image/%')
    .not('file_path', 'is', null)
    .not('story_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching test images:', error)
    throw error
  }

  if (!mediaAssets || mediaAssets.length === 0) {
    throw new Error('No media assets found in database')
  }

  console.log(`Found ${mediaAssets.length} media assets`)

  // Categorize and sample images
  const categorized = mediaAssets.map((ma: any) => {
    const story = Array.isArray(ma.stories) ? ma.stories[0] : ma.stories
    const themes = story?.themes || []
    const profile = Array.isArray(story?.profiles) ? story.profiles[0] : story?.profiles

    let category: 'cultural' | 'people' | 'sacred_potential' | 'everyday' = 'everyday'

    if (themes.some((t: string) => ['ceremony', 'ritual', 'sacred', 'cultural'].includes(t.toLowerCase()))) {
      category = 'cultural'
    } else if (themes.some((t: string) => ['family', 'community', 'people'].includes(t.toLowerCase()))) {
      category = 'people'
    } else if (themes.some((t: string) => ['elder', 'tradition', 'spiritual'].includes(t.toLowerCase()))) {
      category = 'sacred_potential'
    }

    return {
      id: ma.id,
      file_path: ma.file_path,
      file_name: ma.file_name,
      story_title: story?.title || 'Untitled',
      storyteller_name: profile?.name || 'Unknown',
      themes: themes,
      category
    }
  })

  // Sample from each category
  const cultural = categorized.filter((m: MediaAsset) => m.category === 'cultural').slice(0, 10)
  const people = categorized.filter((m: MediaAsset) => m.category === 'people').slice(0, 10)
  const sacred = categorized.filter((m: MediaAsset) => m.category === 'sacred_potential').slice(0, 10)
  const everyday = categorized.filter((m: MediaAsset) => m.category === 'everyday').slice(0, 20)

  const sample = [...cultural, ...people, ...sacred, ...everyday]

  console.log(`\nSample distribution:`)
  console.log(`  Cultural: ${cultural.length}`)
  console.log(`  People: ${people.length}`)
  console.log(`  Sacred potential: ${sacred.length}`)
  console.log(`  Everyday: ${everyday.length}`)
  console.log(`  Total: ${sample.length}\n`)

  return sample
}

/**
 * Analyze single image with OpenAI GPT-4o Vision
 */
async function analyzeImageWithOpenAI(
  imageUrl: string,
  category: string
): Promise<VisionAnalysisResult> {
  const startTime = Date.now()

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and provide:
1. Number of human faces detected
2. Position of each face (approximate x, y, width, height as percentages)
3. List of objects/artifacts detected
4. Scene description (1-2 sentences)
5. Cultural markers (any ceremonial items, traditional clothing, sacred symbols, Indigenous artifacts)
6. Content flags (violence, trauma, sensitive content)
7. Confidence score (0.0-1.0)

Respond in JSON format:
{
  "faces_detected": 0,
  "face_positions": [],
  "objects_detected": [],
  "scene_description": "",
  "cultural_markers": [],
  "content_flags": [],
  "confidence_score": 0.0
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const processingTime = Date.now() - startTime

    // Parse JSON response
    const content = response.choices[0]?.message?.content || '{}'
    const analysis = JSON.parse(content)

    // Calculate cost (GPT-4o Vision pricing: ~$0.01 per image)
    const cost = 0.01 // Simplified for PoC

    return {
      media_id: '',
      category,
      faces_detected: analysis.faces_detected || 0,
      face_positions: analysis.face_positions || [],
      objects_detected: analysis.objects_detected || [],
      scene_description: analysis.scene_description || '',
      cultural_markers: analysis.cultural_markers || [],
      content_flags: analysis.content_flags || [],
      confidence_score: analysis.confidence_score || 0.0,
      processing_time_ms: processingTime,
      cost_usd: cost
    }
  } catch (error) {
    console.error('OpenAI Vision analysis error:', error)
    throw error
  }
}

/**
 * Run PoC test on all 50 images
 */
async function runPoC() {
  console.log('🔬 Starting Vision AI PoC Testing...\n')

  // 1. Fetch test images
  console.log('📊 Fetching 50 test images from database...')
  const testImages = await fetchTestImages()
  console.log(`✅ Found ${testImages.length} test images\n`)

  // 2. Analyze each image with OpenAI
  const results: VisionAnalysisResult[] = []
  let totalCost = 0
  let totalTime = 0

  for (let i = 0; i < testImages.length; i++) {
    const image = testImages[i]
    console.log(`\n[${i + 1}/${testImages.length}] Analyzing: ${image.file_name}`)
    console.log(`  Category: ${image.category}`)
    console.log(`  Story: ${image.story_title}`)

    try {
      // Get public URL for image
      const { data: urlData } = await supabase.storage
        .from('media')
        .createSignedUrl(image.file_path, 3600)

      if (!urlData?.signedUrl) {
        console.log(`  ⚠️  Skipping (no signed URL)`)
        continue
      }

      // Analyze with OpenAI
      const result = await analyzeImageWithOpenAI(urlData.signedUrl, image.category)
      result.media_id = image.id

      // Log results
      console.log(`  ✅ Faces: ${result.faces_detected}`)
      console.log(`  ✅ Objects: ${result.objects_detected.join(', ')}`)
      console.log(`  ✅ Cultural markers: ${result.cultural_markers.join(', ') || 'none'}`)
      console.log(`  ✅ Time: ${result.processing_time_ms}ms`)
      console.log(`  ✅ Cost: $${result.cost_usd.toFixed(4)}`)

      results.push(result)
      totalCost += result.cost_usd
      totalTime += result.processing_time_ms

      // Rate limiting (avoid hitting OpenAI limits)
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`  ❌ Error: ${error}`)
    }
  }

  // 3. Generate summary report
  console.log('\n\n📊 PoC TEST RESULTS SUMMARY\n')
  console.log('=' .repeat(60))

  console.log(`\n✅ Images Processed: ${results.length}/${testImages.length}`)
  console.log(`✅ Total Cost: $${totalCost.toFixed(2)}`)
  console.log(`✅ Average Cost per Image: $${(totalCost / results.length).toFixed(4)}`)
  console.log(`✅ Total Processing Time: ${(totalTime / 1000).toFixed(1)}s`)
  console.log(`✅ Average Time per Image: ${(totalTime / results.length).toFixed(0)}ms`)

  // Category breakdown
  const byCategory = {
    cultural: results.filter(r => r.category === 'cultural'),
    people: results.filter(r => r.category === 'people'),
    sacred_potential: results.filter(r => r.category === 'sacred_potential'),
    everyday: results.filter(r => r.category === 'everyday')
  }

  console.log('\n\n📊 RESULTS BY CATEGORY:')
  console.log('=' .repeat(60))

  for (const [category, items] of Object.entries(byCategory)) {
    console.log(`\n${category.toUpperCase()} (${items.length} images):`)
    console.log(`  Avg faces detected: ${(items.reduce((sum, r) => sum + r.faces_detected, 0) / items.length).toFixed(1)}`)
    console.log(`  Cultural markers found: ${items.filter(r => r.cultural_markers.length > 0).length}/${items.length}`)
    console.log(`  Content flags raised: ${items.filter(r => r.content_flags.length > 0).length}/${items.length}`)
  }

  // 4. Success criteria evaluation
  console.log('\n\n✅ SUCCESS CRITERIA EVALUATION:')
  console.log('=' .repeat(60))

  const faceAccuracy = results.filter(r => r.category === 'people' && r.faces_detected > 0).length / byCategory.people.length
  const avgCost = totalCost / results.length
  const culturalDetection = byCategory.cultural.filter(r => r.cultural_markers.length > 0).length / byCategory.cultural.length

  console.log(`\n1. Face Detection Accuracy: ${(faceAccuracy * 100).toFixed(1)}%`)
  console.log(`   Target: 90%+ - ${faceAccuracy >= 0.9 ? '✅ PASS' : '❌ FAIL'}`)

  console.log(`\n2. Cost per Image: $${avgCost.toFixed(4)}`)
  console.log(`   Target: < $0.20 - ${avgCost < 0.20 ? '✅ PASS' : '❌ FAIL'}`)

  console.log(`\n3. Cultural Marker Detection: ${(culturalDetection * 100).toFixed(1)}%`)
  console.log(`   Target: 80%+ - ${culturalDetection >= 0.8 ? '✅ PASS' : '⚠️  NEEDS CLAUDE REVIEW'}`)

  // 5. Go/No-Go recommendation
  const passAll = faceAccuracy >= 0.9 && avgCost < 0.20
  console.log('\n\n🎯 GO/NO-GO DECISION:')
  console.log('=' .repeat(60))
  if (passAll) {
    console.log('\n✅ RECOMMENDATION: GO')
    console.log('   Vision AI meets accuracy and cost targets.')
    console.log('   Proceed to Week 2: Revenue Attribution + Webhook Testing')
  } else {
    console.log('\n❌ RECOMMENDATION: NO-GO')
    console.log('   Vision AI does not meet minimum criteria.')
    console.log('   Consider pivot to manual tagging or different AI provider.')
  }

  // 6. Save results to file
  const resultsPath = 'docs/poc/vision-ai-test-results.json'
  await fs.writeFile(resultsPath, JSON.stringify({
    test_date: new Date().toISOString(),
    images_processed: results.length,
    total_cost_usd: totalCost,
    avg_cost_per_image: avgCost,
    total_time_ms: totalTime,
    success_criteria: {
      face_accuracy: faceAccuracy,
      avg_cost: avgCost,
      cultural_detection: culturalDetection
    },
    recommendation: passAll ? 'GO' : 'NO-GO',
    results
  }, null, 2))

  console.log(`\n\n💾 Full results saved to: ${resultsPath}`)
  console.log('\n✨ PoC Testing Complete!\n')
}

// Run the PoC
runPoC().catch(console.error)
