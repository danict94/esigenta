import type {
  HTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"

export type CardProps = {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>

export function Card({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        tokens.radius.lg,
        "border border-border-primary bg-surface-elevated",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type CardSectionProps = {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>

export function CardHeader({
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={cn("space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export type CardTitleProps = {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLHeadingElement>

export function CardTitle({
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export type CardDescriptionProps = {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLParagraphElement>

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  )
}
