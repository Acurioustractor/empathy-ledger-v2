/**
 * Cache Manager
 * Handles caching strategies for improved performance
 */

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum cache size
}

class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>
  private maxSize: number

  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    // Check if expired
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Set item in cache
   */
  set(key: string, data: any, options: CacheOptions = {}): void {
    const ttl = options.ttl || 5 * 60 * 1000 // Default 5 minutes

    // Enforce max size by removing oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Invalidate specific key or pattern
   */
  invalidate(keyOrPattern: string): void {
    if (keyOrPattern.includes('*')) {
      // Pattern matching
      const pattern = keyOrPattern.replace('*', '.*')
      const regex = new RegExp(pattern)

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      // Exact match
      this.cache.delete(keyOrPattern)
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would track in production
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager(200)

/**
 * Query cache wrapper for Supabase queries
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Check cache first
  const cached = cacheManager.get<T>(key)
  if (cached) {
    return cached
  }

  // Execute query
  const result = await queryFn()

  // Store in cache
  cacheManager.set(key, result, options)

  return result
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  story: (id: string) => `story:${id}`,
  stories: (orgId: string, filters?: any) => `stories:${orgId}:${JSON.stringify(filters)}`,
  storyteller: (id: string) => `storyteller:${id}`,
  storytellers: (orgId: string) => `storytellers:${orgId}`,
  themes: (orgId: string) => `themes:${orgId}`,
  analytics: (orgId: string, type: string, range: string) => `analytics:${orgId}:${type}:${range}`,
  search: (query: string, filters?: any) => `search:${query}:${JSON.stringify(filters)}`
}
