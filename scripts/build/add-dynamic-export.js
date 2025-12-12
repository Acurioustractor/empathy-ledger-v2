#!/usr/bin/env node

/**
 * Script to add `export const dynamic = 'force-dynamic'` to all page.tsx files
 * that don't already have it. This forces dynamic rendering and fixes SSG issues
 * with React context during build.
 */

const fs = require('fs')
const path = require('path')

const SRC_DIR = path.join(__dirname, '../../src/app')

function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip api directories - they're handled separately
      if (entry.name !== 'api') {
        findPageFiles(fullPath, files)
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      files.push(fullPath)
    }
  }

  return files
}

function addDynamicExport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Skip if already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    console.log(`✓ Skip (already has): ${path.relative(SRC_DIR, filePath)}`)
    return false
  }

  // Find the right place to add the export
  // If the file has 'use client', add after it
  // Otherwise, add at the beginning

  if (content.startsWith("'use client'")) {
    content = content.replace(
      "'use client'",
      "'use client'\n\nexport const dynamic = 'force-dynamic'"
    )
  } else if (content.startsWith('"use client"')) {
    content = content.replace(
      '"use client"',
      '"use client"\n\nexport const dynamic = "force-dynamic"'
    )
  } else {
    // Server component - add at the beginning
    content = "export const dynamic = 'force-dynamic'\n\n" + content
  }

  fs.writeFileSync(filePath, content)
  console.log(`✓ Added: ${path.relative(SRC_DIR, filePath)}`)
  return true
}

function main() {
  console.log('Adding dynamic export to page files...\n')

  const pageFiles = findPageFiles(SRC_DIR)
  let added = 0
  let skipped = 0

  for (const file of pageFiles) {
    if (addDynamicExport(file)) {
      added++
    } else {
      skipped++
    }
  }

  console.log(`\nDone! Added: ${added}, Skipped: ${skipped}`)
}

main()
