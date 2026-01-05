'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Check, X, Sparkles } from 'lucide-react'

interface ThemeExtractorProps {
  organizationId: string
  storyId?: string
}

interface ExtractedTheme {
  id: string
  theme_name: string
  confidence_score: number
  status: 'suggested' | 'approved' | 'rejected'
  evidence_text: string
  reasoning: string
}

export function ThemeExtractor({ organizationId, storyId }: ThemeExtractorProps) {
  const [themes, setThemes] = useState<ExtractedTheme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])

  useEffect(() => {
    loadThemes()
  }, [organizationId, storyId])

  const loadThemes = async () => {
    setIsLoading(true)
    try {
      const url = storyId
        ? `/api/ai/themes/suggestions/${storyId}`
        : `/api/ai/themes?organizationId=${organizationId}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes || [])
      }
    } catch (err) {
      console.error('Error loading themes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (selectedThemes.length === 0) return

    try {
      const response = await fetch('/api/ai/themes/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          themeIds: selectedThemes
        })
      })

      if (response.ok) {
        alert(`${selectedThemes.length} themes approved!`)
        setSelectedThemes([])
        loadThemes()
      }
    } catch (err) {
      console.error('Error approving themes:', err)
      alert('Failed to approve themes')
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800'
    if (score >= 0.6) return 'bg-amber-100 text-amber-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Extracted Themes
            </CardTitle>
            {selectedThemes.length > 0 && (
              <Button onClick={handleApprove}>
                <Check className="h-4 w-4 mr-2" />
                Approve {selectedThemes.length} Theme{selectedThemes.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading themes...</div>
          ) : themes.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No themes extracted yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Run theme extraction to generate AI-suggested themes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  {theme.status === 'suggested' && (
                    <Checkbox
                      checked={selectedThemes.includes(theme.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedThemes([...selectedThemes, theme.id])
                        } else {
                          setSelectedThemes(selectedThemes.filter(id => id !== theme.id))
                        }
                      }}
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{theme.theme_name}</h4>
                      <Badge className={getConfidenceColor(theme.confidence_score)}>
                        {Math.round(theme.confidence_score * 100)}% confidence
                      </Badge>
                      {theme.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{theme.reasoning}</p>

                    {theme.evidence_text && (
                      <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 italic">
                        "{theme.evidence_text}"
                      </div>
                    )}
                  </div>

                  {theme.status === 'suggested' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
