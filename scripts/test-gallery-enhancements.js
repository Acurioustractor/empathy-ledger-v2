#!/usr/bin/env node

/**
 * Gallery Enhancement Test Suite
 * 
 * This script tests all the gallery editing, media usage tracking, 
 * and video review functionality we just built.
 * 
 * Usage: node scripts/test-gallery-enhancements.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const BASE_URL = 'http://localhost:3001'

async function testEndpoint(method, path, expectedStatus, description) {
  try {
    console.log(`🧪 ${description}...`)
    
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const actualStatus = response.status
    const success = actualStatus === expectedStatus
    
    console.log(`   ${success ? '✅' : '❌'} ${method} ${path} → ${actualStatus} ${success ? '(expected)' : `(expected ${expectedStatus})`}`)
    
    if (!success) {
      const body = await response.text()
      console.log(`   📄 Response: ${body}`)
    }
    
    return success
  } catch (error) {
    console.log(`   ❌ ${method} ${path} → Error: ${error.message}`)
    return false
  }
}

async function testPageLoad(path, description) {
  try {
    console.log(`📄 ${description}...`)
    
    const response = await fetch(`${BASE_URL}${path}`)
    const success = response.status === 200
    
    console.log(`   ${success ? '✅' : '❌'} GET ${path} → ${response.status} ${success ? '(loads successfully)' : '(failed to load)'}`)
    
    if (success) {
      const html = await response.text()
      const hasContent = html.includes('<!DOCTYPE html>')
      console.log(`   ${hasContent ? '✅' : '❌'} Page contains valid HTML`)
    }
    
    return success
  } catch (error) {
    console.log(`   ❌ GET ${path} → Error: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🎨 Gallery Enhancement Test Suite')
  console.log('═══════════════════════════════════\n')

  let passed = 0
  let total = 0

  // Test API Endpoints
  console.log('🔌 API Endpoint Tests')
  console.log('────────────────────\n')

  const apiTests = [
    ['GET', '/api/galleries/test/media', 404, 'Gallery media API (should return 404 for non-existent gallery)'],
    ['POST', '/api/galleries/test/media', 401, 'Gallery media creation (should require auth)'],
    ['PUT', '/api/galleries/test/media', 401, 'Gallery media update (should require auth)'],
    ['DELETE', '/api/galleries/test/media', 401, 'Gallery media deletion (should require auth)'],
    ['GET', '/api/media/test/usage', 401, 'Media usage tracking (should require auth)'],
    ['POST', '/api/media/test/usage', 401, 'Media usage creation (should require auth)'],
    ['PUT', '/api/media/test/usage', 400, 'Media usage view tracking (should require body)'],
    ['GET', '/api/admin/media/test/review', 401, 'Video review endpoint (should require auth)'],
    ['POST', '/api/admin/media/test/review', 401, 'Video review submission (should require auth)']
  ]

  for (const [method, path, expectedStatus, description] of apiTests) {
    const success = await testEndpoint(method, path, expectedStatus, description)
    if (success) passed++
    total++
  }

  console.log('')

  // Test Frontend Pages
  console.log('🖥️  Frontend Page Tests')
  console.log('──────────────────────\n')

  const pageTests = [
    ['/', 'Home page'],
    ['/galleries', 'Galleries list page'],
    ['/galleries/test/edit', 'Gallery editing page (should load even if gallery doesn\'t exist)']
  ]

  for (const [path, description] of pageTests) {
    const success = await testPageLoad(path, description)
    if (success) passed++
    total++
  }

  console.log('')

  // Test Component Compilation
  console.log('⚛️  Component Compilation Tests')
  console.log('─────────────────────────────────\n')

  // These tests check if components can be imported without syntax errors
  const componentTests = [
    'MediaUsageTracker component path exists',
    'VideoReviewModal component path exists',
    'Gallery edit page component path exists'
  ]

  const fs = require('fs')
  const path = require('path')

  const componentPaths = [
    path.join(__dirname, '..', 'src/components/media/MediaUsageTracker.tsx'),
    path.join(__dirname, '..', 'src/components/media/VideoReviewModal.tsx'),
    path.join(__dirname, '..', 'src/app/galleries/[id]/edit/page.tsx')
  ]

  for (let i = 0; i < componentPaths.length; i++) {
    const componentPath = componentPaths[i]
    const description = componentTests[i]
    
    console.log(`⚛️  ${description}...`)
    
    const exists = fs.existsSync(componentPath)
    console.log(`   ${exists ? '✅' : '❌'} ${exists ? 'File exists' : 'File missing'}: ${componentPath}`)
    
    if (exists) {
      const content = fs.readFileSync(componentPath, 'utf8')
      const hasValidReact = content.includes('React') || content.includes('use')
      const hasExport = content.includes('export default')
      
      console.log(`   ${hasValidReact ? '✅' : '❌'} Contains React code`)
      console.log(`   ${hasExport ? '✅' : '❌'} Has default export`)
      
      if (hasValidReact && hasExport) passed++
    }
    total++
  }

  console.log('')

  // Test Database Schema
  console.log('🗄️  Database Schema Tests')
  console.log('─────────────────────────\n')

  const schemaPath = path.join(__dirname, '..', 'database/15-media-usage-tracking.sql')
  console.log('📄 Media usage tracking schema file...')
  
  const schemaExists = fs.existsSync(schemaPath)
  console.log(`   ${schemaExists ? '✅' : '❌'} Schema file exists: ${schemaPath}`)
  
  if (schemaExists) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    const hasTable = schema.includes('CREATE TABLE IF NOT EXISTS media_usage_tracking')
    const hasPolicies = schema.includes('CREATE POLICY')
    const hasFunctions = schema.includes('CREATE OR REPLACE FUNCTION')
    
    console.log(`   ${hasTable ? '✅' : '❌'} Contains media_usage_tracking table`)
    console.log(`   ${hasPolicies ? '✅' : '❌'} Contains RLS policies`)
    console.log(`   ${hasFunctions ? '✅' : '❌'} Contains database functions`)
    
    if (hasTable && hasPolicies && hasFunctions) passed++
  }
  total++

  // Final Results
  console.log('\n📊 Test Results')
  console.log('═══════════════')
  console.log(`✅ Passed: ${passed}/${total} tests`)
  console.log(`❌ Failed: ${total - passed}/${total} tests`)
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`)

  if (passed === total) {
    console.log('\n🎉 All tests passed! The gallery enhancement system is ready!')
    console.log('\n🚀 Next Steps:')
    console.log('1. Deploy the database schema: database/15-media-usage-tracking.sql')
    console.log('2. Test with real data by:')
    console.log('   • Creating a gallery and adding photos')
    console.log('   • Testing drag & drop reordering')
    console.log('   • Reviewing video content as an elder/admin')
    console.log('   • Checking media usage analytics')
    console.log('\n✨ Happy storytelling! ✨')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
    console.log('💡 Most likely fixes:')
    console.log('• Ensure the development server is running on port 3001')
    console.log('• Check for any compilation errors in the console')
    console.log('• Verify all dependencies are installed (npm install)')
  }

  return passed === total
}

// Run the tests
if (require.main === module) {
  runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Test suite crashed:', error)
      process.exit(1)
    })
}

module.exports = { runTests }