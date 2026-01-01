import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function findAllowedTypes() {
  const supabase = createServiceRoleClient()
  
  const testTypes = [
    'community',
    'nonprofit',
    'government',
    'tribal',
    'aboriginal_community',
    'philanthropy',
    'ngo',
    'charity',
    'social_enterprise',
    'cooperative',
    'trust',
    'foundation',
    'indigenous',
    'first_nations'
  ]
  
  console.log('🧪 Testing organization types...\\n')
  
  const allowed: string[] = []
  const disallowed: string[] = []
  
  for (const type of testTypes) {
    const testTenantId = crypto.randomUUID()
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: testTenantId,
        name: `Test Tenant ${type}`,
        slug: `test-${type}-${Math.random()}`,
        subscription_tier: 'community',
        status: 'active'
      })
    
    if (tenantError) continue
    
    const testOrgId = crypto.randomUUID()
    const { error } = await supabase
      .from('organizations')
      .insert({
        id: testOrgId,
        tenant_id: testTenantId,
        name: `Test ${type}`,
        type: type
      })
    
    if (error) {
      if (error.message.includes('check constraint')) {
        disallowed.push(type)
        console.log(`❌ "${type}": NOT ALLOWED`)
      }
    } else {
      allowed.push(type)
      console.log(`✅ "${type}": ALLOWED`)
      await supabase.from('organizations').delete().eq('id', testOrgId)
    }
    
    await supabase.from('tenants').delete().eq('id', testTenantId)
  }
  
  console.log('\\n✅ ALLOWED:', allowed)
  console.log('❌ DISALLOWED:', disallowed)
}

findAllowedTypes()
