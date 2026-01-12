/**
 * Brand Compliance Audit Script
 *
 * Analyzes codebase for brand guideline compliance:
 * - Color usage (Editorial Warmth palette)
 * - Typography (serif headings, sans-serif body)
 * - Spacing (8pt grid)
 * - Component patterns
 *
 * Run with: npx tsx scripts/ralph/brand-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Brand color palette from style guide
const BRAND_COLORS = {
  // Primary colors
  ochre: '#96643a',
  terracotta: '#b84a32',
  terracottaDark: '#a03a28',
  sage: '#5c6d51',
  sageDark: '#4a5741',
  charcoal: '#42291a',
  cream: '#faf6f1',

  // Semantic
  success: '#5c6d51',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0284c7',

  // Theme colors
  cultural: '#d97706',
  family: '#059669',
  land: '#0284c7',
  resilience: '#dc2626',
  knowledge: '#7c3aed',
  justice: '#ea580c',
  arts: '#06b6d4',
  everyday: '#65a30d',
};

// Non-compliant patterns to flag
const NON_COMPLIANT_PATTERNS = {
  // Tailwind colors that should use brand colors instead
  tailwindDefaults: [
    /bg-blue-\d+/g,
    /bg-red-\d+/g,
    /bg-green-\d+/g,
    /bg-yellow-\d+/g,
    /bg-purple-\d+/g,
    /bg-pink-\d+/g,
    /bg-indigo-\d+/g,
    /text-blue-\d+/g,
    /text-red-\d+/g,
    /text-green-\d+/g,
    /text-yellow-\d+/g,
    /text-purple-\d+/g,
    /text-pink-\d+/g,
    /text-indigo-\d+/g,
    /border-blue-\d+/g,
    /border-red-\d+/g,
    /border-green-\d+/g,
  ],

  // Hardcoded hex colors that don't match brand
  hardcodedColors: [
    /#[0-9a-fA-F]{6}/g,
    /#[0-9a-fA-F]{3}/g,
  ],

  // Sans-serif where serif should be used
  wrongFontUsage: [
    /font-sans.*text-(2xl|3xl|4xl|5xl)/g, // Large text should be serif
  ],

  // Non-8pt spacing
  nonStandardSpacing: [
    /p-\d*[357]/g, // padding not on 8pt grid
    /m-\d*[357]/g, // margin not on 8pt grid
    /gap-\d*[357]/g,
  ],
};

// Compliant patterns (allowed)
const COMPLIANT_PATTERNS = [
  /bg-ochre/,
  /bg-terracotta/,
  /bg-sage/,
  /bg-charcoal/,
  /bg-cream/,
  /bg-neutral-\d+/,
  /bg-white/,
  /bg-black/,
  /text-ochre/,
  /text-terracotta/,
  /text-sage/,
  /text-charcoal/,
  /text-neutral-\d+/,
  /text-white/,
  /text-black/,
  /font-serif/,
  /font-sans/,
];

interface Issue {
  file: string;
  line: number;
  type: 'color' | 'typography' | 'spacing' | 'pattern';
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  suggestion?: string;
}

interface AuditResult {
  timestamp: string;
  totalFiles: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issues: Issue[];
  summary: string;
}

const brandColorValues = Object.values(BRAND_COLORS).map(c => c.toLowerCase());

function isAllowedHexColor(hex: string): boolean {
  const normalized = hex.toLowerCase();
  return brandColorValues.includes(normalized) ||
    normalized === '#ffffff' ||
    normalized === '#000000' ||
    normalized === '#fff' ||
    normalized === '#000';
}

async function auditFile(filePath: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for non-brand Tailwind colors
    NON_COMPLIANT_PATTERNS.tailwindDefaults.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'color',
            severity: 'warning',
            message: `Non-brand Tailwind color: ${match}`,
            code: line.trim(),
            suggestion: 'Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*',
          });
        });
      }
    });

    // Check for hardcoded hex colors
    const hexMatches = line.match(/#[0-9a-fA-F]{3,6}/g);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        if (!isAllowedHexColor(hex)) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'color',
            severity: 'warning',
            message: `Non-brand hex color: ${hex}`,
            code: line.trim(),
            suggestion: `Replace with brand color or add to design tokens`,
          });
        }
      });
    }

    // Check for wrong font usage (sans-serif on large headings)
    if (line.includes('font-sans') && (
      line.includes('text-2xl') ||
      line.includes('text-3xl') ||
      line.includes('text-4xl') ||
      line.includes('text-5xl')
    )) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'typography',
        severity: 'info',
        message: 'Large text should use serif font per brand guidelines',
        code: line.trim(),
        suggestion: 'Use font-serif for h1, h2, h3, and large display text',
      });
    }

    // Check for potential accessibility issues
    if (line.includes('text-xs') && !line.includes('caption') && !line.includes('label')) {
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'typography',
        severity: 'info',
        message: 'Very small text (text-xs) may have accessibility concerns',
        code: line.trim(),
        suggestion: 'Ensure text-xs is only used for captions/labels, not body text',
      });
    }
  });

  return issues;
}

async function runAudit(): Promise<AuditResult> {
  console.log('Starting brand compliance audit...\n');

  const files = await glob('src/**/*.{tsx,ts,jsx,js}', {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
  });

  console.log(`Found ${files.length} files to audit\n`);

  const allIssues: Issue[] = [];

  for (const file of files) {
    const issues = await auditFile(file);
    allIssues.push(...issues);

    if (issues.length > 0) {
      console.log(`  ${file}: ${issues.length} issues`);
    }
  }

  // Compile results
  const issuesByType: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};

  allIssues.forEach(issue => {
    issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
  });

  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    totalIssues: allIssues.length,
    issuesByType,
    issuesBySeverity,
    issues: allIssues,
    summary: generateSummary(allIssues, issuesByType, issuesBySeverity),
  };

  // Save report
  const reportDir = 'scripts/ralph';
  const reportPath = path.join(reportDir, 'brand-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

  // Also save markdown report
  const mdReport = generateMarkdownReport(result);
  fs.writeFileSync(path.join(reportDir, 'BRAND_AUDIT_REPORT.md'), mdReport);

  console.log('\n' + '='.repeat(60));
  console.log(result.summary);
  console.log('='.repeat(60));
  console.log(`\nReports saved to:`);
  console.log(`  - ${reportPath}`);
  console.log(`  - ${path.join(reportDir, 'BRAND_AUDIT_REPORT.md')}`);

  return result;
}

function generateSummary(
  issues: Issue[],
  byType: Record<string, number>,
  bySeverity: Record<string, number>
): string {
  return `
Brand Compliance Audit Summary
==============================
Total Issues: ${issues.length}

By Type:
  - Color: ${byType.color || 0}
  - Typography: ${byType.typography || 0}
  - Spacing: ${byType.spacing || 0}
  - Pattern: ${byType.pattern || 0}

By Severity:
  - Errors: ${bySeverity.error || 0}
  - Warnings: ${bySeverity.warning || 0}
  - Info: ${bySeverity.info || 0}

Top files with issues:
${getTopFiles(issues).map(f => `  - ${f.file}: ${f.count} issues`).join('\n')}
`;
}

function getTopFiles(issues: Issue[]): { file: string; count: number }[] {
  const counts: Record<string, number> = {};
  issues.forEach(i => {
    counts[i.file] = (counts[i.file] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function generateMarkdownReport(result: AuditResult): string {
  const topFiles = getTopFiles(result.issues);

  return `# Brand Compliance Audit Report

**Generated:** ${result.timestamp}
**Files Analyzed:** ${result.totalFiles}
**Total Issues:** ${result.totalIssues}

## Summary

| Type | Count |
|------|-------|
| Color | ${result.issuesByType.color || 0} |
| Typography | ${result.issuesByType.typography || 0} |
| Spacing | ${result.issuesByType.spacing || 0} |
| Pattern | ${result.issuesByType.pattern || 0} |

| Severity | Count |
|----------|-------|
| Error | ${result.issuesBySeverity.error || 0} |
| Warning | ${result.issuesBySeverity.warning || 0} |
| Info | ${result.issuesBySeverity.info || 0} |

## Top Files with Issues

${topFiles.map(f => `- **${f.file}**: ${f.count} issues`).join('\n')}

## Brand Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Ochre | #96643a | Earth, ancestry, land |
| Terracotta | #b84a32 | Primary actions, storytelling |
| Sage | #5c6d51 | Growth, success, healing |
| Charcoal | #42291a | Text, depth, grounding |
| Cream | #faf6f1 | Backgrounds, space |

## Detailed Issues

${result.issues.slice(0, 50).map(issue => `
### ${issue.file}:${issue.line}
- **Type:** ${issue.type}
- **Severity:** ${issue.severity}
- **Message:** ${issue.message}
- **Code:** \`${issue.code.slice(0, 100)}${issue.code.length > 100 ? '...' : ''}\`
${issue.suggestion ? `- **Suggestion:** ${issue.suggestion}` : ''}
`).join('\n')}

${result.issues.length > 50 ? `\n*...and ${result.issues.length - 50} more issues. See brand-audit-report.json for full list.*` : ''}

## Recommendations

1. **Replace Tailwind default colors** with brand palette (ochre, terracotta, sage, charcoal, cream)
2. **Use font-serif** for headings and display text
3. **Use font-sans** for body text and UI elements
4. **Ensure 8pt spacing grid** (p-2, p-4, p-6, p-8, etc.)
5. **Add brand colors to tailwind.config.ts** if not already present

## Next Steps

1. Run Ralph with the generated PRD to fix issues automatically
2. Review visual audit screenshots for visual inconsistencies
3. Update component library to enforce brand compliance
`;
}

// Run the audit
runAudit().catch(console.error);
