import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-earth-700 text-earth-50 shadow-md hover:bg-earth-800 hover:shadow-lg active:scale-[0.98]",
        destructive: "bg-error-500 text-error-50 shadow-md hover:bg-error-600 hover:shadow-lg active:scale-[0.98]",
        outline: "border border-stone-300 bg-background shadow-sm hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98]",
        secondary: "bg-stone-100 text-stone-900 shadow-sm hover:bg-stone-200 active:scale-[0.98]",
        ghost: "hover:bg-stone-100 hover:text-stone-900 active:scale-[0.98]",
        link: "text-earth-700 underline-offset-4 hover:underline hover:text-earth-800",
        
        // Cultural Storytelling Variants
        "earth-primary": "bg-earth-600 text-earth-50 shadow-cultural hover:bg-earth-700 hover:shadow-lg active:scale-[0.98]",
        "earth-secondary": "bg-earth-100 text-earth-800 shadow-sm hover:bg-earth-200 active:scale-[0.98]",
        "earth-outline": "border border-earth-300 text-earth-700 hover:bg-earth-50 hover:text-earth-800 active:scale-[0.98]",
        
        "clay-primary": "bg-clay-600 text-clay-50 shadow-cultural hover:bg-clay-700 hover:shadow-lg active:scale-[0.98]",
        "clay-secondary": "bg-clay-100 text-clay-800 shadow-sm hover:bg-clay-200 active:scale-[0.98]",
        "clay-outline": "border border-clay-300 text-clay-700 hover:bg-clay-50 hover:text-clay-800 active:scale-[0.98]",
        
        "sage-primary": "bg-sage-600 text-sage-50 shadow-cultural hover:bg-sage-700 hover:shadow-lg active:scale-[0.98]",
        "sage-secondary": "bg-sage-100 text-sage-800 shadow-sm hover:bg-sage-200 active:scale-[0.98]",
        "sage-outline": "border border-sage-300 text-sage-700 hover:bg-sage-50 hover:text-sage-800 active:scale-[0.98]",
        
        // Success, Warning, Error states
        "success": "bg-success-600 text-success-50 shadow-md hover:bg-success-700 hover:shadow-lg active:scale-[0.98]",
        "warning": "bg-warning-600 text-warning-50 shadow-md hover:bg-warning-700 hover:shadow-lg active:scale-[0.98]",
        "error": "bg-error-600 text-error-50 shadow-md hover:bg-error-700 hover:shadow-lg active:scale-[0.98]"
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 py-1 text-xs rounded",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
        
        // Cultural spacing (8px grid system)
        "cultural": "h-12 px-6 py-3 text-base", // 48px height, 24px padding
        "cultural-sm": "h-10 px-4 py-2 text-sm", // 40px height, 16px padding
        "cultural-lg": "h-16 px-8 py-4 text-lg", // 64px height, 32px padding
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }