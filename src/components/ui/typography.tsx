import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Cultural variants with generous spacing and readable typography
      "cultural-display": "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-clay-900 dark:text-clay-100 leading-relaxed",
      "cultural-heading": "text-2xl md:text-3xl font-bold text-clay-800 dark:text-clay-200 leading-relaxed",
      "cultural-subheading": "text-xl md:text-2xl font-semibold text-stone-700 dark:text-stone-300 leading-relaxed",
      "cultural-body": "text-base md:text-lg leading-loose text-stone-600 dark:text-stone-400",
      
      // Standard variants
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      
      // Size variants
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      caption: "text-xs text-muted-foreground",
      "body-small": "text-sm leading-6",
      
      // Utility variants
      muted: "text-sm text-muted-foreground",
      lead: "text-xl text-muted-foreground",
      
      // Story-specific variants
      "story-title": "text-2xl font-bold text-clay-800 dark:text-clay-200 leading-tight",
      "story-excerpt": "text-base text-stone-600 dark:text-stone-400 leading-relaxed",
      "storyteller-name": "text-lg font-semibold text-sage-700 dark:text-sage-300",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    // Auto-select HTML element based on variant if no 'as' prop is provided
    const getDefaultElement = (): keyof JSX.IntrinsicElements => {
      if (as) return as;
      
      switch (variant) {
        case 'h1':
        case 'cultural-display':
          return 'h1';
        case 'h2':
        case 'cultural-heading':
          return 'h2';
        case 'h3':
        case 'cultural-subheading':
          return 'h3';
        case 'h4':
          return 'h4';
        case 'h5':
          return 'h5';
        case 'h6':
          return 'h6';
        case 'blockquote':
          return 'blockquote';
        case 'large':
        case 'small':
        case 'caption':
        case 'body-small':
        case 'muted':
        case 'lead':
        case 'story-title':
        case 'storyteller-name':
          return 'p';
        default:
          return 'p';
      }
    };

    const Component = getDefaultElement();

    return React.createElement(
      Component,
      {
        className: cn(typographyVariants({ variant }), className),
        ref,
        ...props,
      }
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };