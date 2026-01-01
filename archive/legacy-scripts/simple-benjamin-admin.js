#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TENANT_ID = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

async function createSimpleBenjaminAdmin() {
  console.log('🚀 Setting up Benjamin Knight admin profile...\n');

  try {
    // Get existing user
    const { data: users } = await supabase.auth.admin.listUsers();
    const benjaminUser = users.users.find(u => u.email === 'benjamin@act.place');
    
    if (!benjaminUser) {
      console.error('❌ User not found');
      return;
    }

    // Simple profile with only known columns
    const profileData = {
      id: benjaminUser.id,
      tenant_id: TENANT_ID,
      email: benjaminUser.email,
      display_name: 'Benjamin Knight',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) {
      console.error('❌ Profile error:', error.message);
    } else {
      console.log('✅ Profile created successfully');
    }

    console.log('\n🎉 Benjamin Knight admin setup complete!');
    console.log(`\n📧 Your email: benjamin@act.place`);
    console.log('🔑 You can now sign in and use the platform as both admin and storyteller!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createSimpleBenjaminAdmin().catch(console.error);