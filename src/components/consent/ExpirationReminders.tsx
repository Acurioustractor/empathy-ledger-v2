'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

interface ExpiringConsent {
  id: string
  type: string
  content_title?: string
  purpose: string
  expires_at: string
  days_until_expiry: number
}

interface ExpirationRemindersProps {
  storytellerId?: string
  organizationId?: string
  onRenewalCompleted: () => void
}

export function ExpirationReminders({
  storytellerId,
  organizationId,
  onRenewalCompleted
}: ExpirationRemindersProps) {
  const [expiring, setExpiring] = useState<ExpiringConsent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpiring = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (storytellerId) params.set('storyteller_id', storytellerId)
        if (organizationId) params.set('organization_id', organizationId)

        const response = await fetch(`/api/consent/expiring?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setExpiring(data.expiring || [])
        }
      } catch (error) {
        console.error('Failed to fetch expiring consents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpiring()
  }, [storytellerId, organizationId])

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'border-ember-600 text-ember-600 bg-ember-50'
    if (days <= 14) return 'border-amber-600 text-amber-600 bg-amber-50'
    return 'border-clay-600 text-clay-600 bg-clay-50'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clock-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading expiring consents...</p>
        </CardContent>
      </Card>
    )
  }

  if (expiring.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20 text-sage-500" />
          <p className="text-lg font-medium">No expiring consents</p>
          <p className="text-sm mt-1">All your consents are current or don't have expiry dates</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {expiring.map((consent) => (
        <Card key={consent.id} className={getUrgencyColor(consent.days_until_expiry)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">{consent.type}</Badge>
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    {consent.days_until_expiry} days left
                  </Badge>
                </div>
                {consent.content_title && (
                  <h3 className="font-semibold mb-1">{consent.content_title}</h3>
                )}
                <p className="text-sm text-muted-foreground mb-2">{consent.purpose}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Expires: {new Date(consent.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button size="sm" onClick={() => {/* Open renewal workflow */}}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Renew Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
