import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"

type InputSize =
  | "md"
  | "lg"

const inputBase =
  "w-full rounded-eg-sm border border-eg-hairline bg-eg-calce text-eg-terra outline-none transition-colors placeholder:text-eg-ardesia-2 focus:border-eg-terra focus:ring-1 focus:ring-eg-terra disabled:cursor-not-allowed disabled:opacity-60"

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
