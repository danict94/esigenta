import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { getSeoGroupLandingBySlug } from "../seo/pages/gruppi";
import { buildCanonicalPath } from "../seo/engine/canonical";
import { PublicShell } from "../shell/public-shell";
import { Reveal } from "../shared/reveal";
import { blueprintEyebrowClassName, blueprintTitleClassName, SectionHeader } from "../shared/section-header";
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
    groupServices.map((group, position) => [group.slug, { group, index: position + 1 }]),
  );

  const families = serviceGroupFamilies
    .map((family) => ({
      title: family.title,
      entries: family.groupSlugs
        .map((slug) => groupsBySlug.get(slug))
        .filter((entry): entry is { group: (typeof groupServices)[number]; index: number } =>
          Boolean(entry),
        ),
    }))
    .filter((family) => family.entries.length > 0);

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-container pt-[calc(var(--eg-nav-height)+20px)] pb-5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-(family-name:--eg-font-brand) text-[12.5px] text-eg-text-muted"
          >
            <Link href="/" prefetch={false} className="transition-colors hover:text-eg-brand-strong">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-eg-ink">Servizi</span>
          </nav>
        </div>

        <section
          className="relative overflow-hidden bg-eg-brand-strong pt-14 pb-16 text-eg-on-brand"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 82% 12%, color-mix(in srgb, var(--eg-color-brand) 42%, transparent), transparent 55%), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 32px 32px, 32px 32px",
            backgroundRepeat: "no-repeat, repeat, repeat",
          }}
        >
          <div className="eg-container relative max-w-175">
            <p className="flex items-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-eg-brand-on-dark before:inline-block before:h-px before:w-5.5 before:bg-eg-brand-on-dark before:content-['']">
              Esplora per ambito
            </p>
            <h1 className="mt-4.5 mb-4 text-balance font-(family-name:--eg-font-brand) text-[clamp(28px,4.4vw,46px)] font-semibold leading-[1.15] tracking-[-0.01em]">
              Tutti i servizi, <strong className="font-semibold text-eg-emphasis-warm">un solo metodo</strong>.
            </h1>
            <p className="max-w-120 text-[16.5px] leading-[1.6] text-eg-on-brand-muted">
              Parti dall&apos;ambito della casa e arriva a una richiesta leggibile:
              pochi passaggi, dati ordinati, professionisti piu adatti al lavoro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 bg-eg-action px-5.5 py-3.5 font-(family-name:--eg-font-brand) text-[13px] font-semibold uppercase tracking-[0.04em] text-eg-on-brand transition hover:brightness-90"
              >
                Racconta il lavoro <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="#catalogo-servizi"
                className="inline-flex items-center gap-2 border border-eg-on-brand-border px-5.5 py-3.5 font-(family-name:--eg-font-brand) text-[13px] font-semibold uppercase tracking-[0.04em] text-eg-on-brand transition hover:border-eg-on-brand hover:bg-white/8"
              >
                Vedi gli ambiti <span aria-hidden="true">&darr;</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="catalogo-servizi" className="py-20" aria-labelledby="catalog-title">
          <div className="eg-container">
            <Reveal>
              <SectionHeader
                eyebrow="Catalogo operativo"
                title="Ambiti chiari prima del preventivo."
                id="catalog-title"
                className="max-w-160 text-left mb-3.5"
                eyebrowClassName={blueprintEyebrowClassName}
                titleClassName={blueprintTitleClassName}
              />
              <p className="max-w-140 text-[15px] leading-[1.6] text-eg-text-muted">
                Ogni ambito raccoglie interventi affini: scegli il punto di
                partenza, poi il funnel entra nel dettaglio del lavoro.
              </p>
            </Reveal>

            {families.length > 0 ? (
              <Reveal className="mt-11">
                {families.map((family) => (
                  <div key={family.title} className="mb-10 last:mb-0">
                    <h3 className="mb-3 border-b border-eg-border pb-2.5 font-(family-name:--eg-font-brand) text-[11.5px] uppercase tracking-widest text-eg-brand">
                      {family.title}
                    </h3>
                    <div className="grid grid-cols-1 border-t border-eg-border min-[861px]:grid-cols-2">
                      {family.entries.map(({ group, index }) => (
                        <ServiceGroupRow
                          key={group.slug}
                          slug={group.slug}
                          name={group.name}
                          index={index}
                          href={resolveGroupHref(group.slug)}
                          interventionsCount={group.interventions.length}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </Reveal>
            ) : (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Il catalogo servizi e in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-eg-ink py-16 text-eg-on-brand min-[861px]:py-20" aria-labelledby="services-cta-title">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-55 -right-30 size-120 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--eg-color-brand) 28%, transparent), transparent 70%)",
            }}
          />
          <Reveal className="eg-container relative max-w-155">
            <p className={blueprintEyebrowClassName}>Non trovi il tuo lavoro?</p>
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
              className="mt-7 inline-flex items-center gap-2 bg-eg-action px-5.5 py-3.5 font-(family-name:--eg-font-brand) text-[13px] font-semibold uppercase tracking-[0.04em] text-eg-on-brand transition hover:brightness-90"
            >
              Inizia dalla home <span aria-hidden="true">&rarr;</span>
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
            <p className="mt-4.5 font-(family-name:--eg-font-brand) text-[13px] text-eg-text-muted">
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
      <p className="font-(family-name:--eg-font-brand) text-[clamp(32px,4vw,44px)] font-bold leading-none text-eg-brand-strong">
        {value}
      </p>
      <p className="mt-2.5 max-w-45 leading-normal text-[12.5px] text-eg-text-muted">{label}</p>
    </div>
  );
}

function ServiceGroupRow({
  slug,
  name,
  index,
  href,
  interventionsCount,
}: {
  slug: string;
  name: string;
  index: number;
  href: string | null;
  interventionsCount: number;
}) {
  const content = (
    <>
      <ServiceGroupIcon
        slug={slug}
        className="size-7.5 shrink-0 text-eg-brand-strong transition-transform duration-250 ease-(--eg-ease-brand) group-hover:scale-105 group-hover:-rotate-2 group-hover:text-eg-accent"
      />
      <span className="shrink-0 font-(family-name:--eg-font-brand) text-xs font-bold text-eg-text-muted">
        {String(index).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-(family-name:--eg-font-brand) text-[15px] font-semibold text-eg-ink">
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-eg-text-muted max-[860px]:hidden">
          Ambito pronto per raccogliere richieste e dettagli del lavoro.
        </span>
      </span>
      <span className="shrink-0 whitespace-nowrap font-(family-name:--eg-font-brand) text-xs font-semibold text-eg-brand-strong transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-0.5 group-hover:text-eg-accent">
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
