import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { getSeoGroupLandingBySlug } from "../seo/pages/gruppi";
import {
  DirectoryAction,
  DirectoryGroupHeader,
  DirectoryItemTitle,
} from "../shared/directory-primitives";
import { InternalPageFinalCta } from "../shared/internal-page-final-cta";
import { InternalPageIntro } from "../shared/internal-page-intro";
import { PublicShell } from "../shell/public-shell";
import { serviceGroupFamilies } from "./service-group-families";
import { ServiceGroupIcon } from "./service-group-icons";

function resolveGroupHref(slug: string): string | null {
  return getSeoGroupLandingBySlug(slug)
    ? buildCanonicalPath({ family: "groupHub", slug })
    : null;
}

export function ServicesHubPage() {
  // /servizi espone i Group Service della taxonomy. Una riga diventa
  // cliccabile solo se il gruppo ha una landing reale registrata in
  // site/seo/pages/gruppi: mai promettere destinazioni che non esistono.
  const groupServices = frozenTaxonomySource.projectGroups;

  const groupsBySlug = new Map(
    groupServices.map((group) => [group.slug, group]),
  );

  const families = serviceGroupFamilies
    .map((family) => ({
      title: family.title,
      entries: family.groupSlugs
        .map((slug) => groupsBySlug.get(slug))
        .filter((group): group is (typeof groupServices)[number] => Boolean(group)),
    }))
    .filter((family) => family.entries.length > 0);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Servizi", path: "/servizi" },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <InternalPageIntro
          id="catalogo-servizi"
          titleId="catalog-title"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Servizi" }]}
          title="Tutti i servizi per la casa, organizzati per ambito."
          description="Ogni ambito raccoglie interventi affini: scegli il punto di partenza e ti guidiamo nei dettagli del lavoro."
          actions={
            <Link href="/" prefetch={false} className="eg-button-primary">
              Racconta il lavoro
            </Link>
          }
        />

        <section className="pb-20" aria-labelledby="catalog-title">
          <div className="eg-container">
            {families.length > 0 ? (
              // Niente Reveal qui: e' il contenuto primario della pagina,
              // deve essere visibile subito. Un Reveal unico su un blocco
              // cosi' alto (5 famiglie x N ambiti) non raggiunge mai la
              // soglia di intersezione senza scroll profondo, ed e' proprio
              // quello che causava la pagina "vuota" al primo render.
              families.map((family) => (
                <div key={family.title} className="mb-14 last:mb-0">
                  <DirectoryGroupHeader
                    title={family.title}
                    headingLevel={2}
                    className="mb-5"
                  />
                  <div className="grid grid-cols-1 min-[861px]:grid-cols-2">
                    {family.entries.map((group) => (
                      <ServiceGroupRow
                        key={group.slug}
                        slug={group.slug}
                        name={group.name}
                        href={resolveGroupHref(group.slug)}
                        interventionsCount={group.interventions.length}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Il catalogo servizi è in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <InternalPageFinalCta
          eyebrow="Non trovi il tuo lavoro?"
          title="Raccontalo comunque: lo traduciamo in una richiesta chiara."
          description="Anche se il servizio non compare ancora in catalogo, puoi partire dal problema: Esigenta ti aiuta a portarlo verso il professionista giusto."
          href="/"
          ctaLabel="Inizia dalla home"
        />
      </div>
    </PublicShell>
  );
}

function ServiceGroupRow({
  slug,
  name,
  href,
  interventionsCount,
}: {
  slug: string;
  name: string;
  href: string | null;
  interventionsCount: number;
}) {
  const content = (
    <>
      <ServiceGroupIcon
        slug={slug}
        className="size-7.5 shrink-0 text-eg-brand-strong transition-transform duration-250 ease-(--eg-ease-brand) group-hover:scale-105 group-hover:-rotate-2 group-hover:text-eg-accent"
      />
      <div className="min-w-0 flex-1">
        <DirectoryItemTitle
          headingLevel={3}
          className="block transition-colors group-hover:text-eg-brand-hover"
        >
          {name}
        </DirectoryItemTitle>
      </div>
      <span className="shrink-0 whitespace-nowrap">
        {href ? (
          <DirectoryAction
            href={href}
            ariaLabel={`Apri ${name}`}
            className="after:absolute after:inset-0"
          >
            Apri
          </DirectoryAction>
        ) : (
          <span className="text-[12px] font-semibold text-eg-text-muted">
            {interventionsCount} {interventionsCount === 1 ? "intervento" : "interventi"}
          </span>
        )}
      </span>
    </>
  );

  const rowClassName =
    "group relative flex items-center gap-3.5 border-b border-eg-border py-4.5 pr-4.5 pl-4.5 text-eg-ink transition-[padding-left] duration-200 ease-(--eg-ease-brand)";

  if (href) {
    return (
      <div className={`${rowClassName} hover:pl-6.5`}>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.75 origin-top scale-y-0 bg-eg-accent transition-transform duration-250 ease-(--eg-ease-brand) group-hover:scale-y-100"
        />
        {content}
      </div>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
