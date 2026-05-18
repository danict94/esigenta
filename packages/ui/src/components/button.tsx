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
  | "ghost"

type ButtonSize =
  | "sm"
  | "md"
  | "lg"

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-brand-primary bg-brand-primary text-brand-on-primary hover:border-brand-primary-hover hover:bg-brand-primary-hover",

  secondary:
    "border border-border-primary bg-surface-primary text-text-primary hover:border-border-focus",

  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
}

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
        "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-60",
        tokens.radius.md,
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
