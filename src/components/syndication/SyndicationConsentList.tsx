'use client'

import { useState, useEffect } from 'react'
import { ConsentStatusCard } from './ConsentStatusCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Share2, ShieldCheck, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SyndicationConsent {
  id: string
  story_id: string
  story: {
    title: string
  }
  site_id: string
  site: {
    name: string
    slug: string
    logo_url?: string
    allowed_domains: string[]
  }
  status: 'approved' | 'pending' | 'revoked' | 'expired'
  cultural_permission_level: 'public' | 'community' | 'restricted' | 'sacred'
  created_at: string
  embed_tokens?: Array<{
    usage_count: number
    last_used_at: string | null
  }>
}

interface SyndicationConsentListProps {
  storytellerId?: string // If not provided, uses current user
}

export function SyndicationConsentList({ storytellerId }: SyndicationConsentListProps) {
  const [consents, setConsents] = useState<SyndicationConsent[]>([])
  const [filteredConsents, setFilteredConsents] = useState<SyndicationConsent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const { toast } = useToast()

  // Fetch consents
  const fetchConsents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/syndication/consents', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch consents')
      }

      const data = await response.json()
      setConsents(data.consents || [])
      setFilteredConsents(data.consents || [])
    } catch (error) {
      console.error('Error fetching consents:', error)
      toast({
        title: 'Failed to load consents',
        description: 'Please try refreshing the page',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConsents()
  }, [storytellerId])

  // Apply filters
  useEffect(() => {
    let filtered = [...consents]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Site filter
    if (siteFilter !== 'all') {
      filtered = filtered.filter(c => c.site_id === siteFilter)
    }

    // Sort by created_at desc
    filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setFilteredConsents(filtered)
  }, [consents, statusFilter, siteFilter])

  // Get unique sites for filter
  const uniqueSites = Array.from(
    new Map(consents.map(c => [c.site_id, c.site])).values()
  )

  // Handle consent revoked
  const handleConsentRevoked = () => {
    fetchConsents() // Refresh list
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Empty state - no consents at all
  if (consents.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center">
          <Share2 className="h-8 w-8 text-sage-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No syndication consents yet</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            Your stories are safe with you. When you're ready to share with
            external platforms like JusticeHub, you'll see them here.
          </p>
        </div>
        <Button onClick={() => {
          // TODO: Navigate to create consent page
          window.location.href = '/storytellers/me/stories'
        }}>
          View Your Stories
        </Button>
      </div>
    )
  }

  // All consents revoked
  if (filteredConsents.length === 0 && statusFilter === 'all' && siteFilter === 'all') {
    const allRevoked = consents.every(c => c.status === 'revoked')
    if (allRevoked) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-sky-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">You're in control</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              All your stories have been removed from external platforms.
              You can re-share whenever you're ready.
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="approved">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              {uniqueSites.map(site => (
                <SelectItem key={site.slug} value={site.slug}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Consent count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredConsents.length} of {consents.length} consent
        {consents.length !== 1 ? 's' : ''}
      </div>

      {/* Consent cards */}
      {filteredConsents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No consents match your filters
          </p>
          <Button
            variant="link"
            onClick={() => {
              setStatusFilter('all')
              setSiteFilter('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConsents.map(consent => (
            <ConsentStatusCard
              key={consent.id}
              consentId={consent.id}
              storyId={consent.story_id}
              storyTitle={consent.story.title}
              siteName={consent.site.name}
              siteSlug={consent.site.slug}
              siteLogoUrl={consent.site.logo_url}
              siteDomains={consent.site.allowed_domains}
              status={consent.status}
              culturalPermissionLevel={consent.cultural_permission_level}
              createdAt={consent.created_at}
              viewCount={consent.embed_tokens?.[0]?.usage_count}
              lastAccessedAt={consent.embed_tokens?.[0]?.last_used_at}
              onRevoked={handleConsentRevoked}
            />
          ))}
        </div>
      )}
    </div>
  )
}
