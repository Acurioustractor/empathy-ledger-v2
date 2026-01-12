/**
 * Webflow API Types
 * Based on Webflow API v2 documentation
 * https://developers.webflow.com/v2/reference/collections/items
 */

export interface WebflowCollectionItem {
  id: string
  cmsLocaleId: string
  lastPublished: string | null
  lastUpdated: string
  createdOn: string
  isArchived: boolean
  isDraft: boolean
  fieldData: WebflowFieldData
}

export interface WebflowFieldData {
  name: string  // Blog post title
  slug: string  // URL slug
  [key: string]: any  // Dynamic fields based on collection structure
  // Common blog fields:
  // 'post-body'?: string        // Main content (HTML)
  // 'post-summary'?: string     // Excerpt/summary
  // 'main-image'?: WebflowImage // Featured image
  // 'thumbnail-image'?: WebflowImage
  // 'author'?: string
  // 'category'?: string
  // 'tags'?: string[]
}

export interface WebflowImage {
  fileId: string
  url: string
  alt?: string
}

export interface WebflowCollectionResponse {
  items: WebflowCollectionItem[]
  pagination?: {
    limit: number
    offset: number
    total: number
  }
}

export interface WebflowImportRequest {
  webflowCollectionId: string
  webflowApiKey: string
  organizationId: string
  authorStoryellerId?: string
  defaultVisibility?: 'public' | 'community' | 'private'
  importOptions?: WebflowImportOptions
}

export interface WebflowImportOptions {
  preserveSlug?: boolean         // Keep original URL slug
  importImages?: boolean          // Download + upload images to media_assets
  convertToMarkdown?: boolean     // Convert Webflow HTML to Markdown
  tagPrefix?: string              // Add prefix to imported tags (e.g., 'webflow-')
  batchSize?: number              // Number of items to process at once
  skipDrafts?: boolean            // Skip draft posts
  fieldMapping?: WebflowFieldMapping  // Custom field name mapping
}

export interface WebflowFieldMapping {
  titleField?: string            // Default: 'name'
  slugField?: string             // Default: 'slug'
  contentField?: string          // Default: 'post-body'
  excerptField?: string          // Default: 'post-summary'
  featuredImageField?: string    // Default: 'main-image'
  authorField?: string           // Default: 'author'
  categoryField?: string         // Default: 'category'
  tagsField?: string             // Default: 'tags'
  publishedDateField?: string    // Default: 'createdOn'
}

export interface WebflowImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: WebflowImportError[]
  articles: Array<{
    id: string
    title: string
    slug: string
    source_id: string
  }>
}

export interface WebflowImportError {
  itemId: string
  itemName: string
  error: string
  details?: string
}

export interface WebflowApiError {
  code: string
  message: string
  details?: any
}
