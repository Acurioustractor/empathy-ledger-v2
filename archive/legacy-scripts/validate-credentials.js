#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Complete credentials (correcting potential truncation)
const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNTI2MTIsImV4cCI6MjAzOTkyODYxMn0.ojDyC8v18uE9xcWHy9ygng_2n18ioHi';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDM1MjYxMiwiZXhwIjoyMDM5OTI4NjEyfQ.3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642';

async function validateCredentials() {
    console.log('🔑 Validating Supabase credentials...');
    console.log(`🌐 URL: ${SUPABASE_URL}`);
    console.log(`🔐 Anon key length: ${SUPABASE_ANON_KEY.length}`);
    console.log(`🔐 Service key length: ${SUPABASE_SERVICE_KEY.length}`);
    
    try {
        // Test anonymous client
        console.log('\n📝 Testing anonymous client...');
        const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Simple health check
        const { data: anonData, error: anonError } = await anonClient.rpc('version');
        console.log('Anon client result:', anonError ? `Error: ${anonError.message}` : 'Success');
        
        // Test service role client
        console.log('\n🔧 Testing service role client...');
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        const { data: adminData, error: adminError } = await adminClient.rpc('version');
        console.log('Service role result:', adminError ? `Error: ${adminError.message}` : 'Success');
        
        // Try to list tables with service role
        console.log('\n📋 Attempting to list tables...');
        const { data: tables, error: tablesError } = await adminClient
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'public')
            .limit(10);
            
        if (tablesError) {
            console.log(`Tables query error: ${tablesError.message}`);
        } else {
            console.log(`Found ${tables?.length || 0} public tables:`, tables?.map(t => t.table_name) || []);
        }
        
        // Try to list storage buckets
        console.log('\n🗄️ Attempting to list storage buckets...');
        const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
        
        if (bucketsError) {
            console.log(`Storage error: ${bucketsError.message}`);
        } else {
            console.log(`Found ${buckets?.length || 0} storage buckets:`, buckets?.map(b => b.name) || []);
        }
        
        console.log('\n✅ Credential validation completed');
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
    }
}

validateCredentials().catch(console.error);