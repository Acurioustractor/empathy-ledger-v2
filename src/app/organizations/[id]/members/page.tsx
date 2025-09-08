import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { MemberDirectory } from '@/components/organization/MemberDirectory'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface MembersPageProps {
  params: Promise<{ id: string }>
}

async function getOrganizationMembers(organizationId: string) {
  const supabase = await createSupabaseServerClient()
  
  // Get organization to get tenant_id
  const { data: organization } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    throw new Error('Organization not found')
  }

  // Get all members for this tenant
  const { data: members, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      full_name,
      email,
      current_role,
      cultural_background,
      location,
      tenant_roles,
      skills,
      interests,
      mentoring_availability,
      created_at
    `)
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization members:', error)
    return []
  }

  return members || []
}

export default async function MembersPage({ params }: MembersPageProps) {
  const members = await getOrganizationMembers(params.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <MemberDirectory 
          members={members}
          organizationId={params.id}
        />
      </div>

      <Footer />
    </div>
  )
}