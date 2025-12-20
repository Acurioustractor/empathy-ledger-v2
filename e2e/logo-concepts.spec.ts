import { test, expect } from '@playwright/test'

test('logo concepts preview loads without broken images', async ({ page }) => {
  await page.goto('/preview.html')
  await expect(page).toHaveTitle(/Empathy Ledger/i)

  await page.waitForLoadState('networkidle')

  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.filter((img) => !img.complete || img.naturalWidth === 0).length
  })

  expect(brokenImages).toBe(0)
})

