import useSWR from 'swr'
import { useCallback, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface VaultStory {
  id: string
  title: string
  excerpt?: string
  status: string
  privacyLevel: string
  hasConsent: boolean
  consentVerified: boolean
  isArchived: boolean
  embedsEnabled: boolean
  sharingEnabled: boolean
  createdAt: string
  updatedAt: string
  // Distribution stats
  activeEmbeds: number
  activeDistributions: number
  totalViews: number
  // Cultural info
  culturalContext?: any
  elderApprovalStatus?: string
}

export interface VaultSummary {
  totalStories: number
  activeStories: number
  archivedStories: number
  totalEmbeds: number
  totalDistributions: number
  totalViews: number
  storiesWithConsent: number
  storiesWithoutConsent: number
}

interface UseStoryVaultOptions {
  includeArchived?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'distributions'
  sortOrder?: 'asc' | 'desc'
}

export function useStoryVault(
  storytellerId: string,
  options: UseStoryVaultOptions = {}
) {
  const { includeArchived = false, sortBy = 'updatedAt', sortOrder = 'desc' } = options
  const [selectedStories, setSelectedStories] = useState<string[]>([])

  const params = new URLSearchParams({
    includeArchived: includeArchived.toString(),
    sortBy,
    sortOrder
  })

  const { data, error, mutate, isLoading } = useSWR(
    storytellerId ? `/api/vault/stories?${params}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  )

  const toggleStorySelection = useCallback((storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    )
  }, [])

  const selectAll = useCallback(() => {
    if (data?.stories) {
      setSelectedStories(data.stories.map((s: VaultStory) => s.id))
    }
  }, [data?.stories])

  const clearSelection = useCallback(() => {
    setSelectedStories([])
  }, [])

  return {
    stories: (data?.stories || []) as VaultStory[],
    summary: data?.summary as VaultSummary | undefined,
    isLoading,
    error,
    mutate,
    // Selection
    selectedStories,
    toggleStorySelection,
    selectAll,
    clearSelection,
    hasSelection: selectedStories.length > 0
  }
}

/**
 * Hook for a single story's vault details
 */
export function useStoryVaultDetails(storyId: string) {
  const { data: distributionsData, error: distributionsError, isLoading: distributionsLoading } = useSWR(
    storyId ? `/api/stories/${storyId}/distributions` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const { data: auditData, error: auditError, isLoading: auditLoading } = useSWR(
    storyId ? `/api/stories/${storyId}/audit` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    distributions: distributionsData,
    auditHistory: auditData?.logs || [],
    isLoading: distributionsLoading || auditLoading,
    error: distributionsError || auditError
  }
}

/**
 * Hook for vault actions
 */
export function useVaultActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const archiveStory = useCallback(async (storyId: string, reason?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stories/${storyId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to archive story')
      }
      return await res.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const restoreStory = useCallback(async (storyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stories/${storyId}/archive`, {
        method: 'PUT'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to restore story')
      }
      return await res.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleEmbeds = useCallback(async (storyId: string, enabled: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds_enabled: enabled })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update story')
      }
      return await res.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleSharing = useCallback(async (storyId: string, enabled: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharing_enabled: enabled })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update story')
      }
      return await res.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    archiveStory,
    restoreStory,
    toggleEmbeds,
    toggleSharing,
    isLoading,
    error
  }
}
