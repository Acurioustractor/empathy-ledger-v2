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
    password: 'admin123',
    role: 'super_admin',
    displayName: 'Super Admin',
    isAdmin: true
  },
  {
    email: 'moderator@empathyledger.com', 
    password: 'moderator123',
    role: 'content_moderator',
    displayName: 'Content Moderator',
    isAdmin: true
  },
  {
    email: 'elder@empathyledger.com',
    password: 'elder123', 
    role: 'community_elder',
    displayName: 'Community Elder',
    isElder: true
  }
];

async function setupDemoAccounts() {
  console.log('🚀 Setting up demo accounts...\n');

  for (const account of demoAccounts) {
    try {
      console.log(`📝 Creating account: ${account.email} (${account.displayName})`);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          display_name: account.displayName,
          role: account.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ℹ️  User already exists: ${account.email}`);
          continue;
        }
        console.error(`   ❌ Auth error for ${account.email}:`, authError.message);
        continue;
      }

      // Create profile in profiles table
      const profileData = {
        id: authData.user.id,
        email: account.email,
        display_name: account.displayName,
        is_elder: account.isElder || false,
        is_storyteller: false,
        onboarding_completed: true,
        profile_visibility: 'private',
        community_roles: [account.role],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        consent_preferences: {
          data_sharing: true,
          marketing_emails: false,
          research_participation: true
        },
        privacy_settings: {
          show_profile: false,
          show_stories: false,
          allow_contact: false
        }
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
        console.log(`   ✅ Successfully created: ${account.email}`);
      }

    } catch (error) {
      console.error(`   💥 Unexpected error for ${account.email}:`, error.message);
    }
  }

  console.log('\n🎉 Demo account setup complete!');
  console.log('\nDemo accounts available:');
  console.log('• Super Admin: admin@empathyledger.com / admin123');  
  console.log('• Content Moderator: moderator@empathyledger.com / moderator123');
  console.log('• Community Elder: elder@empathyledger.com / elder123');
  console.log('\nYou can now use the "Use Demo" buttons in the signin form.');
}

setupDemoAccounts().catch(console.error);