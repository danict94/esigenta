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
    <main className={cn("min-h-screen py-10 md:py-12", className)}>
      <Container size={size}>
        {children}
      </Container>
    </main>
  )
}
