import Link from "next/link"

import {
  Badge,
  Card,
  Container,
  cn,
  tokens,
} from "@fixpro/ui"

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
  const activity =
    getValue(params.activity)
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

  const hasLeadContext =
    Boolean(
      categorySlug ||
        activity ||
        city ||
        postalCode ||
        address,
    )

  const locationLabel =
    [city, postalCode]
      .filter(Boolean)
      .join(" - ") ||
    address

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
    <main className="min-h-screen bg-surface-primary text-text-primary">
      <Container size="lg">
        <div className="grid min-h-screen gap-10 py-12 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>
              FixPro per professionisti
            </Badge>

            <h1
              className={cn(
                "mt-5 text-text-primary",
                tokens.typography.title,
              )}
            >
              Crea il tuo accesso impresa
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
              Raccontaci di più sulla tua azienda e crea l'accesso per
              entrare nell'area impresa.
            </p>

            {hasLeadContext ? (
              <Card className="mt-6 p-5">
                <p className="text-sm font-medium text-text-primary">
                  Hai iniziato da:
                </p>

                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                  {activity ? (
                    <p>
                      Attività selezionata:{" "}
                      <span className="font-medium text-text-primary">
                        {activity}
                      </span>
                    </p>
                  ) : null}

                  {locationLabel ? (
                    <p>
                      Città/zona:{" "}
                      <span className="font-medium text-text-primary">
                        {locationLabel}
                      </span>
                    </p>
                  ) : null}

                </div>

                {address ? (
                  <p className="mt-3 text-xs leading-5 text-text-muted">
                    Localizzazione: {address}
                    {latitude !== null &&
                    longitude !== null
                      ? ` (${latitude}, ${longitude})`
                      : ""}
                  </p>
                ) : null}

                <p className="mt-4 text-xs leading-5 text-text-muted">
                  Questi dati servono ora come riepilogo e precompilazione.
                  Il matching con le richieste verrà gestito in un passaggio
                  successivo.
                </p>
              </Card>
            ) : null}

            {!hasValidLeadLocation ? (
              <Card className="mt-6 p-5">
                <p className="text-sm font-medium text-text-primary">
                  Seleziona prima la località operativa
                </p>

                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Per creare il profilo impresa serve una città scelta dai
                  suggerimenti nella pagina professionisti.
                </p>

                <Link
                  href="/area-impresa"
                  className="mt-4 inline-flex text-sm font-medium text-brand-primary"
                >
                  Torna alla pagina professionisti
                </Link>
              </Card>
            ) : null}

            <div className="mt-6 text-sm text-text-secondary">
              Hai già un profilo?{" "}
              <Link
                href="/area-impresa/accedi"
                className="font-medium text-brand-primary"
              >
                Accedi all'area impresa
              </Link>
            </div>
          </div>

          <Card className="p-6 md:p-8">
            <div>
              <p className="text-sm font-medium text-brand-primary">
                Crea accesso
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
                Raccontaci di più sulla tua azienda
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Inserisci i dati aziendali e crea accesso. Dopo la
                registrazione ti chiederemo di accedere per continuare.
              </p>
            </div>

            <div className="mt-8">
              <ImpresaSignupForm
                initialCompany={initialCompany}
                hasValidLeadLocation={hasValidLeadLocation}
              />
            </div>

            <div className="mt-6 border-t border-border-primary pt-5 text-sm text-text-secondary">
              <Link
                href="/area-impresa"
                className="font-medium text-text-primary"
              >
                Torna alla pagina professionisti
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
