#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getTranscriptIds() {
  console.log('🔍 Fetching transcript IDs...')
  
  try {
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id, status')
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching transcripts:', error)
      return
    }
    
    console.log(`✅ Found ${transcripts?.length || 0} transcripts:`)
    transcripts?.forEach(transcript => {
      console.log(`  - ID: ${transcript.id}`)
      console.log(`    Title: ${transcript.title || 'Untitled'}`)
      console.log(`    Status: ${transcript.status}`)
      console.log(`    Storyteller ID: ${transcript.storyteller_id}`)
      console.log('')
    })
    
    if (transcripts && transcripts.length > 0) {
      const firstTranscript = transcripts[0]
      console.log(`🌐 Test URL: http://localhost:3002/transcripts/${firstTranscript.id}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getTranscriptIds().catch(console.error)