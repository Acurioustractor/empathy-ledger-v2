#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * Ensures TypeScript types match actual database schema
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Known Australian spelling conventions in our database
const AUSTRALIAN_CONVENTIONS = {
  tables: {
    'organizations': 'organisations',
    'organization_members': 'organization_members', // Keep as-is for now
  },
  fields: {
    'color': 'colour',
    'center': 'centre',
    'analyze': 'analyse',
    'behavior': 'behaviour',
    'favor': 'favour'
  }
}

async function validateTableStructure() {
  console.log('🔍 Validating database schema against TypeScript types...\n')

  const issues = []

  // Check key tables
  const tablesToCheck = [
    'organisations',
    'organization_members',
    'stories',
    'profiles',
    'media_assets',
    'galleries'
  ]

  for (const table of tablesToCheck) {
    console.log(`Checking ${table}...`)

    try {
      // Get one row to check structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        issues.push({
          table,
          issue: 'Table not accessible',
          error: error.message
        })
        continue
      }

      // Read corresponding TypeScript type file
      const typeFilePath = path.join(
        process.cwd(),
        'src/types/database',
        `${getTypeFileName(table)}.ts`
      )

      if (fs.existsSync(typeFilePath)) {
        const typeContent = fs.readFileSync(typeFilePath, 'utf8')

        // Check if table has expected fields
        if (data && data.length > 0) {
          const actualFields = Object.keys(data[0])

          // Look for field mismatches
          for (const field of actualFields) {
            if (!typeContent.includes(field + ':')) {
              issues.push({
                table,
                issue: 'Field exists in DB but not in types',
                field
              })
            }
          }
        }
      }

      console.log(`✅ ${table} validated`)
    } catch (err) {
      issues.push({
        table,
        issue: 'Validation error',
        error: err.message
      })
    }
  }

  return issues
}

function getTypeFileName(table) {
  const mapping = {
    'organisations': 'organization-tenant',
    'organization_members': 'organization-tenant',
    'stories': 'content-media',
    'profiles': 'user-profile',
    'media_assets': 'content-media',
    'galleries': 'content-media'
  }
  return mapping[table] || table
}

async function main() {
  console.log('🇦🇺 Database Schema Validation Tool')
  console.log('=====================================\n')

  const issues = await validateTableStructure()

  if (issues.length > 0) {
    console.log('\n⚠️  Schema Issues Found:')
    console.log('========================')
    issues.forEach(issue => {
      console.log(`\n❌ ${issue.table}`)
      console.log(`   Issue: ${issue.issue}`)
      if (issue.field) console.log(`   Field: ${issue.field}`)
      if (issue.error) console.log(`   Error: ${issue.error}`)
    })

    console.log('\n📝 Recommendations:')
    console.log('1. Run: npx supabase db types typescript --local > src/types/database.ts')
    console.log('2. Update API routes to match actual database fields')
    console.log('3. Consider creating field mapping utilities')

    process.exit(1)
  } else {
    console.log('\n✅ All schema validations passed!')
  }
}

main().catch(console.error)