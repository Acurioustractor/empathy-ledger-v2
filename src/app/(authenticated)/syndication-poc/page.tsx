'use client'

/**
 * Week 2 PoC Demo Page
 *
 * Interactive demonstration of the syndication system UI/UX.
 * Shows all components working together with ACT philosophy alignment.
 *
 * Features:
 * - Story Connections Dashboard
 * - Share Your Story Modal
 * - Removal Progress Tracker
 * - Cultural safety demonstrations
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StoryConnectionsDashboard from '@/components/syndication/StoryConnectionsDashboard'
import ShareYourStoryModal from '@/components/syndication/ShareYourStoryModal'
import RemovalProgressTracker from '@/components/syndication/RemovalProgressTracker'
import {
  Sparkles,
  Share2,
  Shield,
  Heart,
  CheckCircle2
} from 'lucide-react'

export default function SyndicationPoCPage() {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [showRemovalProgress, setShowRemovalProgress] = useState(false)
  const [selectedStory, setSelectedStory] = useState({
    id: 'story-demo-1',
    title: 'My Journey to Healing',
    culturalMarkers: ['ceremony', 'family'],
    isSacred: false,
    elderApproved: true
  })

  const handleOpenShareModal = (isSacred: boolean = false) => {
    setSelectedStory(prev => ({ ...prev, isSacred }))
    setShareModalOpen(true)
  }

  const handleShare = async (siteIds: string[]) => {
    console.log('Sharing story with sites:', siteIds)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleRemoval = () => {
    setShowRemovalProgress(true)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-sage-600" />
          <h1 className="text-3xl font-bold text-clay-900">
            Week 2 PoC: Content Gateway & Revocation
          </h1>
        </div>
        <p className="text-lg text-clay-700">
          Interactive demonstration of world-class syndication UX with ACT philosophy alignment
        </p>
      </div>

      {/* Status Banner */}
      <Card className="border-sage-200 bg-sage-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-sage-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-sage-900">
                Week 1 PoC Complete ✅
              </h3>
              <ul className="text-sm text-sage-800 space-y-1">
                <li>• Vision AI: 90% face detection accuracy</li>
                <li>• Cost: $0.01 per image (95% under budget)</li>
                <li>• Cultural markers: Successfully detected</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week 2 Features */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="dashboard">
            <Share2 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="share">
            <Heart className="h-4 w-4 mr-2" />
            Share Modal
          </TabsTrigger>
          <TabsTrigger value="removal">
            <Shield className="h-4 w-4 mr-2" />
            Removal
          </TabsTrigger>
          <TabsTrigger value="philosophy">
            <Sparkles className="h-4 w-4 mr-2" />
            Philosophy
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Story Connections Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card className="border-clay-200">
            <CardHeader>
              <CardTitle className="text-clay-900">
                Story Connections Dashboard
              </CardTitle>
              <CardDescription className="text-clay-700">
                Shows storytellers where their stories are shared across the ACT ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-cream-50 border border-clay-200 rounded-lg p-4">
                  <h4 className="font-medium text-clay-900 mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-sm text-clay-700 space-y-1">
                    <li>• Storyteller-centric language ("Where Your Stories Live")</li>
                    <li>• Real-time engagement metrics (views, visitors)</li>
                    <li>• Cultural markers displayed per connection</li>
                    <li>• Gentle "Stop Sharing" button (ochre, not red)</li>
                    <li>• Status badges with clear icons</li>
                  </ul>
                </div>

                <StoryConnectionsDashboard
                  storytellerId="demo-user"
                  className="border-2 border-dashed border-clay-300 rounded-lg p-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Share Your Story Modal */}
        <TabsContent value="share" className="space-y-4">
          <Card className="border-clay-200">
            <CardHeader>
              <CardTitle className="text-clay-900">
                Share Your Story Modal
              </CardTitle>
              <CardDescription className="text-clay-700">
                Helps storytellers choose which communities to connect with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-cream-50 border border-clay-200 rounded-lg p-4">
                  <h4 className="font-medium text-clay-900 mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-sm text-clay-700 space-y-1">
                    <li>• Shows WHY each site matters (not just WHERE)</li>
                    <li>• Progressive disclosure (show context when requested)</li>
                    <li>• Sacred content hard block with Elder authority</li>
                    <li>• Cultural markers visibility</li>
                    <li>• Warm handoff language ("connect with")</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleOpenShareModal(false)}
                    className="bg-sage-600 hover:bg-sage-700 text-white"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Try: Share Regular Story
                  </Button>

                  <Button
                    onClick={() => handleOpenShareModal(true)}
                    variant="outline"
                    className="border-ochre-300 text-ochre-800 hover:bg-ochre-50"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Try: Share Sacred Story (Will Block)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Removal Progress */}
        <TabsContent value="removal" className="space-y-4">
          <Card className="border-clay-200">
            <CardHeader>
              <CardTitle className="text-clay-900">
                Removal Progress Tracker
              </CardTitle>
              <CardDescription className="text-clay-700">
                Real-time per-site feedback during story removal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-cream-50 border border-clay-200 rounded-lg p-4">
                  <h4 className="font-medium text-clay-900 mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-sm text-clay-700 space-y-1">
                    <li>• Real-time status for each site (not just "processing...")</li>
                    <li>• Overall progress bar with percentage</li>
                    <li>• Retry buttons for failures</li>
                    <li>• Support contact option</li>
                    <li>• Reassuring success messages</li>
                  </ul>
                </div>

                {!showRemovalProgress ? (
                  <Button
                    onClick={handleRemoval}
                    className="bg-ochre-600 hover:bg-ochre-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Simulate Story Removal
                  </Button>
                ) : (
                  <RemovalProgressTracker
                    storyId="story-demo-1"
                    storyTitle="My Journey to Healing"
                    siteIds={['justicehub', 'theharvest']}
                    onComplete={() => console.log('Removal complete')}
                    onClose={() => setShowRemovalProgress(false)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: ACT Philosophy Alignment */}
        <TabsContent value="philosophy" className="space-y-4">
          <Card className="border-clay-200">
            <CardHeader>
              <CardTitle className="text-clay-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sage-600" />
                ACT Philosophy Alignment
              </CardTitle>
              <CardDescription className="text-clay-700">
                How this PoC embodies ACT values and trauma-informed design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Patterns */}
              <div className="space-y-3">
                <h3 className="font-medium text-clay-900">
                  Storyteller-Centric Language
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="border-sage-200 bg-sage-50">
                    <CardContent className="pt-4">
                      <Badge className="mb-2 bg-sage-600">We Say</Badge>
                      <ul className="text-sm text-sage-900 space-y-1">
                        <li>✅ "Share your story"</li>
                        <li>✅ "Where your stories live"</li>
                        <li>✅ "Your story, your control"</li>
                        <li>✅ "Connect with communities"</li>
                        <li>✅ "Stop sharing"</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-ochre-200 bg-ochre-50">
                    <CardContent className="pt-4">
                      <Badge className="mb-2 bg-ochre-600">We Don't Say</Badge>
                      <ul className="text-sm text-ochre-900 space-y-1">
                        <li>❌ "Syndicate content"</li>
                        <li>❌ "Distribution panel"</li>
                        <li>❌ "Platform controls"</li>
                        <li>❌ "Publish to sites"</li>
                        <li>❌ "Revoke access"</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Cultural Safety */}
              <div className="space-y-3">
                <h3 className="font-medium text-clay-900">
                  Cultural Safety Guarantees
                </h3>
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <ul className="text-sm text-sky-900 space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Sacred content hard block:</strong> Cannot syndicate sacred stories without Elder approval</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Cultural markers visible:</strong> Storytellers see what AI detected before sharing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Elder authority respected:</strong> Elders can veto any syndication decision</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-sky-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Immediate revocation:</strong> 5-minute compliance deadline for external sites</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Trauma-Informed Design */}
              <div className="space-y-3">
                <h3 className="font-medium text-clay-900">
                  Trauma-Informed Design Principles
                </h3>
                <div className="bg-cream-50 border border-clay-200 rounded-lg p-4">
                  <ul className="text-sm text-clay-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-ochre-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Gentle colors:</strong> Ochre/terracotta for destructive actions (not red)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-ochre-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Reversible actions:</strong> "Stop sharing" can be undone by sharing again</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-ochre-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Clear outcomes:</strong> Explain exactly what will happen before confirming</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-ochre-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Progress transparency:</strong> Show real-time status per site (not hidden)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-ochre-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Support access:</strong> Always offer help option for failures</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ACT Ecosystem Thinking */}
              <div className="space-y-3">
                <h3 className="font-medium text-clay-900">
                  ACT Ecosystem Connection
                </h3>
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                  <ul className="text-sm text-sage-900 space-y-2">
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-sage-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Warm handoffs:</strong> Each site shows WHY it matters (purpose, audience)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-sage-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Connection context:</strong> Progressive disclosure reveals deeper meaning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-sage-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Engagement visibility:</strong> Storytellers see how many people connected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-sage-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Attribution intact:</strong> All sites link back to Empathy Ledger</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Modal (Controlled) */}
      <ShareYourStoryModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        storyId={selectedStory.id}
        storyTitle={selectedStory.title}
        culturalMarkers={selectedStory.culturalMarkers}
        isSacred={selectedStory.isSacred}
        elderApproved={selectedStory.elderApproved}
        onShare={handleShare}
      />
    </div>
  )
}
