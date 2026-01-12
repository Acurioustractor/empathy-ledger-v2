'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface GrowthRateCalculatorProps {
  theme: {
    theme_name: string
    growth_rate: number
    usage_count: number
  }
}

export function GrowthRateCalculator({ theme }: GrowthRateCalculatorProps) {
  const growthRate = theme.growth_rate
  const isPositive = growthRate > 0
  const isNeutral = growthRate === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Growth Analysis</CardTitle>
        <CardDescription>Change in theme usage over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg">
          <div>
            <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
            <div className="flex items-center gap-2">
              {isNeutral ? (
                <Minus className="w-6 h-6 text-gray-500" />
              ) : isPositive ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-orange-600" />
              )}
              <span className={`text-3xl font-bold ${
                isNeutral ? 'text-gray-900' : isPositive ? 'text-green-600' : 'text-orange-600'
              }`}>
                {isPositive ? '+' : ''}{growthRate}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Current Usage</div>
            <div className="text-2xl font-bold text-gray-900">{theme.usage_count}</div>
            <div className="text-xs text-gray-500 mt-1">total mentions</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            {isNeutral ? (
              <>This theme has maintained stable usage with no significant growth or decline.</>
            ) : isPositive ? (
              <>This theme is trending upward, appearing {Math.abs(growthRate)}% more frequently than the previous period.</>
            ) : (
              <>This theme is appearing {Math.abs(growthRate)}% less frequently than the previous period.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
