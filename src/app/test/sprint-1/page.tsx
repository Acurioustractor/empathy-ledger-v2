'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrivacyBadge } from '@/components/profile/PrivacyBadge'
import { ProtocolsBadge } from '@/components/profile/ProtocolsBadge'
import { CulturalAffiliations } from '@/components/profile/CulturalAffiliations'
import { PrivacySettingsPanel } from '@/components/privacy/PrivacySettingsPanel'
import { ALMASettingsPanel } from '@/components/alma/ALMASettingsPanel'

/**
 * Sprint 1 Test Page
 *
 * Standalone test page for validating all 14 Sprint 1 components
 * without requiring the full storyteller profile API to work.
 *
 * Components tested:
 * - Profile Display: PrivacyBadge, ProtocolsBadge, CulturalAffiliations (3)
 * - Privacy Settings: PrivacySettingsPanel + 5 sub-components (6)
 * - ALMA Settings: ALMASettingsPanel + 4 sub-components (5)
 *
 * Total: 14 components
 */

export default function Sprint1TestPage() {
  // Test storytellers with names
  const testStorytellers = [
    { id: '95459ac8-fad1-4938-a882-561fd0b6090a', name: 'Troy McConnell', email: 'troy@test.com' },
    { id: 'd113d379-46f6-4113-9ad6-be7f76463c20', name: 'Olga Havnen', email: 'olga@test.com' },
    { id: 'ea82e328-ae82-4bcc-9de4-c73114e37e6c', name: 'Chelsea Rolfe', email: 'chelsea@test.com' },
  ]

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedStoryteller = testStorytellers[selectedIndex]
  const selectedStorytellerId = selectedStoryteller.id

  // Mock profile data for display components
  const mockProfile = {
    id: selectedStorytellerId,
    display_name: 'Test Storyteller',
    email: 'test@empathy-ledger.test',
    default_story_visibility: 'community' as const,
    cultural_permissions: {
      elder_review: {
        autoRouteToElders: true,
        reviewTrigger: 'sacred-only',
      },
      cultural_safety: {
        enableCulturalProtocols: true,
      },
    },
    cultural_affiliations: {
      nations: ['Anishinaabe', 'Cree'],
      territories: ['Treaty 6', 'Treaty 8'],
      languages: ['Cree', 'English'],
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Sprint 1 Component Testing
              </h1>
              <p className="text-slate-600 mt-2">
                Test all 14 Sprint 1 components (Profile Display, Privacy Settings, ALMA Settings)
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              14 Components Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Storyteller ID Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Test Storyteller</CardTitle>
            <CardDescription>
              Choose a storyteller profile from your database to test with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {testStorytellers.map((storyteller, index) => (
                <button
                  key={storyteller.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`px-6 py-3 rounded-lg text-base font-semibold transition-all border-2 ${
                    selectedIndex === index
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg ring-2 ring-blue-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {selectedIndex === index && '✓ '}
                  {storyteller.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Testing as: <strong className="text-blue-700">{selectedStoryteller.name}</strong>
              <span className="text-slate-400 ml-2">({selectedStoryteller.email})</span>
            </p>
          </CardContent>
        </Card>

        {/* Main Testing Tabs */}
        <Tabs defaultValue="profile-display" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile-display">
              Profile Display (3 components)
            </TabsTrigger>
            <TabsTrigger value="privacy-settings">
              Privacy Settings (6 components)
            </TabsTrigger>
            <TabsTrigger value="alma-settings">
              ALMA Settings (5 components)
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Display Components */}
          <TabsContent value="profile-display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Display Components (3/14)</CardTitle>
                <CardDescription>
                  Test PrivacyBadge, ProtocolsBadge, and CulturalAffiliations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Component 1: PrivacyBadge */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">1</span>
                    PrivacyBadge
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <PrivacyBadge
                      level={mockProfile.default_story_visibility}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    ✓ Should display privacy level (public/community/private/restricted)
                  </p>
                </div>

                {/* Component 2: ProtocolsBadge */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">2</span>
                    ProtocolsBadge
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <ProtocolsBadge
                      status="active"
                      linkToSettings={false}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    ✓ Should display cultural protocols status and Elder review
                  </p>
                </div>

                {/* Component 3: CulturalAffiliations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">3</span>
                    CulturalAffiliations
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <CulturalAffiliations
                      affiliations={mockProfile.cultural_affiliations}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    ✓ Should display nations, territories, and languages
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Privacy Settings Panel */}
          <TabsContent value="privacy-settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings Panel (6/14)</CardTitle>
                <CardDescription>
                  Test PrivacySettingsPanel and all 5 sub-components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <PrivacySettingsPanel
                    storytellerId={selectedStorytellerId}
                    storytellerEmail={mockProfile.email}
                  />
                </div>
                <div className="mt-6 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold">Components included (6 total):</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>✓ PrivacySettingsPanel - Main container</li>
                    <li>✓ VisibilitySelector - Story visibility defaults</li>
                    <li>✓ DataSovereigntyPreferences - OCAP controls</li>
                    <li>✓ ContactPermissions - Who can contact me</li>
                    <li>✓ ExportDataDialog - GDPR Article 15 (data export)</li>
                    <li>✓ DeleteAccountDialog - GDPR Article 17 (account deletion)</li>
                  </ul>
                  <p className="text-amber-600 font-medium mt-4">
                    ⚠️ Testing Note: Click "Delete My Account" to test dialog, but DO NOT CONFIRM deletion!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: ALMA Settings Panel */}
          <TabsContent value="alma-settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ALMA Settings Panel (5/14)</CardTitle>
                <CardDescription>
                  Test ALMASettingsPanel and all 4 sub-components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <ALMASettingsPanel storytellerId={selectedStorytellerId} />
                </div>
                <div className="mt-6 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold">Components included (5 total):</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>✓ ALMASettingsPanel - Main ALMA container</li>
                    <li>✓ AIConsentControls - Granular AI opt-in (4 toggles, all default OFF)</li>
                    <li>✓ SacredKnowledgeProtection - 3 protection levels (None, Moderate, Strict)</li>
                    <li>✓ ElderReviewPreferences - Elder review workflow configuration</li>
                    <li>✓ CulturalSafetySettings - Cultural protocols and content warnings</li>
                  </ul>
                  <p className="text-blue-600 font-medium mt-4">
                    ℹ️ Testing Note: All AI consent toggles should default to OFF (0/4 enabled)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Testing Checklist */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Sprint 1 Testing Checklist</CardTitle>
            <CardDescription className="text-green-700">
              Follow these steps to complete Sprint 1 validation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <h4 className="font-semibold text-green-900 mb-2">Profile Display:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>PrivacyBadge displays correctly with color-coded status</li>
              <li>ProtocolsBadge shows Elder review and cultural protocols</li>
              <li>CulturalAffiliations displays nations, territories, languages</li>
            </ul>

            <h4 className="font-semibold text-green-900 mb-2 mt-4">Privacy Settings:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Change story visibility and save</li>
              <li>Configure OCAP data sovereignty preferences</li>
              <li>Set contact permissions</li>
              <li>Test "Export My Data" (JSON download)</li>
              <li>Test "Delete Account" dialog (DO NOT CONFIRM!)</li>
              <li>Verify settings persist after page refresh</li>
            </ul>

            <h4 className="font-semibold text-green-900 mb-2 mt-4">ALMA Settings:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Verify all 4 AI toggles default to OFF (0/4)</li>
              <li>Enable AI features individually and check counter</li>
              <li>Test sacred knowledge protection levels (None, Moderate, Strict)</li>
              <li>Configure Elder review preferences</li>
              <li>Add cultural protocol notes and save</li>
              <li>Verify plain-language tooltips display</li>
              <li>Check confirmation messages show for 5 seconds</li>
              <li>Verify settings persist after page refresh</li>
            </ul>

            <h4 className="font-semibold text-green-900 mb-2 mt-4">Accessibility:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>Tab through all form elements (keyboard navigation)</li>
              <li>Verify focus indicators are visible</li>
              <li>Check touch targets are ≥44px (tablet-friendly)</li>
            </ul>

            <p className="text-green-900 font-semibold mt-6 border-t border-green-200 pt-4">
              ✅ Full test checklist:
              <a
                href="/docs/testing/SPRINT_1_MANUAL_TEST_CHECKLIST.md"
                className="text-blue-600 hover:underline ml-2"
              >
                SPRINT_1_MANUAL_TEST_CHECKLIST.md
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
