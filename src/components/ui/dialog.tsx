import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    cultural?: boolean;
    size?: "sm" | "default" | "lg" | "xl" | "2xl" | "full";
  }
>(({ className, children, cultural = false, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          sizeClasses[size],
          cultural && [
            "border-stone-200 dark:border-stone-800",
            "bg-gradient-to-br from-background to-clay-50/20 dark:to-clay-950/10",
            "shadow-cultural p-8 rounded-xl"
          ],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          cultural && "right-6 top-6 focus:ring-clay-400"
        )}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  cultural = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cultural?: boolean;
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      cultural && "space-y-3 pb-2",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  cultural = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cultural?: boolean;
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      cultural && "pt-4 space-y-2 space-y-reverse sm:space-y-0 sm:space-x-4",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      cultural && "text-cultural-subheading text-clay-800 dark:text-clay-200",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    cultural?: boolean;
  }
>(({ className, cultural = false, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      cultural && "text-cultural-body leading-relaxed text-stone-600 dark:text-stone-400",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Cultural Dialog - Convenience component
const CulturalDialog = {
  Root: Dialog,
  Trigger: DialogTrigger,
  Content: React.forwardRef<
    React.ElementRef<typeof DialogContent>,
    Omit<React.ComponentPropsWithoutRef<typeof DialogContent>, "cultural">
  >((props, ref) => <DialogContent ref={ref} cultural {...props} />),
  Header: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <DialogHeader cultural {...props} />
  ),
  Footer: (props: React.HTMLAttributes<HTMLDivElement>) => (
    <DialogFooter cultural {...props} />
  ),
  Title: React.forwardRef<
    React.ElementRef<typeof DialogTitle>,
    Omit<React.ComponentPropsWithoutRef<typeof DialogTitle>, "cultural">
  >((props, ref) => <DialogTitle ref={ref} cultural {...props} />),
  Description: React.forwardRef<
    React.ElementRef<typeof DialogDescription>,
    Omit<React.ComponentPropsWithoutRef<typeof DialogDescription>, "cultural">
  >((props, ref) => <DialogDescription ref={ref} cultural {...props} />),
  Close: DialogClose,
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  CulturalDialog,
};
