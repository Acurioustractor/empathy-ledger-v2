'use client'

import React from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'

interface ProfessionalCompetency {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  market_value: number;
}

interface SkillsRadarChartProps {
  competencies: ProfessionalCompetency[];
  title?: string;
  description?: string;
  maxSkills?: number;
}

export function SkillsRadarChart({ 
  competencies, 
  title = "Skills Portfolio Radar",
  description = "Visual overview of professional competencies",
  maxSkills = 8 
}: SkillsRadarChartProps) {
  const getSkillLevelNumber = (level: string) => {
    switch (level) {
      case 'expert': return 4
      case 'advanced': return 3
      case 'intermediate': return 2
      case 'beginner': return 1
      default: return 0
    }
  }

  // Prepare radar chart data
  const radarData = competencies.slice(0, maxSkills).map(comp => ({
    skill: comp.skill.length > 15 ? comp.skill.substring(0, 15) + '...' : comp.skill,
    level: getSkillLevelNumber(comp.level),
    marketValue: comp.market_value,
    fullSkill: comp.skill
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0]?.payload?.fullSkill}</p>
          <p className="text-sm text-gray-600">
            Level: {payload[0]?.value === 4 ? 'Expert' : 
                    payload[0]?.value === 3 ? 'Advanced' : 
                    payload[0]?.value === 2 ? 'Intermediate' : 'Beginner'}
          </p>
          <p className="text-sm text-gray-600">
            Market Value: {payload[0]?.payload?.marketValue}/10
          </p>
        </div>
      )
    }
    return null
  }

  if (competencies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-400" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>No skills data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fontSize: 10 }} 
                className="fill-gray-600"
              />
              <PolarRadiusAxis 
                angle={0} 
                domain={[0, 4]} 
                tick={{ fontSize: 8 }} 
                className="fill-gray-500"
              />
              <Radar
                name="Skill Level"
                dataKey="level"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {competencies.length > maxSkills && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Showing top {maxSkills} skills. Total: {competencies.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}