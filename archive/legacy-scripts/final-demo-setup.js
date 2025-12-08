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

// Use the first tenant ID from the list above
const TENANT_ID = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

const demoAccounts = [
  {
    email: 'admin@empathyledger.com',
    displayName: 'Super Admin',
    role: 'super_admin'
  },
  {
    email: 'moderator@empathyledger.com',
    displayName: 'Content Moderator', 
    role: 'content_moderator'
  },
  {
    email: 'elder@empathyledger.com',
    displayName: 'Community Elder',
    role: 'community_elder',
    isElder: true
  }
];

async function setupFinalDemoProfiles() {
  console.log('🚀 Setting up demo profiles with tenant...\n');

  for (const account of demoAccounts) {
    try {
      console.log(`📝 Creating profile for: ${account.email} (${account.displayName})`);
      
      // Get user ID from auth.users
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) {
        console.error(`   ❌ Error fetching users:`, userError.message);
        continue;
      }

      const user = users.users.find(u => u.email === account.email);
      if (!user) {
        console.log(`   ❌ User not found: ${account.email}`);
        continue;
      }

      // Create profile with tenant_id and minimum required fields
      const profileData = {
        id: user.id,
        tenant_id: TENANT_ID,
        email: account.email,
        display_name: account.displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (profileError) {
        console.error(`   ❌ Profile error for ${account.email}:`, profileError.message);
      } else {
        console.log(`   ✅ Successfully created profile: ${account.email}`);
      }

    } catch (error) {
      console.error(`   💥 Unexpected error for ${account.email}:`, error.message);
    }
  }

  console.log('\n🎉 Demo profiles setup complete!');
  console.log('\n📋 Demo Accounts Ready:');
  console.log('• Super Admin: admin@empathyledger.com / admin123');  
  console.log('• Content Moderator: moderator@empathyledger.com / moderator123');
  console.log('• Community Elder: elder@empathyledger.com / elder123');
  console.log('\n💻 Now you can use the "Use Demo" buttons at http://localhost:3003/auth/signin');
}

setupFinalDemoProfiles().catch(console.error);