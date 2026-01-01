'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Users,
  FileText,
  Camera,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Play,
  Upload,
  Eye,
  Settings,
  ChevronRight,
  CirclePlay,
  UserPlus,
  Building2,
  FolderPlus,
  Mic,
  PenTool,
  Images,
  Globe,
  Shield
} from 'lucide-react'

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  url: string
  estimatedTime: string
  status: 'pending' | 'in-progress' | 'completed'
  prerequisites?: string[]
}

const AdminStorytellingWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('setup')

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'setup',
      title: 'Setup Organizations & Storytellers',
      description: 'Create organisations and assign storytellers to begin the storytelling process',
      icon: <Building2 className="w-6 h-6" />,
      url: '/admin/storytellers',
      estimatedTime: '10-15 minutes',
      status: 'pending'
    },
    {
      id: 'transcripts',
      title: 'Manage Transcripts & Content',
      description: 'Upload, review, and organise transcript content from storytellers',
      icon: <Mic className="w-6 h-6" />,
      url: '/admin/transcripts',
      estimatedTime: '5-10 minutes per transcript',
      status: 'pending',
      prerequisites: ['setup']
    },
    {
      id: 'ai-analysis',
      title: 'AI Analysis & Story Generation',
      description: 'Use AI tools to analyse transcripts and generate story drafts with cultural sensitivity',
      icon: <Sparkles className="w-6 h-6" />,
      url: '/stories/create-ai',
      estimatedTime: '2-5 minutes per story',
      status: 'pending',
      prerequisites: ['transcripts']
    },
    {
      id: 'galleries',
      title: 'Create & Link Photo Galleries',
      description: 'Organize photos into galleries and link them to stories for visual storytelling',
      icon: <Images className="w-6 h-6" />,
      url: '/admin/galleries',
      estimatedTime: '10-20 minutes per gallery',
      status: 'pending',
      prerequisites: ['ai-analysis']
    },
    {
      id: 'review',
      title: 'Review & Edit Stories',
      description: 'Review AI-generated stories, make edits, and ensure cultural appropriateness',
      icon: <PenTool className="w-6 h-6" />,
      url: '/admin/stories',
      estimatedTime: '15-30 minutes per story',
      status: 'pending',
      prerequisites: ['galleries']
    },
    {
      id: 'publish',
      title: 'Publish & Distribute',
      description: 'Publish approved stories with appropriate visibility and cultural sensitivity settings',
      icon: <Globe className="w-6 h-6" />,
      url: '/admin/stories',
      estimatedTime: '2-5 minutes per story',
      status: 'pending',
      prerequisites: ['review']
    }
  ]

  const getStepStatus = (stepId: string): 'pending' | 'in-progress' | 'completed' => {
    // In a real implementation, this would check actual progress
    return currentStep === stepId ? 'in-progress' : 'pending'
  }

  const QuickStartGuide = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CirclePlay className="w-5 h-5 text-blue-600" />
          Quick Start Guide
        </CardTitle>
        <CardDescription>
          New to the platform? Follow this guided journey to create your first story from transcript to publication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-auto p-4 flex-col items-start">
            <Link href="/admin/storytellers">
              <UserPlus className="w-8 h-8 mb-2" />
              <div className="text-left">
                <div className="font-semibold">1. Add Storytellers</div>
                <div className="text-sm text-muted-foreground">Create profiles & assign to organisations</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
            <Link href="/admin/transcripts">
              <FileText className="w-8 h-8 mb-2" />
              <div className="text-left">
                <div className="font-semibold">2. Upload Content</div>
                <div className="text-sm text-muted-foreground">Add transcripts & media files</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
            <Link href="/stories/create-ai">
              <Sparkles className="w-8 h-8 mb-2" />
              <div className="text-left">
                <div className="font-semibold">3. Generate Stories</div>
                <div className="text-sm text-muted-foreground">Use AI to create story drafts</div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const WorkflowProgress = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Storytelling Workflow Progress</CardTitle>
        <CardDescription>
          Track your progress through the complete storytelling pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(step.id)
            const isActive = currentStep === step.id
            const isCompleted = status === 'completed'

            return (
              <div key={step.id} className={`relative ${isActive ? 'ring-2 ring-blue-500 rounded-lg p-3' : 'p-3'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isActive ? 'bg-blue-100 text-blue-600' :
                    'bg-grey-100 text-grey-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-grey-900'}`}>
                        {step.title}
                      </h3>
                      <Badge variant={
                        isCompleted ? 'default' :
                        isActive ? 'secondary' :
                        'outline'
                      }>
                        {step.estimatedTime}
                      </Badge>
                    </div>
                    <p className="text-sm text-grey-500 mt-1">{step.description}</p>

                    {step.prerequisites && (
                      <div className="mt-2">
                        <p className="text-xs text-grey-400">
                          Prerequisites: {step.prerequisites.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className="flex-shrink-0"
                  >
                    <Link href={step.url}>
                      {isActive ? 'Continue' : 'Start'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-6 bg-grey-200"></div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const WorkflowActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Storytellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Manage storyteller profiles and assignments</p>
          <Button asChild size="sm" className="w-full">
            <Link href="/admin/storytellers">
              Manage Storytellers
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transcripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Upload and organise transcript content</p>
          <Button asChild size="sm" className="w-full" variant="outline">
            <Link href="/admin/transcripts">
              View Transcripts
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Galleries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Create and manage photo galleries</p>
          <Button asChild size="sm" className="w-full" variant="outline">
            <Link href="/admin/galleries">
              Manage Galleries
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Review, edit, and publish stories</p>
          <Button asChild size="sm" className="w-full" variant="outline">
            <Link href="/admin/stories">
              View Stories
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-grey-900">Admin Storytelling Workflow</h1>
        <p className="text-grey-600">
          A guided journey through the complete storytelling process - from content creation to publication
        </p>
      </div>

      <QuickStartGuide />
      <WorkflowProgress />

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Direct Access Tools</h2>
        <WorkflowActions />
      </div>
    </div>
  )
}

export default AdminStorytellingWorkflow