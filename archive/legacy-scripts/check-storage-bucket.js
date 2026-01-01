#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStorageBuckets() {
  console.log('🪣 Checking Supabase storage buckets...\n')

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('Error listing buckets:', bucketsError.message)
      return
    }

    console.log('📁 Available buckets:')
    buckets?.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Check each bucket for files
    for (const bucket of buckets || []) {
      console.log(`\n🔍 Checking bucket: ${bucket.name}`)
      
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list()
      
      if (filesError) {
        console.log(`Error listing files in ${bucket.name}:`, filesError.message)
        continue
      }

      console.log(`Files count: ${files?.length || 0}`)
      
      if (files && files.length > 0) {
        console.log('Sample files:')
        files.slice(0, 5).forEach((file, i) => {
          console.log(`${i+1}. ${file.name} (${file.metadata?.size || 'unknown size'})`)
        })

        // Look for deadly hearts related files
        const deadlyFiles = files.filter(file => 
          file.name.toLowerCase().includes('deadly') || 
          file.name.toLowerCase().includes('heart') ||
          file.name.toLowerCase().includes('trek')
        )
        
        if (deadlyFiles.length > 0) {
          console.log('\n🎯 Found Deadly Hearts related files:')
          deadlyFiles.forEach((file, i) => {
            console.log(`${i+1}. ${file.name}`)
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking storage:', error.message)
  }
}

checkStorageBuckets().catch(console.error)