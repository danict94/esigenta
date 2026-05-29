import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"

type ButtonVariant =
  | "primary"
  | "secondary"
  | "brand"
  | "brandOutline"
  | "ghost"

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        tokens.interactive.base,
        tokens.interactive.radius,
        tokens.interactive.states.disabled,
        tokens.interactive.sizes[size],
        tokens.interactive.variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
