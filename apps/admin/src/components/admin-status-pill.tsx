import { cn } from "@esigenta/ui"

export type AdminStatusPillColor =
  | "green"
  | "orange"
  | "yellow"
  | "red"
  | "gray"
  | "blue"

const dotColorClasses: Record<AdminStatusPillColor, string> = {
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
  gray: "bg-slate-400",
  blue: "bg-sky-500",
}

export type AdminStatusPillProps = {
  color: AdminStatusPillColor
  label: string
  className?: string
}

/**
 * Shared visual language for status across admin imprese/richieste — a
 * small colored dot + short text, never a heavy rectangular badge, never
 * button-like. Lives only in apps/admin (not @esigenta/ui) since it's a
 * thin static-Tailwind wrapper specific to this app's admin lists, not a
 * general design-system primitive.
 */
export function AdminStatusPill({
  color,
  label,
  className,
}: AdminStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium text-eg-terra",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          dotColorClasses[color],
        )}
      />
      {label}
    </span>
  )
}
