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

const adminAccount = {
  email: 'benjamin@act.place',
  password: 'admin123', // You can change this after first login
  displayName: 'Benjamin Knight',
  fullName: 'Benjamin Knight',
  role: 'super_admin'
};

async function createBenjaminAdmin() {
  console.log('🚀 Creating Benjamin Knight super admin account...\n');

  try {
    console.log(`📝 Creating account: ${adminAccount.email} (${adminAccount.displayName})`);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminAccount.email,
      password: adminAccount.password,
      email_confirm: true,
      user_metadata: {
        display_name: adminAccount.displayName,
        full_name: adminAccount.fullName,
        role: adminAccount.role
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ℹ️  User already exists: ${adminAccount.email}`);
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === adminAccount.email);
        
        if (!existingUser) {
          console.error('   ❌ Could not find existing user');
          return;
        }
        
        authData.user = existingUser;
      } else {
        console.error(`   ❌ Auth error for ${adminAccount.email}:`, authError.message);
        return;
      }
    } else {
      console.log(`   ✅ Created auth user: ${adminAccount.email}`);
    }

    // Create profile in profiles table
    const profileData = {
      id: authData.user.id,
      tenant_id: TENANT_ID,
      email: adminAccount.email,
      display_name: adminAccount.displayName,
      full_name: adminAccount.fullName,
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
      console.error(`   ❌ Profile error for ${adminAccount.email}:`, profileError.message);
    } else {
      console.log(`   ✅ Successfully created profile: ${adminAccount.email}`);
    }

    console.log('\n🎉 Benjamin Knight admin account setup complete!');
    console.log('\n📋 Your Account Details:');
    console.log(`• Email: ${adminAccount.email}`);
    console.log(`• Password: ${adminAccount.password} (change after first login)`);
    console.log(`• Role: Super Admin`);
    console.log(`• Can create stories: Yes`);
    console.log(`• Admin access: Full platform control`);
    console.log('\n💻 Login at: http://localhost:3003/auth/signin');
    console.log('\n🔧 After login, you can:');
    console.log('• Access admin dashboard at /admin');
    console.log('• Create your own stories');
    console.log('• Manage all platform content');
    console.log('• Review and moderate stories');
    console.log('• Manage users and organizations');

  } catch (error) {
    console.error(`   💥 Unexpected error:`, error.message);
  }
}

createBenjaminAdmin().catch(console.error);