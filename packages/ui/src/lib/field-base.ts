/**
 * Shared base for text-entry primitives (Input, Select, Textarea): border,
 * surface, text, focus and disabled states. Not exported from the package
 * index — internal implementation detail, not part of the public API.
 */
export const fieldBase =
  "border border-eg-border bg-eg-surface text-eg-ink outline-none transition-colors focus:border-eg-brand focus:ring-1 focus:ring-eg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"

export const fieldPlaceholder = "placeholder:text-eg-text-muted"
