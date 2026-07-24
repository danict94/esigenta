import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"
import { fieldBase, fieldPlaceholder } from "../lib/field-base"

type InputSize =
  | "md"

const inputBase =
  cn(fieldBase, fieldPlaceholder, "w-full rounded-eg-sm")

const inputSizes = {
  md: "h-12 px-4 text-sm",
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
