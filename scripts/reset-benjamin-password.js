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

async function resetBenjaminPassword() {
  console.log('🔑 Resetting password for benjamin@act.place...\n');

  try {
    // Get user ID first
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const benjaminUser = users.users.find(u => u.email === 'benjamin@act.place');
    if (!benjaminUser) {
      console.error('❌ User benjamin@act.place not found');
      return;
    }

    console.log(`✅ Found user: ${benjaminUser.email} (ID: ${benjaminUser.id})`);

    // Update password
    const newPassword = 'benjamin123'; // Simple password for testing
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      benjaminUser.id,
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Error updating password:', error.message);
    } else {
      console.log('✅ Password updated successfully!');
    }

    console.log('\n🎉 Password reset complete!');
    console.log('\n📋 Your Login Credentials:');
    console.log(`• Email: benjamin@act.place`);
    console.log(`• Password: ${newPassword}`);
    console.log('\n💻 You can now sign in at: http://localhost:3003/auth/signin');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

resetBenjaminPassword().catch(console.error);