import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        cultural: "shadow-cultural hover:shadow-lg border-stone-200 dark:border-stone-800",
        elevated: "shadow-lg hover:shadow-xl",
        interactive: "shadow-sm hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-transform",
        story: "shadow-cultural hover:shadow-lg border-clay-200 dark:border-clay-800 bg-gradient-to-br from-background to-clay-50/30 dark:to-clay-950/20",
        storyteller: "shadow-cultural hover:shadow-lg border-sage-200 dark:border-sage-800 bg-gradient-to-br from-background to-sage-50/30 dark:to-sage-950/20",
        feature: "shadow-lg hover:shadow-xl border-sky-200 dark:border-sky-800 bg-gradient-to-br from-background to-sky-50/20 dark:to-sky-950/10",
        outline: "border-2 border-border shadow-none hover:bg-muted/50",
        ghost: "border-transparent shadow-none hover:bg-muted hover:border-border",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-12",
        // Cultural generous padding
        cultural: "p-8",
        compact: "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size, className }))}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      cultural ? "pb-4" : "pb-6",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    cultural?: boolean;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, cultural = false, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref as any}
    className={cn(
      "font-semibold leading-none tracking-tight",
      cultural 
        ? "text-cultural-subheading text-clay-800 dark:text-clay-200" 
        : "text-2xl",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      cultural 
        ? "text-cultural-body leading-relaxed text-stone-600 dark:text-stone-400" 
        : "",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      cultural ? "space-y-4" : "pt-0", 
      className
    )} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      cultural ? "pt-6 space-x-4" : "pt-6",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * StoryCard - Specialized card for story content
 */
const StoryCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    featured?: boolean;
    interactive?: boolean;
  }
>(({ className, featured = false, interactive = false, ...props }, ref) => (
  <Card
    ref={ref}
    variant={featured ? "feature" : "story"}
    size="cultural"
    className={cn(
      interactive && "hover:scale-[1.02] cursor-pointer",
      className
    )}
    {...props}
  />
));
StoryCard.displayName = "StoryCard";

/**
 * StorytellerCard - Specialized card for storyteller profiles
 */
const StorytellerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
  }
>(({ className, interactive = false, ...props }, ref) => (
  <Card
    ref={ref}
    variant="storyteller"
    size="cultural"
    className={cn(
      interactive && "hover:scale-[1.02] cursor-pointer",
      className
    )}
    {...props}
  />
));
StorytellerCard.displayName = "StorytellerCard";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StoryCard,
  StorytellerCard,
  cardVariants
};