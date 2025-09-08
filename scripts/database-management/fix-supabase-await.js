#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in src/app/api
const apiFiles = glob.sync('src/app/api/**/*.ts');

let fixedCount = 0;

apiFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix pattern: const supabase = createSupabaseServerClient()
  // Replace with: const supabase = await createSupabaseServerClient()
  const pattern1 = /const\s+supabase\s*=\s*createSupabaseServerClient\(\)/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, 'const supabase = await createSupabaseServerClient()');
    modified = true;
  }
  
  // Also fix pattern with destructuring
  const pattern2 = /const\s+{\s*supabase\s*}\s*=\s*createSupabaseServerClient\(\)/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, 'const { supabase } = await createSupabaseServerClient()');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed ${file}`);
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);