'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NetworkGraph } from '@/components/ui/network-graph'
import { HeroSearch } from './HeroSearch'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    }
  }

  const searchVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    }
  }

  return (
    <section
      className={cn(
        'relative min-h-[85vh] md:min-h-[90vh] overflow-hidden',
        'bg-gradient-to-b from-cream via-cream to-cream/95',
        className
      )}
    >
      {/* Network Graph Background */}
      <div className="absolute inset-0 z-0">
        <NetworkGraph variant="hero" className="w-full h-full" />
      </div>

      {/* Subtle overlay for text readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-radial from-cream/40 to-cream/70"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl mx-auto text-center py-16 md:py-24"
        >
          {/* Logo / Brand */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium tracking-wider text-sage uppercase">
              <span className="w-8 h-[2px] bg-terracotta" />
              Empathy Ledger
              <span className="w-8 h-[2px] bg-terracotta" />
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-charcoal mb-6"
          >
            Discover Stories That{' '}
            <span className="text-terracotta relative">
              Connect Us All
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-terracotta/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,8 Q50,0 100,8 T200,8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-charcoal/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Explore powerful stories from Indigenous communities, shared with respect, consent, and cultural protocols.
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={searchVariants} className="mb-8">
            <HeroSearch />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              asChild
              className="bg-terracotta hover:bg-terracotta-dark text-white px-8 group"
            >
              <Link href="/stories">
                Browse Stories
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-sage text-sage hover:bg-sage/5 px-8"
            >
              <Link href="/storytellers">
                <Users className="w-4 h-4 mr-2" />
                Meet Storytellers
              </Link>
            </Button>
          </motion.div>

          {/* Stats/Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 pt-8 border-t border-ochre/20"
          >
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm text-charcoal/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sage" />
                <span>Community-led stories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terracotta" />
                <span>Cultural protocols respected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ochre" />
                <span>Indigenous data sovereignty</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none bg-gradient-to-t from-cream to-transparent"
      />
    </section>
  )
}
