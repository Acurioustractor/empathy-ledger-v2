/**
 * Check Supabase Storage Buckets for Images
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkBuckets() {
  // List all storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError)
    return
  }

  console.log('📦 Storage Buckets:', buckets.map(b => b.name))
  console.log()

  // Check files in 'media' bucket
  const { data: files, error: filesError } = await supabase.storage
    .from('media')
    .list('', { limit: 100, offset: 0 })

  if (filesError) {
    console.error('Error listing files:', filesError)
    return
  }

  console.log('📁 Files in media bucket (root):', files.length)

  // Look for folders (tenant directories)
  const folders = files.filter(f => f.id === null) // Folders have null id
  console.log('📂 Tenant folders found:', folders.length)
  console.log()

  // Sample first folder to see structure
  if (folders.length > 0) {
    const firstFolder = folders[0].name
    console.log(`Checking folder: ${firstFolder}`)

    const { data: folderContents } = await supabase.storage
      .from('media')
      .list(firstFolder, { limit: 100 })

    console.log(`  Contents: ${folderContents?.length || 0} items`)

    // Check for media subfolder
    if (folderContents && folderContents.some(f => f.name === 'media')) {
      const { data: mediaFiles } = await supabase.storage
        .from('media')
        .list(`${firstFolder}/media`, { limit: 100 })

      console.log(`  Media files in ${firstFolder}/media: ${mediaFiles?.length || 0}`)

      // Show first 5 image files
      const images = mediaFiles?.filter(f =>
        f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ).slice(0, 5)

      console.log('  Sample images:')
      images?.forEach(img => {
        console.log(`    - ${img.name} (${(img.metadata as any)?.size ? Math.round((img.metadata as any).size / 1024) + 'KB' : 'unknown size'})`)
      })
    }
  }

  // Count total images across all tenant folders
  let totalImages = 0
  const imagePaths: string[] = []

  for (const folder of folders.slice(0, 10)) { // Check first 10 tenants
    const { data: mediaFiles } = await supabase.storage
      .from('media')
      .list(`${folder.name}/media`, { limit: 1000 })

    const images = mediaFiles?.filter(f =>
      f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) || []

    if (images.length > 0) {
      console.log(`\n${folder.name}: ${images.length} images`)
      totalImages += images.length

      // Store paths for first 50 images
      images.slice(0, 50 - imagePaths.length).forEach(img => {
        imagePaths.push(`${folder.name}/media/${img.name}`)
      })
    }
  }

  console.log(`\n📊 Total images found (first 10 tenants): ${totalImages}`)
  console.log(`\n📋 Sample image paths (first 10):`)
  imagePaths.slice(0, 10).forEach((path, i) => {
    console.log(`  ${i + 1}. ${path}`)
  })
}

checkBuckets()
