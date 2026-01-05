'use client'

/**
 * Share Your Story Modal
 *
 * Helps storytellers choose which ACT ecosystem sites to share their story with.
 * Emphasizes connection context and cultural safety.
 *
 * ACT Philosophy Alignment:
 * - Shows WHY each site matters (not just WHERE to share)
 * - Respects Elder authority (sacred stories cannot be shared)
 * - Progressive disclosure (show advanced options only when needed)
 * - Warm handoff language ("connect with", not "distribute to")
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  Users,
  Sprout,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ACTSite {
  id: string
  name: string
  slug: string
  description: string
  purpose: string
  icon: typeof Heart
  color: string
  audience: string
  examples: string[]
}

interface ShareYourStoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyId: string
  storyTitle: string
  culturalMarkers: string[]
  isSacred: boolean
  elderApproved: boolean
  onShare: (siteIds: string[]) => Promise<void>
}

const ACT_SITES: ACTSite[] = [
  {
    id: 'justicehub',
    name: 'JusticeHub',
    slug: 'justicehub',
    description: 'Youth justice stories that inspire policy change',
    purpose: 'Your story could help change laws and support systems for young people',
    icon: Scale,
    color: 'text-blue-600',
    audience: 'Policymakers, advocates, and community leaders',
    examples: [
      'Stories about navigating the justice system',
      'Testimonials of healing and transformation',
      'Experiences with youth programs'
    ]
  },
  {
    id: 'theharvest',
    name: 'The Harvest',
    slug: 'theharvest',
    description: 'Community stories of growth and connection',
    purpose: 'Your story could inspire others on their healing journey',
    icon: Sprout,
    color: 'text-green-600',
    audience: 'Volunteers, participants, and families',
    examples: [
      'Stories about connecting with Country',
      'Experiences in community programs',
      'Moments of growth and discovery'
    ]
  },
  {
    id: 'actfarm',
    name: 'ACT Farm',
    slug: 'actfarm',
    description: 'Conservation stories and connection to Country',
    purpose: 'Your story could help protect land and share cultural knowledge',
    icon: Heart,
    color: 'text-emerald-600',
    audience: 'Conservationists, landowners, and community',
    examples: [
      'Stories about caring for Country',
      'Traditional ecological knowledge',
      'Regenerative farming experiences'
    ]
  }
]

export default function ShareYourStoryModal({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  culturalMarkers,
  isSacred,
  elderApproved,
  onShare
}: ShareYourStoryModalProps) {
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleToggleSite = (siteId: string) => {
    setSelectedSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const handleShare = async () => {
    if (selectedSites.length === 0) return

    setIsSharing(true)
    try {
      await onShare(selectedSites)
      onOpenChange(false)
      setSelectedSites([])
    } catch (error) {
      console.error('Error sharing story:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const canShare = !isSacred || elderApproved

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-cream-50">
        <DialogHeader>
          <DialogTitle className="text-clay-900 text-xl">
            Share Your Story
          </DialogTitle>
          <DialogDescription className="text-clay-700">
            Choose which communities you'd like to connect with through "{storyTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sacred Content Warning */}
          {isSacred && !elderApproved && (
            <Card className="border-ochre-300 bg-ochre-50">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-ochre-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-ochre-900">
                      Sacred Story Protection
                    </p>
                    <p className="text-sm text-ochre-800">
                      This story contains sacred cultural content. It needs Elder approval
                      before it can be shared outside Empathy Ledger. This protects
                      cultural knowledge and honors traditional protocols.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cultural Markers Info */}
          {culturalMarkers.length > 0 && (
            <Card className="border-sage-200 bg-sage-50">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-sage-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-sage-900">
                      Cultural Elements Detected
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {culturalMarkers.map(marker => (
                        <Badge
                          key={marker}
                          variant="secondary"
                          className="text-xs bg-sage-100 text-sage-800 border-sage-200"
                        >
                          {marker}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-sage-800">
                      Your story will be shared respectfully with cultural context intact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Site Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-clay-900">
              Where would you like to share this story?
            </h3>

            <div className="space-y-3">
              {ACT_SITES.map(site => {
                const Icon = site.icon
                const isSelected = selectedSites.includes(site.id)

                return (
                  <Card
                    key={site.id}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      isSelected
                        ? "border-sage-400 bg-sage-50"
                        : "border-clay-200 hover:border-clay-300",
                      !canShare && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canShare && handleToggleSite(site.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => canShare && handleToggleSite(site.id)}
                          disabled={!canShare}
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-5 w-5", site.color)} />
                            <span className="font-medium text-clay-900">
                              {site.name}
                            </span>
                          </div>

                          <p className="text-sm text-clay-700">
                            {site.description}
                          </p>

                          {showAdvanced && (
                            <div className="space-y-2 pt-2 border-t border-clay-200">
                              <p className="text-sm font-medium text-clay-900">
                                Why share here?
                              </p>
                              <p className="text-sm text-clay-700">
                                {site.purpose}
                              </p>

                              <div className="space-y-1">
                                <p className="text-xs font-medium text-clay-600">
                                  Who will see it:
                                </p>
                                <p className="text-xs text-clay-600">
                                  {site.audience}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-medium text-clay-600">
                                  Good fit for:
                                </p>
                                <ul className="text-xs text-clay-600 space-y-0.5">
                                  {site.examples.map((example, i) => (
                                    <li key={i}>• {example}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Show More Context Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-clay-600 hover:text-clay-900"
            >
              {showAdvanced ? 'Show less context' : 'Show more about each community'}
            </Button>
          </div>

          {/* What Happens Next */}
          {selectedSites.length > 0 && canShare && (
            <Card className="border-sky-200 bg-sky-50">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-sky-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sky-900">
                      What happens when you share:
                    </p>
                    <ul className="text-sm text-sky-800 space-y-1">
                      <li>• Your story will appear on {selectedSites.length === 1 ? ACT_SITES.find(s => s.id === selectedSites[0])?.name : `${selectedSites.length} sites`}</li>
                      <li>• You'll see how many people connect with it</li>
                      <li>• You can stop sharing anytime - your story, your control</li>
                      <li>• All cultural context and safety measures stay in place</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSharing}
            className="border-clay-300 text-clay-700 hover:bg-clay-50"
          >
            Not Right Now
          </Button>
          <Button
            onClick={handleShare}
            disabled={!canShare || selectedSites.length === 0 || isSharing}
            className="bg-sage-600 hover:bg-sage-700 text-white disabled:opacity-50"
          >
            {isSharing ? 'Sharing...' : `Share with ${selectedSites.length || 0} ${selectedSites.length === 1 ? 'community' : 'communities'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
