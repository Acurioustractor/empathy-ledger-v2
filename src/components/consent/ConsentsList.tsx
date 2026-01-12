'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Camera,
  Bot,
  Share2,
  Search,
  Calendar,
  User,
  Eye
} from 'lucide-react'
import { RenewalWorkflow } from './RenewalWorkflow'
import { WithdrawalDialog } from './WithdrawalDialog'

interface Consent {
  id: string
  type: 'story' | 'photo' | 'ai' | 'sharing'
  status: 'active' | 'withdrawn' | 'expired' | 'pending'
  granted_at: string
  expires_at?: string
  withdrawn_at?: string
  storyteller_id: string
  storyteller_name: string
  content_id?: string
  content_title?: string
  purpose: string
  can_revoke: boolean
  includes_family?: boolean
  family_members?: string[]
}

interface ConsentsListProps {
  storytellerId?: string
  organizationId?: string
  adminView?: boolean
  onConsentUpdated: () => void
}

export function ConsentsList({
  storytellerId,
  organizationId,
  adminView,
  onConsentUpdated
}: ConsentsListProps) {
  const [consents, setConsents] = useState<Consent[]>([])
  const [filteredConsents, setFilteredConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false)
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)

  const fetchConsents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (storytellerId) params.set('storyteller_id', storytellerId)
      if (organizationId) params.set('organization_id', organizationId)

      const response = await fetch(`/api/consent/all?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setConsents(data.consents || [])
        setFilteredConsents(data.consents || [])
      }
    } catch (error) {
      console.error('Failed to fetch consents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsents()
  }, [storytellerId, organizationId])

  // Filter consents
  useEffect(() => {
    const filtered = consents.filter(consent => {
      const matchesSearch = searchTerm === '' ||
        consent.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.storyteller_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'all' || consent.type === typeFilter
      const matchesStatus = statusFilter === 'all' || consent.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })

    // Sort by granted date (newest first)
    filtered.sort((a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime())

    setFilteredConsents(filtered)
  }, [consents, searchTerm, typeFilter, statusFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <FileText className="h-4 w-4" />
      case 'photo': return <Camera className="h-4 w-4" />
      case 'ai': return <Bot className="h-4 w-4" />
      case 'sharing': return <Share2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (consent: Consent) => {
    if (consent.status === 'withdrawn') {
      return (
        <Badge variant="outline" className="border-ember-600 text-ember-600">
          <XCircle className="h-3 w-3 mr-1" />
          Withdrawn
        </Badge>
      )
    }

    if (consent.status === 'expired') {
      return (
        <Badge variant="outline" className="border-amber-600 text-amber-600">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    }

    // Check if expiring soon (within 30 days)
    if (consent.expires_at) {
      const daysUntilExpiry = Math.floor(
        (new Date(consent.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        return (
          <Badge variant="outline" className="border-clay-600 text-clay-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expires in {daysUntilExpiry}d
          </Badge>
        )
      }
    }

    return (
      <Badge variant="outline" className="border-sage-600 text-sage-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleRenew = (consent: Consent) => {
    setSelectedConsent(consent)
    setRenewalDialogOpen(true)
  }

  const handleWithdraw = (consent: Consent) => {
    setSelectedConsent(consent)
    setWithdrawalDialogOpen(true)
  }

  const handleRenewalCompleted = () => {
    setRenewalDialogOpen(false)
    setSelectedConsent(null)
    fetchConsents()
    onConsentUpdated()
  }

  const handleWithdrawalCompleted = () => {
    setWithdrawalDialogOpen(false)
    setSelectedConsent(null)
    fetchConsents()
    onConsentUpdated()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading consents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Consents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Content, purpose, or storyteller..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="story">Story Consents</SelectItem>
                    <SelectItem value="photo">Photo/Video</SelectItem>
                    <SelectItem value="ai">AI Processing</SelectItem>
                    <SelectItem value="sharing">External Sharing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consents List */}
        <div className="space-y-3">
          {filteredConsents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No consents found</p>
                <p className="text-sm mt-1">
                  {consents.length === 0
                    ? 'No consent records exist yet'
                    : 'No consents match your filters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConsents.map((consent) => (
              <Card key={consent.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(consent.type)}
                          {consent.type}
                        </Badge>
                        {getStatusBadge(consent)}
                        {consent.includes_family && (
                          <Badge variant="outline" className="border-clay-600 text-clay-600">
                            <User className="h-3 w-3 mr-1" />
                            Multi-party
                          </Badge>
                        )}
                      </div>

                      {/* Content Title */}
                      {consent.content_title && (
                        <h3 className="font-semibold mb-1">{consent.content_title}</h3>
                      )}

                      {/* Purpose */}
                      <p className="text-sm text-muted-foreground mb-2">{consent.purpose}</p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {adminView && (
                          <>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{consent.storyteller_name}</span>
                            </div>
                            <span>•</span>
                          </>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Granted {formatDate(consent.granted_at)}</span>
                        </div>
                        {consent.expires_at && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Expires {formatDate(consent.expires_at)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Family Members */}
                      {consent.includes_family && consent.family_members && consent.family_members.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Includes: {consent.family_members.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {consent.status === 'active' && consent.can_revoke && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(consent)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      )}
                      {(consent.status === 'expired' || (consent.expires_at && new Date(consent.expires_at) < new Date())) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRenew(consent)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedConsent && (
        <>
          <RenewalWorkflow
            open={renewalDialogOpen}
            onOpenChange={setRenewalDialogOpen}
            consent={selectedConsent}
            onRenewalCompleted={handleRenewalCompleted}
          />
          <WithdrawalDialog
            open={withdrawalDialogOpen}
            onOpenChange={setWithdrawalDialogOpen}
            consent={selectedConsent}
            onWithdrawalCompleted={handleWithdrawalCompleted}
          />
        </>
      )}
    </>
  )
}
