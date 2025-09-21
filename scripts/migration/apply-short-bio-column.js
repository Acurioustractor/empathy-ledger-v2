#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addShortBioColumn() {
  try {
    console.log('📋 Adding short_bio column to profiles table...')

    // Read and execute the SQL
    const sql = readFileSync(join(__dirname, 'add-short-bio-column.sql'), 'utf-8')

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error adding column:', error)
      return
    }

    console.log('✅ Successfully added short_bio column to profiles table')
    console.log('🎯 Ready to generate short bios for profile cards!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addShortBioColumn()