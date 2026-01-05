'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Search, Clock, Eye, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Draft {
  id: string
  title: string
  excerpt: string
  status: 'draft' | 'published' | 'archived'
  updated_at: string
  created_at: string
}

export function DraftsList() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    try {
      const response = await fetch('/api/stories/drafts')
      if (!response.ok) throw new Error('Failed to load drafts')
      const data = await response.json()
      setDrafts(data.stories || [])
    } catch (error) {
      console.error('Error loading drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#D97757] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#2C2C2C]/60">Loading drafts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">My Drafts</h1>
        <Button onClick={() => router.push('/stories/new')} className="bg-[#D97757]">
          New Story
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drafts..."
          className="pl-10"
        />
      </div>

      {filteredDrafts.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/40" />
          <p className="text-[#2C2C2C]/60 mb-4">
            {searchQuery ? 'No drafts found' : 'No drafts yet. Start writing!'}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push('/stories/new')} className="bg-[#D97757]">
              Create Your First Story
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="p-6 border-2 hover:border-[#D97757] hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(`/stories/${draft.id}/edit`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-serif font-bold text-[#2C2C2C]">
                      {draft.title || 'Untitled Story'}
                    </h3>
                    <Badge variant={draft.status === 'published' ? 'default' : 'secondary'}>
                      {draft.status}
                    </Badge>
                  </div>
                  {draft.excerpt && (
                    <p className="text-sm text-[#2C2C2C]/70 line-clamp-2 mb-3">
                      {draft.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/60">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated {new Date(draft.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/stories/${draft.id}/edit`); }}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
