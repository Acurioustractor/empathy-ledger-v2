#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const archiveDir = path.join(migrationsDir, 'archive')

const MIGRATION_FILENAME = /^\d{8}(\d{6})?_.+\.sql$/

function listDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
}

function validateMigrationsRoot() {
  const issues = []

  const entries = listDir(migrationsDir)
  for (const name of entries) {
    const fullPath = path.join(migrationsDir, name)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) continue

    if (!name.endsWith('.sql')) {
      issues.push(`Unexpected non-SQL file in supabase/migrations: ${name}`)
      continue
    }

    if (!MIGRATION_FILENAME.test(name)) {
      issues.push(
        `Invalid migration filename (expected YYYYMMDD_name.sql or YYYYMMDDHHMMSS_name.sql): ${name}`
      )
    }
  }

  if (!fs.existsSync(archiveDir)) {
    issues.push('Missing supabase/migrations/archive folder (recommended for retired migrations/backups)')
  }

  return issues
}

const issues = validateMigrationsRoot()
if (issues.length > 0) {
  console.error('❌ Database schema validation failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('✅ Database schema validation passed')

