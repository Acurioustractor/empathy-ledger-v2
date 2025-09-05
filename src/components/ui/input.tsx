import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  cultural?: boolean;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, cultural = false, error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          cultural && [
            "h-11 px-4 py-3 rounded-lg border-stone-300 dark:border-stone-700",
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
Input.displayName = "Input";

export { Input };
