import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch organizations from database
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return Response.json({ 
        organizations: [], 
        total: 0, 
        error: error.message,
        success: false 
      }, { status: 500 })
    }

    // Enhance organizations with computed properties
    const enhancedOrganizations = organizations?.map(org => {
      // Compute status based on activity and data completeness
      let status = 'active'
      if (!org.website_url && !org.contact_email) status = 'inactive'
      if (org.description?.includes('Real organization from profile')) status = 'pending'
      
      // Compute verification status
      let verification_status = 'verified'
      if (status === 'pending') verification_status = 'pending'
      if (!org.website_url && !org.location) verification_status = 'unverified'
      
      // Compute activity metrics
      const daysSinceUpdate = Math.floor((Date.now() - new Date(org.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      const isRecentlyActive = daysSinceUpdate < 30
      
      return {
        ...org,
        status,
        verification_status,
        verified_at: verification_status === 'verified' ? org.updated_at : null,
        is_recently_active: isRecentlyActive,
        days_since_update: daysSinceUpdate,
        story_count: Math.floor(Math.random() * 20), // Placeholder
        member_count: Math.floor(Math.random() * 50) // Placeholder
      }
    }) || []

    return Response.json({
      organizations: enhancedOrganizations,
      total: enhancedOrganizations.length,
      success: true
    })

  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ 
      organizations: [], 
      total: 0, 
      error: 'Failed to fetch organizations',
      success: false 
    }, { status: 500 })
  }
}