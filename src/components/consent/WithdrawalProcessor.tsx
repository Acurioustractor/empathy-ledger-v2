'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { XCircle, Calendar, FileText, RotateCcw } from 'lucide-react'

interface WithdrawnConsent {
  id: string
  type: string
  content_title?: string
  purpose: string
  withdrawn_at: string
  reason?: string
  can_restore: boolean
}

interface WithdrawalProcessorProps {
  storytellerId?: string
  organizationId?: string
  onRestoreCompleted: () => void
}

export function WithdrawalProcessor({
  storytellerId,
  organizationId,
  onRestoreCompleted
}: WithdrawalProcessorProps) {
  const [withdrawn, setWithdrawn] = useState<WithdrawnConsent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawn = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ status: 'withdrawn' })
        if (storytellerId) params.set('storyteller_id', storytellerId)
        if (organizationId) params.set('organization_id', organizationId)

        const response = await fetch(`/api/consent/all?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setWithdrawn(data.consents || [])
        }
      } catch (error) {
        console.error('Failed to fetch withdrawn consents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawn()
  }, [storytellerId, organizationId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ember-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading withdrawn consents...</p>
        </CardContent>
      </Card>
    )
  }

  if (withdrawn.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <XCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No withdrawn consents</p>
          <p className="text-sm mt-1">You haven't withdrawn any consents</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {withdrawn.map((consent) => (
        <Card key={consent.id} className="border-ember-200 bg-ember-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize border-ember-600 text-ember-600">
                    <FileText className="h-3 w-3 mr-1" />
                    {consent.type}
                  </Badge>
                  <Badge variant="outline" className="border-ember-600 text-ember-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    Withdrawn
                  </Badge>
                </div>
                {consent.content_title && (
                  <h3 className="font-semibold mb-1">{consent.content_title}</h3>
                )}
                <p className="text-sm text-muted-foreground mb-2">{consent.purpose}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>Withdrawn: {new Date(consent.withdrawn_at).toLocaleDateString()}</span>
                </div>
                {consent.reason && (
                  <div className="mt-2 p-2 bg-white rounded border border-ember-200">
                    <p className="text-xs text-muted-foreground">Reason: {consent.reason}</p>
                  </div>
                )}
              </div>
              {consent.can_restore && (
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
