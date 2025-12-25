'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  ArrowRight,
  Heart,
  BookOpen,
  Users,
  Shield,
  Sparkles,
  Mic,
  Play,
  ChevronRight,
  Globe,
  Lock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BottomNav } from '@/components/layout/BottomNav'
import Header from '@/components/layout/header'
import UnifiedFooter from '@/components/shared/UnifiedFooter'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth.context'

// Feature cards data - Using Editorial Warmth palette
const features = [
  {
    icon: BookOpen,
    title: "Share Your Story",
    description: "Record personal memories, family histories, and life experiences.",
    color: "text-terracotta-600 dark:text-terracotta-400",
    bgColor: "bg-terracotta-50 dark:bg-terracotta-950/30"
  },
  {
    icon: Users,
    title: "Build Community",
    description: "Connect with storytellers sharing unique perspectives.",
    color: "text-ink-700 dark:text-cream-300",
    bgColor: "bg-cream-300 dark:bg-ink-800"
  },
  {
    icon: Shield,
    title: "Stay Protected",
    description: "Control your privacy with flexible sharing options.",
    color: "text-stone-700 dark:text-stone-300",
    bgColor: "bg-stone-100 dark:bg-stone-800/30"
  },
  {
    icon: Globe,
    title: "Cultural Respect",
    description: "Built with Indigenous protocols and OCAP principles.",
    color: "text-sunshine-700 dark:text-sunshine-400",
    bgColor: "bg-sunshine-50 dark:bg-sunshine-900/30"
  }
]

// Stats data
const stats = [
  { number: "500+", label: "Stories" },
  { number: "223", label: "Storytellers" },
  { number: "15", label: "Organizations" }
]

// Quick action cards
const quickActions = [
  {
    href: "/capture",
    icon: Mic,
    title: "Capture a Story",
    description: "Record an interview now",
    primary: true
  },
  {
    href: "/stories",
    icon: BookOpen,
    title: "Explore Stories",
    description: "Discover community voices"
  },
  {
    href: "/storytellers",
    icon: Users,
    title: "Meet Storytellers",
    description: "Connect with people"
  }
]

export default function Home() {
  const { user, isAuthenticated, isSuperAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Header - Simplified */}
      <header className="md:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Empathy Ledger</h1>
            </div>
          </Link>
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-target"
            >
              <Users className="w-5 h-5 text-secondary-foreground" />
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-primary px-4 py-2 touch-target"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - with bottom nav spacing on mobile */}
      <main className="mb-bottom-nav md:mb-0">

        {/* Hero Section - Mobile First */}
        <section className="hero-mobile relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

          <div className="relative container mx-auto max-w-lg md:max-w-4xl lg:max-w-6xl">
            {/* Mobile: Stack layout, Desktop: Grid */}
            <div className="text-center md:text-left md:grid md:grid-cols-2 md:gap-12 md:items-center">

              {/* Content */}
              <div className="space-y-6 md:space-y-8">
                {/* Badge - Sunshine yellow accent */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sunshine-400 text-ink-900 text-sm font-medium animate-fade-up shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Every Story Matters</span>
                </div>

                {/* Headline - Editorial serif typography */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  Share Your Story,{' '}
                  <span className="relative">
                    <span className="relative z-10">Preserve Your Voice</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-sunshine-400/40 -z-0" />
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-md mx-auto md:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  A welcoming space for personal memories, family histories, and cultural traditions.
                </p>

                {/* CTA Buttons - Full width on mobile */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  <Button
                    size="lg"
                    asChild
                    className="btn-mobile-lg w-full sm:w-auto press-effect bg-ink-900 hover:bg-ink-800 text-cream-100"
                  >
                    <Link href="/capture" className="flex items-center justify-center gap-3">
                      <Mic className="w-5 h-5" />
                      Capture a Story
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="btn-mobile w-full sm:w-auto press-effect border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-cream-100"
                  >
                    <Link href="/stories" className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Explore Stories
                    </Link>
                  </Button>
                </div>

                {/* Stats - Horizontal scroll on mobile */}
                <div className="flex justify-center md:justify-start gap-8 pt-6 border-t border-stone-200 dark:border-stone-800 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-display font-bold text-ink-900 dark:text-cream-100">
                        {stat.number}
                      </div>
                      <div className="text-sm text-stone-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Visual - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* Decorative circles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-primary/5 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full bg-primary/10" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-primary" />
                    </div>
                  </div>

                  {/* Floating story cards */}
                  <div className="absolute top-8 left-0 mobile-card p-4 max-w-[180px] animate-bounce-subtle">
                    <p className="text-sm text-muted-foreground">"My grandmother's recipes..."</p>
                    <p className="text-xs text-primary mt-2">— Maria, 67</p>
                  </div>
                  <div className="absolute bottom-8 right-0 mobile-card p-4 max-w-[180px] animate-bounce-subtle" style={{ animationDelay: '0.3s' }}>
                    <p className="text-sm text-muted-foreground">"Our family's journey..."</p>
                    <p className="text-xs text-primary mt-2">— James, 45</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions - Mobile optimized cards */}
        <section className="section-mobile bg-secondary/30">
          <div className="container mx-auto max-w-lg md:max-w-4xl">
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "mobile-card flex items-center gap-4 p-5",
                    action.primary && "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                    action.primary
                      ? "bg-primary-foreground/20"
                      : "bg-primary/10"
                  )}>
                    <action.icon className={cn(
                      "w-7 h-7",
                      action.primary ? "text-primary-foreground" : "text-primary"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-semibold text-lg",
                      !action.primary && "text-foreground"
                    )}>
                      {action.title}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      action.primary ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 flex-shrink-0",
                    action.primary ? "text-primary-foreground/60" : "text-muted-foreground"
                  )} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid - Mobile scroll, desktop grid */}
        <section className="section-mobile">
          <div className="container mx-auto max-w-lg md:max-w-4xl lg:max-w-6xl">
            {/* Section header */}
            <div className="text-center mb-8 md:mb-12">
              <Badge variant="outline" className="mb-4 border-sunshine-400 text-sunshine-700 dark:text-sunshine-400">
                Why Empathy Ledger
              </Badge>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Built for Everyone&apos;s Stories
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mt-3 max-w-lg mx-auto">
                From casual sharing to cultural preservation, with respect at the core.
              </p>
            </div>

            {/* Feature cards - Horizontal scroll on mobile, grid on desktop */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 scroll-snap-x scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="mobile-card min-w-[280px] md:min-w-0 scroll-snap-item p-6"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                    feature.bgColor
                  )}>
                    <feature.icon className={cn("w-7 h-7", feature.color)} />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="section-mobile bg-cream-300 dark:bg-ink-800">
          <div className="container mx-auto max-w-lg md:max-w-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sunshine-400 mb-6">
              <Lock className="w-8 h-8 text-ink-900" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Your Stories, Your Control
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
              We believe in consent-first storytelling. You decide who sees your stories,
              when they&apos;re shared, and how they&apos;re used. Built with Indigenous data
              sovereignty principles at the core.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-mobile press-effect bg-ink-900 hover:bg-ink-800 text-cream-100">
                <Link href="/how-it-works">
                  Learn How It Works
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="btn-mobile press-effect border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-cream-100">
                <Link href="/guidelines">
                  View Guidelines
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA - Strong call to action */}
        <section className="section-mobile">
          <div className="container mx-auto max-w-lg">
            <div className="mobile-card p-8 text-center bg-ink-900 dark:bg-ink-800 border-ink-800">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sunshine-400 mb-6">
                <Heart className="w-8 h-8 text-ink-900" />
              </div>
              <h2 className="font-display text-2xl font-bold text-cream-100 mb-3">
                Ready to Share Your Story?
              </h2>
              <p className="text-stone-400 mb-6">
                Join hundreds of storytellers preserving their voices for future generations.
              </p>
              <Button size="lg" asChild className="btn-mobile-lg w-full press-effect bg-sunshine-400 hover:bg-sunshine-500 text-ink-900">
                <Link href="/capture" className="flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5" />
                  Start Capturing
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer - Hidden on mobile (bottom nav takes over) */}
        <div className="hidden md:block">
          <UnifiedFooter
            currentProject="Empathy Ledger"
            showProjects={true}
            customLinks={[
              { label: "About", href: "/about" },
              { label: "Stories", href: "/stories" },
              { label: "Storytellers", href: "/storytellers" },
              { label: "Contact", href: "/contact" },
            ]}
            contactEmail="hello@empathyledger.com"
          />
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  )
}
