import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { OrganizationHeader } from '@/components/organization/OrganizationHeader'
import { OrganizationNavigation } from '@/components/organization/OrganizationNavigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { adminConfig } from '@/lib/config/admin-config'

// Use service role to bypass RLS for organization lookups
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

async function getOrganization(organizationId: string) {
  // Use service role client to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: organisation, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !organisation) {
    notFound()
  }

  return organisation
}

async function verifyOrganizationAccess(organizationId: string) {
  // In development mode, always grant access
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 DEVELOPMENT MODE: Granting access to organisation:', organizationId)
    return {
      hasAccess: true,
      isAdmin: true,
      role: 'development_super_admin'
    }
  }

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
  const { id: organizationId } = params

  // Check organisation access
  const accessCheck = await verifyOrganizationAccess(organizationId)
  if (!accessCheck.hasAccess) {
    notFound()
  }

  // Get organisation data
  const organisation = await getOrganization(organizationId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-earth-50/10">
      <Header />

      <OrganizationHeader organisation={organisation} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <OrganizationNavigation organizationId={organizationId} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-body-md text-stone-500">
                      Loading organisation content...
                    </p>
                  </div>
                </div>
              </div>
            }>
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden p-6">
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