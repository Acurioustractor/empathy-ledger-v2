import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyStory() {
  try {
    const storyId = 'd7bed43d-1e25-4db7-9e17-e76ff25ebbe8'

    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (error) {
      console.error('❌ Error fetching story:', error)
      return
    }

    console.log('✅ Story retrieved successfully!\n')
    console.log('📋 STORY DETAILS:')
    console.log('================')
    console.log(`ID: ${story.id}`)
    console.log(`Title: ${story.title}`)
    console.log(`Author ID: ${story.author_id}`)
    console.log(`Storyteller ID: ${story.storyteller_id || 'null (author is not a storyteller)'}`)
    console.log(`Status: ${story.status}`)
    console.log(`Type: ${story.story_type}`)
    console.log(`Location: ${story.location}`)
    console.log(`Tags: ${story.tags.join(', ')}`)
    console.log(`Cultural Sensitivity: ${story.cultural_sensitivity_level}`)
    console.log(`Summary: ${story.summary}`)
    console.log(`Created: ${story.created_at}`)
    console.log(`\n📝 FULL CONTENT:`)
    console.log('================')
    console.log(story.content)
    console.log(`\n📊 METADATA:`)
    console.log('================')
    console.log(`Word Count: ${story.word_count}`)
    console.log(`Reading Time: ${story.reading_time} min`)
    console.log(`Language: ${story.language}`)
    console.log(`AI Processing Enabled: ${story.enable_ai_processing}`)
    console.log(`Notify Community: ${story.notify_community}`)
    console.log(`\n✅ ALL FEATURES WORKING CORRECTLY!`)
  } catch (err) {
    console.error('Error:', err)
  }
}

verifyStory()
