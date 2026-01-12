/**
 * Performance Utilities: Debounce and Throttle
 * Optimize frequent function calls
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * Useful for: search inputs, resize handlers, form validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function - limits execution to once per specified time period
 * Useful for: scroll handlers, mouse move, API calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * React hook for debounced value
 */
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * React hook for throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value)
    }, limit)

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Debounced search hook
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching
  }
}

/**
 * Memoization with TTL
 */
const memoCache = new Map<string, { value: any; timestamp: number; ttl: number }>()

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000 // 1 minute default
): T {
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    const cached = memoCache.get(key)

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.value
    }

    const result = func(...args)
    memoCache.set(key, { value: result, timestamp: Date.now(), ttl })

    return result
  }) as T
}

/**
 * Request batching - combine multiple requests into one
 */
export class RequestBatcher<T, R> {
  private queue: Array<{ args: T; resolve: (value: R) => void; reject: (error: any) => void }> = []
  private batchFn: (items: T[]) => Promise<R[]>
  private delay: number
  private timeout: NodeJS.Timeout | null = null

  constructor(batchFn: (items: T[]) => Promise<R[]>, delay: number = 50) {
    this.batchFn = batchFn
    this.delay = delay
  }

  add(args: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ args, resolve, reject })

      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => this.flush(), this.delay)
    })
  }

  private async flush() {
    if (this.queue.length === 0) return

    const batch = [...this.queue]
    this.queue = []

    try {
      const results = await this.batchFn(batch.map(item => item.args))

      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(item => {
        item.reject(error)
      })
    }
  }
}
