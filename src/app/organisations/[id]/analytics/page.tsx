export const dynamic = 'force-dynamic'

import { OrganizationAnalytics } from '@/components/organization/OrganizationAnalytics'

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
  try {
    // Use our new analytics API endpoint
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3030'
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'

    const response = await fetch(`${baseUrl}/api/organisations/${organizationId}/analytics`, {
      cache: 'no-store' // Ensure fresh data
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch analytics')
    }

    console.log('📊 Raw API data:', {
      communityThemes: data.communityThemes?.length,
      sharedValues: data.sharedValues?.length,
      strengths: data.strengths?.length,
      culturalMarkers: data.culturalMarkers?.length
    })

    // Transform the API data to match the component's expected format
    const communityInsights: CommunityInsights = {
      topThemes: data.communityThemes || [],
      topValues: data.sharedValues || [],
      topStrengths: data.strengths || [],
      culturalMarkers: data.culturalMarkers || []
    }

    console.log('📊 Transformed insights:', {
      topThemes: communityInsights.topThemes.length,
      topValues: communityInsights.topValues.length,
      topStrengths: communityInsights.topStrengths.length,
      culturalMarkers: communityInsights.culturalMarkers.length
    })

    return {
      insights: communityInsights,
      memberCount: data.memberCount || 0,
      analyticsCount: data.analyticsCount || 0
    }
  } catch (error) {
    console.error('Error fetching organisation analytics:', error)

    // Return empty data if API fails
    return {
      insights: {
        topThemes: [],
        topValues: [],
        topStrengths: [],
        culturalMarkers: []
      },
      memberCount: 0,
      analyticsCount: 0
    }
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = await params
  const data = await getOrganizationAnalytics(id)

  return (
    <OrganizationAnalytics 
      insights={data.insights}
      memberCount={data.memberCount}
      analyticsCount={data.analyticsCount}
    />
  )
}