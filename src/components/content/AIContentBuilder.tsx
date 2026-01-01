'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  MessageCircle,
  Sparkles,
  Heart,
  Shield,
  Users,
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  Mic,
  Eye,
  Lightbulb,
  Target,
  BookOpen,
  Feather
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InterviewQuestion {
  id: string
  category: 'personal' | 'cultural' | 'experience' | 'values'
  question: string
  followUp?: string
  culturalConsiderations: string[]
  required: boolean
}

interface ContentSuggestion {
  id: string
  text: string
  authenticity: number
  culturalSensitivity: number
  reasoning: string
  improvements: string[]
  culturalFlags?: string[]
}

interface CulturalCheck {
  type: 'warning' | 'suggestion' | 'approval'
  message: string
  suggestion?: string
}

interface AIContentBuilderProps {
  section: 'bio' | 'cultural_background' | 'storytelling_experience' | 'interests'
  existingContent?: string
  culturalBackground?: string[]
  onContentUpdate?: (content: string, metadata: any) => void
  onSave?: (content: string, metadata: any) => void
}

export function AIContentBuilder({
  section,
  existingContent = '',
  culturalBackground = [],
  onContentUpdate,
  onSave
}: AIContentBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'interview' | 'generate' | 'refine' | 'review'>('interview')
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({})
  const [generatedContent, setGeneratedContent] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [culturalChecks, setCulturalChecks] = useState<CulturalCheck[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [authenticityScore, setAuthenticityScore] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Interview questions based on section
  const getInterviewQuestions = (): InterviewQuestion[] => {
    const baseQuestions: Record<string, InterviewQuestion[]> = {
      bio: [
        {
          id: 'personal_intro',
          category: 'personal',
          question: 'Tell me about yourself - who are you beyond your roles and titles?',
          followUp: 'What experiences have shaped who you are today?',
          culturalConsiderations: ['Respect for privacy boundaries', 'Family/community context'],
          required: true
        },
        {
          id: 'heritage_connection',
          category: 'cultural',
          question: 'How does your cultural heritage influence your daily life?',
          followUp: 'Are there specific traditions or practices that are important to you?',
          culturalConsiderations: ['Sacred knowledge boundaries', 'Community protocols'],
          required: true
        },
        {
          id: 'community_role',
          category: 'experience',
          question: 'What role do you play in your community?',
          followUp: 'How do you contribute to your community\'s wellbeing?',
          culturalConsiderations: ['Leadership structures', 'Age and wisdom protocols'],
          required: false
        }
      ],
      cultural_background: [
        {
          id: 'cultural_identity',
          category: 'cultural',
          question: 'How would you describe your cultural identity and heritage?',
          followUp: 'What aspects of your culture are most meaningful to you?',
          culturalConsiderations: ['Sacred knowledge', 'Community permission', 'Appropriate sharing'],
          required: true
        },
        {
          id: 'traditions',
          category: 'cultural',
          question: 'What traditions or customs do you practice or hold dear?',
          followUp: 'How were these traditions passed down to you?',
          culturalConsiderations: ['Sacred ceremonies', 'Family protocols', 'Community boundaries'],
          required: true
        },
        {
          id: 'cultural_challenges',
          category: 'experience',
          question: 'Have you faced challenges related to your cultural identity?',
          followUp: 'How have you overcome or worked through these challenges?',
          culturalConsiderations: ['Trauma-informed approach', 'Resilience focus'],
          required: false
        }
      ],
      storytelling_experience: [
        {
          id: 'storytelling_journey',
          category: 'experience',
          question: 'How did you begin your storytelling journey?',
          followUp: 'What inspired you to share your stories?',
          culturalConsiderations: ['Oral tradition protocols', 'Permission to tell stories'],
          required: true
        },
        {
          id: 'story_impact',
          category: 'values',
          question: 'What impact do you hope your stories will have?',
          followUp: 'Who do you hope to reach with your stories?',
          culturalConsiderations: ['Community benefit', 'Cultural preservation'],
          required: true
        }
      ],
      interests: [
        {
          id: 'passions',
          category: 'personal',
          question: 'What activities or causes are you passionate about?',
          followUp: 'How do these interests connect to your values?',
          culturalConsiderations: ['Cultural practices', 'Community involvement'],
          required: true
        },
        {
          id: 'learning',
          category: 'values',
          question: 'What are you currently learning or hoping to learn?',
          followUp: 'How does this learning serve your community?',
          culturalConsiderations: ['Traditional knowledge', 'Intergenerational learning'],
          required: false
        }
      ]
    }

    return baseQuestions[section] || []
  }

  const questions = getInterviewQuestions()
  const currentQuestion = questions[currentQuestionIndex]

  // Generate content based on interview answers
  const generateContent = async () => {
    setIsGenerating(true)
    setCurrentStep('generate')

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI-generated content based on answers
    const mockContent = generateMockContent(section, interviewAnswers)
    setGeneratedContent(mockContent)
    setEditedContent(mockContent)

    // Generate suggestions
    const mockSuggestions: ContentSuggestion[] = [
      {
        id: '1',
        text: 'Consider adding more specific examples from your personal experience',
        authenticity: 85,
        culturalSensitivity: 90,
        reasoning: 'Personal examples create stronger connections with readers',
        improvements: ['Add specific memories', 'Include sensory details', 'Show rather than tell']
      },
      {
        id: '2',
        text: 'Your cultural references are respectful and appropriate',
        authenticity: 92,
        culturalSensitivity: 95,
        reasoning: 'Content honours cultural protocols while being accessible',
        improvements: ['Maintain this approach', 'Consider adding cultural context for broader audience']
      }
    ]

    setSuggestions(mockSuggestions)

    // Cultural sensitivity checks
    const mockChecks: CulturalCheck[] = [
      {
        type: 'approval',
        message: 'Your content respectfully represents your cultural heritage'
      },
      {
        type: 'suggestion',
        message: 'Consider adding context about cultural practices for general audiences',
        suggestion: 'Brief explanations help readers understand and appreciate cultural elements'
      }
    ]

    setCulturalChecks(mockChecks)
    setAuthenticityScore(87)
    setIsGenerating(false)
    setCurrentStep('refine')
  }

  const generateMockContent = (section: string, answers: Record<string, string>): string => {
    // This would be replaced with actual AI generation
    const templates = {
      bio: `I am ${answers.personal_intro || '[your introduction]'}, deeply connected to ${answers.heritage_connection || '[your heritage]'}. My journey has been shaped by ${answers.community_role || '[your experiences]'}, and I find meaning in sharing the wisdom and stories that have been passed down through generations.`,

      cultural_background: `My cultural identity is rooted in ${answers.cultural_identity || '[your cultural background]'}. The traditions that guide my life include ${answers.traditions || '[your traditions]'}, which were lovingly shared with me by my elders. ${answers.cultural_challenges ? `Through challenges, I have learned ${answers.cultural_challenges}` : 'I carry these teachings forward with pride and respect.'}.`,

      storytelling_experience: `My storytelling journey began ${answers.storytelling_journey || '[your beginning]'}. I share stories because ${answers.story_impact || '[your motivation]'}, hoping to create bridges of understanding and preserve the wisdom of my ancestors for future generations.`,

      interests: `I am passionate about ${answers.passions || '[your interests]'}, which connect deeply to my cultural values and community responsibilities. Currently, I am focused on ${answers.learning || '[your learning goals]'}, always seeking ways to grow while honouring my heritage.`
    }

    return templates[section as keyof typeof templates] || ''
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = { ...interviewAnswers, [currentQuestion.id]: value }
    setInterviewAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      generateContent()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleContentEdit = (value: string) => {
    setEditedContent(value)
    onContentUpdate?.(value, {
      authenticityScore,
      culturalChecks,
      source: 'ai_assisted',
      lastModified: new Date()
    })
  }

  const handleSave = () => {
    onSave?.(editedContent, {
      authenticityScore,
      culturalChecks,
      source: 'ai_assisted',
      interviewAnswers,
      lastModified: new Date()
    })
  }

  const getStepProgress = () => {
    switch (currentStep) {
      case 'interview': return 25
      case 'generate': return 50
      case 'refine': return 75
      case 'review': return 100
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-earth-600" />
                AI-Assisted Content Builder
              </CardTitle>
              <CardDescription>
                Create authentic content while preserving your unique voice and cultural perspective
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-earth-700 border-earth-300">
              {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="body-sm" className="text-stone-600">
                Progress: {getStepProgress()}%
              </Typography>
              <div className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full",
                  currentStep === 'interview' ? "bg-earth-100 text-earth-700" : "bg-stone-100 text-stone-500"
                )}>
                  <MessageCircle className="w-3 h-3" />
                  Interview
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full",
                  currentStep === 'generate' ? "bg-earth-100 text-earth-700" : "bg-stone-100 text-stone-500"
                )}>
                  <Sparkles className="w-3 h-3" />
                  Generate
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full",
                  currentStep === 'refine' ? "bg-earth-100 text-earth-700" : "bg-stone-100 text-stone-500"
                )}>
                  <Feather className="w-3 h-3" />
                  Refine
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full",
                  currentStep === 'review' ? "bg-earth-100 text-earth-700" : "bg-stone-100 text-stone-500"
                )}>
                  <Eye className="w-3 h-3" />
                  Review
                </div>
              </div>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Interview Step */}
      {currentStep === 'interview' && currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-sage-600" />
              Personal Interview
              <Badge variant="outline" className="ml-auto">
                {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Share your authentic experiences to create meaningful content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-3">
              <Typography variant="h6" className="text-stone-800">
                {currentQuestion.question}
              </Typography>
              {currentQuestion.followUp && (
                <Typography variant="body-sm" className="text-stone-600 italic">
                  Follow-up: {currentQuestion.followUp}
                </Typography>
              )}
            </div>

            {/* Cultural Considerations */}
            <div className="p-4 bg-clay-50 border border-clay-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-clay-600 mt-0.5 flex-shrink-0" />
                <div>
                  <Typography variant="body-sm" className="font-medium text-clay-800 mb-2">
                    Cultural Considerations:
                  </Typography>
                  <ul className="text-xs text-clay-700 space-y-1">
                    {currentQuestion.culturalConsiderations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="w-1 h-1 bg-clay-600 rounded-full mt-2 flex-shrink-0" />
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer" className="text-stone-700 font-medium">
                  Your Response
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceRecording(!voiceRecording)}
                    className={voiceRecording ? "bg-error-50 border-error-300" : ""}
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    {voiceRecording ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                </div>
              </div>

              <Textarea
                id="answer"
                ref={textareaRef}
                placeholder="Share your authentic experience in your own words..."
                value={interviewAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[120px] resize-none"
              />

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {(interviewAnswers[currentQuestion.id] || '').length} characters
                </span>
                {currentQuestion.required && !interviewAnswers[currentQuestion.id] && (
                  <span className="text-error-600">Required</span>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Button
                onClick={nextQuestion}
                disabled={currentQuestion.required && !interviewAnswers[currentQuestion.id]}
                className="bg-earth-600 hover:bg-earth-700"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Generate Content' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Step */}
      {currentStep === 'generate' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-earth-100 rounded-full">
                <Sparkles className="w-8 h-8 text-earth-600 animate-pulse" />
              </div>
              <Typography variant="h6" className="text-stone-800">
                Creating Your Authentic Content
              </Typography>
              <Typography variant="body-sm" className="text-stone-600 max-w-md mx-auto">
                Our AI is carefully crafting content that honours your voice, experiences, and cultural perspective.
              </Typography>
              <div className="w-64 mx-auto">
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refine Step */}
      {currentStep === 'refine' && (
        <div className="space-y-6">
          {/* Authenticity Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-success-600" />
                Authenticity Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body-sm" className="text-stone-700">
                      Authenticity Score
                    </Typography>
                    <Typography variant="body-sm" className="font-bold text-success-700">
                      {authenticityScore}%
                    </Typography>
                  </div>
                  <Progress value={authenticityScore} className="h-3" />
                </div>
                <Badge variant="outline" className="text-success-700 border-success-300 bg-success-50">
                  Excellent
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cultural Sensitivity Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-clay-600" />
                Cultural Sensitivity Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {culturalChecks.map((check, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border",
                      check.type === 'approval' && "bg-success-50 border-success-200",
                      check.type === 'suggestion' && "bg-warning-50 border-warning-200",
                      check.type === 'warning' && "bg-error-50 border-error-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {check.type === 'approval' && <CheckCircle className="w-4 h-4 text-success-600 mt-0.5" />}
                      {check.type === 'suggestion' && <Info className="w-4 h-4 text-warning-600 mt-0.5" />}
                      {check.type === 'warning' && <AlertTriangle className="w-4 h-4 text-error-600 mt-0.5" />}
                      <div>
                        <Typography variant="body-sm" className="font-medium">
                          {check.message}
                        </Typography>
                        {check.suggestion && (
                          <Typography variant="body-xs" className="text-stone-600 mt-1">
                            {check.suggestion}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Feather className="w-5 h-5 text-earth-600" />
                Refine Your Content
              </CardTitle>
              <CardDescription>
                Edit and personalize the generated content to perfectly capture your voice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit Content</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                  <Textarea
                    placeholder="Your refined content..."
                    value={editedContent}
                    onChange={(e) => handleContentEdit(e.target.value)}
                    className="min-h-[200px]"
                  />

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{editedContent.length} characters</span>
                    <span>Last updated: just now</span>
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-4 bg-stone-50 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <Typography variant="body-sm" className="font-medium text-stone-800 mb-2">
                            {suggestion.text}
                          </Typography>
                          <Typography variant="body-xs" className="text-stone-600 mb-3">
                            {suggestion.reasoning}
                          </Typography>
                          <div className="space-y-2">
                            {suggestion.improvements.map((improvement, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Target className="w-3 h-3 text-stone-500 mt-0.5 flex-shrink-0" />
                                <Typography variant="body-xs" className="text-stone-600">
                                  {improvement}
                                </Typography>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <Typography variant="body-xs" className="text-stone-500">
                            Authenticity: {suggestion.authenticity}%
                          </Typography>
                          <Typography variant="body-xs" className="text-stone-500">
                            Cultural: {suggestion.culturalSensitivity}%
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('interview')}
            >
              Back to Interview
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('review')}
              >
                Preview
              </Button>
              <Button
                onClick={handleSave}
                className="bg-success-600 hover:bg-success-700"
              >
                Save Content
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-sage-600" />
              Final Review
            </CardTitle>
            <CardDescription>
              Review your content as it will appear on your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Preview */}
              <div className="p-6 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
                <Typography variant="body-md" className="text-stone-800 leading-relaxed">
                  {editedContent}
                </Typography>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Typography variant="body-sm" className="font-medium text-stone-700">
                    Content Quality
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Progress value={authenticityScore} className="flex-1 h-2" />
                    <Typography variant="body-xs" className="text-stone-600">
                      {authenticityScore}%
                    </Typography>
                  </div>
                </div>
                <div className="space-y-2">
                  <Typography variant="body-sm" className="font-medium text-stone-700">
                    Content Source
                  </Typography>
                  <Badge variant="outline" className="text-earth-700 border-earth-300">
                    <Heart className="w-3 h-3 mr-1" />
                    AI-Assisted Authentic
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('refine')}
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-success-600 hover:bg-success-700"
                >
                  Publish Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}