import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Shield, Heart, Upload, Eye, Share2, Lock, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography, Heading } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'

const steps = [
  {
    step: 1,
    icon: <Upload className="w-6 h-6" />,
    title: "Choose Your Story Type",
    description: "Share a personal memory, family history, community tale, or cultural tradition. Every story has its place.",
    examples: ["Personal journey", "Family heritage", "Professional experience", "Cultural tradition"],
    color: "clay"
  },
  {
    step: 2,
    icon: <BookOpen className="w-6 h-6" />,
    title: "Tell Your Story",
    description: "Write, record, or upload your story. Add photos, audio, or video to bring it to life. Our tools adapt to your comfort level.",
    examples: ["Written narrative", "Audio recording", "Video testimonial", "Photo album"],
    color: "sage"
  },
  {
    step: 3,
    icon: <Lock className="w-6 h-6" />,
    title: "Set Your Privacy",
    description: "Choose who can see your story. From completely public to family-only, or culturally protected content with community approval.",
    examples: ["Public sharing", "Family only", "Community review", "Cultural protocols"],
    color: "sky"
  },
  {
    step: 4,
    icon: <Share2 className="w-6 h-6" />,
    title: "Connect & Preserve",
    description: "Your story joins our global library of human experiences, safely preserved and thoughtfully shared with those you choose.",
    examples: ["Discover similar stories", "Connect with others", "Preserve for future", "Build community"],
    color: "clay"
  }
]

const storyTypes = [
  {
    title: "Personal Stories",
    description: "Life experiences, memories, and personal journeys",
    icon: <Heart className="w-8 h-8" />,
    examples: ["Childhood memories", "Life transitions", "Travel adventures", "Personal challenges"],
    privacy: "Your choice - public, private, or family-only"
  },
  {
    title: "Family Heritage",
    description: "Generational stories, family history, and traditions",
    icon: <Users className="w-8 h-8" />,
    examples: ["Ancestor stories", "Family traditions", "Immigration tales", "Generational wisdom"],
    privacy: "Typically family-shared with optional public access"
  },
  {
    title: "Community Stories",
    description: "Local history, shared experiences, and community narratives",
    icon: <Globe className="w-8 h-8" />,
    examples: ["Neighborhood history", "Local legends", "Community events", "Shared experiences"],
    privacy: "Community-focused with broad sharing options"
  },
  {
    title: "Cultural Heritage",
    description: "Traditional stories, cultural practices, and ancestral wisdom",
    icon: <Shield className="w-8 h-8" />,
    examples: ["Traditional stories", "Cultural practices", "Ancestral wisdom", "Sacred knowledge"],
    privacy: "Enhanced cultural protocols and community oversight"
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-clay-50 via-background to-sage-50/30 dark:from-clay-950/20 dark:via-background dark:to-sage-950/10">
        <div className="absolute inset-0 bg-gradient-to-r from-clay-100/10 to-sage-100/10 dark:from-clay-900/5 dark:to-sage-900/5" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108 / 0.15) 1px, transparent 0)`,
               backgroundSize: '24px 24px'
             }}
        />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto">
              <BookOpen className="w-3 h-3 mr-1" />
              Getting Started Guide
            </Badge>
            
            <Heading level={1} cultural className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              How to Share{" "}
              <span className="bg-gradient-to-r from-clay-600 to-sage-600 bg-clip-text text-transparent">
                Your Story
              </span>
            </Heading>
            
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Whether it's a personal memory, family tradition, or cultural heritage, sharing your story is simple, safe, and meaningful. Here's how it works.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="cultural-primary" size="cultural-lg" asChild>
                <Link href="/auth/signup" className="group">
                  Start Sharing Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="cultural-secondary" size="cultural-lg" asChild>
                <Link href="/stories">
                  Explore Stories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="cultural-new" size="cultural">
              Simple Process
            </Badge>
            <Heading level={2} cultural className="text-3xl md:text-4xl font-bold">
              Four Simple Steps
            </Heading>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              From idea to preserved story in just four steps. No technical expertise required - just your unique story to share.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <Card key={index} variant="cultural" size="cultural" className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader cultural>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shadow-md",
                      step.color === "clay" && "bg-clay-100 text-clay-600 dark:bg-clay-900/30 dark:text-clay-400",
                      step.color === "sage" && "bg-sage-100 text-sage-600 dark:bg-sage-900/30 dark:text-sage-400", 
                      step.color === "sky" && "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                    )}>
                      {step.icon}
                    </div>
                    <Badge variant="cultural-soft" className="text-xs">
                      Step {step.step}
                    </Badge>
                  </div>
                  <CardTitle cultural>{step.title}</CardTitle>
                </CardHeader>
                <CardContent cultural className="space-y-4">
                  <CardDescription cultural>{step.description}</CardDescription>
                  <div className="space-y-2">
                    <Typography variant="small" className="font-medium text-stone-700 dark:text-stone-300">
                      Examples:
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {step.examples.map((example, i) => (
                        <Badge key={i} variant="sage-soft" size="sm">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-clay-200 to-sage-200 dark:from-clay-800 dark:to-sage-800" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Types Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sage-50/30 via-clay-50/20 to-sky-50/30 dark:from-sage-950/20 dark:via-clay-950/10 dark:to-sky-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="clay-soft" size="cultural">
              Story Categories
            </Badge>
            <Heading level={2} cultural className="text-3xl md:text-4xl font-bold">
              Every Type of Story Welcomed
            </Heading>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              From personal memories to cultural traditions, we support all types of human stories with appropriate privacy and cultural protections.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {storyTypes.map((type, index) => (
              <Card key={index} variant="cultural" size="cultural" className="group hover:shadow-lg transition-all duration-300">
                <CardHeader cultural>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-clay-100 to-sage-100 dark:from-clay-900/30 dark:to-sage-900/30 flex items-center justify-center text-clay-600 dark:text-clay-400 shadow-md">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle cultural className="text-xl mb-2">{type.title}</CardTitle>
                      <CardDescription cultural className="text-base">{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent cultural className="space-y-4">
                  <div>
                    <Typography variant="small" className="font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Example Stories:
                    </Typography>
                    <div className="grid grid-cols-2 gap-2">
                      {type.examples.map((example, i) => (
                        <Typography key={i} variant="small" className="text-stone-600 dark:text-stone-400 flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-clay-400 mr-2 flex-shrink-0" />
                          {example}
                        </Typography>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                    <Typography variant="small" className="font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Privacy Level:
                    </Typography>
                    <Typography variant="small" className="text-stone-600 dark:text-stone-400">
                      {type.privacy}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-clay-100/50 via-sage-100/30 to-sky-100/20 dark:from-clay-950/20 dark:via-sage-950/10 dark:to-sky-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Heading level={2} cultural className="text-3xl md:text-4xl font-bold">
                Ready to Share Your Story?
              </Heading>
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Join thousands of storytellers who have found their voice and connected with others through the power of shared human experience.
              </Typography>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cultural-primary" size="cultural-lg" asChild>
                <Link href="/auth/signup">
                  Get Started Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="clay-outline" size="cultural-lg" asChild>
                <Link href="/stories">
                  Browse Stories First
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-stone-200 dark:border-stone-800">
              <Typography variant="body-small" className="text-stone-500 dark:text-stone-400">
                <Shield className="w-4 h-4 inline mr-2" />
                Safe, secure, and respectful sharing with full privacy controls
              </Typography>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}