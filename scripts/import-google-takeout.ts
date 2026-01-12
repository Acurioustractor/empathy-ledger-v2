/**
 * Import Google Takeout Photos with Full Metadata
 *
 * Imports photos from a Google Takeout export, preserving:
 * - Titles and descriptions
 * - Date taken
 * - GPS coordinates
 * - Album organization (becomes tags/projects)
 * - People tags
 *
 * Usage:
 *   npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout/Google Photos"
 *   npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout" --dry-run
 *   npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout" --album="PICC 2025"
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
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

interface GooglePhotoMetadata {
  title?: string;
  description?: string;
  imageViews?: string;
  creationTime?: {
    timestamp: string;
    formatted: string;
  };
  photoTakenTime?: {
    timestamp: string;
    formatted: string;
  };
  geoData?: {
    latitude: number;
    longitude: number;
    altitude: number;
    latitudeSpan: number;
    longitudeSpan: number;
  };
  geoDataExif?: {
    latitude: number;
    longitude: number;
    altitude: number;
    latitudeSpan: number;
    longitudeSpan: number;
  };
  people?: Array<{ name: string }>;
  url?: string;
  googlePhotosOrigin?: {
    mobileUpload?: { deviceType: string };
    fromPartnerSharing?: { partnerName: string };
  };
}

interface ImportOptions {
  path: string;
  dryRun: boolean;
  albumFilter?: string;
  projectName?: string;
  batchSize: number;
  skipExisting: boolean;
}

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    path: '',
    dryRun: false,
    batchSize: 50,
    skipExisting: true
  };

  for (const arg of args) {
    if (arg.startsWith('--path=')) {
      options.path = arg.replace('--path=', '');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--album=')) {
      options.albumFilter = arg.replace('--album=', '');
    } else if (arg.startsWith('--project=')) {
      options.projectName = arg.replace('--project=', '');
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.replace('--batch-size=', ''));
    } else if (arg === '--include-existing') {
      options.skipExisting = false;
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

function findGooglePhotosDir(basePath: string): string {
  // Handle both "Takeout/Google Photos" and direct "Google Photos" paths
  const googlePhotosPath = path.join(basePath, 'Google Photos');
  if (fs.existsSync(googlePhotosPath)) {
    return googlePhotosPath;
  }

  const takeoutPath = path.join(basePath, 'Takeout', 'Google Photos');
  if (fs.existsSync(takeoutPath)) {
    return takeoutPath;
  }

  // Check if basePath itself is the Google Photos folder
  const items = fs.readdirSync(basePath);
  const hasAlbums = items.some(item => {
    const itemPath = path.join(basePath, item);
    return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
  });

  if (hasAlbums) {
    return basePath;
  }

  throw new Error(`Could not find Google Photos directory in ${basePath}`);
}

interface PhotoFile {
  filePath: string;
  metadataPath: string | null;
  albumName: string;
  filename: string;
}

function findPhotoFiles(googlePhotosDir: string, albumFilter?: string): PhotoFile[] {
  const photos: PhotoFile[] = [];

  // List all albums (directories)
  const albums = fs.readdirSync(googlePhotosDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`\n📁 Found ${albums.length} albums:`);

  for (const album of albums) {
    // Skip if album filter is set and doesn't match
    if (albumFilter && !album.toLowerCase().includes(albumFilter.toLowerCase())) {
      continue;
    }

    const albumPath = path.join(googlePhotosDir, album);
    const files = fs.readdirSync(albumPath);

    let albumPhotoCount = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      // Skip metadata files and non-media files
      if (ext === '.json' || !ALL_EXTENSIONS.includes(ext)) {
        continue;
      }

      const filePath = path.join(albumPath, file);

      // Look for matching metadata JSON
      // Google names it: photo.jpg.json or photo.json
      let metadataPath: string | null = null;
      const jsonPath1 = filePath + '.json';
      const jsonPath2 = filePath.replace(ext, '.json');

      if (fs.existsSync(jsonPath1)) {
        metadataPath = jsonPath1;
      } else if (fs.existsSync(jsonPath2)) {
        metadataPath = jsonPath2;
      }

      photos.push({
        filePath,
        metadataPath,
        albumName: album,
        filename: file
      });

      albumPhotoCount++;
    }

    if (albumPhotoCount > 0) {
      console.log(`   📂 ${album}: ${albumPhotoCount} photos`);
    }
  }

  return photos;
}

function readMetadata(metadataPath: string): GooglePhotoMetadata | null {
  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractTags(metadata: GooglePhotoMetadata, albumName: string): string[] {
  const tags: string[] = [];

  // Album becomes a tag
  if (albumName && albumName !== 'Photos from' && !albumName.match(/^\d{4}$/)) {
    tags.push(albumName.replace(/[^\w\s-]/g, '').trim());
  }

  // People become tags
  if (metadata.people) {
    for (const person of metadata.people) {
      if (person.name) {
        tags.push(`person:${person.name}`);
      }
    }
  }

  // Year as tag
  const timestamp = metadata.photoTakenTime?.timestamp || metadata.creationTime?.timestamp;
  if (timestamp) {
    const date = new Date(parseInt(timestamp) * 1000);
    tags.push(date.getFullYear().toString());
  }

  return [...new Set(tags)]; // Remove duplicates
}

async function importGoogleTakeout(options: ImportOptions) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📷 GOOGLE TAKEOUT IMPORT');
  console.log('═══════════════════════════════════════════════════════════');

  if (!options.path) {
    console.error('\n❌ Error: --path is required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout"');
    console.log('  npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout" --album="PICC"');
    console.log('  npx tsx scripts/import-google-takeout.ts --path="/path/to/Takeout" --dry-run');
    process.exit(1);
  }

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Find Google Photos directory
  let googlePhotosDir: string;
  try {
    googlePhotosDir = findGooglePhotosDir(options.path);
    console.log(`\n📂 Google Photos directory: ${googlePhotosDir}`);
  } catch (error) {
    console.error(`\n❌ ${error}`);
    process.exit(1);
  }

  // Resolve project ID if specified
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
      console.log(`📁 Assigning to project: ${project.name}`);
    }
  }

  // Find all photo files
  const photos = findPhotoFiles(googlePhotosDir, options.albumFilter);

  console.log(`\n📊 Total photos found: ${photos.length}`);

  if (options.dryRun) {
    // Show sample metadata
    console.log('\n───────────────────────────────────────────────────────────');
    console.log('📋 SAMPLE METADATA PREVIEW');
    console.log('───────────────────────────────────────────────────────────\n');

    const samplesWithMetadata = photos.filter(p => p.metadataPath).slice(0, 5);

    for (const photo of samplesWithMetadata) {
      const metadata = readMetadata(photo.metadataPath!);
      if (metadata) {
        console.log(`📷 ${photo.filename}`);
        console.log(`   Album: ${photo.albumName}`);
        if (metadata.title) console.log(`   Title: ${metadata.title}`);
        if (metadata.description) console.log(`   Description: ${metadata.description}`);
        if (metadata.photoTakenTime) {
          const date = new Date(parseInt(metadata.photoTakenTime.timestamp) * 1000);
          console.log(`   Taken: ${date.toLocaleDateString()}`);
        }
        if (metadata.geoData?.latitude) {
          console.log(`   Location: ${metadata.geoData.latitude}, ${metadata.geoData.longitude}`);
        }
        if (metadata.people?.length) {
          console.log(`   People: ${metadata.people.map(p => p.name).join(', ')}`);
        }
        const tags = extractTags(metadata, photo.albumName);
        if (tags.length) console.log(`   Tags: ${tags.join(', ')}`);
        console.log('');
      }
    }

    // Summary by album
    const albumCounts = new Map<string, number>();
    for (const photo of photos) {
      albumCounts.set(photo.albumName, (albumCounts.get(photo.albumName) || 0) + 1);
    }

    console.log('───────────────────────────────────────────────────────────');
    console.log('📊 ALBUMS SUMMARY');
    console.log('───────────────────────────────────────────────────────────\n');

    const sortedAlbums = [...albumCounts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [album, count] of sortedAlbums.slice(0, 20)) {
      console.log(`   ${count.toString().padStart(4)} photos - ${album}`);
    }
    if (sortedAlbums.length > 20) {
      console.log(`   ... and ${sortedAlbums.length - 20} more albums`);
    }

    console.log('\n✓ Dry run complete. Remove --dry-run to import.');
    return;
  }

  // Actual import
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('📤 IMPORTING PHOTOS');
  console.log('───────────────────────────────────────────────────────────\n');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = path.extname(photo.filename).toLowerCase();
    const mediaType = getMediaType(ext);

    // Progress indicator
    if (i % 10 === 0) {
      process.stdout.write(`\r   Progress: ${i}/${photos.length} (${Math.round(i/photos.length*100)}%)`);
    }

    // Calculate hash for deduplication
    let fileHash: string;
    try {
      fileHash = getFileHash(photo.filePath);
    } catch {
      errors++;
      continue;
    }

    // Check for existing
    if (options.skipExisting) {
      const { data: existing } = await supabase
        .from('media_assets')
        .select('id')
        .eq('file_hash', fileHash)
        .single();

      if (existing) {
        skipped++;
        continue;
      }
    }

    // Read metadata
    const metadata = photo.metadataPath ? readMetadata(photo.metadataPath) : null;
    const tags = metadata ? extractTags(metadata, photo.albumName) : [photo.albumName];

    // Extract location
    let location = null;
    const geoData = metadata?.geoData || metadata?.geoDataExif;
    if (geoData?.latitude && geoData?.longitude) {
      location = {
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        altitude: geoData.altitude
      };
    }

    // Extract date
    let dateTaken = null;
    const timestamp = metadata?.photoTakenTime?.timestamp || metadata?.creationTime?.timestamp;
    if (timestamp) {
      dateTaken = new Date(parseInt(timestamp) * 1000).toISOString();
    }

    // Read file
    let fileContent: Buffer;
    let fileSize: number;
    try {
      fileContent = fs.readFileSync(photo.filePath);
      fileSize = fs.statSync(photo.filePath).size;
    } catch {
      errors++;
      continue;
    }

    // Upload to storage
    const storagePath = `media/${ACT_ORG_ID}/${Date.now()}-${photo.filename}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, fileContent, {
        contentType: mediaType === 'image' ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`,
        upsert: false
      });

    if (uploadError) {
      errors++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);

    // Create database record
    const { error: insertError } = await supabase
      .from('media_assets')
      .insert({
        tenant_id: ACT_TENANT_ID,
        organization_id: ACT_ORG_ID,
        project_id: projectId,
        filename: photo.filename,
        original_filename: photo.filename,
        file_path: storagePath,
        file_url: urlData.publicUrl,
        file_hash: fileHash,
        file_size: fileSize,
        mime_type: mediaType === 'image' ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`,
        media_type: mediaType,
        status: 'uploaded',
        tags: tags,
        title: metadata?.title || null,
        description: metadata?.description || null,
        captured_at: dateTaken,
        location: location ? JSON.stringify(location) : null,
        metadata: {
          imported_from: 'google_takeout',
          album: photo.albumName,
          people: metadata?.people?.map(p => p.name) || [],
          google_photos_url: metadata?.url || null,
          import_date: new Date().toISOString()
        }
      });

    if (insertError) {
      errors++;
    } else {
      imported++;
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📊 IMPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ✓ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📷 Total processed: ${photos.length}`);
  console.log('\n   View at: /admin/compendium-media');
}

importGoogleTakeout(parseArgs()).catch(console.error);
