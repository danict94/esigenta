import Link from "next/link"

import { Badge, Button, Card, Input, PageShell, Select } from "@esigenta/ui"

import { getCompanyProfilePage } from "@esigenta/domain"

import { requireAreaImpresaAccess } from "../../../../auth/server"
import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../../platform/monitoring/area-monitoring"
import { createPerfTrace } from "../../../monitoring/area-impresa-perf-trace"

import { CompanyLocationFields } from "./company-location-fields"
import { DeactivateAccountForm } from "./deactivate-account-form"
import {
  deactivateAccountAction,
  requestCompanyContactChangeAction,
  updateCompanyProfileAction,
} from "../actions/profile-actions"

export type ProfilePageProps = {
  searchParams?: Promise<{
    contactRequested?: string
    error?: string
    saved?: string
  }>
}

const allowedRadiusKm = [10, 20, 30, 50, 75, 100] as const

const errorMessages: Record<string, string> = {
  invalid_website: "Inserisci un URL valido per il sito web.",
  invalid_radius: "Seleziona un raggio operativo valido.",
  invalid_location:
    "Seleziona la sede operativa dai suggerimenti dell'indirizzo.",
  company_not_found:
    "Non troviamo il profilo impresa collegato a questo account.",
  invalid_requested_value: "Inserisci almeno un nuovo dato di contatto valido.",
  invalid_phone: "Inserisci un telefono aziendale valido.",
  requested_value_unchanged: "Non hai modificato il telefono aziendale.",
  company_contact_change_request_already_pending:
    "Esiste gia una richiesta in revisione per questo dato.",
  company_membership_not_found:
    "Non puoi richiedere modifiche per questa impresa.",
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Non impostato"
  }
  return String(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(date)
}

function formatContactChangeField(field: string) {
  if (field === "PHONE") return "Telefono aziendale"
  return field
}

function ReadOnlyRow({
  label,
  value,
  note,
}: {
  label: string
  value?: string | number | null
  note?: string
}) {
  return (
    <div className="grid gap-1 border-b border-eg-hairline py-4 last:border-b-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
      <dt className="text-sm font-medium text-eg-ardesia">{label}</dt>
      <dd>
        <p className="text-sm font-semibold text-eg-terra">{formatValue(value)}</p>
        {note ? (
          <p className="mt-1 text-xs leading-5 text-eg-ardesia">{note}</p>
        ) : null}
      </dd>
    </div>
  )
}

export async function ProfilePage({ searchParams }: ProfilePageProps) {
  const actor = await requireAreaImpresaAccess()

  const monitored = isAreaMonitoringEnabled()
  const pageStart = areaTimestamp()
  const trace = createPerfTrace({ scope: "company-profile" })
  const params = searchParams ? await searchParams : {}

  if (monitored) {
    areaLog("area.model.companyProfile.start", {})
  }

  const { company, categories, interventions, contactChangeRequests, credit } =
    await getCompanyProfilePage(actor, trace.add)

  const durationMs = Math.round(areaTimestamp() - pageStart)

  if (monitored) {
    trace.finish()
    areaLog("area.model.companyProfile.end", { durationMs })
  }

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Profilo non disponibile</Badge>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-eg-terra">
            Non troviamo il tuo profilo impresa
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia">
            L&apos;account risulta autenticato, ma non e collegato a un profilo
            impresa valido.
          </p>
        </Card>
      </PageShell>
    )
  }

  const savedMessage = params.saved === "1" ? "Profilo aggiornato." : null
  const contactRequestedMessage =
    params.contactRequested === "1"
      ? "Richiesta inviata. Il team Esigenta la valutera prima di applicare la modifica."
      : null
  const errorMessage = params.error ? errorMessages[params.error] : null

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <section className="space-y-6">
        <header className="border-b border-eg-hairline pb-7">
          <Badge>Profilo impresa</Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-eg-terra">
            Profilo impresa
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia">
            Gestisci le informazioni operative del profilo. I dati sensibili
            restano protetti e richiedono una verifica manuale.
          </p>
        </header>

        {savedMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-eg-terra">{savedMessage}</p>
          </Card>
        ) : null}

        {contactRequestedMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-eg-terra">{contactRequestedMessage}</p>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border-eg-cotto bg-eg-calce-2 p-5">
            <p className="text-sm font-semibold text-eg-terra">{errorMessage}</p>
          </Card>
        ) : null}

        <Card className="p-6">
          <div className="border-b border-eg-hairline pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-eg-terra">
              Dati aziendali
            </h2>
            <p className="mt-2 text-sm leading-6 text-eg-ardesia">
              Nome, partita IVA ed email impresa restano protetti. Il telefono
              aziendale puo essere modificato inviando una richiesta al team
              Esigenta.
            </p>
          </div>

          <dl className="mt-2">
            <ReadOnlyRow label="Nome impresa" value={company.name} />
            <ReadOnlyRow label="Partita IVA" value={company.vatNumber} />
            <ReadOnlyRow
              label="Email impresa"
              value={actor.user.email}
              note="Email ufficiale usata per accesso, notifiche e comunicazioni sulle richieste."
            />
          </dl>

          <form
            action={requestCompanyContactChangeAction}
            className="mt-6 grid gap-5 border-t border-eg-hairline pt-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-eg-ardesia">
                  Telefono aziendale
                </span>
                <Input
                  name="phone"
                  defaultValue={company.phone}
                  placeholder="Telefono aziendale"
                />
                <span className="text-xs leading-5 text-eg-ardesia">
                  La modifica viene applicata solo dopo approvazione admin.
                </span>
              </label>
            </div>

            {contactChangeRequests.length > 0 ? (
              <div className="rounded-md border border-eg-hairline bg-eg-calce-2 p-4">
                <p className="text-sm font-semibold text-eg-terra">Richieste in revisione</p>
                <ul className="mt-3 grid gap-2">
                  {contactChangeRequests.map((request) => (
                    <li key={request.id} className="text-sm leading-6 text-eg-ardesia">
                      <span className="font-medium text-eg-terra">
                        {formatContactChangeField(request.field)}
                      </span>
                      {": "}
                      {formatValue(request.currentValue)}
                      {" -> "}
                      {formatValue(request.requestedValue)}
                      {" - "}
                      inviata il {formatDate(request.createdAt)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit">Invia richiesta di modifica</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="border-b border-eg-hairline pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-eg-terra">
              Sede operativa
            </h2>
            <p className="mt-2 text-sm leading-6 text-eg-ardesia">
              Aggiorna sito web, sede operativa e raggio usati per la dashboard richieste.
            </p>
          </div>

          <form action={updateCompanyProfileAction} className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-eg-terra">Sito web</span>
              <Input
                type="url"
                name="website"
                defaultValue={company.website ?? ""}
                placeholder="https://www.esempio.it"
              />
            </label>
            <CompanyLocationFields
              geoPlace={company.geoPlace}
            />

            <label className="grid gap-2 md:max-w-xs">
              <span className="text-sm font-medium text-eg-terra">Raggio operativo</span>
              <Select name="operatingRadiusKm" defaultValue={String(company.operatingRadiusKm)}>
                {allowedRadiusKm.map((radiusKm) => (
                  <option key={radiusKm} value={radiusKm}>
                    {radiusKm} km
                  </option>
                ))}
              </Select>
              <span className="text-xs leading-5 text-eg-ardesia">
                Questo raggio modifica la copertura operativa permanente del profilo impresa.
              </span>
            </label>

            <div className="flex justify-end border-t border-eg-hairline pt-5">
              <Button type="submit">Salva profilo</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 border-b border-eg-hairline pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-eg-terra">
                Categorie e interventi
              </h2>
              <p className="mt-2 text-sm leading-6 text-eg-ardesia">
                Le categorie definiscono la visibilita ampia; gli interventi
                aiutano Esigenta a dare priorita alle richieste piu pertinenti.
              </p>
            </div>
            <Link
              href="/area-impresa/configura-servizi"
              className="text-sm font-medium text-eg-cotto"
              prefetch={false}
            >
              Modifica categorie e servizi
            </Link>
          </div>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-sm font-semibold text-eg-terra">Categorie operative</p>
              {categories.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="success">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-eg-ardesia">
                  Nessuna categoria operativa configurata.
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-eg-terra">Interventi selezionati</p>
              {interventions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {interventions.map((intervention) => (
                    <Badge key={intervention.id} variant="neutral">
                      {intervention.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-eg-ardesia">
                  Hai selezionato categorie operative. Gli interventi sono
                  opzionali e aiutano Esigenta a dare priorita alle richieste
                  piu pertinenti.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-eg-ardesia">Crediti</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
                {credit !== null ? `${credit.balance} crediti` : "Saldo non disponibile"}
              </h2>
              <p className="mt-2 text-sm text-eg-ardesia">
                {credit !== null && credit.expiresAt
                  ? `Scadenza: ${formatDate(credit.expiresAt)}`
                  : credit !== null
                    ? "Nessuna scadenza attiva"
                    : ""}
              </p>
            </div>
            <Link
              href="/area-impresa/crediti"
              className="text-sm font-medium text-eg-cotto"
              prefetch={false}
            >
              Vai ai crediti
            </Link>
          </div>
        </Card>

        <Card className="border-eg-hairline bg-eg-calce-2 p-6">
          <div className="border-b border-eg-hairline pb-5">
            <Badge variant="danger" size="sm">
              Area critica
            </Badge>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-eg-terra">
              Elimina account
            </h2>
            <p className="mt-2 text-sm leading-6 text-eg-ardesia">
              La tua impresa verra disattivata e non ricevera piu richieste. Lo
              storico verra preservato per motivi amministrativi e di sicurezza.
            </p>
          </div>
          <DeactivateAccountForm action={deactivateAccountAction} />
        </Card>
      </section>
    </PageShell>
  )
}
