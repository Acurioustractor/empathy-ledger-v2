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

async function createMinimalProfiles() {
  console.log('🚀 Creating minimal demo profiles...\n');

  const demoAccounts = ['admin@empathyledger.com', 'moderator@empathyledger.com', 'elder@empathyledger.com'];

  for (const email of demoAccounts) {
    try {
      console.log(`📝 Creating profile for: ${email}`);
      
      // Get user ID from auth.users
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        console.error(`   ❌ Error fetching users:`, userError.message);
        continue;
      }

      const user = users.users.find(u => u.email === email);
      if (!user) {
        console.log(`   ❌ User not found: ${email}`);
        continue;
      }

      // Try with minimal data
      const minimalProfile = {
        id: user.id,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(minimalProfile, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (profileError) {
        console.error(`   ❌ Profile error for ${email}:`, profileError.message);
      } else {
        console.log(`   ✅ Successfully created minimal profile: ${email}`);
      }

    } catch (error) {
      console.error(`   💥 Unexpected error for ${email}:`, error.message);
    }
  }

  console.log('\n🎉 Minimal profiles created!');
  console.log('Now try signing in with the demo accounts.');
}

createMinimalProfiles().catch(console.error);