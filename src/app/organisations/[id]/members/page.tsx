import { createClient } from '@supabase/supabase-js'
import { MemberDirectory } from '@/components/organization/MemberDirectory'
import MemberInvitations from '@/components/organization/MemberInvitations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Use service role to bypass RLS for organization data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface MembersPageProps {
  params: Promise<{ id: string }>
}

async function getOrganizationData(organizationId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get organisation details including slug
  const { data: organisation } = await supabase
    .from('organizations')
    .select('id, name, slug, tenant_id')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    throw new Error('Organization not found')
  }

  // Get current user profile to check permissions
  const { data: { user } } = await supabase.auth.getUser()
  let canManage = false
  let isSuperAdmin = false

  if (user) {
    // Check if user is organisation admin
    const { data: membership } = await supabase
      .from('profile_organizations')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('profile_id', user.id)
      .single()

    canManage = membership?.role === 'admin' || membership?.role === 'owner'

    // Check if user is super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    isSuperAdmin = profile?.is_super_admin || false
  } else {
    // Development bypass
    isSuperAdmin = true
    canManage = true
  }

  // Debug: Let's see what's actually in the database
  console.log('🔍 DEBUGGING MEMBERS - Organization:', organisation.name, organizationId)

  // First check: How many profile_organizations records exist for this org?
  const { count: totalOrgMembers } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  console.log('🔍 Total profile_organizations records:', totalOrgMembers)

  // Second check: How many are active?
  const { count: activeOrgMembers } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  console.log('🔍 Active profile_organizations records:', activeOrgMembers)

  // Third check: How many profiles have this org in tenant_roles?
  const { count: profilesWithTenant } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organisation.tenant_id)

  console.log('🔍 Profiles with tenant_id:', profilesWithTenant, 'for tenant:', organisation.tenant_id)

  // Get all members for this organisation through profile_organizations
  const membersResult = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      role,
      is_active,
      joined_at,
      profiles (
        id,
        display_name,
        full_name,
        email,
        current_role,
        cultural_background,
        tenant_roles,
        created_at,
        profile_image_url,
        bio
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('joined_at', { ascending: false })

  let memberRelations = membersResult.data
  const error = membersResult.error

  console.log('🔍 Member relations found:', memberRelations?.length || 0)
  if (memberRelations && memberRelations.length > 0) {
    console.log('🔍 First member relation:', JSON.stringify(memberRelations[0], null, 2))
  }

  if (error) {
    console.error('❌ Error fetching organisation members:', error)
    return { organisation, members: [], canManage, isSuperAdmin }
  }

  // If no formal organisation members, fall back to tenant members (storytellers, etc.)
  if (!memberRelations || memberRelations.length === 0) {
    console.log('⚠️ No formal org members, fetching tenant members...')

    const { data: tenantProfiles, error: tenantError } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        email,
        current_role,
        cultural_background,
        tenant_roles,
        created_at,
        profile_image_url,
        avatar_url,
        bio,
        tenant_id
      `)
      .eq('tenant_id', organisation.tenant_id)
      .order('created_at', { ascending: false })

    console.log('🔍 Tenant profiles found:', tenantProfiles?.length || 0)

    if (tenantProfiles && tenantProfiles.length > 0) {
      // Transform tenant profiles to look like organisation members
      const tenantMembers = tenantProfiles.map(profile => ({
        profile_id: profile.id,
        role: 'storyteller', // Default role for tenant members
        is_active: true,
        joined_at: profile.created_at,
        profiles: profile
      }))

      memberRelations = tenantMembers
      console.log('🔍 Using tenant members as fallback:', memberRelations.length)
    }
  }

  // Get additional data for each member (projects and locations)
  const enhancedMembers = await Promise.all(
    (memberRelations || []).map(async (relation) => {
      const profileId = relation.profile_id

      // Get member's projects in this organisation
      const { data: memberProjects } = await supabase
        .from('profile_projects')
        .select(`
          role,
          project:projects (
            id,
            name,
            organization_id
          )
        `)
        .eq('profile_id', profileId)
        .eq('projects.organization_id', organizationId)

      // Get member's locations
      const { data: memberLocations } = await supabase
        .from('profile_locations')
        .select(`
          is_primary,
          location:locations (
            id,
            name,
            city,
            state,
            country
          )
        `)
        .eq('profile_id', profileId)
        .order('is_primary', { ascending: false })

      // Get member's stories count
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profileId)

      return {
        ...relation.profiles,
        organization_role: relation.role,
        joined_at: relation.joined_at,
        projects: memberProjects?.map(mp => ({
          id: mp.project?.id,
          name: mp.project?.name,
          role: mp.role
        })).filter(p => p.id) || [],
        locations: memberLocations?.map(ml => ({
          id: ml.location?.id,
          name: ml.location?.name,
          city: ml.location?.city,
          state: ml.location?.state,
          country: ml.location?.country,
          is_primary: ml.is_primary
        })).filter(l => l.id) || [],
        stories_count: storiesCount || 0
      }
    })
  )

  console.log('✅ getOrganizationData returning', enhancedMembers.length, 'enhanced members')
  console.log('✅ Enhanced member names:', enhancedMembers.map(m => m.display_name || m.full_name))

  return { organisation, members: enhancedMembers, canManage, isSuperAdmin }
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params
  console.log('🎯 MembersPage - Organization ID:', id)
  const { organisation, members, canManage, isSuperAdmin } = await getOrganizationData(id)
  console.log('🎯 MembersPage - Got', members.length, 'members from getOrganizationData')
  console.log('🎯 MembersPage - Member names:', members.map(m => m.display_name || m.full_name))

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20 border-b border-stone-200 px-6 py-6 -mx-6 -mt-6 rounded-t-xl">
        <h1 className="text-display-sm font-bold tracking-tight text-stone-900">
          Members & Invitations
        </h1>
        <p className="text-body-md text-stone-600 mt-1">
          Manage your organisation's members and send invitations
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            Current Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <MemberDirectory
            members={members}
            organizationId={id}
            canManage={canManage}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <MemberInvitations
            organizationId={id}
            organizationSlug={organisation.slug}
            canManage={canManage}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
