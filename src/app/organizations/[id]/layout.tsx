import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { OrganizationHeader } from '@/components/organization/OrganizationHeader'
import { OrganizationNavigation } from '@/components/organization/OrganizationNavigation'

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

async function getOrganization(organizationId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !organization) {
    notFound()
  }

  return organization
}

async function verifyOrganizationAccess(organizationId: string) {
  const supabase = await createSupabaseServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Check if user has access to this organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenant_roles')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return false
  }

  // Get organization to check tenant_id match
  const { data: organization } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', organizationId)
    .single()

  // User must be in the same tenant or have admin role
  const hasAccess = profile.tenant_id === organization?.tenant_id ||
    profile.tenant_roles?.includes('admin') ||
    profile.tenant_roles?.includes('organization_admin')

  return hasAccess
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { id: organizationId } = await params

  // Verify access first
  const hasAccess = await verifyOrganizationAccess(organizationId)
  if (!hasAccess) {
    notFound()
  }

  // Get organization data
  const organization = await getOrganization(organizationId)

  return (
    <div className="min-h-screen bg-background">
      <OrganizationHeader organization={organization} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <OrganizationNavigation organizationId={organizationId} />
          </aside>
          
          <main className="flex-1">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">
                  Loading organization content...
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}