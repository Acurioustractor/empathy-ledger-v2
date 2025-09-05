import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display headings - for hero sections and major headings
      display: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-clay-900 dark:text-clay-100",
      "display-lg": "scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-6xl xl:text-7xl text-clay-900 dark:text-clay-100",
      
      // Heading hierarchy
      h1: "scroll-m-20 text-4xl font-bold tracking-tight text-clay-800 dark:text-clay-200",
      h2: "scroll-m-20 border-b border-stone-200 dark:border-stone-800 pb-2 text-3xl font-semibold tracking-tight text-clay-800 dark:text-clay-200 first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-clay-700 dark:text-clay-300",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight text-clay-700 dark:text-clay-300",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight text-clay-700 dark:text-clay-300",
      h6: "scroll-m-20 text-base font-semibold tracking-tight text-clay-700 dark:text-clay-300",
      
      // Cultural headings with enhanced styling
      "cultural-display": "text-cultural-display text-clay-900 dark:text-clay-100 font-bold leading-tight tracking-tight",
      "cultural-heading": "text-cultural-heading text-clay-800 dark:text-clay-200 font-semibold leading-tight",
      "cultural-subheading": "text-cultural-subheading text-clay-700 dark:text-clay-300 font-medium",
      
      // Body text variants
      body: "text-cultural-body leading-7 text-stone-700 dark:text-stone-300 [&:not(:first-child)]:mt-6",
      "body-large": "text-lg leading-8 text-stone-700 dark:text-stone-300 [&:not(:first-child)]:mt-6",
      "body-small": "text-sm leading-6 text-stone-600 dark:text-stone-400",
      
      // Specialized text styles
      lead: "text-xl text-muted-foreground leading-7",
      large: "text-lg font-semibold text-stone-900 dark:text-stone-100",
      small: "text-sm font-medium leading-none text-stone-600 dark:text-stone-400",
      muted: "text-sm text-muted-foreground text-stone-500 dark:text-stone-500",
      caption: "text-cultural-caption text-stone-500 dark:text-stone-500",
      
      // Interactive text
      link: "text-clay-700 dark:text-clay-300 underline-offset-4 hover:underline font-medium transition-colors hover:text-clay-800 dark:hover:text-clay-200",
      "link-muted": "text-stone-600 dark:text-stone-400 underline-offset-4 hover:underline transition-colors hover:text-stone-800 dark:hover:text-stone-200",
      
      // Code and technical text
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      
      // Quote and emphasis
      blockquote: "mt-6 border-l-2 border-clay-300 dark:border-clay-700 pl-6 italic text-stone-700 dark:text-stone-300",
      quote: "text-lg italic text-stone-600 dark:text-stone-400 border-l-4 border-clay-200 dark:border-clay-800 pl-4",
      
      // Lists
      list: "my-6 ml-6 list-disc [&>li]:mt-2 text-stone-700 dark:text-stone-300",
      "list-ordered": "my-6 ml-6 list-decimal [&>li]:mt-2 text-stone-700 dark:text-stone-300",
    },
    align: {
      left: "text-left",
      center: "text-center", 
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: {
    variant: "body",
    align: "left",
    weight: "normal",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: 
    | "p" 
    | "div" 
    | "span" 
    | "h1" 
    | "h2" 
    | "h3" 
    | "h4" 
    | "h5" 
    | "h6"
    | "blockquote"
    | "code"
    | "pre"
    | "ul"
    | "ol"
    | "li";
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, weight, as, ...props }, ref) => {
    // Auto-select appropriate HTML element based on variant
    let Component = as;
    if (!Component) {
      switch (variant) {
        case "display":
        case "display-lg":
        case "cultural-display":
        case "h1":
          Component = "h1";
          break;
        case "h2":
        case "cultural-heading":
          Component = "h2";
          break;
        case "h3":
        case "cultural-subheading":
          Component = "h3";
          break;
        case "h4":
          Component = "h4";
          break;
        case "h5":
          Component = "h5";
          break;
        case "h6":
          Component = "h6";
          break;
        case "blockquote":
        case "quote":
          Component = "blockquote";
          break;
        case "code":
          Component = "code";
          break;
        case "list":
          Component = "ul";
          break;
        case "list-ordered":
          Component = "ol";
          break;
        default:
          Component = "p";
      }
    }

    return (
      <Component
        className={cn(typographyVariants({ variant, align, weight, className }))}
        ref={ref as any}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

// Convenience components for common use cases
const Heading = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant"> & {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    cultural?: boolean;
  }
>(({ level, cultural = false, className, ...props }, ref) => {
  const culturalVariants = {
    1: "cultural-display",
    2: "cultural-heading", 
    3: "cultural-subheading",
    4: "h4",
    5: "h5",
    6: "h6",
  } as const;

  const standardVariants = {
    1: "h1",
    2: "h2",
    3: "h3", 
    4: "h4",
    5: "h5",
    6: "h6",
  } as const;

  const variant = cultural ? culturalVariants[level] : standardVariants[level];

  return (
    <Typography
      variant={variant as any}
      as={`h${level}` as any}
      ref={ref as any}
      className={className}
      {...props}
    />
  );
});
Heading.displayName = "Heading";

const Text = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant"> & {
    variant?: "body" | "body-large" | "body-small" | "lead" | "muted" | "caption";
    cultural?: boolean;
  }
>(({ variant = "body", cultural = false, ...props }, ref) => {
  return (
    <Typography
      variant={variant}
      ref={ref as any}
      {...props}
    />
  );
});
Text.displayName = "Text";

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: "link" | "link-muted";
    external?: boolean;
  }
>(({ className, variant = "link", external = false, children, ...props }, ref) => {
  return (
    <a
      className={cn(typographyVariants({ variant: variant as any }), className)}
      ref={ref}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    >
      {children}
      {external && (
        <span className="ml-1 inline-block w-3 h-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15,3 21,3 21,9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </span>
      )}
    </a>
  );
});
Link.displayName = "Link";

export { Typography, Heading, Text, Link, typographyVariants };