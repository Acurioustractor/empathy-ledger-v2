import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"

export interface ChartDataPoint {
  label: string
  value: number
  colour?: string
  percentage?: number
}

export interface CulturalChartProps {
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  variant?: 'bar' | 'donut' | 'line' | 'cultural'
  className?: string
  showPercentages?: boolean
  showValues?: boolean
}

// Simple Bar Chart with Cultural Styling
const CulturalBarChart: React.FC<CulturalChartProps> = ({
  title,
  subtitle,
  data,
  className,
  showPercentages = true,
  showValues = true
}) => {
  const maxValue = Math.max(...data.map(d => d.value))

  const getBarColor = (index: number) => {
    const colours = [
      'bg-earth-500',
      'bg-sage-500', 
      'bg-clay-500',
      'bg-stone-500',
      'bg-earth-400',
      'bg-sage-400',
      'bg-clay-400',
      'bg-stone-400'
    ]
    return colours[index % colours.length]
  }

  return (
    <div className={cn("bg-white rounded-xl p-6 border border-stone-200 shadow-sm", className)}>
      <div className="mb-6">
        <Typography variant="story-title" className="mb-1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="story-meta" className="text-stone-600">
            {subtitle}
          </Typography>
        )}
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <Typography variant="body-sm" className="font-medium text-stone-700">
                {item.label}
              </Typography>
              <div className="flex items-center gap-2">
                {showValues && (
                  <Typography variant="body-xs" className="text-stone-600">
                    {item.value}
                  </Typography>
                )}
                {showPercentages && item.percentage && (
                  <Typography variant="body-xs" className="text-stone-500">
                    {item.percentage}%
                  </Typography>
                )}
              </div>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3">
              <div
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  getBarColor(index)
                )}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Cultural Theme Distribution (Donut-style)
const CulturalDonutChart: React.FC<CulturalChartProps> = ({
  title,
  subtitle,
  data,
  className
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const getThemeColor = (index: number) => {
    const colours = [
      'border-earth-500',
      'border-sage-500',
      'border-clay-500', 
      'border-stone-500',
      'border-earth-400',
      'border-sage-400'
    ]
    return colours[index % colours.length]
  }

  return (
    <div className={cn("bg-white rounded-xl p-6 border border-stone-200 shadow-sm", className)}>
      <div className="mb-6">
        <Typography variant="story-title" className="mb-1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="story-meta" className="text-stone-600">
            {subtitle}
          </Typography>
        )}
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100)
          return (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div 
                  className={cn(
                    "w-4 h-4 rounded border-2", 
                    getThemeColor(index),
                    getThemeColor(index).replace('border-', 'bg-').replace('-500', '-100').replace('-400', '-100')
                  )}
                />
                <Typography variant="body-sm" className="font-medium text-stone-700">
                  {item.label}
                </Typography>
              </div>
              <div className="flex items-center gap-3">
                <Typography variant="body-xs" className="text-stone-600">
                  {item.value}
                </Typography>
                <Typography variant="body-xs" className="text-stone-500 min-w-[3rem] text-right">
                  {percentage}%
                </Typography>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Total */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <div className="flex justify-between items-center">
          <Typography variant="body-sm" className="font-semibold text-earth-800">
            Total
          </Typography>
          <Typography variant="body-sm" className="font-semibold text-earth-700">
            {total}
          </Typography>
        </div>
      </div>
    </div>
  )
}

// Cultural Timeline/Trend Chart
const CulturalTrendChart: React.FC<{
  title: string
  subtitle?: string
  data: { month: string; stories: number; members: number }[]
  className?: string
}> = ({ title, subtitle, data, className }) => {
  const maxStories = Math.max(...data.map(d => d.stories))
  const maxMembers = Math.max(...data.map(d => d.members))

  return (
    <div className={cn("bg-white rounded-xl p-6 border border-stone-200 shadow-sm", className)}>
      <div className="mb-6">
        <Typography variant="story-title" className="mb-1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="story-meta" className="text-stone-600">
            {subtitle}
          </Typography>
        )}
      </div>

      <div className="space-y-6">
        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-earth-500 rounded-full"></div>
            <Typography variant="body-xs" className="text-stone-600">Stories</Typography>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-sage-500 rounded-full"></div>
            <Typography variant="body-xs" className="text-stone-600">Members</Typography>
          </div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-6 gap-2 h-32">
          {data.map((item, index) => (
            <div key={item.month} className="flex flex-col justify-end items-center gap-2 h-full">
              {/* Bars */}
              <div className="flex items-end gap-1 flex-1 w-full">
                <div
                  className="bg-earth-500 rounded-t w-1/2 opacity-80"
                  style={{ height: `${(item.stories / maxStories) * 100}%` }}
                />
                <div
                  className="bg-sage-500 rounded-t w-1/2 opacity-80"
                  style={{ height: `${(item.members / maxMembers) * 100}%` }}
                />
              </div>
              
              {/* Month Label */}
              <Typography variant="body-xs" className="text-stone-500 text-center">
                {item.month}
              </Typography>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-6 gap-2 text-center">
          {data.map((item, index) => (
            <div key={`values-${item.month}`} className="space-y-1">
              <Typography variant="body-xs" className="text-earth-600">
                {item.stories}
              </Typography>
              <Typography variant="body-xs" className="text-sage-600">
                {item.members}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Cultural Chart Component
const CulturalChart: React.FC<CulturalChartProps> = ({ variant = 'bar', ...props }) => {
  switch (variant) {
    case 'donut':
      return <CulturalDonutChart {...props} />
    case 'bar':
    default:
      return <CulturalBarChart {...props} />
  }
}

export { CulturalChart, CulturalBarChart, CulturalDonutChart, CulturalTrendChart }