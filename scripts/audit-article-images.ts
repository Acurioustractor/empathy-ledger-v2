import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase service credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  source_url: string | null;
  featured_image_id: string | null;
  import_metadata: any;
};

type ImageRef = {
  type: 'featured' | 'content';
  url: string;
};

function extractImageUrls(content: string | null): string[] {
  if (!content) return [];
  const urls = new Set<string>();
  const htmlRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const mdRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

  let match: RegExpExecArray | null;
  while ((match = htmlRegex.exec(content))) {
    urls.add(match[1]);
  }
  while ((match = mdRegex.exec(content))) {
    urls.add(match[1]);
  }

  return Array.from(urls);
}

function resolveAssetUrl(url: string, sourceUrl?: string | null) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/') && sourceUrl) {
    try {
      const origin = new URL(sourceUrl).origin;
      return `${origin}${url}`;
    } catch {
      return url;
    }
  }
  return url;
}

async function checkUrl(url: string, timeoutMs: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    if (response.status === 405) {
      const controllerGet = new AbortController();
      const timeoutGet = setTimeout(() => controllerGet.abort(), timeoutMs);
      const getResponse = await fetch(url, { method: 'GET', signal: controllerGet.signal });
      clearTimeout(timeoutGet);
      return getResponse.status;
    }
    return response.status;
  } catch (error) {
    return 0;
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
) {
  const results: R[] = [];
  let index = 0;

  async function next() {
    const current = index++;
    if (current >= items.length) return;
    const result = await worker(items[current]);
    results.push(result);
    await next();
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => next());
  await Promise.all(runners);
  return results;
}

async function main() {
  const maxArticles = parseInt(process.env.IMAGE_AUDIT_MAX_ARTICLES || '200', 10);
  const maxImagesPerArticle = parseInt(process.env.IMAGE_AUDIT_MAX_IMAGES || '6', 10);
  const timeoutMs = parseInt(process.env.IMAGE_AUDIT_TIMEOUT_MS || '5000', 10);
  const concurrency = parseInt(process.env.IMAGE_AUDIT_CONCURRENCY || '8', 10);

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, source_url, featured_image_id, import_metadata')
    .eq('status', 'published');

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  const articles = (data || []).slice(0, maxArticles) as ArticleRow[];
  const imageChecks: Array<{
    slug: string;
    title: string;
    url: string;
    type: string;
    status: number;
  }> = [];

  const checks: Array<{ slug: string; title: string; url: string; type: string; sourceUrl: string | null }> = [];

  for (const article of articles) {
    const sourceUrl = article.source_url || null;
    const featuredUrl = article.import_metadata?.featuredImageUrl || null;
    const imageUrls = extractImageUrls(article.content);

    const imageRefs: ImageRef[] = [];
    if (featuredUrl) {
      imageRefs.push({ type: 'featured', url: featuredUrl });
    }
    for (const url of imageUrls) {
      imageRefs.push({ type: 'content', url });
    }

    const limited = imageRefs.slice(0, maxImagesPerArticle);
    for (const image of limited) {
      const resolved = resolveAssetUrl(image.url, sourceUrl);
      checks.push({
        slug: article.slug,
        title: article.title,
        url: resolved,
        type: image.type,
        sourceUrl,
      });
    }
  }

  const uniqueChecks = Array.from(
    new Map(checks.map((item) => [`${item.slug}:${item.url}`, item])).values()
  );

  await runWithConcurrency(uniqueChecks, concurrency, async (item) => {
    const status = await checkUrl(item.url, timeoutMs);
    if (status === 0 || status >= 400) {
      imageChecks.push({
        slug: item.slug,
        title: item.title,
        url: item.url,
        type: item.type,
        status,
      });
    }
  });

  const broken = imageChecks.filter(item => item.status >= 400 || item.status === 0);
  console.log(`Checked ${articles.length} articles.`);
  console.log(`Broken/missing images: ${broken.length}`);

  const grouped = broken.reduce<Record<string, typeof broken>>((acc, item) => {
    acc[item.slug] = acc[item.slug] || [];
    acc[item.slug].push(item);
    return acc;
  }, {});

  const top = Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);

  for (const [slug, items] of top) {
    console.log(`\n${slug} (${items.length})`);
    for (const item of items.slice(0, 5)) {
      console.log(`  [${item.type}] ${item.status} ${item.url}`);
    }
    if (items.length > 5) {
      console.log(`  ... ${items.length - 5} more`);
    }
  }
}

main().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
