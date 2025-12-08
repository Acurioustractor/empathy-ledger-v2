const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.yvnuayzslukamizrlhwb:Qe08M1w4E4kaDLzh@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('🔌 Connected to Supabase database\n');
    console.log('🚀 Starting Phase 1 Migration...\n');

    // Step 1: Add columns
    console.log('Step 1: Adding columns to organizations table...');
    await client.query(`
      ALTER TABLE organizations
        ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS domain TEXT,
        ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
    `);
    console.log('✅ Columns added\n');

    // Step 2: Copy data from tenants
    console.log('Step 2: Copying data from tenants to organizations...');
    const updateResult = await client.query(`
      UPDATE organizations o
      SET
        subscription_tier = COALESCE(t.subscription_tier, 'free'),
        subscription_status = COALESCE(t.status, 'active'),
        domain = t.domain,
        settings = COALESCE(t.settings, '{}'::jsonb),
        onboarded_at = t.onboarded_at,
        cultural_protocols = COALESCE(o.cultural_protocols, t.cultural_protocols, '{}'::jsonb)
      FROM tenants t
      WHERE o.tenant_id = t.id;
    `);
    console.log(`✅ Updated ${updateResult.rowCount} organizations\n`);

    // Step 3: Create indexes
    console.log('Step 3: Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);');
    console.log('✅ Indexes created\n');

    // Step 4: Verify
    console.log('Step 4: Verifying migration...');
    const verifyResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(subscription_tier) as with_tier,
        COUNT(domain) as with_domain
      FROM organizations;
    `);

    console.log('📊 Verification Results:');
    console.log(`  Total organizations: ${verifyResult.rows[0].total}`);
    console.log(`  With subscription_tier: ${verifyResult.rows[0].with_tier}`);
    console.log(`  With domain: ${verifyResult.rows[0].with_domain}`);

    // Sample data
    const sample = await client.query(`
      SELECT id, name, subscription_tier, subscription_status, domain
      FROM organizations
      LIMIT 3;
    `);

    console.log('\n📋 Sample organizations:');
    sample.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.subscription_tier} (${row.subscription_status})`);
    });

    console.log('\n✅ Phase 1 Migration Complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();