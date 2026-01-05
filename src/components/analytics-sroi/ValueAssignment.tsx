'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator } from 'lucide-react'

interface ValueAssignmentProps {
  investment: number
  outcomes: any[]
  onCalculate: () => void
  isCalculating: boolean
}

export function ValueAssignment({ investment, outcomes, onCalculate, isCalculating }: ValueAssignmentProps) {
  const calculateTotalValue = () => {
    return outcomes.reduce((total, outcome) => {
      const value = outcome.quantity * outcome.value
      const deadweightAdjustment = value * ((100 - (outcome.deadweight || 0)) / 100)
      const attributionAdjustment = deadweightAdjustment * ((outcome.attribution || 100) / 100)
      return total + attributionAdjustment
    }, 0)
  }

  const totalValue = calculateTotalValue()
  const sroiRatio = investment > 0 ? (totalValue / investment).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-500" />
            Value Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {outcomes.map((outcome, index) => {
              const rawValue = outcome.quantity * outcome.value
              const adjustedValue = rawValue *
                ((100 - (outcome.deadweight || 0)) / 100) *
                ((outcome.attribution || 100) / 100)

              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">{outcome.label}</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${adjustedValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {outcome.quantity} × ${outcome.value}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Social Value</span>
              <span className="text-2xl font-bold text-purple-600">
                ${totalValue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-700">SROI Ratio</span>
              <span className="text-xl font-bold text-purple-600">
                {sroiRatio}:1
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
