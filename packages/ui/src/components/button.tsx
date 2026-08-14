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
  "eg-button"

export const buttonVariants = {
  primary: "eg-button-primary",
  ghost: "eg-button-ghost",
} as const

export const buttonSizes = {
  sm: "min-h-10 px-4 text-[13px]",
  md: "",
  lg: "min-h-13 px-6 text-[15px]",
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
