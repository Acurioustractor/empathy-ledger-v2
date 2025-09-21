'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Mic, 
  User, 
  Wand2, 
  Copy, 
  Save, 
  Eye, 
  RefreshCw,
  Plus,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  Target,
  PenTool,
  Zap,
  ArrowLeft,
  Settings
} from 'lucide-react'

interface Transcript {
  id: string
  title: string
  transcript_content: string
  created_at: string
  storyteller_id: string
  status: string
  word_count: number
  metadata?: {
    themes?: string[]
    topics?: string[]
    key_quotes?: string[]
  }
  storyteller?: {
    display_name: string
    email: string
  }
  organisation?: {
    name: string
    id: string
  }
}

interface AIPersona {
  id: string
  name: string
  description: string
  tone: string
  style: string
  cultural_context: string
  examples: string[]
}

interface StoryDraft {
  title: string
  content: string
  themes: string[]
  cultural_significance: string
  target_audience: string
}

export default function AIStoryCreator() {
  const [selectedTranscripts, setSelectedTranscripts] = useState<string[]>([])
  const [selectedPersona, setSelectedPersona] = useState<string>('')
  const [storyPrompt, setStoryPrompt] = useState('')
  const [storyDraft, setStoryDraft] = useState<StoryDraft | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [organisations, setOrganizations] = useState<{id: string, name: string}[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch transcripts with storyteller and organisation data
        const transcriptsResponse = await fetch('/api/transcripts')
        if (!transcriptsResponse.ok) throw new Error('Failed to load transcripts')
        const transcriptsData = await transcriptsResponse.json()

        // Fetch organizations for filtering
        const organizationsResponse = await fetch('/api/organisations')
        if (!organizationsResponse.ok) throw new Error('Failed to load organisations')
        const organizationsData = await organizationsResponse.json()

        setTranscripts(transcriptsData.transcripts || [])
        setOrganizations(organizationsData.organisations || [])
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
        // Fallback to empty arrays
        setTranscripts([])
        setOrganizations([])
      } finally {
        setLoading(false)
      }
    }

    loadData()

    setPersonas([
      {
        id: 'professional',
        name: 'Professional Narrator',
        description: 'Clear, articulate storytelling with professional tone',
        tone: 'Professional, informative, accessible',
        style: 'Structured narrative with clear progression',
        cultural_context: 'Respectful integration of cultural elements',
        examples: ['Uses clear transitions', 'Focuses on key insights', 'Professional vocabulary']
      },
      {
        id: 'cultural_keeper',
        name: 'Cultural Knowledge Keeper',
        description: 'Deep cultural wisdom with traditional storytelling patterns',
        tone: 'Reverent, wise, connected to tradition',
        style: 'Traditional circular narrative structure',
        cultural_context: 'Deep cultural significance and protocols',
        examples: ['Uses traditional story patterns', 'Incorporates cultural metaphors', 'Honors ancestral wisdom']
      },
      {
        id: 'innovative_bridge',
        name: 'Innovation Bridge-Builder',
        description: 'Connects traditional wisdom with modern innovation',
        tone: 'Forward-thinking, bridge-building, inclusive',
        style: 'Balances tradition and innovation',
        cultural_context: 'Bridges cultural and technological worlds',
        examples: ['Links past and future', 'Technology-aware', 'Solution-focused']
      }
    ])
  }, [])

  const generateStory = async () => {
    if (!selectedPersona || selectedTranscripts.length === 0 || !storyPrompt) {
      alert('Please select transcripts, a persona, and provide a story prompt')
      return
    }

    setIsGenerating(true)
    
    try {
      // Simulate AI generation - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const selectedPersonaData = personas.find(p => p.id === selectedPersona)
      const selectedTranscriptData = transcripts.filter(t => selectedTranscripts.includes(t.id))
      
      setStoryDraft({
        title: `AI-Generated Story: ${storyPrompt}`,
        content: `This is an AI-generated story based on your selected transcripts and the "${selectedPersonaData?.name}" persona.\n\nThe story would incorporate themes from your transcripts: ${selectedTranscriptData.map(t => t.themes.join(', ')).join('; ')}.\n\nThe narrative would follow the ${selectedPersonaData?.style} approach, maintaining a ${selectedPersonaData?.tone} tone throughout.\n\n[This is a demo - actual AI generation would create a full story here based on your transcripts and persona selection.]`,
        themes: selectedTranscriptData.flatMap(t => t.themes),
        cultural_significance: 'Medium - incorporates cultural elements respectfully',
        target_audience: 'General audience with cultural awareness'
      })
    } catch (error) {
      console.error('Error generating story:', error)
      alert('Error generating story. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const filteredTranscripts = transcripts.filter(transcript => {
    // Text search
    const matchesSearch = !searchTerm ||
      transcript.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.transcript_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.storyteller?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.metadata?.themes?.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transcript.metadata?.topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))

    // Organization filter
    const matchesOrganization = !selectedOrganization || selectedOrganization === 'all' ||
      transcript.organisation?.id === selectedOrganization

    // Status filter
    const matchesStatus = !selectedStatus || selectedStatus === 'all' ||
      transcript.status === selectedStatus

    return matchesSearch && matchesOrganization && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-grey-900 mb-2">AI Story Creator</h1>
            <p className="text-grey-600">Create compelling stories using AI with your transcripts and personalized writing personas</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/stories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Creation Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Story Creation Workspace
                </CardTitle>
                <CardDescription>
                  Select your transcripts, choose an AI persona, and let AI help craft your story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Story Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">What story do you want to tell?</label>
                  <Textarea
                    placeholder="Describe the story you want to create... (e.g., 'A story about how traditional knowledge informed my approach to technology innovation')"
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* AI Persona Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Your AI Writing Persona</label>
                  <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a writing persona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map(persona => (
                        <SelectItem key={persona.id} value={persona.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {persona.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPersona && (
                    <div className="p-3 bg-grey-50 rounded-lg">
                      <div className="text-sm">
                        <p className="font-medium mb-1">{personas.find(p => p.id === selectedPersona)?.description}</p>
                        <p className="text-grey-600">Tone: {personas.find(p => p.id === selectedPersona)?.tone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateStory} 
                  disabled={isGenerating || !selectedPersona || selectedTranscripts.length === 0 || !storyPrompt}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Story with AI
                    </>
                  )}
                </Button>

                {/* Generated Story Preview */}
                {storyDraft && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Generated Story Draft</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save as Draft
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input 
                        value={storyDraft.title} 
                        onChange={(e) => setStoryDraft({...storyDraft, title: e.target.value})}
                        className="font-medium"
                      />
                      <Textarea 
                        value={storyDraft.content}
                        onChange={(e) => setStoryDraft({...storyDraft, content: e.target.value})}
                        rows={12}
                        className="resize-none"
                      />
                      
                      {/* Story Metadata */}
                      <div className="flex flex-wrap gap-2">
                        {storyDraft.themes.map(theme => (
                          <Badge key={theme} variant="outline">{theme}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Publish Story
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transcript Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-600" />
                  Your Transcripts
                </CardTitle>
                <CardDescription>
                  Select transcripts to inform your story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      Error: {error}
                    </div>
                  )}

                  {/* Filters */}
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-400" />
                      <Input
                        placeholder="Search transcripts, storytellers, themes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Organization Filter */}
                    <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by organisation..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        {organisations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transcript List */}
                  <ScrollArea className="h-64">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-grey-500">Loading transcripts...</div>
                      </div>
                    ) : filteredTranscripts.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-grey-500">No transcripts found</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTranscripts.map(transcript => (
                          <div
                            key={transcript.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colours ${
                              selectedTranscripts.includes(transcript.id)
                                ? 'bg-green-50 border-green-200'
                                : 'hover:bg-grey-50'
                            }`}
                            onClick={() => {
                              setSelectedTranscripts(prev =>
                                prev.includes(transcript.id)
                                  ? prev.filter(id => id !== transcript.id)
                                  : [...prev, transcript.id]
                              )
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{transcript.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-grey-500">
                                    {new Date(transcript.created_at).toLocaleDateString()}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {transcript.status}
                                  </Badge>
                                  <span className="text-xs text-grey-500">
                                    {transcript.word_count} words
                                  </span>
                                </div>
                                {transcript.storyteller && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    by {transcript.storyteller.display_name || transcript.storyteller.email}
                                  </p>
                                )}
                                {transcript.organisation && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    {transcript.organisation.name}
                                  </p>
                                )}
                                <p className="text-xs text-grey-600 mt-1 line-clamp-2">
                                  {transcript.transcript_content?.substring(0, 100)}...
                                </p>
                              </div>
                              {selectedTranscripts.includes(transcript.id) && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2"></div>
                              )}
                            </div>
                            {transcript.metadata?.themes && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {transcript.metadata.themes.slice(0, 2).map(theme => (
                                  <Badge key={theme} variant="outline" className="text-xs">{theme}</Badge>
                                ))}
                                {transcript.metadata.themes.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{transcript.metadata.themes.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="text-sm text-grey-600">
                    {selectedTranscripts.length} transcript{selectedTranscripts.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Persona Details */}
            {selectedPersona && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Selected Persona
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const persona = personas.find(p => p.id === selectedPersona)
                    return persona ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <h4 className="font-medium">{persona.name}</h4>
                          <p className="text-grey-600">{persona.description}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="font-medium">Writing Style:</p>
                          <p className="text-grey-600">{persona.style}</p>
                        </div>
                        <div>
                          <p className="font-medium">Cultural Integration:</p>
                          <p className="text-grey-600">{persona.cultural_context}</p>
                        </div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Tips for Better Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <ul className="space-y-1 text-grey-600">
                  <li>• Select 2-3 related transcripts for richer context</li>
                  <li>• Choose personas that match your story's purpose</li>
                  <li>• Be specific in your story prompts</li>
                  <li>• Review and edit AI-generated content</li>
                  <li>• Consider cultural sensitivity in your choices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}