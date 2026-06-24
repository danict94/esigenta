import type { ReactNode } from "react"

import { cn } from "../lib/cn"

export type ContainerSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "full"

type ContainerGutter =
  | "none"
  | "sm"
  | "md"

const containerWidths = {
  xs: "max-w-[1120px]",
  sm: "max-w-[1120px]",
  md: "max-w-[1120px]",
  lg: "max-w-[1120px]",
  xl: "max-w-[1280px]",
  xxl: "max-w-[1280px]",
  full: "max-w-none",
} as const

const containerGutters = {
  none: "",
  sm: "px-5 sm:px-10 lg:px-16",
  md: "px-5 sm:px-10 lg:px-16",
} as const

export type ContainerProps = {
  size?: ContainerSize
  gutter?: ContainerGutter
  className?: string
  children?: ReactNode
}

export function Container({
  size = "lg",
  gutter = "md",
  className,
  children,
}: ContainerProps) {
  return (
    <div
      data-ui="container"
      className={cn(
        className,
        "mx-auto w-full",
        containerWidths[size],
        containerGutters[gutter],
      )}
    >
      {children}
    </div>
  )
}
