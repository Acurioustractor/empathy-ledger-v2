import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { OrganizationAnalytics } from '@/components/organization/OrganizationAnalytics'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface AnalyticsPageProps {
  params: Promise<{ id: string }>
}

interface CommunityInsights {
  topThemes: Array<{ theme: string; count: number }>
  topValues: Array<{ value: string; count: number }>
  topStrengths: Array<{ strength: string; count: number }>
  culturalMarkers: string[]
}

async function getOrganizationAnalytics(organizationId: string) {
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

  // Get member count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organization.tenant_id)

  // Get analytics for organization members
  const { data: insights } = await supabase
    .from('personal_insights')
    .select(`
      narrative_themes,
      core_values,
      personal_strengths,
      cultural_identity_markers,
      profiles!inner(tenant_id)
    `)
    .eq('profiles.tenant_id', organization.tenant_id)

  const analyticsCount = insights?.length || 0

  // Aggregate community insights
  const communityInsights: CommunityInsights = {
    topThemes: [],
    topValues: [],
    topStrengths: [],
    culturalMarkers: []
  }

  if (insights && insights.length > 0) {
    // Aggregate themes, values, and strengths
    const allThemes: string[] = []
    const allValues: string[] = []
    const allStrengths: string[] = []
    const allCulturalMarkers: string[] = []

    insights.forEach(insight => {
      if (insight.narrative_themes && Array.isArray(insight.narrative_themes)) {
        allThemes.push(...(insight.narrative_themes as string[]))
      }
      if (insight.core_values && Array.isArray(insight.core_values)) {
        allValues.push(...(insight.core_values as string[]))
      }
      if (insight.personal_strengths && Array.isArray(insight.personal_strengths)) {
        allStrengths.push(...(insight.personal_strengths as string[]))
      }
      if (insight.cultural_identity_markers && Array.isArray(insight.cultural_identity_markers)) {
        allCulturalMarkers.push(...(insight.cultural_identity_markers as string[]))
      }
    })

    // Count frequencies
    const countFrequencies = (items: string[]) => {
      const counts: Record<string, number> = {}
      items.forEach(item => {
        counts[item] = (counts[item] || 0) + 1
      })
      return counts
    }

    const themeCount = countFrequencies(allThemes)
    const valueCount = countFrequencies(allValues)
    const strengthCount = countFrequencies(allStrengths)

    communityInsights.topThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([theme, count]) => ({ theme, count }))

    communityInsights.topValues = Object.entries(valueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([value, count]) => ({ value, count }))

    communityInsights.topStrengths = Object.entries(strengthCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([strength, count]) => ({ strength, count }))

    communityInsights.culturalMarkers = [...new Set(allCulturalMarkers)].slice(0, 20)
  }

  return {
    insights: communityInsights,
    memberCount: memberCount || 0,
    analyticsCount
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const data = await getOrganizationAnalytics(params.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <OrganizationAnalytics 
          insights={data.insights}
          memberCount={data.memberCount}
          analyticsCount={data.analyticsCount}
        />
      </div>

      <Footer />
    </div>
  )
}