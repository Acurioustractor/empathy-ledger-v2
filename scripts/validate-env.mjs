#!/usr/bin/env node
/**
 * Environment Variable Validator
 *
 * Run: npm run env:check
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

// Environment variable definitions
const ENV_VARS = [
  // Supabase - Required
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    sensitive: false,
    description: 'Supabase project URL',
    validate: (v) => v.startsWith('https://') && v.includes('.supabase.co'),
    hint: 'Should be https://YOUR_REF.supabase.co',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    sensitive: false,
    description: 'Supabase anonymous key (client-side)',
    validate: (v) => v.startsWith('eyJ') && v.length > 100,
    hint: 'Should be a JWT starting with eyJ...',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    sensitive: true,
    description: 'Supabase service role key (server-side only!)',
    validate: (v) => v.startsWith('eyJ') && v.length > 100,
    hint: 'Should be a JWT starting with eyJ...',
  },
  {
    name: 'DATABASE_URL',
    required: false,
    sensitive: true,
    description: 'Direct PostgreSQL connection string',
    validate: (v) => v.startsWith('postgresql://'),
    hint: 'Should be postgresql://...',
  },

  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    sensitive: false,
    description: 'Application base URL',
    validate: (v) => v.startsWith('http://') || v.startsWith('https://'),
    hint: 'Should be http://localhost:3000 for local dev',
  },

  // AI Configuration
  {
    name: 'LLM_PROVIDER',
    required: true,
    sensitive: false,
    description: 'AI provider selection',
    validate: (v) => ['ollama', 'openai'].includes(v),
    hint: 'Should be "ollama" or "openai"',
  },
  {
    name: 'OLLAMA_BASE_URL',
    required: false,
    sensitive: false,
    description: 'Ollama server URL',
    validate: (v) => v.startsWith('http://'),
    hint: 'Usually http://localhost:11434',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    sensitive: true,
    description: 'OpenAI API key',
    validate: (v) => v.startsWith('sk-'),
    hint: 'Should start with sk-...',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    sensitive: true,
    description: 'Anthropic Claude API key',
    validate: (v) => v.startsWith('sk-ant-'),
    hint: 'Should start with sk-ant-...',
  },

  // Cultural Safety
  {
    name: 'ENABLE_CULTURAL_SAFETY',
    required: false,
    sensitive: false,
    description: 'Enable cultural sensitivity checks',
    validate: (v) => ['true', 'false'].includes(v),
    hint: 'Should be "true" or "false"',
  },

  // Inngest
  {
    name: 'INNGEST_EVENT_KEY',
    required: false,
    sensitive: true,
    description: 'Inngest event key for background jobs',
  },
  {
    name: 'INNGEST_SIGNING_KEY',
    required: false,
    sensitive: true,
    description: 'Inngest webhook signing key',
    validate: (v) => v.startsWith('signkey-'),
    hint: 'Should start with signkey-...',
  },

  // Research Tools
  {
    name: 'TAVILY_API_KEY',
    required: false,
    sensitive: true,
    description: 'Tavily AI search API key',
    validate: (v) => v.startsWith('tvly-'),
    hint: 'Should start with tvly-...',
  },
]

function loadEnvFile(filePath) {
  const env = {}

  if (!fs.existsSync(filePath)) {
    return env
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
  }

  return env
}

function maskValue(value) {
  if (value.length <= 8) return '****'
  return value.substring(0, 4) + '...' + value.substring(value.length - 4)
}

function main() {
  console.log(`\n${colors.bold}${colors.blue}🔐 Environment Variable Validator${colors.reset}\n`)

  const projectRoot = path.resolve(__dirname, '..')
  const envLocalPath = path.join(projectRoot, '.env.local')
  const envPath = path.join(projectRoot, '.env')

  // Load environment files
  const envLocal = loadEnvFile(envLocalPath)
  const envBase = loadEnvFile(envPath)
  const combined = { ...envBase, ...envLocal, ...process.env }

  let errors = 0
  let warnings = 0
  let passed = 0

  console.log(`${colors.bold}Checking environment variables...${colors.reset}\n`)

  for (const envVar of ENV_VARS) {
    const value = combined[envVar.name]
    const hasValue = value && value.length > 0 && !value.includes('your_') && !value.includes('YOUR_')

    let status = ''
    let details = ''

    if (!hasValue) {
      if (envVar.required) {
        status = `${colors.red}✗ MISSING${colors.reset}`
        errors++
        if (envVar.hint) {
          details = `  ${colors.yellow}Hint: ${envVar.hint}${colors.reset}`
        }
      } else {
        status = `${colors.yellow}○ Not set${colors.reset}`
        warnings++
      }
    } else if (envVar.validate && !envVar.validate(value)) {
      status = `${colors.yellow}⚠ Invalid format${colors.reset}`
      warnings++
      if (envVar.hint) {
        details = `  ${colors.yellow}Hint: ${envVar.hint}${colors.reset}`
      }
    } else {
      const displayValue = envVar.sensitive ? maskValue(value) : value
      status = `${colors.green}✓ Set${colors.reset}`
      details = `  ${colors.blue}Value: ${displayValue}${colors.reset}`
      passed++
    }

    console.log(`${envVar.name}`)
    console.log(`  ${envVar.description}`)
    console.log(`  Status: ${status}`)
    if (details) console.log(details)
    console.log()
  }

  // Summary
  console.log(`${colors.bold}─────────────────────────────────${colors.reset}`)
  console.log(`${colors.bold}Summary:${colors.reset}`)
  console.log(`  ${colors.green}${passed} variable(s) configured correctly${colors.reset}`)

  if (errors > 0) {
    console.log(`  ${colors.red}${errors} required variable(s) missing${colors.reset}`)
  }
  if (warnings > 0) {
    console.log(`  ${colors.yellow}${warnings} optional variable(s) not set or invalid${colors.reset}`)
  }

  // Security reminders
  console.log(`\n${colors.bold}Security Reminders:${colors.reset}`)
  console.log(`  • Never commit .env.local to git`)
  console.log(`  • Rotate API keys every 90 days`)
  console.log(`  • Use different keys for dev/staging/prod`)
  console.log(`  • SERVICE_ROLE_KEY should never be exposed to client`)

  console.log()

  // Exit with error code if required vars missing
  process.exit(errors > 0 ? 1 : 0)
}

main()
