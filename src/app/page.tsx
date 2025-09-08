import Link from 'next/link'
import { ArrowRight, Heart, BookOpen, Users, Map, Shield, Sparkles, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { NetworkGraph } from '@/components/ui/network-graph'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Every Story Matters",
    description: "Share personal memories, family histories, life experiences, and cultural traditions in a welcoming, respectful space.",
    color: "blue"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Global Community", 
    description: "Connect with storytellers from all backgrounds sharing their unique perspectives, wisdom, and life experiences.",
    color: "green"
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Organization Dashboards",
    description: "Organizations can support their communities with member analytics, project tracking, and story curation.",
    color: "purple"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy & Safety",
    description: "Share your stories with confidence using flexible privacy controls and optional cultural protocols.",
    color: "red"
  }
]

const stats = [
  { number: "500+", label: "Life Stories" },
  { number: "223", label: "Storytellers" },
  { number: "15", label: "Organizations" },
  { number: "50+", label: "Communities" }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-green-50/30 dark:from-blue-950/20 dark:via-background dark:to-green-950/10">        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Stories That Connect & Inspire
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Every Story Matters:{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Share, Preserve, Connect
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  A welcoming platform for everyone to share their stories - from personal memories and family histories to cultural traditions and life experiences. Your story matters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/stories" className="group">
                    Explore Stories
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard">
                    View Organization Dashboard
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.number}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200">
                <div className="aspect-[4/3] w-full h-full flex items-center justify-center">
                  <NetworkGraph />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for Everyone's Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature supports diverse storytelling needs, from casual sharing to cultural preservation, with respect and authenticity at the core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md",
                    feature.color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    feature.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", 
                    feature.color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                    feature.color === "red" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Quick Access
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our platform features and organization dashboards
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-md transition-all">
                <CardHeader>
                  <Building2 className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Snow Foundation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Nonprofit organization with 5 members, 1 project, and analytics dashboard
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-md transition-all">
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Browse and discover stories from our community of storytellers
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/stories">
                      Browse Stories
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-md transition-all">
                <CardHeader>
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Storytellers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Connect with storytellers and explore individual analytics
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/storytellers">
                      Meet Storytellers
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                <Shield className="w-4 h-4 inline mr-2" />
                Built with privacy, safety, and respect for all communities and cultural protocols
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}