import { test, expect } from '@playwright/test';

/**
 * Visual tests for all public pages
 * Captures screenshots for design review
 */

const publicPages = [
  { path: '/', name: 'homepage' },
  { path: '/stories', name: 'stories-list' },
  { path: '/storytellers', name: 'storytellers-list' },
  { path: '/about', name: 'about' },
  { path: '/login', name: 'login' },
];

test.describe('Public Pages Screenshots @visual', () => {
  for (const { path, name } of publicPages) {
    test(`${name} page screenshot`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
        fullPage: true,
      });
    });

    test(`${name} page mobile screenshot`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
      });
    });
  }
});
