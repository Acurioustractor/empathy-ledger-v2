'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Heart, Users, Leaf, Sun } from 'lucide-react'

interface CulturalThemeExplorerProps {
  organizationId: string
}

const INDIGENOUS_THEMES = [
  { id: '1', name: 'Connection to Land', icon: Leaf, count: 45, color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Healing & Wellness', icon: Heart, count: 38, color: 'bg-rose-100 text-rose-800' },
  { id: '3', name: 'Intergenerational Knowledge', icon: Users, count: 35, color: 'bg-purple-100 text-purple-800' },
  { id: '4', name: 'Language Preservation', icon: BookOpen, count: 28, color: 'bg-sky-100 text-sky-800' },
  { id: '5', name: 'Ceremony & Tradition', icon: Sun, count: 32, color: 'bg-amber-100 text-amber-800' },
]

export function CulturalThemeExplorer({ organizationId }: CulturalThemeExplorerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Explore Cultural Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INDIGENOUS_THEMES.map(theme => (
              <Card key={theme.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${theme.color}`}>
                      <theme.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{theme.name}</h3>
                      <Badge variant="secondary" className="mt-2">
                        {theme.count} stories
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
