/**
 * Generate PRD from Brand Audit Results
 *
 * Takes the brand audit report and creates a Ralph-compatible PRD
 * with prioritized user stories for fixing design issues.
 *
 * Run with: npx tsx scripts/ralph/generate-audit-prd.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
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
  issues: AuditIssue[];
}

interface PRDStory {
  id: string;
  title: string;
  description: string;
  priority: number;
  passes: boolean;
  acceptance_criteria: string[];
  files_to_modify: string[];
  tests_required: string[];
  notes: string;
}

interface PRD {
  name: string;
  description: string;
  created: string;
  priority_order: string;
  stories: PRDStory[];
  completion_criteria: {
    all_stories_pass: boolean;
    ci_green: boolean;
    no_type_errors: boolean;
  };
}

function groupIssuesByFile(issues: AuditIssue[]): Map<string, AuditIssue[]> {
  const grouped = new Map<string, AuditIssue[]>();

  issues.forEach(issue => {
    const existing = grouped.get(issue.file) || [];
    existing.push(issue);
    grouped.set(issue.file, existing);
  });

  return grouped;
}

function createStoryForFile(
  file: string,
  issues: AuditIssue[],
  priority: number
): PRDStory {
  const colorIssues = issues.filter(i => i.type === 'color');
  const typographyIssues = issues.filter(i => i.type === 'typography');
  const spacingIssues = issues.filter(i => i.type === 'spacing');

  const criteria: string[] = [];

  if (colorIssues.length > 0) {
    criteria.push(`Fix ${colorIssues.length} color issues - replace non-brand colors with palette`);
  }
  if (typographyIssues.length > 0) {
    criteria.push(`Fix ${typographyIssues.length} typography issues - use serif for headings`);
  }
  if (spacingIssues.length > 0) {
    criteria.push(`Fix ${spacingIssues.length} spacing issues - align to 8pt grid`);
  }
  criteria.push('File builds without type errors');
  criteria.push('Visual appearance matches brand guidelines');

  const shortPath = file.replace('src/', '');
  const fileId = shortPath
    .replace(/[\/\.]/g, '-')
    .replace('tsx', '')
    .replace('ts', '')
    .toUpperCase()
    .slice(0, 20);

  return {
    id: `BRAND-${String(priority).padStart(3, '0')}`,
    title: `Fix brand compliance in ${shortPath}`,
    description: `Update ${shortPath} to use brand colors, typography, and spacing per style guide`,
    priority,
    passes: false,
    acceptance_criteria: criteria,
    files_to_modify: [file],
    tests_required: ['npm run build passes', 'npm run lint passes'],
    notes: `Issues: ${colorIssues.length} color, ${typographyIssues.length} typography, ${spacingIssues.length} spacing`,
  };
}

function generatePRD(auditResult: AuditResult): PRD {
  const groupedIssues = groupIssuesByFile(auditResult.issues);

  // Sort files by issue count (most issues first for highest priority)
  const sortedFiles = Array.from(groupedIssues.entries())
    .sort((a, b) => b[1].length - a[1].length);

  // Create stories for top 20 files with most issues
  const stories: PRDStory[] = sortedFiles
    .slice(0, 20)
    .map(([file, issues], index) => createStoryForFile(file, issues, index + 1));

  return {
    name: 'Brand Compliance Fixes',
    description: `Fix ${auditResult.totalIssues} brand compliance issues across ${auditResult.totalFiles} files`,
    created: new Date().toISOString(),
    priority_order: 'Files sorted by issue count (most issues = highest priority)',
    stories,
    completion_criteria: {
      all_stories_pass: true,
      ci_green: true,
      no_type_errors: true,
    },
  };
}

async function main() {
  const auditReportPath = 'scripts/ralph/brand-audit-report.json';

  if (!fs.existsSync(auditReportPath)) {
    console.error('Brand audit report not found. Run brand-audit.ts first.');
    console.error('  npx tsx scripts/ralph/brand-audit.ts');
    process.exit(1);
  }

  const auditResult: AuditResult = JSON.parse(
    fs.readFileSync(auditReportPath, 'utf-8')
  );

  console.log('Generating PRD from audit results...');
  console.log(`  Total issues: ${auditResult.totalIssues}`);
  console.log(`  Total files: ${auditResult.totalFiles}`);

  const prd = generatePRD(auditResult);

  // Save PRD
  const prdPath = 'scripts/ralph/prd-brand-fixes.json';
  fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));

  console.log(`\nPRD generated with ${prd.stories.length} stories`);
  console.log(`Saved to: ${prdPath}`);
  console.log('\nTo run Ralph with this PRD:');
  console.log(`  ./scripts/ralph/ralph.sh ${prdPath}`);
}

main().catch(console.error);
