import Link from "next/link"

import {
  Card,
  CardContent,
  HeroSurface,
} from "@esigenta/ui"

import {
  isGeoPlace,
  type GeoPlace,
} from "@esigenta/shared"

import { PublicShell } from "../../../site/shell/public-shell"

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
    const parsed: unknown =
      JSON.parse(value)

    return isGeoPlace(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}

export async function AreaImpresaSignupPage({
  searchParams,
}: AreaImpresaSignupPageProps) {
  const params =
    await searchParams

  const categorySlug =
    getValue(params.categorySlug)
  const geoPlace =
    parseGeoPlace(params.geoPlace)

  const hasValidLeadLocation =
    geoPlace !== null

  return (
    <PublicShell>
      <main className="pb-8 md:pb-10">
        <HeroSurface size="md" className="py-6 md:py-8 xl:py-10">
          <Card className="mx-auto w-full max-w-2xl bg-cantiere-paper shadow-cantiere-elevation">
            <CardContent className="flex flex-col gap-5 p-6 md:p-7 xl:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-cantiere-accent">
                  Crea accesso
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-cantiere-ink md:text-3xl">
                  Raccontaci di più sulla tua azienda
                </h1>

                <p className="text-sm leading-6 text-cantiere-ink-secondary">
                  Inserisci i dati aziendali e crea l’accesso. Dopo la
                  registrazione ti chiederemo di accedere per continuare.
                </p>
              </div>

              <ImpresaSignupForm
                categorySlug={
                  categorySlug ?? undefined
                }
                geoPlace={geoPlace}
                hasValidLeadLocation={hasValidLeadLocation}
              />

              <div className="border-t border-cantiere-hairline pt-5 text-sm text-cantiere-ink-secondary">
                <Link
                  href="/area-impresa"
                  className="font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
                >
                  Torna alla pagina professionisti
                </Link>
              </div>
            </CardContent>
          </Card>
        </HeroSurface>
      </main>
    </PublicShell>
  )
}
