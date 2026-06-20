import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageShell, cn, tokens } from "@esigenta/ui";

import { listFeaturedServiceCatalogItems, getServiceCatalogItemHref } from "./catalog";
// Side-effect (Phase 19.6H/19.6I): esegue il guard di coverage del catalogo
// pubblico taxonomy-derived (validators.selftest + assertValidPublicCatalog). Deve
// restare in un Server Component: taxonomySource trascina query Prisma/pg non
// bundlabili per il browser — mai importare public-navigation/** da un Client
// Component o dal barrel site/services/index.ts usato dalla home.
import { buildPublicServiceMacroAreasWithItems } from "./public-navigation";
import type { PublicServiceCard } from "./public-navigation";

export function ServicesHubPage() {
  const featuredItems = listFeaturedServiceCatalogItems();
  const macroAreas = buildPublicServiceMacroAreasWithItems();

  return (
    <PageShell size="lg">
      <div className="space-y-12 md:space-y-16">
        <div className="max-w-3xl space-y-5">
          <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
            <Link
              href="/"
              className="font-medium text-action-primary underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <span aria-hidden="true" className="mx-2 text-text-muted">
              /
            </span>
            <span className="font-medium text-text-primary">Servizi</span>
          </nav>

          <h1 className="text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
            Servizi
          </h1>

          <p className="text-lg leading-8 text-text-secondary">
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
                  tokens.radius.full,
                  "inline-flex min-h-9 items-center border border-border-primary bg-surface-primary px-3 text-sm font-medium leading-5 text-text-secondary transition-colors hover:border-border-focus hover:text-text-primary",
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
              className="text-2xl font-semibold leading-8 text-text-primary"
            >
              Servizi più richiesti
            </h2>

            <ul
              className={cn(
                tokens.radius.lg,
                "divide-y divide-border-primary overflow-hidden border border-border-primary bg-surface-primary",
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
                      className="flex items-center justify-between gap-4 px-5 py-4 text-base font-medium text-text-primary transition-colors hover:bg-surface-soft md:px-6"
                    >
                      <span>{item.title}</span>
                      <ArrowRight
                        className="size-4 shrink-0 text-text-muted"
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
          <p className="text-base leading-7 text-text-secondary">
            Il catalogo servizi è in preparazione. Torna a trovarci presto.
          </p>
        )}

        <section
          className={cn(
            tokens.radius.lg,
            "bg-surface-dark px-5 py-9 text-center text-text-on-hero-primary md:px-8 md:py-12",
          )}
        >
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Non hai trovato quello che cercavi?
            </h2>

            <p className="text-base leading-7 text-text-on-hero-secondary">
              Raccontaci il lavoro: ti aiutiamo a trovare il professionista
              giusto anche se non vedi il tuo servizio qui sopra.
            </p>

            <Link
              href="/"
              className={cn(
                tokens.interactive.base,
                tokens.interactive.radius,
                tokens.interactive.sizes.xl,
                tokens.interactive.variants.warm,
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
        className="text-2xl font-semibold leading-8 text-text-primary"
      >
        {name}
      </h2>

      <ul
        className={cn(
          tokens.radius.lg,
          "mt-4 divide-y divide-border-primary overflow-hidden border border-border-primary bg-surface-primary",
        )}
      >
        {visibleItems.map((item) => (
          <ServiceListItem key={item.slug} item={item} />
        ))}
      </ul>

      {collapsedItems.length > 0 ? (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-sm font-medium text-action-primary underline-offset-4 hover:underline">
            Vedi altri {collapsedItems.length} servizi
          </summary>

          <ul
            className={cn(
              tokens.radius.lg,
              "mt-3 divide-y divide-border-primary overflow-hidden border border-border-primary bg-surface-primary",
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
        className="flex items-center justify-between gap-4 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-soft md:px-6"
      >
        <span>{item.label}</span>
        <ArrowRight
          className="size-4 shrink-0 text-text-muted"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
