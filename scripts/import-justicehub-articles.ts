import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sourcePath =
  process.env.JUSTICEHUB_ARTICLES_PATH ||
  '/Users/benknight/Code/JusticeHub/data/webflow-migration/articles.json';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase service credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type JusticeHubArticle = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  category?: string;
  isTrending?: boolean;
  publishedAt?: string;
  authorName?: string;
  locationTags?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

function buildTags(article: JusticeHubArticle) {
  const tags = new Set<string>();
  if (article.category) tags.add(article.category);
  if (article.locationTags?.length) {
    article.locationTags.forEach(tag => tags.add(tag));
  }
  tags.add('justicehub');
  tags.add('source:webflow');
  return Array.from(tags);
}

async function fetchExistingSlugs() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, status, visibility, published_at')
    .in('source_platform', ['webflow'])
    .limit(2000);

  if (error) {
    console.error('Failed to fetch existing article slugs:', error.message);
    return new Map<string, { id: string; status: string | null; visibility: string | null; published_at: string | null }>();
  }

  const map = new Map<string, { id: string; status: string | null; visibility: string | null; published_at: string | null }>();
  (data || []).forEach(row => {
    map.set(row.slug, {
      id: row.id,
      status: row.status ?? null,
      visibility: row.visibility ?? null,
      published_at: row.published_at ?? null
    });
  });
  return map;
}

async function main() {
  const raw = readFileSync(sourcePath, 'utf-8');
  const articles = JSON.parse(raw) as JusticeHubArticle[];

  console.log(`📥 Loaded ${articles.length} JusticeHub articles from ${sourcePath}`);

  const existing = await fetchExistingSlugs();
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let updated = 0;

  for (const article of articles) {
    if (!article.slug) {
      console.warn(`⚠️  Skipping article with missing slug: ${article.title || 'Untitled'}`);
      skipped += 1;
      continue;
    }

    const articleData = {
      title: article.title || 'Untitled',
      slug: article.slug,
      subtitle: null,
      content: article.content || '',
      excerpt: article.excerpt || '',
      featured_image_id: null,
      gallery_ids: [],
      author_type: 'organization',
      author_storyteller_id: null,
      author_name: article.authorName || 'JusticeHub',
      author_bio: null,
      article_type: 'story_feature',
      primary_project: 'justicehub',
      related_projects: ['justicehub'],
      tags: buildTags(article),
      themes: [],
      status: 'draft',
      requires_elder_review: false,
      elder_reviewer_id: null,
      elder_review_notes: null,
      published_at: article.publishedAt || null,
      scheduled_publish_at: null,
      visibility: 'private',
      syndication_enabled: true,
      syndication_destinations: [],
      meta_title: article.seoTitle || article.title || 'JusticeHub',
      meta_description: article.seoDescription || article.excerpt || '',
      canonical_url: `https://www.justicehub.com.au/articles/${article.slug}`,
      views_count: 0,
      likes_count: 0,
      shares_count: 0,
      source_platform: 'webflow',
      source_id: article.slug,
      source_url: `https://www.justicehub.com.au/articles/${article.slug}`,
      imported_at: new Date().toISOString(),
      import_metadata: {
        category: article.category || null,
        isTrending: Boolean(article.isTrending),
        authorName: article.authorName || null,
        locationTags: article.locationTags || [],
        featuredImageUrl: article.featuredImageUrl || null,
        publishedAt: article.publishedAt || null,
        seoTitle: article.seoTitle || null,
        seoDescription: article.seoDescription || null,
        sourcePath,
      },
    };

    const existingRow = existing.get(article.slug);
    if (existingRow) {
      const { error } = await supabase
        .from('articles')
        .update({
          title: articleData.title,
          subtitle: articleData.subtitle,
          content: articleData.content,
          excerpt: articleData.excerpt,
          author_name: articleData.author_name,
          article_type: articleData.article_type,
          tags: articleData.tags,
          themes: articleData.themes,
          meta_title: articleData.meta_title,
          meta_description: articleData.meta_description,
          canonical_url: articleData.canonical_url,
          source_platform: articleData.source_platform,
          source_id: articleData.source_id,
          source_url: articleData.source_url,
          import_metadata: articleData.import_metadata,
          imported_at: articleData.imported_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRow.id);

      if (error) {
        console.error(`❌ Error updating "${article.title}": ${error.message}`);
        errors += 1;
        continue;
      }

      updated += 1;
      continue;
    }

    const { error } = await supabase
      .from('articles')
      .insert([articleData]);

    if (error) {
      console.error(`❌ Error importing "${article.title}": ${error.message}`);
      errors += 1;
      continue;
    }

    imported += 1;
  }

  console.log(`\n✅ JusticeHub import complete: ${imported} imported, ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});
