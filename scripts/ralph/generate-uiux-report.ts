/**
 * Generate Comprehensive UI/UX Report
 *
 * Combines:
 * - Route inventory
 * - Visual audit screenshots
 * - Brand compliance issues
 * - Component analysis
 *
 * Run with: npx tsx scripts/ralph/generate-uiux-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RouteInfo {
  path: string;
  name: string;
  category: string;
  description: string;
  file?: string;
  components?: string[];
  hasScreenshot?: boolean;
}

interface ComponentInfo {
  name: string;
  path: string;
  type: 'page' | 'component' | 'ui' | 'layout';
  usedIn: string[];
  brandCompliant?: boolean;
  issues?: string[];
}

interface UIUXReport {
  generated: string;
  summary: {
    totalRoutes: number;
    totalComponents: number;
    screenshotsCaptured: number;
    brandIssues: number;
  };
  routes: {
    public: RouteInfo[];
    auth: RouteInfo[];
    admin: RouteInfo[];
    analytics: RouteInfo[];
    organisation: RouteInfo[];
    storyteller: RouteInfo[];
    other: RouteInfo[];
  };
  components: {
    ui: ComponentInfo[];
    pages: ComponentInfo[];
    features: ComponentInfo[];
  };
  brandCompliance: {
    score: number;
    issues: {
      type: string;
      count: number;
      files: string[];
    }[];
  };
  recommendations: string[];
}

async function analyzeRoutes(): Promise<RouteInfo[]> {
  const pageFiles = await glob('src/app/**/page.tsx');
  const routes: RouteInfo[] = [];

  for (const file of pageFiles) {
    // Extract route path from file path
    let routePath = file
      .replace('src/app', '')
      .replace('/page.tsx', '')
      .replace(/\(.*?\)\//g, '/') // Remove route groups like (public)/
      .replace(/\[([^\]]+)\]/g, ':$1'); // Convert [id] to :id

    if (routePath === '') routePath = '/';

    // Determine category
    let category = 'other';
    if (routePath.startsWith('/admin')) category = 'admin';
    else if (routePath.startsWith('/auth')) category = 'auth';
    else if (routePath.startsWith('/analytics')) category = 'analytics';
    else if (routePath.startsWith('/organisations') || routePath.startsWith('/organization')) category = 'organisation';
    else if (routePath.startsWith('/storyteller')) category = 'storyteller';
    else if (['/', '/about', '/stories', '/browse', '/how-it-works', '/privacy', '/guidelines', '/projects', '/galleries'].some(p => routePath === p || routePath.startsWith(p + '/'))) category = 'public';

    const name = routePath
      .split('/')
      .filter(Boolean)
      .join('-') || 'homepage';

    routes.push({
      path: routePath,
      name,
      category,
      description: `Page at ${routePath}`,
      file,
    });
  }

  return routes;
}

async function analyzeComponents(): Promise<ComponentInfo[]> {
  const componentFiles = await glob('src/components/**/*.tsx');
  const components: ComponentInfo[] = [];

  for (const file of componentFiles) {
    const name = path.basename(file, '.tsx');
    let type: ComponentInfo['type'] = 'component';

    if (file.includes('/ui/')) type = 'ui';
    else if (file.includes('/layout')) type = 'layout';
    else if (file.includes('/pages/')) type = 'page';

    components.push({
      name,
      path: file,
      type,
      usedIn: [], // Would need AST analysis for accurate usage
    });
  }

  return components;
}

async function loadBrandAudit(): Promise<{
  issues: { type: string; count: number; files: string[] }[];
  score: number;
}> {
  const auditPath = 'scripts/ralph/brand-audit-report.json';

  if (!fs.existsSync(auditPath)) {
    return { issues: [], score: 100 };
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));

  const issuesByType: Record<string, { count: number; files: Set<string> }> = {};

  (audit.issues || []).forEach((issue: { type: string; file: string }) => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = { count: 0, files: new Set() };
    }
    issuesByType[issue.type].count++;
    issuesByType[issue.type].files.add(issue.file);
  });

  const issues = Object.entries(issuesByType).map(([type, data]) => ({
    type,
    count: data.count,
    files: Array.from(data.files),
  }));

  // Simple score: 100 - (issues / 10), min 0
  const score = Math.max(0, 100 - Math.floor((audit.totalIssues || 0) / 10));

  return { issues, score };
}

function countScreenshots(): number {
  const screenshotDir = 'e2e/audit/screenshots';
  if (!fs.existsSync(screenshotDir)) return 0;

  try {
    const files = fs.readdirSync(screenshotDir, { recursive: true });
    return files.filter((f: string | Buffer) => f.toString().endsWith('.png')).length;
  } catch {
    return 0;
  }
}

function generateRecommendations(report: Partial<UIUXReport>): string[] {
  const recommendations: string[] = [];

  // Based on brand compliance
  const brandScore = report.brandCompliance?.score || 100;
  if (brandScore < 70) {
    recommendations.push('CRITICAL: Run Ralph with brand-fixes PRD to address color/typography issues');
  } else if (brandScore < 90) {
    recommendations.push('Run brand audit fixes to improve compliance score');
  }

  // Based on route coverage
  const publicRoutes = report.routes?.public?.length || 0;
  if (publicRoutes > 0) {
    recommendations.push(`Review ${publicRoutes} public pages for consistent user experience`);
  }

  // General recommendations
  recommendations.push('Ensure all pages use Editorial Warmth color palette');
  recommendations.push('Verify serif fonts for headings, sans-serif for body text');
  recommendations.push('Check responsive design on mobile/tablet viewports');
  recommendations.push('Run visual regression tests before releases');
  recommendations.push('Review accessibility (WCAG 2.1 AA compliance)');

  return recommendations;
}

function groupRoutesByCategory(routes: RouteInfo[]): UIUXReport['routes'] {
  return {
    public: routes.filter(r => r.category === 'public'),
    auth: routes.filter(r => r.category === 'auth'),
    admin: routes.filter(r => r.category === 'admin'),
    analytics: routes.filter(r => r.category === 'analytics'),
    organisation: routes.filter(r => r.category === 'organisation'),
    storyteller: routes.filter(r => r.category === 'storyteller'),
    other: routes.filter(r => r.category === 'other'),
  };
}

function groupComponentsByType(components: ComponentInfo[]): UIUXReport['components'] {
  return {
    ui: components.filter(c => c.type === 'ui'),
    pages: components.filter(c => c.type === 'page'),
    features: components.filter(c => c.type === 'component' || c.type === 'layout'),
  };
}

async function generateReport(): Promise<UIUXReport> {
  console.log('Generating UI/UX Report...\n');

  // Analyze routes
  console.log('Analyzing routes...');
  const routes = await analyzeRoutes();
  console.log(`  Found ${routes.length} routes`);

  // Analyze components
  console.log('Analyzing components...');
  const components = await analyzeComponents();
  console.log(`  Found ${components.length} components`);

  // Load brand audit
  console.log('Loading brand audit...');
  const brandCompliance = await loadBrandAudit();
  console.log(`  Brand compliance score: ${brandCompliance.score}%`);

  // Count screenshots
  const screenshotCount = countScreenshots();
  console.log(`  Screenshots captured: ${screenshotCount}`);

  const report: UIUXReport = {
    generated: new Date().toISOString(),
    summary: {
      totalRoutes: routes.length,
      totalComponents: components.length,
      screenshotsCaptured: screenshotCount,
      brandIssues: brandCompliance.issues.reduce((sum, i) => sum + i.count, 0),
    },
    routes: groupRoutesByCategory(routes),
    components: groupComponentsByType(components),
    brandCompliance,
    recommendations: [],
  };

  report.recommendations = generateRecommendations(report);

  return report;
}

function generateMarkdownReport(report: UIUXReport): string {
  return `# Empathy Ledger UI/UX Audit Report

**Generated:** ${report.generated}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Routes | ${report.summary.totalRoutes} |
| Total Components | ${report.summary.totalComponents} |
| Screenshots Captured | ${report.summary.screenshotsCaptured} |
| Brand Issues | ${report.summary.brandIssues} |
| Brand Compliance Score | ${report.brandCompliance.score}% |

---

## Route Inventory

### Public Pages (${report.routes.public.length})
${report.routes.public.length > 0 ? report.routes.public.map(r => `- \`${r.path}\` - ${r.description}`).join('\n') : '_No public pages found_'}

### Auth Pages (${report.routes.auth.length})
${report.routes.auth.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

### Admin Pages (${report.routes.admin.length})
${report.routes.admin.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

### Analytics Pages (${report.routes.analytics.length})
${report.routes.analytics.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

### Organisation Pages (${report.routes.organisation.length})
${report.routes.organisation.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

### Storyteller Pages (${report.routes.storyteller.length})
${report.routes.storyteller.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

### Other Pages (${report.routes.other.length})
${report.routes.other.map(r => `- \`${r.path}\` - ${r.description}`).join('\n')}

---

## Component Inventory

### UI Components (${report.components.ui.length})
${report.components.ui.slice(0, 20).map(c => `- \`${c.name}\` - ${c.path}`).join('\n')}
${report.components.ui.length > 20 ? `\n_...and ${report.components.ui.length - 20} more_` : ''}

### Page Components (${report.components.pages.length})
${report.components.pages.map(c => `- \`${c.name}\` - ${c.path}`).join('\n')}

### Feature Components (${report.components.features.length})
${report.components.features.slice(0, 30).map(c => `- \`${c.name}\` - ${c.path}`).join('\n')}
${report.components.features.length > 30 ? `\n_...and ${report.components.features.length - 30} more_` : ''}

---

## Brand Compliance

**Score: ${report.brandCompliance.score}%**

### Issues by Type
${report.brandCompliance.issues.map(i => `- **${i.type}**: ${i.count} issues in ${i.files.length} files`).join('\n')}

---

## Recommendations

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## Next Steps

1. **Run Visual Audit**:
   \`\`\`bash
   npm run test:visual
   \`\`\`

2. **Run Brand Compliance Check**:
   \`\`\`bash
   npx tsx scripts/ralph/brand-audit.ts
   \`\`\`

3. **Generate Fix PRD**:
   \`\`\`bash
   npx tsx scripts/ralph/generate-audit-prd.ts
   \`\`\`

4. **Run Ralph to Fix Issues**:
   \`\`\`bash
   ./scripts/ralph/ralph.sh scripts/ralph/prd-brand-fixes.json
   \`\`\`

5. **Review Screenshots**:
   \`\`\`bash
   npx playwright show-report
   \`\`\`

---

## Brand Guidelines Reference

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Ochre | #96643a | Earth, ancestry, land |
| Terracotta | #b84a32 | Primary actions, storytelling |
| Sage | #5c6d51 | Growth, success, healing |
| Charcoal | #42291a | Text, depth, grounding |
| Cream | #faf6f1 | Backgrounds, space |

### Typography
- **Headings**: Georgia (serif) - dignified, permanent
- **Body**: System sans-serif - clean, accessible
- **Captions**: System sans-serif, smaller size

### Spacing
- 8pt grid system (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)

---

*This report was generated automatically. Review with design team before implementing changes.*
`;
}

async function main() {
  const report = await generateReport();

  // Save JSON report
  const jsonPath = 'scripts/ralph/UIUX_AUDIT_REPORT.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\nJSON report saved to: ${jsonPath}`);

  // Save Markdown report
  const mdPath = 'scripts/ralph/UIUX_AUDIT_REPORT.md';
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, mdReport);
  console.log(`Markdown report saved to: ${mdPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('UI/UX AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Routes: ${report.summary.totalRoutes}`);
  console.log(`Components: ${report.summary.totalComponents}`);
  console.log(`Brand Score: ${report.brandCompliance.score}%`);
  console.log(`Screenshots: ${report.summary.screenshotsCaptured}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
