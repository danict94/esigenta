import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Badge, Button, Card, Input, PageShell, Select } from "@esigenta/ui";

import {
  deactivateCompanyAccount,
  getCompanyCreditAccountSummary,
  getCompanyProfilePageData,
  requestCompanyPhoneContactChange,
  updateCompanyProfile,
} from "@esigenta/db";

import { requireCompanyActor, requireUser } from "../../../../auth/server";

import { CompanyLocationFields } from "./company-location-fields";

import { DeactivateAccountForm } from "./deactivate-account-form";

export const dynamic = "force-dynamic";

type ProfiloPageProps = {
  searchParams?: Promise<{
    contactRequested?: string;
    error?: string;
    saved?: string;
  }>;
};

const allowedRadiusKm = [10, 20, 30, 50, 75, 100] as const;

const errorMessages: Record<string, string> = {
  invalid_website: "Inserisci un URL valido per il sito web.",
  invalid_radius: "Seleziona un raggio operativo valido.",
  invalid_coordinates:
    "Inserisci latitudine e longitudine valide, oppure lascia entrambi i campi vuoti.",
  company_not_found:
    "Non troviamo il profilo impresa collegato a questo account.",
  invalid_requested_value: "Inserisci almeno un nuovo dato di contatto valido.",
  invalid_phone: "Inserisci un telefono aziendale valido.",
  requested_value_unchanged: "Non hai modificato il telefono aziendale.",
  company_contact_change_request_already_pending:
    "Esiste gia una richiesta in revisione per questo dato.",
  company_membership_not_found:
    "Non puoi richiedere modifiche per questa impresa.",
};

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(code: string): never {
  redirect(`/area-impresa/profilo?error=${encodeURIComponent(code)}`);
}

async function updateCompanyProfileAction(formData: FormData) {
  "use server";

  const actor = await requireCompanyActor();

  const result = await updateCompanyProfile({
    companyId: actor.companyId,
    website: normalizeText(formData.get("website")) || null,
    address: normalizeText(formData.get("address")) || null,
    city: normalizeText(formData.get("city")) || null,
    postalCode: normalizeText(formData.get("postalCode")) || null,
    province: normalizeText(formData.get("province")) || null,
    latitude: normalizeText(formData.get("latitude")) || null,
    longitude: normalizeText(formData.get("longitude")) || null,
    operatingRadiusKm: normalizeText(formData.get("operatingRadiusKm")) || null,
  });

  if (!result.ok) {
    redirectWithError(result.code);
  }

  revalidatePath("/area-impresa/profilo");
  redirect("/area-impresa/profilo?saved=1");
}

async function requestCompanyContactChangeAction(formData: FormData) {
  "use server";

  const [actor, user] = await Promise.all([
    requireCompanyActor(),
    requireUser(),
  ]);

  const result = await requestCompanyPhoneContactChange({
    companyId: actor.companyId,
    requestedByUserId: user.id,
    requestedPhone: normalizeText(formData.get("phone")) || null,
  });

  if (!result.ok) {
    redirectWithError(result.code);
  }

  revalidatePath("/area-impresa/profilo");
  redirect("/area-impresa/profilo?contactRequested=1");
}

async function deactivateAccountAction() {
  "use server";

  const actor = await requireCompanyActor();

  const result = await deactivateCompanyAccount({
    companyId: actor.companyId,

    userId: actor.userId,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  redirect("/");
}

function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Non impostato";
  }

  return String(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date);
}

function formatContactChangeField(field: string) {
  if (field === "PHONE") {
    return "Telefono aziendale";
  }

  return field;
}

function ReadOnlyRow({
  label,
  value,
  note,
}: {
  label: string;
  value?: string | number | null;
  note?: string;
}) {
  return (
    <div className="grid gap-1 border-b border-border-primary py-4 last:border-b-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
      <dt className="text-sm font-medium text-text-muted">{label}</dt>

      <dd>
        <p className="text-sm font-semibold text-text-primary">
          {formatValue(value)}
        </p>

        {note ? (
          <p className="mt-1 text-xs leading-5 text-text-secondary">{note}</p>
        ) : null}
      </dd>
    </div>
  );
}
export default async function ProfiloImpresaPage({
  searchParams,
}: ProfiloPageProps) {
  const params = searchParams ? await searchParams : {};
  const [actor, user] = await Promise.all([
    requireCompanyActor(),
    requireUser(),
  ]);

  const {
    company,
    categories,
    services,
    pendingContactChangeRequests,
  } = await getCompanyProfilePageData({
    companyId: actor.companyId,
  });

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Profilo non disponibile</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Non troviamo il tuo profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            L&apos;account risulta autenticato, ma non e collegato a un profilo
            impresa valido.
          </p>
        </Card>
      </PageShell>
    );
  }

  const accountSummary =
    await getCompanyCreditAccountSummary({
      companyId: company.id,
    });

  const savedMessage = params.saved === "1" ? "Profilo aggiornato." : null;
  const contactRequestedMessage =
    params.contactRequested === "1"
      ? "Richiesta inviata. Il team Esigenta la valutera prima di applicare la modifica."
      : null;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <section className="space-y-6">
        <header className="border-b border-border-primary pb-7">
          <Badge>Profilo impresa</Badge>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary">
            Profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Gestisci le informazioni operative del profilo. I dati sensibili
            restano protetti e richiedono una verifica manuale.
          </p>
        </header>

        {savedMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-text-primary">
              {savedMessage}
            </p>
          </Card>
        ) : null}

        {contactRequestedMessage ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-text-primary">
              {contactRequestedMessage}
            </p>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border-border-focus bg-surface-secondary p-5">
            <p className="text-sm font-semibold text-text-primary">
              {errorMessage}
            </p>
          </Card>
        ) : null}

        <Card className="p-6">
          <div className="border-b border-border-primary pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">
              Dati aziendali
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
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
              value={user.email}
              note="Email ufficiale usata per accesso, notifiche e comunicazioni sulle richieste."
            />
          </dl>

          <form
            action={requestCompanyContactChangeAction}
            className="mt-6 grid gap-5 border-t border-border-primary pt-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-text-secondary">
                  Telefono aziendale
                </span>
                <Input
                  name="phone"
                  defaultValue={company.phone}
                  placeholder="Telefono aziendale"
                />
                <span className="text-xs leading-5 text-text-muted">
                  La modifica viene applicata solo dopo approvazione admin.
                </span>
              </label>
            </div>

            {pendingContactChangeRequests.length > 0 ? (
              <div className="rounded-md border border-border-primary bg-surface-secondary p-4">
                <p className="text-sm font-semibold text-text-primary">
                  Richieste in revisione
                </p>
                <ul className="mt-3 grid gap-2">
                  {pendingContactChangeRequests.map((request) => (
                    <li
                      key={request.id}
                      className="text-sm leading-6 text-text-secondary"
                    >
                      <span className="font-medium text-text-primary">
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
          <div className="border-b border-border-primary pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">
              Sede operativa
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Aggiorna sito web, sede operativa e raggio usati per la dashboard
              richieste.
            </p>
          </div>

          <form action={updateCompanyProfileAction} className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-text-primary">
                Sito web
              </span>
              <Input
                type="url"
                name="website"
                defaultValue={company.website ?? ""}
                placeholder="https://www.esempio.it"
              />
            </label>
            <CompanyLocationFields
              address={company.address}
              city={company.city}
              postalCode={company.postalCode}
              province={company.province}
              latitude={company.latitude}
              longitude={company.longitude}
            />

            <label className="grid gap-2 md:max-w-xs">
              <span className="text-sm font-medium text-text-primary">
                Raggio operativo
              </span>
              <Select
                name="operatingRadiusKm"
                defaultValue={String(company.operatingRadiusKm)}
              >
                {allowedRadiusKm.map((radiusKm) => (
                  <option key={radiusKm} value={radiusKm}>
                    {radiusKm} km
                  </option>
                ))}
              </Select>
              <span className="text-xs leading-5 text-text-secondary">
                Questo raggio modifica la copertura operativa permanente del
                profilo impresa.
              </span>
            </label>

            <div className="flex justify-end border-t border-border-primary pt-5">
              <Button type="submit">Salva profilo</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 border-b border-border-primary pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                Categorie e servizi
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Le categorie definiscono la visibilita ampia; i servizi aiutano
                Esigenta a dare priorita alle richieste piu pertinenti.
              </p>
            </div>

            <Link
              href="/area-impresa/configura-servizi"
              className="text-sm font-medium text-brand-primary"
              prefetch={false}
            >
              Modifica categorie e servizi
            </Link>
          </div>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Categorie operative
              </p>

              {categories.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="success">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-text-secondary">
                  Nessuna categoria operativa configurata.
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary">
                Servizi selezionati
              </p>

              {services.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge key={service.id} variant="neutral">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Hai selezionato categorie operative. I servizi sono opzionali
                  e aiutano Esigenta a dare priorita alle richieste piu
                  pertinenti.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Crediti</p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
                {accountSummary.ok
                  ? `${accountSummary.data.balance} crediti`
                  : "Saldo non disponibile"}
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                {accountSummary.ok && accountSummary.data.expiresAt
                  ? `Scadenza: ${formatDate(accountSummary.data.expiresAt)}`
                  : accountSummary.ok
                    ? "Nessuna scadenza attiva"
                    : accountSummary.message}
              </p>
            </div>

            <Link
              href="/area-impresa/crediti"
              className="text-sm font-medium text-brand-primary"
              prefetch={false}
            >
              Vai ai crediti
            </Link>
          </div>
        </Card>
        <Card className="border-border-primary bg-surface-secondary p-6">
          <div className="border-b border-border-primary pb-5">
            <Badge variant="danger" size="sm">
              Area critica
            </Badge>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
              Elimina account
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              La tua impresa verra disattivata e non ricevera piu richieste. Lo
              storico verra preservato per motivi amministrativi e di sicurezza.
            </p>
          </div>

          <DeactivateAccountForm action={deactivateAccountAction} />
        </Card>
      </section>
    </PageShell>
  );
}
