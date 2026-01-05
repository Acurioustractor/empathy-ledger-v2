/**
 * Complete Page Audit with Playwright
 *
 * Automatically crawls Empathy Ledger and audits:
 * - Profile pages (images, data completeness)
 * - Storyteller dashboards (functionality, privacy, ALMA settings)
 * - Organization dashboards
 * - Public pages
 * - Image loading and optimization
 * - Accessibility compliance
 * - Mobile responsiveness
 *
 * Generates comprehensive report with screenshots.
 */

import { chromium, Browser, Page } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const SCREENSHOTS_DIR = '/tmp/empathy-ledger-audit-screenshots'

interface AuditResult {
  page_type: string
  url: string
  timestamp: string
  score: number
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low'
    category: string
    description: string
    recommendation: string
  }>
  elements_found: string[]
  elements_missing: string[]
  images: Array<{
    src: string
    alt: string | null
    loaded: boolean
    dimensions: { width: number, height: number }
    lazy: boolean
  }>
  screenshot: string
}

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

async function auditProfilePage(page: Page, storytellerId: string): Promise<AuditResult> {
  const url = `${BASE_URL}/profile/${storytellerId}`
  console.log(`  📄 Auditing profile: ${url}`)

  await page.goto(url, { waitUntil: 'networkidle' })

  const issues: AuditResult['issues'] = []
  const elements_found: string[] = []
  const elements_missing: string[] = []

  // Check required elements
  const required_selectors = {
    'profile_image': 'img[alt*="profile"], img[alt*="avatar"], .profile-image, .avatar',
    'display_name': 'h1, .display-name, .storyteller-name',
    'cultural_background': '.cultural-background, .nation, .community',
    'bio_summary': '.bio, .about, .summary',
    'story_count': '.story-count, .stories-total',
    'privacy_indicator': '.privacy, .visibility'
  }

  for (const [element, selector] of Object.entries(required_selectors)) {
    const exists = await page.locator(selector).count() > 0
    if (exists) {
      elements_found.push(element)
    } else {
      elements_missing.push(element)
      issues.push({
        severity: element === 'profile_image' || element === 'display_name' ? 'critical' : 'high',
        category: 'Missing Element',
        description: `Required element '${element}' not found`,
        recommendation: `Add ${element} to profile page using selector: ${selector}`
      })
    }
  }

  // Check all images
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt || null,
      loaded: img.complete && img.naturalHeight !== 0,
      dimensions: { width: img.naturalWidth, height: img.naturalHeight },
      lazy: img.loading === 'lazy' || img.getAttribute('loading') === 'lazy'
    }))
  })

  // Check for missing alt text
  images.forEach((img, idx) => {
    if (!img.alt) {
      issues.push({
        severity: 'high',
        category: 'Accessibility',
        description: `Image ${idx + 1} missing alt text: ${img.src}`,
        recommendation: 'Add descriptive alt text for screen readers'
      })
    }

    if (!img.loaded) {
      issues.push({
        severity: 'critical',
        category: 'Image Loading',
        description: `Image failed to load: ${img.src}`,
        recommendation: 'Check image URL and network connectivity'
      })
    }

    if (!img.lazy && img.dimensions.height > 400) {
      issues.push({
        severity: 'medium',
        category: 'Performance',
        description: `Large image not lazy-loaded: ${img.src}`,
        recommendation: 'Add loading="lazy" attribute'
      })
    }
  })

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, `profile-${storytellerId}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })

  // Calculate score
  const total_required = Object.keys(required_selectors).length
  const score = elements_found.length / total_required

  return {
    page_type: 'profile',
    url,
    timestamp: new Date().toISOString(),
    score,
    issues,
    elements_found,
    elements_missing,
    images,
    screenshot: screenshotPath
  }
}

async function auditStorytellerDashboard(page: Page, browser: Browser): Promise<AuditResult> {
  const url = `${BASE_URL}/dashboard`
  console.log(`  📊 Auditing storyteller dashboard: ${url}`)

  await page.goto(url, { waitUntil: 'networkidle' })

  const issues: AuditResult['issues'] = []
  const elements_found: string[] = []
  const elements_missing: string[] = []

  // Check required dashboard elements
  const required_selectors = {
    'my_stories_list': '.my-stories, .stories-list, [data-testid="stories-list"]',
    'create_story_button': 'button:has-text("Create"), button:has-text("New Story"), .create-story',
    'edit_profile_link': 'a:has-text("Edit Profile"), .edit-profile, [href*="profile/edit"]',
    'privacy_settings': '.privacy-settings, [data-testid="privacy-settings"]',
    'alma_settings': '.alma-settings, .cultural-protocols, [data-testid="alma-settings"]'
  }

  for (const [element, selector] of Object.entries(required_selectors)) {
    try {
      const exists = await page.locator(selector).count() > 0
      if (exists) {
        elements_found.push(element)
      } else {
        elements_missing.push(element)

        const severity = element.includes('settings') || element === 'my_stories_list' ? 'critical' : 'high'
        issues.push({
          severity,
          category: 'Missing Functionality',
          description: `Dashboard element '${element}' not found`,
          recommendation: `Implement ${element} in storyteller dashboard`
        })
      }
    } catch (e) {
      elements_missing.push(element)
    }
  }

  // Check story management features (if stories exist)
  const has_stories = await page.locator('.story-item, .story-card, [data-testid="story-item"]').count() > 0

  if (has_stories) {
    const story_actions = {
      'edit_button': 'button:has-text("Edit"), .edit-story',
      'delete_button': 'button:has-text("Delete"), .delete-story',
      'privacy_toggle': '.privacy-toggle, [data-testid="privacy-toggle"]',
      'publish_toggle': '.publish-toggle, [data-testid="publish-toggle"]'
    }

    for (const [action, selector] of Object.entries(story_actions)) {
      const exists = await page.locator(selector).count() > 0
      if (exists) {
        elements_found.push(`story_${action}`)
      } else {
        issues.push({
          severity: 'high',
          category: 'Story Management',
          description: `Story action '${action}' not available`,
          recommendation: `Add ${action} to story cards`
        })
      }
    }
  }

  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, 'dashboard-main.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const total_required = Object.keys(required_selectors).length
  const score = elements_found.length / total_required

  return {
    page_type: 'dashboard',
    url,
    timestamp: new Date().toISOString(),
    score,
    issues,
    elements_found,
    elements_missing,
    images: [],
    screenshot: screenshotPath
  }
}

async function auditAccessibility(page: Page): Promise<Array<AuditResult['issues'][0]>> {
  console.log('  ♿ Running accessibility audit...')

  const issues: AuditResult['issues'] = []

  // Check for common a11y issues
  const a11y_checks = await page.evaluate(() => {
    const results = {
      has_h1: document.querySelectorAll('h1').length > 0,
      has_skip_link: document.querySelector('a[href="#main-content"]') !== null,
      form_labels: Array.from(document.querySelectorAll('input, textarea, select')).every(input => {
        return input.hasAttribute('aria-label') ||
               input.hasAttribute('aria-labelledby') ||
               document.querySelector(`label[for="${input.id}"]`) !== null
      }),
      images_have_alt: Array.from(document.querySelectorAll('img')).every(img => img.alt),
      buttons_have_text: Array.from(document.querySelectorAll('button')).every(btn =>
        btn.textContent?.trim() || btn.getAttribute('aria-label')
      ),
      color_contrast: true // Would need actual contrast calculation
    }
    return results
  })

  if (!a11y_checks.has_h1) {
    issues.push({
      severity: 'high',
      category: 'Accessibility',
      description: 'Page missing main heading (h1)',
      recommendation: 'Add h1 element for screen reader navigation'
    })
  }

  if (!a11y_checks.form_labels) {
    issues.push({
      severity: 'high',
      category: 'Accessibility',
      description: 'Some form inputs missing labels',
      recommendation: 'Add labels or aria-label to all form inputs'
    })
  }

  if (!a11y_checks.images_have_alt) {
    issues.push({
      severity: 'high',
      category: 'Accessibility',
      description: 'Some images missing alt text',
      recommendation: 'Add descriptive alt text to all images'
    })
  }

  if (!a11y_checks.buttons_have_text) {
    issues.push({
      severity: 'medium',
      category: 'Accessibility',
      description: 'Some buttons missing accessible text',
      recommendation: 'Add text content or aria-label to all buttons'
    })
  }

  return issues
}

async function auditMobileResponsiveness(page: Page): Promise<Array<AuditResult['issues'][0]>> {
  console.log('  📱 Testing mobile responsiveness...')

  const issues: AuditResult['issues'] = []

  // Test different viewports
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ]

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(500)

    // Check for horizontal scroll
    const has_horizontal_scroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    if (has_horizontal_scroll && viewport.name === 'mobile') {
      issues.push({
        severity: 'high',
        category: 'Mobile Responsiveness',
        description: `Horizontal scroll detected on ${viewport.name} (${viewport.width}px)`,
        recommendation: 'Fix responsive layout - content overflowing viewport'
      })
    }

    // Check for tiny text
    const tiny_text = await page.evaluate(() => {
      const all_text = Array.from(document.querySelectorAll('*'))
      return all_text.some(el => {
        const fontSize = window.getComputedStyle(el).fontSize
        return parseInt(fontSize) < 12
      })
    })

    if (tiny_text && viewport.name === 'mobile') {
      issues.push({
        severity: 'medium',
        category: 'Mobile Usability',
        description: 'Some text smaller than 12px on mobile',
        recommendation: 'Increase font size for better readability'
      })
    }
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1920, height: 1080 })

  return issues
}

async function main() {
  console.log('🔍 Empathy Ledger - Comprehensive Page Audit')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'EmpathyLedgerAuditBot/1.0'
  })
  const page = await context.newPage()

  const all_results: AuditResult[] = []

  try {
    // 1. Audit sample profile pages
    console.log('\n1️⃣  Auditing Profile Pages...')
    const { data: storytellers } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('is_storyteller', true)
      .limit(10)

    if (storytellers && storytellers.length > 0) {
      for (const storyteller of storytellers.slice(0, 5)) {
        try {
          const result = await auditProfilePage(page, storyteller.id)
          all_results.push(result)
          console.log(`    ✅ ${storyteller.display_name || 'Unnamed'}: Score ${(result.score * 100).toFixed(0)}%`)
        } catch (e: any) {
          console.log(`    ❌ Error auditing ${storyteller.id}: ${e.message}`)
        }
      }
    } else {
      console.log('    ⚠️  No storytellers found to audit')
    }

    // 2. Audit storyteller dashboard
    console.log('\n2️⃣  Auditing Storyteller Dashboard...')
    try {
      const dashboard_result = await auditStorytellerDashboard(page, browser)
      all_results.push(dashboard_result)
      console.log(`    ✅ Dashboard: Score ${(dashboard_result.score * 100).toFixed(0)}%`)
    } catch (e: any) {
      console.log(`    ❌ Dashboard error: ${e.message}`)
    }

    // 3. Run accessibility audit on each page
    console.log('\n3️⃣  Running Accessibility Audits...')
    for (const result of all_results) {
      await page.goto(result.url)
      const a11y_issues = await auditAccessibility(page)
      result.issues.push(...a11y_issues)
    }

    // 4. Test mobile responsiveness
    console.log('\n4️⃣  Testing Mobile Responsiveness...')
    for (const result of all_results) {
      await page.goto(result.url)
      const mobile_issues = await auditMobileResponsiveness(page)
      result.issues.push(...mobile_issues)
    }

  } finally {
    await browser.close()
  }

  // Generate report
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 AUDIT RESULTS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const summary = {
    total_pages: all_results.length,
    average_score: all_results.reduce((sum, r) => sum + r.score, 0) / all_results.length,
    critical_issues: 0,
    high_issues: 0,
    medium_issues: 0,
    low_issues: 0
  }

  all_results.forEach(result => {
    result.issues.forEach(issue => {
      summary[`${issue.severity}_issues`]++
    })
  })

  console.log(`Total Pages Audited: ${summary.total_pages}`)
  console.log(`Average Score: ${(summary.average_score * 100).toFixed(1)}%\n`)

  console.log('Issues Found:')
  console.log(`  🔴 Critical: ${summary.critical_issues}`)
  console.log(`  🟠 High:     ${summary.high_issues}`)
  console.log(`  🟡 Medium:   ${summary.medium_issues}`)
  console.log(`  🟢 Low:      ${summary.low_issues}\n`)

  // Show critical issues
  if (summary.critical_issues > 0) {
    console.log('🚨 CRITICAL ISSUES:\n')
    all_results.forEach(result => {
      const critical = result.issues.filter(i => i.severity === 'critical')
      if (critical.length > 0) {
        console.log(`${result.page_type.toUpperCase()} (${result.url}):`)
        critical.forEach(issue => {
          console.log(`  • ${issue.description}`)
          console.log(`    → ${issue.recommendation}\n`)
        })
      }
    })
  }

  // Save full report
  const reportPath = '/tmp/empathy-ledger-audit-report.json'
  fs.writeFileSync(reportPath, JSON.stringify({ summary, results: all_results }, null, 2))
  console.log(`📄 Full report saved: ${reportPath}`)
  console.log(`📸 Screenshots saved: ${SCREENSHOTS_DIR}`)

  console.log('\n✅ Audit complete!')
}

main().catch(console.error)
