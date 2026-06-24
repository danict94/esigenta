import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getPublicBusinessAreaPageData,
  reactivateCompanyAccount,
} from "@esigenta/domain";

import { getCurrentUser } from "../../../auth/server";

import { Badge, Button, Card, CardContent } from "@esigenta/ui";

import { PublicShell } from "../../../site/shell/public-shell";
import { Grain } from "../../../site/home/grain";
import { Reveal } from "../../../site/home/reveal";
import { HomeImage } from "../../../site/home/home-image";
import { ccPhotoGrade } from "../../../site/shell/palette";
import { ArrowRightIcon } from "../../../site/shell/icons";

import { CompanyLeadForm } from "./company-lead-form";
import { BusinessHowItWorks } from "./business-how-it-works";
import { RequestCard, type RequestCardData } from "./request-card";
import {
  LimitedSeatsGlyph,
  RefundGlyph,
  RequestGlyph,
  SupportGlyph,
  UnlockGlyph,
  VerifiedGlyph,
  ZoneGlyph,
} from "./marketing-glyphs";

export const metadata: Metadata = {
  title: "esigenta Imprese | Nuovi lavori nella tua zona, senza richieste inutili",
  description:
    "Ricevi richieste verificate dalla tua zona, scegli tu quali contatti sbloccare e gestisci conversazioni e lavori dall'area impresa. Iscrizione gratuita, crediti senza abbonamento obbligatorio.",
};

const heroRequest: RequestCardData = {
  category: "Ristrutturazione bagno",
  city: "Catania",
  zoneLabel: "zona indicata",
  badge: { label: "Verificata", tone: "verified" },
  chips: ["Bagno · 6 m²", "Entro 30 giorni"],
  description: "Rifacimento completo, sostituzione sanitari e posa nuovo pavimento.",
  seats: { taken: 1, total: 3 },
};

const heroTrustChips = [
  { glyph: VerifiedGlyph, label: "Richieste verificate" },
  { glyph: LimitedSeatsGlyph, label: "Massimo 3 imprese" },
  { glyph: RefundGlyph, label: "Rimborso crediti" },
] as const;

const valueBlocks = [
  {
    glyph: ZoneGlyph,
    title: "Richieste locali",
    body: "Ricevi richieste reali dalla tua zona operativa, coerenti con i servizi che hai configurato. Niente bacheca caotica: solo lavoro pertinente.",
  },
  {
    glyph: UnlockGlyph,
    title: "Scegli tu quali contatti sbloccare",
    body: "Vedi categoria, zona e dettagli prima di decidere. Sblocchi soltanto le richieste che ti interessano davvero.",
  },
  {
    glyph: RequestGlyph,
    title: "Tutto in un unico spazio",
    body: "Richieste, contatti e conversazioni restano raccolti nell'area impresa, senza disperdere nulla tra strumenti diversi.",
  },
] as const;

const trustPillars = [
  {
    glyph: VerifiedGlyph,
    title: "Richieste verificate e moderate",
    body: "Ogni richiesta è confermata via email dal cliente e revisionata prima di arrivare a te.",
  },
  {
    glyph: LimitedSeatsGlyph,
    title: "Massimo 3 imprese per richiesta",
    body: "Posti limitati: niente corsa di massa sullo stesso contatto.",
  },
  {
    glyph: RefundGlyph,
    title: "Rimborso crediti",
    body: "Se sblocchi e il contatto si rivela inutilizzabile, puoi richiedere il rimborso dei crediti.",
  },
  {
    glyph: SupportGlyph,
    title: "Assistenza dedicata",
    body: "Un canale di supporto nell'area impresa, quando ti serve una mano.",
  },
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
      <Grain />

      {/* Hero — a complete system: the words, the proof (sample request over a
          photographic slab) and the conversion form, on the warm linen ground. */}
      <section
        className="relative overflow-hidden bg-cantiere-linen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-cantiere-paper) 0%, var(--color-cantiere-linen) 100%)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-28 sm:px-10 sm:pt-32 md:px-12 md:pb-24 md:pt-36 lg:px-16">
          <div className="max-w-3xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-cantiere-accent">
              Per i professionisti
            </p>

            <h1 className="mt-5 max-w-[18ch] font-medium leading-[1.04] tracking-[-0.02em] text-cantiere-ink text-[clamp(2.25rem,1.5rem+3.2vw,4rem)]">
              Trova nuovi lavori nella tua zona, senza perdere tempo con
              richieste inutili.
            </h1>

            <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.5] text-cantiere-ink-secondary">
              Tu porti la competenza. esigenta ti collega a richieste reali
              vicino a te, con il costo in crediti sempre in chiaro e poche
              imprese per ogni opportunità.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start xl:gap-16">
            {/* Proof — what you actually receive. */}
            <Reveal className="flex flex-col gap-8">
              <div className="relative pr-6 pt-10 sm:pr-10">
                <div className="absolute right-0 top-0 hidden w-[52%] max-w-[260px] sm:block">
                  <div className="relative aspect-[4/5] rotate-3 overflow-hidden rounded-[4px] border-[6px] border-white shadow-cantiere-slab">
                    <HomeImage
                      src="/assets/images/professionisti-hero.webp"
                      decorative
                      fallbackLabel="Professionisti al lavoro"
                      sizes="(min-width: 1024px) 260px, 40vw"
                      imageClassName={ccPhotoGrade}
                      className="absolute inset-0"
                    />
                  </div>
                </div>

                <RequestCard
                  {...heroRequest}
                  className="relative z-10 max-w-md -rotate-1"
                />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {heroTrustChips.map(({ glyph: Glyph, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 text-[14px] text-cantiere-ink-secondary"
                  >
                    <Glyph className="size-4 shrink-0 text-cantiere-ink-secondary" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Conversion — the real funnel stays the hero's primary action. */}
            <div id="inizia" className="scroll-mt-24">
              {hasDeactivatedCompany ? (
                <Card className="w-full bg-cantiere-paper shadow-cantiere-slab">
                  <CardContent className="flex flex-col gap-5 p-6 md:p-8">
                    <Badge variant="warning">Account disattivato</Badge>

                    <div className="space-y-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-cantiere-ink">
                        Riattiva il tuo profilo impresa
                      </h2>

                      <p className="text-sm leading-6 text-cantiere-ink-secondary">
                        Abbiamo trovato un account impresa associato a questa
                        sessione. Puoi riattivarlo mantenendo storico, richieste
                        e configurazione.
                      </p>
                    </div>

                    <form action={reactivateAccountAction}>
                      <Button type="submit">Riattiva account</Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <CompanyLeadForm categories={categories} />
              )}

              <p className="mt-4 text-[15px] text-cantiere-ink-secondary">
                Hai già un profilo?{" "}
                <Link
                  href="/area-impresa/accedi"
                  className="font-medium text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
                >
                  Accedi all&apos;area impresa
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value — white ground, each block anchored by a proprietary glyph. */}
      <section className="relative bg-white py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-10 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.16em] text-cantiere-ink-secondary">
              Come lavori con esigenta
            </p>

            <h2 className="mt-4 max-w-[20ch] font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)]">
              Un flusso di lavoro ordinato, non un mercato di contatti.
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[8px] border border-cantiere-hairline bg-cantiere-hairline md:grid-cols-3">
            {valueBlocks.map(({ glyph: Glyph, title, body }) => (
              <div key={title} className="bg-white p-8 md:p-9">
                <span className="flex size-12 items-center justify-center rounded-[8px] bg-cantiere-accent-tint text-cantiere-accent">
                  <Glyph className="size-6" />
                </span>

                <h3 className="mt-6 text-[18px] font-medium leading-[1.3] text-cantiere-ink">
                  {title}
                </h3>

                <p className="mt-3 text-[15px] leading-[1.55] text-cantiere-ink-secondary">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BusinessHowItWorks />

      {/* Trust — the page's strong dark moment: light glyphs on ink, the calm
          single-professional photograph as a framed slab beside the proof. */}
      <section className="relative bg-cantiere-ink">
        <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-10 md:px-12 md:py-28 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center xl:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-cantiere-paper/55">
                Tu mantieni il controllo
              </p>

              <h2 className="mt-4 max-w-[18ch] font-medium tracking-[-0.01em] text-cantiere-paper text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)]">
                Lead di qualità, e nessun rischio comprato alla cieca.
              </h2>

              <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
                {trustPillars.map(({ glyph: Glyph, title, body }) => (
                  <div key={title} className="flex flex-col">
                    <span className="flex size-11 items-center justify-center rounded-[8px] border border-cantiere-paper/15 text-cantiere-paper">
                      <Glyph className="size-6" />
                    </span>

                    <h3 className="mt-5 text-[16px] font-medium leading-[1.35] text-cantiere-paper">
                      {title}
                    </h3>

                    <p className="mt-2 text-[14px] leading-[1.55] text-cantiere-paper/70">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Reveal className="mx-auto w-full max-w-[340px]">
              <div className="relative aspect-[4/5] rotate-2 overflow-hidden rounded-[4px] border-[6px] border-white shadow-cantiere-slab">
                <HomeImage
                  src="/assets/images/area-professionista.webp"
                  decorative
                  fallbackLabel="Professionista al lavoro"
                  sizes="(min-width: 1024px) 340px, 80vw"
                  imageClassName={ccPhotoGrade}
                  className="absolute inset-0"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA — linen close, conversion anchored back to the hero form. */}
      <section className="relative border-t border-cantiere-hairline bg-cantiere-linen">
        <div className="mx-auto grid max-w-[1120px] gap-12 px-5 py-20 sm:px-10 md:px-12 md:py-28 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:px-16">
          <div className="flex flex-col items-start gap-7">
            <h2 className="max-w-[18ch] font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.75rem,1.2rem+2.4vw,2.75rem)]">
              Pronto a ricevere lavoro dalla tua zona?
            </h2>

            <p className="max-w-[42ch] text-[17px] leading-[1.5] text-cantiere-ink-secondary">
              Crea il profilo impresa gratuitamente e inizia a vedere le
              richieste reali vicino a te. Sblocchi solo quelle che ti
              interessano.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="#inizia"
                className="group inline-flex h-12 w-fit items-center justify-center gap-2 rounded-[8px] bg-cantiere-accent px-6 text-[15px] font-medium text-cantiere-paper transition-colors hover:bg-cantiere-accent-hover"
              >
                Iscriviti come professionista
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/area-impresa/accedi"
                className="inline-flex h-12 w-fit items-center justify-center text-[15px] font-medium text-cantiere-ink-secondary transition-colors hover:text-cantiere-ink"
              >
                Accedi all&apos;area impresa
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[4px] border-[6px] border-white shadow-cantiere-slab">
              <HomeImage
                src="/assets/images/professionisti.webp"
                decorative
                fallbackLabel="Professionisti sui progetti"
                sizes="300px"
                imageClassName={ccPhotoGrade}
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
