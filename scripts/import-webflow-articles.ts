import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { WebflowImportService } from '../src/lib/services/webflow-import.service';

dotenv.config({ path: '.env.local' });
if (!process.env.WEBFLOW_API_KEY && !process.env.WEBFLOW_API_TOKEN) {
  dotenv.config({ path: '/Users/benknight/Code/act-regenerative-studio/.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const webflowApiKey = process.env.WEBFLOW_API_KEY || process.env.WEBFLOW_API_TOKEN;
const actCollectionId = process.env.WEBFLOW_ACT_COLLECTION_ID || process.env.WEBFLOW_BLOG_COLLECTION_ID;
const justicehubCollectionId = process.env.WEBFLOW_JUSTICEHUB_COLLECTION_ID;
const organizationId =
  process.env.EMPATHY_LEDGER_ORGANIZATION_ID ||
  process.env.ORGANIZATION_ID ||
  'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase service credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

if (!webflowApiKey) {
  console.error('Missing WEBFLOW_API_KEY in environment.');
  process.exit(1);
}

if (!actCollectionId && !justicehubCollectionId) {
  console.error('Missing collection IDs. Set WEBFLOW_ACT_COLLECTION_ID and/or WEBFLOW_JUSTICEHUB_COLLECTION_ID.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const importOptions = {
  preserveSlug: true,
  importImages: process.env.WEBFLOW_IMPORT_IMAGES === 'true',
  skipDrafts: true,
};

async function runImport(label: string, collectionId: string, fieldMapping?: Record<string, string>) {
  console.log(`\n📰 Importing ${label} Webflow collection: ${collectionId}`);
  const request = {
    webflowCollectionId: collectionId,
    webflowApiKey,
    organizationId,
    importOptions: {
      ...importOptions,
      fieldMapping: fieldMapping || undefined
    }
  };
  const importService = new WebflowImportService(supabase, request);
  const result = await importService.importCollection(collectionId);
  console.log(
    `✅ ${label} import complete: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`
  );
  if (result.errors.length) {
    console.log(`⚠️  ${label} import errors (first 5):`);
    for (const err of result.errors.slice(0, 5)) {
      console.log(`- ${err.title || 'Unknown title'}: ${err.error}`);
    }
  }
}

async function main() {
  if (actCollectionId) {
    await runImport('ACT Main', actCollectionId);
  }
  if (justicehubCollectionId) {
    await runImport('JusticeHub', justicehubCollectionId, {
      titleField: 'name',
      slugField: 'slug',
      contentField: 'content-main-rich-text',
      excerptField: 'description-short',
      featuredImageField: 'image-main',
      authorField: 'author',
      categoryField: 'category',
      tagsField: 'tags'
    });
  }
}

main().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
