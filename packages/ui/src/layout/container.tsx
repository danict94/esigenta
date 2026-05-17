import type { ReactNode } from "react"

import { cn } from "../lib/cn"
import {
  tokens,
  type ContainerToken,
} from "../styles/tokens"

export type ContainerSize = ContainerToken

export type ContainerProps = {
  size?: ContainerSize
  className?: string
  children?: ReactNode
}

export function Container({
  size = "lg",
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        tokens.containers[size],
        tokens.spacing.containerX,
        className,
      )}
    >
      {children}
    </div>
  )
}
