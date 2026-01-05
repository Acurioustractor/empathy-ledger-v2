'use client'

import React from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TerritoryAcknowledgmentProps {
  territory?: string
  peoples?: string[]
  className?: string
}

export function TerritoryAcknowledgment({
  territory,
  peoples,
  className
}: TerritoryAcknowledgmentProps) {
  return (
    <section
      className={cn(
        "bg-[#2D5F4F] text-white py-8 md:py-12",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-[#D4A373]" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">
                Land Acknowledgment
              </h2>

              <div className="text-white/90 leading-relaxed space-y-2">
                {territory && peoples ? (
                  <>
                    <p>
                      We acknowledge that this platform is accessed on the traditional territories of {peoples.join(', ')}.
                    </p>
                    <p>
                      We pay our respects to {peoples.length > 1 ? 'their' : 'the'} Elders past, present, and emerging, and recognize the continuing connection to land, water, and community.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      We acknowledge the Traditional Custodians of the lands on which we work and gather, and pay our respects to Elders past, present, and emerging.
                    </p>
                    <p>
                      We recognize that sovereignty was never ceded, and honor the continuing connection that Indigenous peoples have to their lands, waters, and communities.
                    </p>
                  </>
                )}

                <p className="text-sm text-white/70 pt-2 border-t border-white/20">
                  This platform is built on the principles of OCAP® (Ownership, Control, Access, and Possession) and respects Indigenous data sovereignty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
