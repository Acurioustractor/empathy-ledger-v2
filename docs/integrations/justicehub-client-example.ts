/**
 * JusticeHub Client Example
 *
 * This TypeScript module shows how JusticeHub can integrate with
 * Empathy Ledger's Story Syndication API.
 *
 * Copy this to your JusticeHub project and configure the constants.
 */

// Configuration - update these for your environment
const EMPATHY_LEDGER_API_URL = process.env.EMPATHY_LEDGER_API_URL || 'http://localhost:3000'
const JUSTICEHUB_API_KEY = process.env.EMPATHY_LEDGER_API_KEY || 'jh_test_key_2024_empathy_ledger'

interface AuthResponse {
  token: string
  expires_in: number
  app: {
    name: string
    display_name: string
    allowed_story_types: string[]
  }
}

interface Story {
  story_id: string
  title: string
  content: string
  storyteller_name: string
  themes: string[]
  story_date: string
  cultural_restrictions: Record<string, unknown> | null
  media: string[]
}

interface StoriesResponse {
  stories: Story[]
  total: number
  limit: number
  offset: number
}

class EmpathyLedgerClient {
  private baseUrl: string
  private apiKey: string
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  /**
   * Authenticate and get a JWT token
   */
  async authenticate(): Promise<void> {
    console.log('🔐 Authenticating with Empathy Ledger...')

    const response = await fetch(`${this.baseUrl}/api/external/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: this.apiKey }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Authentication failed: ${error.error || response.statusText}`)
    }

    const data: AuthResponse = await response.json()
    this.token = data.token
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)

    console.log(`✅ Authenticated as ${data.app.display_name}`)
    console.log(`   Allowed story types: ${data.app.allowed_story_types.join(', ')}`)
    console.log(`   Token expires: ${this.tokenExpiry.toISOString()}`)
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureAuthenticated(): Promise<string> {
    if (!this.token || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      await this.authenticate()
    }
    return this.token!
  }

  /**
   * Fetch stories from Empathy Ledger
   */
  async getStories(options: {
    type?: string
    limit?: number
    offset?: number
    since?: string
  } = {}): Promise<StoriesResponse> {
    const token = await this.ensureAuthenticated()

    const params = new URLSearchParams()
    if (options.type) params.set('type', options.type)
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.offset) params.set('offset', options.offset.toString())
    if (options.since) params.set('since', options.since)

    const url = `${this.baseUrl}/api/external/stories${params.toString() ? '?' + params.toString() : ''}`
    console.log(`📖 Fetching stories from: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch stories: ${error.error || response.statusText}`)
    }

    const data: StoriesResponse = await response.json()
    console.log(`✅ Received ${data.stories.length} stories (total: ${data.total})`)

    return data
  }

  /**
   * Get a single story by ID
   */
  async getStory(storyId: string): Promise<Story> {
    const token = await this.ensureAuthenticated()

    console.log(`📖 Fetching story: ${storyId}`)

    const response = await fetch(`${this.baseUrl}/api/external/stories/${storyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Failed to fetch story: ${error.error || response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ Received story: ${data.story.title}`)

    return data.story
  }

  /**
   * Log that a story was accessed (for audit trail)
   */
  async logAccess(
    storyId: string,
    accessType: 'view' | 'embed' | 'export',
    context?: Record<string, unknown>
  ): Promise<void> {
    const token = await this.ensureAuthenticated()

    console.log(`📝 Logging ${accessType} access for story: ${storyId}`)

    const response = await fetch(`${this.baseUrl}/api/external/stories/${storyId}/access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_type: accessType, context }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.warn(`⚠️ Failed to log access: ${error.error || response.statusText}`)
      return // Don't throw - logging failure shouldn't break the flow
    }

    console.log('✅ Access logged successfully')
  }
}

// =============================================================================
// TEST SCRIPT - Run this to verify the integration
// =============================================================================

async function runIntegrationTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 EMPATHY LEDGER INTEGRATION TEST')
  console.log('='.repeat(60) + '\n')

  const client = new EmpathyLedgerClient(EMPATHY_LEDGER_API_URL, JUSTICEHUB_API_KEY)

  try {
    // Test 1: Authentication
    console.log('\n📋 TEST 1: Authentication')
    console.log('-'.repeat(40))
    await client.authenticate()

    // Test 2: Fetch all available stories
    console.log('\n📋 TEST 2: Fetch Stories')
    console.log('-'.repeat(40))
    const stories = await client.getStories({ limit: 5 })

    if (stories.stories.length === 0) {
      console.log('⚠️  No stories available. Make sure:')
      console.log('   1. Stories exist in Empathy Ledger')
      console.log('   2. Storytellers have granted consent to JusticeHub')
      console.log('   3. Stories have status "published"')
    } else {
      console.log('\nAvailable stories:')
      stories.stories.forEach((story, i) => {
        console.log(`   ${i + 1}. "${story.title}" by ${story.storyteller_name}`)
        console.log(`      Themes: ${story.themes.join(', ') || 'none'}`)
      })
    }

    // Test 3: Get single story (if any exist)
    if (stories.stories.length > 0) {
      console.log('\n📋 TEST 3: Get Single Story')
      console.log('-'.repeat(40))
      const story = await client.getStory(stories.stories[0].story_id)
      console.log(`\nStory details:`)
      console.log(`   Title: ${story.title}`)
      console.log(`   Author: ${story.storyteller_name}`)
      console.log(`   Content preview: ${story.content.substring(0, 100)}...`)

      // Test 4: Log access
      console.log('\n📋 TEST 4: Log Access')
      console.log('-'.repeat(40))
      await client.logAccess(story.story_id, 'view', { source: 'integration_test' })
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ ALL TESTS PASSED')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    process.exit(1)
  }
}

// Export for use as a module
export { EmpathyLedgerClient }

// Run tests if executed directly
if (require.main === module) {
  runIntegrationTest()
}
