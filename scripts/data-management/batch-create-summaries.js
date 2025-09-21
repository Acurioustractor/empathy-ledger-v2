const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Short, relatable summaries that feel authentic
const summaryTemplates = [
  "A community storyteller passionate about sharing experiences that bring people together.",
  "Shares stories of resilience, community connection, and the wisdom found in everyday moments.",
  "A natural storyteller who believes in the power of shared experiences to heal and inspire.",
  "Passionate about preserving community stories and helping others find their voice.",
  "Tells stories that celebrate the strength and spirit of community life.",
  "A storyteller who weaves together personal experience with community wisdom.",
  "Shares authentic stories about life, family, and the connections that matter most.",
  "Believes every person has a story worth telling and helps others discover theirs.",
  "A community voice sharing stories of hope, challenge, and the human experience.",
  "Passionate about storytelling as a way to bridge differences and build understanding.",
  "Tells stories that honor both personal journey and community heritage.",
  "A storyteller focused on the moments that shape us and connect us to others.",
  "Shares experiences that highlight the beauty and complexity of community life.",
  "Passionate about using storytelling to create spaces for healing and connection.",
  "Tells stories that celebrate the everyday heroes and moments in our communities."
]

function getRandomSummary() {
  return summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
}

async function batchCreateSummaries() {
  try {
    console.log('🔄 Fetching storytellers without summaries...')

    // Get all profiles that are storytellers and don't have summaries
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, summary')
      .or('summary.is.null,summary.eq.')
      .limit(50)

    if (error) {
      console.error('Error fetching profiles:', error)
      return
    }

    console.log(`📊 Found ${profiles.length} storytellers without summaries`)

    if (profiles.length === 0) {
      console.log('✅ All storytellers already have summaries!')
      return
    }

    // Update each profile with a random summary
    let successCount = 0
    let errorCount = 0

    for (const profile of profiles) {
      try {
        const summary = getRandomSummary()

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            summary: summary,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`❌ Failed to update ${profile.display_name}:`, updateError.message)
          errorCount++
        } else {
          console.log(`✅ Updated ${profile.display_name}: "${summary.substring(0, 50)}..."`)
          successCount++
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (err) {
        console.error(`❌ Error updating ${profile.display_name}:`, err.message)
        errorCount++
      }
    }

    console.log(`\n🎉 Batch summary creation complete!`)
    console.log(`✅ Successful updates: ${successCount}`)
    console.log(`❌ Failed updates: ${errorCount}`)

  } catch (error) {
    console.error('❌ Error in batch summary creation:', error)
  }
}

// Run the script
batchCreateSummaries()
  .then(() => {
    console.log('📝 Summary creation script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })