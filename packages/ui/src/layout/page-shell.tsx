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
  size = "lg",
  className,
  children,
}: PageShellProps) {
  return (
    <main className={cn("min-h-screen", tokens.spacing.pageShell, className)}>
      <Container size={size}>
        {children}
      </Container>
    </main>
  )
}
