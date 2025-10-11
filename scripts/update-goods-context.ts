/**
 * Update Goods Project Context
 *
 * Run this script to update the project context description
 * This will invalidate the cache and regenerate analysis with new context
 */

const PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project
const API_URL = 'http://localhost:3030'

// PASTE YOUR NEW PROJECT DESCRIPTION HERE:
const NEW_DESCRIPTION = `
Goods. is a philanthropic initiative supporting grassroots community organizations across Australia.

[PASTE YOUR NEW DESCRIPTION HERE - Replace this entire text block]

Our approach focuses on:
- Trust-based relationships
- Flexible funding
- Amplifying community stories

Success for us means:
- Organizations feeling genuinely supported and validated
- Strong peer networks forming with authentic collaborations
- Financial sustainability allowing long-term community impact
- Increased organizational capacity and leadership confidence
- Communities thriving through locally-led initiatives
`.trim()

async function updateContext() {
  console.log('📝 Updating Goods Project Context\n')

  try {
    // Update context via API
    const response = await fetch(
      `${API_URL}/api/projects/${PROJECT_ID}/context`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'quick',
          description: NEW_DESCRIPTION
        })
      }
    )

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Context updated successfully!\n')
    console.log('📋 New context saved to database')
    console.log(`   Length: ${NEW_DESCRIPTION.length} characters\n`)

    // Clear the analysis cache to force regeneration
    console.log('🗑️  Clearing analysis cache...')

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('project_analyses')
      .delete()
      .eq('project_id', PROJECT_ID)

    if (error) {
      console.warn('⚠️  Could not clear cache:', error.message)
    } else {
      console.log('✅ Cache cleared!\n')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📊 Next Steps:')
    console.log('   1. Next analysis will use the new context')
    console.log('   2. Load the analysis page to regenerate:')
    console.log(`      http://localhost:3030/projects/${PROJECT_ID}/analysis`)
    console.log('   3. Or run: npx tsx scripts/test-context-aware-analysis.ts\n')

  } catch (error: any) {
    console.error('\n❌ Update failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

// Run update
updateContext()
