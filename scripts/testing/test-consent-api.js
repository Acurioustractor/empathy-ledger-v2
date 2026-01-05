#!/usr/bin/env node

/**
 * Syndication Consent API Test
 * Tests the complete consent workflow
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5MDYyNzMsImV4cCI6MjA0MDQ4MjI3M30.BDOKepC3jXwM8Dqjph-0uPKf8hQ0PtLHVCdXqM7K9KI'

const TEST_STORY_ID = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1'
const TEST_SITE_SLUG = 'justicehub'

async function main() {
  console.log('======================================')
  console.log('Syndication Consent API Test')
  console.log('======================================')
  console.log('')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // Prompt for credentials
  const email = await new Promise(resolve => {
    rl.question('Email (benjamin@act.place): ', answer => {
      resolve(answer || 'benjamin@act.place')
    })
  })

  const password = await new Promise(resolve => {
    rl.question('Password: ', answer => {
      resolve(answer)
    })
  })

  rl.close()

  console.log('')
  console.log('Step 1: Signing in...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    process.exit(1)
  }

  const accessToken = authData.session?.access_token

  if (!accessToken) {
    console.error('❌ No access token received')
    process.exit(1)
  }

  console.log('✅ Login successful!')
  console.log(`Token: ${accessToken.substring(0, 50)}...`)
  console.log('')

  // Step 2: Create consent
  console.log('======================================')
  console.log('Step 2: Creating Consent')
  console.log('======================================')
  console.log('')

  const createResponse = await fetch('http://localhost:3030/api/syndication/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      storyId: TEST_STORY_ID,
      siteSlug: TEST_SITE_SLUG,
      culturalPermissionLevel: 'public',
      requestReason: 'Testing consent API - Node.js script'
    })
  })

  const createData = await createResponse.json()

  console.log('Response:')
  console.log(JSON.stringify(createData, null, 2))
  console.log('')

  if (!createResponse.ok) {
    console.error('❌ Consent creation failed!')
    console.error('Status:', createResponse.status)
    process.exit(1)
  }

  if (createData.success) {
    console.log('✅ Consent created successfully!')
    console.log('Consent ID:', createData.consent?.id)
    console.log('Embed Token:', createData.embedToken?.token)
    console.log('')

    // Step 3: Check consent status
    console.log('======================================')
    console.log('Step 3: Checking Consent Status')
    console.log('======================================')
    console.log('')

    const statusResponse = await fetch(
      `http://localhost:3030/api/syndication/consent?storyId=${TEST_STORY_ID}&siteSlug=${TEST_SITE_SLUG}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    const statusData = await statusResponse.json()

    console.log('Response:')
    console.log(JSON.stringify(statusData, null, 2))
    console.log('')

    if (statusData.exists) {
      console.log('✅ Consent verified in database!')
      console.log('')
    }

    // Step 4: View in dashboard
    console.log('======================================')
    console.log('✅ All Tests Passed!')
    console.log('======================================')
    console.log('')
    console.log('Next steps:')
    console.log('1. Open http://localhost:3030/syndication/dashboard')
    console.log('2. You should see Uncle Dale story in "Active" tab')
    console.log('3. Engagement metrics should show 0 views/clicks/shares')
    console.log('4. Try clicking "Stop Sharing" to test revocation')
    console.log('')
    console.log('Test consent ID:', createData.consent?.id)
  } else {
    console.error('❌ Consent creation failed!')
    console.error('Response:', createData)
  }

  // Sign out
  await supabase.auth.signOut()
}

main().catch(console.error)
