// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'



export async function POST(request: NextRequest) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createServiceRoleClient()
    const formData = await request.formData()

    // Extract form data
    const storytellerMode = formData.get('storyteller_mode') as string
    const storytellerId = formData.get('storyteller_id') as string | null
    const storytellerName = formData.get('storyteller_name') as string | null
    const storytellerEmail = formData.get('storyteller_email') as string | null
    const storytellerBio = formData.get('storyteller_bio') as string | null

    const transcriptText = formData.get('transcript_text') as string
    const videoUrl = formData.get('video_url') as string
    const transcriptTitle = formData.get('transcript_title') as string | null

    const projectId = formData.get('project_id') as string
    const organizationId = formData.get('organization_id') as string | null

    const location = formData.get('location') as string | null
    const tags = formData.get('tags') as string | null
    const culturalBackground = formData.get('cultural_background') as string | null
    const photo = formData.get('photo') as File | null
    const fullVideoUrl = formData.get('full_video_url') as string | null

    console.log('📝 Quick Add Request:', {
      storytellerMode,
      storytellerId,
      storytellerName,
      projectId,
      organizationId,
      hasPhoto: !!photo,
      transcriptLength: transcriptText?.length || 0,
      videoUrl,
      fullVideoUrl
    })

    // Validation
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: project_id' },
        { status: 400 }
      )
    }

    if (!transcriptText && !videoUrl) {
      return NextResponse.json(
        { error: 'Either transcript_text or video_url is required' },
        { status: 400 }
      )
    }

    if (storytellerMode === 'new' && !storytellerName) {
      return NextResponse.json(
        { error: 'Storyteller name is required when creating new storyteller' },
        { status: 400 }
      )
    }

    if (storytellerMode === 'existing' && !storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required when using existing storyteller' },
        { status: 400 }
      )
    }

    // Get tenant_id from organization if provided
    let tenantId: string | null = null
    if (organizationId) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', organizationId)
        .single()

      if (!orgError && org) {
        tenantId = org.tenant_id
        console.log(`✅ Found tenant_id: ${tenantId} for organization: ${organizationId}`)
      } else {
        console.error('Error fetching organization tenant_id:', orgError)
        return NextResponse.json(
          { error: 'Failed to fetch organization details. Organization may not exist.' },
          { status: 400 }
        )
      }
    } else {
      // If no organization provided, we cannot proceed as tenant_id is required
      return NextResponse.json(
        { error: 'Organization is required to create a storyteller' },
        { status: 400 }
      )
    }

    // Get or create storyteller
    let finalStorytellerId: string

    if (storytellerMode === 'existing') {
      finalStorytellerId = storytellerId!
      console.log(`✅ Using existing storyteller: ${storytellerId}`)

      // Update video URL if provided
      if (fullVideoUrl) {
        await supabase
          .from('profiles')
          .update({ video_intro_url: fullVideoUrl })
          .eq('id', storytellerId)

        console.log(`✅ Updated storyteller video URL`)
      }
    } else {
      // Create new storyteller (profile)
      console.log(`📝 Creating new storyteller: ${storytellerName}`)

      // Generate a unique email if not provided
      const email = storytellerEmail || `${storytellerName.toLowerCase().replace(/\s+/g, '.')}@empathyledger.placeholder.com`

      // Generate a UUID for the new profile
      const profileId = crypto.randomUUID()

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          full_name: storytellerName,
          display_name: storytellerName,
          email: email,
          bio: storytellerBio || '',
          cultural_background: culturalBackground || null,
          video_intro_url: fullVideoUrl || null,
          is_storyteller: true,
          is_elder: false,
          is_featured: false,
          onboarding_completed: true,
          profile_visibility: 'public',
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating storyteller:', profileError)
        return NextResponse.json(
          { error: `Failed to create storyteller: ${profileError.message}` },
          { status: 500 }
        )
      }

      finalStorytellerId = newProfile.id
      console.log(`✅ Created storyteller: ${finalStorytellerId}`)

      // Link to organization if provided
      if (organizationId) {
        await supabase
          .from('profile_organizations')
          .insert({
            profile_id: finalStorytellerId,
            organization_id: organizationId,
            role: 'storyteller',
            is_active: true
          })

        console.log(`✅ Linked storyteller to organization: ${organizationId}`)
      }

      // Add location if provided
      if (location) {
        // Parse location (simple city, state format)
        const parts = location.split(',').map(s => s.trim())
        const city = parts[0] || location
        const state = parts[1] || ''

        await supabase
          .from('profile_locations')
          .insert({
            profile_id: finalStorytellerId,
            location_id: null, // Could lookup from locations table
            city: city,
            state: state,
            is_primary: true
          })

        console.log(`✅ Added location: ${location}`)
      }

      // Handle photo upload if provided
      if (photo) {
        try {
          console.log(`📸 Uploading profile photo: ${photo.name}`)

          // Generate unique filename
          const fileExtension = photo.name.split('.').pop()
          const timestamp = Date.now()
          const sanitizedName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const filename = `profiles/${profileId}/${timestamp}_${sanitizedName}`

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filename, photo, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('❌ Photo upload error:', uploadError)
          } else {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filename)

            // Update profile with image URL
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ profile_image_url: publicUrl })
              .eq('id', profileId)

            if (updateError) {
              console.error('❌ Error updating profile with image URL:', updateError)
            } else {
              console.log(`✅ Profile photo uploaded and linked: ${publicUrl}`)
            }
          }
        } catch (photoError) {
          console.error('❌ Photo upload error:', photoError)
          // Don't fail the whole operation if photo upload fails
        }
      }
    }

    // Link storyteller to project
    const { error: projectLinkError } = await supabase
      .from('project_storytellers')
      .insert({
        project_id: projectId,
        storyteller_id: finalStorytellerId
      })

    if (projectLinkError && !projectLinkError.message.includes('duplicate')) {
      console.error('Error linking to project:', projectLinkError)
      // Don't fail - continue anyway
    } else {
      console.log(`✅ Linked storyteller to project: ${projectId}`)
    }

    // Create transcript
    const autoTitle = transcriptTitle || `${storytellerName || 'Story'} - ${new Date().toLocaleDateString()}`

    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        title: autoTitle,
        text: transcriptText,
        transcript_content: transcriptText,
        video_url: videoUrl,
        storyteller_id: finalStorytellerId,
        project_id: projectId,
        organization_id: organizationId,
        tenant_id: tenantId,
        word_count: transcriptText.split(/\s+/).length,
        character_count: transcriptText.length,
        status: 'pending',
        metadata: {
          type: 'quick_add',
          created_via: 'admin_quick_add',
          has_video: !!videoUrl
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transcriptError) {
      console.error('Error creating transcript:', transcriptError)
      return NextResponse.json(
        { error: `Failed to create transcript: ${transcriptError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Created transcript: ${transcript.id}`)

    // Create story from transcript (optional - can be done later)
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: autoTitle,
        content: transcriptText,
        storyteller_id: finalStorytellerId,
        author_id: finalStorytellerId,
        project_id: projectId,
        organization_id: organizationId,
        tenant_id: tenantId,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (storyError) {
      console.error('Error creating story:', storyError)
      // Don't fail - story creation is optional
    } else {
      console.log(`✅ Created story: ${story.id}`)
    }

    // Parse and add tags if provided
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (tagArray.length > 0) {
        // Add tags to transcript (if you have a tags system)
        console.log(`🏷️  Tags to add: ${tagArray.join(', ')}`)
        // TODO: Implement tag linking
      }
    }

    return NextResponse.json({
      success: true,
      storyteller_id: finalStorytellerId,
      transcript_id: transcript.id,
      story_id: story?.id || null,
      message: 'Storyteller and transcript added successfully'
    })

  } catch (error) {
    console.error('Quick-add error:', error)
    return NextResponse.json(
      { error: 'Failed to process quick-add request' },
      { status: 500 }
    )
  }
}
