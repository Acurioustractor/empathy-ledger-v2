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
        default: "bg-white border border-stone-200 shadow-md hover:scale-[1.01]",
        featured: "bg-gradient-to-br from-earth-50 to-clay-50 border-2 border-earth-300 shadow-cultural hover:scale-[1.01]",
        cultural: "bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 shadow-md hover:scale-[1.01]",
        elder: "bg-gradient-to-br from-clay-100 to-earth-100 border-2 border-clay-400 shadow-cultural hover:scale-[1.01]",
        compact: "bg-white border border-stone-200 shadow-sm hover:shadow-md",
        minimal: "bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md"
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
          <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-300">
            <Shield className="w-3 h-3 mr-1" />
            Culturally Sensitive
          </Badge>
        )
      case 'community':
        return (
          <Badge variant="outline" className="text-xs bg-sage-50 text-sage-700 border-sage-300">
            <Globe className="w-3 h-3 mr-1" />
            Community Only
          </Badge>
        )
      case 'elder':
        return (
          <Badge variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-300">
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
            <Avatar className="w-10 h-10 ring-2 ring-offset-1 ring-stone-200">
              <AvatarImage src={storytellerAvatar} alt={storytellerName} />
              <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 text-sm font-medium">
                {storytellerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/storytellers/${storytellerId}`}>
              <Typography variant="body-sm" className="font-medium text-stone-700 hover:text-earth-700 transition-colours cursor-pointer">
                {storytellerName}
              </Typography>
            </Link>
            {publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                <Typography variant="body-xs" className="text-stone-500">
                  {new Date(publishedDate).toLocaleDateString()}
                </Typography>
              </div>
            )}
          </div>
          
          {/* Status badges */}
          <div className="flex items-center gap-1">
            {isFeatured && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                Featured
              </Badge>
            )}
            {isElderApproved && (
              <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-300">
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
            className={cn("hover:text-earth-700 transition-colours cursor-pointer leading-tight",
              variant === 'elder' ? "text-clay-800" :
              variant === 'featured' ? "text-earth-800" :
              "text-stone-900"
            )}
          >
            {title}
          </Typography>
        </Link>
      </div>

      {/* Story Excerpt */}
      {displayExcerpt && !isCompact && (
        <div className="mb-4">
          <Typography variant="story-excerpt" className="text-stone-600 leading-relaxed">
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
                className="text-xs bg-sage-50 text-sage-700 border-sage-200"
              >
                {affiliation}
              </Badge>
            ))}
            {culturalAffiliations.length > (isCompact ? 2 : 3) && (
              <Badge variant="outline" className="text-xs text-stone-600">
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
                className="text-xs bg-earth-50 text-earth-700 border-earth-200"
              >
                {theme}
              </Badge>
            ))}
            {themes.length > (isCompact ? 2 : 4) && (
              <Badge variant="outline" className="text-xs text-stone-600">
                +{themes.length - (isCompact ? 2 : 4)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Media Indicators */}
      {(hasAudio || hasVideo || hasImages || mediaCount > 0) && !isCompact && (
        <div className="flex items-center gap-3 mb-4 p-2 bg-stone-50 rounded-lg">
          {hasVideo && (
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4 text-earth-600" />
              <Typography variant="body-xs" className="text-stone-600">
                Video
              </Typography>
            </div>
          )}
          {hasAudio && (
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-sage-600" />
              <Typography variant="body-xs" className="text-stone-600">
                Audio
              </Typography>
            </div>
          )}
          {hasImages && (
            <div className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-clay-600" />
              <Typography variant="body-xs" className="text-stone-600">
                Images
              </Typography>
            </div>
          )}
          {mediaCount > 0 && (
            <Typography variant="body-xs" className="text-stone-500">
              {mediaCount} files
            </Typography>
          )}
        </div>
      )}

      {/* Footer with metrics and actions */}
      <div className={cn(
        "flex items-center justify-between pt-4 border-t",
        variant === 'elder' ? "border-clay-200" :
        variant === 'featured' ? "border-earth-200" :
        "border-stone-200"
      )}>
        {/* Metrics */}
        <div className="flex items-center gap-4">
          {readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500" />
              <Typography variant="body-xs" className="text-stone-600">
                {readTime} min
              </Typography>
            </div>
          )}
          
          {viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-stone-500" />
              <Typography variant="body-xs" className="text-stone-600">
                {viewCount}
              </Typography>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-earth-600" />
            <Typography variant="body-xs" className="text-stone-700">
              Story
            </Typography>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onLike && (
              <Button variant="ghost" size="sm" onClick={onLike} className="text-stone-600 hover:text-red-600">
                <Heart className="w-4 h-4" />
                {likeCount > 0 && (
                  <span className="ml-1 text-xs">{likeCount}</span>
                )}
              </Button>
            )}
            
            {onComment && (
              <Button variant="ghost" size="sm" onClick={onComment} className="text-stone-600 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                {commentCount > 0 && (
                  <span className="ml-1 text-xs">{commentCount}</span>
                )}
              </Button>
            )}
            
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare} className="text-stone-600 hover:text-green-600">
                <Share className="w-4 h-4" />
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