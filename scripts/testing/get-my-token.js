/**
 * Token Extractor Script
 * Run this to get your auth token for testing
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5MDYyNzMsImV4cCI6MjA0MDQ4MjI3M30.BDOKepC3jXwM8Dqjph-0uPKf8hQ0PtLHVCdXqM7K9KI'

async function getToken() {
  console.log('🔐 Token Extraction Script')
  console.log('=' .repeat(50))
  console.log('')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // You need to sign in to get a token
  console.log('📧 Enter your email and password to get your auth token:')
  console.log('')
  console.log('Email: storyteller_demo@example.com')
  console.log('Password: (enter below)')
  console.log('')

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.question('Enter your email: ', async (email) => {
    readline.question('Enter your password: ', async (password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })

        if (error) {
          console.error('❌ Login failed:', error.message)
          readline.close()
          return
        }

        if (data.session?.access_token) {
          console.log('')
          console.log('✅ Token found!')
          console.log('=' .repeat(50))
          console.log('')
          console.log('📋 Your auth token:')
          console.log('')
          console.log(data.session.access_token)
          console.log('')
          console.log('=' .repeat(50))
          console.log('')
          console.log('💡 Next steps:')
          console.log('1. Copy the token above')
          console.log('2. Open test-consent-manual.sh')
          console.log('3. Replace AUTH_TOKEN="YOUR_TOKEN_HERE"')
          console.log('4. Save and run: ./test-consent-manual.sh')
          console.log('')
        } else {
          console.log('❌ No token in response')
        }

        readline.close()
      } catch (err) {
        console.error('❌ Error:', err.message)
        readline.close()
      }
    })
  })
}

getToken()
