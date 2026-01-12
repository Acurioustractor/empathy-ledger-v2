/**
 * Import Local Media to Empathy Ledger
 *
 * Simple script to import photos/videos from a local folder into Empathy Ledger.
 * Works great with downloaded Google Photos or any local media.
 *
 * Usage:
 *   npx tsx scripts/import-local-media.ts --path="/path/to/photos" --project="PICC Photo Kiosk"
 *   npx tsx scripts/import-local-media.ts --path="/path/to/photos" --storyteller="Benjamin Knight"
 *   npx tsx scripts/import-local-media.ts --path="/path/to/photos" --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
const ACT_TENANT_ID = '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943';

// Supported file types
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

interface ImportOptions {
  path: string;
  projectName?: string;
  storytellerName?: string;
  dryRun?: boolean;
  recursive?: boolean;
  tags?: string[];
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    path: '',
    dryRun: false,
    recursive: true,
    tags: []
  };

  for (const arg of args) {
    if (arg.startsWith('--path=')) {
      options.path = arg.replace('--path=', '');
    } else if (arg.startsWith('--project=')) {
      options.projectName = arg.replace('--project=', '');
    } else if (arg.startsWith('--storyteller=')) {
      options.storytellerName = arg.replace('--storyteller=', '');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    } else if (arg.startsWith('--tags=')) {
      options.tags = arg.replace('--tags=', '').split(',');
    }
  }

  return options;
}

function getFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

function getMediaType(ext: string): 'image' | 'video' | null {
  if (IMAGE_EXTENSIONS.includes(ext.toLowerCase())) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext.toLowerCase())) return 'video';
  return null;
}

function findMediaFiles(dir: string, recursive: boolean): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory() && recursive) {
      files.push(...findMediaFiles(fullPath, recursive));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (ALL_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function importMedia(options: ImportOptions) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📷 IMPORT LOCAL MEDIA TO EMPATHY LEDGER');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!options.path) {
    console.error('❌ Error: --path is required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/import-local-media.ts --path="/path/to/photos"');
    console.log('  npx tsx scripts/import-local-media.ts --path="/path/to/photos" --project="Project Name"');
    console.log('  npx tsx scripts/import-local-media.ts --path="/path/to/photos" --dry-run');
    process.exit(1);
  }

  if (!fs.existsSync(options.path)) {
    console.error(`❌ Error: Path does not exist: ${options.path}`);
    process.exit(1);
  }

  // Resolve project ID
  let projectId: string | null = null;
  if (options.projectName) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('organization_id', ACT_ORG_ID)
      .ilike('name', `%${options.projectName}%`)
      .single();

    if (project) {
      projectId = project.id;
      console.log(`📁 Project: ${project.name}`);
    } else {
      console.log(`⚠️  Project not found: "${options.projectName}"`);
      console.log('   Available projects:');
      const { data: projects } = await supabase
        .from('projects')
        .select('name')
        .eq('organization_id', ACT_ORG_ID)
        .order('name')
        .limit(10);
      projects?.forEach(p => console.log(`     - ${p.name}`));
      process.exit(1);
    }
  }

  // Resolve storyteller ID
  let storytellerId: string | null = null;
  if (options.storytellerName) {
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('id, display_name')
      .ilike('display_name', `%${options.storytellerName}%`)
      .single();

    if (storyteller) {
      storytellerId = storyteller.id;
      console.log(`👤 Storyteller: ${storyteller.display_name}`);
    } else {
      console.log(`⚠️  Storyteller not found: "${options.storytellerName}"`);
    }
  }

  if (options.dryRun) {
    console.log('🔍 DRY RUN - no changes will be made\n');
  }

  // Find all media files
  console.log(`\n📂 Scanning: ${options.path}`);
  const files = findMediaFiles(options.path, options.recursive ?? true);

  const images = files.filter(f => getMediaType(path.extname(f)) === 'image');
  const videos = files.filter(f => getMediaType(path.extname(f)) === 'video');

  console.log(`   Found ${files.length} files:`);
  console.log(`   - Images: ${images.length}`);
  console.log(`   - Videos: ${videos.length}`);

  if (options.dryRun) {
    console.log('\n📋 Files to import:');
    files.slice(0, 20).forEach(f => console.log(`   ${path.basename(f)}`));
    if (files.length > 20) {
      console.log(`   ... and ${files.length - 20} more`);
    }
    console.log('\n✓ Dry run complete. Remove --dry-run to import.');
    return;
  }

  // Import files
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('📤 IMPORTING FILES');
  console.log('───────────────────────────────────────────────────────────\n');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filename = path.basename(file);
    const ext = path.extname(file).toLowerCase();
    const mediaType = getMediaType(ext);
    const fileHash = getFileHash(file);

    // Check for duplicates
    const { data: existing } = await supabase
      .from('media_assets')
      .select('id')
      .eq('file_hash', fileHash)
      .single();

    if (existing) {
      console.log(`  ⏭️  ${filename} (duplicate)`);
      skipped++;
      continue;
    }

    // Get file stats
    const stats = fs.statSync(file);
    const fileContent = fs.readFileSync(file);

    // Upload to Supabase Storage
    const storagePath = `media/${ACT_ORG_ID}/${Date.now()}-${filename}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, fileContent, {
        contentType: mediaType === 'image' ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`,
        upsert: false
      });

    if (uploadError) {
      console.log(`  ❌ ${filename}: ${uploadError.message}`);
      errors++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);

    // Create media_assets record
    const { error: insertError } = await supabase
      .from('media_assets')
      .insert({
        tenant_id: ACT_TENANT_ID,
        organization_id: ACT_ORG_ID,
        project_id: projectId,
        storyteller_id: storytellerId,
        filename: filename,
        original_filename: filename,
        file_path: storagePath,
        file_url: urlData.publicUrl,
        file_hash: fileHash,
        file_size: stats.size,
        mime_type: mediaType === 'image' ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`,
        media_type: mediaType,
        status: 'uploaded',
        tags: options.tags || [],
        metadata: {
          imported_from: 'local',
          original_path: file,
          import_date: new Date().toISOString()
        }
      });

    if (insertError) {
      console.log(`  ❌ ${filename}: ${insertError.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${filename}`);
      imported++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (duplicates): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total processed: ${files.length}`);

  if (projectId) {
    console.log(`\n  View in project: /admin/projects/${projectId}/media`);
  }
  console.log(`  View all: /admin/compendium-media`);
}

importMedia(parseArgs()).catch(console.error);
