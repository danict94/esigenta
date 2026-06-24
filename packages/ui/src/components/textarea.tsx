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
        "min-h-24 w-full resize-none border border-cantiere-hairline bg-cantiere-paper px-4 py-3 text-sm text-cantiere-ink outline-none transition-colors placeholder:text-cantiere-ink-secondary focus:border-cantiere-accent disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
