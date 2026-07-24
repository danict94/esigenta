import type {
  InputHTMLAttributes,
} from "react"

import {
  cn,
} from "../lib/cn"

export type CheckboxProps =
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">

export function Checkbox({
  className,
  ...props
}: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cn(
        "h-4 w-4 accent-eg-brand disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  )
}
