import Link from "next/link";

// Riga di link "lavoro collegato": stesso trattamento hairline+freccia gia'
// usato in Servizi (ServiceGroupRow), riusato qui per le due colonne di
// "Lavori collegati" nella pagina intervento — non un terzo stile diverso.
export type RelatedLinkItem = {
  key: string;
  label: string;
  href?: string;
};

const rowBaseClassName =
  "group flex items-center justify-between gap-4 border-b border-eg-border bg-eg-surface px-4 py-3.5 text-[14.5px] font-medium text-eg-ink no-underline transition-[padding-left] duration-200 ease-(--eg-ease-brand)";

export function RelatedLinkList({ items }: { items: RelatedLinkItem[] }) {
  return (
    <ul className="border-t border-eg-border">
      {items.map((item) => (
        <li key={item.key}>
          {item.href ? (
            <Link
              href={item.href}
              prefetch={false}
              className={`${rowBaseClassName} hover:pl-5.5 hover:text-eg-brand-strong`}
            >
              {item.label}
              <ArrowIcon className="size-3.5 shrink-0 text-eg-accent transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className={rowBaseClassName}>{item.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
