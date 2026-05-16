import { revalidatePath } from "next/cache"

import {
  createCreditPackage,
  listCreditPackages,
  updateCreditPackage,
} from "@fixpro/db"

import {
  Badge,
  Button,
  Card,
  PageShell,
} from "@fixpro/ui"

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

function parseStatus(
  value: FormDataEntryValue | null,
) {
  return String(value) === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE"
}

function formatPrice({
  amountCents,
  currency,
}: {
  amountCents: number
  currency: string
}) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(amountCents / 100)
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
        parseInteger(
          formData.get("priceCents"),
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
        parseInteger(
          formData.get("priceCents"),
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
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  "h-11 w-full rounded-md border border-border-primary bg-surface-primary px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus"

const textareaClass =
  "min-h-24 w-full resize-none rounded-md border border-border-primary bg-surface-primary px-3 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus"

export default async function CreditPackagesPage() {
  const packages =
    await listCreditPackages()

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-border-primary pb-7">
        <p className="text-sm font-medium text-text-muted">
          Crediti
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          Pacchetti crediti
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Crea e gestisci i pacchetti che le imprese potranno acquistare.
          Questo step non attiva ancora pagamenti o sblocchi richiesta.
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Nuovo pacchetto
          </h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Definisci crediti, prezzo e stato del pacchetto.
          </p>

          <form
            action={createPackageAction}
            className="mt-6 grid gap-4"
          >
            <Field label="Nome">
              <input
                name="name"
                required
                placeholder="Starter"
                className={inputClass}
              />
            </Field>

            <Field label="Descrizione">
              <textarea
                name="description"
                placeholder="Pacchetto introduttivo per nuove imprese."
                className={textareaClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Crediti">
                <input
                  name="credits"
                  type="number"
                  min={1}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Prezzo centesimi">
                <input
                  name="priceCents"
                  type="number"
                  min={1}
                  required
                  placeholder="9900"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Validità giorni">
                <input
                  name="validityDays"
                  type="number"
                  min={1}
                  defaultValue={30}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Valuta">
                <input
                  name="currency"
                  defaultValue="EUR"
                  maxLength={3}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Ordine">
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Stato">
              <select
                name="status"
                defaultValue="ACTIVE"
                className={inputClass}
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
              <p className="text-lg font-semibold text-text-primary">
                Nessun pacchetto creato
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
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

                        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                          {creditPackage.credits} crediti ·{" "}
                          {formatPrice({
                            amountCents:
                              creditPackage.priceCents,
                            currency:
                              creditPackage.currency,
                          })}{" "}
                          · {creditPackage.validityDays} giorni
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
                        {creditPackage.name}
                      </h2>

                      {creditPackage.description ? (
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          {creditPackage.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome">
                      <input
                        name="name"
                        defaultValue={
                          creditPackage.name
                        }
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Descrizione">
                      <input
                        name="description"
                        defaultValue={
                          creditPackage.description ??
                          ""
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Crediti">
                      <input
                        name="credits"
                        type="number"
                        min={1}
                        defaultValue={
                          creditPackage.credits
                        }
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Prezzo centesimi">
                      <input
                        name="priceCents"
                        type="number"
                        min={1}
                        defaultValue={
                          creditPackage.priceCents
                        }
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Validità giorni">
                      <input
                        name="validityDays"
                        type="number"
                        min={1}
                        defaultValue={
                          creditPackage.validityDays
                        }
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Valuta">
                      <input
                        name="currency"
                        defaultValue={
                          creditPackage.currency
                        }
                        maxLength={3}
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Ordine">
                      <input
                        name="sortOrder"
                        type="number"
                        min={0}
                        defaultValue={
                          creditPackage.sortOrder
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Stato">
                      <select
                        name="status"
                        defaultValue={
                          creditPackage.status
                        }
                        className={inputClass}
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
                    <Button type="submit" variant="secondary">
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
