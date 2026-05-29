import {
  forwardRef,
  type InputHTMLAttributes,
} from "react"

import { cn } from "../lib/cn"
import {
  tokens,
} from "../styles/tokens"

type InputSize =
  | "md"
  | "lg"

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
          tokens.formControls.base,
          tokens.formControls.states.placeholder,
          tokens.formControls.states.focus,
          tokens.formControls.states.disabled,
          tokens.formControls.inputSizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
