#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function populateLocationsAndConnections() {
  console.log('🏗️ Starting locations population process...')
  
  try {
    // Step 1: Create location records from organizations and common locations
    const locationData = [
      // From organizations
      { name: 'Palm Island', city: 'Palm Island', state: 'Queensland', country: 'Australia' },
      { name: 'Winnipeg', city: 'Winnipeg', state: 'Manitoba', country: 'Canada' },
      { name: 'Traditional Territory', city: null, state: null, country: 'Indigenous Territory' },
      { name: 'Katherine', city: 'Katherine', state: 'Northern Territory', country: 'Australia' },
      
      // From storyteller bios
      { name: 'Tennant Creek', city: 'Tennant Creek', state: 'Northern Territory', country: 'Australia' },
      { name: 'Mackay', city: 'Mackay', state: 'Queensland', country: 'Australia' },
      { name: 'Cairns', city: 'Cairns', state: 'Queensland', country: 'Australia' },
      { name: 'Melbourne', city: 'Melbourne', state: 'Victoria', country: 'Australia' },
      { name: 'Northern Territory', city: null, state: 'Northern Territory', country: 'Australia' },
      { name: 'Queensland', city: null, state: 'Queensland', country: 'Australia' },
      
      // Additional Indigenous locations mentioned
      { name: 'Barkly Region', city: 'Tennant Creek', state: 'Northern Territory', country: 'Australia' },
      { name: 'Rockinghills Dam Station', city: null, state: 'Northern Territory', country: 'Australia' },
      { name: 'Yarrabah', city: 'Yarrabah', state: 'Queensland', country: 'Australia' },
      { name: 'Wulgurukaba Country', city: 'Palm Island', state: 'Queensland', country: 'Australia' }
    ]

    // Insert locations (ignore conflicts for existing ones)
    console.log('📍 Creating location records...')
    
    // First, try to insert each location individually to avoid constraint issues
    let insertedCount = 0
    for (const location of locationData) {
      const { error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single()
      
      if (!error) {
        insertedCount++
      } else if (error.code !== '23505') { // Ignore duplicate key errors
        console.warn(`Could not insert location ${location.name}:`, error.message)
      }
    }

    console.log(`✅ Inserted ${insertedCount} new location records (duplicates ignored)`)

    // Step 2: Get all locations for mapping
    const { data: allLocations, error: fetchError } = await supabase
      .from('locations')
      .select('*')

    if (fetchError) {
      console.error('Error fetching locations:', fetchError)
      return
    }

    console.log(`📍 Found ${allLocations.length} locations in database`)

    // Step 3: Get all profiles and create connections
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        bio,
        tenant:tenants!left(
          organization:organizations!left(
            id,
            name,
            location
          )
        )
      `)

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return
    }

    console.log(`👥 Processing ${profiles.length} profiles for location connections...`)

    // Step 4: Create profile-location connections
    const profileLocationConnections = []
    
    for (const profile of profiles) {
      let locationAssigned = false
      
      // Try organization location first
      if (profile.tenant?.organization?.location && !locationAssigned) {
        const orgLocation = profile.tenant.organization.location
        let matchedLocation = null
        
        // Find matching location
        if (orgLocation.includes('Palm Island')) {
          matchedLocation = allLocations.find(l => l.name === 'Palm Island')
        } else if (orgLocation.includes('Winnipeg')) {
          matchedLocation = allLocations.find(l => l.name === 'Winnipeg')
        } else if (orgLocation.includes('Traditional Territory')) {
          matchedLocation = allLocations.find(l => l.name === 'Traditional Territory')
        }
        
        if (matchedLocation) {
          profileLocationConnections.push({
            profile_id: profile.id,
            location_id: matchedLocation.id,
            is_primary: true,
            location_type: 'organization_base'
          })
          locationAssigned = true
        }
      }
      
      // Try bio location extraction
      if (profile.bio && !locationAssigned) {
        const bio = profile.bio.toLowerCase()
        let matchedLocation = null
        
        // Direct location mentions
        if (bio.includes('location: darwin')) {
          matchedLocation = allLocations.find(l => l.name === 'Darwin')
        } else if (bio.includes('location: stradbroke island')) {
          matchedLocation = allLocations.find(l => l.name === 'Brisbane') // Stradbroke Island is near Brisbane
        } else if (bio.includes('katherine')) {
          matchedLocation = allLocations.find(l => l.name === 'Katherine')
        } else if (bio.includes('tennant creek') || bio.includes('barkly region')) {
          matchedLocation = allLocations.find(l => l.name === 'Tennant Creek')
        } else if (bio.includes('palm island')) {
          matchedLocation = allLocations.find(l => l.name === 'Palm Island')
        } else if (bio.includes('mackay') && bio.includes('queensland')) {
          matchedLocation = allLocations.find(l => l.name === 'Mackay')
        } else if (bio.includes('yarrabah')) {
          matchedLocation = allLocations.find(l => l.name === 'Yarrabah')
        } else if (bio.includes('hobart')) {
          matchedLocation = allLocations.find(l => l.name === 'Hobart')
        } else if (bio.includes('mount isa')) {
          matchedLocation = allLocations.find(l => l.name === 'Townsville') // Mount Isa is in Queensland near Townsville
        } else if (bio.includes('adelaide')) {
          matchedLocation = allLocations.find(l => l.name === 'Adelaide')
        } else if (bio.includes('northern territory')) {
          matchedLocation = allLocations.find(l => l.name === 'Northern Territory')
        } else if (bio.includes('queensland')) {
          matchedLocation = allLocations.find(l => l.name === 'Queensland')
        }
        
        if (matchedLocation) {
          profileLocationConnections.push({
            profile_id: profile.id,
            location_id: matchedLocation.id,
            is_primary: true,
            location_type: 'mentioned_in_bio'
          })
          locationAssigned = true
        }
      }
      
      // Default location for email domains
      if (!locationAssigned) {
        let matchedLocation = null
        
        if (profile.email && profile.email.includes('@')) {
          const email = profile.email.toLowerCase()
          if (email.includes('snowfoundation.org')) {
            matchedLocation = allLocations.find(l => l.name === 'Winnipeg')
          } else if (email.includes('curioustractor.org')) {
            // A Curious Tractor - assume Traditional Territory
            matchedLocation = allLocations.find(l => l.name === 'Traditional Territory')
          } else if (email.includes('empathyledger.temp')) {
            // Deadly Hearts project storytellers from Katherine
            matchedLocation = allLocations.find(l => l.name === 'Katherine')
          }
        }
        
        if (matchedLocation) {
          profileLocationConnections.push({
            profile_id: profile.id,
            location_id: matchedLocation.id,
            is_primary: true,
            location_type: 'inferred_from_email'
          })
          locationAssigned = true
        }
      }
    }

    console.log(`🔗 Creating ${profileLocationConnections.length} profile-location connections...`)

    // Insert profile-location connections
    if (profileLocationConnections.length > 0) {
      let connectionInsertedCount = 0
      for (const connection of profileLocationConnections) {
        const { error } = await supabase
          .from('profile_locations')
          .insert(connection)
          .select()
          .single()
          
        if (!error) {
          connectionInsertedCount++
        } else if (error.code !== '23505') { // Ignore duplicate key errors
          console.warn(`Could not create profile-location connection:`, error.message)
        }
      }

      console.log(`✅ Created ${connectionInsertedCount} new profile-location connections (duplicates ignored)`)
    }

    // Step 5: Verify results
    const { data: connectionCount, error: countError } = await supabase
      .from('profile_locations')
      .select('id', { count: 'exact', head: true })

    if (!countError) {
      console.log(`✅ Total profile-location connections: ${connectionCount}`)
    }

    // Sample verification
    const { data: sampleConnections, error: sampleError } = await supabase
      .from('profile_locations')
      .select(`
        profile:profiles!inner(email, display_name),
        location:locations!inner(name, city, state),
        location_type,
        is_primary
      `)
      .limit(10)

    if (!sampleError && sampleConnections) {
      console.log('\n📋 Sample profile-location connections:')
      sampleConnections.forEach(conn => {
        console.log(`  ${conn.profile.display_name} (${conn.profile.email}) -> ${conn.location.name}, ${conn.location.city} [${conn.location_type}]`)
      })
    }

    console.log('\n🎉 Location population completed successfully!')

  } catch (error) {
    console.error('❌ Error in location population:', error)
  }
}

populateLocationsAndConnections()