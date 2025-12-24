import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share,
  Play,
  Image as ImageIcon,
  Volume2,
  Shield,
  Crown,
  Globe,
  Calendar
} from "lucide-react"

const storyCardVariants = cva(
  "rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-md hover:scale-[1.01]",
        featured: "bg-gradient-to-br from-earth-50 to-clay-50 dark:from-earth-900/30 dark:to-clay-900/30 border-2 border-earth-300 dark:border-earth-700 shadow-cultural hover:scale-[1.01]",
        cultural: "bg-gradient-to-br from-sage-50 to-stone-50 dark:from-sage-900/30 dark:to-stone-900/30 border border-sage-200 dark:border-sage-700 shadow-md hover:scale-[1.01]",
        elder: "bg-gradient-to-br from-clay-100 to-earth-100 dark:from-clay-900/40 dark:to-earth-900/40 border-2 border-clay-400 dark:border-clay-600 shadow-cultural hover:scale-[1.01]",
        compact: "bg-card border border-border shadow-sm hover:shadow-md",
        minimal: "bg-muted border border-border hover:bg-card hover:shadow-md"
      },
      size: {
        default: "p-6",
        compact: "p-4",
        large: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface StoryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof storyCardVariants> {
  
  // Story data
  storyId: string
  title: string
  excerpt?: string
  content?: string
  
  // Storyteller info
  storytellerId?: string
  storytellerName?: string
  storytellerAvatar?: string
  
  // Cultural context
  culturalSensitivity?: 'public' | 'sensitive' | 'community' | 'elder'
  culturalAffiliations?: string[]
  languages?: string[]
  
  // Story metadata
  publishedDate?: string
  readTime?: number
  wordCount?: number
  
  // Media attachments
  hasAudio?: boolean
  hasVideo?: boolean
  hasImages?: boolean
  mediaCount?: number
  
  // Engagement metrics
  viewCount?: number
  likeCount?: number
  commentCount?: number
  shareCount?: number
  
  // Story categorization
  themes?: string[]
  storyType?: string
  audience?: string
  
  // Status
  status?: 'published' | 'draft' | 'pending' | 'private'
  isElderApproved?: boolean
  isFeatured?: boolean
  
  // Actions
  showActions?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

const StoryCard: React.FC<StoryCardProps> = ({
  className,
  variant,
  size,
  storyId,
  title,
  excerpt,
  storytellerId,
  storytellerName,
  storytellerAvatar,
  culturalSensitivity = 'public',
  culturalAffiliations = [],
  languages = [],
  publishedDate,
  readTime,
  hasAudio = false,
  hasVideo = false,
  hasImages = false,
  mediaCount = 0,
  viewCount = 0,
  likeCount = 0,
  commentCount = 0,
  themes = [],
  storyType,
  isElderApproved = false,
  isFeatured = false,
  showActions = true,
  onLike,
  onComment,
  onShare,
  ...props
}) => {
  const isCompact = variant === 'compact'
  const displayExcerpt = excerpt ? (excerpt.length > 150 ? `${excerpt.slice(0, 150)}...` : excerpt) : undefined

  const getSensitivityBadge = () => {
    switch (culturalSensitivity) {
      case 'sensitive':
        return (
          <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-300 dark:bg-clay-900/30 dark:text-clay-300 dark:border-clay-700 touch-target">
            <Shield className="w-3 h-3 mr-1" />
            Culturally Sensitive
          </Badge>
        )
      case 'community':
        return (
          <Badge variant="outline" className="text-xs bg-sage-50 text-sage-700 border-sage-300 dark:bg-sage-900/30 dark:text-sage-300 dark:border-sage-700 touch-target">
            <Globe className="w-3 h-3 mr-1" />
            Community Only
          </Badge>
        )
      case 'elder':
        return (
          <Badge variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-300 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target">
            <Crown className="w-3 h-3 mr-1" />
            Elder Knowledge
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={cn(storyCardVariants({ variant, size }), className)}
      {...props}
    >
      {/* Header with storyteller info */}
      {storytellerId && storytellerName && !isCompact && (
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/storytellers/${storytellerId}`}>
            <Avatar className="w-10 h-10 ring-2 ring-offset-1 ring-border dark:ring-offset-background">
              <AvatarImage src={storytellerAvatar} alt={storytellerName} />
              <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 dark:from-earth-700 dark:to-sage-700 text-earth-800 dark:text-earth-100 text-sm font-medium">
                {storytellerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/storytellers/${storytellerId}`}>
              <Typography variant="body-sm" className="font-medium text-foreground hover:text-primary transition-colours cursor-pointer">
                {storytellerName}
              </Typography>
            </Link>
            {publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <Typography variant="body-xs" className="text-muted-foreground">
                  {new Date(publishedDate).toLocaleDateString()}
                </Typography>
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-1">
            {isFeatured && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 touch-target">
                Featured
              </Badge>
            )}
            {isElderApproved && (
              <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-300 dark:bg-clay-900/30 dark:text-clay-300 dark:border-clay-700 touch-target">
                <Crown className="w-3 h-3 mr-1" />
                Approved
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Story Title */}
      <div className="mb-3">
        <Link href={`/stories/${storyId}`}>
          <Typography
            variant={isCompact ? "body-lg" : variant === 'featured' ? "cultural-title" : "story-title"}
            className={cn("hover:text-primary transition-colours cursor-pointer leading-tight",
              variant === 'elder' ? "text-clay-800 dark:text-clay-200" :
              variant === 'featured' ? "text-earth-800 dark:text-earth-200" :
              "text-foreground"
            )}
          >
            {title}
          </Typography>
        </Link>
      </div>

      {/* Story Excerpt */}
      {displayExcerpt && !isCompact && (
        <div className="mb-4">
          <Typography variant="story-excerpt" className="text-muted-foreground leading-relaxed">
            {displayExcerpt}
          </Typography>
        </div>
      )}

      {/* Cultural Context */}
      <div className="mb-4 space-y-2">
        {/* Cultural Sensitivity */}
        {getSensitivityBadge()}
        
        {/* Cultural Affiliations */}
        {culturalAffiliations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {culturalAffiliations.slice(0, isCompact ? 2 : 3).map((affiliation, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-sage-50 text-sage-700 border-sage-200 dark:bg-sage-900/30 dark:text-sage-300 dark:border-sage-700"
              >
                {affiliation}
              </Badge>
            ))}
            {culturalAffiliations.length > (isCompact ? 2 : 3) && (
              <Badge variant="outline" className="text-xs text-muted-foreground touch-target">
                +{culturalAffiliations.length - (isCompact ? 2 : 3)}
              </Badge>
            )}
          </div>
        )}

        {/* Story Themes */}
        {themes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {themes.slice(0, isCompact ? 2 : 4).map((theme, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-earth-50 text-earth-700 border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target"
              >
                {theme}
              </Badge>
            ))}
            {themes.length > (isCompact ? 2 : 4) && (
              <Badge variant="outline" className="text-xs text-muted-foreground touch-target">
                +{themes.length - (isCompact ? 2 : 4)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Media Indicators */}
      {(hasAudio || hasVideo || hasImages || mediaCount > 0) && !isCompact && (
        <div className="flex items-center gap-3 mb-4 p-2 bg-muted rounded-lg">
          {hasVideo && (
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4 text-earth-600 dark:text-earth-400" />
              <Typography variant="body-xs" className="text-muted-foreground">
                Video
              </Typography>
            </div>
          )}
          {hasAudio && (
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <Typography variant="body-xs" className="text-muted-foreground">
                Audio
              </Typography>
            </div>
          )}
          {hasImages && (
            <div className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-clay-600 dark:text-clay-400" />
              <Typography variant="body-xs" className="text-muted-foreground">
                Images
              </Typography>
            </div>
          )}
          {mediaCount > 0 && (
            <Typography variant="body-xs" className="text-muted-foreground">
              {mediaCount} files
            </Typography>
          )}
        </div>
      )}

      {/* Footer with metrics and actions */}
      <div className={cn(
        "flex items-center justify-between pt-4 border-t",
        variant === 'elder' ? "border-clay-200 dark:border-clay-700" :
        variant === 'featured' ? "border-earth-200 dark:border-earth-700" :
        "border-border"
      )}>
        {/* Metrics */}
        <div className="flex items-center gap-4">
          {readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Typography variant="body-xs" className="text-muted-foreground">
                {readTime} min
              </Typography>
            </div>
          )}

          {viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <Typography variant="body-xs" className="text-muted-foreground">
                {viewCount}
              </Typography>
            </div>
          )}

          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-earth-600 dark:text-earth-400" />
            <Typography variant="body-xs" className="text-foreground">
              Story
            </Typography>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onLike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 touch-target"
                aria-label={likeCount > 0 ? `Like story (${likeCount} likes)` : 'Like story'}
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                {likeCount > 0 && (
                  <span className="ml-1 text-xs">{likeCount}</span>
                )}
              </Button>
            )}

            {onComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onComment}
                className="text-muted-foreground hover:text-primary touch-target"
                aria-label={commentCount > 0 ? `Comment on story (${commentCount} comments)` : 'Comment on story'}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {commentCount > 0 && (
                  <span className="ml-1 text-xs">{commentCount}</span>
                )}
              </Button>
            )}

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 touch-target"
                aria-label="Share story"
              >
                <Share className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized story card variants
const FeaturedStoryCard: React.FC<Omit<StoryCardProps, 'variant'>> = (props) => (
  <StoryCard {...props} variant="featured" />
)

const ElderStoryCard: React.FC<Omit<StoryCardProps, 'variant'>> = (props) => (
  <StoryCard {...props} variant="elder" />
)

const CulturalStoryCard: React.FC<Omit<StoryCardProps, 'variant'>> = (props) => (
  <StoryCard {...props} variant="cultural" />
)

const CompactStoryCard: React.FC<Omit<StoryCardProps, 'variant'>> = (props) => (
  <StoryCard {...props} variant="compact" size="compact" />
)

export {
  StoryCard,
  FeaturedStoryCard,
  ElderStoryCard, 
  CulturalStoryCard,
  CompactStoryCard,
  storyCardVariants
}