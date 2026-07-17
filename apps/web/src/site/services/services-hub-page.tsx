import Link from "next/link";

import { frozenTaxonomySource } from "@esigenta/taxonomy";

import { getSeoGroupLandingBySlug } from "../seo/pages/gruppi";
import { buildCanonicalPath } from "../seo/engine/canonical";
import { PublicShell } from "../shell/public-shell";

export function ServicesHubPage() {
  // /servizi espone i Group Service della taxonomy. Una riga diventa
  // cliccabile solo se il gruppo ha una landing reale registrata in
  // site/seo/pages/gruppi: mai promettere destinazioni che non esistono.
  const groupServices = frozenTaxonomySource.projectGroups;
  const interventionCount = groupServices.reduce(
    (total, group) => total + group.interventions.length,
    0,
  );

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]" aria-labelledby="services-title">
          <div className="eg-container-narrow text-center">
            <nav aria-label="Breadcrumb" className="eg-link-mono mb-10">
              <Link href="/" prefetch={false}>
                Home
              </Link>
              <span aria-hidden="true" className="mx-3 text-eg-ardesia-2">
                /
              </span>
              <span className="text-eg-terra">Servizi</span>
            </nav>

            <p className="eg-eyebrow">Esplora per ambito</p>
            <h1 id="services-title" className="eg-h1 mt-5">
              Tutti i servizi, <strong>un solo metodo</strong>.
            </h1>
            <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">
              Parti dall&apos;ambito della casa e arriva a una richiesta leggibile:
              pochi passaggi, dati ordinati, professionisti piu adatti al lavoro.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" prefetch={false} className="eg-button-primary">
                Racconta il lavoro <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="#catalogo-servizi" className="eg-button-ghost">
                Vedi gli ambiti <span aria-hidden="true">&darr;</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="catalogo-servizi" className="eg-section" aria-labelledby="catalog-title">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Catalogo operativo</p>
              <h2 id="catalog-title" className="eg-h2 mt-4">
                Ambiti chiari prima del preventivo.
              </h2>
              <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
                Ogni ambito raccoglie interventi affini: scegli il punto di
                partenza, poi il funnel entra nel dettaglio del lavoro.
              </p>
            </div>

            {groupServices.length > 0 ? (
              <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]" aria-label="Ambiti servizio">
                {groupServices.map((group, index) => (
                  <GroupServiceRow
                    key={group.slug}
                    index={index + 1}
                    name={group.name}
                    interventionCount={group.interventions.length}
                    href={
                      getSeoGroupLandingBySlug(group.slug)
                        ? buildCanonicalPath({
                            family: "groupHub",
                            slug: group.slug,
                          })
                        : null
                    }
                  />
                ))}
              </ul>
            ) : (
              <p className="eg-body-muted mx-auto mt-12 max-w-[46ch] text-center">
                Il catalogo servizi e in preparazione. Torna a trovarci presto.
              </p>
            )}
          </div>
        </section>

        <section className="eg-section-large bg-eg-calce-2" aria-labelledby="services-cta-title">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Non trovi il tuo lavoro?</p>
            <h2 id="services-cta-title" className="eg-h2 mt-4">
              Raccontalo comunque: lo traduciamo in una richiesta chiara.
            </h2>
            <p className="eg-body-muted mx-auto mt-5 max-w-[44ch]">
              Anche se il servizio non compare ancora in catalogo, puoi partire
              dal problema: Esigenta ti aiuta a portarlo verso il professionista
              giusto.
            </p>
            <Link href="/" prefetch={false} className="eg-button-primary mt-9">
              Inizia dalla home <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>

        <section className="border-y border-eg-hairline bg-eg-calce" aria-label="Sintesi catalogo servizi">
          <div className="eg-container grid grid-cols-2 md:grid-cols-4">
            <div className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0">
              <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">{groupServices.length}</p>
              <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">Ambiti di lavoro raccolti dalla taxonomy</p>
            </div>
            <div className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0">
              <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">{interventionCount}</p>
              <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">Interventi disponibili dentro i funnel</p>
            </div>
            <div className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0">
              <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">1</p>
              <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">Metodo unico, dalla richiesta alla scelta</p>
            </div>
            <div className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0">
              <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">0</p>
              <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">Percorsi finti o link verso pagine non pronte</p>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

function GroupServiceRow({
  index,
  name,
  interventionCount,
  href,
}: {
  index: number;
  name: string;
  interventionCount: number;
  href: string | null;
}) {
  const rowContent = (
    <>
      <span aria-hidden="true" data-nosnippet="" className="font-mono text-xs uppercase tracking-[0.12em] text-eg-cotto-dark">{String(index).padStart(2, "0")}</span>
      {" "}
      <div>
        <h3 className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em]">{name}</h3>
        <p className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-ardesia">
          Ambito pronto per raccogliere richieste e dettagli del lavoro.
        </p>
      </div>
      <span className="justify-self-end whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-ardesia-2 max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">
        {href
          ? "Apri →"
          : `${interventionCount} ${interventionCount === 1 ? "intervento" : "interventi"}`}
      </span>
    </>
  );

  const rowClassName =
    "grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-hairline py-6 text-eg-terra max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px]";

  if (href) {
    return (
      <li>
        <Link
          href={href}
          prefetch={false}
          className={`${rowClassName} transition-colors hover:text-eg-cotto-dark`}
        >
          {rowContent}
        </Link>
      </li>
    );
  }

  return <li className={rowClassName}>{rowContent}</li>;
}
