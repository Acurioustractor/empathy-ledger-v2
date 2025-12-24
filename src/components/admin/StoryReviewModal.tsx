'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Shield, 
  Heart, 
  Flag, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User,
  Calendar,
  MapPin,
  Tag,
  FileText,
  MessageSquare,
  Clock,
  Edit
} from 'lucide-react'

interface StoryData {
  id: string
  title: string
  content: string
  author: {
    name: string
    id: string
    culturalBackground?: string
    isElder?: boolean
    avatar?: string
  }
  submittedAt: string
  type: 'personal' | 'family' | 'community' | 'cultural'
  tags: string[]
  location?: string
  culturalSensitive: boolean
  requiresElderReview: boolean
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  language: string
  visibility: 'public' | 'community' | 'private' | 'cultural_protocol'
  aiAnalysis?: {
    culturalElements: string[]
    potentialConcerns: string[]
    recommendedActions: string[]
    confidenceScore: number
  }
}

interface ReviewAction {
  type: 'approve' | 'reject' | 'request_changes' | 'escalate_to_elder' | 'flag_content'
  reason: string
  notes: string
  changes_requested?: string[]
  elder_consultation_reason?: string
}

interface StoryReviewModalProps {
  story: StoryData
  children: React.ReactNode
  onReviewComplete: (action: ReviewAction) => void
}

const StoryReviewModal: React.FC<StoryReviewModalProps> = ({ story, children, onReviewComplete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<ReviewAction['type']>('approve')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewReason, setReviewReason] = useState('')
  const [requestedChanges, setRequestedChanges] = useState<string[]>([])

  // Mock story data for demo
  const mockStory: StoryData = {
    id: story.id || '1',
    title: story.title || 'Traditional Healing Practices in My Community',
    content: story.content || `
      Growing up in my grandmother's house, I learned that healing was never just about medicine—it was about community, ceremony, and connection to the land. Every morning, she would gather herbs from our family garden, each plant chosen with intention and respect.
      
      The white sage grew near the eastern fence, always harvested at dawn when the dew still held the night's prayers. Cedar branches came from the old tree that had watched over our family for three generations. And the sweetgrass, braided with such care, carried the breath of our ancestors.
      
      These weren't just remedies; they were relationships. Grandmother taught me to speak to each plant, to offer tobacco, to never take more than was freely given. "The plants are teachers," she would say, "and we must listen with more than our ears."
      
      When neighbours came seeking help, they knew they weren't just receiving herbs—they were joining a circle of care that stretched back countless generations and forward to children not yet born.
      
      Today, as I tend my own healing garden, I carry these lessons forward, sharing not just the plants, but the protocols, the respect, and the understanding that healing happens in relationship—with the plants, with each other, and with the sacred responsibility to preserve this knowledge for those who come after us.
    `.trim(),
    author: {
      name: 'Maria Santos',
      id: 'user_123',
      culturalBackground: 'Lakota Nation',
      isElder: true,
      avatar: undefined
    },
    submittedAt: '2025-01-06T10:30:00Z',
    type: 'cultural',
    tags: ['traditional-medicine', 'healing', 'ceremony', 'plant-knowledge', 'elder-wisdom', 'cultural-preservation'],
    location: 'Pine Ridge Reservation, South Dakota',
    culturalSensitive: true,
    requiresElderReview: true,
    status: 'pending',
    priority: 'high',
    language: 'English',
    visibility: 'cultural_protocol',
    aiAnalysis: {
      culturalElements: ['Traditional medicine', 'Sacred plants', 'Ceremonial practices', 'Elder knowledge transfer', 'Cultural protocols'],
      potentialConcerns: ['Sacred knowledge sharing', 'Cultural appropriation risk', 'Traditional medicine specifics'],
      recommendedActions: ['Elder review required', 'Cultural protocol verification', 'Sensitivity assessment'],
      confidenceScore: 0.85
    }
  }

  const handleSubmitReview = () => {
    const action: ReviewAction = {
      type: reviewAction,
      reason: reviewReason,
      notes: reviewNotes,
      ...(reviewAction === 'request_changes' && { changes_requested: requestedChanges }),
      ...(reviewAction === 'escalate_to_elder' && { elder_consultation_reason: reviewReason })
    }

    onReviewComplete(action)
    setIsOpen(false)
    
    // Reset form
    setReviewAction('approve')
    setReviewNotes('')
    setReviewReason('')
    setRequestedChanges([])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cultural': return 'bg-clay-100 text-clay-800 dark:bg-clay-900 dark:text-clay-200'
      case 'community': return 'bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200'
      case 'family': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
      case 'personal': return 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200'
      default: return 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
      default: return 'border-l-grey-500 bg-stone-50 dark:bg-grey-950/20'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            Story Review: {mockStory.title}
          </DialogTitle>
          <DialogDescription>
            Review content for cultural safety, community guidelines, and platform standards
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Metadata */}
            <Card className={`border-l-4 ${getPriorityColor(mockStory.priority)}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{mockStory.title}</CardTitle>
                      <Badge className={getTypeColor(mockStory.type)}>
                        {mockStory.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {mockStory.author.name}
                        {mockStory.author.isElder && (
                          <Badge variant="sage-soft" className="text-xs ml-1">
                            <Heart className="w-3 h-3 mr-1" />
                            Elder
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(mockStory.submittedAt).toLocaleDateString()}
                      </div>
                      {mockStory.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {mockStory.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className="text-xs">
                      Priority: {mockStory.priority}
                    </Badge>
                    {mockStory.culturalSensitive && (
                      <Badge variant="sage-soft" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Cultural
                      </Badge>
                    )}
                    {mockStory.requiresElderReview && (
                      <Badge variant="clay-soft" className="text-xs">
                        <Heart className="w-3 h-3 mr-1" />
                        Elder Review
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Cultural Background</Label>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {mockStory.author.culturalBackground || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Story Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockStory.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Visibility Setting</Label>
                  <p className="text-sm text-stone-600 dark:text-stone-400 capitalize">
                    {mockStory.visibility.replace('_', ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Story Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Story Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  {mockStory.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {/* AI Analysis */}
            {mockStory.aiAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Confidence: {Math.round(mockStory.aiAnalysis.confidenceScore * 100)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-green-700 dark:text-green-400">
                      Cultural Elements Detected
                    </Label>
                    <ul className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                      {mockStory.aiAnalysis.culturalElements.map((element, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Potential Concerns
                    </Label>
                    <ul className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                      {mockStory.aiAnalysis.potentialConcerns.map((concern, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-sage-700 dark:text-sage-400">
                      Recommendations
                    </Label>
                    <ul className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                      {mockStory.aiAnalysis.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-sage-500 inline-block" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Review Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Review Action</Label>
                  <Select value={reviewAction} onValueChange={(value) => setReviewAction(value as ReviewAction['type'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Approve
                        </div>
                      </SelectItem>
                      <SelectItem value="request_changes">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4 text-yellow-600" />
                          Request Changes
                        </div>
                      </SelectItem>
                      <SelectItem value="escalate_to_elder">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-clay-600" />
                          Escalate to Elder
                        </div>
                      </SelectItem>
                      <SelectItem value="flag_content">
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-orange-600" />
                          Flag Content
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={reviewReason} onValueChange={setReviewReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meets_guidelines">Meets all guidelines</SelectItem>
                      <SelectItem value="cultural_concerns">Cultural sensitivity concerns</SelectItem>
                      <SelectItem value="inappropriate_content">Inappropriate content</SelectItem>
                      <SelectItem value="requires_elder_guidance">Requires elder guidance</SelectItem>
                      <SelectItem value="privacy_concerns">Privacy concerns</SelectItem>
                      <SelectItem value="factual_accuracy">Factual accuracy issues</SelectItem>
                      <SelectItem value="community_standards">Community standards violation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add detailed notes about your review decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleSubmitReview} 
                className="w-full" 
                disabled={!reviewReason || !reviewNotes.trim()}
              >
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StoryReviewModal