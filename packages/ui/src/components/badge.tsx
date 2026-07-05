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
  "inline-flex items-center border font-mono font-medium uppercase tracking-[0.06em]"

const badgeVariants = {
  neutral:
    "border-eg-hairline bg-eg-calce text-eg-ardesia",
  success:
    "border-eg-cotto bg-eg-calce text-eg-cotto",
  warning: "border-eg-hairline bg-eg-calce-2 text-eg-terra",
  danger: "border-eg-cotto bg-eg-calce text-eg-terra",
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
