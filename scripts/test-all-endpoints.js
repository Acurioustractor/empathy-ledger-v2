require('dotenv').config({ path: '.env.local' })

const testEndpoints = [
  // Admin API endpoints
  { name: 'Admin Users Stats', url: 'http://localhost:3003/api/admin/stats/users' },
  { name: 'Admin Stories Stats', url: 'http://localhost:3003/api/admin/stats/stories' },
  { name: 'Admin Reviews Stats', url: 'http://localhost:3003/api/admin/stats/reviews' },
  { name: 'Admin Organizations Stats', url: 'http://localhost:3003/api/admin/stats/organizations' },
  { name: 'Admin Pending Reviews', url: 'http://localhost:3003/api/admin/reviews/pending' },
  { name: 'Admin Projects', url: 'http://localhost:3003/api/admin/projects' },
  { name: 'Admin Organizations', url: 'http://localhost:3003/api/admin/organizations' },
  
  // Organization API endpoints
  { name: 'Snow Foundation Stats', url: 'http://localhost:3003/api/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/stats' },
  { name: 'Curious Tractor Stats', url: 'http://localhost:3003/api/organizations/db0de7bd-eb10-446b-99e9-0f3b7c199b8a/stats' },
  
  // Storyteller API endpoints  
  { name: 'Benjamin Dashboard', url: 'http://localhost:3003/api/storytellers/d0a162d2-282e-4653-9d12-aa934c9dfa4e/dashboard' },
]

const testPages = [
  // Core pages
  { name: 'Admin Dashboard', url: 'http://localhost:3003/admin' },
  { name: 'Stories Page', url: 'http://localhost:3003/stories' },
  { name: 'Storytellers Page', url: 'http://localhost:3003/storytellers' },
  { name: 'Organizations Page', url: 'http://localhost:3003/organizations' },
  { name: 'Analytics Page', url: 'http://localhost:3003/analytics' },
  { name: 'Profile Page', url: 'http://localhost:3003/profile' },
  
  // Authentication pages
  { name: 'Sign In Page', url: 'http://localhost:3003/auth/signin' },
  { name: 'Sign Up Page', url: 'http://localhost:3003/auth/signup' },
  
  // Organization pages
  { name: 'Snow Foundation Dashboard', url: 'http://localhost:3003/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard' },
  { name: 'Snow Foundation Projects', url: 'http://localhost:3003/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/projects' },
  { name: 'Story Creation Page', url: 'http://localhost:3003/stories/create' },
]

async function testEndpoint(endpoint) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(endpoint.url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Empathy-Ledger-Test-Suite'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return {
          name: endpoint.name,
          status: 'SUCCESS',
          statusCode: response.status,
          hasData: !!data,
          dataKeys: data ? Object.keys(data).slice(0, 5) : []
        }
      } else {
        return {
          name: endpoint.name,
          status: 'SUCCESS',
          statusCode: response.status,
          contentType: contentType,
          hasData: true
        }
      }
    } else {
      return {
        name: endpoint.name,
        status: 'ERROR',
        statusCode: response.status,
        error: `HTTP ${response.status} ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      name: endpoint.name,
      status: 'FAILED',
      error: error.name === 'AbortError' ? 'TIMEOUT (10s)' : error.message
    }
  }
}

async function runTests() {
  console.log('🚀 EMPATHY LEDGER V2 - COMPREHENSIVE ENDPOINT TESTING')
  console.log('=' .repeat(60))
  console.log(`Testing ${testEndpoints.length} API endpoints and ${testPages.length} pages...\n`)

  let totalTests = 0
  let successfulTests = 0
  let failedTests = 0

  // Test API endpoints
  console.log('📡 API ENDPOINTS TESTING:\n')
  
  for (const endpoint of testEndpoints) {
    totalTests++
    const result = await testEndpoint(endpoint)
    
    if (result.status === 'SUCCESS') {
      successfulTests++
      console.log(`✅ ${result.name} - ${result.statusCode}`)
      if (result.dataKeys) {
        console.log(`   Data keys: ${result.dataKeys.join(', ')}`)
      }
    } else {
      failedTests++
      console.log(`❌ ${result.name} - ${result.status}`)
      console.log(`   Error: ${result.error}`)
    }
    console.log()
  }

  // Test pages
  console.log('🌐 PAGE RENDERING TESTING:\n')
  
  for (const page of testPages) {
    totalTests++
    const result = await testEndpoint(page)
    
    if (result.status === 'SUCCESS') {
      successfulTests++
      console.log(`✅ ${result.name} - ${result.statusCode}`)
    } else {
      failedTests++
      console.log(`❌ ${result.name} - ${result.status}`)
      console.log(`   Error: ${result.error}`)
    }
    console.log()
  }

  // Final summary
  console.log('=' .repeat(60))
  console.log('\n📊 TEST RESULTS SUMMARY:')
  console.log(`Total tests: ${totalTests}`)
  console.log(`✅ Successful: ${successfulTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`Success rate: ${Math.round((successfulTests / totalTests) * 100)}%`)

  if (successfulTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Platform is production ready.')
  } else if (successfulTests > totalTests * 0.8) {
    console.log('\n✅ Platform is mostly functional with minor issues to address.')
  } else {
    console.log('\n⚠️  Platform has significant issues that need attention.')
  }

  console.log('\n📋 NEXT STEPS:')
  console.log('1. Review any failed endpoints above')
  console.log('2. Test UI interactions manually')
  console.log('3. Verify cultural safety features')
  console.log('4. Test multi-tenant data isolation')
  console.log('5. Perform end-to-end user workflow testing')
}

// Import fetch if needed (Node.js 18+ has it built-in)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

runTests().catch(console.error)