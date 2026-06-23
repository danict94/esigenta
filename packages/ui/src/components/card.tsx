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
        tokens.card.base,
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
      className={cn(tokens.card.header, className)}
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
      className={cn(tokens.card.content, className)}
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
        tokens.card.title,
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
      className={cn(tokens.card.description, className)}
      {...props}
    >
      {children}
    </p>
  )
}
