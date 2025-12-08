#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🌐 Testing basic connection...');
    
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Connection test failed:', healthError.message);
    } else {
      console.log('✅ Basic connection successful');
    }
    
    // Test 2: Auth endpoint
    console.log('\n🔐 Testing auth endpoint...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@nonexistent.com',
      password: 'wrong',
    });
    
    if (error) {
      console.log('✅ Auth endpoint responding (expected error):', error.message);
    } else {
      console.log('❓ Unexpected auth success');
    }
    
  } catch (error) {
    console.error('💥 Connection failed:', error);
  }
}

testConnection();