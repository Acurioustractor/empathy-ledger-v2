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

const demoAccounts = [
  {
    email: 'admin@empathyledger.com',
    role: 'super_admin',
    displayName: 'Super Admin'
  },
  {
    email: 'moderator@empathyledger.com', 
    role: 'content_moderator',
    displayName: 'Content Moderator'
  },
  {
    email: 'elder@empathyledger.com',
    role: 'community_elder',
    displayName: 'Community Elder',
    isElder: true
  }
];

async function updateDemoProfiles() {
  console.log('🚀 Updating demo account profiles...\n');

  for (const account of demoAccounts) {
    try {
      console.log(`📝 Updating profile: ${account.email} (${account.displayName})`);
      
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

      // Create/update profile with basic essential fields only
      const profileData = {
        id: user.id,
        email: account.email,
        display_name: account.displayName,
        is_elder: account.isElder || false,
        is_storyteller: false,
        onboarding_completed: true,
        profile_visibility: 'private',
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
        console.log(`   ✅ Successfully updated profile: ${account.email}`);
      }

    } catch (error) {
      console.error(`   💥 Unexpected error for ${account.email}:`, error.message);
    }
  }

  console.log('\n🎉 Demo profile updates complete!');
  console.log('\nDemo accounts ready:');
  console.log('• Super Admin: admin@empathyledger.com / admin123');  
  console.log('• Content Moderator: moderator@empathyledger.com / moderator123');
  console.log('• Community Elder: elder@empathyledger.com / elder123');
  console.log('\nYou can now use the "Use Demo" buttons in the signin form.');
}

updateDemoProfiles().catch(console.error);