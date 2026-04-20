import * as React from "react";
import { cn } from "../../utils/twMerge";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        // custom chevron
        "appearance-none bg-no-repeat pr-10",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.5em 1.5em",
      }}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";