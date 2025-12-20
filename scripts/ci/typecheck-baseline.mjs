#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const shouldWrite = args.has('--write')
const projectRoot = process.cwd()
const baselinePath = path.join(projectRoot, 'scripts', 'ci', 'typecheck-baseline.json')

function runTypecheck() {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const result = spawnSync(command, ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: projectRoot,
    encoding: 'utf8',
  })

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim()
  const errorCount = (output.match(/\berror TS\d+:/g) || []).length
  return { output, errorCount }
}

function readBaseline() {
  if (!fs.existsSync(baselinePath)) return null
  try {
    const raw = fs.readFileSync(baselinePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeBaseline(errorCount) {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true })
  fs.writeFileSync(
    baselinePath,
    JSON.stringify({ tscErrors: errorCount, updatedAt: new Date().toISOString() }, null, 2) + '\n',
    'utf8'
  )
}

const { errorCount } = runTypecheck()
const baseline = readBaseline()

if (shouldWrite || !baseline) {
  writeBaseline(errorCount)
  console.log(`TypeScript baseline set: ${errorCount} errors`)
  process.exit(0)
}

const baselineErrors = Number(baseline.tscErrors ?? 0)
if (!Number.isFinite(baselineErrors)) {
  console.error(`Invalid baseline file: ${baselinePath}`)
  process.exit(2)
}

if (errorCount > baselineErrors) {
  console.error(`TypeScript errors increased: ${baselineErrors} → ${errorCount}`)
  console.error('Update baseline only when intentional: `npm run type-check:baseline:write`.')
  process.exit(1)
}

console.log(`TypeScript errors: ${errorCount} (baseline ${baselineErrors})`)

