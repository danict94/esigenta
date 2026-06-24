import Link from "next/link"

import {
  isGeoPlace,
  type GeoPlace,
} from "@esigenta/shared"

import { PublicShell } from "../../../site/shell/public-shell"
import { Grain } from "../../../site/home/grain"
import { ArrowRightIcon } from "../../../site/shell/icons"
import { ZoneGlyph } from "../marketing/marketing-glyphs"

import {
  ImpresaSignupForm,
} from "./components/impresa-signup-form"

export type AreaImpresaSignupPageProps = {
  searchParams: Promise<{
    categorySlug?: string
    activity?: string
    geoPlace?: string
  }>
}

function getValue(value: string | undefined) {
  return value?.trim() || null
}

function parseGeoPlace(
  value: string | undefined,
): GeoPlace | null {
  if (!value) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(value)

    return isGeoPlace(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function AreaImpresaSignupPage({
  searchParams,
}: AreaImpresaSignupPageProps) {
  const params = await searchParams

  const categorySlug = getValue(params.categorySlug)
  const activity = getValue(params.activity)
  const geoPlace = parseGeoPlace(params.geoPlace)

  const hasValidLeadLocation = geoPlace !== null

  const locationLabel = geoPlace
    ? [geoPlace.city, geoPlace.province].filter(Boolean).join(" · ")
    : null

  return (
    <PublicShell>
      <Grain />

      <section
        className="relative bg-cantiere-linen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-cantiere-paper) 0%, var(--color-cantiere-linen) 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[600px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 md:pb-24">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-cantiere-accent">
              Crea accesso
            </p>

            <h1 className="font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)]">
              Raccontaci della tua azienda
            </h1>

            <p className="text-[15px] leading-[1.5] text-cantiere-ink-secondary">
              Inserisci i dati aziendali e crea l&apos;accesso. Dopo la
              registrazione ti chiederemo di accedere per continuare.
            </p>
          </div>

          {activity || locationLabel ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-[12px] uppercase tracking-[0.12em] text-cantiere-ink-secondary">
                Ti iscrivi per
              </span>

              {activity ? (
                <span className="text-[14px] font-medium text-cantiere-ink">
                  {activity}
                </span>
              ) : null}

              {locationLabel ? (
                <span className="inline-flex items-center gap-1.5 text-[14px] text-cantiere-ink-secondary">
                  <ZoneGlyph className="size-4 text-cantiere-accent" />
                  {locationLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <ImpresaSignupForm
              categorySlug={categorySlug ?? undefined}
              geoPlace={geoPlace}
              hasValidLeadLocation={hasValidLeadLocation}
            />
          </div>

          <div className="mt-8 text-[14px] text-cantiere-ink-secondary">
            <Link
              href="/area-impresa"
              className="group inline-flex items-center gap-1.5 font-medium text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
            >
              <ArrowRightIcon className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-1" />
              Torna alla pagina professionisti
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
