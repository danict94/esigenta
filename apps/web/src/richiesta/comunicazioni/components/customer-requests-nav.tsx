import Link from "next/link"
import {
  cn,
} from "@esigenta/ui"

type CustomerRequestsNavProps = {
  token?: string
  className?: string
}

function buildHistoryHref(token?: string) {
  if (!token) {
    return "/richieste/accesso"
  }

  const params = new URLSearchParams({ token })

  return `/richieste/cliente?${params.toString()}`
}

export function CustomerRequestsNav({
  token,
  className,
}: CustomerRequestsNavProps) {
  const linkClass =
    "text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"

  return (
    <nav
      aria-label="Navigazione richieste cliente"
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border-primary pb-4",
        className,
      )}
    >
      <Link
        href={buildHistoryHref(token)}
        className={linkClass}
      >
        Storico richieste
      </Link>
      <Link
        href="/"
        className={linkClass}
      >
        Nuova richiesta
      </Link>
      <Link
        href="/richieste/accesso"
        className={linkClass}
      >
        Ricevi un nuovo link
      </Link>
    </nav>
  )
}
