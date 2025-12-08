/**
 * Save Goods Project Context from Seed Interview
 */

import { createClient } from '@supabase/supabase-js'

const PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project

const SEED_INTERVIEW = `
1) What is this project trying to achieve?
Build durable, repairable household goods with and by First Nations communities, so ownership, skills, and value stay on-country while meeting urgent needs for beds, washing machines, and fridges.

2) What does success look like for your community?
Community-owned manufacturing and maintenance facilities running locally.
People sleeping better with sturdy beds, washing reliably with indestructible machines, and storing food safely.
Local teams trained and making decisions without external dependency.
Revenue circulating through community enterprises rather than leaving Country.

3) What outcomes are you hoping to see in people's lives?
Fewer people sleeping on floors and improved sleep quality.
Better hygiene, dignity, and reduced infections including RHD-related risks.
Local jobs, skills transfer, and pride in making and maintaining their own goods.
Faster, cheaper repairs and longer product lifespans that reduce waste.

4) What values guide your approach?
First Nations leadership and self-determination.
Community invitation over top‑down scaling.
Circular economy design: repairable, recyclable, and locally maintainable.
Story‑guided accountability through community voice and lived experience.
Transition toward financial sovereignty beyond philanthropy.

5) How will you know when you've made a difference?
Community-defined indicators and stories show improved sleep, hygiene, and dignity.
Local health data reflects reductions in infections and RHD risk factors.
Lifecycle and repair records demonstrate durability and maintainability.
Facilities, training, and decision-making are owned locally, with outside support no longer required.
`.trim()

// Convert to concise description format
const DESCRIPTION = `
Goods builds durable, repairable household goods with and by First Nations communities.

What we're building:
- Community-owned manufacturing and maintenance facilities
- Indestructible beds, washing machines, and fridges designed for remote conditions
- Local repair and maintenance capabilities
- Circular economy systems that keep value on-country

Our approach:
- First Nations leadership and self-determination
- Community invitation over top-down scaling
- Story-guided accountability through lived experience
- Transition toward financial sovereignty beyond philanthropy

Success means:
- Improved sleep, hygiene, and dignity for community members
- Reduced infections and RHD risk factors
- Local jobs, skills transfer, and pride in manufacturing
- Community-owned facilities running independently
- Longer product lifespans and reduced waste
- Revenue circulating through community enterprises

Key outcomes we track:
- Sleep quality improvements (fewer people on floors)
- Health indicators (hygiene, infections, RHD risks)
- Local ownership and decision-making capability
- Product durability and repair lifecycle data
- Community voice and lived experience stories
`.trim()

async function saveContext() {
  console.log('📝 Saving Goods Project Context\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Update project with quick context
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        context_model: 'quick',
        context_description: DESCRIPTION,
        context_updated_at: new Date().toISOString()
      })
      .eq('id', PROJECT_ID)

    if (updateError) {
      throw updateError
    }

    console.log('✅ Context saved successfully!\n')
    console.log('📋 Description length:', DESCRIPTION.length, 'characters\n')

    // Clear analysis cache
    console.log('🗑️  Clearing analysis cache...')

    const { error: cacheError } = await supabase
      .from('project_analyses')
      .delete()
      .eq('project_id', PROJECT_ID)

    if (cacheError) {
      console.warn('⚠️  Could not clear cache:', cacheError.message)
    } else {
      console.log('✅ Cache cleared!\n')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🎉 Goods project context updated!')
    console.log('\n📊 Next Analysis Will Look For:')
    console.log('   ✓ Sleep quality improvements')
    console.log('   ✓ Health and hygiene outcomes')
    console.log('   ✓ Local manufacturing and repair skills')
    console.log('   ✓ Community ownership and self-determination')
    console.log('   ✓ Circular economy and sustainability')
    console.log('   ✓ First Nations leadership\n')
    console.log('🔗 View updated analysis at:')
    console.log(`   http://localhost:3030/projects/${PROJECT_ID}/analysis\n`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

saveContext()
