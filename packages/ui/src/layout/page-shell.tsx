import type {
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"
import {
  Container,
  type ContainerSize,
} from "./container"

export type PageShellProps = {
  size?: ContainerSize
  className?: string
  children: ReactNode
}

export function PageShell({
  size = tokens.layout.pageShell.contentContainer.defaultSize,
  className,
  children,
}: PageShellProps) {
  return (
    <main
      data-ui="page-shell"
      className={cn(
        tokens.layout.pageShell.base,
        tokens.layout.pageShell.padding,
        className,
      )}
    >
      <Container
        size={size}
        gutter={tokens.layout.pageShell.contentContainer.gutter}
      >
        {children}
      </Container>
    </main>
  )
}
