import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function testOrgCreation() {
  const supabase = createServiceRoleClient()

  console.log('🧪 Testing organization creation...\n')

  // Test data
  const testOrg = {
    name: 'Test Organization ' + Date.now(),
    description: 'Test organization for API validation',
    type: 'community',
    location: 'Sydney, NSW',
    website_url: 'https://test.example.com',
    contact_email: 'test@example.com'
  }

  console.log('📋 Test organization data:')
  console.log(JSON.stringify(testOrg, null, 2))
  console.log()

  try {
    // Generate UUID
    const { data: uuidData } = await supabase.rpc('gen_random_uuid')
    const orgId = uuidData || crypto.randomUUID()

    console.log('🔑 Generated UUID:', orgId)
    console.log()

    // Create organization
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert({
        id: orgId,
        tenant_id: orgId,
        name: testOrg.name,
        description: testOrg.description,
        type: testOrg.type,
        location: testOrg.location,
        website_url: testOrg.website_url,
        contact_email: testOrg.contact_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ ERROR creating organization:', error.message)
      console.error('   Details:', error)
      process.exit(1)
    }

    console.log('✅ SUCCESS! Organization created:')
    console.log('   ID:', organization.id)
    console.log('   Name:', organization.name)
    console.log('   Type:', organization.type)
    console.log('   Tenant ID:', organization.tenant_id)
    console.log()

    // Clean up - delete test organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organization.id)

    if (deleteError) {
      console.warn('⚠️  Could not delete test organization:', deleteError.message)
    } else {
      console.log('🧹 Test organization cleaned up')
    }

    console.log('\n✅ All tests passed!')
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

testOrgCreation()
