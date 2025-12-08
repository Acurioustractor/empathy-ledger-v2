#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🧪 Testing Supabase authentication...\n');

  try {
    console.log('Testing with admin account...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@empathyledger.com',
      password: 'admin123',
    });

    if (error) {
      console.error('❌ Authentication error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('✅ Authentication successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      
      // Sign out to clean up
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAuth().catch(console.error);