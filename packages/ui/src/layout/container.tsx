import type { ReactNode } from "react"

import { cn } from "../lib/cn"
import {
  tokens,
  type ContainerToken,
} from "../styles/tokens"

export type ContainerSize = ContainerToken

export type ContainerGutter =
  | "none"
  | "sm"
  | "md"

export type ContainerProps = {
  size?: ContainerSize
  gutter?: ContainerGutter
  className?: string
  children?: ReactNode
}

const gutters: Record<ContainerGutter, string> = {
  none: "",
  sm: "px-2 md:px-3 lg:px-4",
  md: tokens.spacing.containerX,
}

export function Container({
  size = "lg",
  gutter = "md",
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        tokens.containers[size],
        gutters[gutter],
        className,
      )}
    >
      {children}
    </div>
  )
}