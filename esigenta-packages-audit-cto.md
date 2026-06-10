# ESIGENTA / FIXPRO — Packages Audit CTO

Scope analizzato dallo ZIP ricevuto: `packages/db` e `packages/ui`. Nello ZIP non risultano presenti `packages/uploads` e `packages/config`, quindi il verdetto riguarda solo i due package inclusi.

## Verdetto sintetico

La struttura non è da buttare: i domini principali esistono e `packages/db` contiene già quasi tutto ciò che serve per una piattaforma pulita. Però la parte Area Impresa è rimasta a metà tra architettura vecchia e nuova.

Il problema più importante non è più “manca un indice”. Il problema è che alcuni boundary sono incompleti e quindi generano query/round-trip duplicati:

1. `CompanyActor` esiste ma è povero e dipende da `company-guards`.
2. `company-guards.ts` contiene troppe responsabilità.
3. `/richieste` usa ancora matching live in `list-available-requests-for-company.ts`, non il read model `RequestDispatch`.
4. Il dettaglio richiesta ricalcola visibility/distanza invece di appoggiarsi a `RequestDispatch` / `RequestUnlock`.
5. Alcune funzioni conversazioni accettano `authorizedActor`, altre ricalcolano ancora actor.
6. Ci sono molte duplicazioni piccole di normalizzatori e helper.
7. `packages/ui` è abbastanza sano, ma alcuni componenti bypassano i token già esistenti.

## Dati strutturali rilevati

### `packages/db`

- File TypeScript totali: 179 tra `db/src` e `ui/src`.
- `db/src/requests`: 33 file, circa 6.647 righe.
- `db/src/conversations`: 15 file, circa 4.656 righe.
- `db/src/funnel`: 37 file, circa 4.404 righe.
- `db/src/taxonomy`: 41 file, circa 3.972 righe.
- `db/src/credits`: 10 file, circa 3.200 righe.

File più grandi:

- `db/src/credits/credit-ledger.ts`: 1.116 righe.
- `db/src/requests/list-available-requests-for-company.ts`: 910 righe.
- `db/src/search-taxonomy.ts`: 800 righe.
- `db/src/credits/credit-refund-requests.ts`: 704 righe.
- `db/src/funnel/normalization/index.ts`: 660 righe.
- `db/src/requests/create-request.ts`: 651 righe.
- `db/src/auth/password-reset.ts`: 590 righe.
- `db/src/conversations/conversation-read-state.ts`: 546 righe.
- `db/src/conversations/process-conversation-message-side-effects.ts`: 532 righe.
- `db/src/conversations/types.ts`: 524 righe.
- `db/src/requests/get-available-request-for-company-detail.ts`: 503 righe.

### `packages/ui`

- Struttura piccola e leggibile.
- `tokens.ts`: 546 righe.
- Componenti primitivi presenti: `Button`, `Input`, `Card`, `Badge`, `Checkbox`, `Select`, `Textarea`.
- Layout presenti: `Container`, `PageShell`, `HeroSurface`, `MarketingSurface`.

## Finding 1 — Identity boundary incompleto

File principali:

- `db/src/identity/company-actor.ts`
- `db/src/identity/company-guards.ts`
- `db/src/identity/index.ts`

Problema:

`CompanyActor` contiene solo:

```ts
userId
companyId
role
companyStatus
```

Mancano informazioni che servono al layout Area Impresa e alle funzioni company-side:

```ts
membershipId
user.name
user.email
company.name
company.status
```

In più `company-actor.ts` importa da `company-guards.ts`, mentre `company-guards.ts` importa il tipo `CompanyActor`. Anche se il ciclo runtime è limitato perché l’import del tipo è type-only, il boundary è concettualmente invertito.

Direzione corretta:

```txt
identity/company-errors.ts
identity/company-actor.ts
identity/company-marketplace-policy.ts
identity/company-guards.ts
```

Responsabilità consigliate:

```txt
company-errors.ts
  - CompanyAuthorizationError
  - AmbiguousCompanyMembershipError
  - CompanyDeactivatedError
  - CompanyMarketplaceAuthorizationError

company-actor.ts
  - CompanyActor type arricchito
  - listCompanyActorsForUser
  - getCompanyActorForUser
  - resolveCompanyActorFromUser
  - mapCompanyMembershipRecordToActor

company-marketplace-policy.ts
  - CompanyMarketplaceState
  - isCompanyMarketplaceApproved
  - assertCompanyCanUseMarketplace
  - assertCompanyCanBuyCredits

company-guards.ts
  - requireCompanyMemberFromUser
  - requireCompanyOwnerFromUser
```

Obiettivo:

`CompanyActor` deve diventare il contratto ufficiale dell’Area Impresa. Il layout non deve dover richiamare `requireUser()` se ha già risolto l’actor.

## Finding 2 — `company-guards.ts` fa troppo

Oggi contiene insieme:

- errori;
- policy marketplace/crediti;
- query membership;
- mapping actor;
- guard owner/member.

Questo crea attrito ogni volta che si prova a ottimizzare auth/session/actor.

Priorità: alta, perché è il primo blocco da sistemare prima della cache request-scoped.

## Finding 3 — `packages/db/src/auth/server.ts` è un adapter basso livello, non il boundary completo

Il file espone:

```ts
getCurrentUserFromHeaders(headers)
requireUserFromHeaders(headers)
```

ed esegue:

```ts
auth.api.getSession({ headers })
```

con log performance:

```txt
[esigenta-perf] [auth] getSession ...ms
```

Questo va bene come adapter low-level di `@esigenta/db/auth`, ma la cache request-scoped vera va fatta nell’adapter Next dentro `apps/web/src/auth/server.ts` o equivalente. Nel package `db` non c’è abbastanza contesto Next per gestire il request lifecycle in modo elegante.

Conclusione:

- Non partire da una cache casuale dentro `packages/db`.
- Prima arricchire `CompanyActor`.
- Poi usare una cache ufficiale lato `apps/web` per `requireUser()` / `requireCompanyActor()`.

## Finding 4 — `/richieste` è ancora troppo live-runtime

File:

```txt
db/src/requests/list-available-requests-for-company.ts
```

Problema:

La funzione fa molto lavoro ogni volta che l’impresa apre la lista:

- carica company, categorie e servizi;
- carica tutte le categorie;
- carica tutte le relazioni `CategoryService`;
- cerca request visibili tramite `requiredServices`;
- filtra keyword in Node anche dentro `structuredData` JSON;
- calcola distanza in Node;
- ordina in Node;
- non ho visto una paginazione/take forte nella query principale.

Questo è il collo di bottiglia più importante lato package.

Il fatto positivo:

Il modello `RequestDispatch` esiste già in Prisma e viene già generato in fase di pubblicazione tramite `review-request.ts` → `createRequestDispatchesForRequestWithClient()`.

Direzione corretta:

Creare un read model company-side:

```txt
db/src/requests/company-dashboard/
  list-company-request-dispatches.ts
  get-company-request-dispatch-detail.ts
  filters.ts
  mappers.ts
  types.ts
```

La lista Area Impresa dovrebbe leggere principalmente:

```txt
RequestDispatch where companyId = actor.companyId and status = CREATED
include request
include saved/unlocked state
orderBy createdAt / distanceKm
```

Non deve ricalcolare il matching ogni volta.

## Finding 5 — Dettaglio richiesta ricalcola visibility

File:

```txt
db/src/requests/get-available-request-for-company-detail.ts
```

Problema:

Il dettaglio fa:

```txt
visibility-check
request-query
visibility-distance
```

quindi ricalcola categoria/distanza/compatibilità anche se la richiesta è già stata dispatchata o sbloccata.

Direzione corretta:

Il dettaglio deve verificare accesso così:

```txt
Accesso se:
  RequestDispatch(companyId, requestId, status=CREATED) esiste
  oppure RequestUnlock(companyId, requestId) esiste
```

Poi carica il dettaglio con relazioni minime:

```txt
request
saved state
unlock state
conversation id
refund state
photos eventualmente lazy o separate
```

Nuovo naming consigliato:

```txt
getCompanyRequestDetail()
```

Deprecare gradualmente:

```txt
getAvailableRequestForCompanyDetail()
```

## Finding 6 — Conversations actor reuse incompleto

Già buono:

- `list-company-conversations.ts` accetta `authorizedActor`.
- `get-conversation-thread.ts` accetta `authorizedActor`.
- `create-company-customer-conversation.ts` accetta `authorizedActor`.

Ancora da bonificare:

- `conversation-read-state.ts`
- `send-conversation-message.ts`
- `create-support-conversation.ts`
- `create-customer-conversation-token.ts`

Questi ricalcolano ancora `getCompanyActorForUser()` in alcuni punti.

Direzione corretta:

Tutte le funzioni company-side devono accettare:

```ts
authorizedActor?: CompanyActor
```

oppure, meglio per nuove API:

```ts
actor: CompanyActor
```

Così la page/action risolve l’actor una volta e il dominio non rifà query membership.

## Finding 7 — Ciclo concettuale requests ↔ conversations

Rilevato:

- `requests/unlock-request-for-company.ts` importa `../conversations`.
- alcune funzioni `conversations/*` importano helpers da `requests`.

Non è ancora un disastro, ma indica un orchestratore mancante.

Direzione consigliata:

Spostare i workflow cross-domain in una cartella esplicita:

```txt
db/src/company-area/
  unlock-request-workflow.ts
  open-support-conversation-workflow.ts
```

oppure:

```txt
db/src/requests/workflows/
  unlock-request-for-company.ts
```

Regola:

- `requests` gestisce request/unlock/dispatch.
- `conversations` gestisce conversazioni.
- il workflow coordina i due.

## Finding 8 — Helper duplicati

Duplicazioni rilevate:

- `normalizeRequiredText`: 16 file.
- `normalizeRequiredId`: 4 file.
- `normalizeText`: 4 file.
- `hasValidNumber`: 3 file.
- `normalizeEmail`: 3 file.
- `isValidEmail`: 2 file.
- `normalizeLimit`: 2 file.

Direzione corretta:

Creare:

```txt
db/src/shared/normalizers.ts
```

Con funzioni piccole:

```ts
normalizeRequiredText
normalizeOptionalText
normalizeRequiredId
normalizeEmail
hasValidNumber
isPositiveInteger
```

Attenzione: non farlo come primo sprint se rompe troppe cose. Va fatto dopo identity/read-model, oppure come sprint separato solo meccanico.

## Finding 9 — Root `db/src` troppo carico

Oggi in root ci sono:

```txt
admin-companies.ts
admin-dashboard.ts
company-contact-change-requests.ts
company-profile.ts
company-service-configuration.ts
public-business-area.ts
search-taxonomy.ts
```

Direzione consigliata:

```txt
db/src/admin/
  companies.ts
  dashboard.ts

db/src/companies/
  profile.ts
  service-configuration.ts
  contact-change-requests.ts

db/src/public/
  business-area.ts

db/src/search/
  taxonomy-search.ts
```

Non è priorità performance, ma migliora ordine e manutenzione.

## Finding 10 — `credit-ledger.ts` è troppo grande, ma non è la priorità adesso

File:

```txt
db/src/credits/credit-ledger.ts
```

Con 1.116 righe è il file più grande.

Non va toccato prima di chiudere Area Impresa performance, perché oggi il problema caldo è identity + richieste + conversazioni.

Sprint futuro:

```txt
db/src/credits/ledger/
  account.ts
  transactions.ts
  grant.ts
  debit.ts
  refund.ts
  locks.ts
  types.ts
```

## Finding 11 — UI package quasi sano, ma non perfetto

Buono:

- `Button`, `Input`, `Card`, `Badge` usano `tokens`.
- `Container`, `PageShell`, `HeroSurface`, `MarketingSurface` esistono.

Da bonificare:

- `Checkbox` usa classi hardcoded invece di `tokens.formControls.checkbox`.
- `Textarea` usa classi hardcoded invece di `tokens.formControls.textarea` e stati già presenti.
- `class-variance-authority` risulta dipendenza non usata nello ZIP.
- `tokens.ts` contiene molti token home-specific. Può restare per ora, ma in futuro conviene separare core/component/marketing tokens.

Ordine consigliato:

1. Prima `packages/db` Area Impresa.
2. Poi UI primitive cleanup.

## Finding 12 — Encoding / file generated

Rilevati file con BOM UTF-8:

- 19 file in `db/src`.
- 4 file in `ui/src`.

Rilevati anche `tsconfig.tsbuildinfo` dentro `db` e `ui` nello ZIP.

Da verificare nel repo reale:

- se `tsconfig.tsbuildinfo` è tracciato da Git, va rimosso dal tracking e aggiunto a `.gitignore`.
- evitare `Set-Content` sui sorgenti; usare Node `fs.readFileSync/writeFileSync` con UTF-8.

## Struttura finale consigliata — target pulito

```txt
packages/db/src/
  admin/
    companies.ts
    dashboard.ts

  auth/
    core.ts
    server.ts
    password-reset.ts
    index.ts

  identity/
    company-actor.ts
    company-errors.ts
    company-guards.ts
    company-marketplace-policy.ts
    company-onboarding.ts
    admin-guards.ts
    bootstrap-super-admin.ts
    index.ts

  companies/
    profile.ts
    service-configuration.ts
    contact-change-requests.ts

  requests/
    company-dashboard/
      filters.ts
      list-company-request-dispatches.ts
      get-company-request-detail.ts
      mappers.ts
      types.ts
    dispatch/
      create-request-dispatches-for-request.ts
      resolve-request-dispatch-candidates.ts
      types.ts
    workflows/
      unlock-request-for-company.ts
    moderation/
      review-request.ts
      list-admin-requests.ts
      list-pending-requests.ts
    customer/
      customer-soft-access.ts
      verification-token.ts
      customer-access-token.ts
    uploads/
      request-photos.ts
      store-uploaded-request-photo.ts
    notifications/
      company-notifications.ts
      notification-deliveries.ts
    types/

  conversations/
    company/
      list-company-conversations.ts
      get-company-conversation-thread.ts
      mark-company-conversation-read.ts
      send-company-conversation-message.ts
    support/
      create-support-conversation.ts
      resolve-support-conversation.ts
      list-admin-support-conversations.ts
    customer/
      create-customer-conversation-token.ts
      resolve-customer-conversation-access.ts
    shared/
      mappers.ts
      types.ts

  credits/
    ledger/
      account.ts
      locks.ts
      transactions.ts
      grant.ts
      debit.ts
      refund.ts
      types.ts
    orders.ts
    packages.ts
    checkout-session.ts
    checkout-fulfillment.ts
    refund-requests.ts
    index.ts

  funnel/
  taxonomy/
  email/
  prisma/
  shared/
    normalizers.ts
    dates.ts
    result.ts
```

Questa è una direzione. Non va fatta tutta in un’unica patch.

## Piano operativo consigliato

### Sprint 7A — CompanyActor Boundary Rewrite

Priorità massima.

File:

```txt
db/src/identity/company-actor.ts
db/src/identity/company-guards.ts
db/src/identity/company-errors.ts          nuovo
db/src/identity/company-marketplace-policy.ts nuovo
db/src/identity/index.ts
```

Obiettivo:

- `CompanyActor` arricchito con `membershipId`, `user`, `company`.
- `company-actor.ts` non dipende più da `company-guards.ts`.
- `company-guards.ts` diventa solo guard layer.
- Nessuna modifica funzionale rischiosa.

Serve poi aggiornare anche `apps/web/src/auth/server.ts` e `apps/web/src/app/(area-impresa)/area-impresa/layout.tsx`, ma questi file non sono nello ZIP.

### Sprint 7B — Area Impresa adapter/cache lato `apps/web`

Richiede file `apps/web`.

Obiettivo:

- `layout.tsx` usa actor arricchito.
- niente `requireUser()` duplicato dopo `requireAreaImpresaAccess()`.
- request-scoped cache ufficiale nel boundary Next.

### Sprint 7C — Requests Read Model Rewrite

File:

```txt
db/src/requests/list-available-requests-for-company.ts
db/src/requests/company-dashboard/list-company-request-dispatches.ts nuovo
db/src/requests/company-dashboard/filters.ts nuovo
db/src/requests/company-dashboard/mappers.ts nuovo
db/src/requests/index.ts
```

Obiettivo:

- lista richieste basata su `RequestDispatch`.
- matching live rimosso dal percorso caldo.
- aggiungere `take` / paginazione.

### Sprint 7D — Request Detail Rewrite

File:

```txt
db/src/requests/get-available-request-for-company-detail.ts
db/src/requests/company-dashboard/get-company-request-detail.ts nuovo
```

Obiettivo:

- accesso tramite `RequestDispatch` / `RequestUnlock`.
- no ricalcolo categoria/distanza live.

### Sprint 7E — Conversations Actor Cleanup

File:

```txt
db/src/conversations/conversation-read-state.ts
db/src/conversations/send-conversation-message.ts
db/src/conversations/create-support-conversation.ts
db/src/conversations/create-customer-conversation-token.ts
```

Obiettivo:

- tutte le funzioni company-side accettano `authorizedActor` o `actor`.
- niente ricalcolo actor se già autorizzato.

### Sprint 7F — Shared helpers cleanup

File nuovo:

```txt
db/src/shared/normalizers.ts
```

Obiettivo:

- rimuovere duplicazioni meccaniche.
- zero cambio funzionale.

### Sprint 7G — UI primitive cleanup

File:

```txt
ui/src/components/checkbox.tsx
ui/src/components/textarea.tsx
ui/src/package.json
```

Obiettivo:

- usare token già esistenti.
- rimuovere dipendenze inutilizzate se confermato nel repo reale.

## Cosa NON fare

Non iniziare da:

```txt
cache() messa a caso
prefetch false ovunque
micro patch su una query singola
rinominare cartelle root prima del performance hot path
split totale di credits prima di Area Impresa
```

La sequenza corretta è:

```txt
CompanyActor boundary
↓
apps/web auth/layout cleanup
↓
RequestDispatch read model
↓
Request detail access model
↓
Conversations actor cleanup
↓
helper/order cleanup
↓
UI primitive cleanup
```

## Verdetto finale

Sì, serve creare cartelle/sottocartelle, ma non come primo gesto estetico. La bonifica deve partire dai boundary che oggi causano lentezza e duplicazioni.

La prima patch reale deve essere:

```txt
Sprint 7A — CompanyActor Boundary Rewrite
```

Non è una riscrittura dell’intero progetto. È una normalizzazione mirata della runtime architecture Area Impresa.
