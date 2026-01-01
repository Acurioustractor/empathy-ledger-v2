#!/usr/bin/env node

/**
 * EMPATHY LEDGER - FAKE DATA PURGE SCRIPT
 *
 * This script removes all test/fake data from the database to ensure
 * only authentic, real data remains for the connection system.
 *
 * World-class data integrity starts with authentic foundations.
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function purgeFakeData() {
  console.log('🧹 EMPATHY LEDGER - PURGING FAKE DATA')
  console.log('=====================================')

  try {
    // 1. Remove fake organizations
    console.log('\n1️⃣ Removing fake organizations...')
    const fakeOrgs = ['test', 'Clean Test Organization Final']

    for (const orgName of fakeOrgs) {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('id, name, tenant_id')
        .eq('name', orgName)

      if (error) {
        console.error(`❌ Error finding org "${orgName}":`, error.message)
        continue
      }

      if (orgs && orgs.length > 0) {
        for (const org of orgs) {
          console.log(`   🗑️ Deleting fake organization: "${org.name}" (${org.id})`)

          // Delete associated projects first
          await supabase
            .from('projects')
            .delete()
            .eq('organization_id', org.id)

          // Delete organization
          await supabase
            .from('organizations')
            .delete()
            .eq('id', org.id)

          // Clean up tenant if needed
          if (org.tenant_id) {
            await supabase
              .from('tenants')
              .delete()
              .eq('id', org.tenant_id)
          }
        }
      } else {
        console.log(`   ✅ No fake org found: "${orgName}"`)
      }
    }

    // 2. Remove fake projects
    console.log('\n2️⃣ Removing fake projects...')
    const fakeProjects = ['Test Project', 'FIXED Test Project']

    for (const projectName of fakeProjects) {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('name', projectName)

      if (error) {
        console.error(`❌ Error finding project "${projectName}":`, error.message)
        continue
      }

      if (projects && projects.length > 0) {
        for (const project of projects) {
          console.log(`   🗑️ Deleting fake project: "${project.name}" (${project.id})`)

          await supabase
            .from('projects')
            .delete()
            .eq('id', project.id)
        }
      } else {
        console.log(`   ✅ No fake project found: "${projectName}"`)
      }
    }

    // 3. Audit remaining data
    console.log('\n3️⃣ Auditing remaining authentic data...')

    const { data: realOrgs } = await supabase
      .from('organizations')
      .select('id, name, type')
      .order('name')

    const { data: realProjects } = await supabase
      .from('projects')
      .select('id, name, status')
      .order('name')

    console.log(`   ✅ ${realOrgs?.length || 0} authentic organizations remaining`)
    console.log(`   ✅ ${realProjects?.length || 0} authentic projects remaining`)

    if (realOrgs && realOrgs.length > 0) {
      console.log('\n📋 AUTHENTIC ORGANIZATIONS:')
      realOrgs.slice(0, 10).forEach(org => {
        console.log(`   • ${org.name} (${org.type})`)
      })
      if (realOrgs.length > 10) {
        console.log(`   ... and ${realOrgs.length - 10} more`)
      }
    }

    if (realProjects && realProjects.length > 0) {
      console.log('\n📋 AUTHENTIC PROJECTS:')
      realProjects.slice(0, 10).forEach(project => {
        console.log(`   • ${project.name} (${project.status})`)
      })
      if (realProjects.length > 10) {
        console.log(`   ... and ${realProjects.length - 10} more`)
      }
    }

    console.log('\n🎉 FAKE DATA PURGE COMPLETE!')
    console.log('   Database now contains only authentic data')
    console.log('   Ready for world-class connection system implementation')

  } catch (error) {
    console.error('❌ Purge failed:', error)
    process.exit(1)
  }
}

// Run the purge
purgeFakeData()