import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"

type InputSize =
  | "md"
  | "lg"

const inputBase =
  "w-full border border-cantiere-hairline bg-cantiere-paper text-cantiere-ink outline-none transition-[border-color,box-shadow] placeholder:text-cantiere-ink-secondary focus:border-cantiere-accent focus:shadow-[0_0_0_1px_var(--fp-color-cantiere-accent),0_0_28px_-4px_rgba(204,120,92,0.67)] disabled:cursor-not-allowed disabled:opacity-60"

const inputSizes = {
  md: "h-12 px-4 text-sm",
  lg: "h-16 px-5 text-base",
} as const

export type InputProps =
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    size?: InputSize
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({
    className,
    size = "md",
    ...props
  }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          inputBase,
          inputSizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
