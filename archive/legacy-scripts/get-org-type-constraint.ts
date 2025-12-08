import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function getConstraint() {
  const supabase = createServiceRoleClient()
  
  // Try creating orgs with different types to find what's allowed
  const testTypes = ['community', 'nonprofit', 'government', 'tribal', 'aboriginal_community', 'philanthropy']
  
  console.log('🧪 Testing different organization types...\n')
  
  for (const type of testTypes) {
    const testOrgId = crypto.randomUUID()
    const testTenantId = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        id: testOrgId,
        tenant_id: testTenantId,
        name: `Test ${type}`,
        type: type
      })
      .select()
    
    if (error) {
      console.log(`❌ Type "${type}": ${error.message}`)
    } else {
      console.log(`✅ Type "${type}": WORKS`)
      // Clean up
      await supabase.from('organizations').delete().eq('id', testOrgId)
    }
  }
}

getConstraint()
