import Link from "next/link"

import {
  Card,
  CardContent,
  HeroSurface,
} from "@esigenta/ui"

import { PublicShell } from "../../../../components/layout/public-shell"

import {
  ImpresaSignupForm,
} from "./impresa-signup-form"

type AreaImpresaSignupPageProps = {
  searchParams: Promise<{
    categorySlug?: string
    activity?: string
    city?: string
    postalCode?: string
    address?: string
    latitude?: string
    longitude?: string
  }>
}

function getValue(value: string | undefined) {
  return value?.trim() || null
}

function getCoordinate(value: string | undefined) {
  const parsed =
    Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

export default async function AreaImpresaSignupPage({
  searchParams,
}: AreaImpresaSignupPageProps) {
  const params =
    await searchParams

  const categorySlug =
    getValue(params.categorySlug)
  const city =
    getValue(params.city)
  const postalCode =
    getValue(params.postalCode)
  const address =
    getValue(params.address)
  const latitude =
    getCoordinate(params.latitude)
  const longitude =
    getCoordinate(params.longitude)

  const hasValidLeadLocation =
    Boolean(
      city &&
        latitude !== null &&
        longitude !== null,
    )

  const initialCompany = {
    ...(address
      ? {
          address,
        }
      : {}),
    ...(city
      ? {
          city,
        }
      : {}),
    ...(postalCode
      ? {
          postalCode,
        }
      : {}),
    ...(latitude !== null
      ? {
          latitude,
        }
      : {}),
    ...(longitude !== null
      ? {
          longitude,
        }
      : {}),
  }

  return (
    <PublicShell>
      <main className="pb-8 md:pb-10">
        <HeroSurface size="md" className="py-6 md:py-8 xl:py-10">
          <Card className="mx-auto w-full max-w-2xl bg-surface-elevated shadow-surface">
            <CardContent className="flex flex-col gap-5 p-6 md:p-7 xl:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-brand-primary">
                  Crea accesso
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
                  Raccontaci di più sulla tua azienda
                </h1>

                <p className="text-sm leading-6 text-text-secondary">
                  Inserisci i dati aziendali e crea l’accesso. Dopo la
                  registrazione ti chiederemo di accedere per continuare.
                </p>
              </div>

              <ImpresaSignupForm
                categorySlug={
                  categorySlug ?? undefined
                }
                initialCompany={initialCompany}
                hasValidLeadLocation={hasValidLeadLocation}
              />

              <div className="border-t border-border-primary pt-5 text-sm text-text-secondary">
                <Link
                  href="/area-impresa"
                  className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
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