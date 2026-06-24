import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageShell, cn } from "@esigenta/ui";

import { listFeaturedServiceCatalogItems, getServiceCatalogItemHref } from "./catalog";
// Side-effect (Phase 19.6H/19.6I): esegue il guard di coverage del catalogo
// pubblico taxonomy-derived (validators.selftest + assertValidPublicCatalog). Deve
// restare in un Server Component: il barrel pubblico di @esigenta/taxonomy trascina
// query Prisma/pg non bundlabili per il browser — mai importare public-navigation/**
// da un Client Component o dal barrel site/services/index.ts usato dalla home.
import { buildPublicServiceMacroAreasWithItems } from "./public-navigation";
import type { PublicServiceCard } from "./public-navigation";

export function ServicesHubPage() {
  const featuredItems = listFeaturedServiceCatalogItems();
  const macroAreas = buildPublicServiceMacroAreasWithItems();

  return (
    <PageShell size="lg">
      <div className="space-y-12 md:space-y-16">
        <div className="max-w-3xl space-y-5">
          <nav aria-label="Breadcrumb" className="text-sm text-cantiere-ink-secondary">
            <Link
              href="/"
              className="font-medium text-cantiere-accent underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <span aria-hidden="true" className="mx-2 text-cantiere-ink-secondary">
              /
            </span>
            <span className="font-medium text-cantiere-ink">Servizi</span>
          </nav>

          <h1 className="text-4xl font-semibold leading-tight text-cantiere-ink md:text-5xl">
            Servizi
          </h1>

          <p className="text-lg leading-8 text-cantiere-ink-secondary">
            Trova il professionista giusto per il tuo lavoro, dalla
            ristrutturazione completa alla singola riparazione.
          </p>
        </div>

        {macroAreas.length > 0 ? (
          <nav aria-label="Macro aree" className="flex flex-wrap gap-2">
            {macroAreas.map((area) => (
              <a
                key={area.slug}
                href={`#area-${area.slug}`}
                className={cn(
                  "rounded-full",
                  "inline-flex min-h-9 items-center border border-cantiere-hairline bg-cantiere-paper px-3 text-sm font-medium leading-5 text-cantiere-ink-secondary transition-colors hover:border-cantiere-accent hover:text-cantiere-ink",
                )}
              >
                {area.name}
              </a>
            ))}
          </nav>
        ) : null}

        {featuredItems.length > 0 ? (
          <section aria-labelledby="servizi-richiesti-title" className="space-y-6">
            <h2
              id="servizi-richiesti-title"
              className="text-2xl font-semibold leading-8 text-cantiere-ink"
            >
              Servizi più richiesti
            </h2>

            <ul
              className={cn(
                "rounded-[8px]",
                "divide-y divide-border-primary overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
              )}
            >
              {featuredItems.map((item) => {
                const href = getServiceCatalogItemHref(item);

                if (!href) {
                  return null;
                }

                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      className="flex items-center justify-between gap-4 px-5 py-4 text-base font-medium text-cantiere-ink transition-colors hover:bg-cantiere-surface md:px-6"
                    >
                      <span>{item.title}</span>
                      <ArrowRight
                        className="size-4 shrink-0 text-cantiere-ink-secondary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {macroAreas.length > 0 ? (
          <div className="space-y-10">
            {macroAreas.map((area) => (
              <MacroAreaSection
                key={area.slug}
                slug={area.slug}
                name={area.name}
                items={area.items}
              />
            ))}
          </div>
        ) : (
          <p className="text-base leading-7 text-cantiere-ink-secondary">
            Il catalogo servizi è in preparazione. Torna a trovarci presto.
          </p>
        )}

        <section
          className={cn(
            "rounded-[8px]",
            "bg-cantiere-ink px-5 py-9 text-center text-cantiere-paper md:px-8 md:py-12",
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Non hai trovato quello che cercavi?
            </h2>

            <p className="text-base leading-7 text-cantiere-paper/75">
              Raccontaci il lavoro: ti aiutiamo a trovare il professionista
              giusto anche se non vedi il tuo servizio qui sopra.
            </p>

            <Link
              href="/"
              className={cn(
                "inline-flex items-center justify-center font-medium transition-colors",
                "rounded-[8px]",
                "h-12 px-6 text-[15px]",
                "border border-cantiere-accent bg-cantiere-accent text-cantiere-paper hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover",
                "w-full gap-2 sm:w-auto",
              )}
            >
              Racconta il lavoro
              <ArrowRight className="size-4" aria-hidden={true} />
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function MacroAreaSection({
  slug,
  name,
  items,
}: {
  slug: string;
  name: string;
  items: readonly PublicServiceCard[];
}) {
  // items è già ordinato per priority. I primi 3 vanno in evidenza; il resto (sia
  // quarto+ VISIBLE che gli effettivi COLLAPSED) finisce nella lista secondaria —
  // nessun item viene mai scartato dal rendering, solo riposizionato.
  const visibleItems = items.slice(0, 3);
  const collapsedItems = items.slice(3);

  return (
    <section id={`area-${slug}`} aria-labelledby={`area-${slug}-title`}>
      <h2
        id={`area-${slug}-title`}
        className="text-2xl font-semibold leading-8 text-cantiere-ink"
      >
        {name}
      </h2>

      <ul
        className={cn(
          "rounded-[8px]",
          "mt-4 divide-y divide-border-primary overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
        )}
      >
        {visibleItems.map((item) => (
          <ServiceListItem key={item.slug} item={item} />
        ))}
      </ul>

      {collapsedItems.length > 0 ? (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-sm font-medium text-cantiere-accent underline-offset-4 hover:underline">
            Vedi altri {collapsedItems.length} servizi
          </summary>

          <ul
            className={cn(
              "rounded-[8px]",
              "mt-3 divide-y divide-border-primary overflow-hidden border border-cantiere-hairline bg-cantiere-paper",
            )}
          >
            {collapsedItems.map((item) => (
              <ServiceListItem key={item.slug} item={item} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

function ServiceListItem({ item }: { item: PublicServiceCard }) {
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center justify-between gap-4 px-5 py-3 text-sm font-medium text-cantiere-ink transition-colors hover:bg-cantiere-surface md:px-6"
      >
        <span>{item.label}</span>
        <ArrowRight
          className="size-4 shrink-0 text-cantiere-ink-secondary"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
