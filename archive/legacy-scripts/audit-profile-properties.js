const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function auditProfileSchema() {
  console.log('='.repeat(80));
  console.log('PROFILE/STORYTELLER PROPERTIES AUDIT');
  console.log('='.repeat(80));

  // Get a sample profile with all fields
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (!profile) {
    console.log('No profiles found');
    return;
  }

  const columns = Object.keys(profile).sort();

  console.log(`\n📊 PROFILES TABLE COLUMNS (${columns.length} total):\n`);

  const categories = {
    'Identity': ['id', 'email', 'display_name', 'full_name', 'preferred_name', 'pronouns'],
    'Images': ['profile_image_url', 'profile_image_alt_text', 'avatar_url', 'cover_image_url'],
    'Bio/Description': ['bio', 'short_bio', 'tagline', 'about_me', 'personal_statement'],
    'Cultural': ['cultural_background', 'cultural_affiliation', 'cultural_themes', 'indigenous_affiliation', 'mob', 'language_groups'],
    'Location': ['location', 'country', 'region', 'city', 'postcode', 'latitude', 'longitude'],
    'Contact': ['phone', 'phone_number', 'mobile', 'website_url', 'social_media', 'linkedin_url', 'twitter_handle'],
    'Professional': ['occupation', 'current_role', 'skills', 'expertise', 'industry'],
    'Dates': ['date_of_birth', 'created_at', 'updated_at', 'last_login', 'last_active', 'onboarded_at'],
    'Status/Flags': ['is_elder', 'is_featured', 'is_active', 'is_verified', 'is_public', 'profile_visibility', 'account_status', 'verification_status'],
    'Organization': ['tenant_id', 'primary_organization_id', 'tenant_roles', 'organization_role'],
    'Settings': ['notification_preferences', 'privacy_settings', 'communication_preferences', 'language_preference'],
    'Consent': ['consent_given', 'consent_date', 'terms_accepted', 'privacy_accepted'],
    'Legacy': ['legacy_id', 'airtable_record_id', 'migrated_at', 'migration_source']
  };

  const categorized = {};
  const uncategorized = [];

  columns.forEach(col => {
    let found = false;
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.includes(col)) {
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(col);
        found = true;
        break;
      }
    }
    if (!found) uncategorized.push(col);
  });

  Object.entries(categorized).forEach(([category, cols]) => {
    if (cols.length > 0) {
      console.log(`\n${category}:`);
      cols.forEach(col => {
        const value = profile[col];
        const type = typeof value;
        const hasValue = value !== null && value !== undefined && value !== '';
        console.log(`  ${hasValue ? '✓' : '○'} ${col.padEnd(35)} [${type}]`);
      });
    }
  });

  if (uncategorized.length > 0) {
    console.log(`\n\nOther/Uncategorized:`);
    uncategorized.forEach(col => {
      const value = profile[col];
      const type = typeof value;
      const hasValue = value !== null && value !== undefined && value !== '';
      console.log(`  ${hasValue ? '✓' : '○'} ${col.padEnd(35)} [${type}]`);
    });
  }

  console.log(`\n\n${'='.repeat(80)}`);
  console.log('SUMMARY:');
  console.log(`Total columns: ${columns.length}`);
  console.log(`Populated in sample: ${columns.filter(c => profile[c] !== null && profile[c] !== undefined && profile[c] !== '').length}`);
  console.log('='.repeat(80));
}

auditProfileSchema();