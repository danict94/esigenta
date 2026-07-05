import Link from "next/link";

type CustomerRequestsNavProps = {
  token?: string;
  className?: string;
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
}: CustomerRequestsNavProps) {
  return (
    <nav
      aria-label="Navigazione richieste cliente"
      className={[
        "eg-link-mono flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-eg-hairline pb-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={buildHistoryHref(token)} prefetch={false}>
        Storico richieste
      </Link>
      <Link href="/" prefetch={false}>
        Nuova richiesta
      </Link>
      <Link href="/richieste/accesso" prefetch={false}>
        Ricevi un nuovo link
      </Link>
    </nav>
  );
}
