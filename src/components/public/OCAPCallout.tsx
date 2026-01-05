'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, Hand, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OCAPCalloutProps {
  className?: string
}

export function OCAPCallout({ className }: OCAPCalloutProps) {
  const principles = [
    {
      icon: Hand,
      letter: 'O',
      title: 'Ownership',
      description: 'Indigenous communities own their cultural knowledge, data, and information.',
      color: 'terracotta'
    },
    {
      icon: Lock,
      letter: 'C',
      title: 'Control',
      description: 'Communities control how their data is collected, used, and disclosed.',
      color: 'forest'
    },
    {
      icon: Eye,
      letter: 'A',
      title: 'Access',
      description: 'Communities have the right to access and manage their own data.',
      color: 'ochre'
    },
    {
      icon: Shield,
      letter: 'P',
      title: 'Possession',
      description: 'Communities possess their data and determine its stewardship.',
      color: 'forest'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'terracotta':
        return {
          bg: 'bg-[#D97757]/10',
          iconBg: 'bg-[#D97757]',
          iconText: 'text-white',
          text: 'text-[#D97757]'
        }
      case 'forest':
        return {
          bg: 'bg-[#2D5F4F]/10',
          iconBg: 'bg-[#2D5F4F]',
          iconText: 'text-white',
          text: 'text-[#2D5F4F]'
        }
      case 'ochre':
        return {
          bg: 'bg-[#D4A373]/10',
          iconBg: 'bg-[#D4A373]',
          iconText: 'text-[#2C2C2C]',
          text: 'text-[#D4A373]'
        }
      default:
        return {
          bg: 'bg-gray-100',
          iconBg: 'bg-gray-500',
          iconText: 'text-white',
          text: 'text-gray-700'
        }
    }
  }

  return (
    <section className={cn("py-16 md:py-20 bg-[#2D5F4F] text-white", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-12">
            <Badge
              variant="outline"
              className="border-[#D4A373] text-[#D4A373] bg-[#D4A373]/10"
            >
              Indigenous Data Sovereignty
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Built on OCAP<sup className="text-xl">®</sup> Principles
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              This platform respects Indigenous data sovereignty through the OCAP<sup>®</sup> principles developed by the First Nations Information Governance Centre (FNIGC)
            </p>
          </div>

          {/* OCAP Principles Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {principles.map((principle, index) => {
              const colors = getColorClasses(principle.color)
              const Icon = principle.icon

              return (
                <Card
                  key={index}
                  className="p-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/40"
                >
                  <div className="space-y-4">
                    {/* Icon & Letter */}
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shadow-md",
                        colors.iconBg
                      )}>
                        <Icon className={cn("w-6 h-6", colors.iconText)} />
                      </div>
                      <div className="text-6xl font-serif font-bold text-white/20">
                        {principle.letter}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-white">
                      {principle.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/80 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Bottom Content */}
          <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white">
                  Why OCAP<sup>®</sup> Matters
                </h3>
                <p className="text-white/80 leading-relaxed">
                  OCAP<sup>®</sup> is a registered trademark of the First Nations Information Governance Centre (FNIGC).
                  These principles ensure that Indigenous communities maintain sovereignty over their cultural knowledge,
                  stories, and data in the digital age.
                </p>
                <p className="text-white/80 leading-relaxed">
                  Every story on this platform is shared with informed consent, cultural protocols are respected,
                  and communities retain full control over their narratives.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-white/20">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D4A373] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#2C2C2C]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Elder Review</div>
                        <div className="text-sm text-white/60">Cultural safety protocols</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D97757] flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Consent Management</div>
                        <div className="text-sm text-white/60">Full control over sharing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2D5F4F] flex items-center justify-center">
                        <Hand className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Data Sovereignty</div>
                        <div className="text-sm text-white/60">Communities own their data</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#D97757] hover:bg-[#D97757]/90 text-white"
                >
                  <Link href="/about/ocap" className="group">
                    Learn More About OCAP<sup>®</sup>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/60">
              OCAP<sup>®</sup> is a registered trademark of the First Nations Information Governance Centre (FNIGC).
              Learn more at{' '}
              <a
                href="https://fnigc.ca/ocap-training/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4A373] hover:text-[#D4A373]/80 underline"
              >
                fnigc.ca/ocap-training
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
