import { test, expect, Page } from '@playwright/test';
import { ALL_ROUTES, PUBLIC_ROUTES, RouteConfig } from './routes';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Visual Audit Test Suite
 * Captures screenshots of all pages for brand compliance review
 *
 * Run with: npx playwright test e2e/audit/visual-audit.spec.ts --project=chromium
 * Update snapshots: npx playwright test e2e/audit/visual-audit.spec.ts --update-snapshots
 */

const AUDIT_OUTPUT_DIR = 'e2e/audit/screenshots';
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// Ensure output directory exists
if (!fs.existsSync(AUDIT_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIT_OUTPUT_DIR, { recursive: true });
}

// Initialize audit report
const auditReport: {
  timestamp: string;
  routes: {
    path: string;
    name: string;
    category: string;
    screenshots: {
      viewport: string;
      file: string;
      status: 'captured' | 'error';
      error?: string;
    }[];
  }[];
} = {
  timestamp: new Date().toISOString(),
  routes: [],
};

async function capturePageScreenshots(
  page: Page,
  route: RouteConfig,
  viewport: keyof typeof VIEWPORTS
) {
  const { width, height } = VIEWPORTS[viewport];
  await page.setViewportSize({ width, height });

  const filename = `${route.category}/${route.name}-${viewport}.png`;
  const filepath = path.join(AUDIT_OUTPUT_DIR, filename);

  // Ensure category directory exists
  const categoryDir = path.join(AUDIT_OUTPUT_DIR, route.category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  try {
    await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500); // Allow animations to settle

    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    return { viewport, file: filename, status: 'captured' as const };
  } catch (error) {
    return {
      viewport,
      file: filename,
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

test.describe('Visual Audit - Public Pages @audit', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`Capture ${route.name} screenshots`, async ({ page }) => {
      const routeReport = {
        path: route.path,
        name: route.name,
        category: route.category,
        screenshots: [] as typeof auditReport.routes[0]['screenshots'],
      };

      // Capture all viewports
      for (const viewport of Object.keys(VIEWPORTS) as (keyof typeof VIEWPORTS)[]) {
        const result = await capturePageScreenshots(page, route, viewport);
        routeReport.screenshots.push(result);
      }

      auditReport.routes.push(routeReport);

      // At least one screenshot should succeed
      const successCount = routeReport.screenshots.filter(s => s.status === 'captured').length;
      expect(successCount).toBeGreaterThan(0);
    });
  }
});

test.describe('Visual Audit - Auth Pages @audit', () => {
  const authRoutes = ALL_ROUTES.filter(r => r.category === 'auth');

  for (const route of authRoutes) {
    test(`Capture ${route.name} screenshots`, async ({ page }) => {
      const routeReport = {
        path: route.path,
        name: route.name,
        category: route.category,
        screenshots: [] as typeof auditReport.routes[0]['screenshots'],
      };

      for (const viewport of Object.keys(VIEWPORTS) as (keyof typeof VIEWPORTS)[]) {
        const result = await capturePageScreenshots(page, route, viewport);
        routeReport.screenshots.push(result);
      }

      auditReport.routes.push(routeReport);
      expect(routeReport.screenshots.some(s => s.status === 'captured')).toBe(true);
    });
  }
});

// Save report after all tests
test.afterAll(async () => {
  const reportPath = path.join(AUDIT_OUTPUT_DIR, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`\nAudit report saved to: ${reportPath}`);
  console.log(`Total routes captured: ${auditReport.routes.length}`);
});
