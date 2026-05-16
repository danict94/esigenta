import type { InputHTMLAttributes } from "react"

import { cn } from "../lib/cn"

export type InputProps =
  InputHTMLAttributes<HTMLInputElement>

export function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full border border-border-primary bg-surface-primary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
