const fs = require('fs');
const glob = require('glob');

const routeFiles = glob.sync('src/app/api/**/route.ts');

routeFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // First, remove any existing dynamic exports we may have added
  content = content.replace(/\/\/ Force dynamic rendering for API routes\nexport const dynamic = 'force-dynamic'\n/g, '');
  content = content.replace(/export const dynamic = 'force-dynamic'\n/g, '');

  const lines = content.split('\n');
  let lastImportEnd = -1;
  let inMultilineImport = false;

  // Find the end of all imports (including multi-line)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Start of an import
    if (line.startsWith('import ')) {
      if (line.includes('{') && !line.includes('}')) {
        // Multi-line import started
        inMultilineImport = true;
      }
      if (line.includes(';') || (!line.includes('{') && line.includes('from'))) {
        // Single-line import
        lastImportEnd = i;
      }
    }

    // Inside a multi-line import
    if (inMultilineImport) {
      if (line.includes('}')) {
        // Multi-line import ended
        inMultilineImport = false;
        lastImportEnd = i;
      }
    }
  }

  // Insert after all imports
  if (lastImportEnd >= 0) {
    lines.splice(lastImportEnd + 1, 0, '', '// Force dynamic rendering for API routes', "export const dynamic = 'force-dynamic'");
  } else {
    // No imports, add at beginning
    lines.unshift("// Force dynamic rendering for API routes", "export const dynamic = 'force-dynamic'", '');
  }

  fs.writeFileSync(file, lines.join('\n'));
  console.log(`Fixed ${file}`);
});

console.log(`\nProcessed ${routeFiles.length} files`);
