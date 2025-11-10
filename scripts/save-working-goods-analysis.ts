/**
 * Save the WORKING GOODS analysis to database
 * This analysis has 3 GOODS quotes out of 20 total
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
)

async function saveAnalysis() {
  console.log('📦 Loading working GOODS analysis from file...\n')

  const analysisData = JSON.parse(
    fs.readFileSync('/tmp/goods-fresh-analysis.json', 'utf-8')
  )

  const intelligentAnalysis = analysisData.intelligentAnalysis
  const quotes = intelligentAnalysis.all_quotes || []

  console.log(`✅ Loaded analysis:`)
  console.log(`   Total quotes: ${quotes.length}`)

  const goodsQuotes = quotes.filter((q: any) =>
    ['bed', 'sleep', 'hygiene', 'washing', 'dignity', 'morale'].some(k =>
      q.text.toLowerCase().includes(k)
    )
  )

  console.log(`   GOODS quotes: ${goodsQuotes.length}`)
  console.log(`\n💬 GOODS quotes that will be saved:\n`)
  goodsQuotes.forEach((q: any, i: number) => {
    console.log(`${i + 1}. "${q.text}"`)
    console.log(`   — ${q.storyteller}\n`)
  })

  console.log('💾 Saving to database...\n')

  const { error } = await supabase
    .from('project_analyses')
    .upsert({
      project_id: '6bd47c8a-e676-456f-aa25-ddcbb5a31047',
      analysis_type: 'intelligent_ai',
      model_used: 'gpt-4o-mini',
      content_hash: 'goods-fixed-analysis-' + Date.now(),
      analysis_data: analysisData,
      analyzed_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  console.log('✅ Analysis saved to database!')
  console.log('\n📖 Open frontend to view:')
  console.log('   http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis')
  console.log('\n🎯 You should see:')
  console.log('   - 20 total quotes')
  console.log('   - 3 GOODS-specific quotes about beds, washing, sleep')
  console.log('   - Annie Morrison, Walter, Gloria as speakers')
}

saveAnalysis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
