export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Shield, Heart, Users, BookOpen, CheckCircle, AlertTriangle, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'

const guidelineCategories = [
  {
    title: "Personal Stories",
    icon: <Heart className="w-6 h-6" />,
    description: "Guidelines for sharing personal experiences and memories",
    guidelines: [
      "Share authentically from your own experience",
      "Be respectful when mentioning others in your stories",
      "Consider the emotional impact on readers",
      "Use content warnings for sensitive topics",
      "Respect privacy boundaries of others mentioned"
    ],
    colour: "clay"
  },
  {
    title: "Family & Community",
    icon: <Users className="w-6 h-6" />,
    description: "Best practices for family histories and community stories",
    guidelines: [
      "Obtain consent from living family members when sharing their stories",
      "Verify historical details when possible",
      "Be sensitive to family dynamics and relationships",
      "Consider cultural traditions in storytelling",
      "Include diverse perspectives when telling community stories"
    ],
    colour: "sage"
  },
  {
    title: "Cultural Heritage",
    icon: <Shield className="w-6 h-6" />,
    description: "Special protocols for cultural and traditional content",
    guidelines: [
      "Ensure you have the right to share cultural knowledge",
      "Follow traditional protocols for sacred or ceremonial content",
      "Seek elder or community approval for sensitive cultural material",
      "Provide proper cultural context and background",
      "Respect intellectual property and traditional knowledge"
    ],
    colour: "sky"
  }
]

const universalPrinciples = [
  {
    principle: "Authenticity",
    description: "Tell your truth with honesty and integrity",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />
  },
  {
    principle: "Respect",
    description: "Honor all people, cultures, and experiences mentioned",
    icon: <Heart className="w-5 h-5 text-red-600" />
  },
  {
    principle: "Consent",
    description: "Ensure you have permission to share others' experiences",
    icon: <Shield className="w-5 h-5 text-blue-600" />
  },
  {
    principle: "Context",
    description: "Provide appropriate background and cultural understanding",
    icon: <Info className="w-5 h-5 text-amber-600" />
  }
]

export default function GuidelinesPage() {
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
              <Shield className="w-3 h-3 mr-1" />
              Community Guidelines
            </Badge>
            
            <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Sharing Stories{" "}
              <span className="bg-gradient-to-r from-clay-600 to-sage-600 bg-clip-text text-transparent">
                Responsibly
              </span>
            </Typography>
            
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Guidelines for sharing your stories with respect, authenticity, and care for the communities and cultures we represent.
            </Typography>
          </div>
        </div>
      </section>

      {/* Universal Principles */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="cultural-new" size="cultural">
              Core Values
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
              Universal Principles
            </Typography>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              These core principles guide all storytelling on our platform, regardless of the type of story you're sharing.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {universalPrinciples.map((item, index) => (
              <Card key={index} variant="cultural" size="cultural" className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader cultural>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-clay-100 to-sage-100 dark:from-clay-900/30 dark:to-sage-900/30 flex items-center justify-center shadow-md">
                      {item.icon}
                    </div>
                  </div>
                  <CardTitle cultural className="text-xl">{item.principle}</CardTitle>
                </CardHeader>
                <CardContent cultural>
                  <CardDescription cultural className="text-center">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Category Guidelines */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sage-50/30 via-clay-50/20 to-sky-50/30 dark:from-sage-950/20 dark:via-clay-950/10 dark:to-sky-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="clay-soft" size="cultural">
              Story Categories
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
              Guidelines by Story Type
            </Typography>
            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Different types of stories have different considerations. Here's what to keep in mind for each category.
            </Typography>
          </div>

          <div className="space-y-8">
            {guidelineCategories.map((category, index) => (
              <Card key={index} variant="cultural" size="cultural" className="group hover:shadow-lg transition-all duration-300">
                <CardHeader cultural>
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center shadow-md",
                      category.colour === "clay" && "bg-clay-100 text-clay-600 dark:bg-clay-900/30 dark:text-clay-400",
                      category.colour === "sage" && "bg-sage-100 text-sage-600 dark:bg-sage-900/30 dark:text-sage-400", 
                      category.colour === "sky" && "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                    )}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle cultural className="text-2xl mb-2">{category.title}</CardTitle>
                      <CardDescription cultural className="text-lg">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent cultural>
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.guidelines.map((guideline, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <Typography variant="body" className="text-stone-700 dark:text-stone-300">
                          {guideline}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Reminders */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge variant="cultural-featured" size="cultural">
                Important Reminders
              </Badge>
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
                Before You Share
              </Typography>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Your Story, Your Choice:</strong> You always maintain control over your content. You can edit, update privacy settings, or remove your stories at any time.
                </AlertDescription>
              </Alert>

              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Cultural Content:</strong> If your story contains cultural, traditional, or sacred elements, consider enabling cultural review and community approval.
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Privacy First:</strong> Use our flexible privacy controls to share only with those you choose. Not everything needs to be public.
                </AlertDescription>
              </Alert>

              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <Heart className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Community Care:</strong> Remember that your stories may deeply impact others. Share with care, compassion, and consideration.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-clay-100/50 via-sage-100/30 to-sky-100/20 dark:from-clay-950/20 dark:via-sage-950/10 dark:to-sky-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
                Ready to Share Responsibly?
              </Typography>
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Now that you understand our guidelines, you're ready to share your story with confidence and care.
              </Typography>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cultural-primary" size="cultural-lg" asChild>
                <Link href="/stories/create">
                  Start Sharing Your Story
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
                Need help? Contact our community support team anytime
              </Typography>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}