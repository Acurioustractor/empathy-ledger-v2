import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning: 
          "border-warning/50 bg-warning/10 text-warning-foreground [&>svg]:text-warning",
        success:
          "border-success/50 bg-success/10 text-success-foreground [&>svg]:text-success",
        info:
          "border-sky-500/50 bg-sky-50 text-sky-900 dark:bg-sky-950/20 dark:text-sky-100 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400",
        // Cultural variants with earth-tone styling
        cultural:
          "bg-clay-50 border-clay-200 text-clay-800 dark:bg-clay-950/20 dark:border-clay-800 dark:text-clay-200 shadow-cultural",
        "cultural-warning":
          "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200 [&>svg]:text-amber-600 shadow-cultural",
        "cultural-success":
          "bg-sage-50 border-sage-200 text-sage-800 dark:bg-sage-950/20 dark:border-sage-800 dark:text-sage-200 [&>svg]:text-sage-600 shadow-cultural",
        "cultural-info":
          "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/20 dark:border-sky-800 dark:text-sky-200 [&>svg]:text-sky-600 shadow-cultural",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
    VariantProps<typeof alertVariants> & {
      icon?: React.ReactNode;
      cultural?: boolean;
    }
>(({ className, variant, icon, cultural = false, children, ...props }, ref) => {
  // Auto-select appropriate icon based on variant
  let defaultIcon = icon;
  if (!icon) {
    switch (variant) {
      case "destructive":
        defaultIcon = <AlertCircle className="h-4 w-4" />;
        break;
      case "warning":
      case "cultural-warning":
        defaultIcon = <AlertTriangle className="h-4 w-4" />;
        break;
      case "success":
      case "cultural-success":
        defaultIcon = <CheckCircle2 className="h-4 w-4" />;
        break;
      case "info":
      case "cultural-info":
        defaultIcon = <Info className="h-4 w-4" />;
        break;
      default:
        defaultIcon = <Info className="h-4 w-4" />;
    }
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }),
        cultural && "rounded-lg px-6 py-4",
        className
      )}
      {...props}
    >
      {defaultIcon}
      <div>{children}</div>
    </div>
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <h5
    ref={ref as any}
    className={cn(
      "mb-1 font-medium leading-none tracking-tight",
      cultural && "text-base font-semibold mb-2",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm [&_p]:leading-relaxed",
      cultural && "leading-6",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// Cultural Alert Variants - Convenience components
const CulturalAlert = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof Alert>, "variant" | "cultural"> & {
    type?: "default" | "warning" | "success" | "info";
  }
>(({ type = "default", ...props }, ref) => {
  const variantMap = {
    default: "cultural" as const,
    warning: "cultural-warning" as const,
    success: "cultural-success" as const,
    info: "cultural-info" as const,
  };

  return (
    <Alert
      ref={ref}
      variant={variantMap[type]}
      cultural
      {...props}
    />
  );
});
CulturalAlert.displayName = "CulturalAlert";

export { Alert, AlertTitle, AlertDescription, CulturalAlert };
