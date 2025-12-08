const fs = require('fs');
const path = require('path');
const glob = require('glob');

const routeFiles = glob.sync('src/app/api/**/route.ts');

routeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Skip if already has the export
  if (content.includes("export const dynamic =")) {
    console.log(`Skipping ${file} - already has dynamic export`);
    return;
  }

  const lines = content.split('\n');
  let lastImportIndex = -1;

  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  // Insert after the last import
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, '', '// Force dynamic rendering for API routes', "export const dynamic = 'force-dynamic'");
  } else {
    // No imports found, add at the beginning
    lines.unshift("// Force dynamic rendering for API routes", "export const dynamic = 'force-dynamic'", '');
  }

  fs.writeFileSync(file, lines.join('\n'));
  console.log(`Updated ${file}`);
});

console.log(`\nProcessed ${routeFiles.length} files`);
