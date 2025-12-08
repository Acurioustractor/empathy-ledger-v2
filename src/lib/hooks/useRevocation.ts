import useSWR from 'swr'
import { useCallback, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export type RevocationScope = 'all' | 'embeds' | 'distributions'

export interface RevocationPreview {
  storyTitle: string
  activeEmbeds: number
  activeDistributions: number
  totalViews: number
  webhooksConfigured: number
  estimatedActions: string[]
}

export interface RevocationResult {
  storyId: string
  embedsRevoked: number
  distributionsRevoked: number
  webhooksSent: number
  webhooksFailed: number
  storyArchived?: boolean
  completedAt: string
  durationMs: number
}

interface RevocationOptions {
  scope: RevocationScope
  reason?: string
  archiveStory?: boolean
  disableSharing?: boolean
  notifyWebhooks?: boolean
}

/**
 * Hook for managing story revocation
 */
export function useRevocation(storyId: string) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [revocationResult, setRevocationResult] = useState<RevocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get revocation preview
  const { data: previewData, error: previewError, isLoading: isLoadingPreview } = useSWR(
    storyId ? `/api/stories/${storyId}/revoke?scope=all` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  /**
   * Get preview for a specific scope
   */
  const getPreview = useCallback(async (scope: RevocationScope): Promise<RevocationPreview | null> => {
    try {
      const res = await fetch(`/api/stories/${storyId}/revoke?scope=${scope}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to get preview')
      }
      const data = await res.json()
      return data.preview
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [storyId])

  /**
   * Execute revocation
   */
  const revoke = useCallback(async (options: RevocationOptions): Promise<RevocationResult | null> => {
    setIsRevoking(true)
    setError(null)
    setRevocationResult(null)

    try {
      const res = await fetch(`/api/stories/${storyId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Revocation failed')
      }

      setRevocationResult(data.result)
      return data.result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsRevoking(false)
    }
  }, [storyId])

  /**
   * Withdraw consent (triggers cascade revocation)
   */
  const withdrawConsent = useCallback(async (): Promise<boolean> => {
    setIsRevoking(true)
    setError(null)

    try {
      const res = await fetch(`/api/stories/${storyId}/consent/withdraw`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to withdraw consent')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsRevoking(false)
    }
  }, [storyId])

  /**
   * Revoke a single embed token
   */
  const revokeEmbed = useCallback(async (tokenId: string, reason?: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({ tokenId })
      if (reason) params.append('reason', reason)

      const res = await fetch(`/api/embed/stories/${storyId}/token?${params}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to revoke embed')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [storyId])

  /**
   * Revoke a single distribution
   */
  const revokeDistribution = useCallback(async (distributionId: string, reason?: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({ distributionId })
      if (reason) params.append('reason', reason)

      const res = await fetch(`/api/stories/${storyId}/distributions?${params}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to revoke distribution')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [storyId])

  return {
    // Preview data
    preview: previewData?.preview as RevocationPreview | undefined,
    isLoadingPreview,
    previewError,
    getPreview,
    // Revocation state
    isRevoking,
    revocationResult,
    error,
    // Actions
    revoke,
    withdrawConsent,
    revokeEmbed,
    revokeDistribution
  }
}

/**
 * Hook for GDPR actions
 */
export function useGDPRActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Anonymize a story
   */
  const anonymizeStory = useCallback(async (
    storyId: string,
    options: {
      preserveContent?: boolean
      preserveAttribution?: boolean
      anonymizeMedia?: boolean
    } = {}
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/stories/${storyId}/anonymize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Anonymization failed')
      }

      return data.result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Request account deletion
   */
  const requestAccountDeletion = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'delete_account' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create deletion request')
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Export user data
   */
  const exportUserData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'export_data' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to export data')
      }

      return data.export
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    anonymizeStory,
    requestAccountDeletion,
    exportUserData,
    isLoading,
    error
  }
}
