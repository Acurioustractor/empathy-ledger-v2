'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Globe,
  Share2,
  Copy,
  CheckCircle,
  Loader2,
  ExternalLink,
  Shield,
  Clock,
  Plus,
  X,
  Code,
  RefreshCw,
} from 'lucide-react'

interface SyndicationSite {
  id: string
  slug: string
  name: string
  status: string
  allowed_domains: string[]
}

interface SyndicationConsent {
  id: string
  site_id: string
  status: string
  allow_full_resolution: boolean
  allow_download: boolean
  allow_embedding: boolean
  requires_elder_approval: boolean
  expires_at: string | null
  created_at: string
  site: {
    id: string
    slug: string
    name: string
  }
}

interface EmbedToken {
  token: string
  expiresAt: string
}

interface Props {
  galleryId: string
  galleryTitle: string
}

export default function GallerySyndication({ galleryId, galleryTitle }: Props) {
  const [loading, setLoading] = useState(true)
  const [sites, setSites] = useState<SyndicationSite[]>([])
  const [consents, setConsents] = useState<SyndicationConsent[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [selectedConsent, setSelectedConsent] = useState<SyndicationConsent | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [embedToken, setEmbedToken] = useState<EmbedToken | null>(null)
  const [copied, setCopied] = useState(false)
  const [newConsentOptions, setNewConsentOptions] = useState({
    allowFullResolution: false,
    allowDownload: false,
    allowEmbedding: true,
    requiresElderApproval: false
  })

  const fetchSites = useCallback(async () => {
    try {
      const response = await fetch('/api/syndication/sites')
      if (response.ok) {
        const data = await response.json()
        setSites((data.sites || []).filter((s: SyndicationSite) => s.status === 'active'))
      }
    } catch (error) {
      console.error('Error fetching syndication sites:', error)
    }
  }, [])

  const fetchConsents = useCallback(async () => {
    try {
      const response = await fetch(`/api/syndication/galleries?galleryId=${galleryId}`)
      if (response.ok) {
        const data = await response.json()
        setConsents(data.consents || [])
      }
    } catch (error) {
      console.error('Error fetching syndication consents:', error)
    } finally {
      setLoading(false)
    }
  }, [galleryId])

  useEffect(() => {
    fetchSites()
    fetchConsents()
  }, [fetchSites, fetchConsents])

  const handleAddSyndication = async () => {
    if (!selectedSite) return
    setIsSaving(true)

    try {
      const response = await fetch('/api/syndication/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          siteSlug: selectedSite,
          permissions: {
            allowFullResolution: newConsentOptions.allowFullResolution,
            allowDownload: newConsentOptions.allowDownload,
            allowEmbedding: newConsentOptions.allowEmbedding
          },
          requiresElderApproval: newConsentOptions.requiresElderApproval
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.embedToken) {
          setEmbedToken(data.embedToken)
          setIsEmbedDialogOpen(true)
        }
        await fetchConsents()
        setIsAddDialogOpen(false)
        setSelectedSite('')
        setNewConsentOptions({
          allowFullResolution: false,
          allowDownload: false,
          allowEmbedding: true,
          requiresElderApproval: false
        })
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to enable syndication')
      }
    } catch (error) {
      console.error('Error enabling syndication:', error)
      alert('Failed to enable syndication')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeSyndication = async (consentId: string) => {
    if (!confirm('Revoke syndication for this site? The gallery will no longer be available on the external site.')) {
      return
    }

    try {
      const response = await fetch(`/api/syndication/galleries?consentId=${consentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchConsents()
      } else {
        alert('Failed to revoke syndication')
      }
    } catch (error) {
      console.error('Error revoking syndication:', error)
      alert('Failed to revoke syndication')
    }
  }

  const copyEmbedCode = (token: string, siteSlug: string) => {
    const embedCode = `<div id="el-gallery-${galleryId}" data-gallery-id="${galleryId}" data-token="${token}"></div>
<script src="https://empathyledger.org/embed/gallery.js"></script>`

    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Approval</Badge>
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Revoked</Badge>
      case 'expired':
        return <Badge className="bg-stone-100 text-stone-800 border-stone-200">Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Sites not yet syndicated
  const availableSites = sites.filter(
    site => !consents.some(c => c.site.slug === site.slug && c.status === 'approved')
  )

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Syndication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Syndication
            </div>
            {availableSites.length > 0 && (
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Site
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <div className="text-center py-6">
              <Share2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">
                This gallery isn&apos;t syndicated to any external sites yet.
              </p>
              {availableSites.length > 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Enable Syndication
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {consents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-center justify-between p-4 border border-stone-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{consent.site.name}</span>
                        {getStatusBadge(consent.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        {consent.allow_embedding && (
                          <span className="flex items-center gap-1">
                            <Code className="w-3 h-3" />
                            Embed
                          </span>
                        )}
                        {consent.allow_full_resolution && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Full-res
                          </span>
                        )}
                        {consent.allow_download && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Download
                          </span>
                        )}
                        {consent.requires_elder_approval && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-amber-500" />
                            Elder approval
                          </span>
                        )}
                        {consent.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(consent.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {consent.status === 'approved' && consent.allow_embedding && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConsent(consent)
                          setIsEmbedDialogOpen(true)
                        }}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Get Embed Code
                      </Button>
                    )}
                    {consent.status === 'approved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRevokeSyndication(consent.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Syndication Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Syndication</DialogTitle>
            <DialogDescription>
              Allow this gallery to be displayed on external ACT ecosystem sites.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-2 block">
                Select Site
              </label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a site..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSites.map((site) => (
                    <SelectItem key={site.id} value={site.slug}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-stone-700">Permissions</h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Allow Embedding</p>
                  <p className="text-xs text-stone-500">Site can embed gallery widget</p>
                </div>
                <Switch
                  checked={newConsentOptions.allowEmbedding}
                  onCheckedChange={(c) => setNewConsentOptions({ ...newConsentOptions, allowEmbedding: c })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Full Resolution Images</p>
                  <p className="text-xs text-stone-500">Allow access to original quality</p>
                </div>
                <Switch
                  checked={newConsentOptions.allowFullResolution}
                  onCheckedChange={(c) => setNewConsentOptions({ ...newConsentOptions, allowFullResolution: c })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Allow Downloads</p>
                  <p className="text-xs text-stone-500">Visitors can download images</p>
                </div>
                <Switch
                  checked={newConsentOptions.allowDownload}
                  onCheckedChange={(c) => setNewConsentOptions({ ...newConsentOptions, allowDownload: c })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-3">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Requires Elder Approval
                  </p>
                  <p className="text-xs text-stone-500">Hold until elder/community review</p>
                </div>
                <Switch
                  checked={newConsentOptions.requiresElderApproval}
                  onCheckedChange={(c) => setNewConsentOptions({ ...newConsentOptions, requiresElderApproval: c })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSyndication} disabled={isSaving || !selectedSite}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Enable Syndication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Gallery</DialogTitle>
            <DialogDescription>
              Copy this code and paste it into {selectedConsent?.site.name || 'the external site'}&apos;s HTML.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {embedToken ? (
              <>
                <div className="bg-stone-900 text-stone-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`<div id="el-gallery-${galleryId}"
     data-gallery-id="${galleryId}"
     data-token="${embedToken.token}">
</div>
<script src="https://empathyledger.org/embed/gallery.js"></script>`}</pre>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">
                    Token expires: {new Date(embedToken.expiresAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyEmbedCode(embedToken.token, selectedConsent?.site.slug || '')}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Note:</strong> The embed token is shown only once. Save this code securely.
                  If you need a new token, revoke and re-enable syndication.
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-stone-500 mb-4">
                  Generate an embed token to get the embed code.
                </p>
                <Button onClick={() => alert('Token generation would happen here')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Token
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsEmbedDialogOpen(false)
              setEmbedToken(null)
              setSelectedConsent(null)
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
