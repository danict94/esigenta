import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"

type InputSize =
  | "md"
  | "lg"

const inputBase =
  "w-full border border-eg-hairline bg-eg-calce text-eg-terra outline-none transition-[border-color,box-shadow] placeholder:text-eg-ardesia focus:border-eg-cotto focus:shadow-[0_0_0_1px_var(--eg-cotto),0_0_28px_-4px_rgba(191,111,74,0.67)] disabled:cursor-not-allowed disabled:opacity-60"

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
