import { test, expect, Page } from '@playwright/test';
import path from 'path';

const screenshotsDir = path.join(process.cwd(), 'screenshots');

test.describe('Manual Page Reviews', () => {
  test('Direct storytellers page review', async ({ page }) => {
    console.log('=== MANUAL STORYTELLERS PAGE REVIEW ===');

    // Set longer timeout and don't wait for networkidle
    test.setTimeout(60000);
    await page.goto('http://localhost:3030/storytellers', { waitUntil: 'domcontentloaded' });

    // Wait a bit for content to load
    await page.waitForTimeout(3000);

    // Take screenshot regardless
    await page.screenshot({
      path: path.join(screenshotsDir, 'storytellers-manual.png'),
      fullPage: true
    });

    // Check what's on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()),
        hasStorytellerLinks: document.querySelectorAll('a[href*="/storytellers/"]').length,
        hasImages: document.querySelectorAll('img').length,
        hasProfileCards: document.querySelectorAll('.profile-card, .storyteller-card, [data-testid*="storyteller"]').length,
        bodyText: document.body.textContent?.substring(0, 500)
      };
    });

    console.log('Page Analysis:', pageContent);
  });

  test('Check specific storyteller IDs from database', async ({ page }) => {
    console.log('=== CHECKING FOR ACTUAL STORYTELLER DATA ===');

    // Try some common test IDs
    const testIds = ['1', '2', 'test', 'demo'];

    for (const id of testIds) {
      try {
        const response = await page.goto(`http://localhost:3030/storytellers/${id}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        if (response?.status() === 200) {
          console.log(`✓ Found storyteller at ID: ${id}`);
          await page.screenshot({
            path: path.join(screenshotsDir, `storyteller-${id}.png`),
            fullPage: true
          });

          // Get profile info
          const profileInfo = await page.evaluate(() => {
            return {
              name: document.querySelector('h1, .name, .storyteller-name')?.textContent?.trim(),
              hasProfileImage: !!document.querySelector('img[alt*="profile"], img[alt*="avatar"], .avatar'),
              hasNavigation: !!document.querySelector('.nav, .tabs, [role="tablist"]'),
              sections: Array.from(document.querySelectorAll('section, .section')).length
            };
          });

          console.log(`Profile info for ID ${id}:`, profileInfo);
          break; // Found one, stop checking
        }
      } catch (error) {
        console.log(`✗ No storyteller found at ID: ${id}`);
      }
    }
  });

  test('Organization page detailed review', async ({ page }) => {
    console.log('=== ORGANIZATION PAGE DETAILED REVIEW ===');

    await page.goto('http://localhost:3030/organizations', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, 'organizations-detailed.png'),
      fullPage: true
    });

    const orgAnalysis = await page.evaluate(() => {
      const orgLinks = Array.from(document.querySelectorAll('a[href*="/organizations/"]'));
      return {
        totalOrgLinks: orgLinks.length,
        orgIds: orgLinks.map(link => {
          const href = link.getAttribute('href');
          return href?.split('/organizations/')[1]?.split('/')[0];
        }).filter(Boolean).slice(0, 5), // Get first 5 IDs
        hasOrgCards: document.querySelectorAll('.organization-card, .org-card, [data-testid*="org"]').length,
        hasLogos: document.querySelectorAll('img[alt*="logo"], .logo').length
      };
    });

    console.log('Organization Analysis:', orgAnalysis);

    // Test first organization page if available
    if (orgAnalysis.orgIds.length > 0) {
      const firstOrgId = orgAnalysis.orgIds[0];
      await page.goto(`http://localhost:3030/organizations/${firstOrgId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: path.join(screenshotsDir, `organization-${firstOrgId}.png`),
        fullPage: true
      });

      const orgPageInfo = await page.evaluate(() => {
        return {
          orgName: document.querySelector('h1, .org-name, .organization-name')?.textContent?.trim(),
          hasLogo: !!document.querySelector('img[alt*="logo"], .logo'),
          hasMemberSection: !!document.querySelector('.members, .storytellers, [data-testid*="member"]'),
          hasAnalytics: !!document.querySelector('.analytics, .metrics, .stats, .chart'),
          hasProjects: !!document.querySelector('.projects, [data-testid*="project"]'),
          navigationTabs: Array.from(document.querySelectorAll('.nav a, .tab, button[role="tab"]')).map(el => el.textContent?.trim()).filter(Boolean)
        };
      });

      console.log(`Organization ${firstOrgId} details:`, orgPageInfo);
    }
  });

  test('Visual design deep dive', async ({ page }) => {
    console.log('=== VISUAL DESIGN DEEP DIVE ===');

    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Analyze design patterns
    const designAnalysis = await page.evaluate(() => {
      // Check for modern CSS features
      const hasGridLayouts = Array.from(document.querySelectorAll('*')).some(el =>
        getComputedStyle(el).display === 'grid'
      );

      const hasFlexLayouts = Array.from(document.querySelectorAll('*')).some(el =>
        getComputedStyle(el).display === 'flex'
      );

      // Check for custom properties (CSS variables)
      const hasCSSVariables = document.documentElement.style.cssText.includes('--') ||
        Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule =>
              rule.cssText && rule.cssText.includes('--')
            );
          } catch { return false; }
        });

      // Check for animations/transitions
      const hasAnimations = Array.from(document.querySelectorAll('*')).some(el => {
        const styles = getComputedStyle(el);
        return styles.transition !== 'all 0s ease 0s' || styles.animation !== 'none';
      });

      // Check button styles
      const buttons = Array.from(document.querySelectorAll('button, .btn, input[type="button"]'));
      const buttonStyles = buttons.slice(0, 5).map(btn => {
        const styles = getComputedStyle(btn);
        return {
          background: styles.background,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize
        };
      });

      // Check card components
      const cards = Array.from(document.querySelectorAll('.card, .panel, .box, [class*="card"]'));
      const cardStyles = cards.slice(0, 3).map(card => {
        const styles = getComputedStyle(card);
        return {
          background: styles.background,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      });

      return {
        hasGridLayouts,
        hasFlexLayouts,
        hasCSSVariables,
        hasAnimations,
        buttonCount: buttons.length,
        buttonStyles,
        cardCount: cards.length,
        cardStyles,
        overallColorScheme: {
          primaryText: getComputedStyle(document.body).color,
          background: getComputedStyle(document.body).backgroundColor,
          fontSize: getComputedStyle(document.body).fontSize,
          fontFamily: getComputedStyle(document.body).fontFamily
        }
      };
    });

    console.log('Design Analysis:', designAnalysis);

    // Check for specific component patterns
    const componentAnalysis = await page.evaluate(() => {
      return {
        hasHeaderNavigation: !!document.querySelector('header nav, .header-nav'),
        hasFooter: !!document.querySelector('footer'),
        hasBreadcrumbs: !!document.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]'),
        hasSearchBar: !!document.querySelector('input[type="search"], .search-input, [placeholder*="search"]'),
        hasUserProfile: !!document.querySelector('.user-profile, .profile-menu, [data-testid*="profile"]'),
        hasNotifications: !!document.querySelector('.notification, .alert, .toast'),
        hasModals: !!document.querySelector('.modal, .dialog, [role="dialog"]'),
        hasTabs: !!document.querySelector('.tab, [role="tab"], .tab-panel'),
        hasDropdowns: !!document.querySelector('.dropdown, .menu, [role="menu"]'),
        hasTooltips: !!document.querySelector('[title], [aria-describedby]')
      };
    });

    console.log('Component Analysis:', componentAnalysis);
  });
});