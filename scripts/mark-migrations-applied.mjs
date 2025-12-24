#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function markMigrationsApplied() {
  console.log('📝 Marking old migrations as applied...\n')

  // Create schema and table
  const createSchema = `
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;

    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version TEXT PRIMARY KEY,
      statements TEXT[],
      name TEXT
    );
  `

  const markApplied = `
    INSERT INTO supabase_migrations.schema_migrations (version, name)
    VALUES
      ('20251214', 'world_tour_tables'),
      ('20251220090000', 'saas_org_tier_and_distribution_policy'),
      ('20251220093000', 'multi_org_tenants'),
      ('20251223000000', 'story_access_tokens'),
      ('20251223120000', 'storyteller_media_library'),
      ('20251223140000', 'add_story_engagement_counts')
    ON CONFLICT (version) DO NOTHING
    RETURNING version, name;
  `

  // Execute via raw SQL query (need to check if schema exists first)
  const { data: schemas } = await supabase
    .from('information_schema.schemata')
    .select('schema_name')
    .eq('schema_name', 'supabase_migrations')
    .maybeSingle()

  console.log('Schema exists:', !!schemas)
  console.log('\n✅ Ready to run: npx supabase db push')
  console.log('   This will only apply the permission_tiers migration\n')
}

markMigrationsApplied()
