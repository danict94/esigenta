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

type BadgeSize =
  | "sm"
  | "md"

export type BadgeProps = {
  variant?: BadgeVariant
  size?: BadgeSize
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

const sizes: Record<BadgeSize, string> = {
  sm: "min-h-7 px-2.5 text-xs",
  md: "min-h-8 px-3 text-xs",
}

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
        "inline-flex items-center border font-medium",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
