import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Create screenshots directory
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Empathy Ledger Frontend Review', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage Review', async () => {
    await page.goto('http://localhost:3030');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'homepage-full.png'),
      fullPage: true
    });

    // Check for basic elements
    console.log('=== HOMEPAGE ANALYSIS ===');

    // Check if header exists
    const header = page.locator('header');
    if (await header.count() > 0) {
      console.log('✓ Header found');
      await header.screenshot({ path: path.join(screenshotsDir, 'header.png') });
    } else {
      console.log('✗ No header found');
    }

    // Check for navigation
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      console.log('✓ Navigation found');
    } else {
      console.log('✗ No navigation found');
    }

    // Check for main content
    const main = page.locator('main');
    if (await main.count() > 0) {
      console.log('✓ Main content area found');
    } else {
      console.log('✗ No main content area found');
    }

    // Look for typography elements
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    console.log(`📝 Found ${headings} headings`);

    // Check for images
    const images = await page.locator('img').count();
    console.log(`🖼️ Found ${images} images`);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalWidth === 0).length;
    });
    console.log(`🚫 Found ${brokenImages} broken images`);
  });

  test('Storytellers List Page', async () => {
    await page.goto('http://localhost:3030/storytellers');
    await page.waitForLoadState('networkidle');

    console.log('=== STORYTELLERS LIST ANALYSIS ===');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'storytellers-list.png'),
      fullPage: true
    });

    // Check for storyteller cards
    const storytellerCards = await page.locator('[data-testid="storyteller-card"], .storyteller-card, .profile-card').count();
    console.log(`👥 Found ${storytellerCards} storyteller cards`);

    // Check for profile images/avatars
    const avatars = await page.locator('img[alt*="avatar"], img[alt*="profile"], .avatar, .profile-image').count();
    console.log(`🖼️ Found ${avatars} profile images/avatars`);

    // Look for any storyteller links to test individual profiles
    const storytellerLinks = await page.locator('a[href*="/storytellers/"]').all();
    if (storytellerLinks.length > 0) {
      const firstLink = storytellerLinks[0];
      const href = await firstLink.getAttribute('href');
      console.log(`🔗 Found storyteller link: ${href}`);

      // Store the first storyteller ID for detailed review
      if (href) {
        const storytellerId = href.split('/storytellers/')[1]?.split('/')[0];
        if (storytellerId) {
          console.log(`📋 Will review storyteller ID: ${storytellerId}`);
        }
      }
    }
  });

  test('Individual Storyteller Profile Review', async () => {
    // Try to find a storyteller profile to review
    await page.goto('http://localhost:3030/storytellers');
    await page.waitForLoadState('networkidle');

    // Get the first storyteller link
    const storytellerLink = page.locator('a[href*="/storytellers/"]').first();

    if (await storytellerLink.count() > 0) {
      const href = await storytellerLink.getAttribute('href');
      if (href) {
        console.log(`=== REVIEWING STORYTELLER PROFILE: ${href} ===`);

        await page.goto(`http://localhost:3030${href}`);
        await page.waitForLoadState('networkidle');

        // Take full page screenshot
        await page.screenshot({
          path: path.join(screenshotsDir, 'storyteller-profile.png'),
          fullPage: true
        });

        // Check profile image
        const profileImage = page.locator('.profile-image, .avatar, img[alt*="profile"], img[alt*="avatar"]');
        if (await profileImage.count() > 0) {
          console.log('✓ Profile image found');
          await profileImage.first().screenshot({ path: path.join(screenshotsDir, 'profile-image.png') });
        } else {
          console.log('✗ No profile image found');
        }

        // Check for storyteller name/title
        const nameElements = await page.locator('h1, .storyteller-name, .profile-name').count();
        console.log(`📝 Found ${nameElements} name/title elements`);

        // Check for bio/description
        const bioElements = await page.locator('.bio, .description, .about, p').count();
        console.log(`📄 Found ${bioElements} text content elements`);

        // Check for navigation tabs
        const tabs = await page.locator('.tab, .nav-tab, button[role="tab"]').count();
        console.log(`📑 Found ${tabs} navigation tabs`);

        // Check dashboard link
        const dashboardUrl = href.replace('/page', '/dashboard');
        await page.goto(`http://localhost:3030${dashboardUrl}`);
        await page.waitForLoadState('networkidle');

        console.log(`=== REVIEWING STORYTELLER DASHBOARD: ${dashboardUrl} ===`);
        await page.screenshot({
          path: path.join(screenshotsDir, 'storyteller-dashboard.png'),
          fullPage: true
        });

        // Check for dashboard components
        const dashboardCards = await page.locator('.card, .dashboard-card, .metric-card').count();
        console.log(`📊 Found ${dashboardCards} dashboard cards`);
      }
    } else {
      console.log('❌ No storyteller profiles found to review');
    }
  });

  test('Organization Pages Review', async () => {
    await page.goto('http://localhost:3030/organizations');
    await page.waitForLoadState('networkidle');

    console.log('=== ORGANIZATIONS LIST ANALYSIS ===');

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'organizations-list.png'),
      fullPage: true
    });

    // Look for organization cards/links
    const orgLinks = await page.locator('a[href*="/organizations/"]').all();
    if (orgLinks.length > 0) {
      const firstOrgLink = orgLinks[0];
      const href = await firstOrgLink.getAttribute('href');

      if (href) {
        console.log(`=== REVIEWING ORGANIZATION: ${href} ===`);

        await page.goto(`http://localhost:3030${href}`);
        await page.waitForLoadState('networkidle');

        // Take screenshot
        await page.screenshot({
          path: path.join(screenshotsDir, 'organization-page.png'),
          fullPage: true
        });

        // Check for organization branding
        const logos = await page.locator('img[alt*="logo"], .logo, .organization-logo').count();
        console.log(`🏢 Found ${logos} organization logos`);

        // Check for member sections
        const memberSections = await page.locator('.members, .storytellers, [data-testid*="member"]').count();
        console.log(`👥 Found ${memberSections} member sections`);

        // Check for analytics/metrics
        const metrics = await page.locator('.metric, .stat, .analytics, .chart').count();
        console.log(`📊 Found ${metrics} metric/analytics elements`);
      }
    }
  });

  test('Visual Design Assessment', async () => {
    console.log('=== VISUAL DESIGN ANALYSIS ===');

    // Check homepage for design elements
    await page.goto('http://localhost:3030');
    await page.waitForLoadState('networkidle');

    // Analyze typography
    const typographyAnalysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
      const fontFamilies = new Set();
      const fontSizes = new Set();
      const colors = new Set();

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        fontFamilies.add(styles.fontFamily);
        fontSizes.add(styles.fontSize);
        colors.add(styles.color);
      });

      return {
        fontFamilies: Array.from(fontFamilies).slice(0, 10),
        fontSizes: Array.from(fontSizes).slice(0, 20),
        colors: Array.from(colors).slice(0, 15)
      };
    });

    console.log('🔤 Font Families:', typographyAnalysis.fontFamilies);
    console.log('📏 Font Sizes:', typographyAnalysis.fontSizes);
    console.log('🎨 Colors:', typographyAnalysis.colors);

    // Check for CSS framework usage
    const cssFramework = await page.evaluate(() => {
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const inlineStyles = Array.from(document.querySelectorAll('style'));
      const allCSS = stylesheets.map(s => s.href || '').join(' ') +
                   inlineStyles.map(s => s.textContent || '').join(' ');

      const frameworks = {
        tailwind: allCSS.includes('tailwind') || document.querySelector('.bg-') !== null,
        bootstrap: allCSS.includes('bootstrap'),
        materialUI: allCSS.includes('mui') || allCSS.includes('material'),
        chakra: allCSS.includes('chakra'),
        antd: allCSS.includes('antd')
      };

      return frameworks;
    });

    console.log('🎨 CSS Frameworks detected:', cssFramework);

    // Check spacing consistency
    const spacingAnalysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const margins = new Set();
      const paddings = new Set();

      Array.from(elements).slice(0, 100).forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.margin !== '0px') margins.add(styles.margin);
        if (styles.padding !== '0px') paddings.add(styles.padding);
      });

      return {
        uniqueMargins: margins.size,
        uniquePaddings: paddings.size
      };
    });

    console.log('📐 Spacing Analysis:', spacingAnalysis);
  });

  test('Responsive Design Check', async () => {
    console.log('=== RESPONSIVE DESIGN ANALYSIS ===');

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3030');
      await page.waitForLoadState('networkidle');

      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.screenshot({
        path: path.join(screenshotsDir, `homepage-${viewport.name.toLowerCase()}.png`),
        fullPage: true
      });

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        console.log(`⚠️ Horizontal scroll detected on ${viewport.name}`);
      } else {
        console.log(`✓ No horizontal scroll on ${viewport.name}`);
      }
    }
  });

  test('Accessibility Quick Check', async () => {
    console.log('=== ACCESSIBILITY ANALYSIS ===');

    await page.goto('http://localhost:3030');
    await page.waitForLoadState('networkidle');

    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    const totalImages = await page.locator('img').count();
    console.log(`🖼️ Images without alt text: ${imagesWithoutAlt}/${totalImages}`);

    // Check for heading hierarchy
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map(h => h.tagName);
    });
    console.log('📝 Heading hierarchy:', headings);

    // Check for color contrast issues (basic check)
    const contrastIssues = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).slice(0, 50);
      let issues = 0;

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Very basic contrast check - would need proper algorithm for production
        if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
          issues++;
        }
      });

      return issues;
    });
    console.log(`🎨 Potential contrast issues: ${contrastIssues}`);
  });
});