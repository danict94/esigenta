import Link from "next/link";

type CustomerRequestsNavProps = {
  token?: string;
  className?: string;
  /** Retrocompatibili: di default true, invariato per i consumer esistenti. */
  showNewRequest?: boolean;
  showAccessLink?: boolean;
};

function buildHistoryHref(token?: string) {
  if (!token) {
    return "/richieste/accesso";
  }

  const params = new URLSearchParams({ token });

  return `/richieste/cliente?${params.toString()}`;
}

export function CustomerRequestsNav({
  token,
  className,
  showNewRequest = true,
  showAccessLink = true,
}: CustomerRequestsNavProps) {
  return (
    <nav
      aria-label="Navigazione richieste cliente"
      className={[
        "eg-nav-link flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-eg-border pb-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={buildHistoryHref(token)} prefetch={false}>
        Storico richieste
      </Link>
      {showNewRequest ? (
        <Link href="/" prefetch={false}>
          Nuova richiesta
        </Link>
      ) : null}
      {showAccessLink ? (
        <Link href="/richieste/accesso" prefetch={false}>
          Ricevi un nuovo link
        </Link>
      ) : null}
    </nav>
  );
}
