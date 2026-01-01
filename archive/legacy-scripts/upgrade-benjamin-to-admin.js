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

// Use the first tenant ID from our existing setup
const TENANT_ID = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

async function upgradeBenjaminToAdmin() {
  console.log('🚀 Upgrading Benjamin Knight to super admin...\n');

  try {
    // Get existing user from auth
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('❌ Error fetching users:', userError.message);
      return;
    }

    const benjaminUser = users.users.find(u => u.email === 'benjamin@act.place');
    if (!benjaminUser) {
      console.error('❌ User benjamin@act.place not found');
      console.log('Available users:', users.users.map(u => u.email));
      return;
    }

    console.log(`✅ Found existing user: ${benjaminUser.email}`);

    // Create/update profile with full admin privileges
    const profileData = {
      id: benjaminUser.id,
      tenant_id: TENANT_ID,
      email: benjaminUser.email,
      display_name: 'Benjamin Knight',
      full_name: 'Benjamin Knight',
      is_admin: true,
      is_storyteller: true, // So you can create your own stories
      is_elder: false,
      onboarding_completed: true,
      profile_visibility: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: 'Platform creator and administrator',
      occupation: 'Platform Administrator',
      cultural_background: 'Platform Development',
      consent_preferences: {
        data_sharing: true,
        marketing_emails: false,
        research_participation: true,
        cultural_data_usage: true
      },
      privacy_settings: {
        show_profile: false,
        show_stories: true,
        allow_contact: true
      }
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (profileError) {
      console.error(`❌ Profile error:`, profileError.message);
    } else {
      console.log(`✅ Successfully upgraded profile to super admin`);
    }

    console.log('\n🎉 Benjamin Knight super admin upgrade complete!');
    console.log('\n📋 Your Account Details:');
    console.log(`• Email: benjamin@act.place`);
    console.log(`• Role: Super Admin`);
    console.log(`• Can create stories: Yes`);
    console.log(`• Admin access: Full platform control`);
    console.log('\n💻 You can now sign in at: http://localhost:3003/auth/signin');
    console.log('\n🔧 After login, you can:');
    console.log('• Access admin dashboard at /admin');
    console.log('• Create your own stories');
    console.log('• Manage all platform content');
    console.log('• Review and moderate stories');
    console.log('• Manage users and organizations');

  } catch (error) {
    console.error(`💥 Unexpected error:`, error.message);
  }
}

upgradeBenjaminToAdmin().catch(console.error);