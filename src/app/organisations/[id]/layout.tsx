import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { OrganizationHeader } from '@/components/organization/OrganizationHeader'
import { OrganizationNavigation } from '@/components/organization/OrganizationNavigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { adminConfig } from '@/lib/config/admin-config'

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

async function getOrganization(organizationId: string) {
  const supabase = createSupabaseServerClient()

  const { data: organisation, error } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !organisation) {
    notFound()
  }

  return organisation
}

async function verifyOrganizationAccess(organizationId: string) {
  const supabase = createSupabaseServerClient()

  // Only log in development mode for debugging
  if (adminConfig.isDevelopmentMode()) {
    console.log('🔍 Verifying organisation access for:', organizationId)
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    // Check if we should bypass server auth in development
    if (adminConfig.isDevelopmentSuperAdmin()) {
      if (adminConfig.isDevelopmentMode()) {
        console.log('🔧 DEVELOPMENT MODE: Bypassing server-side auth for super admin access')
      }
      return {
        hasAccess: true,
        isAdmin: true,
        role: 'development_super_admin'
      }
    }

    return { hasAccess: false, isAdmin: false, role: null }
  }

  if (adminConfig.isDevelopmentMode()) {
    console.log('👤 User found:', user.email)
  }

  // ALWAYS check for super admin access first
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_roles, email')
    .eq('id', user.id)
    .single()

  if (profileError) {
    if (adminConfig.isDevelopmentMode()) {
      console.log('❌ Profile error:', profileError.message)
    }
    return { hasAccess: false, isAdmin: false, role: null }
  }

  // Super admin check using centralized admin config
  const hasAdminRole = profile?.tenant_roles?.includes('super_admin') || profile?.tenant_roles?.includes('admin')
  const isConfigAdmin = adminConfig.isSuperAdmin(profile?.email)
  const isSuperAdmin = hasAdminRole || isConfigAdmin

  if (isSuperAdmin) {
    if (adminConfig.isDevelopmentMode()) {
      console.log('🔑 Super admin access granted to:', profile?.email)
    }
    return {
      hasAccess: true,
      isAdmin: true,
      role: 'super_admin'
    }
  }

  // Check if user is a member of this organisation
  const { data: membership } = await supabase
    .from('profile_organizations')
    .select('role, is_active')
    .eq('organization_id', organizationId)
    .eq('profile_id', user.id)
    .single()

  if (!membership || !membership.is_active) {
    if (adminConfig.isDevelopmentMode()) {
      console.log('❌ No membership found for user:', profile?.email, 'in organisation:', organizationId)
    }
    return {
      hasAccess: false,
      isAdmin: false,
      role: null
    }
  }

  const isAdmin = membership.role === 'admin' || membership.role === 'owner'
  if (adminConfig.isDevelopmentMode()) {
    console.log('✅ Organization member access:', profile?.email, 'role:', membership.role)
  }

  return {
    hasAccess: true,
    isAdmin,
    role: membership.role
  }
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { id: organizationId } = await params

  // Check organisation access
  const accessCheck = await verifyOrganizationAccess(organizationId)
  if (!accessCheck.hasAccess) {
    notFound()
  }

  // Get organisation data
  const organisation = await getOrganization(organizationId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-clay-50/10">
      <Header />
      
      <OrganizationHeader organisation={organisation} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-24">
              <OrganizationNavigation organizationId={organizationId} />
            </div>
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-pulse w-8 h-8 bg-stone-200 rounded-full mx-auto mb-4"></div>
                  <p className="text-body-md text-stone-500 animate-pulse">
                    Loading organisation content...
                  </p>
                </div>
              </div>
            }>
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}