import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { frozenTaxonomySource } from "@esigenta/taxonomy";
import { PageShell, cn } from "@esigenta/ui";

export function ServicesHubPage() {
  // "Esplora tutti i servizi" mostra esclusivamente i Group Service (vedi
  // docs/seo-navigation/05_SEO_DOMAIN_VISION.md): gli interventi vivono solo dentro la
  // futura pagina Hub del relativo Group Service, non qui. Fonte di verità unica del
  // Group Service è il ProjectGroup della taxonomy (convergenza del dominio): nessun
  // layer editoriale parallelo. frozenTaxonomySource è importato direttamente come già
  // fa related-funnel-work.tsx; questo resta un Server Component perché il barrel
  // @esigenta/taxonomy trascina codice Prisma/pg non bundlabile per il browser.
  const groupServices = frozenTaxonomySource.projectGroups;

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

        {groupServices.length > 0 ? (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Group Service"
          >
            {groupServices.map((group) => (
              <GroupServiceCard key={group.slug} name={group.name} />
            ))}
          </ul>
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

// La pagina Hub del Group Service non esiste ancora (vedi
// docs/seo-navigation/05_SEO_DOMAIN_VISION.md, Step 2): la card resta non
// cliccabile finché quella route non viene creata, per non linkare a una
// destinazione inesistente.
function GroupServiceCard({ name }: { name: string }) {
  return (
    <li
      className={cn(
        "rounded-[8px]",
        "flex items-center justify-between gap-4 border border-cantiere-hairline bg-cantiere-paper px-5 py-4",
      )}
    >
      <span className="text-base font-medium text-cantiere-ink">{name}</span>
      <span className="text-sm text-cantiere-ink-secondary">In arrivo</span>
    </li>
  );
}
