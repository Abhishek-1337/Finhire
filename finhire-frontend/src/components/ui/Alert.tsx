import * as React from "react";
import { cn } from "../../utils/twMerge";

export interface AlertProps {
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ message, className }) => (
  <div
    role="alert"
    className={cn(
      "flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10",
      "px-4 py-3 text-sm text-destructive",
      className
    )}
  >
    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293
           1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414
           10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
    <span>{message}</span>
  </div>
);