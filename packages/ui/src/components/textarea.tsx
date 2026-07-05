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
        "min-h-24 w-full resize-none border border-eg-hairline bg-eg-calce px-4 py-3 text-sm text-eg-terra outline-none transition-colors placeholder:text-eg-ardesia focus:border-eg-cotto disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}
