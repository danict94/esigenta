import type { TextareaHTMLAttributes } from "react"

import { cn } from "../lib/cn"
import { fieldBase, fieldPlaceholder } from "../lib/field-base"

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldBase,
        fieldPlaceholder,
        "min-h-24 w-full resize-none px-4 py-3 text-sm",
        className,
      )}
      {...props}
    />
  )
}
