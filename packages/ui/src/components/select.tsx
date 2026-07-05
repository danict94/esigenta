import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>

const selectBase =
  "h-12 w-full border border-eg-hairline bg-eg-calce px-4 text-sm text-eg-terra outline-none transition-[border-color,box-shadow] focus:border-eg-cotto focus:shadow-[0_0_0_1px_var(--eg-cotto),0_0_28px_-4px_rgba(191,111,74,0.67)] disabled:cursor-not-allowed disabled:opacity-60"

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
