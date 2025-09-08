import Link from 'next/link'
import { ArrowRight, Heart, Users, Shield, Globe, BookOpen, Lightbulb } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Cultural Safety First",
    description: "Every story is protected by Indigenous data sovereignty principles and community-driven protocols.",
    color: "clay"
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Respectful Storytelling",
    description: "We honor each voice with dignity, ensuring stories are shared with consent and cultural sensitivity.",
    color: "sage"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community-Centered",
    description: "Built by and for communities, with elder guidance and grassroots participation at every step.",
    color: "sky"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Connection",
    description: "Connecting diverse communities worldwide while respecting local traditions and cultural boundaries.",
    color: "clay"
  }
]

const features = [
  {
    title: "Secure Story Sharing",
    description: "Share your experiences with full control over privacy and access permissions.",
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    title: "Cultural Protocols",
    description: "Built-in respect for traditional knowledge and sacred stories with elder oversight.",
    icon: <Shield className="w-6 h-6" />
  },
  {
    title: "Community Analytics",
    description: "Understand collective impact while maintaining individual privacy and cultural sensitivity.",
    icon: <Lightbulb className="w-6 h-6" />
  },
  {
    title: "Healing Focus",
    description: "Supporting personal and community healing through shared experiences and wisdom.",
    icon: <Heart className="w-6 h-6" />
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-clay-50 via-background to-sage-50/30 dark:from-clay-950/20 dark:via-background dark:to-sage-950/10">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-clay-100/10 to-sage-100/10 dark:from-clay-900/5 dark:to-sage-900/5" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108 / 0.15) 1px, transparent 0)`,
               backgroundSize: '24px 24px'
             }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-clay-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-sage-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-sky-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="relative inline-block">
              <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto shadow-lg backdrop-blur-sm">
                <Heart className="w-3 h-3 mr-1" />
                Our Mission
              </Badge>
              <div className="absolute -inset-2 bg-gradient-to-r from-clay-400/20 to-sage-400/20 rounded-full blur-lg -z-10"></div>
            </div>
            
            <div className="relative">
              <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center mx-auto">
                Preserving Stories,{" "}
                <span className="relative inline-block">
                  <span className="text-clay-700 dark:text-clay-300">
                    Honoring Voices
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-clay-200/50 to-sage-200/50 dark:from-clay-800/50 dark:to-sage-800/50 rounded-lg blur-sm -z-10"></div>
                </span>
              </Typography>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Empathy Ledger is a culturally respectful platform dedicated to preserving Indigenous stories, wisdom, and cultural heritage through secure, community-driven digital storytelling.
              </Typography>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-clay-400 to-transparent"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button variant="cultural-primary" size="cultural-lg" asChild className="shadow-lg hover:shadow-xl hover:shadow-clay-200/30 transition-all duration-300">
                <Link href="/how-it-works" className="group">
                  Learn How It Works
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="cultural-secondary" size="cultural-lg" asChild className="shadow-lg hover:shadow-xl hover:shadow-sage-200/30 transition-all duration-300">
                <Link href="/stories">
                  Explore Stories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="cultural-new" size="cultural">
              Our Story
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
              Born from Community Need
            </Typography>
            <div className="space-y-6 text-left">
              <Typography variant="body" className="text-lg leading-relaxed text-stone-600 dark:text-stone-400">
                Empathy Ledger emerged from conversations with Indigenous communities who needed a safe, 
                respectful way to preserve and share their stories. Traditional storytelling platforms 
                often lack the cultural protocols and data sovereignty protections that Indigenous 
                communities require.
              </Typography>
              <Typography variant="body" className="text-lg leading-relaxed text-stone-600 dark:text-stone-400">
                We built this platform in partnership with elders, community leaders, and storytellers 
                to ensure every feature respects cultural boundaries, honors traditional knowledge, 
                and empowers communities to control their own narratives.
              </Typography>
              <Typography variant="body" className="text-lg leading-relaxed text-stone-600 dark:text-stone-400">
                Today, Empathy Ledger serves as a bridge between generations, connecting traditional 
                wisdom with modern technology while maintaining the sacred trust that storytelling represents.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-sage-50/30 via-clay-50/20 to-sky-50/30 dark:from-sage-950/20 dark:via-clay-950/10 dark:to-sky-950/20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-clay-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-sage-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-sky-200/20 rounded-full blur-2xl"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="sage-soft" size="cultural" className="relative z-10">
              <Shield className="w-3 h-3 mr-1" />
              Core Values
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold relative z-10">
              What Guides Our Work
            </Typography>
            <div className="relative">
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Every decision we make is rooted in respect for Indigenous wisdom, cultural safety, and community empowerment.
              </Typography>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-clay-400 to-sage-400 rounded-full"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {values.map((value, index) => (
              <Card key={index} variant="cultural" size="cultural" className="group hover:shadow-xl hover:shadow-clay-200/20 transition-all duration-300 border-clay-100/50 dark:border-clay-800/50 relative overflow-hidden">
                {/* Card decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-clay-100/30 to-sage-100/30 rounded-full blur-xl transform translate-x-6 -translate-y-6"></div>
                
                <CardHeader cultural className="relative z-10">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${
                      value.color === 'clay' 
                        ? 'bg-gradient-to-br from-clay-200 to-clay-300 text-clay-700 dark:from-clay-800 dark:to-clay-700 dark:text-clay-300'
                        : value.color === 'sage'
                        ? 'bg-gradient-to-br from-sage-200 to-sage-300 text-sage-700 dark:from-sage-800 dark:to-sage-700 dark:text-sage-300'
                        : 'bg-gradient-to-br from-sky-200 to-sky-300 text-sky-700 dark:from-sky-800 dark:to-sky-700 dark:text-sky-300'
                    }`}>
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle cultural className="text-xl mb-2 group-hover:text-clay-700 dark:group-hover:text-clay-300 transition-colors">
                        {value.title}
                      </CardTitle>
                      <CardDescription cultural className="text-base">
                        {value.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="clay-soft" size="cultural">
              Platform Features
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
              Built for Community Storytelling
            </Typography>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Every feature is designed with cultural safety, privacy, and community control at its foundation.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} variant="cultural" className="group hover:shadow-lg transition-all duration-300 text-center">
                <CardHeader cultural>
                  <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-clay-100 to-sage-100 dark:from-clay-900/30 dark:to-sage-900/30 flex items-center justify-center text-clay-600 dark:text-clay-400 shadow-md mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle cultural className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent cultural>
                  <CardDescription cultural className="text-sm">{feature.description}</CardDescription>
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
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
                Join Our Community
              </Typography>
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Whether you're sharing your story, preserving family history, or building community connections, 
                you're part of a movement that honors all voices and experiences.
              </Typography>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cultural-primary" size="cultural-lg" asChild>
                <Link href="/auth/signup">
                  Start Your Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="clay-outline" size="cultural-lg" asChild>
                <Link href="/how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-stone-200 dark:border-stone-800">
              <Typography variant="body-small" className="text-stone-500 dark:text-stone-400">
                <Shield className="w-4 h-4 inline mr-2" />
                Built with Indigenous data sovereignty and cultural safety protocols
              </Typography>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}