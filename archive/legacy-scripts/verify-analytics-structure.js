/**
 * Verify Analytics Database Structure
 * Check that all tables and data are properly set up
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAnalyticsStructure() {
  console.log('🔍 Verifying storyteller analytics database structure...\n');

  const checks = [];

  try {
    // 1. Check storyteller_analytics table
    console.log('📊 Checking storyteller_analytics table...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('storyteller_analytics')
      .select('*')
      .limit(3);

    if (analyticsError) {
      console.log('❌ storyteller_analytics error:', analyticsError.message);
      checks.push({ table: 'storyteller_analytics', status: 'error', message: analyticsError.message });
    } else {
      console.log(`✅ storyteller_analytics: ${analytics.length} records found`);
      checks.push({ table: 'storyteller_analytics', status: 'success', count: analytics.length });
      if (analytics.length > 0) {
        console.log('   Sample record keys:', Object.keys(analytics[0]).join(', '));
      }
    }

    // 2. Check narrative_themes table
    console.log('\n🎨 Checking narrative_themes table...');
    const { data: themes, error: themesError } = await supabase
      .from('narrative_themes')
      .select('*')
      .limit(5);

    if (themesError) {
      console.log('❌ narrative_themes error:', themesError.message);
      checks.push({ table: 'narrative_themes', status: 'error', message: themesError.message });
    } else {
      console.log(`✅ narrative_themes: ${themes.length} records found`);
      checks.push({ table: 'narrative_themes', status: 'success', count: themes.length });
      if (themes.length > 0) {
        console.log('   Themes:', themes.map(t => t.theme_name).join(', '));
      }
    }

    // 3. Check storyteller_quotes table
    console.log('\n💬 Checking storyteller_quotes table...');
    const { data: quotes, error: quotesError } = await supabase
      .from('storyteller_quotes')
      .select('*')
      .limit(3);

    if (quotesError) {
      console.log('❌ storyteller_quotes error:', quotesError.message);
      checks.push({ table: 'storyteller_quotes', status: 'error', message: quotesError.message });
    } else {
      console.log(`✅ storyteller_quotes: ${quotes.length} records found`);
      checks.push({ table: 'storyteller_quotes', status: 'success', count: quotes.length });
      if (quotes.length > 0) {
        console.log('   Sample quote:', quotes[0].quote_text.substring(0, 50) + '...');
      }
    }

    // 4. Check storyteller_engagement table
    console.log('\n📈 Checking storyteller_engagement table...');
    const { data: engagement, error: engagementError } = await supabase
      .from('storyteller_engagement')
      .select('*')
      .limit(3);

    if (engagementError) {
      console.log('❌ storyteller_engagement error:', engagementError.message);
      checks.push({ table: 'storyteller_engagement', status: 'error', message: engagementError.message });
    } else {
      console.log(`✅ storyteller_engagement: ${engagement.length} records found`);
      checks.push({ table: 'storyteller_engagement', status: 'success', count: engagement.length });
    }

    // 5. Check storyteller_demographics table
    console.log('\n🌍 Checking storyteller_demographics table...');
    const { data: demographics, error: demographicsError } = await supabase
      .from('storyteller_demographics')
      .select('*')
      .limit(3);

    if (demographicsError) {
      console.log('❌ storyteller_demographics error:', demographicsError.message);
      checks.push({ table: 'storyteller_demographics', status: 'error', message: demographicsError.message });
    } else {
      console.log(`✅ storyteller_demographics: ${demographics.length} records found`);
      checks.push({ table: 'storyteller_demographics', status: 'success', count: demographics.length });
    }

    // 6. Check profiles integration
    console.log('\n👥 Checking profiles table integration...');
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, display_name, is_storyteller')
      .eq('is_storyteller', true)
      .limit(5);

    if (storytellersError) {
      console.log('❌ profiles error:', storytellersError.message);
      checks.push({ table: 'profiles', status: 'error', message: storytellersError.message });
    } else {
      console.log(`✅ profiles: ${storytellers.length} storytellers found`);
      checks.push({ table: 'profiles', status: 'success', count: storytellers.length });
      storytellers.forEach(s => console.log(`   - ${s.display_name || 'Unnamed'} (${s.id})`));
    }

    // 7. Test a cross-table join to verify relationships
    console.log('\n🔗 Testing table relationships...');
    const { data: joinTest, error: joinError } = await supabase
      .from('storyteller_analytics')
      .select(`
        *,
        profiles!storyteller_analytics_storyteller_id_fkey (display_name, full_name)
      `)
      .limit(2);

    if (joinError) {
      console.log('❌ Join test error:', joinError.message);
      checks.push({ table: 'relationships', status: 'error', message: joinError.message });
    } else {
      console.log(`✅ Table relationships working: ${joinTest.length} joined records`);
      checks.push({ table: 'relationships', status: 'success', count: joinTest.length });
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(50));

    const successCount = checks.filter(c => c.status === 'success').length;
    const errorCount = checks.filter(c => c.status === 'error').length;

    console.log(`✅ Successful checks: ${successCount}`);
    console.log(`❌ Failed checks: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 All systems working perfectly!');
      console.log('🚀 Your storyteller analytics system is ready to use!');
      console.log('\n📍 Next steps:');
      console.log('   1. Visit http://localhost:3030/test-analytics to see the dashboard');
      console.log('   2. Select different storytellers to see their analytics');
      console.log('   3. Integration with existing profile pages is ready');
    } else {
      console.log('\n⚠️  Some issues found. Check the errors above.');
    }

    console.log('\n📊 Data Summary:');
    checks.forEach(check => {
      if (check.status === 'success' && check.count !== undefined) {
        console.log(`   ${check.table}: ${check.count} records`);
      }
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
if (require.main === module) {
  verifyAnalyticsStructure();
}

module.exports = { verifyAnalyticsStructure };