import type {
  SelectHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"

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
        tokens.formControls.base,
        tokens.formControls.states.focus,
        tokens.formControls.states.disabled,
        tokens.formControls.select,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
