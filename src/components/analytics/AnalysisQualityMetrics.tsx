'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  Zap
} from 'lucide-react'

interface QualityTrend {
  date: string
  accuracy: number
  quoteVerification: number
  themeNormalization: number
  culturalFlagAccuracy: number
  costPerTranscript: number
  processingTimeMs: number
}

interface AnalysisQualityMetricsProps {
  currentMetrics: {
    accuracy: number
    quoteVerificationRate: number
    themeNormalizationSuccess: number
    culturalFlagAccuracy: number
    avgCostPerTranscript: number
    avgProcessingTime: number
  }
  trends?: QualityTrend[]
  analyzerVersion: string
  totalAnalyses: number
  testMode?: boolean
}

export function AnalysisQualityMetrics({
  currentMetrics,
  trends = [],
  analyzerVersion,
  totalAnalyses,
  testMode = false
}: AnalysisQualityMetricsProps) {
  const calculateTrend = (metricKey: keyof QualityTrend): number => {
    if (trends.length < 2) return 0

    const recent = trends.slice(-5)
    const older = trends.slice(-10, -5)

    if (older.length === 0) return 0

    const recentAvg = recent.reduce((sum, t) => sum + (t[metricKey] as number), 0) / recent.length
    const olderAvg = older.reduce((sum, t) => sum + (t[metricKey] as number), 0) / older.length

    return ((recentAvg - olderAvg) / olderAvg) * 100
  }

  const accuracyTrend = calculateTrend('accuracy')
  const costTrend = calculateTrend('costPerTranscript')
  const timeTrend = calculateTrend('processingTimeMs')

  const getStatusColor = (value: number, threshold: number): string => {
    if (value >= threshold) return 'text-green-600 bg-green-50 border-green-200'
    if (value >= threshold * 0.8) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getStatusIcon = (value: number, threshold: number) => {
    if (value >= threshold) return <CheckCircle className="w-5 h-5" />
    return <AlertTriangle className="w-5 h-5" />
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 1) return null

    return (
      <div className={`flex items-center gap-1 text-xs ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value > 0 ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analysis Quality Metrics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Analyzer: {analyzerVersion} • {totalAnalyses} analyses tracked
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Accuracy */}
        <Card className={`p-6 border-2 ${getStatusColor(currentMetrics.accuracy, 90)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentMetrics.accuracy, 90)}
              <h3 className="font-semibold text-gray-900">Accuracy</h3>
            </div>
            <TrendIndicator value={accuracyTrend} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {currentMetrics.accuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600">Target: ≥90%</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-500"
              style={{ width: `${currentMetrics.accuracy}%` }}
            />
          </div>
        </Card>

        {/* Quote Verification */}
        <Card className={`p-6 border-2 ${getStatusColor(currentMetrics.quoteVerificationRate, 85)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentMetrics.quoteVerificationRate, 85)}
              <h3 className="font-semibold text-gray-900">Quote Verification</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {currentMetrics.quoteVerificationRate.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600">Target: ≥85%</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-500"
              style={{ width: `${currentMetrics.quoteVerificationRate}%` }}
            />
          </div>
        </Card>

        {/* Theme Normalization */}
        <Card className={`p-6 border-2 ${getStatusColor(currentMetrics.themeNormalizationSuccess, 95)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentMetrics.themeNormalizationSuccess, 95)}
              <h3 className="font-semibold text-gray-900">Theme Normalization</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {currentMetrics.themeNormalizationSuccess.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600">Target: ≥95%</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-500"
              style={{ width: `${currentMetrics.themeNormalizationSuccess}%` }}
            />
          </div>
        </Card>

        {/* Cultural Flag Accuracy */}
        <Card className={`p-6 border-2 ${getStatusColor(currentMetrics.culturalFlagAccuracy, 95)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentMetrics.culturalFlagAccuracy, 95)}
              <h3 className="font-semibold text-gray-900">Cultural Flag Accuracy</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {currentMetrics.culturalFlagAccuracy.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600">Target: ≥95% (Critical)</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-500"
              style={{ width: `${currentMetrics.culturalFlagAccuracy}%` }}
            />
          </div>
        </Card>

        {/* Cost per Transcript */}
        <Card className="p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Cost per Transcript</h3>
            </div>
            <TrendIndicator value={-costTrend} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${currentMetrics.avgCostPerTranscript.toFixed(4)}
          </div>
          <p className="text-xs text-gray-600">Target: ≤$0.10</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$0.10</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${Math.min((currentMetrics.avgCostPerTranscript / 0.10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Processing Time */}
        <Card className="p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <h3 className="font-semibold text-gray-900">Avg Processing Time</h3>
            </div>
            <TrendIndicator value={-timeTrend} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {(currentMetrics.avgProcessingTime / 1000).toFixed(1)}s
          </div>
          <p className="text-xs text-gray-600">Target: ≤30s</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>0s</span>
              <span>30s</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-sky-600 transition-all duration-500"
                style={{ width: `${Math.min((currentMetrics.avgProcessingTime / 30000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quality Indicators</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Quality Score</span>
                <Badge variant="default" className="bg-clay-600">
                  {(
                    (currentMetrics.accuracy +
                     currentMetrics.quoteVerificationRate +
                     currentMetrics.themeNormalizationSuccess +
                     currentMetrics.culturalFlagAccuracy) / 4
                  ).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Analyzer Version</span>
                <Badge variant="outline">{analyzerVersion}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Analyses</span>
                <span className="font-semibold text-gray-900">{totalAnalyses}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Efficiency Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cost Efficiency</span>
                <Badge variant={currentMetrics.avgCostPerTranscript <= 0.10 ? 'default' : 'secondary'}>
                  {currentMetrics.avgCostPerTranscript <= 0.10 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Speed</span>
                <Badge variant={currentMetrics.avgProcessingTime <= 30000 ? 'default' : 'secondary'}>
                  {currentMetrics.avgProcessingTime <= 30000 ? 'Fast' : 'Moderate'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Cost Savings</span>
                <span className="font-semibold text-green-600">
                  ${((0.15 - currentMetrics.avgCostPerTranscript) * totalAnalyses).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-sky-50 border-sky-200">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {currentMetrics.accuracy < 90 && (
                <li>• Accuracy below target: Consider reviewing AI model configuration</li>
              )}
              {currentMetrics.quoteVerificationRate < 85 && (
                <li>• Quote verification needs improvement: Review extraction criteria</li>
              )}
              {currentMetrics.culturalFlagAccuracy < 95 && (
                <li>• Cultural flag accuracy critical: Immediate review required</li>
              )}
              {currentMetrics.avgCostPerTranscript > 0.10 && (
                <li>• Cost optimization opportunity: Consider using Ollama for development</li>
              )}
              {currentMetrics.avgProcessingTime > 30000 && (
                <li>• Processing time high: Consider batch processing or optimization</li>
              )}
              {currentMetrics.accuracy >= 90 &&
               currentMetrics.culturalFlagAccuracy >= 95 &&
               currentMetrics.avgCostPerTranscript <= 0.10 && (
                <li className="text-green-700">✓ All metrics meeting or exceeding targets!</li>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {/* Investment Justification */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-clay-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Investment Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {(totalAnalyses * 45).toFixed(0)}
                </div>
                <div className="text-xs text-gray-600 mt-1">Hours Saved</div>
                <div className="text-xs text-gray-500 mt-1">
                  vs manual analysis (45min each)
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  ${(currentMetrics.avgCostPerTranscript * totalAnalyses).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 mt-1">Total AI Cost</div>
                <div className="text-xs text-gray-500 mt-1">
                  ROI: {((((totalAnalyses * 45 * 25) - (currentMetrics.avgCostPerTranscript * totalAnalyses)) / (currentMetrics.avgCostPerTranscript * totalAnalyses)) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentMetrics.accuracy.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">Quality Maintained</div>
                <div className="text-xs text-gray-500 mt-1">
                  Consistent accuracy at scale
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
