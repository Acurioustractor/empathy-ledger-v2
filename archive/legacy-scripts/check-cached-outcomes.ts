import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function check() {
  const { data, error } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.log('❌ No cached analysis found')
    return
  }

  const analysisData = data.analysis_data as any
  const aggregatedInsights = analysisData?.aggregatedInsights || {}

  console.log('📊 Cached Analysis Check:\n')
  console.log(`Cached at: ${data.analyzed_at}`)
  console.log(`Model: ${data.model_used}\n`)

  console.log(`projectOutcomes in aggregatedInsights: ${aggregatedInsights.projectOutcomes?.length || 0}`)
  console.log(`outcomesSummary in aggregatedInsights: ${aggregatedInsights.outcomesSummary ? 'YES' : 'NO'}\n`)

  if (aggregatedInsights.projectOutcomes && aggregatedInsights.projectOutcomes.length > 0) {
    console.log('✅ OUTCOMES IN CACHE:\n')
    aggregatedInsights.projectOutcomes.slice(0, 3).forEach((o: any, i: number) => {
      console.log(`${i + 1}. ${o.category}: ${o.evidence_count} quotes (${o.confidence}/100)`)
    })
  } else {
    console.log('❌ NO OUTCOMES IN CACHED DATA')
  }
}

check()
