'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, Gift, Clock } from 'lucide-react'

interface InvestmentInputProps {
  data: {
    monetary: number
    in_kind: number
    volunteer_hours: number
    volunteer_rate: number
  }
  onChange: (data: any) => void
}

export function InvestmentInput({ data, onChange }: InvestmentInputProps) {
  const handleChange = (field: string, value: number) => {
    onChange({ ...data, [field]: value })
  }

  const totalInvestment =
    data.monetary + data.in_kind + (data.volunteer_hours * data.volunteer_rate)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Monetary Investment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monetary">Total Monetary Investment ($)</Label>
            <Input
              id="monetary"
              type="number"
              value={data.monetary || ''}
              onChange={(e) => handleChange('monetary', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Direct funding, grants, donations
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            In-Kind Contributions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="in_kind">Total In-Kind Value ($)</Label>
            <Input
              id="in_kind"
              type="number"
              value={data.in_kind || ''}
              onChange={(e) => handleChange('in_kind', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Equipment, space, materials, services donated
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Volunteer Contribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="volunteer_hours">Volunteer Hours</Label>
              <Input
                id="volunteer_hours"
                type="number"
                value={data.volunteer_hours || ''}
                onChange={(e) => handleChange('volunteer_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="volunteer_rate">Hourly Rate ($)</Label>
              <Input
                id="volunteer_rate"
                type="number"
                value={data.volunteer_rate || 25}
                onChange={(e) => handleChange('volunteer_rate', parseFloat(e.target.value) || 25)}
                placeholder="25"
                className="mt-2"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-sm text-gray-600">Volunteer Value:</p>
            <p className="text-xl font-bold text-gray-900">
              ${(data.volunteer_hours * data.volunteer_rate).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Investment</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                ${totalInvestment.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-sm text-purple-700">
              <div>Monetary: ${data.monetary.toLocaleString()}</div>
              <div>In-Kind: ${data.in_kind.toLocaleString()}</div>
              <div>Volunteer: ${(data.volunteer_hours * data.volunteer_rate).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
