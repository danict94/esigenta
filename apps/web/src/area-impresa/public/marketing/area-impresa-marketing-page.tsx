import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getPublicBusinessAreaPageData,
  reactivateCompanyAccount,
} from "@esigenta/domain";

import { getCurrentUser } from "../../../auth/server";
import { Grain } from "../../../site/home/grain";
import { HomeImage } from "../../../site/home/home-image";
import { Reveal } from "../../../site/home/reveal";
import { egPhotoGrade } from "../../../site/shell/palette";
import { PublicShell } from "../../../site/shell/public-shell";

import { BusinessHowItWorks } from "./business-how-it-works";
import { CompanyLeadForm } from "./company-lead-form";
import {
  LimitedSeatsGlyph,
  RefundGlyph,
  SupportGlyph,
  VerifiedGlyph,
} from "./marketing-glyphs";
import { RequestCard, type RequestCardData } from "./request-card";

export const metadata: Metadata = {
  title: "esigenta Imprese | Nuovi lavori nella tua zona",
  description:
    "Ricevi richieste verificate dalla tua zona, scegli quali contatti sbloccare e gestisci conversazioni e lavori dall'area impresa.",
};

const heroRequest: RequestCardData = {
  category: "Ristrutturazione bagno",
  city: "Catania",
  zoneLabel: "zona indicata",
  badge: { label: "Verificata", tone: "verified" },
  chips: ["Bagno / 6 mq", "Entro 30 giorni"],
  description: "Rifacimento completo, sostituzione sanitari e posa nuovo pavimento.",
  seats: { taken: 1, total: 3 },
};

const heroTrustChips = [
  { glyph: VerifiedGlyph, label: "Richieste verificate" },
  { glyph: LimitedSeatsGlyph, label: "Massimo 3 imprese" },
  { glyph: RefundGlyph, label: "Rimborso crediti" },
] as const;

const valueRows = [
  {
    index: "01",
    title: "Richieste locali, non una bacheca generica",
    body: "Vedi lavori compatibili con la tua zona operativa e con i servizi che hai scelto di coprire.",
    meta: "zona",
  },
  {
    index: "02",
    title: "Dettagli leggibili prima dello sblocco",
    body: "Categoria, luogo, tempi e contesto arrivano ordinati: decidi con criterio prima di usare crediti.",
    meta: "controllo",
  },
  {
    index: "03",
    title: "Conversazioni raccolte in un unico spazio",
    body: "Dopo lo sblocco continui dall'area impresa, senza disperdere contatti e messaggi tra strumenti diversi.",
    meta: "ordine",
  },
] as const;

const trustPillars = [
  {
    glyph: VerifiedGlyph,
    title: "Richieste confermate",
    body: "Il cliente conferma la richiesta prima che arrivi alle imprese.",
  },
  {
    glyph: LimitedSeatsGlyph,
    title: "Posti limitati",
    body: "Ogni opportunita resta aperta a poche imprese, non a una folla indistinta.",
  },
  {
    glyph: RefundGlyph,
    title: "Crediti rimborsabili",
    body: "Se un contatto sbloccato non e utilizzabile, puoi richiedere una verifica.",
  },
  {
    glyph: SupportGlyph,
    title: "Supporto dentro l'area",
    body: "Hai un canale dedicato quando serve chiarire una richiesta o un contatto.",
  },
] as const;

const proof = [
  { number: "3", label: "imprese al massimo su una richiesta" },
  { number: "0", label: "abbonamenti obbligatori per iniziare" },
  { number: "1", label: "area unica per richieste, contatti e messaggi" },
  { number: "100%", label: "scelta tua prima dello sblocco" },
] as const;

async function reactivateAccountAction() {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  await reactivateCompanyAccount(user.id);

  redirect("/area-impresa/richieste");
}

export async function AreaImpresaMarketingPage() {
  const currentUser = await getCurrentUser();
  const { categories, hasDeactivatedCompany } =
    await getPublicBusinessAreaPageData({
      userId: currentUser?.id ?? null,
    });

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <Grain />
        <div className="eg-thread" aria-hidden="true" />

        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+56px)]" aria-labelledby="business-title">
          <div className="eg-container">
            <div className="grid items-start gap-[clamp(42px,6vw,82px)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
              <div className="max-w-[720px] max-lg:max-w-none">
                <p className="eg-eyebrow">Per i professionisti</p>
                <h1 id="business-title" className="eg-h1 mt-5 max-w-[15ch]">
                  Nuovi lavori nella tua zona, <strong>senza contatti a caso</strong>.
                </h1>
                <p className="eg-body-muted mt-6 max-w-[52ch] text-[17px]">
                  Esigenta trasforma il caos delle richieste domestiche in
                  opportunita leggibili: valuti dettagli, zona e crediti prima
                  di aprire il contatto.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="#inizia" className="eg-button-primary">
                    Iscriviti gratis <span aria-hidden="true">&rarr;</span>
                  </Link>
                  <Link href="/area-impresa/accedi" prefetch={false} className="eg-button-ghost">
                    Accedi <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                  {heroTrustChips.map(({ glyph: Glyph, label }) => (
                    <span key={label} className="inline-flex items-center gap-2 text-[14px] text-eg-ardesia">
                      <Glyph className="size-4 shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>

                <Reveal className="mt-12 grid gap-5 sm:grid-cols-[minmax(0,390px)_170px] sm:items-end">
                  <RequestCard {...heroRequest} className="relative z-10" />
                  <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-terra after:opacity-[0.14] after:mix-blend-multiply after:content-[''] hidden aspect-[4/5] sm:block">
                    <HomeImage
                      src="/assets/images/professionisti-hero.webp"
                      decorative
                      fallbackLabel="Professionisti al lavoro"
                      sizes="170px"
                      imageClassName={egPhotoGrade}
                      className="absolute inset-0"
                    />
                  </div>
                </Reveal>
              </div>

              <aside id="inizia" className="scroll-mt-28">
                {hasDeactivatedCompany ? (
                  <div className="eg-panel p-6 md:p-8">
                    <p className="eg-mono-label text-eg-cotto-dark">Account disattivato</p>
                    <h2 className="eg-h3 mt-4">Riattiva il tuo profilo impresa</h2>
                    <p className="eg-body-muted mt-4">
                      Abbiamo trovato un account impresa associato a questa
                      sessione. Puoi riattivarlo mantenendo storico, richieste e
                      configurazione.
                    </p>
                    <form action={reactivateAccountAction} className="mt-6">
                      <button type="submit" className="eg-button-primary w-full">
                        Riattiva account <span aria-hidden="true">&rarr;</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <CompanyLeadForm categories={categories} />
                )}

                <p className="eg-body-muted mt-4 text-[14px]">
                  Hai gia un profilo?{" "}
                  <Link href="/area-impresa/accedi" prefetch={false} className="font-medium text-eg-cotto-dark">
                    Accedi all&apos;area impresa
                  </Link>
                </p>
              </aside>
            </div>
          </div>
        </section>

        <BusinessHowItWorks />

        <section className="eg-section-large bg-eg-calce-2" aria-labelledby="business-value-title">
          <div className="eg-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Perche cambia il lavoro</p>
              <h2 id="business-value-title" className="eg-h2 mt-4">
                Meno rincorsa, piu richieste che puoi leggere.
              </h2>
              <p className="eg-body-muted mx-auto mt-5 max-w-[46ch]">
                La pagina impresa deve sembrare la continuazione della home: un
                percorso chiaro anche per chi il lavoro lo deve prendere.
              </p>
            </div>

            <ul className="mt-[54px] border-t border-eg-hairline max-[860px]:mt-[38px]">
              {valueRows.map((row) => (
                <li key={row.index} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-6 border-b border-eg-hairline py-6 text-eg-terra max-[860px]:grid-cols-[44px_minmax(0,1fr)] max-[860px]:gap-3.5 max-[860px]:py-[22px]">
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-eg-cotto-dark">{row.index}</span>
                  <div>
                    <h3 className="text-[clamp(22px,2.4vw,30px)] font-normal leading-[1.12] tracking-[-0.01em]">{row.title}</h3>
                    <p className="mt-2.5 max-w-[44ch] text-[15px] leading-[1.55] text-eg-ardesia">{row.body}</p>
                  </div>
                  <span className="justify-self-end whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-eg-ardesia-2 max-[860px]:col-start-2 max-[860px]:mt-1 max-[860px]:justify-self-start">{row.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="eg-section-large bg-eg-terra text-eg-calce" aria-labelledby="business-trust-title">
          <div className="eg-container">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
              <div>
                <p className="eg-eyebrow text-eg-calce/60">Tu mantieni il controllo</p>
                <h2 id="business-trust-title" className="eg-h2 mt-4 max-w-[18ch] text-eg-calce">
                  Qualita prima del contatto, non dopo.
                </h2>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.65] text-eg-calce/68">
                  Non compri una promessa alla cieca: leggi, valuti, sblocchi
                  solo quando la richiesta ha senso per il tuo lavoro.
                </p>

                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {trustPillars.map(({ glyph: Glyph, title, body }) => (
                    <div key={title} className="rounded-eg-lg border border-eg-hairline bg-eg-calce-translucent p-5 shadow-eg-slab">
                      <Glyph className="size-6 text-eg-calce" />
                      <h3 className="mt-5 text-[17px] font-medium leading-[1.3]">{title}</h3>
                      <p className="mt-3 text-[14px] leading-[1.6] text-eg-calce/68">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Reveal className="mx-auto w-full max-w-[340px]">
                <div className="relative overflow-hidden rounded-eg-lg shadow-eg-slab after:absolute after:inset-0 after:bg-eg-terra after:opacity-[0.14] after:mix-blend-multiply after:content-[''] aspect-[4/5]">
                  <HomeImage
                    src="/assets/images/area-professionista.webp"
                    decorative
                    fallbackLabel="Professionista al lavoro"
                    sizes="(min-width: 1024px) 340px, 82vw"
                    imageClassName={egPhotoGrade}
                    className="absolute inset-0"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-eg-hairline bg-eg-calce" aria-label="Sintesi area impresa">
          <div className="eg-container grid grid-cols-2 md:grid-cols-4">
            {proof.map((item) => (
              <div key={item.label} className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0">
                <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">{item.number}</p>
                <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="eg-section-large bg-eg-calce" aria-labelledby="business-cta-title">
          <div className="eg-container-narrow text-center">
            <p className="eg-eyebrow">Pronto a partire?</p>
            <h2 id="business-cta-title" className="eg-h2 mt-4">
              Apri il profilo e scegli tu quali lavori seguire.
            </h2>
            <p className="eg-body-muted mx-auto mt-5 max-w-[44ch]">
              Configuri attivita e zona, poi inizi a ricevere opportunita
              coerenti con il tuo lavoro.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="#inizia" className="eg-button-primary">
                Iscriviti gratis <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link href="/area-impresa/accedi" prefetch={false} className="eg-button-ghost">
                Accedi all&apos;area impresa <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
