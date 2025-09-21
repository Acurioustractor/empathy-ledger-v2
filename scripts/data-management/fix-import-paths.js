#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixImportPaths(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Fix the specific import path that's causing the error
    const updatedContent = content.replace(
      /@\/components\/organisation\//g,
      '@/components/organization/'
    );

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed import paths in: ${filePath.replace('./src/', 'src/')}`);
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
    return 0;
  }
}

function scanAndFixDirectory(dirPath) {
  let totalFixes = 0;

  function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    totalFixes += fixImportPaths(filePath);
  }

  function walk(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
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
  return totalFixes;
}

console.log('🔧 Fixing import paths for organization components...\n');

const fixes = scanAndFixDirectory('./src');

console.log(`\n📊 Fixed ${fixes} import path(s)`);

if (fixes > 0) {
  console.log('✅ Build should now work correctly!');
} else {
  console.log('ℹ️ No import paths needed fixing');
}