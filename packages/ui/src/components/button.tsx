import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"

type ButtonVariant =
  | "primary"
  | "secondary"
  | "brand"
  | "ghost"

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"

const buttonBase =
  "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-60"

const buttonRadius = "rounded-[8px]"

const buttonVariants = {
  primary:
    "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
  secondary:
    "border border-cantiere-accent bg-transparent text-cantiere-accent hover:bg-cantiere-accent hover:text-cantiere-paper",
  brand:
    "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
  ghost:
    "border border-transparent bg-transparent text-cantiere-ink-secondary hover:bg-cantiere-surface hover:text-cantiere-ink",
} as const

const buttonSizes = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-12 px-5 text-[15px]",
  lg: "h-12 px-6 text-[15px]",
  xl: "h-12 px-6 text-[15px]",
} as const

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
        buttonBase,
        buttonRadius,
        buttonSizes[size],
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
