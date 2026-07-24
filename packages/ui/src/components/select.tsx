import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"
import { fieldBase } from "../lib/field-base"

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>

const selectBase =
  cn(fieldBase, "h-12 w-full rounded-eg-sm px-4 text-sm")

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
