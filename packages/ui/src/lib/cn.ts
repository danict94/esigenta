import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines recipes left-to-right; callers pass consumer `className` last so
 * conflicting Tailwind utilities resolve to the explicit consumer override.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
