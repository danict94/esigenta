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

const badgeBase =
  "inline-flex items-center border font-(family-name:--eg-font-ui) font-medium uppercase tracking-[0.06em]"

const badgeVariants = {
  neutral:
    "border-eg-border bg-eg-surface text-eg-text-muted",
  success:
    "border-eg-success-border bg-eg-success-soft text-eg-success",
  warning:
    "border-eg-warning-border bg-eg-warning-soft text-eg-warning",
  danger:
    "border-eg-error-border bg-eg-error-soft text-eg-error",
} as const

const badgeSizes = {
  sm: "min-h-7 px-2.5 text-xs",
  md: "min-h-8 px-3 text-xs",
} as const

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
        badgeBase,
        badgeSizes[size],
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
