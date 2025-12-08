import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function seedHomesteadInterview() {
  const supabase = createServiceRoleClient()

  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820' // The Homestead
  const organizationId = 'c53077e1-98de-4216-9149-6268891ff62e' // Oonchiumpa

  const interviewData = {
    // Core Project Information
    projectName: "The Homestead Restoration",

    projectDescription: `Restoration of a homestead returned to the Bloomfield family through native title. The family received a $100,000 grant through Ingerika Services for roof repairs damaged by termites. Previous contractors deemed the project "impossible" or recommended demolition. The project involves working alongside the Bloomfield family in a collaborative cultural exchange to restore a place with a sobering past of exclusion, now transforming it into a foundation for the family's future.`,

    // Project Context & History
    background: `The Bloomfield family recently received native title to this homestead, which has a sobering past as a place that involved exclusion of the family. Ingerika Services, an Aboriginal-controlled organization, helped the family apply for a $100,000 grant approximately 3-5 years ago to address termite damage to the roof. Multiple contractors visited and declared the project impossible or recommended demolition. The building has been deemed uninhabitable by a building engineer, though an asbestos report provided helpful safety mapping.`,

    // Geographic & Environmental Context
    location: "250km east of Alice Springs (80-100km bitumen, rest off-road), extremely remote with no nearby infrastructure",

    environmentalConditions: `Extremely hot conditions (30-50°C expected), very remote location, basic amenities available (former donger cells with beds, toilets, showers), Starlink connectivity available, generators for power (main board needs hookup), nearest homestead with WiFi is 30 minutes away`,

    // Key Stakeholders
    stakeholders: `
    - Bloomfield Family: Traditional owners receiving native title, large extended family (potentially 5-50 members participating)
    - Ingerika Services: Aboriginal-controlled organization supporting homeland maintenance
    - Restoration Team: 7-person skilled team from Brisbane (Ross, Mitch, Nick, Rylan, Jimmy, James, Ben)
    - Royal Flying Doctor Service paramedic joining the project
    `,

    // Success Criteria & Goals
    successCriteria: `
    PRIMARY GOALS:
    1. Make the site clean and safe (family helping with debris removal)
    2. Remove broken asbestos from tiles at front and back of building
    3. Rebuild termite-damaged roof structure (pink section completely destroyed, green section partially damaged)
    4. Clad fire-damaged shed to create undercover workspace

    SECONDARY GOALS (if time allows):
    5. Strengthen roof structure in additional areas
    6. Add external doors to achieve lock-up stage
    7. Install simple lighting (LED panels inside, festoon lights for outdoor areas)

    CULTURAL GOALS:
    - Honor and restore the homestead while acknowledging its difficult past
    - Create meaningful cultural exchange between restoration team and Bloomfield family
    - Support family's long-term vision for the property
    - Build family capacity for future maintenance and projects
    `,

    // Specific Challenges
    challenges: `
    STRUCTURAL:
    - Pink section of roof completely destroyed by white ants
    - Green section has partial termite damage (hardwood roof structure on one side intact, ceiling battens eaten on other)
    - Building currently uninhabitable
    - Mud brick/rammed earth walls
    - Fire-damaged shed needs cladding

    ENVIRONMENTAL:
    - Extreme heat (high 30s to high 50s°C)
    - Heavy fly presence
    - No running power currently
    - 3-hour drive from Alice Springs on mostly off-road terrain
    - Remote location with limited immediate support

    SAFETY:
    - Asbestos present in multiple locations (mapped in safety report):
      * Yellow sections: bathroom areas (out of scope)
      * Lintel plates above windows (intact, not touching)
      * Oven flute (keeping intact, working around)
      * Back room with 6mm fibro (collapsed ceiling)
      * Front and back rooms with thin asbestos tiles on concrete (removable with paint scraper)
    - Heat management for workers
    - Working at heights on damaged roof structure

    LOGISTICAL:
    - Limited accommodation (0.5 star, donger cells)
    - Battery limitations for power tools (2 per person on flights = 14 total)
    - Material transport to remote location
    - Uncertainty around family participation numbers
    - Potential need for night work to avoid extreme daytime heat
    `,

    // Project Scope Details
    scopeDetails: `
    PHASE 1 - SAFETY & PREPARATION:
    - Clean and secure site with family assistance
    - Remove broken asbestos tiles from front and back rooms (thin tiles on concrete, removable with scraper)
    - Set up generator and power distribution
    - Clad fire-damaged shed for undercover workspace

    PHASE 2 - STRUCTURAL REPAIRS:
    - Build temporary bracing under damaged sections
    - Remove existing roof sheets (mixture of screws and nails)
    - Assess actual termite damage once sheets removed
    - Rebuild pink section roof structure (completely destroyed)
    - Repair green section roof structure (partial damage)
    - Install new roof battens and sheets ($8K materials already ordered)

    PHASE 3 - FINISHING (if time allows):
    - Add roof strengthening in additional areas
    - Install 3 external doors for lock-up stage
    - Install LED panel lighting inside (bouncing off exposed roof structure)
    - Hang festoon lights in outdoor areas

    OUT OF SCOPE:
    - Yellow asbestos bathroom areas (not touching)
    - Oven flute asbestos (keeping in place, working around)
    - Window lintel plates with asbestos (intact, leaving alone)
    - Electrical wiring to the building
    - Full interior finishing
    `,

    // Resource Requirements
    resources: `
    MATERIALS ORDERED ($8K):
    - Timber for roof structure (with extras for bracing)
    - 37-meter top hats for roof structure
    - New roof sheets
    - Roof battens
    - Screws and fasteners

    TOOLS & EQUIPMENT:
    - 14 batteries (2 per team member via flights)
    - 3 sets Makita drills, impact drivers, grinders, circular saws
    - Additional tools to purchase and donate ($2K budget): pinch bars, larger hammers, PPE
    - Rental needs: compound mitre saw, trestles, potentially trailer
    - Hand tools (each team member bringing their own)
    - Work lights for potential night work
    - Fly nets (often sold out, need to source)

    ACCOMMODATION & FACILITIES:
    - Former donger cells with 2 single beds each (4-5 rooms total)
    - Basic toilets and showers
    - Dining area
    - Old generator to reconnect + 3 other working generators
    - Window box air conditioners (10 amp leads)
    - Starlink for internet

    TRANSPORTATION:
    - Team flying Brisbane to Alice Springs
    - Luggage: 23kg checked bag per person included + 32kg additional bags available
    - Road transport: 250km from Alice (80-100km bitumen, rest off-road)
    - Potential day trip back to Alice for supplies if needed
    `,

    // Timeline & Schedule
    timeline: `
    DURATION: 7 days planned on-site

    WORK SCHEDULE: Flexible based on heat
    - Option 1: Early morning start (5am) until heat peaks, resume evening
    - Option 2: Split shift (5-10am, evening continuation)
    - Option 3: Night work with proper lighting once roof removed and site clean
    - Safety consideration: Avoid roof work in darkness initially

    COMPENSATION: 140/hour, 10-hour days, 7 days (flexible based on actual completion)

    TEAM ARRIVAL:
    - Sunday: Ross, Mitch, Nick arrive Alice Springs, stay in town
    - Monday: Full team heads to homestead
    - Flexible end date based on completion (may finish early and spend time in Alice)
    `,

    // Cultural Considerations
    culturalContext: `
    SIGNIFICANCE:
    - Homestead represents both difficult past (exclusion) and hopeful future
    - Family gathering and cultural event for Bloomfield family
    - Only white people present will be the restoration team
    - Project is as much about cultural exchange as construction
    - Building family capacity for future projects

    APPROACH:
    - Work alongside family, not as separate "expert" contractors
    - Family providing catering and accommodation support
    - Respectful acknowledgment of land's history
    - Building long-term relationships beyond this single project
    - Family familiar with working in extreme heat without sunscreen
    - Team members as "outsiders" being welcomed into family space

    EXPECTATIONS:
    - "Dream team" atmosphere: hot, supporting, fun, safe
    - Not thrashing ourselves despite challenging conditions
    - 95% laughter and connection would be considered success
    - Cultural enlightenment and relationship building as valuable as construction progress
    - Leaving tools and skills with family for future projects
    `,

    // Expected Outcomes
    expectedOutcomes: `
    CONSTRUCTION:
    - Restored, weatherproof roof structure
    - Safe, asbestos-free living spaces
    - Undercover outdoor workspace (cladded shed)
    - Basic lighting for celebration and use
    - Potentially lock-up stage with external doors

    CAPACITY BUILDING:
    - Family with tools and skills for future maintenance ($2K donated tools)
    - Established relationships for ongoing support
    - Demonstrated that "impossible" projects are achievable
    - Platform for family to continue developing the homestead

    CULTURAL:
    - Meaningful cultural exchange and relationships
    - 65 new friends in Alice Springs region
    - Team members culturally enlightened and enriched
    - Celebration and honoring of the land and its transformation
    - Documentation of the restoration process
    `,

    // Safety Protocols
    safetyProtocols: `
    HEAT MANAGEMENT:
    - Flexible work schedule (early morning/evening/night options)
    - Proper hydration (paramedic on-site throughout)
    - Shade structures (tarps over work areas if needed)
    - Regular breaks during extreme heat

    ASBESTOS SAFETY:
    - Professional asbestos report mapping all locations
    - Clear zones: Yellow (do not touch), specific removal areas only
    - Proper PPE for asbestos removal (paint scraper removal of tiles)
    - Wet down methods for broken asbestos
    - Keeping intact asbestos (lintel plates, oven flute) undisturbed

    STRUCTURAL SAFETY:
    - Temporary bracing before roof removal
    - Assessment from ground before climbing damaged sections
    - Proper fall protection when working at heights
    - Careful assessment after removing sheets to check termite damage

    GENERAL:
    - Paramedic present full-time (Royal Flying Doctor Service)
    - Principal contractor paperwork signed
    - PPE including fly nets
    - Emergency evacuation plan (3-hour drive to Alice)
    - Day-trip supply run option if needed
    `,

    // Project Philosophy
    philosophy: `This project embodies reconciliation through action. Rather than accepting that the homestead should be demolished, we're demonstrating that with proper resources, skills, and most importantly respect and partnership, restoration is possible. The project acknowledges the difficult history while building toward a hopeful future. Success is measured not just in square meters of roof replaced, but in relationships built, skills transferred, and the transformation of a place of exclusion into a foundation for family strength. The extreme conditions - heat, flies, isolation - are part of the authentic experience of working on country, and managing them together builds the bonds that make the project meaningful beyond its construction outcomes.`,

    // Additional Notes
    additionalNotes: `
    - Budget remaining allows for supplies, tools, and contingencies
    - Family has been preparing site (debris removal) before team arrival
    - Homestead used to have ceiling panels throughout (now collapsed from termite damage to battens)
    - Dining room has good example of potential lighting - masonite brown sheets allowing light through
    - External walls are mud brick/rammed earth and structurally sound
    - Some afternoon storms experienced recently in the area
    - Team considering custom shirts for trip (Alice 2025)
    - Potential for work to only take 5 days with 3 days for cultural activities
    - If completion faster than expected, team can explore Alice Springs area
    - Washing machines available (reference to "orange trucks" - inside joke about team member's background)
    `
  }

  console.log('📝 Submitting seed interview for The Homestead project...\n')

  // Format as the seed interview expects
  const formattedInterview = `
# The Homestead Restoration - Seed Interview

## Project Overview
${interviewData.projectDescription}

## Background & History
${interviewData.background}

## Location & Environment
**Location:** ${interviewData.location}

**Environmental Conditions:**
${interviewData.environmentalConditions}

## Key Stakeholders
${interviewData.stakeholders}

## Success Criteria & Goals
${interviewData.successCriteria}

## Challenges
${interviewData.challenges}

## Detailed Scope
${interviewData.scopeDetails}

## Resources Required
${interviewData.resources}

## Timeline & Schedule
${interviewData.timeline}

## Cultural Context & Significance
${interviewData.culturalContext}

## Expected Outcomes
${interviewData.expectedOutcomes}

## Safety Protocols
${interviewData.safetyProtocols}

## Project Philosophy
${interviewData.philosophy}

## Additional Notes
${interviewData.additionalNotes}
`

  // Save to project context
  const { data: existingContext } = await supabase
    .from('project_contexts')
    .select('id')
    .eq('project_id', projectId)
    .single()

  if (existingContext) {
    // Update existing context
    const { error: updateError } = await supabase
      .from('project_contexts')
      .update({
        seed_interview: formattedInterview,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)

    if (updateError) {
      console.error('❌ Error updating project context:', updateError)
      throw updateError
    }

    console.log('✅ Updated existing project context with seed interview')
  } else {
    // Create new context
    const { error: insertError } = await supabase
      .from('project_contexts')
      .insert({
        project_id: projectId,
        organization_id: organizationId,
        seed_interview: formattedInterview,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ Error creating project context:', insertError)
      throw insertError
    }

    console.log('✅ Created new project context with seed interview')
  }

  console.log('\n📊 Seed Interview Summary:')
  console.log(`- Project: The Homestead`)
  console.log(`- Organization: Oonchiumpa`)
  console.log(`- Interview Length: ${formattedInterview.length} characters`)
  console.log(`- Sections: Background, Location, Stakeholders, Success Criteria, Challenges, Scope, Resources, Timeline, Cultural Context, Outcomes, Safety, Philosophy`)

  console.log('\n✨ Seed interview successfully saved to project context!')
  console.log('\nNext steps:')
  console.log('1. Visit the project page to view the seed interview')
  console.log('2. Run analysis to generate project outcomes based on this context')
  console.log('3. Start tracking progress against the defined success criteria')
}

seedHomesteadInterview().catch(console.error)
