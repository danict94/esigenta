import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { getSeoGroupLandingBySlug } from "../seo/pages/gruppi";
import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { InternalPageIntro } from "../shared/internal-page-intro";
import { Reveal } from "../shared/reveal";
import {
  blueprintEyebrowOnDarkClassName,
  blueprintTitleClassName,
} from "../shared/section-header";
import { ServiceGroupIcon } from "./service-group-icons";
import { serviceGroupFamilies } from "./service-group-families";

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
  const interventionCount = groupServices.reduce(
    (total, group) => total + group.interventions.length,
    0,
  );

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
          description="Ogni ambito raccoglie interventi affini: scegli il punto di partenza, poi il funnel entra nel dettaglio del lavoro."
          actions={
            <Link href="/" prefetch={false} className="eg-button-primary eg-button-arrow">
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
                <div key={family.title} className="mb-10 last:mb-0">
                  <h3 className="mb-3 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-mono) text-[11.5px] uppercase tracking-widest text-eg-brand-strong">
                    {family.title}
                  </h3>
                  <div className="grid grid-cols-1 border-t border-eg-border min-[861px]:grid-cols-2">
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
                Il catalogo servizi e in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <section className="eg-theme-dark relative overflow-hidden bg-eg-ink py-16 text-eg-on-brand min-[861px]:py-20" aria-labelledby="services-cta-title">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-55 -right-30 size-120 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--eg-color-brand) 28%, transparent), transparent 70%)",
            }}
          />
          <Reveal className="eg-container relative max-w-155">
            <p className={blueprintEyebrowOnDarkClassName}>Non trovi il tuo lavoro?</p>
            <h2 id="services-cta-title" className={`${blueprintTitleClassName} mt-4 text-eg-on-brand`}>
              Raccontalo comunque: lo traduciamo in una richiesta chiara.
            </h2>
            <p className="mt-3.5 text-[15px] leading-[1.6] text-eg-on-brand-muted">
              Anche se il servizio non compare ancora in catalogo, puoi partire
              dal problema: Esigenta ti aiuta a portarlo verso il professionista
              giusto.
            </p>
            <Link
              href="/"
              prefetch={false}
              className="eg-button-primary eg-button-arrow mt-7"
            >
              Inizia dalla home
            </Link>
          </Reveal>
        </section>

        <section className="border-y border-eg-border bg-eg-surface" aria-label="Sintesi catalogo servizi">
          <Reveal className="eg-container py-16">
            <div className="grid grid-cols-1 gap-px border border-eg-border bg-eg-border min-[861px]:grid-cols-3">
              <StatCell value={groupServices.length} label="Ambiti di lavoro raccolti dalla taxonomy" />
              <StatCell value={interventionCount} label="Interventi disponibili dentro i funnel" />
              <StatCell value={1} label="Metodo unico, dalla richiesta alla scelta" />
            </div>
            <p className="mt-4.5 font-(family-name:--eg-font-primary) text-[13px] text-eg-text-muted">
              &#10003; Ogni voce del catalogo porta a un funnel attivo — nessun percorso segnaposto.
            </p>
          </Reveal>
        </section>
      </div>
    </PublicShell>
  );
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-eg-surface px-6 py-8">
      <p className="font-(family-name:--eg-font-mono) text-[clamp(32px,4vw,44px)] font-bold leading-none text-eg-brand-strong">
        {value}
      </p>
      <p className="mt-2.5 max-w-45 leading-normal text-[12.5px] text-eg-text-muted">{label}</p>
    </div>
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
      <span className="min-w-0 flex-1">
        <span className="block font-(family-name:--eg-font-primary) text-[15px] font-semibold text-eg-ink">
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-eg-text-muted max-[860px]:hidden">
          Ambito pronto per raccogliere richieste e dettagli del lavoro.
        </span>
      </span>
      <span className="shrink-0 whitespace-nowrap font-(family-name:--eg-font-primary) text-xs font-semibold text-eg-brand-strong transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-accent">
        {href ? (
          <span className="inline-flex items-center gap-1">
            APRI
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        ) : (
          `${interventionsCount} ${interventionsCount === 1 ? "intervento" : "interventi"}`
        )}
      </span>
    </>
  );

  const rowClassName =
    "group relative flex items-center gap-3.5 border-b border-eg-border bg-eg-surface py-4.5 pr-4.5 pl-4.5 text-eg-ink transition-[padding-left] duration-200 ease-(--eg-ease-brand) min-[861px]:odd:border-r";

  if (href) {
    return (
      <Link href={href} prefetch={false} className={`${rowClassName} hover:pl-6.5`}>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.75 origin-top scale-y-0 bg-eg-accent transition-transform duration-250 ease-(--eg-ease-brand) group-hover:scale-y-100"
        />
        {content}
      </Link>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
