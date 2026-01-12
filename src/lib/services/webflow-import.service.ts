/**
 * Webflow Import Service
 * Handles importing blog posts from Webflow CMS into Empathy Ledger articles table
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import path from 'path'
import os from 'os'
import { promisify } from 'util'
import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import type {
  WebflowCollectionResponse,
  WebflowCollectionItem,
  WebflowImportRequest,
  WebflowImportResult,
  WebflowImportError,
  WebflowImportOptions,
  WebflowFieldMapping
} from '@/types/webflow'

export class WebflowImportService {
  private supabase
  private webflowApiKey: string
  private organizationId: string
  private authorStoryellerId?: string
  private options: WebflowImportOptions
  private execFileAsync = promisify(execFile)

  constructor(
    supabaseClient: ReturnType<typeof createClient>,
    request: WebflowImportRequest
  ) {
    this.supabase = supabaseClient
    this.webflowApiKey = request.webflowApiKey
    this.organizationId = request.organizationId
    this.authorStoryellerId = request.authorStoryellerId
    this.options = {
      preserveSlug: true,
      importImages: false,  // Default to false (can be expensive)
      convertToMarkdown: false,
      skipDrafts: true,
      batchSize: 100,
      ...request.importOptions
    }
  }

  /**
   * Main import function
   */
  async importCollection(collectionId: string): Promise<WebflowImportResult> {
    const result: WebflowImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      articles: []
    }

    try {
      // Fetch items from Webflow
      const items = await this.fetchWebflowItems(collectionId)

      // Process each item
      for (const item of items) {
        // Skip drafts if configured
        if (this.options.skipDrafts && item.isDraft && !item.lastPublished) {
          result.skipped++
          continue
        }

        try {
          const article = await this.importSingleItem(item)

          if (article) {
            result.imported++
            result.articles.push({
              id: article.id,
              title: article.title,
              slug: article.slug,
              source_id: item.id
            })
          } else {
            result.skipped++
          }
        } catch (error) {
          result.errors.push({
            itemId: item.id,
            itemName: item.fieldData.name || 'Unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined
          })
        }
      }

      result.success = result.errors.length === 0

    } catch (error) {
      result.success = false
      result.errors.push({
        itemId: 'collection',
        itemName: collectionId,
        error: error instanceof Error ? error.message : 'Failed to fetch collection'
      })
    }

    return result
  }

  /**
   * Fetch items from Webflow API
   */
  private async fetchWebflowItems(collectionId: string): Promise<WebflowCollectionItem[]> {
    const allItems: WebflowCollectionItem[] = []
    let offset = 0
    const limit = this.options.batchSize || 100
    let hasMore = true

    while (hasMore) {
      const url = `https://api.webflow.com/v2/collections/${collectionId}/items?offset=${offset}&limit=${limit}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.webflowApiKey}`,
          'accept-version': '1.0.0'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`Webflow API error: ${error.message || response.statusText}`)
      }

      const data: WebflowCollectionResponse = await response.json()
      allItems.push(...data.items)

      // Check if there are more items
      if (data.pagination) {
        hasMore = allItems.length < data.pagination.total
        offset += limit
      } else {
        hasMore = false
      }
    }

    return allItems
  }

  /**
   * Import a single Webflow item into articles table
   */
  private async importSingleItem(item: WebflowCollectionItem): Promise<any | null> {
    // Check if already imported (prevent duplicates) - update if exists
    const { data: existingBySource } = await this.supabase
      .from('articles')
      .select('id')
      .eq('source_platform', 'webflow')
      .eq('source_id', item.id)
      .single()

    // Get field mapping
    const mapping = this.options.fieldMapping || this.getDefaultFieldMapping()

    // Extract data from Webflow item
    const title = this.getFieldValue(item.fieldData, mapping.titleField!) as string
    const rawSlug = this.getFieldValue(item.fieldData, mapping.slugField!) as string || title
    const slugCandidate = this.options.preserveSlug && rawSlug
      ? rawSlug.trim()
      : this.slugify(rawSlug)
    const content = this.getFieldValue(item.fieldData, mapping.contentField!) as string
    const excerpt = this.getFieldValue(item.fieldData, mapping.excerptField!) as string
    const originalAuthor = this.getFieldValue(item.fieldData, mapping.authorField!) as string
    const category = this.getFieldValue(item.fieldData, mapping.categoryField!) as string
    const tags = this.getFieldValue(item.fieldData, mapping.tagsField!) as string[]
    const featuredImage = this.getFieldValue(item.fieldData, mapping.featuredImageField!) as { url?: string; alt?: string } | null

    let slug = slugCandidate
    if (!this.options.preserveSlug) {
      slug = await this.generateUniqueSlug(slugCandidate)
    }

    let processedContent = content || ''
    let featuredImageUrl = featuredImage?.url || null

    if (this.options.importImages) {
      const rehosted = await this.rehostImagesInContent(processedContent, slug)
      processedContent = rehosted.content
      if (featuredImageUrl) {
        featuredImageUrl = await this.rehostImage(featuredImageUrl, slug)
      }
    }

    const { data: existingBySlug } = await this.supabase
      .from('articles')
      .select('id, status, visibility, published_at')
      .eq('slug', slug)
      .single()

    const articleType = this.normalizeArticleType(category)

    // Prepare article data
    const articleData = {
      // Required fields
      title,
      slug,
      content: processedContent || '',

      // Source tracking
      source_platform: 'webflow',
      source_id: item.id,
      source_url: item.fieldData.slug ? `https://yoursite.webflow.io/blog/${item.fieldData.slug}` : null,
      imported_at: new Date().toISOString(),
      import_metadata: {
        original_author: originalAuthor,
        original_publish_date: item.createdOn,
        original_last_updated: item.lastUpdated,
        original_slug: item.fieldData.slug,
        webflow_collection_item_id: item.id,
        webflow_cms_locale_id: item.cmsLocaleId,
        original_category: category,
        original_tags: tags,
        was_published: !item.isDraft && item.lastPublished !== null,
        featuredImageUrl: featuredImageUrl,
        featuredImageAlt: featuredImage?.alt || null
      },

      // Metadata
      excerpt: this.cleanText(excerpt) || this.generateExcerpt(content),
      tags: this.options.tagPrefix
        ? tags?.map(tag => `${this.options.tagPrefix}${tag}`) || []
        : tags || [],

      // Author (if provided)
      author_storyteller_id: this.authorStoryellerId,
      author_type: this.authorStoryellerId ? 'storyteller' : 'anonymous',
      author_name: originalAuthor || 'Imported',

      // Organization
      organization_id: this.organizationId,

      // Publishing status
      status: 'draft',  // Always import as draft for review
      article_type: articleType,
      visibility: this.options.preserveSlug ? 'public' : 'private',

      // SEO
      meta_title: title,
      meta_description: this.cleanText(excerpt) || this.generateExcerpt(content),

      // Timestamps
      created_at: item.createdOn,
      updated_at: item.lastUpdated
    }

    if (existingBySource) {
      const { error: updateError } = await this.supabase
        .from('articles')
        .update({
          title: articleData.title,
          subtitle: articleData.subtitle,
          content: articleData.content,
          excerpt: articleData.excerpt,
          author_storyteller_id: articleData.author_storyteller_id,
          author_type: articleData.author_type,
          author_name: articleData.author_name,
          author_bio: articleData.author_bio,
          article_type: articleData.article_type,
          tags: articleData.tags,
          meta_title: articleData.meta_title,
          meta_description: articleData.meta_description,
          source_platform: articleData.source_platform,
          source_id: articleData.source_id,
          source_url: articleData.source_url,
          imported_at: articleData.imported_at,
          import_metadata: articleData.import_metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBySource.id)

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`)
      }

      return { id: existingBySource.id, title, slug }
    }

    if (existingBySlug) {
      const { error: updateError } = await this.supabase
        .from('articles')
        .update({
          title: articleData.title,
          subtitle: articleData.subtitle,
          content: articleData.content,
          excerpt: articleData.excerpt,
          author_storyteller_id: articleData.author_storyteller_id,
          author_type: articleData.author_type,
          author_name: articleData.author_name,
          author_bio: articleData.author_bio,
          article_type: articleData.article_type,
          tags: articleData.tags,
          meta_title: articleData.meta_title,
          meta_description: articleData.meta_description,
          source_platform: articleData.source_platform,
          source_id: articleData.source_id,
          source_url: articleData.source_url,
          imported_at: articleData.imported_at,
          import_metadata: articleData.import_metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBySlug.id)

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`)
      }

      return { id: existingBySlug.id, title, slug }
    }

    // Insert into database (retry without organization_id if schema is missing the column)
    let { data: article, error } = await this.supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single()

    if (error && error.message.includes('organization_id')) {
      const { organization_id: _omit, ...fallbackData } = articleData
      ;({ data: article, error } = await this.supabase
        .from('articles')
        .insert([fallbackData])
        .select()
        .single())
    }

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return article
  }

  /**
   * Get field value with fallback
   */
  private getFieldValue(fieldData: any, fieldName: string): any {
    return fieldData[fieldName]
  }

  /**
   * Get default field mapping for Webflow
   */
  private getDefaultFieldMapping(): Required<WebflowFieldMapping> {
    return {
      titleField: 'name',
      slugField: 'slug',
      contentField: 'post-body',
      excerptField: 'post-summary',
      featuredImageField: 'main-image',
      authorField: 'author',
      categoryField: 'category',
      tagsField: 'tags',
      publishedDateField: 'createdOn'
    }
  }

  /**
   * Generate unique slug (check for conflicts)
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = this.slugify(baseSlug)
    let counter = 1
    let isUnique = false

    while (!isUnique) {
      const { data: existing } = await this.supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        slug = `${this.slugify(baseSlug)}-${counter}`
        counter++
      }
    }

    return slug
  }

  /**
   * Convert string to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')  // Remove non-word chars
      .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
  }

  /**
   * Generate excerpt from content (first 200 chars)
   */
  private generateExcerpt(content: string): string {
    if (!content) return ''

    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '')

    // Truncate to 200 chars
    if (text.length <= 200) return text

    return text.substring(0, 197) + '...'
  }

  private cleanText(value?: string | null): string {
    if (!value) return ''
    return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  private normalizeArticleType(value?: string | null): string {
    const allowed = new Set([
      'story_feature',
      'program_spotlight',
      'research_summary',
      'community_news',
      'editorial',
      'impact_report',
      'project_update',
      'tutorial'
    ])

    const normalized = (value || '').toLowerCase().trim().replace(/\s+/g, '_')
    if (allowed.has(normalized)) return normalized
    return 'editorial'
  }

  private extractImageUrls(content: string): string[] {
    if (!content) return []
    const urls = new Set<string>()
    const htmlRegex = /<img[^>]+src=["']([^"']+)["']/gi
    const dataSrcRegex = /data-src=["']([^"']+)["']/gi
    let match

    while ((match = htmlRegex.exec(content)) !== null) {
      if (match[1]) urls.add(match[1])
    }
    while ((match = dataSrcRegex.exec(content)) !== null) {
      if (match[1]) urls.add(match[1])
    }

    return Array.from(urls)
  }

  private normalizeUrl(url: string): string {
    if (url.startsWith('//')) return `https:${url}`
    return url
  }

  private getExtension(url: string, contentType?: string | null): string {
    if (contentType) {
      const mapping: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/svg+xml': '.svg',
        'image/avif': '.avif'
      }
      if (mapping[contentType]) return mapping[contentType]
    }
    try {
      const parsed = new URL(url)
      const ext = path.extname(parsed.pathname)
      if (ext) return ext
    } catch {
      const ext = path.extname(url)
      if (ext) return ext
    }
    return '.jpg'
  }

  private async convertAvifToJpeg(buffer: Buffer): Promise<Buffer> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'act-webflow-'))
    const inputPath = path.join(tmpDir, 'source.avif')
    const outputPath = path.join(tmpDir, 'converted.jpg')
    await fs.writeFile(inputPath, buffer)
    await this.execFileAsync('sips', ['-s', 'format', 'jpeg', inputPath, '--out', outputPath])
    return await fs.readFile(outputPath)
  }

  private async rehostImage(url: string, slug: string): Promise<string> {
    if (!url) return url
    const normalizedUrl = this.normalizeUrl(url)
    if (normalizedUrl.includes('/storage/v1/object/public/')) return normalizedUrl
    if (normalizedUrl.startsWith('data:')) return normalizedUrl

    const response = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'ACT Empathy Ledger Webflow Import' }
    })
    if (!response.ok) {
      throw new Error(`Failed to download image: ${normalizedUrl} (${response.status})`)
    }
    let buffer = Buffer.from(await response.arrayBuffer())
    let contentType = response.headers.get('content-type')
    if (contentType?.includes('image/avif')) {
      buffer = await this.convertAvifToJpeg(buffer)
      contentType = 'image/jpeg'
    }
    const hash = createHash('sha1').update(normalizedUrl).digest('hex').slice(0, 16)
    const ext = this.getExtension(normalizedUrl, contentType)
    const storagePath = `photos/articles/${slug}/${hash}${ext}`

    const { error } = await this.supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: contentType || undefined,
        upsert: false
      })

    if (error && !String(error.message).includes('The resource already exists')) {
      throw new Error(error.message)
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`
  }

  private async rehostImagesInContent(content: string, slug: string): Promise<{ content: string }> {
    if (!content) return { content }
    const urls = this.extractImageUrls(content)
    if (urls.length === 0) return { content }

    const replacements = new Map<string, string>()
    for (const rawUrl of urls) {
      const normalizedUrl = this.normalizeUrl(rawUrl)
      if (!normalizedUrl || normalizedUrl.startsWith('data:')) continue
      if (normalizedUrl.includes('/storage/v1/object/public/')) continue
      try {
        const hosted = await this.rehostImage(normalizedUrl, slug)
        replacements.set(rawUrl, hosted)
      } catch (error) {
        console.error('Failed to rehost inline image:', error)
      }
    }

    let updated = content
    for (const [original, hosted] of replacements.entries()) {
      updated = updated.split(original).join(hosted)
    }
    return { content: updated }
  }
}
