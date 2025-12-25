#!/usr/bin/env node

/**
 * ER Diagram Generator
 *
 * Generates Mermaid ER diagrams from Supabase database schema
 * Usage: node scripts/generate-er-diagram.js [category]
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Table categories
const CATEGORIES = {
  'core': {
    name: 'Core System',
    tables: ['profiles', 'organizations', 'projects', 'stories', 'transcripts', 'media_assets']
  },
  'impact': {
    name: 'Impact Analysis',
    tables: [
      'story_narrative_arcs',
      'theme_evolution',
      'theme_concept_evolution',
      'audio_prosodic_analysis',
      'audio_emotion_analysis',
      'cultural_speech_patterns',
      'sroi_inputs',
      'sroi_outcomes',
      'sroi_calculations',
      'ripple_effects',
      'harvested_outcomes',
      'community_interpretation_sessions',
      'storytelling_circle_evaluations',
      'community_story_responses',
      'theory_of_change'
    ]
  },
  'cultural': {
    name: 'Cultural Safety',
    tables: [
      'cultural_protocols',
      'cultural_tags',
      'elder_review_queue',
      'consent_change_log',
      'content_approval_queue',
      'moderation_queue',
      'moderation_actions'
    ]
  },
  'ai': {
    name: 'AI & Analytics',
    tables: [
      'ai_agent_registry',
      'ai_analysis_jobs',
      'ai_processing_logs',
      'ai_usage_events',
      'ai_moderation_logs',
      'theme_analysis',
      'theme_extraction_jobs'
    ]
  },
  'partner': {
    name: 'Partner Portal',
    tables: [
      'partner_organizations',
      'partner_projects',
      'partner_stories',
      'partner_access_logs',
      'partner_api_keys',
      'story_access_tokens'
    ]
  }
}

async function generateERDiagram(category = 'all') {
  console.log(`🎨 Generating ER Diagram for: ${category}`)

  try {
    // Get schema dump
    console.log('📥 Fetching schema...')
    const schema = execSync('supabase db dump --schema public 2>/dev/null', { encoding: 'utf-8' })

    // Parse relationships
    const relationships = parseRelationships(schema)
    const tables = parseTables(schema)

    // Filter by category
    let filteredTables = tables
    if (category !== 'all' && CATEGORIES[category]) {
      const categoryTables = CATEGORIES[category].tables
      filteredTables = tables.filter(t => categoryTables.includes(t.name))
    }

    // Generate Mermaid diagram
    const diagram = generateMermaidDiagram(filteredTables, relationships, category)

    // Save diagram
    const outputDir = path.join(__dirname, '../docs/database/diagrams')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = `er-diagram-${category}.md`
    const filepath = path.join(outputDir, filename)

    const content = `# Database ER Diagram - ${category === 'all' ? 'Complete' : CATEGORIES[category]?.name || category}

Generated: ${new Date().toISOString()}

\`\`\`mermaid
${diagram}
\`\`\`

## Tables Shown

${filteredTables.map(t => `- **${t.name}** (${t.columns.length} columns)`).join('\n')}

## Relationships

${relationships.filter(r =>
  filteredTables.find(t => t.name === r.from_table) &&
  filteredTables.find(t => t.name === r.to_table)
).map(r => `- \`${r.from_table}.${r.from_column}\` → \`${r.to_table}.${r.to_column}\``).join('\n')}
`

    fs.writeFileSync(filepath, content)
    console.log(`✅ Diagram saved: ${filepath}`)
    console.log(`📊 Tables: ${filteredTables.length}`)
    console.log(`🔗 Relationships: ${relationships.length}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

function parseTables(schema) {
  const tables = []
  const tableRegex = /CREATE TABLE.*?"public"\."(\w+)"\s*\(([\s\S]*?)\);/g

  let match
  while ((match = tableRegex.exec(schema)) !== null) {
    const tableName = match[1]
    const tableBody = match[2]

    const columns = []
    const columnLines = tableBody.split('\n').filter(line => line.trim() && !line.trim().startsWith('CONSTRAINT'))

    for (const line of columnLines) {
      const columnMatch = line.trim().match(/^"?(\w+)"?\s+(\w+)/)
      if (columnMatch) {
        columns.push({
          name: columnMatch[1],
          type: columnMatch[2]
        })
      }
    }

    tables.push({ name: tableName, columns })
  }

  return tables
}

function parseRelationships(schema) {
  const relationships = []
  const fkRegex = /FOREIGN KEY\s*\("?(\w+)"?\)\s*REFERENCES\s*"?(\w+)"?\s*\("?(\w+)"?\)/gi
  const tableContext = /CREATE TABLE.*?"public"\."(\w+)"/g

  let currentTable = null
  const lines = schema.split('\n')

  for (const line of lines) {
    const tableMatch = line.match(/CREATE TABLE.*?"public"\."(\w+)"/)
    if (tableMatch) {
      currentTable = tableMatch[1]
    }

    const fkMatch = line.match(/FOREIGN KEY\s*\("?(\w+)"?\)\s*REFERENCES\s*"?(\w+)"?\s*\("?(\w+)"?\)/i)
    if (fkMatch && currentTable) {
      relationships.push({
        from_table: currentTable,
        from_column: fkMatch[1],
        to_table: fkMatch[2],
        to_column: fkMatch[3]
      })
    }
  }

  return relationships
}

function generateMermaidDiagram(tables, relationships, category) {
  const lines = ['erDiagram']

  // Add tables
  for (const table of tables) {
    const attrs = table.columns.slice(0, 10).map(col => {
      return `    ${col.type} ${col.name}`
    }).join('\n')

    if (attrs) {
      lines.push(`  ${table.name.toUpperCase()} {`)
      lines.push(attrs)
      lines.push('  }')
    }
  }

  // Add relationships
  const tableNames = new Set(tables.map(t => t.name))
  for (const rel of relationships) {
    if (tableNames.has(rel.from_table) && tableNames.has(rel.to_table)) {
      lines.push(`  ${rel.from_table.toUpperCase()} ||--o{ ${rel.to_table.toUpperCase()} : "${rel.from_column}"`)
    }
  }

  return lines.join('\n')
}

// Generate all category diagrams
async function generateAll() {
  console.log('🎨 Generating all ER diagrams...\n')

  // Generate complete diagram
  await generateERDiagram('all')

  // Generate category diagrams
  for (const [key, category] of Object.entries(CATEGORIES)) {
    console.log('')
    await generateERDiagram(key)
  }

  console.log('\n✅ All diagrams generated!')
  console.log('📁 Location: docs/database/diagrams/')
}

// CLI
const category = process.argv[2] || 'all'

if (category === '--all') {
  generateAll()
} else {
  generateERDiagram(category)
}
