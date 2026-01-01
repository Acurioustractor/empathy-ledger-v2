#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// American to Australian spelling corrections
const SPELLING_CORRECTIONS = {
  // -ize to -ise
  'organize': 'organise',
  'organizes': 'organises',
  'organized': 'organised',
  'organizing': 'organising',
  'organization': 'organisation',
  'organizations': 'organisations',
  'recognize': 'recognise',
  'recognizes': 'recognises',
  'recognized': 'recognised',
  'recognizing': 'recognising',
  'recognition': 'recognition', // stays same
  'realize': 'realise',
  'realizes': 'realises',
  'realized': 'realised',
  'realizing': 'realising',
  'realization': 'realisation',
  'analyze': 'analyse',
  'analyzes': 'analyses',
  'analyzed': 'analysed',
  'analyzing': 'analysing',
  'analysis': 'analysis', // stays same
  'specialize': 'specialise',
  'specializes': 'specialises',
  'specialized': 'specialised',
  'specializing': 'specialising',
  'specialization': 'specialisation',
  'categorize': 'categorise',
  'categorizes': 'categorises',
  'categorized': 'categorised',
  'categorizing': 'categorising',
  'categorization': 'categorisation',

  // -or to -our
  'color': 'colour',
  'colors': 'colours',
  'colored': 'coloured',
  'coloring': 'colouring',
  'favor': 'favour',
  'favors': 'favours',
  'favored': 'favoured',
  'favoring': 'favouring',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'honor': 'honour',
  'honors': 'honours',
  'honored': 'honoured',
  'honoring': 'honouring',
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'labor': 'labour',
  'labors': 'labours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',

  // -er to -re
  'center': 'centre',
  'centers': 'centres',
  'centered': 'centred',
  'centering': 'centring',
  'theater': 'theatre',
  'theaters': 'theatres',
  'fiber': 'fibre',
  'fibers': 'fibres',
  'meter': 'metre',
  'meters': 'metres',
  'liter': 'litre',
  'liters': 'litres',

  // -ense to -ence
  'defense': 'defence',
  'defenses': 'defences',
  'license': 'licence', // when used as noun
  'offense': 'offence',
  'offenses': 'offences',

  // Misc
  'gray': 'grey',
  'grays': 'greys',
  'grayish': 'greyish',
  'canceled': 'cancelled',
  'canceling': 'cancelling',
  'traveling': 'travelling',
  'traveled': 'travelled',
  'traveler': 'traveller',
  'travelers': 'travellers',
  'modeling': 'modelling',
  'modeled': 'modelled',
  'leveling': 'levelling',
  'leveled': 'levelled',
  'counselor': 'counsellor',
  'counselors': 'counsellors',
  'program': 'programme', // when referring to events/activities
  'programs': 'programmes',
  'pajamas': 'pyjamas',
  'check': 'cheque', // when referring to bank payment
  'checks': 'cheques',
  'curb': 'kerb', // when referring to street edge
  'curbs': 'kerbs',
  'tire': 'tyre', // when referring to vehicle wheel
  'tires': 'tyres'
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.js', '.jsx', '.md', '.txt']) {
  const results = [];

  function scanFile(filePath) {
    if (!extensions.some(ext => filePath.endsWith(ext))) return;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineNum) => {
        Object.entries(SPELLING_CORRECTIONS).forEach(([american, australian]) => {
          // Case-sensitive exact word matches
          const wordRegex = new RegExp(`\\b${american}\\b`, 'g');
          const matches = [...line.matchAll(wordRegex)];

          matches.forEach(match => {
            results.push({
              file: filePath,
              line: lineNum + 1,
              column: match.index + 1,
              american: american,
              australian: australian,
              context: line.trim(),
              fullLine: line
            });
          });
        });
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  function walk(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.git', '.next', 'dist', 'build', '.supabase'].includes(file)) {
            walk(fullPath);
          }
        } else {
          scanFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  walk(dirPath);
  return results;
}

async function scanDatabase() {
  console.log('🔍 Scanning database content for American spelling...\n');

  const dbResults = [];

  // Scan profiles table
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio, occupation, cultural_background');

  profiles?.forEach(profile => {
    [profile.bio, profile.occupation, profile.cultural_background].forEach((field, idx) => {
      if (!field) return;

      Object.entries(SPELLING_CORRECTIONS).forEach(([american, australian]) => {
        const regex = new RegExp(`\\b${american}\\b`, 'gi');
        if (regex.test(field)) {
          const fieldName = ['bio', 'occupation', 'cultural_background'][idx];
          dbResults.push({
            table: 'profiles',
            id: profile.id,
            name: profile.display_name,
            field: fieldName,
            american: american,
            australian: australian,
            content: field.substring(0, 100) + '...'
          });
        }
      });
    });
  });

  // Scan stories table
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content, summary');

  stories?.forEach(story => {
    [story.title, story.content, story.summary].forEach((field, idx) => {
      if (!field) return;

      Object.entries(SPELLING_CORRECTIONS).forEach(([american, australian]) => {
        const regex = new RegExp(`\\b${american}\\b`, 'gi');
        if (regex.test(field)) {
          const fieldName = ['title', 'content', 'summary'][idx];
          dbResults.push({
            table: 'stories',
            id: story.id,
            name: story.title,
            field: fieldName,
            american: american,
            australian: australian,
            content: field.substring(0, 100) + '...'
          });
        }
      });
    });
  });

  // Scan organizations table
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name, description, mission');

  organizations?.forEach(org => {
    [org.name, org.description, org.mission].forEach((field, idx) => {
      if (!field) return;

      Object.entries(SPELLING_CORRECTIONS).forEach(([american, australian]) => {
        const regex = new RegExp(`\\b${american}\\b`, 'gi');
        if (regex.test(field)) {
          const fieldName = ['name', 'description', 'mission'][idx];
          dbResults.push({
            table: 'organizations',
            id: org.id,
            name: org.name,
            field: fieldName,
            american: american,
            australian: australian,
            content: field.substring(0, 100) + '...'
          });
        }
      });
    });
  });

  return dbResults;
}

async function auditSpelling() {
  console.log('🇦🇺 Australian Spelling Audit - Empathy Ledger v2\n');
  console.log('Scanning for American spelling that should be Australian...\n');

  // Scan source code
  console.log('📁 Scanning source code files...');
  const codeResults = await scanDirectory('./src');

  // Scan database
  console.log('🗄️ Scanning database content...');
  const dbResults = await scanDatabase();

  // Generate report
  console.log('\n📊 AUDIT RESULTS\n');
  console.log('='.repeat(80));

  if (codeResults.length === 0 && dbResults.length === 0) {
    console.log('✅ No American spelling found! The site appears to use Australian spelling correctly.');
    return;
  }

  if (codeResults.length > 0) {
    console.log(`\n📁 SOURCE CODE ISSUES (${codeResults.length} found):\n`);

    // Group by file
    const groupedByFile = {};
    codeResults.forEach(result => {
      if (!groupedByFile[result.file]) {
        groupedByFile[result.file] = [];
      }
      groupedByFile[result.file].push(result);
    });

    Object.entries(groupedByFile).forEach(([file, issues]) => {
      console.log(`\n📄 ${file.replace('./src/', 'src/')}:`);
      issues.forEach(issue => {
        console.log(`   Line ${issue.line}: "${issue.american}" → "${issue.australian}"`);
        console.log(`   Context: ${issue.context}`);
        console.log('');
      });
    });
  }

  if (dbResults.length > 0) {
    console.log(`\n🗄️ DATABASE CONTENT ISSUES (${dbResults.length} found):\n`);

    // Group by table
    const groupedByTable = {};
    dbResults.forEach(result => {
      if (!groupedByTable[result.table]) {
        groupedByTable[result.table] = [];
      }
      groupedByTable[result.table].push(result);
    });

    Object.entries(groupedByTable).forEach(([table, issues]) => {
      console.log(`\n📋 ${table} table:`);
      issues.forEach(issue => {
        console.log(`   ${issue.name} (${issue.field}): "${issue.american}" → "${issue.australian}"`);
        console.log(`   Content: ${issue.content}`);
        console.log('');
      });
    });
  }

  // Summary
  console.log('\n📈 SUMMARY:');
  console.log(`• Source code issues: ${codeResults.length}`);
  console.log(`• Database content issues: ${dbResults.length}`);
  console.log(`• Total issues: ${codeResults.length + dbResults.length}`);

  if (codeResults.length > 0 || dbResults.length > 0) {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Review the issues above');
    console.log('2. Apply corrections using find/replace');
    console.log('3. Update database content where appropriate');
    console.log('4. Establish Australian spelling guidelines for future development');
  }

  // Save detailed report to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      codeIssues: codeResults.length,
      dbIssues: dbResults.length,
      totalIssues: codeResults.length + dbResults.length
    },
    codeResults,
    dbResults,
    spellingCorrections: SPELLING_CORRECTIONS
  };

  fs.writeFileSync('./australian-spelling-audit-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Detailed report saved to: australian-spelling-audit-report.json');
}

auditSpelling().catch(console.error);