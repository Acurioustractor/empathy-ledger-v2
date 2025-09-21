import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { profileIds, action, tenantId, customData } = await request.json()

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { error: 'Profile IDs array is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`🔄 Bulk update initiated: ${action} for ${profileIds.length} profiles`)

    let results = []

    switch (action) {
      case 'apply-ai-suggestions':
        results = await applyAISuggestions(supabase, profileIds, tenantId)
        break

      case 'add-specialties':
        results = await addSpecialties(supabase, profileIds, customData?.specialties)
        break

      case 'update-cultural-background':
        results = await updateCulturalBackground(supabase, profileIds, customData?.culturalBackground)
        break

      case 'assign-projects':
        results = await assignToProjects(supabase, profileIds, customData?.projectIds)
        break

      case 'update-locations':
        results = await updateLocations(supabase, profileIds, customData?.location)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    console.log(`✅ Bulk update complete: ${successCount} succeeded, ${failureCount} failed`)

    return NextResponse.json({
      success: true,
      summary: {
        total: profileIds.length,
        succeeded: successCount,
        failed: failureCount
      },
      results
    })

  } catch (error) {
    console.error('❌ Error in bulk profile update:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function applyAISuggestions(supabase: any, profileIds: string[], tenantId: string) {
  const results = []

  for (const profileId of profileIds) {
    try {
      // Get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (profileError || !profile) {
        results.push({
          profileId,
          success: false,
          error: 'Profile not found'
        })
        continue
      }

      // Generate AI suggestions (simplified for demo)
      const aiSuggestions = await generateAISuggestionsForProfile(profile)

      // Apply suggestions to profile
      const updates: any = {}
      let hasUpdates = false

      for (const [field, suggestions] of Object.entries(aiSuggestions)) {
        if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
          // Only update if field is currently empty
          if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
            updates[field] = suggestions
            hasUpdates = true
          }
        }
      }

      if (hasUpdates) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profileId)

        if (updateError) {
          results.push({
            profileId,
            success: false,
            error: updateError.message
          })
        } else {
          results.push({
            profileId,
            success: true,
            updatedFields: Object.keys(updates),
            updates
          })
        }
      } else {
        results.push({
          profileId,
          success: true,
          message: 'No updates needed - profile already complete'
        })
      }

    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function addSpecialties(supabase: any, profileIds: string[], specialties: string[]) {
  if (!specialties || specialties.length === 0) {
    return profileIds.map(id => ({
      profileId: id,
      success: false,
      error: 'No specialties provided'
    }))
  }

  const results = []

  for (const profileId of profileIds) {
    try {
      // Get current specialties
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('specialties')
        .eq('id', profileId)
        .single()

      if (profileError) {
        results.push({
          profileId,
          success: false,
          error: 'Profile not found'
        })
        continue
      }

      // Merge with existing specialties
      const currentSpecialties = profile.specialties || []
      const newSpecialties = [...new Set([...currentSpecialties, ...specialties])]

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ specialties: newSpecialties })
        .eq('id', profileId)

      if (updateError) {
        results.push({
          profileId,
          success: false,
          error: updateError.message
        })
      } else {
        results.push({
          profileId,
          success: true,
          addedSpecialties: specialties,
          totalSpecialties: newSpecialties.length
        })
      }

    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function updateCulturalBackground(supabase: any, profileIds: string[], culturalBackground: string) {
  if (!culturalBackground) {
    return profileIds.map(id => ({
      profileId: id,
      success: false,
      error: 'No cultural background provided'
    }))
  }

  const results = []

  for (const profileId of profileIds) {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cultural_background: culturalBackground })
        .eq('id', profileId)

      if (updateError) {
        results.push({
          profileId,
          success: false,
          error: updateError.message
        })
      } else {
        results.push({
          profileId,
          success: true,
          updatedCulturalBackground: culturalBackground
        })
      }

    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function assignToProjects(supabase: any, profileIds: string[], projectIds: string[]) {
  if (!projectIds || projectIds.length === 0) {
    return profileIds.map(id => ({
      profileId: id,
      success: false,
      error: 'No project IDs provided'
    }))
  }

  const results = []

  for (const profileId of profileIds) {
    try {
      const assignmentResults = []

      for (const projectId of projectIds) {
        // Check if assignment already exists
        const { data: existing } = await supabase
          .from('project_storytellers')
          .select('id')
          .eq('project_id', projectId)
          .eq('storyteller_id', profileId)
          .single()

        if (!existing) {
          const { error: assignError } = await supabase
            .from('project_storytellers')
            .insert({
              project_id: projectId,
              storyteller_id: profileId,
              role: 'participant',
              status: 'active'
            })

          if (assignError) {
            assignmentResults.push({
              projectId,
              success: false,
              error: assignError.message
            })
          } else {
            assignmentResults.push({
              projectId,
              success: true
            })
          }
        } else {
          assignmentResults.push({
            projectId,
            success: true,
            message: 'Already assigned'
          })
        }
      }

      const successfulAssignments = assignmentResults.filter(r => r.success).length

      results.push({
        profileId,
        success: successfulAssignments > 0,
        assignedProjects: successfulAssignments,
        assignments: assignmentResults
      })

    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function updateLocations(supabase: any, profileIds: string[], location: any) {
  if (!location) {
    return profileIds.map(id => ({
      profileId: id,
      success: false,
      error: 'No location provided'
    }))
  }

  const results = []

  for (const profileId of profileIds) {
    try {
      // Create or update location record
      const { data: locationRecord, error: locationError } = await supabase
        .from('locations')
        .upsert({
          name: location.name,
          city: location.city,
          state: location.state,
          country: location.country
        })
        .select()
        .single()

      if (locationError) {
        results.push({
          profileId,
          success: false,
          error: locationError.message
        })
        continue
      }

      // Link profile to location
      const { error: linkError } = await supabase
        .from('profile_locations')
        .upsert({
          profile_id: profileId,
          location_id: locationRecord.id,
          is_primary: true
        })

      if (linkError) {
        results.push({
          profileId,
          success: false,
          error: linkError.message
        })
      } else {
        results.push({
          profileId,
          success: true,
          updatedLocation: location.name
        })
      }

    } catch (error) {
      results.push({
        profileId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

// Helper function to generate AI suggestions for a profile
async function generateAISuggestionsForProfile(profile: any) {
  // Simplified AI suggestion logic for demo
  const suggestions: any = {}

  // Mock suggestions based on profile name or existing data
  if (!profile.specialties || profile.specialties.length === 0) {
    suggestions.specialties = ['Traditional Storytelling', 'Community Leadership']
  }

  if (!profile.expertise_areas || profile.expertise_areas.length === 0) {
    suggestions.expertise_areas = ['Cultural Preservation', 'Education']
  }

  if (!profile.impact_focus_areas || profile.impact_focus_areas.length === 0) {
    suggestions.impact_focus_areas = ['Youth Development', 'Cultural Heritage']
  }

  if (!profile.community_roles || profile.community_roles.length === 0) {
    suggestions.community_roles = ['Elder', 'Mentor']
  }

  return suggestions
}