#!/usr/bin/env node

/**
 * Populate Junction Tables Script
 * 
 * This script populates the empty junction tables (profile_organizations, 
 * profile_projects, profile_locations) with the correct relationships
 * based on tenant_id connections.
 * 
 * Run with: node scripts/populate-junction-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function populateJunctionTables() {
  console.log('🔄 Starting junction table population...\n');

  try {
    // Step 1: Get all profiles with tenant IDs
    console.log('📋 Fetching profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, tenant_id')
      .not('tenant_id', 'is', null)
      .not('email', 'in', '("moderator@empathyledger.com","elder@empathyledger.com","admin@empathyledger.com")');

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`✅ Found ${profiles.length} profiles with tenant IDs`);

    // Step 2: Get all organizations  
    console.log('🏢 Fetching organizations...');
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .not('tenant_id', 'is', null);

    if (orgsError) {
      throw new Error(`Failed to fetch organizations: ${orgsError.message}`);
    }

    console.log(`✅ Found ${organizations.length} organizations`);

    // Step 3: Get all projects
    console.log('📁 Fetching projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, organization_id, tenant_id');

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    console.log(`✅ Found ${projects.length} projects`);

    // Step 4: Build profile-organization connections
    console.log('\n🔗 Building profile-organization connections...');
    const profileOrgConnections = [];
    
    profiles.forEach(profile => {
      const matchingOrg = organizations.find(org => org.tenant_id === profile.tenant_id);
      if (matchingOrg) {
        profileOrgConnections.push({
          profile_id: profile.id,
          organization_id: matchingOrg.id
        });
        console.log(`   ${profile.email} -> ${matchingOrg.name}`);
      } else {
        console.log(`⚠️  No matching organization for ${profile.email} (tenant: ${profile.tenant_id})`);
      }
    });

    // Step 5: Insert profile-organization connections
    if (profileOrgConnections.length > 0) {
      console.log(`\n💾 Inserting ${profileOrgConnections.length} profile-organization connections...`);
      
      const { error: insertOrgError } = await supabase
        .from('profile_organizations')
        .insert(profileOrgConnections);

      if (insertOrgError) {
        throw new Error(`Failed to insert profile-organization connections: ${insertOrgError.message}`);
      }

      console.log('✅ Profile-organization connections inserted successfully');
    }

    // Step 6: Build profile-project connections
    console.log('\n🔗 Building profile-project connections...');
    const profileProjectConnections = [];
    
    profileOrgConnections.forEach(connection => {
      const orgProjects = projects.filter(project => project.organization_id === connection.organization_id);
      
      orgProjects.forEach(project => {
        profileProjectConnections.push({
          profile_id: connection.profile_id,
          project_id: project.id
        });
      });
    });

    console.log(`   Found ${profileProjectConnections.length} profile-project connections to create`);

    // Step 7: Insert profile-project connections
    if (profileProjectConnections.length > 0) {
      console.log(`\n💾 Inserting ${profileProjectConnections.length} profile-project connections...`);
      
      const { error: insertProjectError } = await supabase
        .from('profile_projects')
        .insert(profileProjectConnections);

      if (insertProjectError) {
        throw new Error(`Failed to insert profile-project connections: ${insertProjectError.message}`);
      }

      console.log('✅ Profile-project connections inserted successfully');
    }

    // Step 8: Verification
    console.log('\n🔍 Verifying results...');
    
    const { count: orgCount } = await supabase
      .from('profile_organizations')
      .select('*', { count: 'exact', head: true });

    const { count: projectCount } = await supabase
      .from('profile_projects') 
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Final counts:`);
    console.log(`   - profile_organizations: ${orgCount} records`);
    console.log(`   - profile_projects: ${projectCount} records`);

    console.log('\n🎉 Junction table population completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Connected ${profiles.length} profiles to organizations`);
    console.log(`   - Created ${profileProjectConnections.length} profile-project relationships`);
    console.log('   - Storytellers should no longer appear as "Independent"');
    console.log('   - Project counts should now display correctly');

  } catch (error) {
    console.error('❌ Error populating junction tables:', error.message);
    process.exit(1);
  }
}

// Run the script
populateJunctionTables();