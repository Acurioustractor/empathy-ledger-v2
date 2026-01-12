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

async function publishStory() {
  try {
    const storyId = 'd7bed43d-1e25-4db7-9e17-e76ff25ebbe8'

    console.log('📝 Publishing story for Benjamin Knight...\n')

    // Update story to published status
    const { data: story, error } = await supabase
      .from('stories')
      .update({
        status: 'published',
        is_public: true,
        published_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error publishing story:', error)
      return
    }

    console.log('✅ Story published successfully!\n')
    console.log('📋 Story Details:')
    console.log('================')
    console.log(`ID: ${story.id}`)
    console.log(`Title: ${story.title}`)
    console.log(`Author: Benjamin Knight (${story.author_id})`)
    console.log(`Status: ${story.status}`)
    console.log(`Public: ${story.is_public}`)
    console.log(`Published: ${story.published_at}`)
    console.log(`\n🌐 View Your Story:`)
    console.log('================')
    console.log(`http://localhost:3030/stories/${story.id}`)
    console.log(`\n✅ You can now view your story in the browser!`)

  } catch (err) {
    console.error('Error:', err)
  }
}

publishStory()
