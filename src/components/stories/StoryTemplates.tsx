'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import {
  BookOpen,
  Heart,
  Users,
  Crown,
  Briefcase,
  Clock,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Info,
  Shield,
  AlertTriangle
} from 'lucide-react'

export interface StoryTemplate {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'personal' | 'family' | 'community' | 'cultural' | 'professional' | 'historical' | 'educational' | 'healing'
  culturalSensitivity: 'standard' | 'medium' | 'high' | 'restricted'
  prompts: {
    title: string
    placeholder: string
    guidance: string
    culturalNote?: string
  }[]
  structure: string[]
  culturalGuidelines: string[]
  exampleContent: string
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'personal-journey',
    title: 'Personal Journey',
    description: 'Share your life experiences, challenges overcome, and lessons learned',
    icon: BookOpen,
    category: 'personal',
    culturalSensitivity: 'standard',
    prompts: [
      {
        title: 'Opening - Setting the Scene',
        placeholder: 'Where and when does your story begin? What was your situation?',
        guidance: 'Start by grounding your reader in time and place. Help them understand your starting point.'
      },
      {
        title: 'The Challenge or Turning Point',
        placeholder: 'What challenge did you face? What changed in your life?',
        guidance: 'Every good story has conflict or change. What was the central challenge or moment that defines this journey?'
      },
      {
        title: 'Your Response and Actions',
        placeholder: 'How did you respond? What steps did you take?',
        guidance: 'Show your agency. What decisions did you make? What actions did you take? Include both successes and setbacks.'
      },
      {
        title: 'The Outcome and Reflection',
        placeholder: 'How did things turn out? What did you learn?',
        guidance: 'Reflect on the results and the wisdom you gained. What would you tell someone facing a similar situation?'
      }
    ],
    structure: [
      'Opening - Set the scene and context',
      'Challenge - Describe the central conflict or change',
      'Journey - Detail your response and actions taken',
      'Resolution - Share outcomes and lessons learned'
    ],
    culturalGuidelines: [
      'Be authentic to your own experience',
      'Consider how your story might inspire others',
      'Respect privacy of others mentioned in your story'
    ],
    exampleContent: 'When I first moved to this new city, I felt completely lost and disconnected from everything I knew...'
  },
  {
    id: 'family-heritage',
    title: 'Family Heritage & Traditions',
    description: 'Preserve and share family history, traditions, and generational wisdom',
    icon: Heart,
    category: 'family',
    culturalSensitivity: 'medium',
    prompts: [
      {
        title: 'Family Background',
        placeholder: 'Tell us about your family origins, traditions, or the family member this story focuses on',
        guidance: 'Provide context about your family background. Who are the key people in this story?'
      },
      {
        title: 'The Tradition or Story',
        placeholder: 'What tradition, story, or wisdom has been passed down in your family?',
        guidance: 'Describe the specific tradition, story, or piece of wisdom. How was it shared with you?'
      },
      {
        title: 'Personal Connection',
        placeholder: 'How has this family heritage shaped you or your understanding?',
        guidance: 'Make it personal. How does this family tradition or story connect to your life today?'
      },
      {
        title: 'Passing It Forward',
        placeholder: 'How are you keeping this tradition alive or sharing this wisdom?',
        guidance: 'Consider how you\'re preserving or adapting this heritage for future generations.'
      }
    ],
    structure: [
      'Family Context - Introduce the family background',
      'Heritage Detail - Describe the tradition or story',
      'Personal Impact - Explain your connection to it',
      'Continuation - How you\'re preserving or sharing it'
    ],
    culturalGuidelines: [
      'Honor the privacy and dignity of family members',
      'Be respectful of family traditions and their significance',
      'Consider seeking permission from elders before sharing certain stories'
    ],
    exampleContent: 'Every Sunday, my grandmother would gather us around her kitchen table and tell us stories about our ancestors who came to this land...'
  },
  {
    id: 'cultural-tradition',
    title: 'Cultural Tradition & Wisdom',
    description: 'Share traditional knowledge, cultural practices, and ancestral wisdom',
    icon: Crown,
    category: 'cultural',
    culturalSensitivity: 'high',
    prompts: [
      {
        title: 'Cultural Context',
        placeholder: 'What is your cultural background and connection to this tradition?',
        guidance: 'Establish your relationship to the culture and tradition you\'re sharing.',
        culturalNote: 'Ensure you have proper authority or permission to share this cultural knowledge.'
      },
      {
        title: 'The Tradition or Practice',
        placeholder: 'Describe the cultural tradition, ceremony, or practice',
        guidance: 'Provide respectful detail about the tradition. What makes it significant?',
        culturalNote: 'Some cultural practices may be sacred or restricted. Only share what is appropriate to share publicly.'
      },
      {
        title: 'Cultural Significance',
        placeholder: 'What does this tradition mean to your community or culture?',
        guidance: 'Explain the deeper meaning and importance of this tradition within your culture.'
      },
      {
        title: 'Living Heritage',
        placeholder: 'How is this tradition practiced today? How are you involved?',
        guidance: 'Connect the historical tradition to present-day practice and your personal involvement.'
      }
    ],
    structure: [
      'Cultural Authorization - Your connection and right to share',
      'Tradition Description - Respectful explanation of the practice',
      'Cultural Meaning - Significance within the community',
      'Contemporary Practice - How it lives today'
    ],
    culturalGuidelines: [
      'Only share traditions you have authority to share',
      'Respect sacred or ceremonial knowledge that should remain private',
      'Consider consulting with elders or cultural leaders',
      'Acknowledge the source of your knowledge',
      'Be mindful of cultural appropriation vs. cultural sharing'
    ],
    exampleContent: 'In our community, the harvest ceremony has been practiced for hundreds of years. As someone who has been part of this tradition since childhood...'
  },
  {
    id: 'community-story',
    title: 'Community Impact',
    description: 'Share stories about community building, local history, or collective action',
    icon: Users,
    category: 'community',
    culturalSensitivity: 'standard',
    prompts: [
      {
        title: 'Community Setting',
        placeholder: 'What community or place is this story about? When did this take place?',
        guidance: 'Set the scene. Help readers understand the community context and timeframe.'
      },
      {
        title: 'The Issue or Opportunity',
        placeholder: 'What challenge was your community facing, or what opportunity arose?',
        guidance: 'Describe the situation that brought the community together or required collective action.'
      },
      {
        title: 'Community Response',
        placeholder: 'How did the community come together? What actions were taken?',
        guidance: 'Detail how people organised, collaborated, or worked together. Include your role if you were involved.'
      },
      {
        title: 'Impact and Legacy',
        placeholder: 'What was accomplished? How did this change or strengthen the community?',
        guidance: 'Reflect on the outcomes and lasting impact on the community. What can others learn from this example?'
      }
    ],
    structure: [
      'Community Context - Setting and background',
      'Challenge/Opportunity - What needed addressing',
      'Collective Action - How the community responded',
      'Lasting Impact - Results and ongoing effects'
    ],
    culturalGuidelines: [
      'Acknowledge all contributors fairly',
      'Respect diverse perspectives within the community',
      'Be mindful of ongoing community sensitivities'
    ],
    exampleContent: 'When the city announced plans to close our local community centre, our neighborhood knew we had to act...'
  },
  {
    id: 'healing-recovery',
    title: 'Healing & Recovery',
    description: 'Share stories of overcoming challenges, healing, and finding resilience',
    icon: Sparkles,
    category: 'healing',
    culturalSensitivity: 'medium',
    prompts: [
      {
        title: 'The Challenge',
        placeholder: 'What challenge, loss, or difficult period are you sharing about?',
        guidance: 'Share as much as feels comfortable. Focus on what might help others in similar situations.'
      },
      {
        title: 'The Healing Journey',
        placeholder: 'What steps did you take toward healing? Who or what helped you?',
        guidance: 'Describe your process of healing. What resources, people, or practices were important?'
      },
      {
        title: 'Lessons and Growth',
        placeholder: 'What did you learn about yourself, life, or healing through this experience?',
        guidance: 'Reflect on the wisdom you gained. How are you different now than when you started?'
      },
      {
        title: 'Message of Hope',
        placeholder: 'What would you want others facing similar challenges to know?',
        guidance: 'Offer encouragement or practical advice based on your experience.'
      }
    ],
    structure: [
      'Challenge Description - The difficulty faced',
      'Healing Process - Steps taken toward recovery',
      'Personal Growth - Lessons learned and changes',
      'Hope and Guidance - Message for others'
    ],
    culturalGuidelines: [
      'Only share what feels comfortable and safe',
      'Consider the impact on family members or others involved',
      'Include content warnings if discussing sensitive topics',
      'Focus on empowerment and hope rather than trauma details'
    ],
    exampleContent: 'After losing my job and facing financial hardship, I felt like my whole world had collapsed. But through this difficult time, I discovered...'
  },
  {
    id: 'professional-journey',
    title: 'Professional Journey',
    description: 'Share career experiences, professional development, and workplace insights',
    icon: Briefcase,
    category: 'professional',
    culturalSensitivity: 'standard',
    prompts: [
      {
        title: 'Career Context',
        placeholder: 'What field or industry is this story about? What was your role or position?',
        guidance: 'Provide professional context. Help readers understand your work environment and responsibilities.'
      },
      {
        title: 'The Professional Challenge',
        placeholder: 'What professional challenge, opportunity, or turning point occurred?',
        guidance: 'Describe the key professional situation or decision that defines this story.'
      },
      {
        title: 'Your Approach and Actions',
        placeholder: 'How did you handle the situation? What strategies did you use?',
        guidance: 'Detail your professional response. What skills, resources, or relationships did you leverage?'
      },
      {
        title: 'Professional Impact and Learning',
        placeholder: 'What were the results? What did you learn about leadership, teamwork, or your industry?',
        guidance: 'Reflect on outcomes and professional growth. What advice would you give to others in similar situations?'
      }
    ],
    structure: [
      'Professional Setting - Context and role',
      'Challenge/Opportunity - Key situation faced',
      'Professional Response - Actions and strategies used',
      'Career Impact - Results and lessons learned'
    ],
    culturalGuidelines: [
      'Respect confidentiality and professional ethics',
      'Avoid sharing proprietary or sensitive business information',
      'Be fair to colleagues and employers when mentioned'
    ],
    exampleContent: 'When I was promoted to team leader for the first time, I quickly realised that technical skills alone wouldn\'t be enough...'
  }
]

interface StoryTemplatesProps {
  onSelectTemplate: (template: StoryTemplate) => void
  selectedTemplate?: string
}

export function StoryTemplates({ onSelectTemplate, selectedTemplate }: StoryTemplatesProps) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  const getSensitivityIcon = (level: string) => {
    switch (level) {
      case 'high':
      case 'restricted':
        return <Shield className="w-4 h-4 text-red-500" />
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <BookOpen className="w-4 h-4 text-green-500" />
    }
  }

  const getSensitivityLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'High Cultural Sensitivity'
      case 'restricted':
        return 'Restricted - Elder Approval Required'
      case 'medium':
        return 'Medium Cultural Sensitivity'
      default:
        return 'Standard Sensitivity'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Typography variant="h2" className="text-2xl font-semibold">
          Choose a Story Template
        </Typography>
        <Typography variant="body1" className="text-grey-600 max-w-2xl mx-auto">
          Select a template to guide your storytelling with culturally respectful prompts and structure
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STORY_TEMPLATES.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id
          const isExpanded = expandedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={cn(
                "relative transition-all duration-200 cursor-pointer hover:shadow-lg",
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-blue-500 text-white" : "bg-grey-100 text-grey-600"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <Typography variant="h3" className="font-semibold">
                        {template.title}
                      </Typography>
                      <div className="flex items-center space-x-2 mt-1">
                        {getSensitivityIcon(template.culturalSensitivity)}
                        <Typography variant="caption" className="text-xs">
                          {getSensitivityLabel(template.culturalSensitivity)}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                    className="p-1"
                  >
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded ? "rotate-90" : ""
                    )} />
                  </Button>
                </div>

                {/* Description */}
                <Typography variant="body2" className="text-grey-600 mb-4">
                  {template.description}
                </Typography>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-4 mt-6 pt-4 border-t">
                    {/* Structure */}
                    <div>
                      <Typography variant="subtitle2" className="font-medium mb-2">
                        Story Structure:
                      </Typography>
                      <ul className="space-y-1">
                        {template.structure.map((step, index) => (
                          <li key={index} className="text-sm text-grey-600 flex items-start">
                            <span className="w-5 h-5 rounded-full bg-grey-200 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cultural Guidelines */}
                    {template.culturalGuidelines.length > 0 && (
                      <div>
                        <Typography variant="subtitle2" className="font-medium mb-2 flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Cultural Guidelines:
                        </Typography>
                        <ul className="space-y-1">
                          {template.culturalGuidelines.map((guideline, index) => (
                            <li key={index} className="text-sm text-grey-600 flex items-start">
                              <span className="w-2 h-2 rounded-full bg-blue-300 mr-2 mt-2 flex-shrink-0"></span>
                              {guideline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Example */}
                    <div>
                      <Typography variant="subtitle2" className="font-medium mb-2">
                        Example Opening:
                      </Typography>
                      <div className="bg-grey-50 p-3 rounded-lg">
                        <Typography variant="body2" className="text-grey-700 italic">
                          "{template.exampleContent}"
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => onSelectTemplate(template)}
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                  >
                    {isSelected ? "Template Selected" : "Use This Template"}
                  </Button>
                </div>
              </div>

              {/* Cultural Sensitivity Warning */}
              {template.culturalSensitivity === 'high' || template.culturalSensitivity === 'restricted' ? (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    {template.culturalSensitivity === 'restricted' ? 'Elder Review' : 'High Sensitivity'}
                  </Badge>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Utility function for className merging
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}