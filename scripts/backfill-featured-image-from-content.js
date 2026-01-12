const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function extractFirstImage(content) {
  if (!content) return null
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (htmlMatch?.[1]) return htmlMatch[1]
  const dataSrcMatch = content.match(/data-src=["']([^"']+)["']/i)
  if (dataSrcMatch?.[1]) return dataSrcMatch[1]
  const mdMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/)
  if (mdMatch?.[1]) return mdMatch[1]
  return null
}

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, content, import_metadata, featured_image_id')
    .eq('status', 'published')
    .eq('visibility', 'public')

  if (error) {
    console.error('Failed to load articles:', error.message)
    process.exit(1)
  }

  let updated = 0

  for (const article of data || []) {
    const hasFeatured = article.featured_image_id || article.import_metadata?.featuredImageUrl
    if (hasFeatured) continue

    const firstImage = extractFirstImage(article.content)
    if (!firstImage) continue

    const nextMetadata = {
      ...(article.import_metadata || {}),
      featuredImageUrl: firstImage
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        import_metadata: nextMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id)

    if (!updateError) {
      updated += 1
    }
  }

  console.log(`✅ Backfilled featured images for ${updated} articles.`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
