import * as fs from 'fs'

async function submit() {
  const seedData = JSON.parse(fs.readFileSync('GOODS_SEED_INTERVIEW.json', 'utf-8'))

  console.log('📤 Submitting GOODS seed interview...')

  const response = await fetch('http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/context/seed-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seedData)
  })

  const data = await response.json()

  if (data.error) {
    console.error('❌ ERROR:', data.error)
    process.exit(1)
  }

  const context = data.project_context || {}
  const outcomes = context.outcome_categories || []

  console.log('✅ Seed interview submitted successfully!')
  console.log(`📊 Extracted ${outcomes.length} outcome categories:\n`)

  outcomes.slice(0, 10).forEach((o: any, i: number) => {
    const category = typeof o === 'string' ? o : o.category
    const indicators = typeof o === 'object' ? (o.indicators?.length || 0) : 0
    console.log(`${i + 1}. ${category}`)
    if (indicators > 0) {
      console.log(`   ${indicators} indicators`)
    }
  })
}

submit().catch(console.error)
