'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import ArticleEditor, { Article } from '@/components/articles/ArticleEditor'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const isNew = articleId === 'new'

  const [article, setArticle] = useState<Article | undefined>(undefined)
  const [storytellers, setStorytellers] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  // Fetch article if editing
  useEffect(() => {
    if (!isNew) {
      fetchArticle()
    }
    fetchStorytellers()
  }, [articleId, isNew])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found')
          return
        }
        throw new Error('Failed to fetch article')
      }
      const data = await response.json()
      setArticle(data.article)
    } catch (err) {
      console.error('Error fetching article:', err)
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const fetchStorytellers = async () => {
    try {
      const response = await fetch('/api/admin/storytellers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setStorytellers(data.storytellers?.map((s: any) => ({
          id: s.id,
          name: s.display_name || s.name
        })) || [])
      }
    } catch (err) {
      console.error('Error fetching storytellers:', err)
    }
  }

  // Save article
  const handleSave = async (articleData: Article) => {
    const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${articleId}`
    const method = isNew ? 'POST' : 'PATCH'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })

    if (!response.ok) {
      throw new Error('Failed to save article')
    }

    const data = await response.json()

    // If new article, redirect to edit page
    if (isNew && data.article?.id) {
      router.replace(`/admin/articles/${data.article.id}/edit`)
    }

    setArticle(data.article)
  }

  // Submit for review
  const handleSubmitForReview = async (articleData: Article) => {
    const response = await fetch(`/api/admin/articles/${articleId}/submit-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })

    if (!response.ok) {
      throw new Error('Failed to submit for review')
    }

    const data = await response.json()
    setArticle(data.article)
  }

  // Publish
  const handlePublish = async (articleData: Article) => {
    const response = await fetch(`/api/admin/articles/${articleId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })

    if (!response.ok) {
      throw new Error('Failed to publish')
    }

    const data = await response.json()
    setArticle(data.article)
  }

  // Schedule
  const handleSchedule = async (articleData: Article, date: Date) => {
    const response = await fetch(`/api/admin/articles/${articleId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...articleData, scheduledPublishAt: date.toISOString() })
    })

    if (!response.ok) {
      throw new Error('Failed to schedule')
    }

    const data = await response.json()
    setArticle(data.article)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-500">
        <p className="text-lg font-medium mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push('/admin/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/admin/articles')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Button>

      <ArticleEditor
        article={article}
        onSave={handleSave}
        onPublish={!isNew ? handlePublish : undefined}
        onSubmitForReview={!isNew ? handleSubmitForReview : undefined}
        onSchedule={!isNew ? handleSchedule : undefined}
        availableStorytellers={storytellers}
      />
    </div>
  )
}
