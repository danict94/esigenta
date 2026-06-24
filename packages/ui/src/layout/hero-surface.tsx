import type {
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  Container,
  type ContainerSize,
} from "./container"

export type HeroSurfaceProps = {
  children: ReactNode
  className?: string
} & (
  | {
      constrainContent?: true
      size?: ContainerSize
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
          size={props.size ?? "lg"}
          gutter="none"
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
    <section
      data-ui="marketing-surface"
      data-variant="hero"
      className={cn(
        "relative overflow-visible bg-cantiere-ink px-5 py-6 text-cantiere-paper md:px-8 md:py-8 xl:px-10 xl:py-10",
        className,
      )}
    >
      {content}
    </section>
  )
}
