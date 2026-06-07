import type { ReactNode } from "react"

import { cn } from "../lib/cn"
import {
  tokens,
  type ContainerToken,
  type LayoutGutterToken,
} from "../styles/tokens"

export type ContainerSize = ContainerToken

export type ContainerGutter = LayoutGutterToken

export type ContainerProps = {
  size?: ContainerSize
  gutter?: ContainerGutter
  className?: string
  children?: ReactNode
}

export function Container({
  size = tokens.layout.container.defaultSize,
  gutter = tokens.layout.container.defaultGutter,
  className,
  children,
}: ContainerProps) {
  return (
    <div
      data-ui="container"
      className={cn(
        className,
        tokens.layout.container.base,
        tokens.layout.container.widths[size],
        tokens.layout.container.gutters[gutter],
      )}
    >
      {children}
    </div>
  )
}
