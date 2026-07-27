import Link from "next/link";

import { featuredWorks } from "./home-content";
import { HomeImage } from "./home-image";
import { Reveal } from "../shared/reveal";
import { blueprintEyebrowClassName, blueprintTitleClassName, SectionHeader } from "../shared/section-header";

// Segni di registrazione agli angoli della foto (docs/esigenta-brand
// ServiceCard): una "prova fotografica" allegata alla tavola tecnica, non
// un'immagine lifestyle. Base condivisa, ogni angolo aggiunge solo
// posizione e lato del bordo a L.
const FRAME_MARK_BASE_CLASSNAME =
  "absolute size-3 border-solid border-eg-brand-strong transition-colors duration-250 ease-(--eg-ease-brand) group-hover:border-eg-accent";

export function FeaturedWorkSection() {
  return (
    <section id="lavori" className="relative z-1 py-24 max-[600px]:py-16" aria-labelledby="works-title">
      <div className="eg-container">
        <Reveal>
          <SectionHeader
            eyebrow="Lavori piu richiesti"
            title="Le richieste che partono piu spesso da casa."
            id="works-title"
            className="max-w-160 text-left mb-14"
            eyebrowClassName={blueprintEyebrowClassName}
            titleClassName={blueprintTitleClassName}
          />
        </Reveal>

        <Reveal className="grid grid-cols-1 gap-px border border-eg-border bg-eg-border min-[601px]:grid-cols-2 min-[861px]:grid-cols-3">
          {featuredWorks.map((work) => (
            <Link
              key={work.title}
              href={work.href}
              prefetch={false}
              className="group relative flex flex-col bg-eg-surface px-6 pt-6.5 pb-6 no-underline transition-shadow duration-250 ease-(--eg-ease-brand) hover:z-2 hover:shadow-eg-step"
            >
              <div className="relative isolate aspect-4/3 overflow-hidden">
                <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -top-px -left-px border-t-2 border-l-2`} />
                <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -top-px -right-px border-t-2 border-r-2`} />
                <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -bottom-px -left-px border-b-2 border-l-2`} />
                <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -bottom-px -right-px border-b-2 border-r-2`} />
                <HomeImage
                  src={work.imageSrc}
                  alt={work.imageAlt}
                  fallbackLabel={work.fallbackLabel}
                  sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 33vw"
                  className="h-full w-full"
                  imageClassName="object-cover contrast-105"
                />
              </div>

              <h3 className="eg-h3 mt-4 mb-2 text-base font-semibold">{work.title}</h3>
              <p className="eg-body-muted mb-4 flex-1 text-[13px] leading-[1.55]">{work.description}</p>
              <span className="flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-[11.5px] font-semibold text-eg-accent">
                {work.cta}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="size-3 shrink-0 transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-1"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}

          {/* 6a cella della griglia (5 lavori + questa): non un lavoro, un
              invito a sfogliare il catalogo — solo testo, centrato nello
              spazio della riga, nessun pannello colorato al posto della
              foto (che qui non ha senso, non essendo un progetto reale). */}
          <Link
            href="/servizi"
            prefetch={false}
            className="group relative flex flex-col justify-center bg-eg-surface px-6 py-6 no-underline transition-shadow duration-250 ease-(--eg-ease-brand) hover:z-2 hover:shadow-eg-step"
          >
            <span className="mb-2.5 block font-(family-name:--eg-font-brand) text-[10.5px] uppercase tracking-[0.07em] text-eg-text-muted">
              Altri servizi
            </span>
            <h3 className="eg-h3 mb-2 text-base font-semibold">Non trovi il lavoro che ti serve tra questi?</h3>
            <p className="eg-body-muted mb-4 text-[13px] leading-[1.55]">
              Il catalogo comprende decine di interventi diversi, dalle piccole manutenzioni ai lavori piu complessi: sfoglia tutte le categorie e trova quella adatta.
            </p>
            <span className="flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-[11.5px] font-semibold text-eg-accent">
              Scopri tutti i servizi
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                className="size-3 shrink-0 transition-transform duration-200 ease-(--eg-ease-brand) group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
