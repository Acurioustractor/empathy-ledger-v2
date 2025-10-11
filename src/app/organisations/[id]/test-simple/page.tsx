import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

interface SimpleTestProps {
  params: { id: string }
}

async function getBasicOrganizationData(organizationId: string) {
  const supabase = createSupabaseServerClient()
  
  // Get organisation details - basic test
  const { data: organisation, error } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .eq('id', organizationId)
    .single()

  if (error) {
    console.error('Organization fetch error:', error)
    return { organisation: null, error: error.message }
  }

  return { organisation, error: null }
}

export default async function SimpleTestPage({ params }: SimpleTestProps) {
  const { id } = params
  const { organisation, error } = await getBasicOrganizationData(id)

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!organisation) {
    return <div>Organization not found</div>
  }

  return (
    <div>
      <h1>Simple Test Page</h1>
      <p>Organization ID: {organisation.id}</p>
      <p>Organization Name: {organisation.name}</p>
      <p>Tenant ID: {organisation.tenant_id}</p>
    </div>
  )
}