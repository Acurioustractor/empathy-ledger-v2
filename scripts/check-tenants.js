#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTenants() {
  console.log('🔍 Checking for existing tenants...\n');

  try {
    // Check if tenants table exists and get tenants
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error or no tenants table:', error.message);
      
      // Try creating a default tenant
      console.log('🏢 Attempting to create default tenant...');
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert({
          name: 'Default Organization',
          slug: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Could not create tenant:', createError.message);
        return null;
      } else {
        console.log('✅ Created default tenant:', newTenant);
        return newTenant.id;
      }
    } else {
      console.log('✅ Found tenants:', tenants);
      return tenants.length > 0 ? tenants[0].id : null;
    }
  } catch (error) {
    console.error('💥 Error checking tenants:', error.message);
    return null;
  }
}

checkTenants().then(tenantId => {
  if (tenantId) {
    console.log(`\n🎯 Use tenant_id: ${tenantId} for creating demo profiles`);
  } else {
    console.log('\n❌ No tenant available. You might need to create profiles without tenant_id or fix the schema.');
  }
}).catch(console.error);