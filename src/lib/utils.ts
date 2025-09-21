import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind classes with tailwind-merge
 * This ensures proper Tailwind class precedence and prevents conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cultural colour utilities for consistent theming
 */
export const culturalColors = {
  clay: {
    50: "clay-50",
    100: "clay-100",
    200: "clay-200",
    300: "clay-300",
    400: "clay-400",
    500: "clay-500",
    600: "clay-600",
    700: "clay-700",
    800: "clay-800",
    900: "clay-900",
    950: "clay-950",
  },
  stone: {
    50: "stone-50",
    100: "stone-100",
    200: "stone-200",
    300: "stone-300",
    400: "stone-400",
    500: "stone-500",
    600: "stone-600",
    700: "stone-700",
    800: "stone-800",
    900: "stone-900",
    950: "stone-950",
  },
  sage: {
    50: "sage-50",
    100: "sage-100",
    200: "sage-200",
    300: "sage-300",
    400: "sage-400",
    500: "sage-500",
    600: "sage-600",
    700: "sage-700",
    800: "sage-800",
    900: "sage-900",
    950: "sage-950",
  },
  sky: {
    50: "sky-50",
    100: "sky-100",
    200: "sky-200",
    300: "sky-300",
    400: "sky-400",
    500: "sky-500",
    600: "sky-600",
    700: "sky-700",
    800: "sky-800",
    900: "sky-900",
    950: "sky-950",
  },
} as const;

/**
 * Cultural spacing utilities for consistent generous spacing
 */
export const culturalSpacing = {
  xs: "spacing-xs", // 0.25rem
  sm: "spacing-sm", // 0.5rem
  md: "spacing-md", // 1rem
  lg: "spacing-lg", // 1.5rem
  xl: "spacing-xl", // 2rem
  "2xl": "spacing-2xl", // 3rem
  "3xl": "spacing-3xl", // 4rem
  "4xl": "spacing-4xl", // 6rem
  "5xl": "spacing-5xl", // 8rem
} as const;

/**
 * Cultural typography utilities
 */
export const culturalTypography = {
  display: "text-cultural-display",
  heading: "text-cultural-heading",
  subheading: "text-cultural-subheading",
  body: "text-cultural-body",
  caption: "text-cultural-caption",
} as const;

/**
 * Generates consistent focus styles for accessibility
 */
export function getFocusStyles(variant: "default" | "cultural" = "default") {
  return variant === "cultural" 
    ? "focus-cultural focus-visible:outline-none" 
    : "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
}

/**
 * Formats a string to be kebab-case for CSS classes or IDs
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats a string to be title case for display
 */
export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Truncates text with ellipsis at specified length
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Cultural-specific variant mappings for components
 */
export const culturalVariants = {
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    clay: "bg-clay-600 text-clay-50 hover:bg-clay-700",
    sage: "bg-sage-600 text-sage-50 hover:bg-sage-700",
    sky: "bg-sky-600 text-sky-50 hover:bg-sky-700",
  },
  card: {
    default: "bg-card text-card-foreground border border-border shadow-md",
    cultural: "bg-card text-card-foreground border border-border shadow-cultural",
    elevated: "bg-card text-card-foreground border border-border shadow-lg",
    interactive: "bg-card text-card-foreground border border-border shadow-md hover:shadow-lg transition-shadow",
  },
} as const;

/**
 * Accessibility helpers
 */
export const a11y = {
  screenReader: "sr-only",
  focusVisible: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  skipToContent: "absolute left-[-9999px] top-auto w-1 h-1 focus:left-6 focus:top-7 focus:w-auto focus:h-auto bg-background text-foreground p-2 rounded",
} as const;

/**
 * Responsive breakpoint helpers
 */
export const breakpoints = {
  sm: "sm", // 640px
  md: "md", // 768px  
  lg: "lg", // 1024px
  xl: "xl", // 1280px
  "2xl": "2xl", // 1536px
} as const;

/**
 * Animation and transition utilities
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  slideOut: "animate-out slide-out-to-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
} as const;