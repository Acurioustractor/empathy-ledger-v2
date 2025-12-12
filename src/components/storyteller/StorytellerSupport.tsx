'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  HelpCircle,
  BookOpen,
  Shield,
  Users,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle,
  Sparkles,
  Eye,
  Share2,
  Bell,
  Lock,
  Globe,
  Mic,
  Camera,
  FileText,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

interface StorytellerSupportProps {
  variant?: 'full' | 'compact' | 'post-submission'
  storyId?: string
}

export function StorytellerSupport({ variant = 'full', storyId }: StorytellerSupportProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  if (variant === 'post-submission') {
    return <PostSubmissionGuide storyId={storyId} />
  }

  if (variant === 'compact') {
    return <CompactSupport />
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome, Storyteller</CardTitle>
          <CardDescription className="text-base">
            Your stories matter. We're here to help you share them safely and meaningfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Link href="/stories/share">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Share a Story
            </Button>
          </Link>
          <Link href="/storyteller/dashboard">
            <Button variant="outline" size="lg" className="gap-2">
              <BookOpen className="w-5 h-5" />
              My Stories
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickHelpCard
          icon={<Shield className="w-6 h-6 text-green-600" />}
          title="Your Privacy"
          description="You control who sees your story. Always."
          color="bg-green-50"
        />
        <QuickHelpCard
          icon={<Heart className="w-6 h-6 text-pink-600" />}
          title="Cultural Safety"
          description="We respect cultural protocols and sensitivities."
          color="bg-pink-50"
        />
        <QuickHelpCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          title="Community Support"
          description="Connect with other storytellers."
          color="bg-blue-50"
        />
      </div>

      {/* How Story Sharing Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            How Story Sharing Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Step
              number={1}
              title="Share Your Story"
              description="Write, speak, or upload your story. Take as long as you need."
              icon={<FileText className="w-5 h-5" />}
            />
            <Step
              number={2}
              title="Choose Your Privacy"
              description="Decide if your story is private, shared with community, or public."
              icon={<Lock className="w-5 h-5" />}
            />
            <Step
              number={3}
              title="Review (Optional)"
              description="If sharing with external apps, stories may need cultural review."
              icon={<Eye className="w-5 h-5" />}
            />
            <Step
              number={4}
              title="Impact"
              description="See how your story resonates. Update or remove it anytime."
              icon={<Heart className="w-5 h-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FAQItem question="Who can see my story?">
            <p className="mb-2">You have complete control:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Private</strong> - Only you can see it</li>
              <li><strong>Community</strong> - Logged-in members of Empathy Ledger</li>
              <li><strong>Public</strong> - Anyone with the link</li>
            </ul>
            <p className="mt-2">You can change this setting at any time.</p>
          </FAQItem>

          <FAQItem question="Can I edit or delete my story later?">
            Yes, absolutely. You can edit, update, or completely delete your story at any time from your dashboard. Your story, your control.
          </FAQItem>

          <FAQItem question="What about cultural sensitivity?">
            <p className="mb-2">We take cultural protocols seriously:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You can mark stories as culturally sensitive</li>
              <li>Stories can require Elder approval before sharing</li>
              <li>Certain content can be restricted from specific audiences</li>
              <li>We never share without your explicit consent</li>
            </ul>
          </FAQItem>

          <FAQItem question="What are external apps?">
            <p className="mb-2">Other platforms can request to feature stories from Empathy Ledger:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You must explicitly approve each app</li>
              <li>You choose what they can see (full story, summary only, etc.)</li>
              <li>You can revoke access at any time</li>
              <li>We track who accesses your story</li>
            </ul>
          </FAQItem>

          <FAQItem question="Can I tell my story by speaking?">
            Yes! Use the microphone button to record your story. We'll transcribe it for you. You can edit the text afterward if needed.
          </FAQItem>

          <FAQItem question="How do I get help?">
            <ul className="list-disc list-inside space-y-1">
              <li>Contact our support team anytime</li>
              <li>Connect with community moderators</li>
              <li>Reach out to cultural liaisons for sensitive content</li>
              <li>Email: support@empathyledger.org</li>
            </ul>
          </FAQItem>
        </CardContent>
      </Card>

      {/* Story Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Need Inspiration?
          </CardTitle>
          <CardDescription>Here are some prompts to help you get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PromptCard prompt="What's a tradition you want future generations to know about?" />
            <PromptCard prompt="Tell us about someone who shaped who you are today." />
            <PromptCard prompt="What lesson did you learn the hard way?" />
            <PromptCard prompt="Describe a moment that changed your perspective." />
            <PromptCard prompt="What does your community mean to you?" />
            <PromptCard prompt="Share a skill or knowledge passed down to you." />
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">Need Personal Support?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help you share your story safely.</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Post-Submission Guide Component
function PostSubmissionGuide({ storyId }: { storyId?: string }) {
  return (
    <div className="space-y-6 max-w-md mx-auto text-center p-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Your Story is Saved!</h2>
        <p className="text-muted-foreground">
          Thank you for sharing. Here's what happens next:
        </p>
      </div>

      <div className="space-y-4 text-left">
        <NextStep
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          title="Review Your Story"
          description="Visit your dashboard to edit or add more details anytime."
        />
        <NextStep
          icon={<Share2 className="w-5 h-5 text-purple-600" />}
          title="Share Settings"
          description="Adjust who can see your story in your privacy settings."
        />
        <NextStep
          icon={<Bell className="w-5 h-5 text-orange-600" />}
          title="Get Notified"
          description="We'll let you know when people engage with your story."
        />
        <NextStep
          icon={<Heart className="w-5 h-5 text-pink-600" />}
          title="Community"
          description="Connect with others who resonate with your experience."
        />
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Link href="/storyteller/dashboard">
          <Button className="w-full gap-2">
            <BookOpen className="w-4 h-4" />
            Go to My Stories
          </Button>
        </Link>
        <Link href="/stories/share">
          <Button variant="outline" className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Share Another Story
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Compact Support Component
function CompactSupport() {
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Need help?</strong> Your story is automatically saved as you type.
              You can use voice recording by tapping the microphone.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Private by default
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Auto-saved
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Mic className="w-3 h-3 mr-1" />
                Voice supported
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper Components
function QuickHelpCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <Card className={`${color} border-none`}>
      <CardContent className="flex flex-col items-center text-center py-6">
        {icon}
        <h3 className="font-medium mt-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function Step({ number, title, description, icon }: {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-medium">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function NextStep({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function PromptCard({ prompt }: { prompt: string }) {
  return (
    <Link href={`/stories/share?prompt=${encodeURIComponent(prompt)}`}>
      <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
        <p className="text-sm italic">"{prompt}"</p>
      </div>
    </Link>
  )
}

function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors">
        <span className="font-medium text-sm">{question}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 text-sm text-muted-foreground">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default StorytellerSupport
