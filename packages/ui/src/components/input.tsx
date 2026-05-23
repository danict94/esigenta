import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"

type InputSize =
  | "md"
  | "lg"

export type InputProps =
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    size?: InputSize
  }

const sizes: Record<InputSize, string> = {
  md: "h-12 px-4 text-sm",
  lg: "h-16 px-5 text-base",
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({
    className,
    size = "md",
    ...props
  }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border border-border-primary bg-surface-primary text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60",
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)