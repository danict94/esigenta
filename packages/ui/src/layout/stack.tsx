import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '../lib/cn'

const allowedTags = {
  div: 'div',
  section: 'section',
  article: 'article',
} as const

type StackElement = keyof typeof allowedTags

type StackGap =
  | 'gap-2'
  | 'gap-4'
  | 'gap-6'
  | 'gap-8'
  | 'gap-10'
  | 'gap-12'
  | 'gap-16'

export type StackProps<T extends StackElement = 'div'> = {
  as?: T
  gap?: StackGap
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

export function Stack<T extends StackElement = 'div'>({
  as,
  gap = 'gap-6',
  className,
  children,
  ...props
}: StackProps<T>) {
  const Component = (as ?? 'div') as ElementType

  return (
    <Component
      className={cn('flex flex-col', gap, className)}
      {...props}
    >
      {children}
    </Component>
  )
}