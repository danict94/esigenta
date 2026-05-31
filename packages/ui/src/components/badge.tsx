import type {
  HTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"

type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"

type BadgeSize =
  | "sm"
  | "md"

export type BadgeProps = {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLSpanElement>

export function Badge({
  variant = "neutral",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        tokens.badge.base,
        tokens.badge.sizes[size],
        tokens.badge.variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
