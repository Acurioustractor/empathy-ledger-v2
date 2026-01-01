import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useDebounce } from './useDebounce'
import { FilterState } from '@/lib/stores/admin.store'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface UseStorytellersOptions {
  filters?: Partial<FilterState>
  page?: number
  limit?: number
  infinite?: boolean
}

export function useStorytellers({
  filters = {},
  page = 1,
  limit = 20,
  infinite = false
}: UseStorytellersOptions = {}) {
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search || '', 300)
  
  // Build query params
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.featured && filters.featured !== 'all' && { featured: filters.featured }),
    ...(filters.elder && filters.elder !== 'all' && { elder: filters.elder }),
    ...(filters.organisation && { organisation: filters.organisation }),
    ...(filters.location && { location: filters.location }),
    ...(filters.project && { project: filters.project }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder })
  })
  
  const url = `/api/admin/storytellers?${params}`
  
  // Regular pagination
  if (!infinite) {
    const { data, error, mutate, isLoading } = useSWR(url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true
    })
    
    return {
      storytellers: data?.storytellers || [],
      total: data?.total || 0,
      summary: data?.summary || null,
      isLoading,
      error,
      mutate
    }
  }
  
  // Infinite scroll
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.storytellers?.length) return null
    
    const infiniteParams = new URLSearchParams(params)
    infiniteParams.set('page', (pageIndex + 1).toString())
    return `/api/admin/storytellers?${infiniteParams}`
  }
  
  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      parallel: false
    }
  )
  
  const storytellers = data?.flatMap(page => page.storytellers) ?? []
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined'
  const isEmpty = data?.[0]?.storytellers?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.storytellers?.length < limit)
  
  return {
    storytellers,
    total: data?.[0]?.total || 0,
    summary: data?.[0]?.summary || null,
    isLoading,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    error,
    size,
    setSize,
    mutate,
    loadMore: () => setSize(size + 1)
  }
}

// Hook for single storyteller
export function useStoryteller(id: string) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? `/api/storytellers/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )
  
  return {
    storyteller: data?.storyteller,
    stories: data?.stories || [],
    isLoading,
    error,
    mutate
  }
}

// Hook for storyteller actions
export function useStorytellerActions() {
  const updateStoryteller = async (id: string, updates: any) => {
    const res = await fetch(`/api/admin/storytellers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    
    if (!res.ok) throw new Error('Failed to update storyteller')
    return res.json()
  }
  
  const deleteStoryteller = async (id: string) => {
    const res = await fetch(`/api/admin/storytellers/${id}`, {
      method: 'DELETE'
    })
    
    if (!res.ok) throw new Error('Failed to delete storyteller')
    return res.json()
  }
  
  const bulkUpdateStorytellers = async (ids: string[], updates: any) => {
    const res = await fetch(`/api/admin/storytellers/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, ...updates })
    })
    
    if (!res.ok) throw new Error('Failed to update storytellers')
    return res.json()
  }
  
  const bulkDeleteStorytellers = async (ids: string[]) => {
    const res = await fetch(`/api/admin/storytellers/bulk`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    })
    
    if (!res.ok) throw new Error('Failed to delete storytellers')
    return res.json()
  }
  
  return {
    updateStoryteller,
    deleteStoryteller,
    bulkUpdateStorytellers,
    bulkDeleteStorytellers
  }
}