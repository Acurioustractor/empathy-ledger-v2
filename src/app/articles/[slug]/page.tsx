import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen,
  Calendar,
  Clock,
  Globe,
  User,
  Share2,
  Heart,
  ArrowLeft,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { generateNextMetadata, generateStoryMetaTags } from '@/lib/utils/seo-generator'

// Create Supabase client for server-side
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Fetch article by slug
async function getArticle(slug: string) {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      storytellers:author_storyteller_id(id, display_name, bio)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  // Resolve featured image
  const sourceUrl = data.source_url || null
  let featuredImageUrl =
    data.import_metadata?.featuredImageUrl || extractFirstImage(data.content) || null
  let featuredImageAlt = null
  if (data.featured_image_id) {
    const { data: media } = await supabase
      .from('media_assets')
      .select('url, alt_text')
      .eq('id', data.featured_image_id)
      .single()
    if (media?.url) {
      featuredImageUrl = media.url
      featuredImageAlt = media.alt_text || null
    }
  }

  data.featured_image_url = resolveAssetUrl(featuredImageUrl, sourceUrl)
  data.featured_image_alt = featuredImageAlt

  // Increment view count
  await supabase
    .from('stories')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id)

  return data
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found | Empathy Ledger'
    }
  }

  // Use comprehensive SEO generator
  return generateNextMetadata({
    id: article.id,
    title: article.title,
    meta_title: article.meta_title,
    meta_description: article.meta_description,
    summary: article.excerpt || article.subtitle,
    content: article.content,
    article_type: article.article_type,
    slug: article.slug,
    featured_image_url: article.featured_image_url,
    author_name: article.author_name,
    published_at: article.published_at,
    updated_at: article.updated_at,
    tags: article.tags,
    themes: article.themes,
    storyteller_name: article.storytellers?.display_name
  })
}

// Article type labels
const articleTypeLabels: Record<string, { label: string; color: string }> = {
  story_feature: { label: 'Story Feature', color: 'bg-purple-100 text-purple-700' },
  program_spotlight: { label: 'Program Spotlight', color: 'bg-blue-100 text-blue-700' },
  research_summary: { label: 'Research', color: 'bg-green-100 text-green-700' },
  community_news: { label: 'Community News', color: 'bg-orange-100 text-orange-700' },
  editorial: { label: 'Editorial', color: 'bg-stone-100 text-stone-700' },
  impact_report: { label: 'Impact Report', color: 'bg-teal-100 text-teal-700' },
  project_update: { label: 'Project Update', color: 'bg-indigo-100 text-indigo-700' },
  tutorial: { label: 'Tutorial', color: 'bg-yellow-100 text-yellow-700' }
}

// Format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function extractFirstImage(content: string | null | undefined) {
  if (!content) return null
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (htmlMatch?.[1]) return htmlMatch[1]
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/)
  if (mdMatch?.[1]) return mdMatch[1]
  return null
}

function resolveAssetUrl(url: string | null | undefined, sourceUrl?: string | null) {
  if (!url) return null
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/images/')) return `${appBase}${url}`
  if (url.startsWith('/') && sourceUrl) {
    try {
      const origin = new URL(sourceUrl).origin
      return `${origin}${url}`
    } catch {
      return url
    }
  }
  return url
}

function rewriteRelativeImages(content: string, sourceUrl?: string | null) {
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'
  const origin = sourceUrl ? (() => {
    try {
      return new URL(sourceUrl).origin
    } catch {
      return null
    }
  })() : null

  return content.replace(
    /(<img[^>]+src=["'])(\/[^"']+)(["'])/gi,
    (_, prefix, path, suffix) => {
      if (path.startsWith('/images/')) {
        return `${prefix}${appBase}${path}${suffix}`
      }
      if (origin) {
        return `${prefix}${origin}${path}${suffix}`
      }
      return `${prefix}${path}${suffix}`
    }
  )
}

export default async function ArticlePage({
  params
}: {
  params: { slug: string }
}) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const typeConfig = articleTypeLabels[article.article_type] || {
    label: article.article_type,
    color: 'bg-stone-100 text-stone-700'
  }
  const readingTime = calculateReadingTime(article.content || '')
  const authorData = article.storytellers as any

  // Generate SEO tags including JSON-LD
  const seoTags = generateStoryMetaTags({
    id: article.id,
    title: article.title,
    meta_title: article.meta_title,
    meta_description: article.meta_description,
    summary: article.excerpt || article.subtitle,
    content: article.content,
    article_type: article.article_type,
    slug: article.slug,
    featured_image_url: article.featured_image_url,
    author_name: article.author_name,
    published_at: article.published_at,
    updated_at: article.updated_at,
    tags: article.tags,
    themes: article.themes,
    storyteller_name: authorData?.display_name
  })

  return (
    <div className="min-h-screen bg-stone-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoTags.jsonLd) }}
      />

      <Header />
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="text-xs uppercase tracking-[0.3em] text-stone-500">
            <Link href="/" className="hover:text-stone-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/articles" className="hover:text-stone-700">Articles</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-700">{article.title}</span>
          </nav>
          <Link
            href="/articles"
            className="mt-3 inline-flex items-center text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Type and visibility badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className={typeConfig.color}>
              {typeConfig.label}
            </Badge>
            {article.primary_project && (
              <Badge variant="outline">
                {article.primary_project.replace('-', ' ')}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-stone-600 mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-6">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                <User className="h-4 w-4 text-stone-500" />
              </div>
              <span className="font-medium text-stone-700">
                {article.author_name || authorData?.display_name || 'Staff'}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.published_at)}
            </div>

            {/* Reading time */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </div>

            {/* Views */}
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {article.views_count?.toLocaleString() || 0} views
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.featured_image_url}
              alt={article.featured_image_alt || article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-stone prose-lg max-w-none mb-12">
          {article.content ? (
            /<\/?[a-z][\s\S]*>/i.test(article.content) ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: rewriteRelativeImages(
                    article.content,
                    article.source_url || null
                  )
                }}
              />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h2 className="text-3xl font-semibold text-stone-900 mt-10 mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h3 className="text-2xl font-semibold text-stone-900 mt-8 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h4 className="text-xl font-semibold text-stone-900 mt-6 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-base text-stone-700 leading-relaxed mb-5" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-emerald-700 font-semibold hover:underline" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside space-y-2 mb-5 text-base" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-5 text-base" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-stone-300 pl-5 py-3 my-6 italic text-stone-600" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img
                      className="my-6 rounded-lg border border-stone-200"
                      {...props}
                      src={resolveAssetUrl(props.src as string, article.source_url || null) || undefined}
                    />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            )
          ) : (
            <p>No content available.</p>
          )}
        </div>

        {/* Author Bio */}
        {authorData && (authorData.bio || authorData.display_name) && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 mb-1">Written by</p>
                  <p className="font-bold text-stone-900 text-lg">
                    {article.author_name || authorData.display_name}
                  </p>
                  {authorData.bio && (
                    <p className="text-stone-600 mt-2">{authorData.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 pt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              {article.likes_count || 0}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Themes */}
          {article.themes && article.themes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Themes:</span>
              {article.themes.map((theme: string) => (
                <Badge key={theme} variant="outline" className="bg-sage-50 border-sage-200">
                  {theme}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  )
}
