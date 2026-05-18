import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"

export type InputProps =
  InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({
    className,
    ...props
  }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full border border-border-primary bg-surface-primary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    )
  },
)
