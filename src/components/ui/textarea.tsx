import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  cultural?: boolean;
  error?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, cultural = false, error = false, resize = "vertical", ...props }, ref) => {
    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x", 
      both: "resize"
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          resizeClasses[resize],
          cultural && [
            "min-h-[80px] px-4 py-3 rounded-lg border-stone-300 dark:border-stone-700",
            "focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:border-clay-400",
            "placeholder:text-stone-500 dark:placeholder:text-stone-400",
            "shadow-cultural"
          ],
          error && [
            "border-destructive focus-visible:ring-destructive",
            cultural ? "border-red-300 focus-visible:ring-red-400" : ""
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
