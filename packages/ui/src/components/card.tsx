import type {
  HTMLAttributes,
  ReactNode,
} from "react"

import { cn } from "../lib/cn"

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
        "rounded-lg border border-border-primary bg-surface-elevated",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
