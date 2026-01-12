import { test, expect } from '@playwright/test';

/**
 * Visual tests for Empathy Ledger public homepage
 * Run with: npm run test:visual
 * Update snapshots: npm run test:visual:update
 */

test.describe('Homepage Visual Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for network to settle
    await page.waitForLoadState('networkidle');
  });

  test('homepage full page screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
    });
  });

  test('hero section screenshot', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('hero-section.png');
  });

  test('mobile viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
    });
  });

  test('tablet viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
    });
  });
});

test.describe('Homepage Interaction Screenshots @visual', () => {
  test('navigation menu open state', async ({ page }) => {
    await page.goto('/');
    // Mobile menu if present
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page).toHaveScreenshot('navigation-menu-open.png');
    }
  });
});
