'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, BookOpen, Users, Languages, Heart } from 'lucide-react'

interface OutcomesSelectorProps {
  data: any[]
  onChange: (data: any[]) => void
  organizationId: string
}

const CULTURAL_OUTCOMES = [
  { id: 'stories_preserved', label: 'Stories Preserved', icon: BookOpen, value: 500, unit: 'story' },
  { id: 'languages_documented', label: 'Languages Documented', icon: Languages, value: 2000, unit: 'language' },
  { id: 'elder_engagement', label: 'Elder Engagement Hours', icon: Users, value: 150, unit: 'hour' },
  { id: 'intergenerational_connections', label: 'Intergenerational Connections', icon: Heart, value: 300, unit: 'connection' },
]

export function OutcomesSelector({ data, onChange, organizationId }: OutcomesSelectorProps) {
  const [selectedOutcomes, setSelectedOutcomes] = useState<any[]>(data)

  const handleToggleOutcome = (outcome: any, checked: boolean) => {
    if (checked) {
      setSelectedOutcomes([...selectedOutcomes, { ...outcome, quantity: 0, deadweight: 0, attribution: 100 }])
    } else {
      setSelectedOutcomes(selectedOutcomes.filter(o => o.id !== outcome.id))
    }
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updated = selectedOutcomes.map(o =>
      o.id === id ? { ...o, quantity } : o
    )
    setSelectedOutcomes(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Cultural Outcomes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CULTURAL_OUTCOMES.map(outcome => {
            const isSelected = selectedOutcomes.some(o => o.id === outcome.id)
            const outcomeData = selectedOutcomes.find(o => o.id === outcome.id)

            return (
              <div key={outcome.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={outcome.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleToggleOutcome(outcome, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={outcome.id} className="flex items-center gap-2 cursor-pointer">
                      <outcome.icon className="h-4 w-4" />
                      {outcome.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Value: ${outcome.value} per {outcome.unit}
                    </p>

                    {isSelected && (
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={outcomeData?.quantity || 0}
                            onChange={(e) => handleUpdateQuantity(outcome.id, parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Deadweight (%)</Label>
                          <Input type="number" defaultValue="0" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Attribution (%)</Label>
                          <Input type="number" defaultValue="100" className="mt-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
