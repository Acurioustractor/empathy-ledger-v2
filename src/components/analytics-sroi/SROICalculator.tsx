'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, DollarSign, Target, TrendingUp, Save, Download, AlertCircle } from 'lucide-react'
import { InvestmentInput } from './InvestmentInput'
import { OutcomesSelector } from './OutcomesSelector'
import { ValueAssignment } from './ValueAssignment'

interface SROICalculatorProps {
  organizationId: string
  projectId?: string
}

export function SROICalculator({ organizationId, projectId }: SROICalculatorProps) {
  const [currentStep, setCurrentStep] = useState<'investment' | 'outcomes' | 'values'>('investment')
  const [investmentData, setInvestmentData] = useState({
    monetary: 0,
    in_kind: 0,
    volunteer_hours: 0,
    volunteer_rate: 25, // $/hour
  })
  const [outcomesData, setOutcomesData] = useState<any[]>([])
  const [sroiResult, setSroiResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const calculateTotalInvestment = () => {
    return (
      investmentData.monetary +
      investmentData.in_kind +
      (investmentData.volunteer_hours * investmentData.volunteer_rate)
    )
  }

  const handleCalculate = async () => {
    setIsCalculating(true)

    try {
      const response = await fetch('/api/sroi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          projectId,
          investment: {
            monetary: investmentData.monetary,
            in_kind: investmentData.in_kind,
            volunteer_hours_value: investmentData.volunteer_hours * investmentData.volunteer_rate,
            total: calculateTotalInvestment(),
          },
          outcomes: outcomesData,
        }),
      })

      if (!response.ok) {
        throw new Error('SROI calculation failed')
      }

      const result = await response.json()
      setSroiResult(result)
    } catch (err) {
      console.error('SROI calculation error:', err)
      alert('Failed to calculate SROI. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/sroi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          projectId,
          investment: investmentData,
          outcomes: outcomesData,
          result: sroiResult,
        }),
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      alert('SROI calculation saved successfully!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save calculation. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalInvestment = calculateTotalInvestment()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-purple-600" />
            SROI Calculator
          </h2>
          <p className="text-gray-600 mt-1">
            Calculate Social Return on Investment for cultural preservation outcomes
          </p>
        </div>

        {sroiResult && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Calculation'}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        )}
      </div>

      {/* SROI Result Card (if calculated) */}
      {sroiResult && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">SROI Ratio</p>
                <p className="text-4xl font-bold text-purple-900 mt-1">
                  {sroiResult.ratio}:1
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  For every $1 invested, ${sroiResult.ratio} of social value created
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-purple-700">Total Social Value</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  ${sroiResult.total_social_value.toLocaleString()}
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  from ${totalInvestment.toLocaleString()} investment
                </p>
              </div>
            </div>

            {sroiResult.narrative_summary && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-sm text-purple-800">{sroiResult.narrative_summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calculator Tabs */}
      <Tabs value={currentStep} onValueChange={(value: any) => setCurrentStep(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investment" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Investment
          </TabsTrigger>
          <TabsTrigger value="outcomes" className="gap-2">
            <Target className="h-4 w-4" />
            Outcomes
          </TabsTrigger>
          <TabsTrigger value="values" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Value Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="investment" className="space-y-6 mt-6">
          <InvestmentInput
            data={investmentData}
            onChange={setInvestmentData}
          />

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep('outcomes')}>
              Next: Outcomes →
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6 mt-6">
          <OutcomesSelector
            data={outcomesData}
            onChange={setOutcomesData}
            organizationId={organizationId}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('investment')}>
              ← Back: Investment
            </Button>
            <Button onClick={() => setCurrentStep('values')}>
              Next: Value Assignment →
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="values" className="space-y-6 mt-6">
          <ValueAssignment
            investment={totalInvestment}
            outcomes={outcomesData}
            onCalculate={handleCalculate}
            isCalculating={isCalculating}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('outcomes')}>
              ← Back: Outcomes
            </Button>
            <Button
              onClick={handleCalculate}
              disabled={isCalculating || outcomesData.length === 0}
            >
              {isCalculating ? 'Calculating...' : 'Calculate SROI'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Methodology Note */}
      <Card className="border-sky-200 bg-sky-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-sky-600 mt-0.5" />
            <div>
              <p className="font-medium text-sky-900">SROI Methodology</p>
              <p className="text-sm text-sky-700 mt-1">
                This calculator uses conservative financial proxies for cultural outcomes,
                following SROI Network guidelines adapted for Indigenous cultural preservation.
                Values include: story preservation ($500), language documentation ($2,000),
                Elder engagement ($150/hour), intergenerational connection ($300),
                and community cohesion ($1,000/event).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
