import type {
  ReactNode,
} from "react"

import { cn } from "../lib/cn"
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
  size = "lg",
  className,
  children,
}: PageShellProps) {
  return (
    <main
      data-ui="page-shell"
      className={cn(
        "min-h-screen py-20 md:py-28 lg:py-32",
        className,
      )}
    >
      <Container
        size={size}
        gutter="md"
      >
        {children}
      </Container>
    </main>
  )
}
