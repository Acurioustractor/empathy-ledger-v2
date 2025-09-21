#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CSS classes that were incorrectly changed and need to be reverted
const CSS_CLASS_FIXES = {
  // Tailwind uses American spelling in class names
  'items-centre': 'items-center',
  'justify-centre': 'justify-center',
  'text-centre': 'text-center',
  'place-items-centre': 'place-items-center',
  'place-content-centre': 'place-content-center',
  'bg-grey-': 'bg-gray-',
  'text-grey-': 'text-gray-',
  'border-grey-': 'border-gray-',
  'hover:bg-grey-': 'hover:bg-gray-',
  'hover:text-grey-': 'hover:text-gray-',
  'dark:bg-grey-': 'dark:bg-gray-',
  'dark:text-grey-': 'dark:text-gray-',
  'dark:border-grey-': 'dark:border-gray-',
  'dark:hover:bg-grey-': 'dark:hover:bg-gray-',
  'dark:hover:text-grey-': 'dark:hover:text-gray-',
};

function fixCSSClasses(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changes = 0;

    // Apply each CSS class fix
    Object.entries(CSS_CLASS_FIXES).forEach(([incorrect, correct]) => {
      // Handle both exact matches and partial matches (for numbered classes like grey-500)
      if (incorrect.endsWith('-')) {
        // For patterns like 'bg-grey-', match bg-grey-100, bg-grey-500, etc.
        const regex = new RegExp(incorrect.replace('-', '-(\\d+)'), 'g');
        const matches = updatedContent.match(regex);
        if (matches) {
          changes += matches.length;
          updatedContent = updatedContent.replace(regex, correct + '$1');
        }
      } else {
        // For exact matches like 'items-centre'
        const regex = new RegExp(`\\b${incorrect}\\b`, 'g');
        const matches = updatedContent.match(regex);
        if (matches) {
          changes += matches.length;
          updatedContent = updatedContent.replace(regex, correct);
        }
      }
    });

    // Only write file if changes were made
    if (changes > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ ${filePath.replace('./src/', 'src/')}: ${changes} CSS classes fixed`);
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
    const changes = fixCSSClasses(filePath);
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

async function fixCSSClassNames() {
  console.log('🔧 Fixing CSS class names that were incorrectly changed by spelling correction...\n');

  // Process source files
  console.log('📁 Processing source code files...\n');
  const { totalChanges, filesProcessed } = scanAndFixDirectory('./src');

  console.log('\n📊 CSS CLASS FIX SUMMARY:');
  console.log(`• Files processed: ${filesProcessed}`);
  console.log(`• CSS classes fixed: ${totalChanges}`);

  if (totalChanges > 0) {
    console.log('\n✅ CSS class fixes completed successfully!');
    console.log('🎨 Icons and layout should now be properly positioned');
  } else {
    console.log('\n✅ No CSS classes needed fixing');
  }

  // Create summary file
  const summary = {
    timestamp: new Date().toISOString(),
    filesProcessed,
    totalChanges,
    fixesApplied: CSS_CLASS_FIXES
  };

  fs.writeFileSync('./css-class-fixes-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n💾 Summary saved to: css-class-fixes-summary.json');
}

fixCSSClassNames().catch(console.error);