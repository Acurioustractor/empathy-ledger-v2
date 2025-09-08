#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files with dynamic routes
const dynamicRoutes = glob.sync('src/app/**/\\[*\\]/**/*.{ts,tsx}');

let fixedCount = 0;

dynamicRoutes.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix interface declarations
  const interfacePattern = /interface\s+\w+Props\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g;
  if (interfacePattern.test(content)) {
    content = content.replace(interfacePattern, (match) => {
      return match.replace('params: { id: string }', 'params: Promise<{ id: string }>');
    });
    modified = true;
  }
  
  // Fix params.id usage in async functions without await
  // Look for patterns like: params.id (not preceded by await)
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('params.id') && !lines[i].includes('await params')) {
      // Check if this is in an async function
      let isAsync = false;
      for (let j = i; j >= 0 && j > i - 20; j--) {
        if (lines[j].includes('async function') || lines[j].includes('async (')) {
          isAsync = true;
          break;
        }
      }
      
      if (isAsync) {
        // Add await before the function body if needed
        console.log(`Found params.id usage in ${file} at line ${i + 1}`);
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed interface in ${file}`);
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);