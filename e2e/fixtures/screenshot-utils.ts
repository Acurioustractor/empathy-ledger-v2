import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Screenshot utilities for capturing page designs
 */

export interface ScreenshotOptions {
  fullPage?: boolean;
  viewport?: { width: number; height: number };
  waitForSelector?: string;
  delay?: number;
}

/**
 * Capture a screenshot of any page
 */
export async function capturePageScreenshot(
  page: Page,
  url: string,
  outputPath: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  const { fullPage = true, viewport, waitForSelector, delay = 0 } = options;

  // Set viewport if specified
  if (viewport) {
    await page.setViewportSize(viewport);
  }

  // Navigate to page
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // Wait for specific element if needed
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector);
  }

  // Optional delay for animations
  if (delay > 0) {
    await page.waitForTimeout(delay);
  }

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Capture screenshot
  await page.screenshot({
    path: outputPath,
    fullPage,
  });

  return outputPath;
}

/**
 * Capture multiple viewports of a single page
 */
export async function captureResponsiveScreenshots(
  page: Page,
  url: string,
  baseName: string,
  outputDir: string
): Promise<string[]> {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'laptop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  const screenshots: string[] = [];

  for (const { name, width, height } of viewports) {
    const outputPath = path.join(outputDir, `${baseName}-${name}.png`);
    await capturePageScreenshot(page, url, outputPath, {
      viewport: { width, height },
      fullPage: true,
    });
    screenshots.push(outputPath);
  }

  return screenshots;
}

/**
 * Common viewports for testing
 */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
  mobileLandscape: { width: 812, height: 375 },
};
