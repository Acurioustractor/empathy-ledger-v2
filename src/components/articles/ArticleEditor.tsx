'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Save,
  Eye,
  Send,
  Clock,
  Globe,
  Users,
  Lock,
  AlertTriangle,
  Image as ImageIcon,
  Tag,
  Palette,
  FileText,
  X,
  Plus,
  Loader2,
  CheckCircle,
  Shield,
  Calendar,
  Heart,
  Share2,
  Mail,
  MessageCircle,
  Zap,
  Gift,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface Article {
  id?: string
  title: string
  slug?: string
  subtitle?: string
  content: string
  excerpt?: string
  authorType: 'storyteller' | 'staff' | 'organization' | 'ai_generated' | 'anonymous'
  authorStorytellerId?: string
  authorName?: string
  authorBio?: string
  articleType: ArticleType
  primaryProject?: string
  relatedProjects?: string[]
  tags?: string[]
  themes?: string[]
  status: ArticleStatus
  visibility: 'private' | 'community' | 'public'
  requiresElderReview?: boolean
  elderReviewNotes?: string
  publishedAt?: string
  scheduledPublishAt?: string
  syndicationEnabled?: boolean
  syndicationDestinations?: string[]
  featuredImageId?: string
  featuredImageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export type ArticleType =
  | 'story_feature'
  | 'program_spotlight'
  | 'research_summary'
  | 'community_news'
  | 'editorial'
  | 'impact_report'
  | 'project_update'
  | 'tutorial'

export type ArticleStatus =
  | 'draft'
  | 'in_review'
  | 'elder_review'
  | 'approved'
  | 'published'
  | 'archived'

// CTA Types
export interface CTATemplate {
  id: string
  slug: string
  ctaType: string
  buttonText: string
  description?: string
  icon?: string
  style: string
  urlTemplate?: string
  actionType: string
}

export interface ArticleCTA {
  id: string
  templateId: string
  position: 'start' | 'after_intro' | 'mid' | 'end' | 'floating'
  displayOrder: number
  customButtonText?: string
  customUrl?: string
  template?: CTATemplate
}

type CTAPosition = 'start' | 'after_intro' | 'mid' | 'end' | 'floating'

const CTA_POSITIONS: { value: CTAPosition; label: string; description: string }[] = [
  { value: 'start', label: 'Start', description: 'Before article content' },
  { value: 'after_intro', label: 'After Intro', description: 'After first paragraph' },
  { value: 'mid', label: 'Middle', description: 'Midway through article' },
  { value: 'end', label: 'End', description: 'After article content' },
  { value: 'floating', label: 'Floating', description: 'Fixed sidebar or popup' },
]

const CTA_ICONS: Record<string, React.ReactNode> = {
  heart: <Heart className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  message: <MessageCircle className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
}

const ARTICLE_TYPES: { value: ArticleType; label: string; description: string; icon: React.ReactNode; requiresElderReview: boolean }[] = [
  { value: 'story_feature', label: 'Story Feature', description: 'Featured storyteller narratives', icon: <BookOpen className="h-4 w-4" />, requiresElderReview: true },
  { value: 'program_spotlight', label: 'Program Spotlight', description: 'ACT program highlights', icon: <Palette className="h-4 w-4" />, requiresElderReview: false },
  { value: 'research_summary', label: 'Research Summary', description: 'Research and evidence', icon: <FileText className="h-4 w-4" />, requiresElderReview: false },
  { value: 'community_news', label: 'Community News', description: 'Community updates', icon: <Users className="h-4 w-4" />, requiresElderReview: false },
  { value: 'editorial', label: 'Editorial', description: 'Opinion pieces', icon: <BookOpen className="h-4 w-4" />, requiresElderReview: false },
  { value: 'impact_report', label: 'Impact Report', description: 'Impact narratives', icon: <CheckCircle className="h-4 w-4" />, requiresElderReview: true },
  { value: 'project_update', label: 'Project Update', description: 'Project milestones', icon: <FileText className="h-4 w-4" />, requiresElderReview: false },
  { value: 'tutorial', label: 'Tutorial', description: 'How-to guides', icon: <BookOpen className="h-4 w-4" />, requiresElderReview: false },
]

const ACT_PROJECTS = [
  { value: 'empathy-ledger', label: 'Empathy Ledger' },
  { value: 'justicehub', label: 'JusticeHub' },
  { value: 'act-farm', label: 'ACT Farm' },
  { value: 'harvest', label: 'The Harvest' },
  { value: 'goods', label: 'Goods on Country' },
  { value: 'placemat', label: 'ACT Placemat' },
  { value: 'studio', label: 'ACT Studio' },
]

interface ArticleEditorProps {
  article?: Article
  onSave: (article: Article) => Promise<void>
  onPublish?: (article: Article) => Promise<void>
  onSubmitForReview?: (article: Article) => Promise<void>
  onSchedule?: (article: Article, date: Date) => Promise<void>
  availableStorytellers?: Array<{ id: string; name: string }>
  className?: string
  // CTA props
  articleId?: string
  onLoadCTAs?: () => Promise<ArticleCTA[]>
  onLoadTemplates?: () => Promise<CTATemplate[]>
  onAddCTA?: (cta: { templateId: string; position: CTAPosition; customButtonText?: string; customUrl?: string }) => Promise<ArticleCTA>
  onRemoveCTA?: (ctaId: string) => Promise<void>
}

export function ArticleEditor({
  article: initialArticle,
  onSave,
  onPublish,
  onSubmitForReview,
  onSchedule,
  availableStorytellers = [],
  className,
  articleId,
  onLoadCTAs,
  onLoadTemplates,
  onAddCTA,
  onRemoveCTA
}: ArticleEditorProps) {
  // Default article state
  const defaultArticle: Article = {
    title: '',
    content: '',
    excerpt: '',
    authorType: 'staff',
    articleType: 'community_news',
    status: 'draft',
    visibility: 'private',
    syndicationEnabled: true,
    tags: [],
    themes: [],
    relatedProjects: []
  }

  const [article, setArticle] = useState<Article>(initialArticle || defaultArticle)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newTheme, setNewTheme] = useState('')
  const [activeTab, setActiveTab] = useState('content')
  const [showPreview, setShowPreview] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // CTA State
  const [ctas, setCtas] = useState<ArticleCTA[]>([])
  const [ctaTemplates, setCtaTemplates] = useState<CTATemplate[]>([])
  const [loadingCtas, setLoadingCtas] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<CTAPosition>('end')
  const [addingCta, setAddingCta] = useState(false)

  // Track changes
  useEffect(() => {
    if (initialArticle) {
      const hasChanges = JSON.stringify(article) !== JSON.stringify(initialArticle)
      setHasUnsavedChanges(hasChanges)
    } else {
      setHasUnsavedChanges(article.title !== '' || article.content !== '')
    }
  }, [article, initialArticle])

  // Load CTAs and templates when article has an ID
  useEffect(() => {
    if (articleId && onLoadCTAs && onLoadTemplates) {
      const loadData = async () => {
        setLoadingCtas(true)
        try {
          const [ctaData, templateData] = await Promise.all([
            onLoadCTAs(),
            onLoadTemplates()
          ])
          setCtas(ctaData)
          setCtaTemplates(templateData)
        } catch (error) {
          console.error('Failed to load CTAs:', error)
        } finally {
          setLoadingCtas(false)
        }
      }
      loadData()
    }
  }, [articleId, onLoadCTAs, onLoadTemplates])

  // Add CTA handler
  const handleAddCTA = async () => {
    if (!onAddCTA || !selectedTemplateId) return
    setAddingCta(true)
    try {
      const newCta = await onAddCTA({
        templateId: selectedTemplateId,
        position: selectedPosition
      })
      setCtas(prev => [...prev, newCta])
      setSelectedTemplateId('')
    } catch (error) {
      console.error('Failed to add CTA:', error)
    } finally {
      setAddingCta(false)
    }
  }

  // Remove CTA handler
  const handleRemoveCTA = async (ctaId: string) => {
    if (!onRemoveCTA) return
    try {
      await onRemoveCTA(ctaId)
      setCtas(prev => prev.filter(c => c.id !== ctaId))
    } catch (error) {
      console.error('Failed to remove CTA:', error)
    }
  }

  // Update article field
  const updateField = useCallback(<K extends keyof Article>(field: K, value: Article[K]) => {
    setArticle(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle article type change (may trigger elder review requirement)
  const handleTypeChange = (type: ArticleType) => {
    const typeConfig = ARTICLE_TYPES.find(t => t.value === type)
    updateField('articleType', type)
    if (typeConfig?.requiresElderReview) {
      updateField('requiresElderReview', true)
    }
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !article.tags?.includes(newTag.trim())) {
      updateField('tags', [...(article.tags || []), newTag.trim()])
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    updateField('tags', article.tags?.filter(t => t !== tag) || [])
  }

  // Add theme
  const addTheme = () => {
    if (newTheme.trim() && !article.themes?.includes(newTheme.trim())) {
      updateField('themes', [...(article.themes || []), newTheme.trim()])
      setNewTheme('')
    }
  }

  // Remove theme
  const removeTheme = (theme: string) => {
    updateField('themes', article.themes?.filter(t => t !== theme) || [])
  }

  // Save draft
  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ ...article, status: 'draft' })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  // Submit for review
  const handleSubmitForReview = async () => {
    if (!onSubmitForReview) return
    setSaving(true)
    try {
      const newStatus: ArticleStatus = article.requiresElderReview ? 'elder_review' : 'in_review'
      await onSubmitForReview({ ...article, status: newStatus })
      updateField('status', newStatus)
    } catch (error) {
      console.error('Failed to submit:', error)
    } finally {
      setSaving(false)
    }
  }

  // Publish
  const handlePublish = async () => {
    if (!onPublish) return
    setPublishing(true)
    try {
      await onPublish({ ...article, status: 'published', publishedAt: new Date().toISOString() })
      updateField('status', 'published')
      updateField('publishedAt', new Date().toISOString())
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setPublishing(false)
    }
  }

  // Schedule publish
  const handleSchedule = async () => {
    if (!onSchedule || !scheduleDate) return
    setSaving(true)
    try {
      await onSchedule(article, new Date(scheduleDate))
      updateField('scheduledPublishAt', scheduleDate)
      setShowScheduleDialog(false)
    } catch (error) {
      console.error('Failed to schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  // Get visibility icon
  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'public': return <Globe className="h-4 w-4 text-green-600" />
      case 'community': return <Users className="h-4 w-4 text-blue-600" />
      case 'private': return <Lock className="h-4 w-4 text-stone-600" />
      default: return null
    }
  }

  // Get status badge
  const getStatusBadge = (status: ArticleStatus) => {
    const statusConfig: Record<ArticleStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      in_review: { label: 'In Review', variant: 'default', className: 'bg-amber-500' },
      elder_review: { label: 'Elder Review', variant: 'default', className: 'bg-purple-600' },
      approved: { label: 'Approved', variant: 'default', className: 'bg-green-600' },
      published: { label: 'Published', variant: 'default', className: 'bg-sage-600' },
      archived: { label: 'Archived', variant: 'outline' }
    }
    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with status and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-stone-900">
            {article.id ? 'Edit Article' : 'New Article'}
          </h1>
          {getStatusBadge(article.status)}
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          {article.status === 'draft' && onSubmitForReview && (
            <Button variant="outline" onClick={handleSubmitForReview} disabled={saving}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}
          {(article.status === 'approved' || article.status === 'draft') && onPublish && (
            <Button onClick={handlePublish} disabled={publishing} className="bg-sage-600 hover:bg-sage-700">
              {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Elder review alert */}
      {article.requiresElderReview && article.status !== 'published' && (
        <Alert className="border-purple-200 bg-purple-50">
          <Shield className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            This article type requires elder review before publishing. It will be sent to designated elders for approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Main editor tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="ctas">CTAs</TabsTrigger>
          <TabsTrigger value="syndication">Syndication</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter article title..."
                  className="text-lg font-medium"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={article.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Optional subtitle..."
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt || ''}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="Short summary for previews (auto-generated if left blank)..."
                  rows={2}
                />
                <p className="text-xs text-stone-500">
                  {article.excerpt?.length || 0}/200 characters
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={article.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Write your article content here... (Markdown supported)"
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-stone-500">
                  Supports Markdown formatting. {article.content.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Article Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Article Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={article.articleType} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTICLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                          {type.requiresElderReview && (
                            <Shield className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Visibility */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={article.visibility}
                  onValueChange={(v) => updateField('visibility', v as Article['visibility'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Private - Author only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="community">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Community - ACT ecosystem</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Anyone</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Author</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Author Type</Label>
                  <Select
                    value={article.authorType}
                    onValueChange={(v) => updateField('authorType', v as Article['authorType'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="storyteller">Storyteller</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {article.authorType === 'storyteller' && availableStorytellers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Storyteller</Label>
                    <Select
                      value={article.authorStorytellerId || ''}
                      onValueChange={(v) => updateField('authorStorytellerId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose storyteller..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStorytellers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={article.authorName || ''}
                    onChange={(e) => updateField('authorName', e.target.value)}
                    placeholder="Name to display on article..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">ACT Project</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={article.primaryProject || ''}
                  onValueChange={(v) => updateField('primaryProject', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACT_PROJECTS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Themes */}
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Narrative Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.themes?.map(theme => (
                    <Badge key={theme} variant="outline" className="flex items-center gap-1 bg-sage-50 border-sage-200">
                      {theme}
                      <button onClick={() => removeTheme(theme)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="Add theme..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                  />
                  <Button variant="outline" size="sm" onClick={addTheme}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Call-to-Action Buttons
              </CardTitle>
              <CardDescription>
                Add engagement CTAs to encourage reader action - donations, signups, shares, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add CTA Section */}
              {articleId ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>CTA Template</Label>
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a CTA template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ctaTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                {template.icon && CTA_ICONS[template.icon]}
                                <span>{template.buttonText}</span>
                                <span className="text-xs text-stone-500">({template.ctaType})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48 space-y-2">
                      <Label>Position</Label>
                      <Select value={selectedPosition} onValueChange={(v) => setSelectedPosition(v as CTAPosition)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CTA_POSITIONS.map(pos => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddCTA}
                      disabled={!selectedTemplateId || addingCta}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {addingCta ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Add CTA
                    </Button>
                  </div>

                  {/* Current CTAs */}
                  <div className="space-y-3">
                    <Label className="text-base">Current CTAs</Label>
                    {loadingCtas ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                      </div>
                    ) : ctas.length === 0 ? (
                      <div className="text-center py-8 text-stone-500 border-2 border-dashed border-stone-200 rounded-lg">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                        <p>No CTAs added yet</p>
                        <p className="text-sm">Add CTAs to encourage reader engagement</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ctas.map((cta) => (
                          <div
                            key={cta.id}
                            className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-md border border-stone-200">
                                {cta.template?.icon && CTA_ICONS[cta.template.icon]}
                              </div>
                              <div>
                                <p className="font-medium text-stone-900">
                                  {cta.customButtonText || cta.template?.buttonText}
                                </p>
                                <p className="text-sm text-stone-500">
                                  {cta.template?.ctaType} · Position: {CTA_POSITIONS.find(p => p.value === cta.position)?.label}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {cta.template?.style || 'default'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCTA(cta.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save your article first to add CTAs. CTAs are linked to saved articles.
                  </AlertDescription>
                </Alert>
              )}

              {/* CTA Best Practices */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-stone-700 mb-2">CTA Best Practices</h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Place primary CTAs at the end of articles for highest conversion</li>
                  <li>• Use "after intro" for urgent calls-to-action</li>
                  <li>• Limit to 2-3 CTAs per article to avoid overwhelming readers</li>
                  <li>• Match CTA style to article tone (primary for impact pieces, secondary for informational)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndication Tab */}
        <TabsContent value="syndication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-earth-600" />
                Syndication Settings
              </CardTitle>
              <CardDescription>
                Control how this article is distributed across the ACT ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Syndication</Label>
                  <p className="text-sm text-stone-500">
                    Allow this article to be accessed by other ACT projects via API
                  </p>
                </div>
                <Switch
                  checked={article.syndicationEnabled}
                  onCheckedChange={(checked) => updateField('syndicationEnabled', checked)}
                />
              </div>

              {article.syndicationEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Target ACT Sites</Label>
                    <p className="text-sm text-stone-500 mt-1">
                      Select which ACT ecosystem sites should receive this article
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { slug: 'justicehub', name: 'JusticeHub', description: 'Youth justice stories' },
                      { slug: 'act_farm', name: 'ACT Farm', description: 'Agricultural content' },
                      { slug: 'harvest', name: 'The Harvest', description: 'Food systems' },
                      { slug: 'goods', name: 'GOODS', description: 'Community goods' },
                      { slug: 'placemat', name: 'Placemat', description: 'Place-based stories' },
                      { slug: 'studio', name: 'Studio', description: 'Creative content' }
                    ].map(site => (
                      <label
                        key={site.slug}
                        className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={article.syndicationDestinations?.includes(site.slug)}
                          onChange={(e) => {
                            const destinations = article.syndicationDestinations || []
                            if (e.target.checked) {
                              updateField('syndicationDestinations', [...destinations, site.slug])
                            } else {
                              updateField('syndicationDestinations', destinations.filter(d => d !== site.slug))
                            }
                          }}
                          className="mt-1 rounded border-stone-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{site.name}</div>
                          <div className="text-xs text-stone-500">{site.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {article.syndicationDestinations && article.syndicationDestinations.length > 0 && (
                    <div className="text-sm text-stone-600">
                      ✓ Selected {article.syndicationDestinations.length} site{article.syndicationDestinations.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize how this article appears in search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={article.metaTitle || ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder={article.title || 'Enter meta title...'}
                />
                <p className="text-xs text-stone-500">
                  {(article.metaTitle || article.title).length}/60 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={article.metaDescription || ''}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder={article.excerpt || 'Enter meta description...'}
                  rows={3}
                />
                <p className="text-xs text-stone-500">
                  {(article.metaDescription || article.excerpt || '').length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
          </DialogHeader>
          <div className="prose prose-stone max-w-none">
            <div className="flex items-center gap-2 mb-2">
              {getVisibilityIcon(article.visibility)}
              {getStatusBadge(article.status)}
            </div>
            <h1>{article.title || 'Untitled'}</h1>
            {article.subtitle && <p className="lead">{article.subtitle}</p>}
            <div className="text-sm text-stone-500 mb-4">
              By {article.authorName || 'Unknown'} | {article.articleType.replace('_', ' ')}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
            <div className="whitespace-pre-wrap">{article.content || 'No content yet...'}</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Publication
            </DialogTitle>
            <DialogDescription>
              Choose when this article should be published
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="scheduleDate">Publish Date & Time</Label>
            <Input
              id="scheduleDate"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={!scheduleDate || saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ArticleEditor
