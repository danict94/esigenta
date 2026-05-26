import type {
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
  type ContainerToken,
} from "../styles/tokens"
import {
  Container,
} from "./container"

export type HeroSurfaceProps = {
  children: ReactNode
  size?: ContainerToken
  className?: string
  contentClassName?: string
}

export function HeroSurface({
  children,
  size = "xl",
  className,
  contentClassName,
}: HeroSurfaceProps) {
  return (
    <Container size="full" gutter="sm">
      <section
        className={cn(
          tokens.surfaces.hero,
          "relative overflow-visible px-5 py-8 md:px-10 md:py-10 xl:px-14 xl:py-14",
          className,
        )}
      >
        <Container
          size={size}
          gutter="none"
          {...(contentClassName
            ? {
                className: contentClassName,
              }
            : {})}
        >
          {children}
        </Container>
      </section>
    </Container>
  )
}