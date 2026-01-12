/**
 * Table Usage Audit Script
 *
 * Purpose: Identify which of the 207 database tables are actually used in the codebase
 * Goal: Find the ~144 unused tables for archival (Phase 3 of Database Organization Plan)
 *
 * Methodology:
 * 1. Get all table names from Supabase
 * 2. Grep for usage in:
 *    - API routes (src/app/api)
 *    - Components (src/components)
 *    - Scripts (scripts/)
 *    - Lib/services (src/lib)
 * 3. Classify tables by usage tier:
 *    - Tier 1: Active (used in 3+ locations)
 *    - Tier 2: Moderate (used in 1-2 locations)
 *    - Tier 3: Minimal (only in migrations)
 *    - Tier 4: Unused (zero usage - candidates for archival)
 * 4. Generate classification markdown docs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TableUsage {
  table: string;
  apiRoutes: string[];
  components: string[];
  scripts: string[];
  libServices: string[];
  totalRefs: number;
  tier: 'Active' | 'Moderate' | 'Minimal' | 'Unused';
  classification: 'source' | 'transform' | 'aggregation' | 'presentation' | 'infrastructure' | 'unknown';
}

/**
 * Get all table names from Supabase
 */
async function getAllTables(): Promise<string[]> {
  console.log('📊 Fetching all tables from Supabase...');

  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .order('tablename');

  if (error) {
    throw new Error(`Failed to fetch tables: ${error.message}`);
  }

  const tables = data.map((row: any) => row.tablename);
  console.log(`   Found ${tables.length} tables in public schema\n`);

  return tables;
}

/**
 * Grep for table usage in codebase
 */
function grepForTable(table: string, directory: string): string[] {
  try {
    // Escape special characters for grep regex
    const escapedTable = table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Use ripgrep (rg) if available, fallback to grep
    let cmd: string;
    try {
      execSync('which rg', { stdio: 'ignore' });
      cmd = `rg --no-heading --line-number "${escapedTable}" ${directory} 2>/dev/null || true`;
    } catch {
      cmd = `grep -rn "${escapedTable}" ${directory} 2>/dev/null || true`;
    }

    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

    if (!output.trim()) {
      return [];
    }

    // Parse output to get unique file paths
    const lines = output.split('\n').filter((line) => line.trim());
    const files = new Set<string>();

    lines.forEach((line) => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    });

    return Array.from(files);
  } catch (error) {
    // Grep returns non-zero exit code if no matches found
    return [];
  }
}

/**
 * Classify table by data flow layer
 */
function classifyTable(table: string, usage: TableUsage): TableUsage['classification'] {
  // Source layer (raw data entry)
  const sourceTables = [
    'profiles',
    'storytellers',
    'transcripts',
    'media_assets',
    'stories',
    'organizations',
    'projects',
    'locations',
  ];

  // Transform layer (AI processing)
  const transformTables = [
    'transcript_analysis_results',
    'media_ai_analysis',
    'storyteller_master_analysis', // NEW ACT table
    'extracted_quotes',
    'narrative_themes',
  ];

  // Aggregation layer (rollup)
  const aggregationTables = [
    'project_impact_analysis', // NEW ACT table
    'organization_impact_intelligence', // NEW ACT table
    'global_impact_intelligence', // NEW ACT table
    'storyteller_analytics',
  ];

  // Presentation layer (UI/API serving)
  const presentationTables = [
    'empathy_ledger_knowledge_base', // NEW ACT table
    'story_themes',
    'media_links',
  ];

  if (sourceTables.includes(table)) return 'source';
  if (transformTables.includes(table)) return 'transform';
  if (aggregationTables.includes(table)) return 'aggregation';
  if (presentationTables.includes(table)) return 'presentation';

  // Infrastructure (logs, cache, admin, internal)
  if (
    table.includes('_log') ||
    table.includes('_cache') ||
    table.includes('_backup') ||
    table.includes('_migration') ||
    table.includes('admin_') ||
    table.includes('_sync')
  ) {
    return 'infrastructure';
  }

  return 'unknown';
}

/**
 * Audit all tables for usage
 */
async function auditAllTables(): Promise<TableUsage[]> {
  const tables = await getAllTables();
  const usageData: TableUsage[] = [];

  console.log('🔍 Auditing table usage across codebase...');
  console.log(`   This may take a few minutes (${tables.length} tables to check)\n`);

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];

    // Progress indicator
    if ((i + 1) % 20 === 0) {
      console.log(`   Progress: ${i + 1}/${tables.length} tables checked...`);
    }

    const apiRoutes = grepForTable(table, 'src/app/api');
    const components = grepForTable(table, 'src/components');
    const scripts = grepForTable(table, 'scripts');
    const libServices = grepForTable(table, 'src/lib');

    const totalRefs = apiRoutes.length + components.length + scripts.length + libServices.length;

    let tier: TableUsage['tier'];
    if (totalRefs >= 3) {
      tier = 'Active';
    } else if (totalRefs >= 1) {
      tier = 'Moderate';
    } else {
      // Check if only in migrations
      const migrationRefs = grepForTable(table, 'supabase/migrations');
      tier = migrationRefs.length > 0 ? 'Minimal' : 'Unused';
    }

    const usage: TableUsage = {
      table,
      apiRoutes,
      components,
      scripts,
      libServices,
      totalRefs,
      tier,
      classification: 'unknown', // Will classify after
    };

    usage.classification = classifyTable(table, usage);

    usageData.push(usage);
  }

  console.log(`\n✅ Audit complete!\n`);
  return usageData;
}

/**
 * Generate classification markdown document
 */
async function generateClassificationDoc(usageData: TableUsage[]) {
  const outputPath = path.join(process.cwd(), 'docs/04-database/TABLE_CLASSIFICATION.md');

  const active = usageData.filter((u) => u.tier === 'Active');
  const moderate = usageData.filter((u) => u.tier === 'Moderate');
  const minimal = usageData.filter((u) => u.tier === 'Minimal');
  const unused = usageData.filter((u) => u.tier === 'Unused');

  const byClassification = {
    source: usageData.filter((u) => u.classification === 'source'),
    transform: usageData.filter((u) => u.classification === 'transform'),
    aggregation: usageData.filter((u) => u.classification === 'aggregation'),
    presentation: usageData.filter((u) => u.classification === 'presentation'),
    infrastructure: usageData.filter((u) => u.classification === 'infrastructure'),
    unknown: usageData.filter((u) => u.classification === 'unknown'),
  };

  let markdown = `# Database Table Classification (${usageData.length} tables)

**Generated**: ${new Date().toISOString().split('T')[0]}
**Purpose**: Identify active vs unused tables for ACT Unified Analysis System alignment

---

## Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| **Active Tables** (≥3 refs) | ${active.length} | ${((active.length / usageData.length) * 100).toFixed(0)}% |
| **Moderate Tables** (1-2 refs) | ${moderate.length} | ${((moderate.length / usageData.length) * 100).toFixed(0)}% |
| **Minimal Tables** (migrations only) | ${minimal.length} | ${((minimal.length / usageData.length) * 100).toFixed(0)}% |
| **Unused Tables** (zero refs) | ${unused.length} | ${((unused.length / usageData.length) * 100).toFixed(0)}% |

### By Data Flow Layer

| Layer | Count | Percentage |
|-------|-------|------------|
| **Source** (raw data entry) | ${byClassification.source.length} | ${((byClassification.source.length / usageData.length) * 100).toFixed(0)}% |
| **Transform** (AI processing) | ${byClassification.transform.length} | ${((byClassification.transform.length / usageData.length) * 100).toFixed(0)}% |
| **Aggregation** (rollup) | ${byClassification.aggregation.length} | ${((byClassification.aggregation.length / usageData.length) * 100).toFixed(0)}% |
| **Presentation** (UI/API) | ${byClassification.presentation.length} | ${((byClassification.presentation.length / usageData.length) * 100).toFixed(0)}% |
| **Infrastructure** (logs/cache) | ${byClassification.infrastructure.length} | ${((byClassification.infrastructure.length / usageData.length) * 100).toFixed(0)}% |
| **Unknown** (needs classification) | ${byClassification.unknown.length} | ${((byClassification.unknown.length / usageData.length) * 100).toFixed(0)}% |

---

## Active Tables (${active.length} tables)

**Definition**: Used in 3+ locations (API + components + scripts + lib)

### Source Layer (${byClassification.source.filter((u) => u.tier === 'Active').length} tables)

| Table | Total Refs | API Routes | Components | Scripts | Lib Services |
|-------|-----------|-----------|-----------|---------|-------------|
`;

  byClassification.source
    .filter((u) => u.tier === 'Active')
    .sort((a, b) => b.totalRefs - a.totalRefs)
    .forEach((u) => {
      markdown += `| \`${u.table}\` | ${u.totalRefs} | ${u.apiRoutes.length} | ${u.components.length} | ${u.scripts.length} | ${u.libServices.length} |\n`;
    });

  markdown += `\n### Transform Layer (${byClassification.transform.filter((u) => u.tier === 'Active').length} tables)\n\n`;
  markdown += `| Table | Total Refs | API Routes | Components | Scripts | Lib Services |\n|-------|-----------|-----------|-----------|---------|-------------|\n`;

  byClassification.transform
    .filter((u) => u.tier === 'Active')
    .sort((a, b) => b.totalRefs - a.totalRefs)
    .forEach((u) => {
      markdown += `| \`${u.table}\` | ${u.totalRefs} | ${u.apiRoutes.length} | ${u.components.length} | ${u.scripts.length} | ${u.libServices.length} |\n`;
    });

  markdown += `\n### Aggregation Layer (${byClassification.aggregation.filter((u) => u.tier === 'Active').length} tables)\n\n`;
  markdown += `| Table | Total Refs | API Routes | Components | Scripts | Lib Services |\n|-------|-----------|-----------|-----------|---------|-------------|\n`;

  byClassification.aggregation
    .filter((u) => u.tier === 'Active')
    .sort((a, b) => b.totalRefs - a.totalRefs)
    .forEach((u) => {
      markdown += `| \`${u.table}\` | ${u.totalRefs} | ${u.apiRoutes.length} | ${u.components.length} | ${u.scripts.length} | ${u.libServices.length} |\n`;
    });

  markdown += `\n### Presentation Layer (${byClassification.presentation.filter((u) => u.tier === 'Active').length} tables)\n\n`;
  markdown += `| Table | Total Refs | API Routes | Components | Scripts | Lib Services |\n|-------|-----------|-----------|-----------|---------|-------------|\n`;

  byClassification.presentation
    .filter((u) => u.tier === 'Active')
    .sort((a, b) => b.totalRefs - a.totalRefs)
    .forEach((u) => {
      markdown += `| \`${u.table}\` | ${u.totalRefs} | ${u.apiRoutes.length} | ${u.components.length} | ${u.scripts.length} | ${u.libServices.length} |\n`;
    });

  markdown += `\n---\n\n## Moderate Tables (${moderate.length} tables)\n\n**Definition**: Used in 1-2 locations\n\n`;
  markdown += `| Table | Classification | Total Refs | Used In |\n|-------|---------------|-----------|----------|\n`;

  moderate
    .sort((a, b) => b.totalRefs - a.totalRefs)
    .forEach((u) => {
      const usedIn: string[] = [];
      if (u.apiRoutes.length) usedIn.push(`API (${u.apiRoutes.length})`);
      if (u.components.length) usedIn.push(`Components (${u.components.length})`);
      if (u.scripts.length) usedIn.push(`Scripts (${u.scripts.length})`);
      if (u.libServices.length) usedIn.push(`Lib (${u.libServices.length})`);

      markdown += `| \`${u.table}\` | ${u.classification} | ${u.totalRefs} | ${usedIn.join(', ')} |\n`;
    });

  markdown += `\n---\n\n## Minimal Tables (${minimal.length} tables)\n\n**Definition**: Only referenced in migrations (potential archival candidates)\n\n`;
  markdown += `| Table | Classification | Reason for Minimal Usage |\n|-------|---------------|-------------------------|\n`;

  minimal.forEach((u) => {
    const reason = u.classification === 'infrastructure' ? 'Internal/logging table' : 'Possibly obsolete or replaced';
    markdown += `| \`${u.table}\` | ${u.classification} | ${reason} |\n`;
  });

  markdown += `\n---\n\n## Unused Tables (${unused.length} tables) ⚠️\n\n**Definition**: ZERO references in codebase (archival candidates)\n\n`;
  markdown += `| Table | Classification | Archival Recommendation |\n|-------|---------------|------------------------|\n`;

  unused.forEach((u) => {
    const recommendation =
      u.classification === 'infrastructure'
        ? 'Safe to archive (internal table)'
        : u.table.includes('_2024') || u.table.includes('_2025')
        ? 'Safe to archive (legacy timestamp table)'
        : 'Review before archival (may be future feature)';

    markdown += `| \`${u.table}\` | ${u.classification} | ${recommendation} |\n`;
  });

  markdown += `\n---\n\n## ACT Unified Analysis Tables (NEW)\n\n**These are the 5 new tables for ACT impact framework:**\n\n`;

  const actTables = [
    'storyteller_master_analysis',
    'project_impact_analysis',
    'organization_impact_intelligence',
    'global_impact_intelligence',
    'empathy_ledger_knowledge_base',
  ];

  const actUsage = usageData.filter((u) => actTables.includes(u.table));

  if (actUsage.length > 0) {
    markdown += `| Table | Classification | Status |\n|-------|---------------|--------|\n`;
    actUsage.forEach((u) => {
      markdown += `| \`${u.table}\` | ${u.classification} | ${u.tier === 'Active' ? '✅ Active' : '⚠️ Not yet integrated'} |\n`;
    });
  } else {
    markdown += `> **Note**: ACT tables not yet deployed. Run migration \`20260115000000_act_unified_analysis_system.sql\` first.\n`;
  }

  markdown += `\n---\n\n## Next Steps\n\n### Phase 3: Archive Unused Tables\n\n1. **Review archival candidates**: ${unused.length} tables with zero usage
2. **Create archive schema**: \`CREATE SCHEMA IF NOT EXISTS archive;\`
3. **Move tables in batches**:
   - Phase 3.1: ${Math.min(50, unused.length)} tables
   - Phase 3.2: ${Math.max(0, Math.min(50, unused.length - 50))} tables
   - Phase 3.3: ${Math.max(0, unused.length - 100)} tables
4. **Verify no breakage**: Test all API routes post-archival

### Phase 4: Document Data Flow

- **Source Tables**: ${byClassification.source.length} tables documented
- **Transform Tables**: ${byClassification.transform.length} tables documented
- **Aggregation Tables**: ${byClassification.aggregation.length} tables documented
- **Presentation Tables**: ${byClassification.presentation.length} tables documented

---

**Generated by**: \`scripts/audit-table-usage.ts\`
**Next**: Run \`npm run classify:archival\` to generate archival plan
`;

  await fs.writeFile(outputPath, markdown, 'utf-8');
  console.log(`✅ Generated: ${outputPath}`);
}

/**
 * Generate archival candidates document
 */
async function generateArchivalDoc(usageData: TableUsage[]) {
  const outputPath = path.join(process.cwd(), 'docs/04-database/ARCHIVAL_CANDIDATES.md');

  const unused = usageData.filter((u) => u.tier === 'Unused');

  let markdown = `# Tables to Archive (${unused.length} tables)

**Generated**: ${new Date().toISOString().split('T')[0]}
**Purpose**: Identify safe-to-archive tables for Phase 3 of Database Organization Plan

---

## Rationale

Tables with **ZERO usage** in:
- API routes (\`src/app/api\`)
- Components (\`src/components\`)
- Scripts (\`scripts/\`)
- Lib/services (\`src/lib\`)

Only referenced in:
- Old migrations (\`supabase/migrations\`)

---

## Archive Strategy

**Approach**: Move to \`archive\` schema (NOT delete)
- **Why archive, not delete?** Preservation for rollback if needed
- **Retention policy**: 90-day review period before purge consideration

---

## Phase 1 Archive (First ${Math.min(50, unused.length)} tables)

| Table | Classification | Reason | Safe to Archive? |
|-------|---------------|--------|------------------|
`;

  unused.slice(0, 50).forEach((u) => {
    const reason = u.table.includes('_log')
      ? 'Legacy logging table'
      : u.table.includes('_2024') || u.table.includes('_2025')
      ? 'Timestamped legacy table'
      : u.table.includes('_cache')
      ? 'Old cache system'
      : u.table.includes('_backup')
      ? 'Migration backup'
      : u.classification === 'infrastructure'
      ? 'Internal/admin table (unused)'
      : 'Replaced or obsolete feature';

    const safe = u.classification === 'infrastructure' || u.table.includes('_20') || u.table.includes('_log');

    markdown += `| \`${u.table}\` | ${u.classification} | ${reason} | ${safe ? '✅ Yes' : '⚠️ Review'} |\n`;
  });

  if (unused.length > 50) {
    markdown += `\n---\n\n## Phase 2 Archive (Next ${Math.min(50, unused.length - 50)} tables)\n\n`;
    markdown += `| Table | Classification | Reason | Safe to Archive? |\n|-------|---------------|--------|------------------|\n`;

    unused.slice(50, 100).forEach((u) => {
      const reason = u.table.includes('_log')
        ? 'Legacy logging table'
        : u.table.includes('_2024') || u.table.includes('_2025')
        ? 'Timestamped legacy table'
        : 'Replaced or obsolete';

      const safe = u.classification === 'infrastructure' || u.table.includes('_20') || u.table.includes('_log');

      markdown += `| \`${u.table}\` | ${u.classification} | ${reason} | ${safe ? '✅ Yes' : '⚠️ Review'} |\n`;
    });
  }

  if (unused.length > 100) {
    markdown += `\n---\n\n## Phase 3 Archive (Remaining ${unused.length - 100} tables)\n\n`;
    markdown += `| Table | Classification | Reason | Safe to Archive? |\n|-------|---------------|--------|------------------|\n`;

    unused.slice(100).forEach((u) => {
      const reason = 'Replaced or obsolete feature';
      markdown += `| \`${u.table}\` | ${u.classification} | ${reason} | ⚠️ Review |\n`;
    });
  }

  markdown += `\n---\n\n## Migration Scripts

### Create Archive Schema

\`\`\`sql
-- supabase/migrations/20260116000000_create_archive_schema.sql
CREATE SCHEMA IF NOT EXISTS archive;

COMMENT ON SCHEMA archive IS
  'Archived tables as of 2026-01-16. Tables moved here have zero usage in codebase.
   Can be restored if needed. Will be reviewed for purge after 90-day retention period.';

GRANT USAGE ON SCHEMA archive TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA archive TO service_role;
\`\`\`

### Archive Phase 1 (First ${Math.min(50, unused.length)} tables)

\`\`\`sql
-- supabase/migrations/20260116000001_archive_unused_tables_phase1.sql
${unused
  .slice(0, 50)
  .map((u) => `ALTER TABLE ${u.table} SET SCHEMA archive;`)
  .join('\n')}

-- Log archival
CREATE TABLE IF NOT EXISTS archival_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  archived_by TEXT DEFAULT current_user
);

INSERT INTO archival_log (table_name, reason)
VALUES
${unused
  .slice(0, 50)
  .map((u) => `  ('${u.table}', 'Zero usage detected by automated audit')`)
  .join(',\n')};
\`\`\`

${
  unused.length > 50
    ? `### Archive Phase 2 (Next ${Math.min(50, unused.length - 50)} tables)

\`\`\`sql
-- supabase/migrations/20260116000002_archive_unused_tables_phase2.sql
${unused
  .slice(50, 100)
  .map((u) => `ALTER TABLE ${u.table} SET SCHEMA archive;`)
  .join('\n')}

INSERT INTO archival_log (table_name, reason)
VALUES
${unused
  .slice(50, 100)
  .map((u) => `  ('${u.table}', 'Zero usage detected by automated audit')`)
  .join(',\n')};
\`\`\`
`
    : ''
}

${
  unused.length > 100
    ? `### Archive Phase 3 (Remaining ${unused.length - 100} tables)

\`\`\`sql
-- supabase/migrations/20260116000003_archive_unused_tables_phase3.sql
${unused
  .slice(100)
  .map((u) => `ALTER TABLE ${u.table} SET SCHEMA archive;`)
  .join('\n')}

INSERT INTO archival_log (table_name, reason)
VALUES
${unused
  .slice(100)
  .map((u) => `  ('${u.table}', 'Zero usage detected by automated audit')`)
  .join(',\n')};
\`\`\`
`
    : ''
}

---

## Verification

After each phase, verify:

\`\`\`bash
# Check public schema count (should decrease)
npx supabase db exec "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';"

# Check archive schema count (should increase)
npx supabase db exec "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'archive';"

# Verify archival log
npx supabase db exec "SELECT table_name, archived_at FROM archival_log ORDER BY archived_at DESC LIMIT 10;"
\`\`\`

---

## Rollback Plan

If a table is needed after archival:

\`\`\`sql
-- Restore table from archive
ALTER TABLE archive.{table_name} SET SCHEMA public;

-- Remove from archival log
DELETE FROM archival_log WHERE table_name = '{table_name}';
\`\`\`

---

**Generated by**: \`scripts/audit-table-usage.ts\`
**Next**: Manual review → Apply Phase 1 migration → Verify → Proceed to Phase 2
`;

  await fs.writeFile(outputPath, markdown, 'utf-8');
  console.log(`✅ Generated: ${outputPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(80));
  console.log('📊 TABLE USAGE AUDIT - ACT Database Organization');
  console.log('═'.repeat(80));
  console.log();

  try {
    const usageData = await auditAllTables();

    console.log('📝 Generating classification documents...\n');

    await generateClassificationDoc(usageData);
    await generateArchivalDoc(usageData);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ AUDIT COMPLETE!');
    console.log('═'.repeat(80));
    console.log();

    const active = usageData.filter((u) => u.tier === 'Active').length;
    const moderate = usageData.filter((u) => u.tier === 'Moderate').length;
    const minimal = usageData.filter((u) => u.tier === 'Minimal').length;
    const unused = usageData.filter((u) => u.tier === 'Unused').length;

    console.log(`📊 Summary:`);
    console.log(`   Active:   ${active} tables (${((active / usageData.length) * 100).toFixed(0)}%)`);
    console.log(`   Moderate: ${moderate} tables (${((moderate / usageData.length) * 100).toFixed(0)}%)`);
    console.log(`   Minimal:  ${minimal} tables (${((minimal / usageData.length) * 100).toFixed(0)}%)`);
    console.log(`   Unused:   ${unused} tables (${((unused / usageData.length) * 100).toFixed(0)}%) ← Archival candidates`);
    console.log();
    console.log(`📄 Documents generated:`);
    console.log(`   - docs/04-database/TABLE_CLASSIFICATION.md`);
    console.log(`   - docs/04-database/ARCHIVAL_CANDIDATES.md`);
    console.log();
    console.log(`🔜 Next steps:`);
    console.log(`   1. Review archival candidates (${unused} tables)`);
    console.log(`   2. Run Phase 3 migration to archive unused tables`);
    console.log(`   3. Verify no breakage with \`npm run test:api\``);
    console.log('═'.repeat(80));
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run audit
main();
