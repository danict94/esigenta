import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@esigenta/ui";

type InternalBreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

type InternalPageIntroProps = {
  breadcrumbs: readonly InternalBreadcrumbItem[];
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Contenuto opzionale renderizzato SUBITO dopo l'H1, prima di description/actions — per quando qualcosa (es. il prezzo di una Cost Guide) deve leggersi come risposta diretta al titolo, non come blocco separato più in basso. Nessun impatto sugli altri usi di questo componente quando omesso. */
  afterTitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  note?: ReactNode;
  aside?: ReactNode;
  id?: string;
  titleId?: string;
  compact?: boolean;
};

export function InternalPageIntro({
  breadcrumbs,
  eyebrow,
  title,
  afterTitle,
  description,
  actions,
  note,
  aside,
  id,
  titleId,
  compact = false,
}: InternalPageIntroProps) {
  return (
    <header
      id={id}
      className={cn(
        "eg-internal-header",
        compact && "pt-[calc(var(--eg-nav-clear)+4px)] pb-7",
      )}
    >
      <div className="eg-container">
        <Breadcrumbs items={breadcrumbs} />

        <div
          className={
            aside
              ? cn(
                  "grid items-center lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]",
                  compact ? "gap-6 lg:gap-9" : "gap-12",
                )
              : undefined
          }
        >
          <div className="max-w-190">
            {eyebrow ? <p className="eg-eyebrow mb-4">{eyebrow}</p> : null}
            <h1 id={titleId} className="eg-h1 text-balance">
              {title}
            </h1>

            {afterTitle}

            {description ? <p className="eg-page-lede mt-4 max-w-160">{description}</p> : null}

            {actions ? (
              <div className={cn("flex flex-wrap items-center gap-3", compact ? "mt-5" : "mt-7")}>
                {actions}
              </div>
            ) : null}

            {note ? <div className="mt-4 text-[13px] leading-[1.5] text-eg-ink">{note}</div> : null}
          </div>

          {aside}
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs({ items }: { items: readonly InternalBreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4.5 flex flex-wrap items-center gap-2 font-(family-name:--eg-font-primary) text-[12.5px] text-eg-text-muted"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="contents">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                prefetch={false}
                className="transition-colors hover:text-eg-brand-strong"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-eg-ink" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
