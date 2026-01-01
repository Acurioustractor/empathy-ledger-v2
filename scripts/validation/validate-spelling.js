#!/usr/bin/env node

/**
 * Spelling Validation Script for Empathy Ledger v2
 *
 * This script validates that Australian spelling conventions are followed
 * in critical areas where spelling affects functionality (routes, APIs, etc.)
 * and prevents the creation of conflicting directory structures.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

class SpellingValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.srcPath = path.join(__dirname, 'src')
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
  }

  error(message) {
    this.errors.push(message)
    this.log(`❌ ERROR: ${message}`, colors.red)
  }

  warning(message) {
    this.warnings.push(message)
    this.log(`⚠️  WARNING: ${message}`, colors.yellow)
  }

  success(message) {
    this.log(`✅ ${message}`, colors.green)
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue)
  }

  // Check for conflicting directory structures
  validateDirectoryStructure() {
    this.log('\\n🔍 Validating directory structure...', colors.bold)

    const checkPaths = [
      'src/app/organizations',
      'src/app/api/organizations',
      'src/app/admin/organizations',
      'src/app/api/admin/organizations',
      'src/app/api/admin/stats/organizations',
      'src/app/api/projects/[id]/organizations'
    ]

    let hasErrors = false

    for (const checkPath of checkPaths) {
      const fullPath = path.join(__dirname, checkPath)
      if (fs.existsSync(fullPath)) {
        this.error(`Conflicting directory found: ${checkPath} (should use 'organisations')`)
        hasErrors = true
      }
    }

    if (!hasErrors) {
      this.success('Directory structure follows Australian spelling conventions')
    }

    // Check that Australian directories exist
    const requiredPaths = [
      'src/app/organisations',
      'src/app/api/organisations',
      'src/app/admin/organisations'
    ]

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(__dirname, requiredPath)
      if (!fs.existsSync(fullPath)) {
        this.warning(`Missing expected directory: ${requiredPath}`)
      }
    }
  }

  // Check route files for American spelling in paths
  validateRouteReferences() {
    this.log('\\n🔍 Validating route references...', colors.bold)

    try {
      // Find all route-related files
      const routeFiles = execSync(
        `find src -name "*.tsx" -o -name "*.ts" | grep -E "(route\\.ts$|page\\.tsx$|layout\\.tsx$)" | grep -v backup`,
        { encoding: 'utf8' }
      ).trim().split('\\n').filter(Boolean)

      let hasErrors = false

      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf8')

        // Check for American spelling in routes
        const americanRoutePatterns = [
          '/organizations/',
          '/api/organizations/',
          'href="/organizations',
          'router.push("/organizations',
          'router.replace("/organizations',
          'fetch("/api/organizations'
        ]

        for (const pattern of americanRoutePatterns) {
          if (content.includes(pattern)) {
            this.error(`American spelling in route found in ${file}: ${pattern}`)
            hasErrors = true
          }
        }
      }

      if (!hasErrors) {
        this.success('All route references use Australian spelling')
      }
    } catch (error) {
      this.warning('Could not validate route references: ' + error.message)
    }
  }

  // Check component files for API endpoint references
  validateAPIEndpoints() {
    this.log('\\n🔍 Validating API endpoint references...', colors.bold)

    try {
      // Find all component files
      const componentFiles = execSync(
        `find src/components src/lib src/app -name "*.tsx" -o -name "*.ts" | grep -v backup`,
        { encoding: 'utf8' }
      ).trim().split('\\n').filter(Boolean)

      let hasErrors = false

      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8')

        // Check for American spelling in API calls
        const americanAPIPatterns = [
          'fetch(`/api/organizations/',
          'fetch("/api/organizations/',
          "fetch('/api/organizations/",
          'fetch(\`/api/organizations/',
          '/api/organizations/${'
        ]

        for (const pattern of americanAPIPatterns) {
          if (content.includes(pattern)) {
            this.error(`American spelling in API call found in ${file}: ${pattern}`)
            hasErrors = true
          }
        }
      }

      if (!hasErrors) {
        this.success('All API endpoint references use Australian spelling')
      }
    } catch (error) {
      this.warning('Could not validate API endpoints: ' + error.message)
    }
  }

  // Check for proper user-facing text spelling
  validateUserFacingText() {
    this.log('\\n🔍 Validating user-facing text...', colors.bold)

    try {
      const uiFiles = execSync(
        `find src -name "*.tsx" | grep -v backup`,
        { encoding: 'utf8' }
      ).trim().split('\\n').filter(Boolean)

      let hasWarnings = false
      const americanWords = [
        { american: 'organization', australian: 'organisation' },
        { american: 'analyze', australian: 'analyse' },
        { american: 'color', australian: 'colour' },
        { american: 'center', australian: 'centre' },
        { american: 'favor', australian: 'favour' },
        { american: 'honor', australian: 'honour' }
      ]

      for (const file of uiFiles) {
        const content = fs.readFileSync(file, 'utf8')

        // Look for American spelling in UI text (between quotes/JSX)
        for (const { american, australian } of americanWords) {
          const patterns = [
            new RegExp(`>[^<]*\\b${american}\\b[^<]*<`, 'gi'), // JSX text
            new RegExp(`"[^"]*\\b${american}\\b[^"]*"`, 'gi'), // Quoted strings
            new RegExp(`'[^']*\\b${american}\\b[^']*'`, 'gi'), // Single quoted strings
          ]

          for (const pattern of patterns) {
            const matches = content.match(pattern)
            if (matches) {
              // Skip if it's in a comment or import
              const isInComment = matches.some(match =>
                content.indexOf(match) > 0 &&
                content.substring(content.indexOf(match) - 10, content.indexOf(match)).includes('//')
              )

              if (!isInComment) {
                this.warning(`Consider Australian spelling in ${file}: "${american}" → "${australian}"`)
                hasWarnings = true
              }
            }
          }
        }
      }

      if (!hasWarnings) {
        this.success('User-facing text follows Australian spelling conventions')
      }
    } catch (error) {
      this.warning('Could not validate user-facing text: ' + error.message)
    }
  }

  // Generate summary report
  generateReport() {
    this.log('\\n' + '='.repeat(60), colors.cyan)
    this.log('📊 SPELLING VALIDATION REPORT', colors.bold + colors.cyan)
    this.log('='.repeat(60), colors.cyan)

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\\n🎉 ALL CHECKS PASSED!', colors.bold + colors.green)
      this.log('Your codebase follows Australian spelling conventions correctly.', colors.green)
    } else {
      if (this.errors.length > 0) {
        this.log(`\\n❌ ERRORS FOUND: ${this.errors.length}`, colors.bold + colors.red)
        this.errors.forEach((error, index) => {
          this.log(`   ${index + 1}. ${error}`, colors.red)
        })
        this.log('\\n⚠️  These errors MUST be fixed before deployment.', colors.red)
      }

      if (this.warnings.length > 0) {
        this.log(`\\n⚠️  WARNINGS: ${this.warnings.length}`, colors.bold + colors.yellow)
        this.warnings.forEach((warning, index) => {
          this.log(`   ${index + 1}. ${warning}`, colors.yellow)
        })
        this.log('\\n💡 Consider addressing these warnings for consistency.', colors.yellow)
      }
    }

    this.log('\\n📖 For detailed guidelines, see: SPELLING_GUIDELINES.md', colors.blue)
    this.log('🔧 For fixing issues, see: AUSTRALIAN_SPELLING_GUIDE.md', colors.blue)

    return this.errors.length === 0
  }

  // Run all validations
  async run() {
    this.log('🔍 Starting Spelling Validation for Empathy Ledger v2...', colors.bold + colors.cyan)
    this.log('This will check for Australian spelling compliance in critical areas.\\n')

    this.validateDirectoryStructure()
    this.validateRouteReferences()
    this.validateAPIEndpoints()
    this.validateUserFacingText()

    const success = this.generateReport()

    if (success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SpellingValidator()
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  })
}

module.exports = SpellingValidator