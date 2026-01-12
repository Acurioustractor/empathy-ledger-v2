import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStatus() {
  // Check quality of existing analyses
  const { data: analyses } = await supabase
    .from('transcript_analysis_results')
    .select('id, themes, quotes, created_at')
    .order('created_at', { ascending: false })

  if (!analyses) {
    console.log('No analyses found')
    return
  }

  const withThemes = analyses.filter(a => a.themes && a.themes.length > 0)
  const withQuotes = analyses.filter(a => a.quotes && a.quotes.length > 0)
  const empty = analyses.filter(a => {
    const noThemes = a.themes === null || a.themes.length === 0
    const noQuotes = a.quotes === null || a.quotes.length === 0
    return noThemes && noQuotes
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('EXISTING ANALYSIS QUALITY CHECK')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('Total analyses:', analyses.length)
  console.log('With themes:', withThemes.length)
  console.log('With quotes:', withQuotes.length)
  console.log('Empty (no themes or quotes):', empty.length)
  console.log('')
  console.log('Latest 5 analyses:')
  analyses.slice(0, 5).forEach(a => {
    const themeCount = a.themes ? a.themes.length : 0
    const quoteCount = a.quotes ? a.quotes.length : 0
    console.log('  ', a.created_at.substring(0, 16), '- themes:', themeCount, ', quotes:', quoteCount)
  })

  // What still needs analysis?
  const { data: analyzed } = await supabase
    .from('transcript_analysis_results')
    .select('transcript_id')

  const analyzedIds = new Set((analyzed || []).map(a => a.transcript_id))

  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id')
    .not('transcript_content', 'is', null)

  const unanalyzed = (transcripts || []).filter(t => {
    return analyzedIds.has(t.id) === false
  })

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('REMAINING WORK')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('Transcripts with content:', (transcripts || []).length)
  console.log('Already analyzed:', (analyzed || []).length)
  console.log('Still need analysis:', unanalyzed.length)
  console.log('')
  console.log('Estimated cost for remaining: USD', (unanalyzed.length * 0.03).toFixed(2))
  console.log('Estimated time:', Math.round(unanalyzed.length * 1.2), 'minutes')
}

checkStatus()
