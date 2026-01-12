'use client'

import { useState } from 'react'
import {
  ClipboardCheck,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TestTask {
  id: string
  title: string
  description: string
  feature: string
  steps: string[]
  timeEstimate: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  feedback?: {
    rating: number
    difficulty: 'easy' | 'moderate' | 'hard'
    comments: string
    issues: string[]
    timestamp: string
  }
}

interface TestSession {
  id: string
  startedAt: string
  completedAt?: string
  tester: {
    name: string
    role: string
  }
  tasks: TestTask[]
  overallFeedback?: {
    rating: number
    wouldRecommend: boolean
    topIssues: string[]
    topPraises: string[]
    additionalComments: string
  }
}

// UAT Test Modules - 25 scenarios across 5 modules
interface TestModule {
  id: string
  name: string
  description: string
  tasks: TestTask[]
}

const uatModules: TestModule[] = [
  {
    id: 'module-syndication',
    name: 'Syndication Dashboard',
    description: 'Story sharing and distribution controls',
    tasks: [
      {
        id: 'syn-1',
        title: 'View Pending Requests',
        description: 'Navigate to syndication dashboard and view pending requests',
        feature: 'Syndication',
        steps: [
          'Navigate to /syndication/dashboard',
          'View pending syndication requests tab',
          'Identify which sites are requesting your story',
          'Understand the purpose and audience for each request'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'syn-2',
        title: 'Approve Syndication Request',
        description: 'Review and approve a story sharing request',
        feature: 'Syndication',
        steps: [
          'Select a pending request',
          'Review site information and purpose',
          'Check revenue share offer (e.g., 15%)',
          'Click "Approve Sharing"',
          'Confirm the approval'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'syn-3',
        title: 'Deny Syndication Request',
        description: 'Decline a syndication request from a partner site',
        feature: 'Syndication',
        steps: [
          'Select a pending request',
          'Click "Decline Request"',
          'Optionally provide a reason',
          'Confirm denial'
        ],
        timeEstimate: '1 min',
        status: 'pending'
      },
      {
        id: 'syn-4',
        title: 'View Active Distributions',
        description: 'Check your stories currently shared on partner sites',
        feature: 'Syndication',
        steps: [
          'Click "Active" tab',
          'View all currently active distributions',
          'Check metrics: Views, Clicks, Shares',
          'Note the approval date for each'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'syn-5',
        title: 'Stop Sharing (Revoke)',
        description: 'Remove your story from a partner site',
        feature: 'Syndication',
        steps: [
          'Find an active distribution',
          'Click "Stop Sharing"',
          'Read the warning message',
          'Cancel (or confirm if testing)'
        ],
        timeEstimate: '1 min',
        status: 'pending'
      },
      {
        id: 'syn-6',
        title: 'View Revenue Earnings',
        description: 'Check your earnings from story syndication',
        feature: 'Syndication',
        steps: [
          'Click "Revenue" tab',
          'View total earned, pending payout, this month',
          'Identify top-earning story',
          'Understand revenue share breakdown'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      }
    ]
  },
  {
    id: 'module-dashboard',
    name: 'Storyteller Dashboard',
    description: 'Your personal storytelling hub',
    tasks: [
      {
        id: 'dash-1',
        title: 'Navigate Personal Dashboard',
        description: 'Find and explore your storyteller dashboard',
        feature: 'Dashboard',
        steps: [
          'Navigate to your storyteller dashboard',
          'View your avatar and profile summary',
          'Check stats (Transcripts, Stories, Videos, Words)',
          'Understand the tab navigation'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'dash-2',
        title: 'View and Manage Transcripts',
        description: 'Access your transcript collection',
        feature: 'Dashboard',
        steps: [
          'Click "Transcripts" tab',
          'View transcript list with status badges',
          'Click on a transcript to view details',
          'Try "Create Story from Transcript" button'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'dash-3',
        title: 'Add New Transcript',
        description: 'Create a new text transcript',
        feature: 'Dashboard',
        steps: [
          'Click "Add Text Transcript"',
          'Enter a title',
          'Paste or type transcript text',
          'See word count update',
          'Click "Create Transcript"'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'dash-4',
        title: 'Upload Media',
        description: 'Upload audio or video content',
        feature: 'Dashboard',
        steps: [
          'Click "Upload Audio/Video"',
          'Select file from device',
          'Wait for upload and processing',
          'Verify transcript is generated'
        ],
        timeEstimate: '5 min',
        status: 'pending'
      },
      {
        id: 'dash-5',
        title: 'View Stories',
        description: 'Manage your published and draft stories',
        feature: 'Dashboard',
        steps: [
          'Click "Stories" tab',
          'View published and draft stories',
          'Check story status badges',
          'Click a story to view/edit'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'dash-6',
        title: 'Access Analytics',
        description: 'View your story performance metrics',
        feature: 'Dashboard',
        steps: [
          'Click "Analytics" tab',
          'View story performance metrics',
          'Understand view trends',
          'Check audience breakdown'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      }
    ]
  },
  {
    id: 'module-privacy',
    name: 'Privacy & Settings',
    description: 'Data sovereignty and cultural safety controls',
    tasks: [
      {
        id: 'priv-1',
        title: 'Access Privacy Settings',
        description: 'Find and review privacy controls',
        feature: 'Privacy',
        steps: [
          'Navigate to Settings tab',
          'Click "Privacy & Data"',
          'Review available privacy controls',
          'Understand each setting\'s purpose'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'priv-2',
        title: 'Manage Data Sovereignty',
        description: 'Configure OCAP-aligned data preferences',
        feature: 'Privacy',
        steps: [
          'Find Data Sovereignty section',
          'Read OCAP principles explanation',
          'Set data usage preferences',
          'Review third-party sharing settings'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'priv-3',
        title: 'Export Personal Data',
        description: 'Download your data in portable format',
        feature: 'Privacy',
        steps: [
          'Find "Export My Data" option',
          'Select export format',
          'Initiate export',
          'Verify download or email'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'priv-4',
        title: 'Configure ALMA Settings',
        description: 'Set up AI cultural safety preferences',
        feature: 'ALMA',
        steps: [
          'Click "ALMA & Cultural Safety" tab',
          'Understand what ALMA does',
          'Configure cultural sensitivity levels',
          'Set content moderation preferences'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'priv-5',
        title: 'Understand Content Visibility',
        description: 'Learn about Public/Community/Private options',
        feature: 'Privacy',
        steps: [
          'Review visibility options for stories',
          'Understand Public vs Community vs Private',
          'Set default visibility preference',
          'Confirm understanding'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      }
    ]
  },
  {
    id: 'module-knowledge',
    name: 'Knowledge Base & Help',
    description: 'AI-powered documentation search',
    tasks: [
      {
        id: 'kb-1',
        title: 'Search Knowledge Base',
        description: 'Use semantic search to find documentation',
        feature: 'Knowledge Base',
        steps: [
          'Navigate to /admin/platform-value',
          'Click Knowledge Base tab',
          'Try query: "How do I create a storyteller?"',
          'Review search results and similarity scores',
          'Click on a result to see content'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      },
      {
        id: 'kb-2',
        title: 'Use Quick Search Examples',
        description: 'Try pre-built example queries',
        feature: 'Knowledge Base',
        steps: [
          'Click on example search queries',
          'View results for each',
          'Compare result quality',
          'Note which queries work best'
        ],
        timeEstimate: '2 min',
        status: 'pending'
      },
      {
        id: 'kb-3',
        title: 'Find Help When Stuck',
        description: 'Locate help resources from any page',
        feature: 'Knowledge Base',
        steps: [
          'From any page, look for help resources',
          'Try finding documentation on a topic',
          'Rate helpfulness of found content',
          'Note any documentation gaps'
        ],
        timeEstimate: '3 min',
        status: 'pending'
      }
    ]
  },
  {
    id: 'module-onboarding',
    name: 'First-Time User Journey',
    description: 'New user onboarding experience',
    tasks: [
      {
        id: 'onb-1',
        title: 'Complete Onboarding Flow',
        description: 'Create a new storyteller profile',
        feature: 'Onboarding',
        steps: [
          'Navigate to /storytellers/create',
          'Complete basic info step',
          'Add location',
          'Upload photo',
          'Review and submit'
        ],
        timeEstimate: '8 min',
        status: 'pending'
      },
      {
        id: 'onb-2',
        title: 'Submit First Story',
        description: 'Create and submit your first story',
        feature: 'Onboarding',
        steps: [
          'After profile creation, go to dashboard',
          'Click "Share New Story"',
          'Enter story title and content',
          'Set visibility and themes',
          'Submit for review'
        ],
        timeEstimate: '10 min',
        status: 'pending'
      }
    ]
  }
]

// Flatten all tasks for the default session
const defaultTasks: TestTask[] = uatModules.flatMap(testModule => testModule.tasks)

export default function UserTestingDashboard() {
  const [session, setSession] = useState<TestSession>({
    id: `test-${Date.now()}`,
    startedAt: new Date().toISOString(),
    tester: {
      name: 'Anonymous Tester',
      role: 'User'
    },
    tasks: defaultTasks
  })

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState({
    rating: 0,
    difficulty: 'moderate' as 'easy' | 'moderate' | 'hard',
    comments: '',
    issues: [] as string[]
  })
  const [newIssue, setNewIssue] = useState('')

  const currentTask = session.tasks[currentTaskIndex]
  const completedTasks = session.tasks.filter(t => t.status === 'completed').length
  const progress = (completedTasks / session.tasks.length) * 100

  const startSession = () => {
    setIsRunning(true)
    setSession(prev => ({
      ...prev,
      startedAt: new Date().toISOString(),
      tasks: prev.tasks.map((t, i) =>
        i === 0 ? { ...t, status: 'in_progress' as const } : t
      )
    }))
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resetSession = () => {
    setSession({
      id: `test-${Date.now()}`,
      startedAt: new Date().toISOString(),
      tester: { name: 'Anonymous Tester', role: 'User' },
      tasks: defaultTasks.map(t => ({ ...t, status: 'pending' as const, feedback: undefined }))
    })
    setCurrentTaskIndex(0)
    setIsRunning(false)
    setShowFeedbackForm(false)
    setCurrentFeedback({ rating: 0, difficulty: 'moderate', comments: '', issues: [] })
  }

  const completeTask = () => {
    setShowFeedbackForm(true)
  }

  const submitFeedback = () => {
    const updatedTasks = [...session.tasks]
    updatedTasks[currentTaskIndex] = {
      ...updatedTasks[currentTaskIndex],
      status: 'completed',
      feedback: {
        ...currentFeedback,
        timestamp: new Date().toISOString()
      }
    }

    // Move to next task
    const nextIndex = currentTaskIndex + 1
    if (nextIndex < session.tasks.length) {
      updatedTasks[nextIndex] = { ...updatedTasks[nextIndex], status: 'in_progress' }
    }

    setSession(prev => ({ ...prev, tasks: updatedTasks }))
    setCurrentTaskIndex(nextIndex)
    setShowFeedbackForm(false)
    setCurrentFeedback({ rating: 0, difficulty: 'moderate', comments: '', issues: [] })

    if (nextIndex >= session.tasks.length) {
      setIsRunning(false)
    }
  }

  const skipTask = () => {
    const updatedTasks = [...session.tasks]
    updatedTasks[currentTaskIndex] = {
      ...updatedTasks[currentTaskIndex],
      status: 'skipped'
    }

    const nextIndex = currentTaskIndex + 1
    if (nextIndex < session.tasks.length) {
      updatedTasks[nextIndex] = { ...updatedTasks[nextIndex], status: 'in_progress' }
    }

    setSession(prev => ({ ...prev, tasks: updatedTasks }))
    setCurrentTaskIndex(nextIndex)

    if (nextIndex >= session.tasks.length) {
      setIsRunning(false)
    }
  }

  const addIssue = () => {
    if (newIssue.trim()) {
      setCurrentFeedback(prev => ({
        ...prev,
        issues: [...prev.issues, newIssue.trim()]
      }))
      setNewIssue('')
    }
  }

  const removeIssue = (index: number) => {
    setCurrentFeedback(prev => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index)
    }))
  }

  const [selectedModule, setSelectedModule] = useState<string>('all')

  // Filter tasks by module
  const filteredTasks = selectedModule === 'all'
    ? session.tasks
    : session.tasks.filter(t => {
        const testModule = uatModules.find(m => m.tasks.some(mt => mt.id === t.id))
        return testModule?.id === selectedModule
      })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Week 5: Storyteller UAT</h1>
          <p className="text-gray-600 mt-1">
            User Acceptance Testing - 22 scenarios across 5 modules
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isRunning && completedTasks === 0 ? (
            <Button onClick={startSession} className="bg-emerald-600 hover:bg-emerald-700">
              <Play className="h-4 w-4 mr-2" />
              Start Testing
            </Button>
          ) : isRunning ? (
            <Button onClick={pauseSession} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button onClick={startSession} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button onClick={resetSession} variant="ghost" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Testing Progress</h3>
                <p className="text-sm text-gray-600">
                  {completedTasks} of {session.tasks.length} tasks completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</div>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Module Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedModule === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedModule('all')}
          className={selectedModule === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          All Modules ({session.tasks.length})
        </Button>
        {uatModules.map(testModule => {
          const moduleTaskCount = testModule.tasks.length
          const moduleCompletedCount = session.tasks.filter(t =>
            testModule.tasks.some(mt => mt.id === t.id) && t.status === 'completed'
          ).length
          return (
            <Button
              key={testModule.id}
              variant={selectedModule === testModule.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedModule(testModule.id)}
              className={selectedModule === testModule.id ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {testModule.name} ({moduleCompletedCount}/{moduleTaskCount})
            </Button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-gray-900 sticky top-0 bg-white py-2">
            {selectedModule === 'all' ? 'All Test Tasks' : uatModules.find(m => m.id === selectedModule)?.name}
          </h3>
          {filteredTasks.map((task) => {
            const index = session.tasks.findIndex(t => t.id === task.id)
            return (
            <Card
              key={task.id}
              className={cn(
                "cursor-pointer transition-all",
                index === currentTaskIndex && isRunning && "border-2 border-purple-500 shadow-md",
                task.status === 'completed' && "bg-emerald-50 border-emerald-200",
                task.status === 'skipped' && "bg-gray-50 opacity-60"
              )}
              onClick={() => {
                if (task.status === 'completed' || task.status === 'skipped') {
                  // Allow reviewing completed tasks
                }
              }}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 p-1.5 rounded-full",
                      task.status === 'completed' && "bg-emerald-100",
                      task.status === 'in_progress' && "bg-purple-100",
                      task.status === 'pending' && "bg-gray-100",
                      task.status === 'skipped' && "bg-gray-100"
                    )}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : task.status === 'in_progress' ? (
                        <Target className="h-4 w-4 text-purple-600" />
                      ) : (
                        <span className="h-4 w-4 flex items-center justify-center text-xs font-bold text-gray-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{task.feature}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.timeEstimate}
                    </Badge>
                  </div>
                </div>
                {task.feedback && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3 w-3",
                            star <= task.feedback!.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        task.feedback.difficulty === 'easy' && "bg-emerald-100 text-emerald-800",
                        task.feedback.difficulty === 'moderate' && "bg-amber-100 text-amber-800",
                        task.feedback.difficulty === 'hard' && "bg-red-100 text-red-800"
                      )}
                    >
                      {task.feedback.difficulty}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )})}
        </div>

        {/* Current Task / Feedback */}
        <div className="lg:col-span-2">
          {!isRunning && completedTasks === 0 ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Zap className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Test?</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Complete 22 tasks across 5 test modules and provide feedback on each.
                  Estimated time: 45-60 minutes.
                </p>
                <Button onClick={startSession} className="bg-purple-600 hover:bg-purple-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Testing Session
                </Button>
              </CardContent>
            </Card>
          ) : currentTaskIndex >= session.tasks.length ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                  Testing Complete!
                </CardTitle>
                <CardDescription>
                  Thank you for completing the user testing session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-700">
                      {session.tasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-emerald-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-700">
                      {session.tasks.filter(t => t.status === 'skipped').length}
                    </div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-3xl font-bold text-amber-700">
                      {session.tasks.filter(t => t.feedback).reduce((sum, t) => sum + t.feedback!.issues.length, 0)}
                    </div>
                    <div className="text-sm text-amber-600">Issues Found</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Task Summaries</h4>
                  <div className="space-y-2">
                    {session.tasks.filter(t => t.feedback).map(task => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{task.title}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-4 w-4",
                                    star <= task.feedback!.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {task.feedback!.comments && (
                          <p className="text-sm text-gray-600">{task.feedback!.comments}</p>
                        )}
                        {task.feedback!.issues.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.feedback!.issues.map((issue, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <Button variant="outline" onClick={resetSession}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start New Session
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : showFeedbackForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Task Feedback</CardTitle>
                <CardDescription>
                  How was your experience with "{currentTask.title}"?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setCurrentFeedback(prev => ({ ...prev, rating: star }))}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            star <= currentFeedback.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300 hover:text-amber-200"
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {currentFeedback.rating === 0 ? 'Click to rate' :
                       currentFeedback.rating === 1 ? 'Poor' :
                       currentFeedback.rating === 2 ? 'Fair' :
                       currentFeedback.rating === 3 ? 'Good' :
                       currentFeedback.rating === 4 ? 'Very Good' : 'Excellent'}
                    </span>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How difficult was this task?
                  </label>
                  <div className="flex gap-3">
                    {(['easy', 'moderate', 'hard'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setCurrentFeedback(prev => ({ ...prev, difficulty: level }))}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors capitalize",
                          currentFeedback.difficulty === level
                            ? level === 'easy'
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : level === 'moderate'
                              ? "bg-amber-100 border-amber-300 text-amber-800"
                              : "bg-red-100 border-red-300 text-red-800"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Any issues encountered?
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIssue}
                      onChange={e => setNewIssue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addIssue()}
                      placeholder="Describe an issue..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button onClick={addIssue} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {currentFeedback.issues.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentFeedback.issues.map((issue, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 cursor-pointer hover:bg-red-100"
                          onClick={() => removeIssue(i)}
                        >
                          {issue} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <Textarea
                    value={currentFeedback.comments}
                    onChange={e => setCurrentFeedback(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Share your thoughts on this feature..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                    Back to Task
                  </Button>
                  <Button
                    onClick={submitFeedback}
                    disabled={currentFeedback.rating === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Submit & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-purple-100 text-purple-800">
                      Task {currentTaskIndex + 1} of {session.tasks.length}
                    </Badge>
                    <CardTitle className="text-xl">{currentTask.title}</CardTitle>
                    <CardDescription>{currentTask.description}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTask.timeEstimate}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    Steps to Complete
                  </h4>
                  <ol className="space-y-3">
                    {currentTask.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Testing Tips</h5>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>• Take your time - there's no rush</li>
                        <li>• Note any confusion or unexpected behavior</li>
                        <li>• Think about what you'd expect to happen</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={skipTask}>
                    Skip Task
                  </Button>
                  <Button onClick={completeTask} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete & Give Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
