import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Cultural variants with earth-tone palette
        clay: "bg-clay-600 text-clay-50 shadow hover:bg-clay-700 focus-visible:ring-clay-400",
        sage: "bg-sage-600 text-sage-50 shadow hover:bg-sage-700 focus-visible:ring-sage-400",
        sky: "bg-sky-600 text-sky-50 shadow hover:bg-sky-700 focus-visible:ring-sky-400",
        "clay-outline": "border border-clay-300 text-clay-700 bg-background hover:bg-clay-50 focus-visible:ring-clay-400",
        "sage-outline": "border border-sage-300 text-sage-700 bg-background hover:bg-sage-50 focus-visible:ring-sage-400",
        "sky-outline": "border border-sky-300 text-sky-700 bg-background hover:bg-sky-50 focus-visible:ring-sky-400",
        "cultural-primary": "bg-primary text-primary-foreground shadow-cultural hover:bg-primary/90 focus-visible:ring-clay-400",
        "cultural-secondary": "bg-secondary text-secondary-foreground shadow-cultural hover:bg-secondary/90 focus-visible:ring-sage-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
        // Cultural generous sizing
        cultural: "h-11 px-6 py-3 text-base",
        "cultural-lg": "h-14 px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };