/**
 * Synthetic UAT Session Simulator
 * Demonstrates the full UAT testing process with sample feedback
 *
 * Usage: npx tsx scripts/simulate-uat-session.ts
 */

// Simulate a complete UAT session for "Elder Grace" persona
interface TaskFeedback {
  taskId: string
  taskTitle: string
  module: string
  rating: number
  difficulty: 'easy' | 'moderate' | 'hard'
  issues: string[]
  comments: string
  completedAt: string
  durationSeconds: number
}

interface SessionSummary {
  sessionId: string
  persona: string
  startedAt: string
  completedAt: string
  totalDurationMinutes: number
  tasksCompleted: number
  tasksSkipped: number
  averageRating: number
  overallSatisfaction: number
  wouldRecommend: boolean
  taskFeedback: TaskFeedback[]
  topIssues: string[]
  topPraises: string[]
  additionalComments: string
}

// Simulated feedback data representing a realistic UAT session
const syntheticSession: SessionSummary = {
  sessionId: `uat-${Date.now()}`,
  persona: 'Elder Grace (Olga Havnen)',
  startedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(), // 52 minutes ago
  completedAt: new Date().toISOString(),
  totalDurationMinutes: 52,
  tasksCompleted: 20,
  tasksSkipped: 2,
  averageRating: 4.1,
  overallSatisfaction: 4,
  wouldRecommend: true,
  taskFeedback: [
    // Module 1: Syndication Dashboard
    {
      taskId: 'syn-1',
      taskTitle: 'View Pending Requests',
      module: 'Syndication Dashboard',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'Very clear what sites are requesting my story. I like seeing the purpose.',
      completedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      durationSeconds: 95
    },
    {
      taskId: 'syn-2',
      taskTitle: 'Approve Syndication Request',
      module: 'Syndication Dashboard',
      rating: 4,
      difficulty: 'easy',
      issues: ['UI'],
      comments: 'The approve button worked well. Would be nice to see a confirmation message that stays longer.',
      completedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      durationSeconds: 110
    },
    {
      taskId: 'syn-3',
      taskTitle: 'Deny Syndication Request',
      module: 'Syndication Dashboard',
      rating: 4,
      difficulty: 'easy',
      issues: [],
      comments: 'Good that I can decline without giving a reason. My choice.',
      completedAt: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
      durationSeconds: 65
    },
    {
      taskId: 'syn-4',
      taskTitle: 'View Active Distributions',
      module: 'Syndication Dashboard',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'I can see exactly where my stories are. The numbers make sense.',
      completedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      durationSeconds: 85
    },
    {
      taskId: 'syn-5',
      taskTitle: 'Stop Sharing (Revoke)',
      module: 'Syndication Dashboard',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'Very important that I can take my story back. This works well.',
      completedAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
      durationSeconds: 70
    },
    {
      taskId: 'syn-6',
      taskTitle: 'View Revenue Earnings',
      module: 'Syndication Dashboard',
      rating: 4,
      difficulty: 'moderate',
      issues: ['Confusing'],
      comments: 'The numbers are there but I am not sure when I get paid. Need clearer explanation.',
      completedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      durationSeconds: 130
    },
    // Module 2: Storyteller Dashboard
    {
      taskId: 'dash-1',
      taskTitle: 'Navigate Personal Dashboard',
      module: 'Storyteller Dashboard',
      rating: 4,
      difficulty: 'moderate',
      issues: ['UI'],
      comments: 'Found it but the tabs are small on my tablet. Could be bigger.',
      completedAt: new Date(Date.now() - 39 * 60 * 1000).toISOString(),
      durationSeconds: 180
    },
    {
      taskId: 'dash-2',
      taskTitle: 'View and Manage Transcripts',
      module: 'Storyteller Dashboard',
      rating: 4,
      difficulty: 'easy',
      issues: [],
      comments: 'Good to see all my transcripts in one place.',
      completedAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
      durationSeconds: 120
    },
    {
      taskId: 'dash-3',
      taskTitle: 'Add New Transcript',
      module: 'Storyteller Dashboard',
      rating: 3,
      difficulty: 'moderate',
      issues: ['UI', 'Confusing'],
      comments: 'The text box is small. Hard to paste long text. Word count is helpful though.',
      completedAt: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
      durationSeconds: 200
    },
    {
      taskId: 'dash-4',
      taskTitle: 'Upload Media',
      module: 'Storyteller Dashboard',
      rating: 3,
      difficulty: 'hard',
      issues: ['Bug', 'UI'],
      comments: 'Upload took a very long time. Not sure if it was working. Need progress indicator.',
      completedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      durationSeconds: 340
    },
    {
      taskId: 'dash-5',
      taskTitle: 'View Stories',
      module: 'Storyteller Dashboard',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'Beautiful story cards. I like seeing my themes displayed.',
      completedAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
      durationSeconds: 90
    },
    {
      taskId: 'dash-6',
      taskTitle: 'Access Analytics',
      module: 'Storyteller Dashboard',
      rating: 4,
      difficulty: 'moderate',
      issues: [],
      comments: 'Interesting to see how many people read my stories. Charts are nice.',
      completedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
      durationSeconds: 150
    },
    // Module 3: Privacy & Settings
    {
      taskId: 'priv-1',
      taskTitle: 'Access Privacy Settings',
      module: 'Privacy & Settings',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'Found the settings easily. Good that it is in my dashboard.',
      completedAt: new Date(Date.now() - 21 * 60 * 1000).toISOString(),
      durationSeconds: 80
    },
    {
      taskId: 'priv-2',
      taskTitle: 'Manage Data Sovereignty',
      module: 'Privacy & Settings',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'OCAP principles are explained well. This is very important for our community.',
      completedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      durationSeconds: 170
    },
    {
      taskId: 'priv-3',
      taskTitle: 'Export Personal Data',
      module: 'Privacy & Settings',
      rating: 4,
      difficulty: 'moderate',
      issues: ['Missing Feature'],
      comments: 'Could export but would like more format options. PDF would be good.',
      completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      durationSeconds: 140
    },
    {
      taskId: 'priv-4',
      taskTitle: 'Configure ALMA Settings',
      module: 'Privacy & Settings',
      rating: 4,
      difficulty: 'moderate',
      issues: ['Confusing'],
      comments: 'Not sure what all the AI options do. Need simpler explanations.',
      completedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      durationSeconds: 190
    },
    {
      taskId: 'priv-5',
      taskTitle: 'Understand Content Visibility',
      module: 'Privacy & Settings',
      rating: 5,
      difficulty: 'easy',
      issues: [],
      comments: 'Public, Community, Private - very clear. Good control over my stories.',
      completedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      durationSeconds: 100
    },
    // Module 4: Knowledge Base & Help
    {
      taskId: 'kb-1',
      taskTitle: 'Search Knowledge Base',
      module: 'Knowledge Base & Help',
      rating: 4,
      difficulty: 'moderate',
      issues: ['UI'],
      comments: 'Search works but results page looks very technical. Simpler language please.',
      completedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      durationSeconds: 160
    },
    {
      taskId: 'kb-2',
      taskTitle: 'Use Quick Search Examples',
      module: 'Knowledge Base & Help',
      rating: 4,
      difficulty: 'easy',
      issues: [],
      comments: 'Example queries are helpful. Shows me how to ask questions.',
      completedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      durationSeconds: 110
    },
    {
      taskId: 'kb-3',
      taskTitle: 'Find Help When Stuck',
      module: 'Knowledge Base & Help',
      rating: 3,
      difficulty: 'hard',
      issues: ['Missing Feature'],
      comments: 'Would like a help button on every page. Had to go to special page to search.',
      completedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      durationSeconds: 200
    }
    // Note: onb-1 and onb-2 were skipped as Elder Grace is not a first-time user
  ],
  topIssues: [
    'Media upload needs progress indicator',
    'ALMA settings explanations too technical',
    'Help should be accessible from every page',
    'Tabs too small on tablet devices'
  ],
  topPraises: [
    'OCAP data sovereignty controls are excellent',
    'Story visibility options (Public/Community/Private) very clear',
    'Syndication dashboard gives full control over where stories go',
    'Being able to revoke story sharing is important and works well'
  ],
  additionalComments: 'Overall this is a good system for sharing our stories. I feel in control of my content. The cultural safety features are what our community needs. Some parts need simpler language for Elders who are not used to technology.'
}

// Generate the report
function generateUATReport(session: SessionSummary): string {
  const moduleStats = new Map<string, { completed: number; avgRating: number; issues: string[] }>()

  // Calculate per-module statistics
  session.taskFeedback.forEach(task => {
    const existing = moduleStats.get(task.module) || { completed: 0, avgRating: 0, issues: [] }
    existing.completed++
    existing.avgRating = (existing.avgRating * (existing.completed - 1) + task.rating) / existing.completed
    existing.issues.push(...task.issues)
    moduleStats.set(task.module, existing)
  })

  const issueCount = session.taskFeedback.reduce((sum, t) => sum + t.issues.length, 0)
  const bugCount = session.taskFeedback.filter(t => t.issues.includes('Bug')).length
  const uiCount = session.taskFeedback.filter(t => t.issues.includes('UI')).length
  const confusingCount = session.taskFeedback.filter(t => t.issues.includes('Confusing')).length
  const missingCount = session.taskFeedback.filter(t => t.issues.includes('Missing Feature')).length

  let report = `
╔══════════════════════════════════════════════════════════════════╗
║              WEEK 5 UAT SESSION REPORT                           ║
╚══════════════════════════════════════════════════════════════════╝

Session ID:     ${session.sessionId}
Persona:        ${session.persona}
Started:        ${new Date(session.startedAt).toLocaleString()}
Completed:      ${new Date(session.completedAt).toLocaleString()}
Duration:       ${session.totalDurationMinutes} minutes

══════════════════════════════════════════════════════════════════
                         SUMMARY METRICS
══════════════════════════════════════════════════════════════════

  Tasks Completed:      ${session.tasksCompleted}/22
  Tasks Skipped:        ${session.tasksSkipped}
  Average Rating:       ${'★'.repeat(Math.round(session.averageRating))}${'☆'.repeat(5 - Math.round(session.averageRating))} (${session.averageRating.toFixed(1)}/5)
  Overall Satisfaction: ${'★'.repeat(session.overallSatisfaction)}${'☆'.repeat(5 - session.overallSatisfaction)} (${session.overallSatisfaction}/5)
  Would Recommend:      ${session.wouldRecommend ? '✓ Yes' : '✗ No'}

══════════════════════════════════════════════════════════════════
                       ISSUES BREAKDOWN
══════════════════════════════════════════════════════════════════

  Total Issues Found:   ${issueCount}
  ├─ Bugs:              ${bugCount}
  ├─ UI Issues:         ${uiCount}
  ├─ Confusing:         ${confusingCount}
  └─ Missing Features:  ${missingCount}

══════════════════════════════════════════════════════════════════
                     MODULE-BY-MODULE RESULTS
══════════════════════════════════════════════════════════════════
`

  moduleStats.forEach((stats, moduleName) => {
    const stars = '★'.repeat(Math.round(stats.avgRating)) + '☆'.repeat(5 - Math.round(stats.avgRating))
    report += `
  ${moduleName}
  ├─ Tasks Completed:  ${stats.completed}
  ├─ Average Rating:   ${stars} (${stats.avgRating.toFixed(1)})
  └─ Issues:           ${stats.issues.length > 0 ? stats.issues.join(', ') : 'None'}
`
  })

  report += `
══════════════════════════════════════════════════════════════════
                      DETAILED TASK FEEDBACK
══════════════════════════════════════════════════════════════════
`

  session.taskFeedback.forEach((task, index) => {
    const stars = '★'.repeat(task.rating) + '☆'.repeat(5 - task.rating)
    const difficultyIcon = task.difficulty === 'easy' ? '🟢' : task.difficulty === 'moderate' ? '🟡' : '🔴'
    report += `
  ${index + 1}. ${task.taskTitle}
     Module:     ${task.module}
     Rating:     ${stars}
     Difficulty: ${difficultyIcon} ${task.difficulty}
     Issues:     ${task.issues.length > 0 ? task.issues.join(', ') : 'None'}
     Comment:    "${task.comments}"
     Duration:   ${task.durationSeconds}s
`
  })

  report += `
══════════════════════════════════════════════════════════════════
                         TOP ISSUES
══════════════════════════════════════════════════════════════════
`
  session.topIssues.forEach((issue, i) => {
    report += `  ${i + 1}. ${issue}\n`
  })

  report += `
══════════════════════════════════════════════════════════════════
                         TOP PRAISES
══════════════════════════════════════════════════════════════════
`
  session.topPraises.forEach((praise, i) => {
    report += `  ${i + 1}. ${praise}\n`
  })

  report += `
══════════════════════════════════════════════════════════════════
                     ADDITIONAL COMMENTS
══════════════════════════════════════════════════════════════════

  "${session.additionalComments}"

══════════════════════════════════════════════════════════════════
                      RECOMMENDATIONS
══════════════════════════════════════════════════════════════════

  Based on this session, prioritize:

  🔴 CRITICAL (Fix before launch):
     - Add progress indicator for media uploads

  🟡 HIGH (Week 6 sprint):
     - Simplify ALMA settings explanations
     - Increase tab/button sizes for tablet users
     - Add contextual help button to all pages

  🟢 MEDIUM (Backlog):
     - Add PDF export format option
     - Extend confirmation message display time

══════════════════════════════════════════════════════════════════
                        END OF REPORT
══════════════════════════════════════════════════════════════════
`

  return report
}

// Run the simulation
console.log('\n🧪 Running Synthetic UAT Session Simulation...\n')
console.log('=' .repeat(70))
console.log('')
console.log('Simulating: Elder Grace (played by Olga Havnen)')
console.log('Device: iPad (tablet)')
console.log('Focus: Privacy controls, cultural protocols, ease of use')
console.log('')
console.log('=' .repeat(70))

// Simulate task progression
console.log('\n📋 Simulating task completion...\n')

syntheticSession.taskFeedback.forEach((task, index) => {
  const stars = '★'.repeat(task.rating) + '☆'.repeat(5 - task.rating)
  const status = task.issues.length > 0 ? '⚠️' : '✅'
  console.log(`  ${status} Task ${index + 1}/20: ${task.taskTitle} ${stars}`)
})

console.log('\n  ⏭️  Task 21/22: Complete Onboarding Flow (SKIPPED - existing user)')
console.log('  ⏭️  Task 22/22: Submit First Story (SKIPPED - existing user)')

// Generate and display the full report
console.log('\n')
console.log(generateUATReport(syntheticSession))

// Save as JSON for later analysis
const fs = require('fs')
const outputPath = '/tmp/uat-session-elder-grace.json'
fs.writeFileSync(outputPath, JSON.stringify(syntheticSession, null, 2))
console.log(`\n📁 Session data saved to: ${outputPath}`)
