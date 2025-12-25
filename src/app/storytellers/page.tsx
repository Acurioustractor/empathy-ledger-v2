import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import StorytellerDirectoryClient, { Storyteller } from './storytellers-client'
import { resolveProfileAvatars, AVATAR_FIELDS_SELECT } from '@/lib/utils/avatar-resolver'

export const dynamic = 'force-dynamic'

async function getStorytellers(): Promise<Storyteller[]> {
  try {
    const supabase = createSupabaseServerClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        stories!stories_author_id_fkey(count)
      `)
      .order('display_name', { ascending: true })
      .limit(1000)

    if (error) {
      console.error('Error fetching storytellers:', error)
      return []
    }

    // Resolve all avatar URLs in batch
    const profilesWithAvatars = await resolveProfileAvatars(profiles || [], supabase)

    // Transform the data to match the Storyteller interface
    const storytellers: Storyteller[] = profilesWithAvatars.map((profile: Record<string, unknown>) => {
      // Safely extract story count from aggregation query
      const storiesData = profile.stories as Array<{ count: number }> | null | undefined
      const storyCount = Array.isArray(storiesData) && storiesData.length > 0 && typeof storiesData[0].count === 'number'
        ? storiesData[0].count
        : 0

      return {
        id: profile.id as string,
        display_name: (profile.display_name as string) || 'Anonymous',
        bio: profile.bio as string | null,
        cultural_background: profile.cultural_background as string | null,
        specialties: profile.specialties as string[] | null,
        years_of_experience: profile.years_of_experience as number | null,
        preferred_topics: profile.preferred_topics as string[] | null,
        story_count: storyCount,
        featured: (profile.is_featured as boolean) || false,
        status: ((profile.status as string) || 'active') as 'active' | 'inactive' | 'pending',
        elder_status: (profile.is_elder as boolean) || false,
        storytelling_style: profile.storytelling_style as string[] | null,
        location: profile.location as string | null,
        avatar_url: profile.avatar_url as string | undefined, // Resolved by avatar-resolver utility
        profile: {
          avatar_url: profile.avatar_url as string | undefined, // Same resolved URL
          cultural_affiliations: profile.cultural_affiliations as string[] | undefined,
          pronouns: profile.pronouns as string | undefined,
          display_name: profile.display_name as string | undefined,
          bio: profile.bio as string | undefined,
        }
      }
    })

    return storytellers
  } catch (error) {
    console.error('Failed to fetch storytellers:', error)
    return []
  }
}

export default async function StorytellerDirectoryPage() {
  const storytellers = await getStorytellers()

  return <StorytellerDirectoryClient initialStorytellers={storytellers} />
}
