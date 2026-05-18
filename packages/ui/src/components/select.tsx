import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>

export function Select({
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "h-12 w-full border border-border-primary bg-surface-primary px-4 text-sm text-text-primary outline-none transition-colors focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
