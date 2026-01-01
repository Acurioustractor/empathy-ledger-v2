'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  Brain,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Edit3,
  Eye,
  Clock
} from 'lucide-react'
import { StoryTemplate, STORY_TEMPLATES } from './StoryTemplates'
import { transcriptAnalyzer, TranscriptAnalysis } from '@/lib/ai/transcript-analyzer'
import { storyGenerator, StoryGenerationOptions } from '@/lib/ai/story-generator'

interface TranscriptImporterProps {
  onStoryCreated: (storyData: any) => void
  onCancel: () => void
}

interface TranscriptSection {
  id: string
  text: string
  startIndex: number
  endIndex: number
  selected: boolean
  templateSection?: string
}

type ImportStep = 'input' | 'analysis' | 'section-selection' | 'story-options' | 'preview'

export function TranscriptImporter({ onStoryCreated, onCancel }: TranscriptImporterProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('input')
  const [transcriptText, setTranscriptText] = useState('')
  const [transcriptTitle, setTranscriptTitle] = useState('')
  const [analysis, setAnalysis] = useState<TranscriptAnalysis | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null)
  const [transcriptSections, setTranscriptSections] = useState<TranscriptSection[]>([])
  const [loading, setLoading] = useState(false)
  const [storyOptions, setStoryOptions] = useState<StoryGenerationOptions>({
    preserveVoice: true,
    enhanceNarrative: false,
    addTransitions: false,
    culturalSensitivity: 'standard',
    tone: 'original',
    length: 'detailed'
  })
  const [generatedStory, setGeneratedStory] = useState<any>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setTranscriptText(content)
        setTranscriptTitle(file.name.replace('.txt', ''))
      }
      reader.readAsText(file)
    }
  }, [])

  const analyzeTranscript = async () => {
    if (!transcriptText.trim()) return

    setLoading(true)
    try {
      // Run AI analysis
      const result = transcriptAnalyzer.analyzeTranscript(transcriptText)
      setAnalysis(result)
      setSelectedTemplate(result.suggestedTemplate)

      // Convert suggested sections to selectable sections
      const sections: TranscriptSection[] = result.suggestedSections.map((section, index) => ({
        id: `section-${index}`,
        text: section.transcriptText,
        startIndex: section.startIndex,
        endIndex: section.endIndex,
        selected: true,
        templateSection: section.templateSection
      }))

      // Add any remaining text as additional sections
      let lastIndex = 0
      const additionalSections: TranscriptSection[] = []

      result.suggestedSections.forEach((section, index) => {
        if (section.startIndex > lastIndex + 50) {
          const gapText = transcriptText.slice(lastIndex, section.startIndex).trim()
          if (gapText.length > 50) {
            additionalSections.push({
              id: `gap-${index}`,
              text: gapText,
              startIndex: lastIndex,
              endIndex: section.startIndex,
              selected: false
            })
          }
        }
        lastIndex = section.endIndex
      })

      const finalText = transcriptText.slice(lastIndex).trim()
      if (finalText.length > 50) {
        additionalSections.push({
          id: 'remaining',
          text: finalText,
          startIndex: lastIndex,
          endIndex: transcriptText.length,
          selected: false
        })
      }

      setTranscriptSections([...sections, ...additionalSections])
      setStoryOptions(prev => ({ ...prev, culturalSensitivity: result.culturalSensitivity }))
      setCurrentStep('analysis')
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyse transcript. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSectionSelection = (sectionId: string) => {
    setTranscriptSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, selected: !section.selected }
          : section
      )
    )
  }

  const generateStory = async () => {
    if (!analysis || !selectedTemplate) return

    setLoading(true)
    try {
      const selectedText = transcriptSections
        .filter(section => section.selected)
        .map(section => section.text)
        .join('\n\n')

      const story = await storyGenerator.generateStoryFromTranscript(
        selectedText,
        analysis,
        storyOptions
      )

      setGeneratedStory({
        title: transcriptTitle || story.title,
        content: story.sections.map(s => s.content).join('\n\n'),
        sections: story.sections,
        metadata: story.metadata,
        culturalGuidance: story.culturalGuidance,
        reviewNotes: story.reviewNotes,
        template: selectedTemplate.id,
        story_type: selectedTemplate.category,
        cultural_sensitivity_level: selectedTemplate.culturalSensitivity
      })

      setCurrentStep('preview')
    } catch (error) {
      console.error('Story generation error:', error)
      alert('Failed to generate story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepProgress = () => {
    const steps = ['input', 'analysis', 'section-selection', 'story-options', 'preview']
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-semibold">
            Import Transcript to Story
          </Typography>
          <Typography variant="body2" className="text-grey-600">
            Transform interviews and recordings into structured stories
          </Typography>
        </div>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="subtitle2" className="font-medium">Import Progress</Typography>
          <Typography variant="caption" className="text-sm text-grey-600">
            Step {['input', 'analysis', 'section-selection', 'story-options', 'preview'].indexOf(currentStep) + 1} of 5
          </Typography>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
      </Card>

      {/* Step 1: Transcript Input */}
      {currentStep === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Transcript Input
            </Typography>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Transcript Title</label>
                <Input
                  value={transcriptTitle}
                  onChange={(e) => setTranscriptTitle(e.target.value)}
                  placeholder="Enter a title for this transcript..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-grey-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Typography variant="caption" className="text-xs text-grey-500">
                  Upload a .txt file or paste text below
                </Typography>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Or Paste Transcript</label>
                <Textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste your transcript text here..."
                  rows={12}
                  className="min-h-[300px]"
                />
                <div className="text-right text-sm text-grey-500 mt-1">
                  {transcriptText.split(' ').filter(word => word.length > 0).length} words
                </div>
              </div>

              <Button
                onClick={analyzeTranscript}
                disabled={!transcriptText.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Transcript...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Transcript
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              How It Works
            </Typography>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-medium">AI Analysis</Typography>
                  <Typography variant="caption" className="text-sm text-grey-600">
                    Our AI analyzes your transcript to identify themes, cultural sensitivity, and suggest the best story template
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-medium">Section Selection</Typography>
                  <Typography variant="caption" className="text-sm text-grey-600">
                    Review and select which parts of the transcript to include in your story
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <Typography variant="subtitle2" className="font-medium">Story Generation</Typography>
                  <Typography variant="caption" className="text-sm text-grey-600">
                    Transform selected text into a structured story with cultural respect and narrative flow
                  </Typography>
                </div>
              </div>
            </div>

            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cultural Sensitivity:</strong> Our AI respects cultural protocols and will flag content requiring elder review or community consultation.
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      )}

      {/* Step 2: Analysis Results */}
      {currentStep === 'analysis' && analysis && (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Analysis Results
            </Typography>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <Typography variant="subtitle2" className="font-medium mb-2">Suggested Template</Typography>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <Typography variant="h4" className="font-semibold">{selectedTemplate?.title}</Typography>
                  <Typography variant="caption" className="text-sm text-grey-600 mt-1">
                    {selectedTemplate?.description}
                  </Typography>
                  <Badge className="mt-2" variant={selectedTemplate?.culturalSensitivity === 'high' ? 'destructive' : 'default'}>
                    {selectedTemplate?.culturalSensitivity} sensitivity
                  </Badge>
                </Card>
              </div>

              <div>
                <Typography variant="subtitle2" className="font-medium mb-2">Key Themes</Typography>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyThemes.map((theme, index) => (
                    <Badge key={index} variant="outline">{theme}</Badge>
                  ))}
                </div>
                <Typography variant="caption" className="text-sm text-grey-600 mt-2">
                  Confidence: {Math.round(analysis.confidence)}%
                </Typography>
              </div>

              <div>
                <Typography variant="subtitle2" className="font-medium mb-2">Metadata</Typography>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span>{analysis.metadata.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Read Time:</span>
                    <span>{analysis.metadata.estimatedReadTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tone:</span>
                    <span className="capitalize">{analysis.metadata.emotionalTone}</span>
                  </div>
                </div>
              </div>
            </div>

            {analysis.culturalSensitivity !== 'standard' && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cultural Review Required:</strong> This content has been flagged as culturally sensitive ({analysis.culturalSensitivity}).
                  Please ensure appropriate community consultation before publication.
                </AlertDescription>
              </Alert>
            )}

            <Typography variant="body2" className="text-grey-600 mt-4">
              {analysis.reasoning}
            </Typography>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('input')}>
                Back to Input
              </Button>
              <Button onClick={() => setCurrentStep('section-selection')}>
                Continue to Section Selection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Section Selection */}
      {currentStep === 'section-selection' && (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Select Transcript Sections
            </Typography>

            <Typography variant="body2" className="text-grey-600 mb-6">
              Choose which parts of your transcript to include in the story. Selected sections will be transformed according to the {selectedTemplate?.title} template.
            </Typography>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transcriptSections.map((section, index) => (
                <Card key={section.id} className={`p-4 cursor-pointer transition-colours ${section.selected ? 'bg-blue-50 border-blue-300' : 'hover:bg-grey-50'}`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={section.selected}
                      onChange={() => toggleSectionSelection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Typography variant="subtitle2" className="font-medium">
                          Section {index + 1}
                          {section.templateSection && (
                            <Badge variant="outline" className="ml-2">{section.templateSection}</Badge>
                          )}
                        </Typography>
                        <Typography variant="caption" className="text-xs text-grey-500">
                          {section.text.split(' ').length} words
                        </Typography>
                      </div>
                      <Typography variant="body2" className="text-grey-700 text-sm">
                        {section.text.substring(0, 200)}{section.text.length > 200 ? '...' : ''}
                      </Typography>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('analysis')}>
                Back to Analysis
              </Button>
              <div className="flex items-center space-x-2">
                <Typography variant="caption" className="text-sm text-grey-600">
                  {transcriptSections.filter(s => s.selected).length} sections selected
                </Typography>
                <Button
                  onClick={() => setCurrentStep('story-options')}
                  disabled={transcriptSections.filter(s => s.selected).length === 0}
                >
                  Configure Story Options
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 4: Story Options */}
      {currentStep === 'story-options' && (
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Story Generation Options
            </Typography>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Typography variant="subtitle2" className="font-medium">Voice & Style</Typography>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storyOptions.preserveVoice}
                      onChange={(e) => setStoryOptions(prev => ({ ...prev, preserveVoice: e.target.checked }))}
                    />
                    <span className="text-sm">Preserve original voice and language patterns</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storyOptions.enhanceNarrative}
                      onChange={(e) => setStoryOptions(prev => ({ ...prev, enhanceNarrative: e.target.checked }))}
                    />
                    <span className="text-sm">Enhance narrative flow and readability</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storyOptions.addTransitions}
                      onChange={(e) => setStoryOptions(prev => ({ ...prev, addTransitions: e.target.checked }))}
                    />
                    <span className="text-sm">Add smooth transitions between sections</span>
                  </label>
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-medium mb-2">Tone</Typography>
                  <select
                    value={storyOptions.tone}
                    onChange={(e) => setStoryOptions(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="original">Keep Original Tone</option>
                    <option value="formal">More Formal</option>
                    <option value="conversational">More Conversational</option>
                    <option value="reflective">More Reflective</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Typography variant="subtitle2" className="font-medium mb-2">Length</Typography>
                  <select
                    value={storyOptions.length}
                    onChange={(e) => setStoryOptions(prev => ({ ...prev, length: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="concise">Concise - Remove filler words</option>
                    <option value="detailed">Detailed - Keep most content</option>
                    <option value="comprehensive">Comprehensive - Add context</option>
                  </select>
                </div>

                <div>
                  <Typography variant="subtitle2" className="font-medium mb-2">Cultural Sensitivity</Typography>
                  <select
                    value={storyOptions.culturalSensitivity}
                    onChange={(e) => setStoryOptions(prev => ({ ...prev, culturalSensitivity: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    disabled
                  >
                    <option value={storyOptions.culturalSensitivity}>
                      {storyOptions.culturalSensitivity} (Auto-detected)
                    </option>
                  </select>
                  <Typography variant="caption" className="text-xs text-grey-500">
                    Cultural sensitivity level was automatically determined from transcript analysis
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('section-selection')}>
                Back to Sections
              </Button>
              <Button onClick={generateStory} disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    Generate Story
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 5: Story Preview */}
      {currentStep === 'preview' && generatedStory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h3" className="text-lg font-semibold">Story Preview</Typography>
              <Typography variant="body2" className="text-grey-600">
                Review your generated story before saving
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setCurrentStep('story-options')}>
                Back to Options
              </Button>
              <Button onClick={() => onStoryCreated(generatedStory)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Story
              </Button>
            </div>
          </div>

          <Card className="p-8">
            <article className="prose prose-lg max-w-none">
              <h1 className="text-3xl font-bold mb-6">{generatedStory.title}</h1>

              {generatedStory.sections?.map((section: any, index: number) => (
                section.content.trim() && (
                  <div key={index} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-grey-800">
                      {section.title}
                    </h2>
                    <div className="whitespace-pre-wrap text-grey-700 leading-relaxed">
                      {section.content}
                    </div>
                    {section.suggestions?.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-300">
                        <Typography variant="caption" className="text-xs text-yellow-800 font-medium">
                          Suggestions:
                        </Typography>
                        <ul className="text-xs text-yellow-700 mt-1">
                          {section.suggestions.map((suggestion: string, i: number) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              ))}
            </article>
          </Card>

          {/* Story Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <Typography variant="subtitle2" className="font-medium mb-2">Story Metrics</Typography>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Original words:</span>
                  <span>{generatedStory.metadata?.originalWordCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated words:</span>
                  <span>{generatedStory.metadata?.generatedWordCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reading time:</span>
                  <span>{generatedStory.metadata?.readingTime || 0} min</span>
                </div>
              </div>
            </Card>

            {generatedStory.culturalGuidance?.length > 0 && (
              <Card className="p-4">
                <Typography variant="subtitle2" className="font-medium mb-2">Cultural Guidance</Typography>
                <ul className="space-y-1">
                  {generatedStory.culturalGuidance.map((guidance: string, index: number) => (
                    <li key={index} className="text-xs text-grey-600 flex items-start">
                      <span className="w-2 h-2 rounded-full bg-orange-300 mr-2 mt-1.5 flex-shrink-0"></span>
                      {guidance}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {generatedStory.reviewNotes?.length > 0 && (
              <Card className="p-4">
                <Typography variant="subtitle2" className="font-medium mb-2">Review Notes</Typography>
                <ul className="space-y-1">
                  {generatedStory.reviewNotes.map((note: string, index: number) => (
                    <li key={index} className="text-xs text-grey-600 flex items-start">
                      <span className="w-2 h-2 rounded-full bg-blue-300 mr-2 mt-1.5 flex-shrink-0"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}