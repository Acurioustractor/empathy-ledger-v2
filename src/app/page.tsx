import Link from 'next/link'
import { ArrowRight, Heart, BookOpen, Users, Map, Shield, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography, Heading } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Every Story Matters",
    description: "Share personal memories, family histories, life experiences, and cultural traditions in a welcoming, respectful space.",
    color: "clay"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Global Community", 
    description: "Connect with storytellers from all backgrounds sharing their unique perspectives, wisdom, and life experiences.",
    color: "sage"
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Story Discovery",
    description: "Explore diverse narratives by location, theme, and type - from personal journeys to cultural heritage.",
    color: "sky"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy & Safety",
    description: "Share your stories with confidence using flexible privacy controls and optional cultural protocols.",
    color: "clay"
  }
]

const stats = [
  { number: "500+", label: "Life Stories" },
  { number: "150+", label: "Storytellers" },
  { number: "50+", label: "Communities" },
  { number: "25+", label: "Languages" }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-clay-50 via-background to-sage-50/30 dark:from-clay-950/20 dark:via-background dark:to-sage-950/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-clay-100/10 to-sage-100/10 dark:from-clay-900/5 dark:to-sage-900/5" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108 / 0.15) 1px, transparent 0)`,
               backgroundSize: '24px 24px'
             }}
        />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="cultural-featured" size="cultural" className="w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Stories That Connect & Inspire
                </Badge>
                
                <Heading level={1} cultural className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Every Story Matters:{" "}
                  <span className="bg-gradient-to-r from-clay-600 to-sage-600 bg-clip-text text-transparent">
                    Share, Preserve, Connect
                  </span>
                </Heading>
                
                <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-lg leading-relaxed">
                  A welcoming platform for everyone to share their stories - from personal memories and family histories to cultural traditions and life experiences. Your story matters.
                </Typography>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="cultural-primary" size="cultural-lg" asChild>
                  <Link href="/stories" className="group">
                    Explore Stories
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="cultural-secondary" size="cultural-lg" asChild>
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-stone-200 dark:border-stone-800">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <Typography variant="cultural-heading" className="text-clay-700 dark:text-clay-300 font-bold">
                      {stat.number}
                    </Typography>
                    <Typography variant="caption" className="text-stone-600 dark:text-stone-400">
                      {stat.label}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-cultural">
                <div className="aspect-[4/3] bg-gradient-to-br from-clay-400 via-sage-400 to-sky-400 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <Typography variant="cultural-subheading" className="text-white font-semibold">
                      Interactive Story Map
                    </Typography>
                    <Typography variant="body-small" className="text-white/90 max-w-sm">
                      Coming Soon - Explore stories from around the world, connected by place and experience
                    </Typography>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 shadow-lg opacity-80" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-clay-400 to-clay-600 shadow-lg opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="cultural-new" size="cultural">
              Platform Features
            </Badge>
            <Heading level={2} cultural className="text-3xl md:text-4xl font-bold">
              Built for Everyone's Stories
            </Heading>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Every feature supports diverse storytelling needs, from casual sharing to cultural preservation, with respect and authenticity at the core.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="cultural" size="cultural" className="group hover:shadow-lg transition-all duration-300">
                <CardHeader cultural>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md",
                    feature.color === "clay" && "bg-clay-100 text-clay-600 dark:bg-clay-900/30 dark:text-clay-400",
                    feature.color === "sage" && "bg-sage-100 text-sage-600 dark:bg-sage-900/30 dark:text-sage-400", 
                    feature.color === "sky" && "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                  )}>
                    {feature.icon}
                  </div>
                  <CardTitle cultural>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent cultural>
                  <CardDescription cultural>{feature.description}</CardDescription>
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
                Join Our Community
              </Heading>
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Whether you're sharing personal memories, family histories, professional journeys, or cultural traditions, there's a place for your story in our community.
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
                <Link href="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-stone-200 dark:border-stone-800">
              <Typography variant="body-small" className="text-stone-500 dark:text-stone-400">
                <Shield className="w-4 h-4 inline mr-2" />
                Built with privacy, safety, and respect for all communities and cultural protocols
              </Typography>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
