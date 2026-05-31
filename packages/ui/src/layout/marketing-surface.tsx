import type { ReactNode } from "react"

import { cn } from "../lib/cn"
import { tokens } from "../styles/tokens"

export type MarketingSurfaceVariant = "hero" | "editorial" | "footer"

export type MarketingSurfaceProps = {
  as?: "div" | "section" | "footer"
  children: ReactNode
  className?: string
  variant?: MarketingSurfaceVariant
}

export function MarketingSurface({
  as: Element = "div",
  children,
  className,
  variant = "editorial",
}: MarketingSurfaceProps) {
  return (
    <Element
      data-ui="marketing-surface"
      data-variant={variant}
      className={cn(
        tokens.layout.marketingSurface.inset,
        tokens.structuralSurfaces[variant],
        className,
      )}
    >
      {children}
    </Element>
  )
}
