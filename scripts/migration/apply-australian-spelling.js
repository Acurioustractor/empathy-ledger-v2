#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// American to Australian spelling corrections
const SPELLING_CORRECTIONS = {
  // Primary corrections - most common
  'organization': 'organisation',
  'organizations': 'organisations',
  'organize': 'organise',
  'organized': 'organised',
  'organizing': 'organising',
  'recognize': 'recognise',
  'recognized': 'recognised',
  'recognizing': 'recognising',
  'realize': 'realise',
  'realized': 'realised',
  'realizing': 'realising',
  'analyze': 'analyse',
  'analyzed': 'analysed',
  'analyzing': 'analysing',
  'color': 'colour',
  'colors': 'colours',
  'colored': 'coloured',
  'coloring': 'colouring',
  'center': 'centre',
  'centers': 'centres',
  'centered': 'centred',
  'centering': 'centring',
  'gray': 'grey',
  'grays': 'greys',
  'honor': 'honour',
  'honors': 'honours',
  'honored': 'honoured',
  'honoring': 'honouring',
  'favor': 'favour',
  'favors': 'favours',
  'favored': 'favoured',
  'favoring': 'favouring',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'theater': 'theatre',
  'theaters': 'theatres',
  'fiber': 'fibre',
  'fibers': 'fibres',
  'meter': 'metre',
  'meters': 'metres',
  'liter': 'litre',
  'liters': 'litres',
  'specialize': 'specialise',
  'specialized': 'specialised',
  'specializing': 'specialising',
  'categorize': 'categorise',
  'categorized': 'categorised',
  'categorizing': 'categorising',
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'labor': 'labour',
  'labors': 'labours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  'defense': 'defence',
  'defenses': 'defences',
  'offense': 'offence',
  'offenses': 'offences',
  'canceled': 'cancelled',
  'canceling': 'cancelling',
  'traveling': 'travelling',
  'traveled': 'travelled',
  'traveler': 'traveller',
  'travelers': 'travellers',
  'modeling': 'modelling',
  'modeled': 'modelled',
  'counselor': 'counsellor',
  'counselors': 'counsellors'
};

function applyCorrectionsToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changes = 0;

    // Apply each correction
    Object.entries(SPELLING_CORRECTIONS).forEach(([american, australian]) => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${american}\\b`, 'g');
      const matches = updatedContent.match(regex);
      if (matches) {
        changes += matches.length;
        updatedContent = updatedContent.replace(regex, australian);
      }
    });

    // Only write file if changes were made
    if (changes > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ ${filePath.replace('./src/', 'src/')}: ${changes} corrections applied`);
      return changes;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

function scanAndFixDirectory(dirPath, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  let totalChanges = 0;
  let filesProcessed = 0;

  function processFile(filePath) {
    if (!extensions.some(ext => filePath.endsWith(ext))) return;

    filesProcessed++;
    const changes = applyCorrectionsToFile(filePath);
    totalChanges += changes;
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
          processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  walk(dirPath);
  return { totalChanges, filesProcessed };
}

async function applyAustralianSpelling() {
  console.log('🇦🇺 Applying Australian Spelling Corrections\n');
  console.log('Converting American spelling to Australian spelling...\n');

  // Process source files
  console.log('📁 Processing source code files...\n');
  const { totalChanges, filesProcessed } = scanAndFixDirectory('./src');

  console.log('\n📊 CORRECTION SUMMARY:');
  console.log(`• Files processed: ${filesProcessed}`);
  console.log(`• Total corrections applied: ${totalChanges}`);

  if (totalChanges > 0) {
    console.log('\n✅ Australian spelling corrections completed successfully!');
    console.log('\n📝 Note: Database content corrections should be handled separately');
    console.log('   to avoid unintended changes to user-generated content.');
  } else {
    console.log('\n✅ No corrections needed - Australian spelling already consistent!');
  }

  // Create summary file
  const summary = {
    timestamp: new Date().toISOString(),
    filesProcessed,
    totalChanges,
    correctionsApplied: SPELLING_CORRECTIONS
  };

  fs.writeFileSync('./australian-spelling-corrections-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n💾 Summary saved to: australian-spelling-corrections-summary.json');
}

applyAustralianSpelling().catch(console.error);