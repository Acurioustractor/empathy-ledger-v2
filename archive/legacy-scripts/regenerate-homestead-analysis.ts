import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function regenerateHomesteadAnalysis() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820' // The Homestead

  console.log('🗑️  Clearing existing analysis cache...\n')

  // Delete existing analysis
  const { error: deleteError } = await supabase
    .from('project_analyses')
    .delete()
    .eq('project_id', projectId)

  if (deleteError) {
    console.error('❌ Error deleting analysis:', deleteError.message)
    return
  }

  console.log('✅ Cleared existing analysis cache')
  console.log('\n🔄 Now triggering fresh analysis with Ollama intelligent AI...\n')

  // Trigger new analysis using configured LLM provider with intelligent AI
  // 20-minute timeout for Ollama analysis + AI-based outcome matching
  const response = await fetch(`http://localhost:3030/api/projects/${projectId}/analysis?intelligent=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(1200000) // 20 minutes
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Analysis request failed:', response.status, error)
    return
  }

  const result = await response.json()

  console.log('✅ Analysis completed!\n')
  console.log('📊 Analysis Summary:')
  console.log('- Overall Impact:', result.overall_impact_score?.toFixed(1) + '%' || 'N/A')
  console.log('- Cultural Authenticity:', result.cultural_authenticity_score?.toFixed(1) + '%' || 'N/A')
  console.log('- Community Engagement:', result.community_engagement_score?.toFixed(1) + '%' || 'N/A')
  console.log('- Total Insights:', result.insights?.length || 0)
  console.log('- Total Quotes:', result.representative_quotes?.length || 0)
  console.log('- AI Model Used:', result.ai_model_used || 'Unknown')

  console.log('\n🌐 View full analysis at:')
  console.log('http://localhost:3030/organisations/c53077e1-98de-4216-9149-6268891ff62e/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/analysis')
}

regenerateHomesteadAnalysis().catch(console.error)
