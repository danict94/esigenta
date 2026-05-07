import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '../lib/cn'
import { tokens } from '../styles/tokens'

const allowedTags = {
  section: 'section',
  div: 'div',
  main: 'main',
} as const

type SectionElement = keyof typeof allowedTags

type SectionSpacing =
  | 'sectionXs'
  | 'sectionSm'
  | 'sectionMd'
  | 'sectionLg'
  | 'sectionXl'

export type SectionProps<T extends SectionElement = 'section'> = {
  as?: T
  spacing?: SectionSpacing
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

export function Section<T extends SectionElement = 'section'>({
  as,
  spacing = 'sectionLg',
  className,
  children,
  ...props
}: SectionProps<T>) {
  const Component = (as ?? 'section') as ElementType

  return (
    <Component
      className={cn(tokens.spacing[spacing], className)}
      {...props}
    >
      {children}
    </Component>
  )
}