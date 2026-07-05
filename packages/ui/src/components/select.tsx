import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>

const selectBase =
  "h-12 w-full rounded-eg-sm border border-eg-hairline bg-eg-calce px-4 text-sm text-eg-terra outline-none transition-colors focus:border-eg-terra focus:ring-1 focus:ring-eg-terra disabled:cursor-not-allowed disabled:opacity-60"

export function Select({
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        selectBase,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
