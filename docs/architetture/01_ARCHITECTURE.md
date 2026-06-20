# 01_ARCHITECTURE.md

# ESIGENTA — ARCHITETTURA UFFICIALE

Versione: 1.0
Stato: APPROVATA

---

# PRINCIPIO FONDAMENTALE

Esigenta è organizzata per responsabilità.

Fuori da `app`, il progetto non è organizzato per route, ma per macro-prodotto.

Dentro `app`, invece, esistono solo route Next.js sottili.

---

# MODELLO MENTALE

```txt
app
=
routing Next.js

site
=
SEO
GEO
guide
costi
home
acquisizione traffico organico

richiesta
=
funnel
lead generation
cliente soft
stato richiesta
verifica richiesta
messaggi cliente

area-impresa
=
prodotto SaaS professionisti

ui
=
componenti base web

platform
=
infrastruttura applicativa web

auth
=
adapter auth web

packages
=
business logic
query
policy
billing
auth
notifiche
funnel
taxonomy
database
```

---

# RESPONSABILITÀ

```txt
site porta traffico

richiesta genera lead

area-impresa monetizza

packages possiedono la logica

app instrada
```

---

# ROOT

```txt
apps/
packages/
docs/
```

---

# APPS

```txt
apps/
  web/
  admin/
```

---

# WEB — STRUTTURA TARGET

```txt
apps/web/src/
  app/

  site/

  richiesta/

  area-impresa/

  ui/

  platform/

  auth/
```

---

# APP

## Responsabilità

`apps/web/src/app` contiene esclusivamente routing Next.js.

Può contenere:

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

Non contiene:

```txt
query
business logic
billing
Prisma
mapping dominio
logica SEO proprietaria
componenti prodotto grandi
orchestratori pesanti
```

`app` può esportare metadata o static params solo delegando a moduli esterni.

Esempio consentito:

```tsx
export { generateMetadata } from "@/site/seo/engine/metadata"
```

Esempio vietato:

```tsx
export async function generateMetadata() {
  // logica SEO costruita a mano dentro app
}
```

---

# APP ROUTER SOTTILE

Ogni route deve essere un bridge sottile.

Esempio corretto:

```tsx
import { AreaImpresaRequestsPage } from "@/area-impresa/private/opportunita/richieste/requests-page"

export default function Page() {
  return <AreaImpresaRequestsPage />
}
```

Esempio vietato:

```tsx
export default async function Page() {
  // auth
  // query
  // filtri
  // mapping
  // business logic
  // UI enorme
}
```

---

# ROUTE GROUP

Consentito:

```txt
(private)
```

Solo per:

```txt
layout
guard
protezione accesso
```

Vietato usare route group per responsabilità prodotto:

```txt
(opportunita)
(comunicazioni)
(account)
(billing)
```

Quelle responsabilità stanno in:

```txt
apps/web/src/area-impresa/private/
```

---

# ROUTE UFFICIALI

```txt
/

/interventi
/interventi/[interventoSlug]
/interventi/[interventoSlug]/[citySlug]

/costi
/costi/[costSlug]
/costi/[costSlug]/[citySlug]

/guide
/guide/[guideSlug]

/richiesta/[requestSlug]

/stato-richiesta/[token]

/verifica-richiesta/[token]

/messaggi/accesso

/area-impresa
/area-impresa/accedi
/area-impresa/iscriviti
/area-impresa/recupera-password
/area-impresa/reimposta-password
/area-impresa/seleziona-impresa

/area-impresa/richieste
/area-impresa/richieste/[id]
/area-impresa/richieste-salvate
/area-impresa/richieste-acquistate
/area-impresa/contatti
/area-impresa/contatti/[conversationId]
/area-impresa/assistenza
/area-impresa/assistenza/[conversationId]
/area-impresa/profilo
/area-impresa/configura-servizi
/area-impresa/notifiche
/area-impresa/crediti

/privacy
/termini
/cookie-policy
```

---

# STRUTTURA APP TARGET

```txt
apps/web/src/app/
  page.tsx

  interventi/
    page.tsx
    [interventoSlug]/
      page.tsx
      [citySlug]/
        page.tsx

  costi/
    page.tsx
    [costSlug]/
      page.tsx
      [citySlug]/
        page.tsx

  guide/
    page.tsx
    [guideSlug]/
      page.tsx

  richiesta/
    [requestSlug]/
      page.tsx

  stato-richiesta/
    [token]/
      page.tsx

  verifica-richiesta/
    [token]/
      page.tsx

  messaggi/
    accesso/
      page.tsx

  area-impresa/
    page.tsx

    accedi/
      page.tsx

    iscriviti/
      page.tsx

    recupera-password/
      page.tsx

    reimposta-password/
      page.tsx

    seleziona-impresa/
      page.tsx

    (private)/
      layout.tsx

      richieste/
        page.tsx
        [id]/
          page.tsx

      richieste-salvate/
        page.tsx

      richieste-acquistate/
        page.tsx

      contatti/
        page.tsx
        [conversationId]/
          page.tsx

      assistenza/
        page.tsx
        [conversationId]/
          page.tsx

      profilo/
        page.tsx

      configura-servizi/
        page.tsx

      notifiche/
        page.tsx

      crediti/
        page.tsx

  privacy/
    page.tsx

  termini/
    page.tsx

  cookie-policy/
    page.tsx
```

---

# SITE

## Responsabilità

`apps/web/src/site` possiede:

```txt
home
SEO
GEO
interventi
costi
guide
legal
shell pubblico
acquisizione traffico organico
```

---

# SITE — STRUTTURA TARGET

```txt
apps/web/src/site/
  home/

  seo/

  shell/

  legal/
```

---

# SITE HOME

```txt
site/home/
  home-page.tsx
  hero.tsx
  popular-interventions.tsx
  cost-guides-preview.tsx
  trust-copy.tsx
  home-cta.tsx
```

---

# SITE SEO — STRUTTURA SCALABILE

La SEO/GEO di Esigenta usa una struttura data-driven.

Non si crea un file per ogni città dentro ogni famiglia SEO.

Con centinaia di interventi e centinaia di città, le pagine devono essere generate da:

```txt
famiglia SEO
+
dati geografici
+
dati mercato/prezzo
+
matrice pubblicabile
+
template
+
engine SEO
```

Struttura:

```txt
site/seo/
  pages/

  geo/

  market-data/

  matrix/

  engine/

  templates/
```

---

# SITE SEO PAGES

`site/seo/pages` contiene le famiglie SEO.

Ogni intenzione SEO forte ha una cartella proprietaria.

Esempi:

```txt
site/seo/pages/interventi/ristrutturazione-bagno
site/seo/pages/interventi/rifare-impianto-elettrico
site/seo/pages/costi/quanto-costa-fare-intonaco
site/seo/pages/costi/quanto-costa-ristrutturare-bagno
```

Struttura:

```txt
site/seo/pages/
  interventi/
    ristrutturazione-bagno/
      content.ts
      faq.ts
      schema.ts
      price-model.ts
      local-overrides.ts

    rifare-impianto-elettrico/
      content.ts
      faq.ts
      schema.ts
      price-model.ts
      local-overrides.ts

    installare-fotovoltaico/
      content.ts
      faq.ts
      schema.ts
      price-model.ts
      local-overrides.ts

  costi/
    quanto-costa-ristrutturare-bagno/
      content.ts
      price-table.ts
      factors.ts
      faq.ts
      schema.ts
      local-overrides.ts

    quanto-costa-fare-intonaco/
      content.ts
      price-table.ts
      factors.ts
      faq.ts
      schema.ts
      local-overrides.ts

    quanto-costa-rifare-tetto/
      content.ts
      price-table.ts
      factors.ts
      faq.ts
      schema.ts
      local-overrides.ts

  guide/
    scegliere-impresa-ristrutturazione/
      content.ts
      faq.ts
      schema.ts

    come-confrontare-preventivi/
      content.ts
      faq.ts
      schema.ts
```

---

# SITE SEO GEO

`site/seo/geo` contiene i dati territoriali ufficiali centralizzati.

```txt
site/seo/geo/
  cities.ts
  provinces.ts
  regions.ts
  supported-cities.ts
  geo-slugs.ts
```

Le città non devono essere duplicate nelle famiglie SEO.

Vietato come regola generale:

```txt
ristrutturazione-bagno/
  cities/
    milano.ts
    roma.ts
    catania.ts
    napoli.ts
```

---

# SITE SEO MARKET DATA

`site/seo/market-data` contiene dati economici e territoriali usati per differenziare prezzi e contenuti locali.

```txt
site/seo/market-data/
  base-price-ranges.ts
  city-price-index.ts
  region-price-index.ts
  demand-index.ts
  labor-cost-index.ts
  local-market-notes.ts
```

Esempio concettuale:

```txt
ristrutturazione bagno base
+
moltiplicatore città
+
moltiplicatore regione
+
override locale opzionale
=
range prezzo città
```

---

# SITE SEO MATRIX

`site/seo/matrix` contiene le combinazioni pubblicabili.

```txt
site/seo/matrix/
  seo-combinations.ts
  indexable-pages.ts
  noindex-pages.ts
  sitemap-pages.ts
```

La matrice decide quali combinazioni sono pubblicabili.

Esempi concettuali:

```txt
ristrutturazione-bagno + milano = index
ristrutturazione-bagno + catania = index
ristrutturazione-bagno + comune-non-strategico = noindex/notFound
quanto-costa-fare-intonaco + milano = index
quanto-costa-fare-intonaco + catania = index
```

---

# SITE SEO ENGINE

`site/seo/engine` contiene le regole SEO.

```txt
site/seo/engine/
  resolve-seo-page.ts
  geo-policy.ts
  canonical.ts
  metadata.ts
  sitemap.ts
  static-params.ts
  internal-linking.ts
  not-found-policy.ts
  schema-builder.ts
```

L’engine decide:

```txt
pagina valida
pagina indexabile
pagina noindex
pagina da sitemap
canonical
metadata
internal links
notFound
schema
static params
```

---

# SITE SEO TEMPLATES

`site/seo/templates` contiene i template riutilizzabili.

```txt
site/seo/templates/
  intervention-page-template.tsx
  intervention-city-page-template.tsx
  cost-page-template.tsx
  cost-city-page-template.tsx
  guide-page-template.tsx
```

---

# REGOLA SEO/GEO DEFINITIVA

Le pagine città devono essere diverse, ma non manuali una per una.

```txt
URL città: sì
contenuto città: sì
prezzo città: sì
file città duplicati ovunque: no
```

Una pagina come:

```txt
/interventi/ristrutturazione-bagno/catania
```

deve essere composta da:

```txt
contenuto base famiglia SEO
+
dati geografici città
+
dati prezzo/mercato città
+
override locale opzionale
+
template pagina GEO
+
metadata/canonical generati dall'engine
```

---

# SITE SHELL

```txt
site/shell/
  public-header.tsx
  public-footer.tsx
  public-layout.tsx
```

---

# SITE LEGAL

```txt
site/legal/
  privacy-page.tsx
  terms-page.tsx
  cookie-policy-page.tsx
```

---

# RICHIESTA

## Responsabilità

`apps/web/src/richiesta` possiede:

```txt
funnel
lead generation
cliente soft
stato richiesta
verifica richiesta
messaggi cliente
notifiche cliente
```

Esigenta non possiede una `area-cliente`.

Il cliente segue una richiesta.

---

# RICHIESTA — STRUTTURA TARGET

```txt
apps/web/src/richiesta/
  flow/
    request-flow-page.tsx
    request-flow-shell.tsx

    steps/
      service-step.tsx
      location-step.tsx
      details-step.tsx
      contact-step.tsx
      confirmation-step.tsx

    components/
      request-progress.tsx
      request-summary.tsx
      request-submit-button.tsx

    actions/
      submit-request-action.ts

    view-models/
      request-flow-view-model.ts

  stato/
    request-status-page.tsx
    request-status-card.tsx
    request-timeline.tsx
    request-professionals-section.tsx

  verifica/
    request-verification-page.tsx
    token-verification-result.tsx

  comunicazioni/
    customer-conversation-page.tsx
    customer-message-thread.tsx
    customer-send-message-form.tsx

  notifiche/
    customer-notification-settings.tsx
    request-notification-banner.tsx
```

---

# AREA IMPRESA

## Responsabilità

`apps/web/src/area-impresa` possiede il prodotto SaaS per professionisti.

---

# AREA IMPRESA — STRUTTURA TARGET

```txt
apps/web/src/area-impresa/
  public/

  private/

  shared-messaging/

  monitoring/
```

---

# AREA IMPRESA PUBLIC

Possiede:

```txt
marketing
auth
onboarding pubblico
```

```txt
area-impresa/public/
  marketing/
    area-impresa-marketing-page.tsx
    business-hero.tsx
    business-how-it-works.tsx
    business-benefits.tsx
    company-lead-form.tsx

  auth/
    login-page.tsx
    signup-page.tsx
    recover-password-page.tsx
    reset-password-page.tsx
    select-company-page.tsx

    components/
      impresa-login-form.tsx
      impresa-signup-form.tsx
      recover-password-form.tsx
      reset-password-form.tsx
      select-company-card.tsx

    actions/
      login-action.ts
      signup-action.ts
      recover-password-action.ts
      reset-password-action.ts
```

---

# AREA IMPRESA PRIVATE

```txt
area-impresa/private/
  shell/

  opportunita/

  comunicazioni/

  account/

  billing/
```

---

# AREA IMPRESA PRIVATE SHELL

```txt
area-impresa/private/shell/
  area-impresa-private-layout.tsx
  impresa-sidebar.tsx
  private-header.tsx
  shell-counts.tsx
  shell-navigation.ts
```

---

# AREA IMPRESA OPPORTUNITÀ

Possiede:

```txt
richieste
dettaglio richiesta
richieste salvate
richieste acquistate
azioni opportunità
view-model opportunità
```

```txt
area-impresa/private/opportunita/
  richieste/
    requests-page.tsx
    requests-table.tsx
    requests-list.tsx
    requests-filters.tsx
    request-card.tsx
    request-empty-state.tsx

  richiesta-dettaglio/
    request-detail-page.tsx
    request-detail-card.tsx
    request-commercial-display.tsx
    request-pending-controls.tsx

  richieste-salvate/
    saved-requests-page.tsx
    saved-requests-list.tsx

  richieste-acquistate/
    purchased-requests-page.tsx
    purchased-requests-list.tsx

  actions/
    save-request-action.ts
    unsave-request-action.ts
    unlock-request-action.ts
    contact-customer-action.ts

  view-models/
    requests-list-view-model.ts
    request-detail-view-model.ts
```

---

# AREA IMPRESA COMUNICAZIONI

Possiede:

```txt
contatti
assistenza
conversazioni impresa
azioni messaggistica impresa
```

```txt
area-impresa/private/comunicazioni/
  contatti/
    contacts-page.tsx
    contact-list.tsx
    contact-card.tsx

  assistenza/
    support-page.tsx
    support-conversation-page.tsx

  conversazione/
    company-conversation-thread-page.tsx

  actions/
    send-company-message-action.ts
    open-support-conversation-action.ts
    mark-company-conversation-read-action.ts

  view-models/
    contacts-view-model.ts
    conversation-view-model.ts
```

---

# AREA IMPRESA ACCOUNT

Possiede:

```txt
profilo
servizi
copertura
notifiche account
```

```txt
area-impresa/private/account/
  profilo/
    profile-page.tsx
    profile-form.tsx
    profile-summary.tsx

  servizi/
    service-configuration-page.tsx
    service-list.tsx
    service-toggle.tsx

  copertura/
    coverage-page.tsx
    coverage-form.tsx
    city-coverage-list.tsx

  notifiche/
    notifications-page.tsx
    notifications-list.tsx
    notification-settings.tsx

  actions/
    update-profile-action.ts
    update-services-action.ts
    update-coverage-action.ts
    mark-notification-read-action.ts

  view-models/
    profile-view-model.ts
    services-view-model.ts
    notifications-view-model.ts
```

---

# AREA IMPRESA BILLING

Possiede:

```txt
crediti
acquisti
fatture
rimborsi
azioni billing web sottili
```

La logica vera di crediti, checkout, Stripe, fatture, scadenze e rimborsi vive in `packages/billing`.

```txt
area-impresa/private/billing/
  crediti/
    credits-page.tsx
    credit-balance-card.tsx
    credit-packages.tsx
    credit-checkout-status-banner.tsx

  acquisti/
    purchases-page.tsx
    purchases-list.tsx

  fatture/
    invoices-page.tsx
    invoices-list.tsx

  rimborsi/
    refunds-page.tsx
    refund-request-form.tsx
    refunds-list.tsx

  actions/
    create-credit-checkout-action.ts
    create-refund-request-action.ts

  view-models/
    credits-view-model.ts
    purchases-view-model.ts
    refunds-view-model.ts
```

---

# AREA IMPRESA SHARED MESSAGING

Possiede componenti messaggistica condivisi tra Area Impresa e accessi tokenizzati.

```txt
area-impresa/shared-messaging/
  message-thread.tsx
  send-message-form.tsx
  message-bubble.tsx
  message-composer.tsx
```

---

# AREA IMPRESA MONITORING

```txt
area-impresa/monitoring/
  area-impresa-perf-trace.ts
  area-impresa-debug.ts
```

---

# UI

## Responsabilità

`apps/web/src/ui` contiene componenti base usati solo da `apps/web`.

```txt
apps/web/src/ui/
  button.tsx
  input.tsx
  textarea.tsx
  select.tsx
  checkbox.tsx
  card.tsx
  modal.tsx
  badge.tsx
  tabs.tsx
  table.tsx
  skeleton.tsx
  spinner.tsx
  toast.tsx
  empty-state.tsx
  pagination.tsx
```

Vietato mettere in `ui`:

```txt
request-card
billing-card
conversation-thread
company-sidebar
seo-section
```

Se un componente serve anche ad `admin`, va valutato `packages/ui`.

---

# PLATFORM

## Responsabilità

`apps/web/src/platform` contiene infrastruttura applicativa web.

```txt
apps/web/src/platform/
  monitoring/
    web-vitals.ts
    perf-trace.ts
    logger.ts

  privacy/
    cookie-consent.tsx
    consent-banner.tsx

  uploads/
    upload-client.ts
    upload-widget.tsx

  config/
    env.ts
    public-env.ts

  errors/
    error-boundary.tsx
    not-found-view.tsx
```

---

# AUTH

## Responsabilità

`apps/web/src/auth` contiene solo adapter web.

La logica vera sta in `packages/auth`.

```txt
apps/web/src/auth/
  client.ts
  server.ts
  session.ts
  redirects.ts
```
# BOUNDARY

Questa sezione evita la maggior parte dei futuri pasticci architetturali.

Ogni macro-area può consumare solo gli owner consentiti.

Se una macro-area ha bisogno di una logica non consentita, la logica non va importata direttamente: va spostata o riscritta nel package owner corretto.

---

## PACKAGE OWNERSHIP PRINCIPLE

Prima di introdurre nuova logica deve essere identificato il package owner.

Prima di crearla, verificare che non esista già una funzione equivalente nel package owner
(vedi REGOLA ANTI-RIDONDANZA PACKAGE in `02_GUARDS.md`).

La logica appartiene ai package.

Le app consumano.

```txt
packages = ownership
apps = consumo
app = routing
```

---

## APP BOUNDARY

`apps/web/src/app` può usare solo:

```txt
site
richiesta
area-impresa
auth web adapter
```

`app` non può usare:

```txt
Prisma
database
billing
query dirette
business logic
domain logic
funnel logic
notifications logic
taxonomy logic diretta
```

`app` deve restare un bridge sottile verso il relativo owner.

---

## SITE BOUNDARY

`apps/web/src/site` può usare:

```txt
packages/taxonomy
packages/shared
```

`site` non può usare:

```txt
Prisma
packages/database
packages/billing
packages/auth
packages/notifications
query private
logica Area Impresa
logica richiesta operativa
```

`site` possiede SEO, GEO, home, costi, guide e contenuti pubblici.

Se una pagina SEO ha bisogno di dati di tassonomia, usa `packages/taxonomy`.

Se ha bisogno di helper puri, usa `packages/shared`.

---

## RICHIESTA BOUNDARY

`apps/web/src/richiesta` può usare:

```txt
packages/domain
packages/funnel
packages/taxonomy
packages/shared
```

`richiesta` non può usare:

```txt
packages/billing
packages/notifications impresa
packages/database diretto
Prisma
logica Area Impresa
```

`richiesta` gestisce:

```txt
funnel
lead generation
cliente soft
stato richiesta
verifica richiesta
messaggi cliente
```

---

## AREA IMPRESA BOUNDARY

`apps/web/src/area-impresa` può usare:

```txt
packages/domain
packages/billing
packages/auth
packages/notifications
packages/shared
```

`area-impresa` non può usare:

```txt
packages/database diretto
Prisma diretto
query duplicate locali
logica funnel pubblica non mediata
site SEO internals
```

`area-impresa` è il prodotto SaaS professionisti.

---

## UI BOUNDARY

`apps/web/src/ui` può usare:

```txt
React
className utilities
componenti base
helper puri se davvero necessari
```

`ui` non può usare:

```txt
Prisma
packages/database
packages/domain
packages/billing
packages/auth
packages/notifications
packages/funnel
query
server actions
business logic
```

`ui` non conosce Esigenta.

`ui` non conosce richieste, crediti, imprese, SEO o conversazioni.

---

## PLATFORM BOUNDARY

`apps/web/src/platform` può usare:

```txt
config
monitoring
privacy
uploads
errors
packages/shared
```

`platform` non può usare:

```txt
business logic
billing logic
domain query
SEO content
Area Impresa logic
Richiesta logic
```

`platform` contiene infrastruttura applicativa web, non prodotto.

---

## AUTH WEB BOUNDARY

`apps/web/src/auth` può usare:

```txt
packages/auth
```

`apps/web/src/auth` non può possedere logica auth.

È solo adapter web.

La logica vera vive in:

```txt
packages/auth
```

---

## PACKAGE BOUNDARY

Le app possono consumare i package.

I package non devono dipendere da `apps/web`.

Vietato:

```txt
packages/* -> apps/web/*
packages/* -> app/*
packages/* -> site/*
packages/* -> richiesta/*
packages/* -> area-impresa/*
```

Consentito:

```txt
apps/web -> packages/*
packages/* -> packages/shared
packages/domain -> packages/database
packages/billing -> packages/database
packages/auth -> packages/database
packages/notifications -> packages/database
```

Le dipendenze tra package devono rispettare ownership e non creare cicli.

---

## REGOLA DI IMPORT

Prima di aggiungere un import, chiedere:

```txt
Sto importando dal proprietario corretto?
Sto bypassando un package owner?
Sto portando logica business dentro app?
Sto creando dipendenza inversa?
Sto duplicando una funzione già esistente?
```

Se la risposta non è chiara, fermarsi e produrre audit.

---

## REGOLA FINALE BOUNDARY

```txt
app instrada
site pubblica
richiesta genera lead
area-impresa monetizza
ui disegna componenti base
platform fornisce infrastruttura
auth adatta il web
packages possiedono la logica
```

Nessuna macro-area deve importare responsabilità che non le appartengono.

---

# PACKAGES

I package possiedono la logica.

Le app consumano.

---

# PACKAGES — STRUTTURA TARGET

```txt
packages/
  database/

  auth/

  domain/

  billing/

  notifications/

  funnel/

  taxonomy/

  shared/

  ui/

  config/
```

---

# PACKAGE DATABASE

Owner:

```txt
Prisma
schema
migrations
client
```

---

# PACKAGE AUTH

Owner:

```txt
session
actor
guard
policy
require-user
require-company-actor
require-area-impresa-access
```

---

# PACKAGE DOMAIN

Owner:

```txt
aziende
richieste
messaggi
copertura
orchestratori dominio
read-model marketplace
pricing informativo marketplace
```

---

# PACKAGE BILLING

Owner:

```txt
crediti
checkout
Stripe
fatture
rimborsi
scadenze credito
ledger crediti
FIFO/FEFO
pacchetti credito
prezzi checkout
```

---

# PACKAGE FUNNEL

Owner:

```txt
runtime funnel
submit funnel
normalizzazione richiesta
```

---

# PACKAGE TAXONOMY

Owner:

```txt
categorie
servizi
interventi
taxonomy generated
```

---

# PACKAGE NOTIFICATIONS

Owner:

```txt
notifiche
read state
unread count
notification summary
```

---

# PACKAGE SHARED

Owner:

```txt
date
money
distance
text
slug
validation
helper puri
```

---

# PACKAGE UI

Owner:

```txt
design system condiviso tra web e admin
```

Non duplicare componenti tra `apps/web/src/ui` e `packages/ui`.

---

# REGOLA FILE MARCIO

Non si spostano file marci.

Prima di muovere un file, classificarlo:

```txt
sano
spostabile
marcio
da riscrivere
da eliminare
da estrarre in package
```

Un file è marcio se contiene insieme:

```txt
route
auth
query
mapping
business logic
UI
billing
side effects
```

Se un file è sano, si può spostare.

Se un file è marcio, si riscrive nello scope corretto e poi si elimina il vecchio.

---

# REGOLA FINALE

Qualsiasi nuova funzionalità deve rispettare questa ownership.

Se una responsabilità non appartiene alla cartella corrente, deve essere spostata o riscritta nel relativo owner.

L’architettura si modifica solo aggiornando questo documento.

```txt
Non stiamo spostando cartelle.
Stiamo ricostruendo il prodotto.

app fa routing.
site porta traffico.
richiesta gestisce funnel e cliente soft.
area-impresa è il SaaS professionisti.
packages possiedono la logica vera.

Se un file è sano, si sposta.
Se un file è marcio, si riscrive.
Se una logica appartiene a un package, non resta in app.
```
