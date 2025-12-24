'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Share2,
  Link2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Code2,
  QrCode,
  Lock,
  Users,
  Globe,
  ExternalLink
} from 'lucide-react'

interface StoryShareSheetProps {
  storyId: string
  storyTitle: string
  storyExcerpt?: string
  visibility: 'private' | 'community' | 'public'
  trigger?: React.ReactNode
}

export function StoryShareSheet({
  storyId,
  storyTitle,
  storyExcerpt,
  visibility,
  trigger
}: StoryShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const storyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/stories/${storyId}`
    : `/stories/${storyId}`

  const embedCode = `<iframe src="${storyUrl}/embed" width="100%" height="400" frameborder="0" title="${storyTitle}"></iframe>`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setEmbedCopied(true)
      setTimeout(() => setEmbedCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: storyExcerpt || `Check out this story: ${storyTitle}`,
          url: storyUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }
  }

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(storyTitle)}&url=${encodeURIComponent(storyUrl)}`,
      color: 'hover:bg-sky-50 hover:text-sky-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`,
      color: 'hover:bg-sage-50 hover:text-sage-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`,
      color: 'hover:bg-sage-50 hover:text-sage-700'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(storyTitle)}&body=${encodeURIComponent(`Check out this story: ${storyUrl}`)}`,
      color: 'hover:bg-stone-50 hover:text-stone-700'
    }
  ]

  const visibilityInfo = {
    private: {
      icon: Lock,
      label: 'Private',
      description: 'Only you can see this story',
      color: 'text-stone-600'
    },
    community: {
      icon: Users,
      label: 'Community',
      description: 'Visible to community members',
      color: 'text-sage-600'
    },
    public: {
      icon: Globe,
      label: 'Public',
      description: 'Anyone with the link can view',
      color: 'text-green-600'
    }
  }

  const currentVisibility = visibilityInfo[visibility]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Story
          </SheetTitle>
          <SheetDescription>
            Share "{storyTitle}" with others
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Visibility Status */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <currentVisibility.icon className={`w-5 h-5 ${currentVisibility.color}`} />
                <div>
                  <p className="font-medium text-sm">{currentVisibility.label}</p>
                  <p className="text-xs text-muted-foreground">{currentVisibility.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {visibility === 'private' ? (
            <div className="text-center py-6 text-muted-foreground">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">This story is private</p>
              <p className="text-sm mt-1">
                Change visibility to "Community" or "Public" to share with others.
              </p>
              <Button variant="outline" className="mt-4">
                Change Visibility
              </Button>
            </div>
          ) : (
            <>
              {/* Copy Link Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Story Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={storyUrl}
                    readOnly
                    className="text-sm bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Link copied to clipboard!</p>
                )}
              </div>

              {/* Native Share (Mobile) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  onClick={shareNative}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Share via Device
                </Button>
              )}

              <Separator />

              {/* Social Share Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((social) => (
                    <Button
                      key={social.name}
                      variant="outline"
                      className={`gap-2 ${social.color}`}
                      asChild
                    >
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <social.icon className="w-4 h-4" />
                        {social.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              {visibility === 'public' && (
                <>
                  <Separator />

                  {/* Embed Code */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Embed on Website</Label>
                    </div>
                    <div className="relative">
                      <textarea
                        value={embedCode}
                        readOnly
                        className="w-full h-20 p-2 text-xs bg-muted/50 rounded-md border resize-none font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyEmbed}
                        className="absolute top-1 right-1"
                      >
                        {embedCopied ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    {embedCopied && (
                      <p className="text-xs text-green-600">Embed code copied!</p>
                    )}
                  </div>

                  {/* QR Code placeholder */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">QR Code</Label>
                    </div>
                    <div className="flex justify-center p-4 bg-muted/50 rounded-md">
                      <div className="w-32 h-32 bg-white rounded-md flex items-center justify-center border-2 border-dashed">
                        <span className="text-xs text-muted-foreground text-center">
                          QR Code<br />Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default StoryShareSheet
