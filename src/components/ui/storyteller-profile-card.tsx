import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Crown,
  Star,
  Globe,
  MessageCircle,
  Play,
  UserMinus
} from "lucide-react"

const storytellerCardVariants = cva(
  "rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-white border border-stone-200 shadow-md hover:scale-[1.02]",
        featured: "bg-gradient-to-br from-earth-50 to-clay-50 border-2 border-earth-300 shadow-cultural hover:scale-[1.02]",
        elder: "bg-gradient-to-br from-clay-100 to-earth-100 border-2 border-clay-400 shadow-cultural hover:scale-[1.02]",
        community: "bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 shadow-md hover:scale-[1.02]",
        compact: "bg-white border border-stone-200 shadow-sm hover:shadow-md"
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

export interface StorytellerProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof storytellerCardVariants> {
  
  // Profile data
  storytellerId: string
  name: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  
  // Cultural identity
  culturalBackground?: string
  culturalAffiliations?: string[]
  isElder?: boolean
  traditionalKnowledgeKeeper?: boolean
  languages?: string[]
  
  // Location and context
  location?: string
  joinedDate?: string
  
  // Storytelling metrics
  storiesCount?: number
  videosCount?: number
  communitiesCount?: number
  
  // Engagement data
  followersCount?: number
  engagementRate?: number
  lastActive?: string
  
  // Story themes
  themes?: string[]
  
  // Actions
  showActions?: boolean
  showRemove?: boolean
  canRemove?: boolean
  onFollow?: () => void
  onMessage?: () => void
  onRemove?: () => void
}

const StorytellerProfileCard: React.FC<StorytellerProfileCardProps> = ({
  className,
  variant,
  size,
  storytellerId,
  name,
  displayName,
  bio,
  avatarUrl,
  culturalBackground,
  culturalAffiliations = [],
  isElder = false,
  traditionalKnowledgeKeeper = false,
  languages = [],
  location,
  joinedDate,
  storiesCount = 0,
  videosCount = 0,
  communitiesCount = 0,
  followersCount = 0,
  engagementRate,
  lastActive,
  themes = [],
  showActions = true,
  showRemove = false,
  canRemove = false,
  onFollow,
  onMessage,
  onRemove,
  ...props
}) => {
  const isCompact = variant === 'compact'
  const displayBio = bio ? (bio.length > 120 ? `${bio.slice(0, 120)}...` : bio) : undefined

  return (
    <div 
      className={cn(storytellerCardVariants({ variant, size }), className)}
      {...props}
    >
      {/* Header Section */}
      <div className={cn("flex items-start gap-4", isCompact ? "mb-3" : "mb-4")}>
        <Link href={`/storytellers/${storytellerId}`}>
          <Avatar className={cn(isCompact ? "w-12 h-12" : "w-16 h-16", "ring-2 ring-offset-2", 
            variant === 'elder' ? "ring-clay-300" :
            variant === 'featured' ? "ring-earth-300" : 
            "ring-stone-200"
          )}>
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 font-semibold">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/storytellers/${storytellerId}`}>
              <Typography 
                variant={isCompact ? "body-lg" : "story-title"} 
                className={cn("hover:text-earth-700 transition-colours cursor-pointer truncate",
                  variant === 'elder' ? "text-clay-800" :
                  variant === 'featured' ? "text-earth-800" :
                  "text-stone-900"
                )}
              >
                {displayName || name}
              </Typography>
            </Link>
            
            {/* Status Badges */}
            <div className="flex items-center gap-1">
              {isElder && (
                <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Elder
                </Badge>
              )}
              {traditionalKnowledgeKeeper && (
                <Badge variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-300">
                  <Star className="w-3 h-3 mr-1" />
                  Keeper
                </Badge>
              )}
            </div>
          </div>
          
          {/* Cultural Background */}
          {culturalBackground && (
            <div className="flex items-center gap-1 mb-1">
              <Globe className="w-3 h-3 text-sage-600" />
              <Typography variant="body-xs" className="text-sage-700 font-medium">
                {culturalBackground}
              </Typography>
            </div>
          )}
          
          {/* Location */}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-500" />
              <Typography variant="body-xs" className="text-stone-600">
                {location}
              </Typography>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {showActions && !isCompact && (
          <div className="flex flex-col gap-2">
            {onFollow && (
              <Button variant="earth-outline" size="sm" onClick={onFollow}>
                <Heart className="w-3 h-3 mr-1" />
                Follow
              </Button>
            )}
            {onMessage && (
              <Button variant="sage-outline" size="sm" onClick={onMessage}>
                <MessageCircle className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
            {showRemove && canRemove && onRemove && (
              <Button variant="destructive" size="sm" onClick={onRemove}>
                <UserMinus className="w-3 h-3 mr-1" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {displayBio && !isCompact && (
        <div className="mb-4">
          <Typography variant="cultural-body" className="text-stone-600 leading-relaxed">
            {displayBio}
          </Typography>
        </div>
      )}

      {/* Cultural Affiliations */}
      {culturalAffiliations.length > 0 && (
        <div className="mb-4">
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
                +{culturalAffiliations.length - (isCompact ? 2 : 3)} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && !isCompact && (
        <div className="mb-4">
          <Typography variant="body-xs" className="text-stone-500 mb-1">
            Languages:
          </Typography>
          <div className="flex flex-wrap gap-1">
            {languages.slice(0, 4).map((language, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-clay-50 text-clay-700 border-clay-200"
              >
                {language}
              </Badge>
            ))}
            {languages.length > 4 && (
              <Badge variant="outline" className="text-xs text-stone-600">
                +{languages.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Story Themes */}
      {themes.length > 0 && !isCompact && (
        <div className="mb-4">
          <Typography variant="body-xs" className="text-stone-500 mb-2">
            Story Themes:
          </Typography>
          <div className="flex flex-wrap gap-1">
            {themes.slice(0, 3).map((theme, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-earth-50 text-earth-700 border-earth-200"
              >
                {theme}
              </Badge>
            ))}
            {themes.length > 3 && (
              <Badge variant="outline" className="text-xs text-stone-600">
                +{themes.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className={cn(
        "flex items-center justify-between pt-4 border-t",
        variant === 'elder' ? "border-clay-200" :
        variant === 'featured' ? "border-earth-200" :
        "border-stone-200"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-earth-600" />
            <Typography variant="body-xs" className="text-stone-700 font-medium">
              {storiesCount}
            </Typography>
          </div>
          
          {videosCount > 0 && (
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4 text-sage-600" />
              <Typography variant="body-xs" className="text-stone-700 font-medium">
                {videosCount}
              </Typography>
            </div>
          )}
          
          {communitiesCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-clay-600" />
              <Typography variant="body-xs" className="text-stone-700 font-medium">
                {communitiesCount}
              </Typography>
            </div>
          )}
        </div>

        {/* Engagement */}
        {(followersCount > 0 || engagementRate) && (
          <div className="flex items-center gap-2">
            {followersCount > 0 && (
              <Typography variant="body-xs" className="text-stone-500">
                {followersCount} followers
              </Typography>
            )}
            {engagementRate && engagementRate > 50 && (
              <Badge variant="outline" className="text-xs bg-success-50 text-success-700 border-success-200">
                High Engagement
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions for Compact */}
      {showActions && isCompact && (
        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
          <Link href={`/storytellers/${storytellerId}`}>
            <Button variant="ghost" size="sm" className="text-earth-700 hover:text-earth-800">
              View Profile
            </Button>
          </Link>
          <div className="flex gap-2">
            {onFollow && (
              <Button variant="ghost" size="sm" onClick={onFollow}>
                <Heart className="w-3 h-3" />
              </Button>
            )}
            {onMessage && (
              <Button variant="ghost" size="sm" onClick={onMessage}>
                <MessageCircle className="w-3 h-3" />
              </Button>
            )}
            {showRemove && canRemove && onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <UserMinus className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized variants
const ElderStorytellerCard: React.FC<Omit<StorytellerProfileCardProps, 'variant'>> = (props) => (
  <StorytellerProfileCard {...props} variant="elder" />
)

const FeaturedStorytellerCard: React.FC<Omit<StorytellerProfileCardProps, 'variant'>> = (props) => (
  <StorytellerProfileCard {...props} variant="featured" />
)

const CompactStorytellerCard: React.FC<Omit<StorytellerProfileCardProps, 'variant'>> = (props) => (
  <StorytellerProfileCard {...props} variant="compact" size="compact" />
)

// Loading skeleton variant
const StorytellerProfileCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({ variant = 'default' }) => {
  const isCompact = variant === 'compact'

  return (
    <div className={cn(storytellerCardVariants({ variant: 'default', size: isCompact ? 'compact' : 'default' }))}>
      <div className={cn("flex items-start gap-4", isCompact ? "mb-3" : "mb-4")}>
        <Skeleton className={cn("rounded-full", isCompact ? "w-12 h-12" : "w-16 h-16")} />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {!isCompact && (
        <>
          <Skeleton className="h-16 w-full mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export {
  StorytellerProfileCard,
  ElderStorytellerCard,
  FeaturedStorytellerCard,
  CompactStorytellerCard,
  StorytellerProfileCardSkeleton,
  storytellerCardVariants
}