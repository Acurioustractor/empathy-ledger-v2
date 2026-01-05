'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Shield,
  FileCheck,
  UserPlus,
  LayoutGrid,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function Sprint5TestDashboard() {
  const testCategories = [
    {
      id: 'elder-review',
      title: 'Elder Review System',
      description: 'Test Elder review workflows, cultural safety assessments, and approval processes',
      icon: Shield,
      color: 'amber',
      apis: 5,
      components: 6,
      features: [
        'Review queue with priority sorting',
        '4 decision types (approve/reject/changes/escalate)',
        '12 cultural concern categories',
        'Review history tracking',
        'Elder Council escalation'
      ]
    },
    {
      id: 'consent-tracking',
      title: 'Consent Tracking',
      description: 'Test GDPR/OCAP compliant consent management and audit trails',
      icon: FileCheck,
      color: 'sky',
      apis: 8,
      components: 7,
      features: [
        'Complete consent lifecycle',
        '4 renewal periods (1yr/2yr/5yr/indefinite)',
        'Withdrawal with restore',
        'Complete audit trail',
        'CSV export functionality'
      ]
    },
    {
      id: 'recruitment',
      title: 'Storyteller Recruitment',
      description: 'Test multi-channel recruitment (email, SMS, magic links, QR codes)',
      icon: UserPlus,
      color: 'sage',
      apis: 6,
      components: 5,
      features: [
        'Email/SMS invitations',
        'Magic links (passwordless)',
        'QR code generation',
        'Invitation tracking',
        'Resend capability'
      ]
    },
    {
      id: 'curation',
      title: 'Story Curation',
      description: 'Test story assignment, theme tagging, campaigns, and quality reviews',
      icon: LayoutGrid,
      color: 'clay',
      apis: 8,
      components: 5,
      features: [
        'Bulk story assignment',
        '20 Indigenous themes + custom',
        'Campaign management',
        'Quality review queue',
        'Theme analytics'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Timeline',
      description: 'Test data export, theme visualization, and project timelines',
      icon: BarChart3,
      color: 'ember',
      apis: 3,
      components: 3,
      features: [
        'CSV export (7 data types)',
        'Theme distribution charts',
        'Project timeline (month/quarter/year)',
        'Trend analysis',
        'Growth tracking'
      ]
    }
  ]

  const totalApis = testCategories.reduce((sum, cat) => sum + cat.apis, 0)
  const totalComponents = testCategories.reduce((sum, cat) => sum + cat.components, 0)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Sprint 5: Organization Tools</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            100% Complete
          </Badge>
        </div>
        <p className="text-gray-600">
          Test all 30 API endpoints and 26 components for Sprint 5 Organization Tools
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-1">{totalApis}</div>
            <div className="text-sm text-gray-600">API Endpoints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">{totalComponents}</div>
            <div className="text-sm text-gray-600">Components</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">6</div>
            <div className="text-sm text-gray-600">Database Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Test Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testCategories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${category.color}-50`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="flex gap-4 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{category.apis} APIs</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.components} Components</Badge>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {category.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Test Button */}
                <Link href={`/test/sprint-5/${category.id}`}>
                  <Button className="w-full" variant="outline">
                    Test {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Documentation Links */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/SPRINT5_COMPLETE.md" target="_blank">
              <Button variant="outline" className="w-full justify-start">
                📄 Component Documentation
              </Button>
            </Link>
            <Link href="/SPRINT5_API_COMPLETE.md" target="_blank">
              <Button variant="outline" className="w-full justify-start">
                🔌 API Documentation
              </Button>
            </Link>
            <Link href="/SPRINT5_PROGRESS.md" target="_blank">
              <Button variant="outline" className="w-full justify-start">
                📊 Progress Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Safety Notice */}
      <Card className="mt-6 bg-sage-50 border-sage-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-sage-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-sage-900 mb-1">Cultural Safety & Data Sovereignty</p>
              <p className="text-sage-700">
                All Sprint 5 features honor OCAP principles (Ownership, Control, Access, Possession)
                and comply with GDPR regulations. Elder review workflows protect cultural knowledge,
                consent management respects Indigenous data sovereignty.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
