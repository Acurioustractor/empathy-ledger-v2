import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display Scale - Hero and page titles
      "display-2xl": "text-display-2xl text-earth-900 dark:text-earth-100",
      "display-xl": "text-display-xl text-earth-900 dark:text-earth-100", 
      "display-lg": "text-display-lg text-earth-900 dark:text-earth-100",
      "display-md": "text-display-md text-earth-800 dark:text-earth-200",
      "display-sm": "text-display-sm text-earth-800 dark:text-earth-200",
      
      // Heading Scale - Section and content headers
      h1: "text-display-lg text-earth-900 dark:text-earth-100 scroll-m-20",
      h2: "text-display-md text-earth-800 dark:text-earth-200 scroll-m-20 border-b border-stone-200 pb-3 first:mt-0",
      h3: "text-display-sm text-earth-800 dark:text-earth-200 scroll-m-20",
      h4: "text-body-xl font-semibold text-earth-700 dark:text-earth-300 scroll-m-20",
      h5: "text-body-lg font-semibold text-earth-700 dark:text-earth-300 scroll-m-20",
      h6: "text-body-md font-semibold text-earth-700 dark:text-earth-300 scroll-m-20",
      
      // Body Text Scale - Content and descriptions
      "body-xl": "text-body-xl text-stone-700 dark:text-stone-300",
      "body-lg": "text-body-lg text-stone-700 dark:text-stone-300",
      "body-md": "text-body-md text-stone-600 dark:text-stone-400",
      "body-sm": "text-body-sm text-stone-600 dark:text-stone-400",
      "body-xs": "text-body-xs text-stone-500 dark:text-stone-500",
      
      // Label Scale - UI labels and small text
      "label-lg": "text-label-lg text-stone-700 dark:text-stone-300",
      "label-md": "text-label-md text-stone-700 dark:text-stone-300", 
      "label-sm": "text-label-sm text-stone-600 dark:text-stone-400",
      
      // Cultural Storytelling Variants - Warm and inviting
      "cultural-hero": "text-display-xl text-earth-900 dark:text-earth-100 leading-tight",
      "cultural-title": "text-display-md text-clay-800 dark:text-clay-200 leading-snug",
      "cultural-subtitle": "text-body-xl text-sage-700 dark:text-sage-300 leading-relaxed",
      "cultural-body": "text-body-lg text-stone-600 dark:text-stone-400 leading-loose",
      "cultural-caption": "text-body-sm text-stone-500 dark:text-stone-500 leading-normal",
      
      // Story-specific variants
      "story-title": "text-display-sm text-clay-800 dark:text-clay-200 leading-tight",
      "story-excerpt": "text-body-lg text-stone-600 dark:text-stone-400 leading-relaxed",
      "story-meta": "text-body-sm text-sage-600 dark:text-sage-400 leading-normal",
      "storyteller-name": "text-body-lg font-semibold text-sage-700 dark:text-sage-300",
      "storyteller-role": "text-body-sm text-stone-500 dark:text-stone-500",
      
      // Legacy variants for backwards compatibility
      p: "text-body-md text-stone-600 dark:text-stone-400 leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "text-body-lg text-stone-700 dark:text-stone-300 mt-6 border-l-2 border-earth-300 pl-6 italic leading-loose",
      large: "text-body-xl font-semibold text-stone-700 dark:text-stone-300",
      small: "text-body-sm font-medium text-stone-600 dark:text-stone-400 leading-none",
      caption: "text-body-xs text-stone-500 dark:text-stone-500",
      muted: "text-body-sm text-stone-500 dark:text-stone-500",
      lead: "text-body-xl text-stone-600 dark:text-stone-400",
    },
  },
  defaultVariants: {
    variant: "body-md",
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