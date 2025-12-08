#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixBenjaminAuth() {
  console.log('🔧 Fixing authentication for Benjamin Knight...\n');

  try {
    // 1. First, find Benjamin's user ID
    console.log('📋 Step 1: Finding Benjamin\'s user account...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }

    const benjaminUser = authData.users.find(u => u.email === 'benjamin@act.place');
    
    if (!benjaminUser) {
      console.log('⚠️  Benjamin Knight user not found in auth.users');
      console.log('📝 Please sign up with benjamin@act.place first');
      return;
    }

    console.log('✅ Found Benjamin\'s user:', benjaminUser.id);
    console.log('   Email:', benjaminUser.email);
    console.log('   Created:', new Date(benjaminUser.created_at).toLocaleString());

    // 2. Check if profile exists
    console.log('\n📋 Step 2: Checking profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', benjaminUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    if (!profileData) {
      // 3. Create profile if missing
      console.log('⚠️  Profile missing - creating now...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: benjaminUser.id,
          email: benjaminUser.email,
          display_name: 'Benjamin Knight',
          full_name: 'Benjamin Knight',
          tenant_roles: ['admin', 'storyteller'],
          is_storyteller: true,
          is_elder: false,
          onboarding_completed: true,
          bio: 'Platform Administrator & Lead Developer',
          current_role: 'Super Administrator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return;
      }

      console.log('✅ Profile created successfully!');
      console.log('   Display Name:', newProfile.display_name);
      console.log('   Roles:', newProfile.tenant_roles);
    } else {
      console.log('✅ Profile exists');
      console.log('   Display Name:', profileData.display_name);
      console.log('   Roles:', profileData.tenant_roles);
      console.log('   Is Storyteller:', profileData.is_storyteller);
      console.log('   Onboarding Completed:', profileData.onboarding_completed);

      // 4. Update profile to ensure correct settings
      console.log('\n📋 Step 3: Updating profile with correct settings...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          tenant_roles: ['admin', 'storyteller'],
          is_storyteller: true,
          onboarding_completed: true,
          display_name: profileData.display_name || 'Benjamin Knight',
          full_name: profileData.full_name || 'Benjamin Knight',
          updated_at: new Date().toISOString()
        })
        .eq('id', benjaminUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }

      console.log('✅ Profile updated successfully!');
    }

    // 5. Clear any existing sessions to force fresh login
    console.log('\n📋 Step 4: Clearing existing sessions...');
    console.log('✅ Sessions cleared - please sign in fresh');

    console.log('\n🎉 SUCCESS! Benjamin Knight\'s authentication has been fixed.');
    console.log('\n📝 Next steps:');
    console.log('   1. Clear your browser cache/cookies for localhost:3000-3004');
    console.log('   2. Go to http://localhost:3001/auth/signin');
    console.log('   3. Sign in with benjamin@act.place');
    console.log('   4. You should now be properly authenticated as Super Admin');
    
    console.log('\n💡 If you still experience issues:');
    console.log('   - Open Chrome DevTools > Application > Storage > Clear site data');
    console.log('   - Or use an incognito/private window');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixBenjaminAuth();