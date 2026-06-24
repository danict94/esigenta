import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>

const selectBase =
  "h-12 w-full border border-cantiere-hairline bg-cantiere-paper px-4 text-sm text-cantiere-ink outline-none transition-[border-color,box-shadow] focus:border-cantiere-accent focus:shadow-[0_0_0_1px_var(--fp-color-cantiere-accent),0_0_28px_-4px_rgba(204,120,92,0.67)] disabled:cursor-not-allowed disabled:opacity-60"

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
