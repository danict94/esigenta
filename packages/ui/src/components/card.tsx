import type {
  HTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"

const cardBase =
  "rounded-eg-lg border border-eg-border bg-eg-surface shadow-eg-elevation"

const cardHeader = "space-y-1.5 p-6"
const cardContent = "p-6 pt-0"
const cardTitle =
  "text-lg font-semibold leading-none tracking-tight text-eg-ink"
const cardDescription = "text-sm text-eg-text-muted"

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
        cardBase,
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
      className={cn(cardHeader, className)}
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
      className={cn(cardContent, className)}
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
        cardTitle,
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
      className={cn(cardDescription, className)}
      {...props}
    >
      {children}
    </p>
  )
}
