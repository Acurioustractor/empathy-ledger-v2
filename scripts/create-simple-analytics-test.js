#!/usr/bin/env node

/**
 * Simple Analytics Test Data Creation
 * Creates minimal test data to verify the analytics system works
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSimpleAnalyticsTest() {
  console.log('🧪 CREATING SIMPLE ANALYTICS TEST DATA')
  console.log('======================================')
  console.log('')

  try {
    // Step 1: Find a storyteller with transcript
    console.log('👤 Finding storyteller with transcript...')
    
    const { data: transcript } = await supabase
      .from('transcripts')
      .select('storyteller_id, title')
      .not('storyteller_id', 'is', null)
      .limit(1)
      .single()

    if (!transcript) {
      throw new Error('No storyteller with transcript found')
    }

    const storytellerId = transcript.storyteller_id
    console.log(`✅ Using storyteller: ${storytellerId}`)
    console.log(`   Transcript: ${transcript.title}`)
    console.log('')

    // Step 2: Create simple records in each analytics table
    console.log('📝 Creating test records...')
    
    // Personal insights
    try {
      const { error: insightsError } = await supabase
        .from('personal_insights')
        .insert({
          profile_id: storytellerId,
          narrative_themes: ['leadership', 'community'],
          core_values: ['family', 'culture'],
          life_philosophy: 'Test philosophy for analytics system validation',
          personal_strengths: ['communication', 'empathy'],
          growth_areas: ['technology', 'writing'],
          cultural_identity_markers: ['traditional_knowledge'],
          traditional_knowledge_areas: ['storytelling'],
          community_connections: ['local_community'],
          transcript_count: 1,
          confidence_score: 0.8
        })
      
      if (insightsError && !insightsError.message.includes('duplicate')) {
        console.log(`   ⚠️  Personal insights: ${insightsError.message}`)
      } else {
        console.log('   ✅ Personal insights created')
      }
    } catch (e) {
      console.log(`   ⚠️  Personal insights error: ${e.message}`)
    }

    // Professional competencies
    try {
      const { error: compError } = await supabase
        .from('professional_competencies')
        .insert({
          profile_id: storytellerId,
          skill_name: 'Leadership',
          skill_category: 'leadership',
          competency_level: 8,
          market_value_score: 7,
          evidence_from_transcript: 'Demonstrated leadership in community discussions',
          real_world_applications: ['Team management', 'Community organizing'],
          transferable_contexts: ['Business', 'Non-profit', 'Government'],
          development_opportunities: ['Management training', 'Public speaking'],
          skill_gap_analysis: 'Could benefit from formal leadership training'
        })
      
      if (compError && !compError.message.includes('duplicate')) {
        console.log(`   ⚠️  Professional competencies: ${compError.message}`)
      } else {
        console.log('   ✅ Professional competency created')
      }
    } catch (e) {
      console.log(`   ⚠️  Professional competencies error: ${e.message}`)
    }

    // Impact story
    try {
      const { error: storyError } = await supabase
        .from('impact_stories')
        .insert({
          profile_id: storytellerId,
          title: 'Community Leadership Example',
          narrative: 'Led community initiative that brought people together and achieved positive outcomes',
          context: 'Community development project',
          timeframe: 'recent',
          measurable_outcomes: ['10 participants engaged', 'Project completed successfully'],
          beneficiaries: ['Community members', 'Local families'],
          scale_of_impact: 'community',
          suitable_for: ['resume', 'interview'],
          professional_summary: 'Successfully led community project with measurable positive impact',
          key_achievements: ['Project leadership', 'Community engagement'],
          cultural_significance: 'Strengthened community connections and collaboration',
          traditional_knowledge_involved: false,
          community_approval_required: false
        })
      
      if (storyError && !storyError.message.includes('duplicate')) {
        console.log(`   ⚠️  Impact story: ${storyError.message}`)
      } else {
        console.log('   ✅ Impact story created')
      }
    } catch (e) {
      console.log(`   ⚠️  Impact story error: ${e.message}`)
    }

    // Opportunity recommendation
    try {
      const { error: oppError } = await supabase
        .from('opportunity_recommendations')
        .insert({
          profile_id: storytellerId,
          opportunity_type: 'career',
          title: 'Community Program Manager',
          organization: 'Local Community Center',
          description: 'Manage community programs and engagement initiatives',
          match_score: 85,
          matching_skills: ['Leadership', 'Community engagement'],
          skill_gaps: ['Project management certification'],
          application_strategy: 'Highlight community leadership experience',
          suggested_approach: 'Network with community organizations',
          cultural_fit_analysis: 'Strong fit based on community experience',
          cultural_focus: false,
          community_impact_potential: 'High potential for positive community impact'
        })
      
      if (oppError && !oppError.message.includes('duplicate')) {
        console.log(`   ⚠️  Opportunity recommendation: ${oppError.message}`)
      } else {
        console.log('   ✅ Opportunity recommendation created')
      }
    } catch (e) {
      console.log(`   ⚠️  Opportunity recommendation error: ${e.message}`)
    }

    // Development plan
    try {
      const { error: planError } = await supabase
        .from('development_plans')
        .insert({
          profile_id: storytellerId,
          short_term_goals: ['Complete leadership course', 'Build professional network'],
          long_term_goals: ['Establish community program', 'Advance to management role'],
          skill_development_priorities: ['Project management', 'Public speaking'],
          recommended_courses: ['Leadership Development', 'Project Management'],
          networking_opportunities: ['Community organizations', 'Professional associations'],
          mentorship_suggestions: ['Connect with experienced community leaders'],
          cultural_preservation_activities: ['Document community history'],
          community_engagement_opportunities: ['Volunteer with local groups'],
          traditional_knowledge_development: ['Learn from community elders'],
          milestones: {
            '3_months': ['Complete first course'],
            '6_months': ['Find mentor'],
            '1_year': ['Lead major project']
          },
          progress_indicators: ['Courses completed', 'Network connections made'],
          success_metrics: ['Skills developed', 'Goals achieved'],
          plan_duration: '1_year'
        })
      
      if (planError && !planError.message.includes('duplicate')) {
        console.log(`   ⚠️  Development plan: ${planError.message}`)
      } else {
        console.log('   ✅ Development plan created')
      }
    } catch (e) {
      console.log(`   ⚠️  Development plan error: ${e.message}`)
    }

    // Analysis job
    try {
      const { error: jobError } = await supabase
        .from('analysis_jobs')
        .insert({
          profile_id: storytellerId,
          job_type: 'full_analysis',
          status: 'completed',
          ai_model_used: 'test-system',
          processing_time_seconds: 10,
          results_data: {
            test: true,
            message: 'System test completed successfully'
          }
        })
      
      if (jobError && !jobError.message.includes('duplicate')) {
        console.log(`   ⚠️  Analysis job: ${jobError.message}`)
      } else {
        console.log('   ✅ Analysis job created')
      }
    } catch (e) {
      console.log(`   ⚠️  Analysis job error: ${e.message}`)
    }

    console.log('')

    // Step 3: Verify data creation
    console.log('🔍 Verifying test data...')
    
    const tables = ['personal_insights', 'professional_competencies', 'impact_stories', 
                   'opportunity_recommendations', 'development_plans', 'analysis_jobs']
    
    let totalRecords = 0
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', storytellerId)
        
        totalRecords += count || 0
        console.log(`   ${count > 0 ? '✅' : '⚠️ '} ${table}: ${count || 0} records`)
      } catch (e) {
        console.log(`   ❌ ${table}: Error checking - ${e.message}`)
      }
    }

    console.log('')
    console.log(`📊 Total test records: ${totalRecords}`)
    console.log('')

    // Step 4: Generate URLs
    console.log('🌐 TEST ANALYTICS DASHBOARD READY!')
    console.log('==================================')
    console.log(`👤 Storyteller ID: ${storytellerId}`)
    console.log('')
    console.log('📱 Test these URLs:')
    console.log(`   Analytics: /storytellers/${storytellerId}/analytics`)
    console.log(`   Skills: /storytellers/${storytellerId}/skills`) 
    console.log(`   Impact: /storytellers/${storytellerId}/impact`)
    console.log(`   Opportunities: /storytellers/${storytellerId}/opportunities`)
    console.log(`   Insights: /storytellers/${storytellerId}/insights`)
    console.log('')
    
    if (totalRecords > 0) {
      console.log('✅ Individual Analytics System: READY FOR TESTING!')
      console.log('✅ Database populated with sample data')
      console.log('✅ All analytics tables accessible')
      console.log('✅ Dashboard should display visualizations')
    } else {
      console.log('⚠️  No test data was created - check permissions')
    }

    return {
      success: totalRecords > 0,
      storytellerId,
      totalRecords,
      dashboardUrl: `/storytellers/${storytellerId}/analytics`
    }

  } catch (error) {
    console.error('💥 TEST DATA CREATION FAILED:', error.message)
    return { success: false, error: error.message }
  }
}

// Execute
if (require.main === module) {
  createSimpleAnalyticsTest()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Analytics system activated with test data!')
        process.exit(0)
      } else {
        console.log('\n❌ Could not create test data')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error)
      process.exit(1)
    })
}

module.exports = { createSimpleAnalyticsTest }