import React from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone, Globe, Shield, Eye } from 'lucide-react'

import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

interface FooterSection {
  title: string
  links: {
    name: string
    href: string
    external?: boolean
    iconName?: string
  }[]
}

const footerSections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { name: 'Stories', href: '/stories' },
      { name: 'Storytellers', href: '/storytellers' },
      { name: 'Cultural Map', href: '/map' },
      { name: 'Organizations', href: '/organisations' },
    ]
  },
  {
    title: 'Community',
    links: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Cultural Review', href: '/cultural-review' },
      { name: 'Become a Storyteller', href: '/storyteller/apply' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Help Center', href: '/help' },
      { name: 'Contact', href: '/contact' },
    ]
  },
  {
    title: 'Legal & Privacy',
    links: [
      { name: 'Privacy Policy', href: '/privacy', iconName: 'Shield' },
      { name: 'Terms of Service', href: '/terms', iconName: 'Eye' },
      { name: 'Consent Management', href: '/consent' },
      { name: 'Cultural Protocols', href: '/cultural-protocols' },
    ]
  }
]

const socialLinks = [
  { name: 'Website', href: '#', iconName: 'Globe' },
  { name: 'Contact', href: '/contact', iconName: 'Mail' },
]

// Helper function to render icons
const renderIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'Shield':
      return <Shield className={className} />
    case 'Eye':
      return <Eye className={className} />
    case 'Globe':
      return <Globe className={className} />
    case 'Mail':
      return <Mail className={className} />
    default:
      return null
  }
}

const culturalAcknowledgment = `
We acknowledge the Traditional Custodians of the lands on which we work and live. 
We pay our respects to Elders past, present and emerging. We are committed to 
honouring the stories, wisdom, and cultural heritage of Indigenous peoples while 
ensuring their voices are heard with respect and cultural integrity.
`

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-stone-50 to-clay-50/30 dark:from-stone-950 dark:to-clay-950/20 border-t border-stone-200 dark:border-stone-800">
      {/* Cultural Acknowledgment Section */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-clay-100/50 dark:bg-clay-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <LogoMark size={48} variant="default" />
            </div>
            <Typography variant="h3" className="mb-4 text-stone-900 dark:text-stone-100 font-bold">
              Cultural Acknowledgment
            </Typography>
            <Typography variant="body" className="text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl mx-auto font-medium">
              {culturalAcknowledgment.trim()}
            </Typography>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 group hover:opacity-80 transition-opacity">
              <Logo size="md" showWordmark={true} showTagline={true} />
            </Link>
            <Typography variant="body-small" className="text-stone-700 dark:text-stone-300 mb-6 leading-relaxed font-medium">
              A platform dedicated to preserving and sharing Indigenous stories, 
              wisdom, and cultural heritage with respect and cultural integrity.
            </Typography>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-stone-500 hover:text-clay-600 dark:text-stone-400 dark:hover:text-clay-400"
                >
                  <Link 
                    href={link.href}
                    aria-label={link.name}
                    {...(link.href.startsWith('http') && {
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    })}
                  >
                    {link.iconName && renderIcon(link.iconName, "w-4 h-4")}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="">
              <Typography variant="h6" className="mb-4 text-stone-900 dark:text-stone-100 font-bold">
                {section.title}
              </Typography>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-2 text-sm transition-colours",
                        "text-stone-700 dark:text-stone-300 font-medium",
                        "hover:text-stone-900 dark:hover:text-stone-100"
                      )}
                      {...(link.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                      })}
                    >
                      {link.iconName && renderIcon(link.iconName, "w-3 h-3")}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-stone-500 dark:text-stone-400">
              <Typography variant="small" className="text-center md:text-left text-stone-700 dark:text-stone-300 font-semibold">
                © {currentYear} Empathy Ledger. Built with respect for Indigenous cultures.
              </Typography>
            </div>

            <div className="flex items-center space-x-4 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <span className="flex items-center space-x-1">
                <LogoMark size={12} variant="default" />
                <span>Made with cultural respect</span>
              </span>
              <span>•</span>
              <span>OCAP Principles Applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Protocols Notice */}
      <div className="bg-sage-100/50 dark:bg-sage-950/20 border-t border-sage-200/50 dark:border-sage-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-center">
            <Typography variant="caption" className="text-stone-800 dark:text-stone-200 font-bold">
              Cultural Content Advisory:
            </Typography>
            <Typography variant="caption" className="text-sage-600 dark:text-sage-400">
              This platform contains cultural content that may be subject to cultural protocols. 
              Please engage respectfully and honour the wisdom shared.
            </Typography>
          </div>
        </div>
      </div>
    </footer>
  )
}