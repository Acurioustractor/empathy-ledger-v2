'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryVersion {
  id: string
  version_number: number
  title: string
  content: string
  created_by: {
    full_name: string
  }
  created_at: string
}

interface VersionCompareProps {
  storyId: string
  versionAId: string
  versionBId: string
  onClose: () => void
}

export function VersionCompare({ storyId, versionAId, versionBId, onClose }: VersionCompareProps) {
  const [versionA, setVersionA] = useState<StoryVersion | null>(null)
  const [versionB, setVersionB] = useState<StoryVersion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVersions()
  }, [versionAId, versionBId])

  const loadVersions = async () => {
    try {
      const [responseA, responseB] = await Promise.all([
        fetch(`/api/stories/${storyId}/versions/${versionAId}`),
        fetch(`/api/stories/${storyId}/versions/${versionBId}`)
      ])

      if (!responseA.ok || !responseB.ok) throw new Error('Failed to load versions')

      const [dataA, dataB] = await Promise.all([
        responseA.json(),
        responseB.json()
      ])

      setVersionA(dataA.version)
      setVersionB(dataB.version)
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const stripHTML = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const calculateDiff = () => {
    if (!versionA || !versionB) return { added: 0, removed: 0, unchanged: 0 }

    const textA = stripHTML(versionA.content)
    const textB = stripHTML(versionB.content)
    const wordsA = textA.split(/\s+/)
    const wordsB = textB.split(/\s+/)

    const added = wordsB.length - wordsA.length
    const removed = wordsA.length - wordsB.length

    return {
      added: Math.max(0, added),
      removed: Math.max(0, removed),
      unchanged: Math.min(wordsA.length, wordsB.length)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#D97757]" />
        <p className="text-sm text-[#2C2C2C]/60">Loading comparison...</p>
      </Card>
    )
  }

  if (!versionA || !versionB) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-red-600">Failed to load versions</p>
      </Card>
    )
  }

  const diff = calculateDiff()
  const titleChanged = versionA.title !== versionB.title

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-[#F8F6F1] border-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-bold">Version Comparison</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Version {versionA.version_number}</Badge>
            <span className="text-sm text-[#2C2C2C]/60">
              by {versionA.created_by.full_name}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#2C2C2C]/40" />
          <div className="flex items-center gap-3">
            <Badge variant="outline">Version {versionB.version_number}</Badge>
            <span className="text-sm text-[#2C2C2C]/60">
              by {versionB.created_by.full_name}
            </span>
          </div>
        </div>

        {/* Diff Summary */}
        <div className="mt-4 flex gap-4 text-sm">
          {diff.added > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>{diff.added} words added</span>
            </div>
          )}
          {diff.removed > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>{diff.removed} words removed</span>
            </div>
          )}
          {titleChanged && (
            <Badge variant="outline" className="bg-amber-50">
              Title changed
            </Badge>
          )}
        </div>
      </Card>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Version A */}
        <Card className="border-2">
          <div className="p-4 bg-[#F8F6F1] border-b">
            <Badge variant="outline" className="mb-2">Version {versionA.version_number}</Badge>
            <h4 className="font-serif text-lg font-bold text-[#2C2C2C]">
              {versionA.title || 'Untitled'}
            </h4>
            <p className="text-xs text-[#2C2C2C]/60 mt-1">
              {new Date(versionA.created_at).toLocaleString()}
            </p>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: versionA.content }} />
            </div>
          </ScrollArea>
        </Card>

        {/* Version B */}
        <Card className="border-2">
          <div className="p-4 bg-[#F8F6F1] border-b">
            <Badge variant="outline" className="mb-2">Version {versionB.version_number}</Badge>
            <h4 className="font-serif text-lg font-bold text-[#2C2C2C]">
              {versionB.title || 'Untitled'}
            </h4>
            <p className="text-xs text-[#2C2C2C]/60 mt-1">
              {new Date(versionB.created_at).toLocaleString()}
            </p>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: versionB.content }} />
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
