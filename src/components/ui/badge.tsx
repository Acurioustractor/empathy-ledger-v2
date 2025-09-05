import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80",
        // Cultural variants with earth-tone palette
        clay:
          "border-transparent bg-clay-600 text-clay-50 shadow hover:bg-clay/80",
        sage:
          "border-transparent bg-sage-600 text-sage-50 shadow hover:bg-sage/80",
        sky:
          "border-transparent bg-sky-600 text-sky-50 shadow hover:bg-sky/80",
        "clay-soft":
          "border-clay-200 bg-clay-50 text-clay-700 dark:border-clay-800 dark:bg-clay-950/30 dark:text-clay-300",
        "sage-soft":
          "border-sage-200 bg-sage-50 text-sage-700 dark:border-sage-800 dark:bg-sage-950/30 dark:text-sage-300",
        "sky-soft":
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
        // Cultural status badges
        "cultural-new":
          "border-transparent bg-sage-100 text-sage-800 dark:bg-sage-950/30 dark:text-sage-200 shadow-cultural",
        "cultural-featured":
          "border-transparent bg-clay-100 text-clay-800 dark:bg-clay-950/30 dark:text-clay-200 shadow-cultural",
        "cultural-traditional":
          "border-transparent bg-stone-100 text-stone-800 dark:bg-stone-950/30 dark:text-stone-200 shadow-cultural",
        "cultural-storyteller":
          "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-200 shadow-cultural",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
        // Cultural generous sizing
        cultural: "px-3 py-1 text-sm rounded-lg",
        "cultural-lg": "px-4 py-1.5 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  cultural?: boolean;
}

function Badge({ className, variant, size, cultural = false, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ 
          variant, 
          size: cultural ? (size === "lg" ? "cultural-lg" : "cultural") : size 
        }),
        className
      )}
      {...props}
    />
  );
}

// Cultural Badge Variants - Convenience components
const StatusBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, "variant"> & {
    status: "new" | "featured" | "traditional" | "storyteller";
  }
>(({ status, ...props }, ref) => {
  const statusVariants = {
    new: "cultural-new" as const,
    featured: "cultural-featured" as const, 
    traditional: "cultural-traditional" as const,
    storyteller: "cultural-storyteller" as const,
  };

  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant: statusVariants[status], size: "cultural" }))}
      {...props}
    />
  );
});
StatusBadge.displayName = "StatusBadge";

const CulturalBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, "variant" | "cultural"> & {
    color?: "clay" | "sage" | "sky";
    soft?: boolean;
  }
>(({ color = "clay", soft = false, size = "cultural", ...props }, ref) => {
  const variant = soft ? `${color}-soft` as const : color;

  return (
    <Badge
      ref={ref}
      variant={variant as any}
      size={size}
      cultural
      {...props}
    />
  );
});
CulturalBadge.displayName = "CulturalBadge";

export { Badge, StatusBadge, CulturalBadge, badgeVariants };
