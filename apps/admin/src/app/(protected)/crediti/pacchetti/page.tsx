import type {
  ReactNode,
} from "react"
import { revalidatePath } from "next/cache"

import {
  createCreditPackage,
  listCreditPackages,
  updateCreditPackage,
} from "@esigenta/billing"

import {
  centsToEuros,
  eurosToCents,
  formatCentsAsCurrency,
} from "@esigenta/shared"

import {
  Badge,
  Button,
  Card,
  Input,
  PageShell,
  Textarea,
} from "@esigenta/ui"

import {
  requireAdmin,
} from "../../../../auth/server"

export const dynamic = "force-dynamic"

function parseInteger(
  value: FormDataEntryValue | null,
  fallback = 0,
) {
  const parsed =
    Number(String(value ?? "").trim())

  return Number.isFinite(parsed)
    ? parsed
    : fallback
}

function parsePriceEurosToCents(
  value: FormDataEntryValue | null,
) {
  const parsed =
    Number(String(value ?? "").trim())

  return Number.isFinite(parsed)
    ? eurosToCents(parsed)
    : 0
}

function parseStatus(
  value: FormDataEntryValue | null,
) {
  return String(value) === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE"
}

async function createPackageAction(
  formData: FormData,
) {
  "use server"

  await requireAdmin()

  const result =
    await createCreditPackage({
      name:
        String(formData.get("name") ?? ""),
      description:
        String(
          formData.get("description") ?? "",
        ),
      credits:
        parseInteger(
          formData.get("credits"),
        ),
      priceCents:
        parsePriceEurosToCents(
          formData.get("priceEuros"),
        ),
      validityDays:
        parseInteger(
          formData.get("validityDays"),
        ),
      currency:
        String(
          formData.get("currency") ?? "EUR",
        ),
      status:
        parseStatus(
          formData.get("status"),
        ),
      sortOrder:
        parseInteger(
          formData.get("sortOrder"),
          0,
        ),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/crediti/pacchetti")
}

async function updatePackageAction(
  formData: FormData,
) {
  "use server"

  await requireAdmin()

  const result =
    await updateCreditPackage({
      id:
        String(formData.get("id") ?? ""),
      name:
        String(formData.get("name") ?? ""),
      description:
        String(
          formData.get("description") ?? "",
        ),
      credits:
        parseInteger(
          formData.get("credits"),
        ),
      priceCents:
        parsePriceEurosToCents(
          formData.get("priceEuros"),
        ),
      validityDays:
        parseInteger(
          formData.get("validityDays"),
        ),
      currency:
        String(
          formData.get("currency") ?? "EUR",
        ),
      status:
        parseStatus(
          formData.get("status"),
        ),
      sortOrder:
        parseInteger(
          formData.get("sortOrder"),
          0,
        ),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath("/crediti/pacchetti")
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-eg-ink">
        {label}
      </span>
      {children}
    </label>
  )
}

const selectClass =
  "h-12 w-full border border-eg-border bg-eg-surface px-4 text-sm text-eg-ink outline-none transition-colors focus:border-eg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"

export default async function CreditPackagesPage() {
  const packages =
    await listCreditPackages()

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-eg-border pb-7">
        <p className="text-sm font-medium text-eg-text-muted">
          Crediti
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-ink">
          Pacchetti crediti
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-text-muted">
          Crea e gestisci i pacchetti che le imprese potranno acquistare.
          Questo step non attiva ancora pagamenti o sblocchi richiesta.
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-eg-ink">
            Nuovo pacchetto
          </h2>

          <p className="mt-2 text-sm leading-6 text-eg-text-muted">
            Definisci crediti, prezzo e stato del pacchetto.
          </p>

          <form
            action={createPackageAction}
            className="mt-6 grid gap-4"
          >
            <Field label="Nome">
              <Input
                name="name"
                required
                placeholder="Starter"
              />
            </Field>

            <Field label="Descrizione">
              <Textarea
                name="description"
                placeholder="Pacchetto introduttivo per nuove imprese."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Crediti">
                <Input
                  name="credits"
                  type="number"
                  min={1}
                  required
                />
              </Field>

              <Field label="Prezzo (€)">
                <Input
                  name="priceEuros"
                  type="number"
                  min={0.01}
                  step={0.01}
                  required
                  placeholder="99.00"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Validità giorni">
                <Input
                  name="validityDays"
                  type="number"
                  min={1}
                  defaultValue={30}
                  required
                />
              </Field>

              <Field label="Valuta">
                <Input
                  name="currency"
                  defaultValue="EUR"
                  maxLength={3}
                  required
                />
              </Field>

              <Field label="Ordine">
                <Input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                />
              </Field>
            </div>

            <Field label="Stato">
              <select
                name="status"
                defaultValue="ACTIVE"
                className={selectClass}
              >
                <option value="ACTIVE">
                  Attivo
                </option>
                <option value="INACTIVE">
                  Non attivo
                </option>
              </select>
            </Field>

            <Button type="submit">
              Crea pacchetto
            </Button>
          </form>
        </Card>

        <section className="grid gap-4">
          {packages.length === 0 ? (
            <Card className="p-8">
              <p className="text-lg font-semibold text-eg-ink">
                Nessun pacchetto creato
              </p>
              <p className="mt-2 text-sm leading-6 text-eg-text-muted">
                Crea il primo pacchetto crediti per preparare la vendita
                alle imprese.
              </p>
            </Card>
          ) : (
            packages.map((creditPackage) => (
              <Card
                key={creditPackage.id}
                className="p-5"
              >
                <form
                  action={updatePackageAction}
                  className="grid gap-4"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={creditPackage.id}
                  />

                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            creditPackage.status ===
                            "ACTIVE"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {creditPackage.status ===
                          "ACTIVE"
                            ? "Attivo"
                            : "Non attivo"}
                        </Badge>

                        <span className="text-xs font-medium uppercase tracking-wide text-eg-text-muted">
                          {creditPackage.credits} crediti ·{" "}
                          {formatCentsAsCurrency(
                            creditPackage.priceCents,
                            creditPackage.currency,
                          )}{" "}
                          · {creditPackage.validityDays} giorni
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-eg-ink">
                        {creditPackage.name}
                      </h2>

                      {creditPackage.description ? (
                        <p className="mt-2 text-sm leading-6 text-eg-text-muted">
                          {creditPackage.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome">
                      <Input
                        name="name"
                        defaultValue={
                          creditPackage.name
                        }
                        required
                      />
                    </Field>

                    <Field label="Descrizione">
                      <Input
                        name="description"
                        defaultValue={
                          creditPackage.description ??
                          ""
                        }
                      />
                    </Field>

                    <Field label="Crediti">
                      <Input
                        name="credits"
                        type="number"
                        min={1}
                        defaultValue={
                          creditPackage.credits
                        }
                        required
                      />
                    </Field>

                    <Field label="Prezzo (€)">
                      <Input
                        name="priceEuros"
                        type="number"
                        min={0.01}
                        step={0.01}
                        defaultValue={
                          centsToEuros(
                            creditPackage.priceCents,
                          )
                        }
                        required
                      />
                    </Field>

                    <Field label="Validità giorni">
                      <Input
                        name="validityDays"
                        type="number"
                        min={1}
                        defaultValue={
                          creditPackage.validityDays
                        }
                        required
                      />
                    </Field>

                    <Field label="Valuta">
                      <Input
                        name="currency"
                        defaultValue={
                          creditPackage.currency
                        }
                        maxLength={3}
                        required
                      />
                    </Field>

                    <Field label="Ordine">
                      <Input
                        name="sortOrder"
                        type="number"
                        min={0}
                        defaultValue={
                          creditPackage.sortOrder
                        }
                      />
                    </Field>

                    <Field label="Stato">
                      <select
                        name="status"
                        defaultValue={
                          creditPackage.status
                        }
                        className={selectClass}
                      >
                        <option value="ACTIVE">
                          Attivo
                        </option>
                        <option value="INACTIVE">
                          Non attivo
                        </option>
                      </select>
                    </Field>
                  </div>

                  <div>
                    <Button type="submit" variant="ghost">
                      Salva modifiche
                    </Button>
                  </div>
                </form>
              </Card>
            ))
          )}
        </section>
      </section>
    </PageShell>
  )
}
