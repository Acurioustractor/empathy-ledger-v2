/**
 * ALMA Signal Integrity Verification Script
 *
 * Purpose: Ensure ACT Unified Analysis System maintains integrity:
 * - No individual profiling
 * - Consent enforcement
 * - Beautiful Obsolescence readiness
 * - Fair value return tracking
 * - Cultural safety maintained
 *
 * Philosophy: Database as sovereignty container, not extraction engine
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface VerificationResult {
  test: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  details?: any;
}

const results: VerificationResult[] = [];

/**
 * Test 1: Verify No Individual Profiling
 * ALMA signals should be at SYSTEM level, not individual surveillance
 */
async function verifyNoIndividualProfiling() {
  console.log('\n🔍 Test 1: Verifying No Individual Profiling...');

  try {
    // Check storyteller_master_analysis
    const { data, error } = await supabase
      .from('storyteller_master_analysis')
      .select('id, alma_signals')
      .limit(10);

    if (error) throw error;

    let profiledCount = 0;
    const profiledIds: string[] = [];

    // Check for red flags (individual profiling patterns)
    data?.forEach((record: any) => {
      const signals = record.alma_signals || {};

      // Red flags:
      // 1. Individual risk scoring (not harm_risk_inverted safety)
      // 2. Behavioral prediction models
      // 3. Compliance ratings (vs consent choices)
      // 4. Surveillance-style tracking

      if (signals.risk_score || signals.compliance_rating || signals.predicted_behavior) {
        profiledCount++;
        profiledIds.push(record.id);
      }
    });

    const passed = profiledCount === 0;

    results.push({
      test: 'No Individual Profiling',
      passed,
      severity: 'critical',
      message: passed
        ? '✅ No individual profiling detected - ALMA signals are system-level'
        : `❌ ${profiledCount} records contain profiling patterns`,
      details: passed ? null : { profiledIds },
    });
  } catch (error: any) {
    results.push({
      test: 'No Individual Profiling',
      passed: false,
      severity: 'critical',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 2: Consent Enforcement
 * All records must have explicit consent, revocable anytime
 */
async function verifyConsentEnforcement() {
  console.log('\n🔍 Test 2: Verifying Consent Enforcement...');

  try {
    // Check storyteller_master_analysis for consent
    const { data, error } = await supabase
      .from('storyteller_master_analysis')
      .select('id, storyteller_consent, privacy_level')
      .limit(100);

    if (error) throw error;

    let missingConsent = 0;
    let nonRevocableConsent = 0;

    data?.forEach((record: any) => {
      const consent = record.storyteller_consent || {};

      // Red flags:
      // 1. No consent object
      // 2. can_revoke_anytime !== true
      // 3. No consent_date

      if (!consent || Object.keys(consent).length === 0) {
        missingConsent++;
      }

      if (consent.can_revoke_anytime !== true) {
        nonRevocableConsent++;
      }
    });

    const passed = missingConsent === 0 && nonRevocableConsent === 0;

    results.push({
      test: 'Consent Enforcement',
      passed,
      severity: 'critical',
      message: passed
        ? '✅ All records have revocable consent'
        : `❌ ${missingConsent} missing consent, ${nonRevocableConsent} non-revocable`,
      details: { total: data?.length, missingConsent, nonRevocableConsent },
    });
  } catch (error: any) {
    results.push({
      test: 'Consent Enforcement',
      passed: false,
      severity: 'critical',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 3: Beautiful Obsolescence Progress
 * Organizations should have handover readiness metrics
 */
async function verifyBeautifulObsolescenceTracking() {
  console.log('\n🔍 Test 3: Verifying Beautiful Obsolescence Tracking...');

  try {
    const { data, error } = await supabase
      .from('organization_impact_intelligence')
      .select('id, organization_id, regenerative_impact')
      .limit(10);

    if (error) throw error;

    let trackingHandover = 0;
    let notTracking = 0;

    data?.forEach((record: any) => {
      const regenerative = record.regenerative_impact || {};
      const boProgress = regenerative.Beautiful_Obsolescence_progress;

      if (boProgress && boProgress.dependency_reduced !== undefined) {
        trackingHandover++;
      } else {
        notTracking++;
      }
    });

    const passed = data && data.length > 0 ? trackingHandover > 0 : true;

    results.push({
      test: 'Beautiful Obsolescence Tracking',
      passed,
      severity: 'warning',
      message: passed
        ? `✅ ${trackingHandover}/${data?.length} orgs tracking handover readiness`
        : `⚠️ ${notTracking}/${data?.length} orgs not tracking Beautiful Obsolescence`,
      details: { trackingHandover, notTracking },
    });
  } catch (error: any) {
    results.push({
      test: 'Beautiful Obsolescence Tracking',
      passed: false,
      severity: 'warning',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 4: Fair Value Return Tracking
 * Enterprise-commons balance should show 50% to storytellers
 */
async function verifyFairValueReturn() {
  console.log('\n🔍 Test 4: Verifying Fair Value Return Tracking...');

  try {
    const { data, error } = await supabase
      .from('project_impact_analysis')
      .select('id, project_id, enterprise_commons_balance')
      .limit(20);

    if (error) throw error;

    let trackingFairValue = 0;
    let notTracking = 0;

    data?.forEach((record: any) => {
      const balance = record.enterprise_commons_balance || {};

      if (balance.fair_value_return !== undefined && balance.revenue_generated !== undefined) {
        trackingFairValue++;

        // Check if fair_value_return is ~50% of revenue_generated
        const pct = balance.fair_value_return / balance.revenue_generated;
        if (pct < 0.40 || pct > 0.60) {
          console.warn(`  ⚠️ Project ${record.project_id}: ${(pct * 100).toFixed(0)}% return (target 50%)`);
        }
      } else {
        notTracking++;
      }
    });

    const passed = data && data.length > 0 ? trackingFairValue > 0 : true;

    results.push({
      test: 'Fair Value Return Tracking',
      passed,
      severity: 'warning',
      message: passed
        ? `✅ ${trackingFairValue}/${data?.length} projects tracking fair value return`
        : `⚠️ ${notTracking}/${data?.length} projects not tracking fair value`,
      details: { trackingFairValue, notTracking },
    });
  } catch (error: any) {
    results.push({
      test: 'Fair Value Return Tracking',
      passed: false,
      severity: 'warning',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 5: Cultural Safety Score
 * harm_risk_inverted should be ≥0.90 (inverted: high = safe)
 */
async function verifyCulturalSafety() {
  console.log('\n🔍 Test 5: Verifying Cultural Safety Scores...');

  try {
    const { data, error } = await supabase
      .from('storyteller_master_analysis')
      .select('id, alma_signals')
      .limit(50);

    if (error) throw error;

    let safeCount = 0;
    let unsafeCount = 0;
    let noScoreCount = 0;

    data?.forEach((record: any) => {
      const signals = record.alma_signals || {};
      const harmRisk = signals.harm_risk_inverted || {};
      const safetyScore = harmRisk.safety_score;

      if (safetyScore === undefined) {
        noScoreCount++;
      } else if (safetyScore >= 0.90) {
        safeCount++;
      } else {
        unsafeCount++;
        console.warn(`  ⚠️ Record ${record.id}: safety_score ${safetyScore} (target ≥0.90)`);
      }
    });

    const passed = unsafeCount === 0;

    results.push({
      test: 'Cultural Safety Scores',
      passed,
      severity: 'warning',
      message: passed
        ? `✅ ${safeCount}/${data?.length} records culturally safe (≥0.90)`
        : `⚠️ ${unsafeCount} records below safety threshold`,
      details: { safeCount, unsafeCount, noScoreCount },
    });
  } catch (error: any) {
    results.push({
      test: 'Cultural Safety Scores',
      passed: false,
      severity: 'warning',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 6: LCAA Rhythm Tracking
 * Projects should document Listen→Curiosity→Action→Art cycles
 */
async function verifyLCAATracking() {
  console.log('\n🔍 Test 6: Verifying LCAA Rhythm Tracking...');

  try {
    const { data, error } = await supabase
      .from('project_impact_analysis')
      .select('id, project_id, lcaa_rhythm_analysis')
      .limit(10);

    if (error) throw error;

    let trackingLCAA = 0;
    let missingPhases = 0;

    data?.forEach((record: any) => {
      const lcaa = record.lcaa_rhythm_analysis || {};

      const hasAllPhases = lcaa.listen_phase && lcaa.curiosity_phase && lcaa.action_phase && lcaa.art_phase;

      if (hasAllPhases) {
        trackingLCAA++;
      } else {
        missingPhases++;
      }
    });

    const passed = data && data.length > 0 ? trackingLCAA > 0 : true;

    results.push({
      test: 'LCAA Rhythm Tracking',
      passed,
      severity: 'warning',
      message: passed
        ? `✅ ${trackingLCAA}/${data?.length} projects tracking LCAA rhythm`
        : `⚠️ ${missingPhases}/${data?.length} projects missing LCAA phases`,
      details: { trackingLCAA, missingPhases },
    });
  } catch (error: any) {
    results.push({
      test: 'LCAA Rhythm Tracking',
      passed: false,
      severity: 'warning',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 7: RLS Policy Coverage
 * All 5 new tables must have RLS enabled
 */
async function verifyRLSCoverage() {
  console.log('\n🔍 Test 7: Verifying RLS Policy Coverage...');

  try {
    const tables = [
      'storyteller_master_analysis',
      'project_impact_analysis',
      'organization_impact_intelligence',
      'global_impact_intelligence',
      'empathy_ledger_knowledge_base',
    ];

    const { data, error } = await supabase.rpc('check_rls_enabled', { table_names: tables });

    if (error) {
      // Fallback: Check manually
      const results = await Promise.all(
        tables.map(async (table) => {
          const { data: rlsData } = await supabase.rpc('is_rls_enabled', { table_name: table });
          return { table, enabled: rlsData };
        })
      );

      const allEnabled = results.every((r) => r.enabled);
      const disabledTables = results.filter((r) => !r.enabled).map((r) => r.table);

      results.push({
        test: 'RLS Policy Coverage',
        passed: allEnabled,
        severity: 'critical',
        message: allEnabled
          ? '✅ All 5 ACT tables have RLS enabled'
          : `❌ ${disabledTables.length} tables missing RLS: ${disabledTables.join(', ')}`,
        details: { results },
      });

      return;
    }

    const allEnabled = data.every((r: any) => r.enabled);
    const disabledTables = data.filter((r: any) => !r.enabled).map((r: any) => r.table);

    results.push({
      test: 'RLS Policy Coverage',
      passed: allEnabled,
      severity: 'critical',
      message: allEnabled
        ? '✅ All 5 ACT tables have RLS enabled'
        : `❌ ${disabledTables.length} tables missing RLS: ${disabledTables.join(', ')}`,
      details: { disabledTables },
    });
  } catch (error: any) {
    results.push({
      test: 'RLS Policy Coverage',
      passed: false,
      severity: 'critical',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Test 8: Embedding Vector Coverage
 * RAG search requires embeddings on all records
 */
async function verifyEmbeddingCoverage() {
  console.log('\n🔍 Test 8: Verifying Embedding Vector Coverage...');

  try {
    const tables = [
      'storyteller_master_analysis',
      'project_impact_analysis',
      'organization_impact_intelligence',
      'global_impact_intelligence',
      'empathy_ledger_knowledge_base',
    ];

    const coverageResults = await Promise.all(
      tables.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select('id, embedding')
          .limit(10);

        if (error) throw error;

        const total = data?.length || 0;
        const withEmbeddings = data?.filter((r) => r.embedding !== null).length || 0;
        const coverage = total > 0 ? (withEmbeddings / total) * 100 : 0;

        return { table, total, withEmbeddings, coverage };
      })
    );

    const avgCoverage = coverageResults.reduce((sum, r) => sum + r.coverage, 0) / coverageResults.length;
    const passed = avgCoverage >= 80; // 80%+ coverage acceptable

    results.push({
      test: 'Embedding Vector Coverage',
      passed,
      severity: 'info',
      message: passed
        ? `✅ ${avgCoverage.toFixed(0)}% average embedding coverage across tables`
        : `⚠️ ${avgCoverage.toFixed(0)}% coverage (target ≥80%)`,
      details: coverageResults,
    });
  } catch (error: any) {
    results.push({
      test: 'Embedding Vector Coverage',
      passed: false,
      severity: 'info',
      message: `❌ Error: ${error.message}`,
    });
  }
}

/**
 * Run all verification tests
 */
async function runAllTests() {
  console.log('═'.repeat(80));
  console.log('🔍 ACT UNIFIED ANALYSIS SYSTEM - ALMA INTEGRITY VERIFICATION');
  console.log('═'.repeat(80));

  await verifyNoIndividualProfiling();
  await verifyConsentEnforcement();
  await verifyBeautifulObsolescenceTracking();
  await verifyFairValueReturn();
  await verifyCulturalSafety();
  await verifyLCAATracking();
  await verifyRLSCoverage();
  await verifyEmbeddingCoverage();

  // Print results
  console.log('\n' + '═'.repeat(80));
  console.log('📊 VERIFICATION RESULTS');
  console.log('═'.repeat(80));

  const criticalFails = results.filter((r) => r.severity === 'critical' && !r.passed);
  const warnings = results.filter((r) => r.severity === 'warning' && !r.passed);
  const infos = results.filter((r) => r.severity === 'info' && !r.passed);
  const passed = results.filter((r) => r.passed);

  console.log(`\n✅ Passed: ${passed.length}/${results.length}`);
  console.log(`❌ Critical Failures: ${criticalFails.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`ℹ️  Info: ${infos.length}`);

  console.log('\n' + '-'.repeat(80));
  results.forEach((r) => {
    console.log(`\n${r.passed ? '✅' : r.severity === 'critical' ? '❌' : '⚠️'} ${r.test}`);
    console.log(`   ${r.message}`);
    if (r.details) {
      console.log(`   Details: ${JSON.stringify(r.details, null, 2)}`);
    }
  });

  console.log('\n' + '═'.repeat(80));

  if (criticalFails.length > 0) {
    console.log('❌ CRITICAL FAILURES DETECTED - NOT PRODUCTION READY');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  WARNINGS DETECTED - REVIEW BEFORE PRODUCTION');
    process.exit(0);
  } else {
    console.log('✅ ALL TESTS PASSED - PRODUCTION READY');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
