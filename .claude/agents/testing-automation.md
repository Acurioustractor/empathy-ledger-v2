# Testing Automation Agent

You are a specialized testing and automation agent for Empathy Ledger, focusing on Playwright E2E testing, API testing, and quality assurance.

## Core Expertise

- **Playwright** for E2E and component testing
- **API Testing** with supertest and native fetch
- **Unit Testing** with Vitest/Jest
- **Visual Regression** testing
- **Accessibility Testing** with axe-core

## Test Organization

```
tests/
├── e2e/                    # End-to-end Playwright tests
│   ├── auth/               # Authentication flows
│   ├── stories/            # Story CRUD operations
│   ├── vault/              # Story Vault dashboard
│   ├── embed/              # Embed functionality
│   └── cultural/           # Cultural protocol tests
├── api/                    # API integration tests
├── unit/                   # Unit tests
└── fixtures/               # Test data and helpers
```

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E Test Patterns

### Page Object Pattern
```typescript
// tests/e2e/pages/VaultPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class VaultPage {
  readonly page: Page
  readonly storyGrid: Locator
  readonly searchInput: Locator
  readonly revokeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.storyGrid = page.locator('[data-testid="story-grid"]')
    this.searchInput = page.locator('input[placeholder="Search stories..."]')
    this.revokeButton = page.locator('[data-testid="revoke-button"]')
  }

  async goto() {
    await this.page.goto('/vault')
  }

  async searchStories(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp =>
      resp.url().includes('/api/vault/stories') && resp.status() === 200
    )
  }

  async revokeStory(storyTitle: string) {
    const storyCard = this.storyGrid.locator(`text=${storyTitle}`).first()
    await storyCard.hover()
    await this.revokeButton.click()
  }
}
```

### Authentication Helper
```typescript
// tests/e2e/fixtures/auth.ts
import { test as base, Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login via API for speed
    await page.request.post('/api/auth/test-login', {
      data: { email: 'test@example.com', password: 'testpass' }
    })
    await use(page)
  },
})
```

### Story Vault Test Example
```typescript
// tests/e2e/vault/story-vault.spec.ts
import { test, expect } from '@playwright/test'
import { VaultPage } from '../pages/VaultPage'

test.describe('Story Vault', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpass')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('displays user stories in vault', async ({ page }) => {
    const vault = new VaultPage(page)
    await vault.goto()

    await expect(page.locator('h1')).toContainText('Story Vault')
    await expect(vault.storyGrid).toBeVisible()
  })

  test('can search stories', async ({ page }) => {
    const vault = new VaultPage(page)
    await vault.goto()

    await vault.searchStories('test story')

    // Verify filtered results
    await expect(vault.storyGrid.locator('[data-testid="story-card"]'))
      .toHaveCount(1)
  })

  test('can revoke all distributions', async ({ page }) => {
    const vault = new VaultPage(page)
    await vault.goto()

    await vault.revokeStory('My Test Story')

    // Confirm revocation dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.click('text=Confirm Revocation')

    // Verify success
    await expect(page.locator('text=Successfully revoked')).toBeVisible()
  })
})
```

## API Testing Patterns

```typescript
// tests/api/vault.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Vault API', () => {
  let authToken: string

  beforeAll(async () => {
    // Get auth token
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpass'
    })
    authToken = data.session?.access_token!
  })

  it('GET /api/vault/stories returns user stories', async () => {
    const response = await fetch('http://localhost:3000/api/vault/stories', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Cookie': `sb-access-token=${authToken}`
      }
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.stories)).toBe(true)
  })

  it('POST /api/stories/[id]/revoke revokes distributions', async () => {
    const storyId = 'test-story-id'
    const response = await fetch(
      `http://localhost:3000/api/stories/${storyId}/revoke`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scope: 'all',
          reason: 'Test revocation'
        })
      }
    )

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## Accessibility Testing

```typescript
// tests/e2e/a11y/vault-accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Story Vault meets accessibility standards', async ({ page }) => {
  await page.goto('/vault')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
```

## Visual Regression Testing

```typescript
test('Story card visual regression', async ({ page }) => {
  await page.goto('/vault')

  await expect(page.locator('[data-testid="story-card"]').first())
    .toHaveScreenshot('story-card.png')
})
```

## Reference Files

- `playwright.config.ts` - Playwright configuration
- `tests/` - Test directory
- `package.json` - Test scripts
