import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"

type ButtonVariant =
  | "primary"
  | "ghost"

type ButtonSize =
  | "sm"
  | "md"
  | "lg"

export const buttonBase =
  "inline-flex items-center justify-center gap-2 border font-(family-name:--eg-font-ui) font-medium uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-eg-brand-strong disabled:pointer-events-none disabled:opacity-60"

export const buttonRadius = "rounded-eg-sm"

export const buttonVariants = {
  primary:
    "border-eg-brand-strong bg-eg-brand-strong text-eg-on-brand hover:border-eg-brand hover:bg-eg-brand",
  ghost:
    "border-eg-brand-strong bg-transparent text-eg-brand-strong hover:bg-eg-brand-strong hover:text-eg-on-brand",
} as const

export const buttonSizes = {
  sm: "h-10 px-4 text-xs",
  md: "h-11 px-5 text-xs",
  lg: "h-12 px-6 text-xs",
} as const

export type { ButtonVariant, ButtonSize }

/**
 * Same recipe as <Button>, exposed for non-button elements that must share
 * a variant's look (e.g. a next/link anchor acting as a CTA).
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string | undefined
} = {}): string {
  return cn(
    buttonBase,
    buttonRadius,
    buttonSizes[size],
    buttonVariants[variant],
    className,
  )
}

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
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  )
}
