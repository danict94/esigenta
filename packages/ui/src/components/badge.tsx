import type {
  HTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"

type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"

export type BadgeProps = {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLSpanElement>

const variants: Record<BadgeVariant, string> = {
  neutral:
    "border-border-primary bg-surface-primary text-text-secondary",
  success:
    "border-brand-primary bg-surface-primary text-brand-primary",
  warning:
    "border-border-secondary bg-surface-secondary text-text-primary",
  danger:
    "border-border-focus bg-surface-primary text-text-primary",
}

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center border px-3 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
