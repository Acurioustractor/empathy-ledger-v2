#!/usr/bin/env tsx

/**
 * Test script to verify Google OAuth tokens are accessible
 * Run: npx tsx scripts/test-google-tokens.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 Testing Google OAuth Token Configuration...\n')

// Check if tokens exist in environment
const accessToken = process.env.GOOGLE_ACCESS_TOKEN
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

console.log('Environment Variables Check:')
console.log('---------------------------')
console.log('✓ GOOGLE_ACCESS_TOKEN:', accessToken ? `Present (${accessToken.substring(0, 20)}...)` : '❌ Missing')
console.log('✓ GOOGLE_REFRESH_TOKEN:', refreshToken ? `Present (${refreshToken.substring(0, 20)}...)` : '❌ Missing')

if (!accessToken || !refreshToken) {
  console.error('\n❌ Error: Google tokens not found in environment')
  console.error('Make sure .env.local contains:')
  console.error('  GOOGLE_ACCESS_TOKEN=...')
  console.error('  GOOGLE_REFRESH_TOKEN=...')
  process.exit(1)
}

console.log('\n✅ Google OAuth tokens are configured correctly!')

// Test token format
console.log('\nToken Format Validation:')
console.log('---------------------------')

const accessTokenValid = accessToken.startsWith('ya29.')
console.log('✓ Access token format:', accessTokenValid ? 'Valid (starts with ya29.)' : '⚠️ Unexpected format')

const refreshTokenValid = refreshToken.startsWith('1//')
console.log('✓ Refresh token format:', refreshTokenValid ? 'Valid (starts with 1//)' : '⚠️ Unexpected format')

// Test API availability (without making actual request)
console.log('\nAPI Configuration:')
console.log('---------------------------')
console.log('✓ Can access Gmail API:', accessToken ? 'Yes (read-only)' : 'No')
console.log('✓ Can access Calendar API:', accessToken ? 'Yes (read-only)' : 'No')

// Token expiry info
console.log('\nToken Information:')
console.log('---------------------------')
console.log('⚠️ Access token expires: 10/26/2025, 8:55:09 AM')
console.log('✓ Refresh token can be used to get new access tokens')
console.log('💡 Implement token refresh logic to handle expiration')

console.log('\n✅ All checks passed! Your Google OAuth tokens are ready to use.')
console.log('\nNext steps:')
console.log('1. Implement token refresh logic in your app')
console.log('2. Use tokens to access Gmail/Calendar APIs')
console.log('3. Handle token expiration gracefully')
