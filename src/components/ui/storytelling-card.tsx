import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const storytellingCardVariants = cva(
  "rounded-xl transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        // Primary storytelling card - warm and inviting
        default: "bg-stone-50 border border-stone-200 shadow-md hover:shadow-lg hover:scale-[1.02]",
        
        // Featured story card - elevated with cultural colours
        featured: "bg-gradient-to-br from-earth-50 to-clay-50 border border-earth-200 shadow-cultural hover:shadow-lg hover:scale-[1.02]",
        
        // Community story card - sage accents
        community: "bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 shadow-md hover:shadow-lg hover:scale-[1.02]",
        
        // Elder story card - deeper earth tones
        elder: "bg-gradient-to-br from-clay-100 to-earth-100 border border-clay-300 shadow-cultural hover:shadow-xl hover:scale-[1.02]",
        
        // Interactive card - for forms and actions
        interactive: "bg-white border-2 border-stone-200 shadow-sm hover:border-earth-300 hover:shadow-md transition-colours",
        
        // Minimal card - subtle backgrounds
        minimal: "bg-white border border-stone-100 shadow-sm hover:shadow-md",
        
        // Glass effect card - for overlays
        glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg",
      },
      size: {
        sm: "p-4",      // 32px padding
        default: "p-6", // 48px padding  
        lg: "p-8",      // 64px padding
        xl: "p-10",     // 80px padding
      },
      spacing: {
        none: "",
        sm: "space-y-2",    // 16px
        default: "space-y-3", // 24px
        lg: "space-y-4",    // 32px
        xl: "space-y-6",    // 48px
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "default",
    },
  }
)

const cardHeaderVariants = cva("flex flex-col", {
  variants: {
    spacing: {
      none: "",
      sm: "space-y-1",
      default: "space-y-2", 
      lg: "space-y-3",
    }
  },
  defaultVariants: {
    spacing: "default"
  }
})

const cardContentVariants = cva("", {
  variants: {
    spacing: {
      none: "",
      sm: "space-y-2",
      default: "space-y-3",
      lg: "space-y-4",
    }
  },
  defaultVariants: {
    spacing: "default"
  }
})

const cardFooterVariants = cva("flex items-center", {
  variants: {
    justify: {
      start: "justify-start",
      centre: "justify-center", 
      end: "justify-end",
      between: "justify-between",
    },
    spacing: {
      none: "",
      sm: "pt-2",
      default: "pt-3",
      lg: "pt-4",
    }
  },
  defaultVariants: {
    justify: "between",
    spacing: "default"
  }
})

export interface StorytellingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof storytellingCardVariants> {}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const StorytellingCard = React.forwardRef<HTMLDivElement, StorytellingCardProps>(
  ({ className, variant, size, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(storytellingCardVariants({ variant, size, spacing, className }))}
      {...props}
    />
  )
)
StorytellingCard.displayName = "StorytellingCard"

const StorytellingCardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ spacing, className }))}
      {...props}
    />
  )
)
StorytellingCardHeader.displayName = "StorytellingCardHeader"

const StorytellingCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-display-sm font-semibold text-earth-800 leading-tight", className)}
    {...props}
  />
))
StorytellingCardTitle.displayName = "StorytellingCardTitle"

const StorytellingCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-md text-stone-600 leading-relaxed", className)}
    {...props}
  />
))
StorytellingCardDescription.displayName = "StorytellingCardDescription"

const StorytellingCardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ spacing, className }))}
      {...props}
    />
  )
)
StorytellingCardContent.displayName = "StorytellingCardContent"

const StorytellingCardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ justify, spacing, className }))}
      {...props}
    />
  )
)
StorytellingCardFooter.displayName = "StorytellingCardFooter"

export {
  StorytellingCard,
  StorytellingCardHeader,
  StorytellingCardTitle,
  StorytellingCardDescription,
  StorytellingCardContent,
  StorytellingCardFooter,
}