'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Shield, Info } from 'lucide-react'

interface SacredContentWarningProps {
  protocols: string[]
  onAcknowledge: () => void
}

export function SacredContentWarning({ protocols, onAcknowledge }: SacredContentWarningProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  if (acknowledged) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white">
        <div className="space-y-6">
          {/* Icon & Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#D97757]/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#D97757]" />
              </div>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#2C2C2C]">
              Sacred Content Notice
            </h2>
          </div>

          {/* Message */}
          <div className="space-y-4 text-center">
            <p className="text-lg text-[#2C2C2C]/80 leading-relaxed">
              This story contains sacred cultural knowledge. Please observe the following protocols with respect and mindfulness.
            </p>
          </div>

          {/* Protocols */}
          <div className="bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#2D5F4F]" />
              <h3 className="font-semibold text-[#2C2C2C]">Cultural Protocols</h3>
            </div>
            <ul className="space-y-3">
              {protocols.map((protocol, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-[#2C2C2C]/80"
                >
                  <span className="text-[#D97757] mt-1">•</span>
                  <span>{protocol}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-[#D97757]/10 border border-[#D97757]/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97757] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#2C2C2C]/80 leading-relaxed">
              <p className="font-semibold text-[#2C2C2C] mb-1">
                Important:
              </p>
              <p>
                By continuing, you acknowledge your responsibility to honor these cultural protocols and use this knowledge respectfully.
              </p>
            </div>
          </div>

          {/* Acknowledge Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => {
                setAcknowledged(true)
                onAcknowledge()
              }}
              className="bg-[#D97757] hover:bg-[#D97757]/90 text-white px-8"
            >
              I Understand and Will Honor These Protocols
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-[#2C2C2C]/60 text-center italic pt-4 border-t border-[#2C2C2C]/10">
            This content is shared under OCAP® principles (Ownership, Control, Access, Possession) and Indigenous data sovereignty.
          </p>
        </div>
      </Card>
    </div>
  )
}
