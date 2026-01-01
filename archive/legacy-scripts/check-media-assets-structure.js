#!/usr/bin/env node

/**
 * Check Media Assets Table Structure
 * See what columns exist vs what's expected
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMediaAssetsStructure() {
  console.log('🔍 Checking media_assets table structure...')
  
  try {
    // Try to get some records to see the structure
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing media_assets:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ media_assets table exists with data')
      console.log('📋 Current structure (from sample record):')
      
      const record = data[0]
      Object.keys(record).forEach(column => {
        const value = record[column]
        const type = typeof value
        console.log(`   ${column}: ${type} ${value ? `(example: ${JSON.stringify(value)})` : '(null)'}`)
      })
    } else {
      console.log('✅ media_assets table exists but is empty')
      console.log('🔍 Attempting to determine structure by trying different queries...')
      
      // Try some common columns to see what exists
      const columnsToTest = [
        'id', 'created_at', 'updated_at',
        'filename', 'original_filename', 'file_type', 'mime_type', 'file_size',
        'storage_bucket', 'storage_path', 'public_url',
        'uploaded_by', 'user_id', 'author_id', 'profile_id',
        'organization_id', 'width', 'height',
        'cultural_context', 'consent_status'
      ]
      
      const existingColumns = []
      
      for (const column of columnsToTest) {
        try {
          const { data: testData, error: testError } = await supabase
            .from('media_assets')
            .select(column)
            .limit(1)
          
          if (!testError) {
            existingColumns.push(column)
          }
        } catch (e) {
          // Column doesn't exist
        }
      }
      
      console.log('📋 Detected columns:')
      existingColumns.forEach(col => console.log(`   ✅ ${col}`))
      
      console.log('❌ Missing columns (expected by photo gallery schema):')
      const expectedColumns = [
        'uploaded_by', 'cultural_context', 'cultural_sensitivity_level',
        'ceremonial_content', 'traditional_knowledge', 'consent_status',
        'consent_metadata', 'elder_approval'
      ]
      
      expectedColumns.forEach(col => {
        if (!existingColumns.includes(col)) {
          console.log(`   ❌ ${col}`)
        }
      })
    }
    
  } catch (error) {
    console.error('💥 Error checking table:', error)
  }
}

checkMediaAssetsStructure().catch(console.error)