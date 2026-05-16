import type { ReactNode } from 'react'

import { cn } from '../lib/cn'

const containerSizes = {
  xs: 'max-w-2xl',
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  xxl: 'max-w-screen-2xl',
  full: 'max-w-none',
} as const

export type ContainerSize = keyof typeof containerSizes

export type ContainerProps = {
  size?: ContainerSize
  className?: string
  children?: ReactNode
}

export function Container({
  size = 'lg',
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        containerSizes[size],
        'px-4 md:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
