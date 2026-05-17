import type { TextareaHTMLAttributes } from "react"

import { cn } from "../lib/cn"

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none border border-border-primary bg-surface-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
