# 02_GUARDS.md

# ESIGENTA — GUARD RIGIDI PER AI / CODEX

Versione: 1.0
Stato: OBBLIGATORIO

---

# SCOPO

Questo documento contiene le regole operative che l’AI deve rispettare prima di modificare Esigenta.

Ogni intervento deve seguire:

```txt
01_ARCHITECTURE.md
02_GUARDS.md
```

Se una modifica viola questi documenti, la modifica è vietata.

---

# REGOLA ZERO

Non fare patch casuali.

Non fare fix cosmetici.

Non spostare file marci.

Non creare compat layer inutili.

Non duplicare logica.

Non mischiare responsabilità.

---

# REGOLA LETTURA OBBLIGATORIA

Prima di qualsiasi fase, leggere:

```txt
docs/architetture/01_ARCHITECTURE.md
docs/architetture/02_GUARDS.md
docs/architetture/03_ROADMAP.md
docs/architetture/04_DEFERRED_ITEMS.md
```

Se i file non esistono, fermarsi e segnalarlo.

Ogni fase deve inoltre verificare se chiude un deferred item esistente in
`04_DEFERRED_ITEMS.md` e deve registrare lì qualsiasi nuovo rinvio (vedi regole in quel
documento). Non è consentito lasciare un problema rimandato solo nel `PHASE_REPORT`.

---

# REGOLA APP ROUTER

`apps/web/src/app` è solo routing Next.js.

Consentito:

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

Vietato in `app`:

```txt
query
Prisma
billing logic
domain logic
SEO engine logic
mapping pesante
filtri pesanti
componenti prodotto grandi
orchestratori
```

Ogni `page.tsx` deve essere un bridge sottile.

Esempio corretto:

```tsx
import { RequestFlowPage } from "@/richiesta/flow/request-flow-page"

export default function Page() {
  return <RequestFlowPage />
}
```

---

# REGOLA ROUTE GROUP

Consentito:

```txt
(private)
```

solo per layout/guard/protezione accesso.

Vietato:

```txt
(opportunita)
(comunicazioni)
(account)
(billing)
```

Le responsabilità prodotto stanno fuori da `app`.

---

# REGOLA MACRO OWNER

Ogni file deve avere un owner.

Owner validi in `apps/web/src`:

```txt
app
site
richiesta
area-impresa
ui
platform
auth
```

Owner validi in `packages`:

```txt
database
auth
domain
billing
notifications
funnel
taxonomy
shared
ui
config
```

Se un file non ha owner chiaro, non modificarlo prima di aver prodotto un audit.

---

# REGOLA NO AREA CLIENTE

È vietato creare:

```txt
cliente/
area-cliente/
customer/
```

Il cliente è un cliente soft.

Il cliente vive in:

```txt
apps/web/src/richiesta
```

---

# REGOLA SITE

`site` possiede:

```txt
home
SEO
GEO
guide
costi
legal
shell pubblico
```

Vietato mettere SEO dentro:

```txt
richiesta
area-impresa
app
```

---

# REGOLA SEO/GEO

La SEO/GEO è data-driven.

Struttura obbligatoria:

```txt
apps/web/src/site/seo/
  pages/
  geo/
  market-data/
  matrix/
  engine/
  templates/
```

Vietato creare un file per ogni città dentro ogni famiglia SEO.

Vietato come regola generale:

```txt
ristrutturazione-bagno/
  cities/
    milano.ts
    roma.ts
    catania.ts
    napoli.ts
```

Consentito:

```txt
pages = famiglie SEO
geo = dati città centralizzati
market-data = dati prezzo/mercato
matrix = combinazioni pubblicabili
engine = regole SEO
templates = template riutilizzabili
```

Una pagina città deve essere composta da:

```txt
SEO family
+
geo registry
+
market data
+
matrix policy
+
local override opzionale
+
template
+
engine
```

---

# REGOLA PREZZI LOCALI

I prezzi e i contenuti possono cambiare per città.

È vietato però creare contenuto manuale completo per ogni città.

I prezzi locali devono derivare da:

```txt
base price
city price index
region price index
labor cost index
demand index
local override opzionale
```

Se serve contenuto città specifico, usare `local-overrides.ts` dentro la famiglia SEO.

Non duplicare dati territoriali ufficiali nei local override.

---

# REGOLA RICHIESTA

`richiesta` possiede:

```txt
flow
stato
verifica
comunicazioni cliente
notifiche cliente
```

Vietato mettere dentro `richiesta`:

```txt
billing impresa
dashboard impresa
profilo impresa
richieste disponibili per professionista
```

---

# REGOLA AREA IMPRESA

`area-impresa` possiede il SaaS professionisti.

Struttura obbligatoria:

```txt
area-impresa/
  public/
  private/
  shared-messaging/
  monitoring/
```

Dentro `private`:

```txt
shell/
opportunita/
comunicazioni/
account/
billing/
```

Vietato mettere queste responsabilità come route group dentro `app`.

---

# REGOLA UI

`apps/web/src/ui` contiene solo componenti base web.

Consentito:

```txt
button
input
select
modal
tabs
table
badge
spinner
pagination
empty-state
```

Vietato:

```txt
request-card
billing-card
conversation-thread
company-sidebar
seo-section
credit-package-card
```

Componenti prodotto restano nel prodotto proprietario.

---

# REGOLA PLATFORM

`platform` contiene infrastruttura web:

```txt
monitoring
privacy
uploads
config
errors
```

Vietato mettere in `platform`:

```txt
feature logic
domain logic
billing logic
SEO page content
```

---

# REGOLA AUTH WEB

`apps/web/src/auth` contiene adapter web.

La logica auth vera vive in:

```txt
packages/auth
```

---

# REGOLA PACKAGES

Le app consumano.

I packages possiedono la logica.

Vietato importare Prisma in `apps/web`.

Vietato mettere query dominio dentro componenti React.

Vietato mettere logica billing dentro `app` o dentro componenti UI.

---

# PACKAGE OWNERSHIP

## `packages/database`

Owner:

```txt
Prisma
schema
migrations
client
```

## `packages/auth`

Owner:

```txt
session
actor
guard
policy
```

## `packages/domain`

Owner:

```txt
richieste
aziende
messaggi
copertura
orchestratori dominio
read-model marketplace
```

## `packages/billing`

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
```

## `packages/notifications`

Owner:

```txt
notifiche
read state
unread count
summary
```

## `packages/funnel`

Owner:

```txt
runtime funnel
submit funnel
```

## `packages/taxonomy`

Owner:

```txt
categorie
servizi
interventi
```

## `packages/shared`

Owner:

```txt
helper puri
date
money
distance
text
slug
validation
```

---

# REGOLA ANTI-RIDONDANZA PACKAGE

Prima di creare nuova logica in un package, verificare se esiste già una funzione equivalente.

Cercare nel package owner corretto:

```txt
packages/auth
packages/domain
packages/billing
packages/notifications
packages/shared
```

Se esiste già una funzione equivalente:

```txt
non crearne una nuova
non duplicare
non creare wrapper inutile
non creare compat layer
```

Scegliere invece una di queste opzioni:

```txt
1. riusare la funzione esistente
2. migliorare la funzione esistente se è incompleta
3. riscrivere la funzione esistente se è marcia
4. eliminare il duplicato vecchio se non serve più
```

Se non esiste una funzione equivalente e l'owner è chiaro, si può creare nuova logica nel package
owner corretto.

Regola finale:

```txt
package-first sì
duplicazione no
wrapper inutili no
compat layer no
vecchio + nuovo insieme no
```

Ogni report che tocca packages deve indicare:

```txt
PACKAGE_SEARCH_DONE:
EXISTING_LOGIC_FOUND:
REUSED_EXISTING_LOGIC:
CREATED_NEW_PACKAGE_LOGIC:
REMOVED_DUPLICATE_LOGIC:
REASON:
```

---

# REGOLA FILE MARCIO

Prima di spostare un file, classificarlo.

Categorie:

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

Regola:

```txt
file sano = si può spostare
file marcio = si riscrive
file duplicato = si elimina dopo verifica
file con logica package = si estrae nel package owner
```

---

# REGOLA NO MIGRAZIONE CIECA

È vietato spostare cartelle intere senza audit.

Prima produrre sempre:

```txt
CURRENT_PATH:
CURRENT_ROLE:
CURRENT_PROBLEMS:
OWNER_TARGET:
MOVE_OR_REWRITE:
REASON:
RISK:
```

---

# REGOLA PERFORMANCE

Ogni fase deve preservare o migliorare performance.

Vietato:

```txt
query dentro loop
fetch largo e filtro tutto in JS
auth ripetuta senza motivo
polling aggressivo
waterfall server-side evitabili
logging sempre attivo
payload enormi
revalidatePath troppo ampio
```

Obiettivo:

```txt
query minime
read-model chiari
paginazione DB
filtri DB
sort DB
pageSize + 1
request-scoped cache dove utile
parallelizzazione dove sicura
```

---

# REGOLA AREA IMPRESA P0

Quando si arriva alla performance, le priorità sono:

```txt
/area-impresa/richieste
/area-impresa/crediti checkout/status
```

Questi flow non vanno patchati.

Vanno riscritti nello scope corretto.

---

# REGOLA CHECKPOINT

Prima di una fase che modifica file, creare checkpoint patch fuori dal repo.

Comando PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\Desktop\esigenta-backups" | Out-Null
git diff --binary > "$env:USERPROFILE\Desktop\esigenta-backups\before-phase.patch"
```

Non usare `git add .`.

Non fare commit se non richiesto esplicitamente.

---

# REGOLA SCOPE

Ogni fase deve dichiarare:

```txt
SCOPE:
FILES_ALLOWED:
FILES_FORBIDDEN:
GOAL:
NON_GOALS:
```

Se un file è fuori scope, non modificarlo.

---

# REGOLA FASI

Procedere una fase alla volta.

Ordine consigliato:

```txt
Phase 0 — checkpoint stato attuale

Phase 1 — creare struttura target vuota

Phase 2 — audit mapping app/router -> feature owner

Phase 3 — site/home

Phase 4 — site/seo struttura data-driven

Phase 5 — richiesta/flow

Phase 6 — richiesta/stato/verifica/messaggi

Phase 7 — area-impresa/public

Phase 8 — area-impresa/private/shell

Phase 9 — area-impresa/private/opportunita

Phase 10 — area-impresa/private/comunicazioni

Phase 11 — area-impresa/private/account

Phase 12 — area-impresa/private/billing

Phase 13 — package ownership audit

Phase 14 — performance rewrite P0

Phase 15 — dead code cleanup
```

---

# REGOLA VERIFICA

Ogni fase deve chiudere con:

```powershell
pnpm --filter web typecheck
pnpm --filter web build
```

Se tocca packages:

```powershell
pnpm typecheck
pnpm build
```

Se il comando fallisce, fermarsi e riportare errore.

---

# REPORT OBBLIGATORIO

Ogni fase deve produrre report:

```txt
PHASE_REPORT

STATUS:

SCOPE:
FILES_CHANGED:
FILES_CREATED:
FILES_DELETED:
OLD_CODE_REMOVED:

APP_ROUTER_FILES:
FEATURE_FILES:
PACKAGE_FILES:

URL_CHANGED:
BEHAVIOR_CHANGED:

TYPECHECK_RESULT:
BUILD_RESULT:

PERFORMANCE_IMPACT:
QUERY_COUNT_BEFORE:
QUERY_COUNT_AFTER:
DUPLICATION_REMOVED:

PACKAGE_SEARCH_DONE:
EXISTING_LOGIC_FOUND:
REUSED_EXISTING_LOGIC:
CREATED_NEW_PACKAGE_LOGIC:
REMOVED_DUPLICATE_LOGIC:
REASON:

RISKS:
BLOCKERS:
NEXT_STEP:

DEFERRED_ITEMS_LOGGED:
DEFERRED_ITEMS_RESOLVED:
```

---

# REGOLA FINALE

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
