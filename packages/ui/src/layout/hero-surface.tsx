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
import {
  MarketingSurface,
} from "./marketing-surface"

export type HeroSurfaceProps = {
  children: ReactNode
  className?: string
} & (
  | {
      constrainContent?: true
      size?: ContainerToken
      contentClassName?: string
    }
  | {
      constrainContent: false
      size?: never
      contentClassName?: never
    }
)

export function HeroSurface(props: HeroSurfaceProps) {
  const {
    children,
    className,
  } = props

  const content = props.constrainContent === false
    ? children
    : (
        <Container
          size={props.size ?? tokens.layout.heroSurface.contentContainer.defaultSize}
          gutter={tokens.layout.heroSurface.contentContainer.gutter}
          {...(props.contentClassName
            ? {
                className: props.contentClassName,
              }
            : {})}
        >
          {children}
        </Container>
      )

  return (
    <MarketingSurface
      as="section"
      variant="hero"
      className={cn(
        tokens.layout.heroSurface.frame,
        className,
      )}
    >
      {content}
    </MarketingSurface>
  )
}
