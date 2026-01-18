'use client'

import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface ComingSoonProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <Badge variant="clay-soft" size="cultural" className="mx-auto">
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>

            {icon && (
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-clay-100 to-sage-100 dark:from-clay-900/30 dark:to-sage-900/30 flex items-center justify-center text-clay-600 dark:text-clay-400 shadow-lg">
                {icon}
              </div>
            )}

            <div className="space-y-4">
              <Typography variant="h1" className="text-3xl md:text-4xl font-bold">
                {title}
              </Typography>
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400">
                {description}
              </Typography>
            </div>

            <div className="pt-4">
              <Typography variant="body-sm" className="text-stone-500 dark:text-stone-400 mb-6">
                We&apos;re working hard to bring you this feature. Check back soon!
              </Typography>

              <Button variant="clay-outline" size="cultural-lg" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
