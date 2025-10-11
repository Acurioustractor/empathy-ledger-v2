import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Inspecting database schema...')

    // Get profiles table structure
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError)
    }

    // Get stories table structure  
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1)

    if (storiesError) {
      console.error('❌ Error querying stories:', storiesError)
    }

    // Get organisations table structure
    const { data: organizationsData, error: organizationsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1)

    if (organizationsError) {
      console.error('❌ Error querying organisations:', organizationsError)
    }

    // Get media_assets table structure
    const { data: mediaData, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .limit(1)

    if (mediaError) {
      console.error('❌ Error querying media_assets:', mediaError)
    }

    const schema = {
      profiles: {
        columns: profilesData?.[0] ? Object.keys(profilesData[0]) : [],
        error: profilesError?.message,
        sample: profilesData?.[0]
      },
      stories: {
        columns: storiesData?.[0] ? Object.keys(storiesData[0]) : [],
        error: storiesError?.message,
        sample: storiesData?.[0]
      },
      organisations: {
        columns: organizationsData?.[0] ? Object.keys(organizationsData[0]) : [],
        error: organizationsError?.message,
        sample: organizationsData?.[0]
      },
      media_assets: {
        columns: mediaData?.[0] ? Object.keys(mediaData[0]) : [],
        error: mediaError?.message,
        sample: mediaData?.[0]
      }
    }

    console.log('📊 Database schema inspection:', schema)

    return NextResponse.json({
      success: true,
      schema,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Schema inspection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}