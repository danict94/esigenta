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
  | "xl"

export const buttonBase =
  "inline-flex items-center justify-center gap-2 border font-mono font-medium uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-eg-terra disabled:pointer-events-none disabled:opacity-60"

export const buttonRadius = "rounded-eg-sm"

export const buttonVariants = {
  primary:
    "border-eg-terra bg-eg-terra text-eg-calce hover:border-eg-cotto-dark hover:bg-eg-cotto-dark",
  ghost:
    "border-eg-terra bg-transparent text-eg-terra hover:bg-eg-terra hover:text-eg-calce",
} as const

export const buttonSizes = {
  sm: "h-10 px-4 text-xs",
  md: "h-11 px-5 text-xs",
  lg: "h-12 px-6 text-xs",
  xl: "h-14 px-7 text-sm",
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
