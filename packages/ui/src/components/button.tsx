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
  | "nav"

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"

export const buttonBase =
  "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-60"

export const buttonRadius = "rounded-[8px]"

export const buttonVariants = {
  primary:
    "border border-eg-cotto bg-eg-cotto text-eg-calce hover:border-eg-cotto-dark hover:bg-eg-cotto-dark",
  secondary:
    "border border-eg-cotto bg-transparent text-eg-cotto hover:bg-eg-cotto hover:text-eg-calce",
  brand:
    "border border-eg-cotto bg-eg-cotto text-eg-calce hover:border-eg-cotto-dark hover:bg-eg-cotto-dark",
  ghost:
    "border border-transparent bg-transparent text-eg-ardesia hover:bg-eg-calce-2 hover:text-eg-terra",
  /**
   * Branded nav CTA: no border, no hover background/color shift — only a
   * scale affordance. For nav items that must read as a link, not a filled
   * control (e.g. account menu trigger, "Sei un professionista?" CTA).
   */
  nav: "border border-transparent bg-transparent font-semibold text-eg-cotto transition-transform hover:scale-105",
} as const

export const buttonSizes = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-12 px-5 text-[15px]",
  lg: "h-12 px-6 text-[15px]",
  xl: "h-12 px-6 text-[15px]",
} as const

export type { ButtonVariant, ButtonSize }

/**
 * Same recipe as <Button>, exposed for non-button elements that must share
 * a variant's look (e.g. a next/link anchor acting as a nav CTA).
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
