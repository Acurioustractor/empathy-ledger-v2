import { execSync } from 'child_process'
import * as fs from 'fs'

/**
 * Analyze profiles queries to determine which need migration
 *
 * Categories:
 * 1. KEEP - Auth, user settings, org members (correct to use profiles)
 * 2. MIGRATE - Storyteller displays, galleries (should use storytellers)
 * 3. REVIEW - Ambiguous cases that need manual review
 */

interface QueryLocation {
  file: string
  line: number
  context: string
  category: 'KEEP' | 'MIGRATE' | 'REVIEW'
  reason: string
}

const KEEP_PATTERNS = [
  /auth/i,
  /user.*settings/i,
  /organization.*member/i,
  /org.*member/i,
  /\.user\(/i,
  /getUser\(/i,
  /profile.*update/i,
  /email/i,
  /password/i,
]

const MIGRATE_PATTERNS = [
  /storyteller.*display/i,
  /storyteller.*gallery/i,
  /storyteller.*list/i,
  /storyteller.*card/i,
  /is_storyteller.*true/i,
  /story.*attribution/i,
  /avatar_url/i,
  /display_name/i,
]

function categorizeQuery(file: string, context: string): { category: 'KEEP' | 'MIGRATE' | 'REVIEW', reason: string } {
  const lowerFile = file.toLowerCase()
  const lowerContext = context.toLowerCase()

  // Check file path patterns
  if (lowerFile.includes('/auth/')) {
    return { category: 'KEEP', reason: 'Auth route - requires profiles table' }
  }

  if (lowerFile.includes('settings') && lowerFile.includes('page')) {
    return { category: 'KEEP', reason: 'Settings page - user profile updates' }
  }

  if (lowerFile.includes('/organizations/') && lowerFile.includes('members')) {
    return { category: 'KEEP', reason: 'Organization members - profiles table correct' }
  }

  // Check context patterns for KEEP
  for (const pattern of KEEP_PATTERNS) {
    if (pattern.test(lowerContext)) {
      return { category: 'KEEP', reason: `Auth/user operation: ${pattern.source}` }
    }
  }

  // Check context patterns for MIGRATE
  for (const pattern of MIGRATE_PATTERNS) {
    if (pattern.test(lowerContext)) {
      return { category: 'MIGRATE', reason: `Storyteller-specific: ${pattern.source}` }
    }
  }

  // Default to REVIEW if ambiguous
  return { category: 'REVIEW', reason: 'Ambiguous - needs manual review' }
}

function analyzeQueries() {
  console.log('🔍 Analyzing profiles table queries...\n')

  // Get all files with profiles queries
  const grepOutput = execSync(
    'grep -rn "from(\'profiles\')" src/app src/components --include="*.tsx" --include="*.ts" -B 2 -A 2',
    { encoding: 'utf-8' }
  )

  const lines = grepOutput.split('\n')
  const queries: QueryLocation[] = []

  let currentFile = ''
  let currentLine = 0
  let currentContext = ''

  for (const line of lines) {
    if (line.includes('.tsx:') || line.includes('.ts:')) {
      const match = line.match(/^(.+?):(\d+):(.+)$/)
      if (match) {
        currentFile = match[1]
        currentLine = parseInt(match[2])
        currentContext += match[3] + ' '

        if (line.includes("from('profiles')")) {
          const { category, reason } = categorizeQuery(currentFile, currentContext)

          queries.push({
            file: currentFile,
            line: currentLine,
            context: currentContext.trim(),
            category,
            reason
          })

          currentContext = ''
        }
      }
    } else if (line.trim() && !line.startsWith('--')) {
      currentContext += line.trim() + ' '
    }
  }

  // Group by category
  const keep = queries.filter(q => q.category === 'KEEP')
  const migrate = queries.filter(q => q.category === 'MIGRATE')
  const review = queries.filter(q => q.category === 'REVIEW')

  console.log('=== ANALYSIS RESULTS ===\n')
  console.log(`Total queries: ${queries.length}`)
  console.log(`✅ KEEP (correct as-is): ${keep.length}`)
  console.log(`🔄 MIGRATE (needs change): ${migrate.length}`)
  console.log(`⚠️  REVIEW (manual check): ${review.length}`)

  console.log('\n=== QUERIES TO MIGRATE ===\n')
  migrate.forEach(q => {
    console.log(`📝 ${q.file}:${q.line}`)
    console.log(`   Reason: ${q.reason}`)
    console.log(`   Context: ${q.context.substring(0, 80)}...`)
    console.log()
  })

  console.log('\n=== QUERIES TO REVIEW ===\n')
  review.forEach(q => {
    console.log(`🔍 ${q.file}:${q.line}`)
    console.log(`   Reason: ${q.reason}`)
    console.log(`   Context: ${q.context.substring(0, 80)}...`)
    console.log()
  })

  // Save detailed report
  const report = {
    summary: {
      total: queries.length,
      keep: keep.length,
      migrate: migrate.length,
      review: review.length
    },
    queries: {
      keep,
      migrate,
      review
    }
  }

  fs.writeFileSync(
    'PHASE_4_QUERY_ANALYSIS.json',
    JSON.stringify(report, null, 2)
  )

  console.log('\n✅ Detailed report saved to PHASE_4_QUERY_ANALYSIS.json')

  return report
}

analyzeQueries()
