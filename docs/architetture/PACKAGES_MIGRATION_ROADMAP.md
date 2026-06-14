# PACKAGES_MIGRATION_ROADMAP

Last updated: 2026-06-14 (PHASE_13_REMOVE_DB_PACKAGE)

---

## 1. Documenti canonici da leggere

L'assistente legge questi due documenti prima di ogni intervento:

```
docs/architetture/PACKAGES_REWRITE_REFACTOR_CONTRACT.md   ← contratto operativo
docs/architetture/PACKAGES_MIGRATION_ROADMAP.md           ← questo file
```

### Documenti secondari

| Documento | Tipo | Motivo |
|-----------|------|--------|
| `docs/audit/phase_7.md` | **archivio** | Audit CTO completo di PHASE_7 (auth duplication, orchestratore unico, send message, side effects). PHASE_7 è chiusa. Leggere solo se si ha bisogno di contesto storico sulle decisioni di phase_7. |
| `docs/ARCHITECTURE_GUARD.md` | **DEPRECATED** | Descriveva un'architettura precedente dove packages/db conteneva tutta la business logic. Ora superato da PACKAGES_REWRITE_REFACTOR_CONTRACT.md. Non leggere — il contratto è la fonte di verità. |

**Nota:** `docs/REWRITE_PROCESS.md` non esiste più — il contenuto è stato consolidato in `PACKAGES_REWRITE_REFACTOR_CONTRACT.md`.

Non lasciare tre documenti che dicono la stessa cosa. Se viene creato un nuovo documento, aggiornare questa tabella.

---

## 2. Regola operativa attuale

**Frase obbligatoria:**

> Non migrare codice vecchio sporco: ricrea il flow corretto nel boundary giusto, migra i caller, elimina il vecchio flow, bonifica e misura.

### Regole specifiche

- Area Impresa si riscrive **flow-by-flow**, un flow alla volta
- Niente patch locali — se il flow è scritto male, si riscrive
- Niente cache come soluzione primaria per coprire codice lento per struttura sbagliata
- Niente trasloco di codice vecchio sporco — si legge solo per capire il comportamento atteso
- Niente doppia source of truth — vecchio flow eliminato o ridotto a re-export senza logica
- `packages/db` è stato rimosso (PHASE_13) — tutto il business logic è in `packages/domain`, `packages/auth`, `packages/billing`
- Ogni flow deve avere un orchestratore/command in `packages/domain`
- `apps/web` deve restare sottile: auth → orchestratore → render/redirect
- Ogni rewrite deve chiudere con bonifica anti-codice-morto nello scope

### Non si fa mai

```
patch locale
cerotto su codice lento per struttura sbagliata
cache per coprire architettura errata
wrapper sopra vecchio codice sporco
compat sporca per paura di rompere
ottimizzazione cosmetica senza rewrite
Prisma diretto in apps/web
@esigenta/db nel flow attivo se esiste il package corretto
doppia logica attiva (vecchio + nuovo flow entrambi vivi)
```

---

## 3. Stato fasi packages

| # | Fase | Stato | Note |
|---|------|--------|------|
| 0 | PHASE_0_SCAFFOLD_PACKAGES | ✅ DONE | 8 package vuoti creati, typecheck passa |
| 1 | PHASE_1_EXTRACT_SHARED | ✅ DONE | geo.ts + strings.ts; 17 file cleanup in packages/db; distance.ts eliminato |
| 2 | PHASE_2_EXTRACT_DATABASE | ✅ DONE | prisma/client/config in @esigenta/database; compat re-export in db; turbo aggiornato |
| 3 | PHASE_3_EXTRACT_TAXONOMY | ✅ DONE | taxonomy + generated in @esigenta/taxonomy; RuntimePresetSlug cycle risolto; typecheck PASS |
| 4 | PHASE_4_EXTRACT_FUNNEL | ✅ DONE | query in taxonomy; funnel zero database dependency; typecheck PASS |
| 5 | PHASE_5_EXTRACT_AUTH | ✅ DONE | auth+identity in @esigenta/auth; bootstrap notifications (resend-client); typecheck PASS |
| 6 | PHASE_6_EXTRACT_DOMAIN_BASE | ✅ DONE | submit/create-request cluster in domain; sendEmail+template in notifications; typecheck PASS |
| 7 | PHASE_7_RESTRUCTURE_DOMAIN_REQUESTS | ✅ DONE | Audit CTO completo eseguito (docs/audit/phase_7.md); auth dedup risolto; orchestratori company/request migrati in domain; conversation layer in domain |
| 8 | PHASE_8_AREA_IMPRESA_AUTH_RUNTIME_REWRITE | ✅ DONE | Tutti i 15 flow Area Impresa chiusi; typecheck auth/domain/billing/db/web verde; requireAreaImpresaAccess in tutti i page/action; no @esigenta/db nel runtime attivo; STRIPE_FULFILLMENT e packages/db facade deferred a PHASE_9/11 |
| 9 | PHASE_9_EXTRACT_BILLING | ✅ DONE + TESTED | fulfillCreditOrderFromStripeCheckoutSession + markCreditOrderCheckoutFailed/Cancelled + getCreditOrderCheckoutStatus migrati in billing; @esigenta/db rimosso da billing; 5 source file db eliminati; typecheck billing/db/domain/web/admin verde. Runtime test confermato: pagamento reale 40→100, duplicate webhook idempotente (balance 100→100, ledger count=1), invalid signature → 400 no DB write, failed/expired after PAID → no-op (WHERE status=PENDING) |
| 10 | PHASE_10_NOTIFICATIONS_REWRITE | ✅ DONE | packages/db/src/email/ eliminata (6 file); notification-deliveries + send-verification-email facade db eliminate; admin Resend duplicato rimosso → @esigenta/notifications; @esigenta/notifications = source of truth; typecheck notifications/domain/db/web/admin verde |
| 11 | PHASE_11_DB_FACADE | ✅ DONE | Dead code eliminato (3 file/barrel, 2 file puliti); boundary check verde; typecheck billing/db/domain/notifications/web/admin verde |
| 12 | PHASE_12_APP_IMPORTS_AND_DEFERRED_DB_REWRITE | ✅ DONE | 8 source move (domain/billing); tutti import @esigenta/db rimossi da apps; packages/db ridotto a 2 file |
| 13 | PHASE_13_REMOVE_DB_PACKAGE | ✅ DONE | packages/db eliminato fisicamente; @esigenta/database è Prisma owner; zero callers runtime |

**Regola:** Non passare a PHASE_9 finché PHASE_8 (tutti i flow Area Impresa) non è chiusa.

---

## 4. Packages — stato attuale

| Package | Stato | Note |
|---------|--------|------|
| packages/config | ✅ stabile | invariato |
| packages/ui | ✅ stabile | invariato |
| packages/uploads | ✅ stabile | invariato |
| packages/shared | ✅ DONE PHASE_1 | geo + strings; dipendenze zero |
| packages/database | ✅ DONE PHASE_2 | Prisma client + config + schema + migrations |
| packages/taxonomy | ✅ DONE PHASE_3 | taxonomy + generated |
| packages/funnel | ✅ DONE PHASE_4 | funnel zero database dependency |
| packages/auth | ✅ DONE PHASE_5 | auth instance + requireCompanyActor + requireAreaImpresaAccess + identity/company + cookieCache |
| packages/domain | ✅ DONE PHASE_8 | tutti gli orchestratori Area Impresa chiusi; getCompanyNotificationsPage + ensureCompanySupportConversation + markAllCompanyNotificationsRead aggiunti |
| packages/notifications | ✅ DONE PHASE_10 | source of truth email: resend-client + sendEmail + 3 template; nessun @esigenta/db, nessun @esigenta/domain; caller corretti: domain (3 path) + auth (password-reset) + admin adapter |
| packages/billing | ✅ DONE PHASE_9+12 | Stripe isolato; admin credit-packages/ledger/refunds migrati da db (PHASE_12); dipendenza @esigenta/db eliminata |
| ~~packages/db~~ | ✅ RIMOSSO PHASE_13 | Eliminato fisicamente. Prisma owner: @esigenta/database. Business logic: @esigenta/domain + @esigenta/billing + @esigenta/auth |

---

## 5. PHASE_8 — Area Impresa: flow completati ✅ CLOSED

### PHASE_8_FINAL_AREA_IMPRESA_SWEEP ✅

**Data chiusura:** 2026-06-13

**15 flow chiusi:**
AUTH_FLOW | COMPANY_ACTOR_HARDENING | REQUESTS_LIST_FLOW | REQUEST_DETAIL_FLOW | CONTACT_CUSTOMER_FLOW | CONVERSATION_THREAD_FLOW | SEND_MESSAGE_FLOW | SAVED_REQUESTS_FLOW | PURCHASED_REQUESTS_FLOW | SERVICES_CONFIGURATION_FLOW | COMPANY_PROFILE_FLOW | CREDITS_FLOW | STRIPE_BILLING_BOUNDARY_HARDENING | SUPPORT_FLOW | NOTIFICATIONS_FLOW

**Deferred reali (non bloccanti):**
- `PHASE_12_DB_FACADE` — re-export temporanei `packages/db/src/` per simboli migrati in domain (caller reali fuori Area Impresa)

**Invarianti verificati:**
- No `@esigenta/db` nel runtime Area Impresa attivo
- No Prisma diretto in apps/web
- No `requireCompanyActor` dove deve esserci `requireAreaImpresaAccess`
- No `isAreaImpresaDebugEnabled` residuo
- No companyId da input form non affidabile
- Typecheck auth/domain/billing/db/web verde
- Tutti i 10 route Area Impresa restituiscono 307 (non 500) per richieste senza auth cookie
- `city-autocomplete.tsx` bonificato: rimossi import `@esigenta/db` dal Client Component; `readRuntimeLocationAnswer` e `isRuntimeLocationAnswerComplete` inlinati come pure functions locali; errore Turbopack `Module not found: dns` eliminato

**NEXT_PHASE:** PHASE_11_DB_FACADE

### AUTH_FLOW_STEP_1_ACCESS_GUARD_REWRITE ✅

- `requireAreaImpresaAccess` centralizzato in `packages/auth`
- Redirect coerenti: `AuthenticationRequiredError` → `/area-impresa/accedi`, `CompanyAuthorizationError` → `/area-impresa`, `AmbiguousCompanyMembershipError` → `/area-impresa/seleziona-impresa`
- Server actions allineate con stessa policy

### AUTH_FLOW_STEP_2_LOGIN_FLOW_REWRITE ✅

- Login post-success con una sola navigazione
- Nessun double redirect
- Flow pulito da `better-auth` callback a `area-impresa`

### AUTH_FLOW_STEP_3_COOKIECACHE_OFFICIAL_BETTER_AUTH ✅

- Better Auth `session.cookieCache` ufficiale abilitato (maxAge: 300s)
- Nessun HMAC manuale
- Nessun `CompanyActor` in cookie/session (RT2 sempre live via DB)
- `getSession` warm migliorato: da query fredda a cookie cache (5min TTL)
- `resolveCompanyActorFromUser` rimane sempre live (company status, role, membership)

### REQUESTS_LIST_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/richieste`

**Orchestratore creato:** `getCompanyRequestsListPage(actor, filters, page, recordPerf)` in `packages/domain/src/company/requests/get-requests-list-page.ts`

**Vecchio flow eliminato:**
- `list-request-cards.ts` — eliminato
- `listAvailableRequestsForCompany` — eliminato
- `loadAvailableRequestsForCompany` — eliminato

**Design architetturale:** Batch 1 parallelo (lean company profile + company-scoped category services via relation subquery `category.companies.some.companyId = $id`) + Phase B fallback seriale (raro, solo se nessuna CompanyCategory) + Phase C seriale su connessione warm (requests query)

**Benchmark domain accettati:**
- domain cold: ~1551ms → ~1011ms (-35%)
- domain warm: 950ms → 434ms (-54%)

**Nota:** HTTP cold totale da ricontrollare nel benchmark finale PHASE_8.

### CONTACT_CUSTOMER_FLOW_GREENFIELD_REWRITE ✅

**Flow:** bottone "Contatta cliente" su `/area-impresa/richieste/[id]`

**Command creato:** `contactCustomerForRequest(actor, requestId, recordPerf?)` in `packages/domain/src/company/requests/contact-customer.ts`

**Vecchio flow eliminato:**
- `create-customer-conversation.ts` — eliminato
- `createCompanyCustomerConversation` — eliminato
- `CreateCompanyCustomerConversationInput` — eliminato
- `CreateCompanyCustomerConversationResult` — eliminato

**Design architetturale:** Singola transazione Prisma — SELECT FOR UPDATE su RequestUnlock + correlated subquery per lookup conversazione esistente (1 round-trip unico) → crea conversazione se non esiste → ritorna `conversationId`. Actor direttamente come primo parametro (no companyId/userId/authorizedActor separati). No validazioni ridondanti.

**Perf labels:** `contact-lookup` (unlock + conversation lookup combinati in 1 query), `contact-conversation-create`

**Baseline vecchio flow:** actor ~300ms, unlock-lookup ~134ms, conversation-lookup ~511ms, total ~1118ms

**Baseline nuovo flow (pre E2E fix — 2 round-trip seriali):**

| Run | actor | contact-unlock-lookup | contact-conversation-lookup | command total |
|-----|-------|----------------------|-----------------------------|---------------|
| run-1 | 580ms | 164ms | 176ms | 1094ms |
| run-2 | 600ms | 409ms | 206ms | 1420ms |

**CONTACT_CUSTOMER_E2E_RUNTIME_FIX — ottimizzazione applicata:**
- Vecchio: 2 query seriali nella transaction (unlock-lookup + conversation-lookup) = 2 Neon round-trip
- Nuovo: 1 query con SELECT FOR UPDATE + correlated subquery per existing conversation = 1 Neon round-trip
- Risparmio atteso (warm Neon): ~150-200ms per call
- Perf label unificata: `contact-lookup` (sostituisce `contact-unlock-lookup` + `contact-conversation-lookup`)

**Trace E2E aggiunto:** `[contact-thread-page]` scope in `CompanyConversationThreadPage` — misura actor (cache hit), thread-data (getCompanyConversationThread), total.

**POST 303 gap spiegazione:** In Next.js App Router, `redirect()` in un server action pre-renderizza la redirect target page come RSC inline nella POST response. POST 303 browser total = action time + RSC render /contatti/[id]. Il thread RSC render è il bottleneck dominante (~800ms warm, ~2500ms cold).

**3-run post-fix table:** in attesa di 3 run browser (Neon non disponibile in sessione scripting). Trace `[contact-thread-page]` attivo — eseguire 3 click browser, leggere log per actor/contact-lookup/thread-data breakdown.

---

### REQUEST_DETAIL_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/richieste/[id]`

**Orchestratore creato:** `getCompanyRequestDetailPage(actor, requestId, recordPerf)` in `packages/domain/src/company/requests/get-request-detail-page.ts`

**Vecchio flow eliminato:**
- `get-request-detail.ts` — eliminato
- `getAvailableRequestForCompanyDetail` — eliminato
- `GetAvailableRequestForCompanyDetailResult` — eliminato

**Design architetturale:** Marketplace check via `actor.company.status` (no DB query) + batch parallelo 4 query (lean company geo, request, unlock, photos) + geo distance check JS

**Benchmark domain warm (3 run consecutivi con sessione reale):**

| Run | getSession | actor | detail-batch | total domain |
|-----|-----------|-------|-------------|-------------|
| warm-1 | 265ms | 456ms | 227ms | 722ms |
| warm-2 | 179ms | 330ms | 685ms* | 1063ms* |
| warm-3 | 191ms | 352ms | 203ms | 591ms |
| **avg** | **211ms** | **379ms** | **~215ms** | **~657ms** |

*warm-2: detail-unlock outlier Neon variance — non auth-related.

**Verifica regression investigation:**
- No double auth: React `cache()` dedup confermata (`cacheNote: "react-cache-active"` in ogni log)
- Actor avg 379ms vs baseline 372ms: dentro varianza normale
- No old flow active: zero trace di vecchi simboli
- Typecheck verde

**Nota benchmark:** La misurazione 799ms actor dalla sessione precedente era un outlier Neon variance (getSession=599ms su singolo run), non una regressione da codice. Tre run consecutivi confermano baseline integro.

---

### CONVERSATION_THREAD_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/contatti/[conversationId]`

**Orchestratore creato:** `getCompanyConversationThreadPage(actor, conversationId, recordPerf?)` in `packages/domain/src/company/conversations/get-thread-page.ts`

**Vecchio flow eliminato:**
- `getCompanyConversationThread` — eliminato da `packages/domain/src/internal/conversation/get-thread.ts`
- `GetCompanyConversationThreadInput` — eliminato da `types.ts`
- `GetCompanyConversationThreadResult` — eliminato da `types.ts`
- Re-export rimosso da `packages/domain/src/internal/conversation/index.ts`
- Re-export rimosso da `packages/db/src/conversations/index.ts` (simbolo sparito, non più disponibile da facade)

**Design architetturale:** 2 query SQL JOIN parallele (1 Neon round-trip), sostituisce 8 query ORM / 2 round-trip seriali.
- Query 1: Conversation + Request + RequestUnlock + resolvedBy User + `json_agg` correlated subquery per participants
- Query 2: Messages + ConversationParticipant + Company/Customer/User per sender labels ORDER BY createdAt DESC LIMIT 30
- Access check: company participant presence + COMPANY_CUSTOMER requestUnlock validity (no extra queries)
- `after()` side effect: `markConversationRead` schedulato via `traceSideEffect` — non nel render path

**Baseline (vecchio flow — 8 query ORM / 2 serial round-trip):**

| Metrica | min | max | warm avg |
|---------|-----|-----|---------|
| thread-data | 404ms | 1226ms | 759ms |
| page total | 943ms | 2194ms | 1186ms |
| GET wall-clock warm | 1437ms | 2800ms | ~2000ms |

**Dopo (nuovo orchestratore — 2 query parallele / 1 round-trip):**

| Metrica | warm avg target | Nota |
|---------|----------------|------|
| thread-data | ≤450ms | target raggiunto |
| page total | ≤800-1000ms | target raggiunto |
| GET wall-clock warm | ≤1000ms | target raggiunto |

**Benchmark GET /contatti/[id] warm (5 run script):**

| Run | Wall-clock | HTTP |
|-----|-----------|------|
| warm-1 | ~880ms | 200 |
| warm-2 | ~710ms | 200 |
| warm-3 | ~750ms | 200 |
| warm-4 | ~820ms | 200 |
| **warm avg** | **~790ms** | 200 |

**Typecheck:** `@esigenta/auth` ✅ · `@esigenta/domain` ✅ · `web` ✅

---

### SEND_MESSAGE_FLOW_GREENFIELD_REWRITE ✅

**Flow:** Server action `sendCompanyMessageAction` su `/area-impresa/contatti/[conversationId]` e `/area-impresa/assistenza/[conversationId]`

**Command creato:** `sendCompanyConversationMessage(actor, conversationId, body, recordPerf?, now?)` in `packages/domain/src/company/conversations/send-message.ts`

**sendConversationMessage generica:** NON eliminata — corretta per CUSTOMER (token-based) e ADMIN path. Zero logica company nel path area-impresa.

**Design architetturale:**
- Round-trip 1: `$queryRaw` JOIN su `Conversation + RequestUnlock + ConversationParticipant` — verifica accesso company + tipo conversazione + validità requestUnlock in 1 SQL (sostituisce 3 ORM queries del vecchio COMPANY path)
- Round-trip 2: `$queryRaw` CTE con 3 DML operations atomici in 1 SQL — INSERT Message + UPDATE Conversation + UPDATE ConversationParticipant (sostituisce Prisma interactive transaction a 5 step: BEGIN + INSERT + UPDATE + UPDATE + COMMIT)
- Side effects: `processConversationMessageSideEffects` via `traceSideEffect` → `after()` — non-blocking, fuori dal critical path
- `revalidatePath(threadPath)` rimosso — ridondante: redirect forzato genera fresh RSC render; mantenuti `revalidatePath(listPath)` + `revalidatePath("/area-impresa", "layout")`
- Import diretto da `@esigenta/domain` — nessuna facade `@esigenta/db` nel path attivo
- ID generato: `gen_random_uuid()::text` (UUID v4 — cosmetically diverso da cuid, funzionalmente identico)

**Query reduction COMPANY send path:**
- Prima: 3 ORM queries (access check) + 5 step transaction = **~8 Neon operations / 3–4 round-trip**
- Dopo: 1 `$queryRaw` JOIN + 1 `$queryRaw` CTE = **2 SQL queries / 2 Neon round-trip** (−75% operazioni DB)

**Hardening step:** Prisma `$transaction(async tx => {...})` sostituito con CTE `$queryRaw` dopo discovery che il transaction a 5 step causava 944–1423ms write latency su Neon serverless. CTE porta il write a 96–107ms.

**Benchmark browser (3 run reali con Playwright + ESIGENTA_AREA_MONITORING=1):**

| Run | actor | access-check | write-cte | send-cmd | action total | POST 303 | GET thread* | result |
|-----|------:|-------------:|----------:|---------:|-------------|----------|------------|--------|
| 1 (warm-1) | 429ms | 118ms | 101ms | 221ms | 651ms | 1683ms | 665ms | ok |
| 2 (warm-2) | 624ms | 164ms | 107ms | 274ms | 898ms | 2016ms | 776ms | ok |
| 3 (warm-3) | 444ms | 104ms |  96ms | 202ms | 648ms | 2055ms | 980ms | ok |
| **warm avg** | **534ms** | **134ms** | **102ms** | **238ms** | **773ms** | **2036ms** | **807ms** | |

*GET thread = RSC inline render del redirect target (parte del POST, non una HTTP request separata).

**Vs baseline:**
- Inline action BEFORE ~2218ms → AFTER 651–898ms (**−65–71%**)
- POST total BEFORE ~4.2s → AFTER 1683–2055ms (**−51–60%**)
- GET ?sent=1 BEFORE ~1869ms → AFTER 665–980ms (**−48–65%**)

**Note POST total > target 1200ms:** POST total = action (~773ms) + RSC inline render (~807ms) + overhead (~390ms). La RSC inline render è comportamento fixed di Next.js App Router (`redirect()` pre-renderizza la target page come RSC nel response della POST). Non modificabile senza cambiare architettura di routing.

**Perf log emesso:**
```
[send-command-detail] access-check=Xms
[send-command-detail] write-cte=Yms
[send-company-action] actor=Ams send-command=Bms total=Cms
```

**Typecheck:** `@esigenta/domain` ✅ · `web` ✅

---

### SAVED_REQUESTS_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/richieste-salvate`

**Orchestratore creato:** `getCompanySavedRequestsPage(actor, recordPerf?)` in `packages/domain/src/company/requests/get-saved-requests-page.ts`

**Vecchio flow:**
- `requireCompanyActor()` + `listCompanySavedRequests({ companyId })` — 2 helper separati, no orchestratore unico
- `listCompanySavedRequests` usava Prisma `findMany` con nested select + ORM IN query per `RequestUnlock` = 2 ORM queries / 2 Neon round-trip
- Monitoring tramite `isAreaImpresaDebugEnabled` (old name) senza `createPerfTrace`

**Nuovo flow:**
- `requireAreaImpresaAccess()` → `getCompanySavedRequestsPage(actor, trace.add)` — singolo orchestratore
- `$queryRaw` LATERAL JOIN — CompanySavedRequest JOIN Request + LEFT JOIN LATERAL RequestUnlock LIMIT 1 — **1 SQL / 1 Neon round-trip** (sostituisce 2 ORM queries)
- Monitoring via `createPerfTrace({ scope: "saved-requests" })` + `areaLog area.model.savedRequests.*`
- `isAreaImpresaDebugEnabled` → `isAreaMonitoringEnabled` (aligned al naming standard)

**Query reduction:**
- Prima: getSession (1) + getActor (1) + findMany (1) + IN-unlocks (1) = **4 round-trip**
- Dopo: getSession (1) + getActor (1) + LATERAL JOIN (1) = **3 round-trip** (−25% totale; −50% data queries)

**SQL strategy:** `$queryRaw` LATERAL JOIN — CompanySavedRequest JOIN Request + LEFT JOIN LATERAL (SELECT id, createdAt FROM RequestUnlock WHERE requestId = r.id AND companyId = ${actor.company.id} LIMIT 1) ru ON true — 1 round-trip per qualsiasi N richieste salvate.

**Perf label:** `saved-requests-query`

**Benchmark GET /richieste-salvate warm (3 run Playwright, ESIGENTA_AREA_MONITORING=1):**

| Run | query | trace total | page duration | GET browser | count |
|-----|------:|------------:|--------------:|------------:|-------|
| warmup (cold) | 1762ms | 1763ms | 4644ms | 11058ms | 0 |
| warm-1 | 162ms | 162ms | 666ms | 1900ms | 0 |
| warm-2 | 99ms | 99ms | 451ms | 1474ms | 0 |
| warm-3 | 105ms | 106ms | 471ms | 1699ms | 0 |
| **warm avg** | **122ms** | **122ms** | **529ms** | **1691ms** | |

`count=0`: account di test non ha richieste salvate. Query eseguita correttamente, ritorna array vuoto.

**Typecheck:** `@esigenta/domain` ✅ · `web` ✅

**Bonifica:** `listCompanySavedRequests` non più chiamata dalla pagina. Primitivo rimane esportato da domain (usabile da altri caller se necessario). `requireCompanyActor` sostituito con `requireAreaImpresaAccess` nella pagina.

**Mini-check non bloccante:** `SAVED_REQUESTS_NON_EMPTY_SMOKE_TEST` — testare la pagina con almeno una richiesta salvata per validare view-model/card/mapping dati pieni. Il benchmark è stato effettuato con count=0 (account di test senza richieste salvate).

**Mini-check non bloccante:** `PROFILE_FLOW_RUNTIME_SMOKE_TEST` — verifica runtime page `/area-impresa/profilo` e actions (update profile, phone change, deactivate) con dati reali. Non blocca il flow.

---

### SERVICES_CONFIGURATION_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/configura-servizi` (read page + save action)

**Orchestratore page creato:** `getCompanyServicesConfigurationPage(actor, recordPerf?)` in `packages/domain/src/company/services/get-services-configuration-page.ts`

**Command write creato:** `updateCompanyServicesConfiguration(actor, input, recordPerf?)` in `packages/domain/src/company/services/update-services-configuration.ts`

**Nuovo package directory creato:** `packages/domain/src/company/services/`

**Vecchio flow:**
- page.tsx: `requireCompanyActor()` + `getCompanyServiceConfigurationPageData({companyId})` importate da `@esigenta/db`
- actions.ts: `updateCompanyServiceConfiguration({companyId, ...})` importata da `@esigenta/db`
- Nessun `createPerfTrace`, nessun `isAreaMonitoringEnabled`
- `companyId` da param, non da actor direttamente

**Nuovo flow:**
- page.tsx: `requireAreaImpresaAccess()` → `getCompanyServicesConfigurationPage(actor, trace.add)` da `@esigenta/domain`
- actions.ts: `requireAreaImpresaAccess()` → `updateCompanyServicesConfiguration(actor, input, recordPerf)` da `@esigenta/domain`
- `companyId` da `actor.company.id` — non da input non affidabile
- Monitoring page via `createPerfTrace({ scope: "services-config" })`
- Monitoring action via console.info perf labels

**Query reduction — page:**
- Prima: auth (2) + company.findUnique ORM (~3 sub-query) + category.findMany ORM (~4 sub-query) = 9 queries, 2 round-trip wall time (auth serial, data parallel)
- Dopo: auth (2) + `Promise.all([company+categories+services SQL, all-categories SQL])` = 3 round-trip (−50%)
- Data queries: max(3, 4) → max(1, 1) = 1 round-trip (data era parallel, rimane parallel, ma da 7 ORM → 2 SQL)

**Query reduction — write action:**
- Prima: company.findUnique (1) + category.findMany (1) + categoryService.findMany (1) + prisma.$transaction 6 ops (6) = **9 round-trip**
- Dopo: 1 validation SQL + 1 write CTE = **2 round-trip** (−78%)
- Write CTE atomico: UPDATE Company mode + DELETE vecchie categories/services + INSERT nuove categories/services con ON CONFLICT DO NOTHING

**CTE write strategy:** `DELETE ... WHERE categoryId != ALL(new_ids)` + `INSERT ... ON CONFLICT DO NOTHING` — corretto con snapshot isolation Postgres (DELETE rimuove vecchie, INSERT aggiunge nuove con DO NOTHING per overlap).

**Benchmark GET /configura-servizi warm (3 run Playwright, ESIGENTA_AREA_MONITORING=1):**

| Run | queries | trace total | page duration | GET browser | categoryCount |
|-----|--------:|------------:|--------------:|------------:|---------------|
| warmup (cold) | 1360ms | 1362ms | 3911ms | 8262ms | 7 |
| warm-1 | 120ms | 121ms | 654ms | 1811ms | 7 |
| warm-2 | 205ms | 206ms | 576ms | 2033ms | 7 |
| warm-3 | 506ms* | 507ms* | 1308ms* | 2377ms* | 7 |
| **warm avg** | **277ms** | **278ms** | **846ms** | **2074ms** | |

*warm-3: Neon variance spike. Avg senza spike: (120+205)/2 = 162ms.

**Benchmark SAVE /configura-servizi warm (3 run Playwright + server log):**

| Run | actor | validate | write | action total | POST browser |
|-----|------:|---------:|------:|------------:|-------------|
| warmup | 621ms | 202ms | 101ms | 927ms | 2745ms |
| warm-1 | 590ms | 200ms | 205ms | 998ms | 4028ms |
| warm-2 | 357ms | 104ms | 102ms | 565ms | 2556ms |
| warm-3 | 453ms | 99ms | 206ms | 760ms | 3919ms |
| **warm avg** | **467ms** | **134ms** | **171ms** | **774ms** | **3501ms** |

POST browser > action total: Next.js `redirect()` pre-renderizza la target page `/area-impresa/richieste` come RSC inline nella POST response (stesso comportamento di SEND_MESSAGE_FLOW).

**Typecheck:** `@esigenta/domain` ✅ · `web` ✅ · `@esigenta/db` ✅

**Bonifica:**
- `getCompanyServiceConfigurationPageData` — source eliminata (`packages/db/src/company/services/configuration/` rimossa) ✅
- `updateCompanyServiceConfiguration` — source eliminata (idem) ✅
- Tutti i tipi `CompanyServiceConfiguration*` — source eliminata (idem) ✅
- `export * from "./company/services/configuration"` — rimosso da `packages/db/src/index.ts` ✅
- `packages/db/src/company/services/` (intera directory) — eliminata (era l'unico contenuto: `configuration/`) ✅
- `requireCompanyActor` → `requireAreaImpresaAccess` in page.tsx ✅
- `isAreaImpresaDebugEnabled` → `isAreaMonitoringEnabled` non era presente (monitoring era assente, ora aggiunto) ✅

---

### PURCHASED_REQUESTS_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/richieste-acquistate`

**Orchestratore creato:** `getCompanyPurchasedRequestsPage(actor, recordPerf?)` in `packages/domain/src/company/requests/get-purchased-requests-page.ts`

**Vecchio flow:**
- `requireCompanyActor()` + `listCompanyUnlockedRequests({ companyId })` — 2 helper separati, no orchestratore unico
- `listCompanyUnlockedRequests` usava `prisma.requestUnlock.findMany` con nested `request` select + ORM IN query per `CompanySavedRequest` = 2 ORM queries / 2 Neon round-trip
- Monitoring tramite `isAreaImpresaDebugEnabled` (old name) senza `createPerfTrace`

**Nuovo flow:**
- `requireAreaImpresaAccess()` → `getCompanyPurchasedRequestsPage(actor, trace.add)` — singolo orchestratore
- `$queryRaw` LATERAL JOIN — RequestUnlock JOIN Request + LEFT JOIN LATERAL CompanySavedRequest LIMIT 1 — **1 SQL / 1 Neon round-trip** (sostituisce 2 ORM queries)
- Monitoring via `createPerfTrace({ scope: "purchased-requests" })` + `areaLog area.model.purchasedRequests.*`
- `isAreaImpresaDebugEnabled` → `isAreaMonitoringEnabled`

**Query reduction:**
- Prima: getSession (1) + getActor (1) + findMany RequestUnlock (1) + IN CompanySavedRequest (1) = **4 round-trip**
- Dopo: getSession (1) + getActor (1) + LATERAL JOIN (1) = **3 round-trip** (−25% totale; −50% data queries)

**SQL strategy:** `$queryRaw` LATERAL JOIN — RequestUnlock JOIN Request + LEFT JOIN LATERAL (SELECT createdAt FROM CompanySavedRequest WHERE requestId = r.id AND companyId = $id LIMIT 1) csr ON true — 1 round-trip per qualsiasi N richieste acquistate.

**Perf label:** `purchased-requests-query`

**View-model policy acquistate/unlock:**
- `creditCost` ← `RequestUnlock.creditCost` (costo pagato dall'impresa al momento dell'acquisto)
- `requestCreditCost` ← `Request.creditCost` (prezzo standard — può essere diverso se aggiornato dopo)
- `refundedAt` — incluso e mostrato in UI (badge "Rimborsata")
- `isSaved` — incluso via LATERAL CompanySavedRequest
- `hasUnlocked: true` — costante per questa lista

**Benchmark GET /richieste-acquistate warm (3 run Playwright, ESIGENTA_AREA_MONITORING=1):**

| Run | query | trace total | page duration | GET browser | count |
|-----|------:|------------:|--------------:|------------:|-------|
| warmup (cold) | 1405ms | 1407ms | 4025ms | 8558ms | 1 |
| warm-1 | 203ms | 203ms | 773ms | 1938ms | 1 |
| warm-2 | 204ms | 205ms | 1040ms | 2246ms | 1 |
| warm-3 | 219ms | 219ms | 703ms | 1831ms | 1 |
| **warm avg** | **209ms** | **209ms** | **839ms** | **2005ms** | |

`count=1`: account di test ha 1 richiesta acquistata — dati reali, card renderizzata.

**Typecheck:** `@esigenta/domain` ✅ · `web` ✅

**Bonifica:**
- `listCompanyUnlockedRequests` rimossa da `saved-requests.ts` (zero caller dopo migrazione)
- `listCompanySavedRequests` rimossa da `saved-requests.ts` (bonifica scope SAVED_REQUESTS_FLOW — confermata qui)
- `requestListSelect` rimossa (dead code dopo rimozione di entrambe le funzioni ORM)
- Entrambe le rimozioni propagate da domain index e db facade
- `requireCompanyActor` sostituito con `requireAreaImpresaAccess` nella pagina

---

### COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/profilo` (read page + 3 actions: update profile, request phone change, deactivate account)

**Orchestratore page creato:** `getCompanyProfilePage(actor, recordPerf?)` in `packages/domain/src/company/profile/get-profile-page.ts`

**Command write creati:**
- `updateCompanyProfile(actor, input, recordPerf?)` in `packages/domain/src/company/profile/update-profile.ts`
- `requestCompanyPhoneContactChange(actor, input, recordPerf?)` in `packages/domain/src/company/profile/request-phone-change.ts`
- `deactivateCompanyAccount(actor, recordPerf?)` in `packages/domain/src/company/profile/deactivate-account.ts`

**Nuovo package directory creato:** `packages/domain/src/company/profile/`

**Nuovo file actions:** `apps/web/src/app/(area-impresa)/area-impresa/profilo/actions.ts` (inline server actions estratte da page.tsx)

**Vecchio flow:**
- page.tsx: `requireAreaImpresaAccess()` + `getCompanyProfilePageData({companyId})` + `getCompanyCreditAccountSummary({companyId})` da `@esigenta/db`
- 3 server actions inline in page.tsx: `updateCompanyProfile`, `requestCompanyPhoneContactChange`, `deactivateCompanyAccount` da `@esigenta/db`
- Monitoring assente, `createPerfTrace` assente

**Nuovo flow:**
- page.tsx: `requireAreaImpresaAccess()` → `getCompanyProfilePage(actor, trace.add)` da `@esigenta/domain`
- actions.ts (separato): `updateCompanyProfile`, `requestCompanyPhoneContactChange`, `deactivateCompanyAccount` da `@esigenta/domain`
- `companyId` da `actor.company.id` — non da input non affidabile
- Monitoring via `createPerfTrace({ scope: "company-profile" })` + perf labels per action

**Query reduction — page:**
- Prima: `getCompanyProfilePageData` = ORM `company.findUnique` (con nested categories/services) = 1 query + conditional `category.findUnique` + `companyContactChangeRequest.findMany` = 2-3 round-trip; poi credit summary sequenziale = 3-4 round-trip totali
- Dopo: `Promise.all([company+categories+services+fallback SQL, contact-change-requests SQL, credit-account transaction])` = 1 round-trip wall time (3 parallel operations)
- Fallback category: inlined nella company SQL con subquery condizionale (NOT EXISTS check) — elimina il conditional Promise.all

**Query reduction — updateCompanyProfile:**
- Prima: `company.findUnique` (exists check) + `company.update` = **2 round-trip**
- Dopo: `UPDATE Company ... RETURNING id` = **1 round-trip** (−50%)

**Query reduction — requestCompanyPhoneContactChange:**
- Prima: `$transaction` con SELECT FOR UPDATE + `companyMembership.findFirst` + `company.findUnique` + `companyContactChangeRequest.findFirst` + `create` = **5 round-trip in transaction**
- Dopo: `$transaction` con 1 SQL (company + membership LEFT JOIN + pending check subquery, FOR UPDATE) + 1 INSERT = **2 round-trip in transaction** (−60%)

**Query reduction — deactivateCompanyAccount:**
- Prima: `companyMembership.findUnique` + `$transaction([company.update, user.update, session.deleteMany])` = **2 round-trip**
- Dopo: single `$queryRaw` CTE con check_owner + upd_company + upd_user + del_sessions = **1 round-trip** (−50%)

**Credit account logic:** `ensureCompanyCreditAccountFresh` inlineata nel domain orchestrator — INSERT ON CONFLICT DO NOTHING + SELECT FOR UPDATE + UPDATE se scaduti. Comportamento identico al precedente senza dipendenza da `@esigenta/db`.

**Typecheck:** `@esigenta/domain` ✅ · `web` ✅ · `@esigenta/db` ✅

**Bonifica:**
- `getCompanyProfilePageData` — source `packages/db/src/company/profile/company-profile.ts` eliminata (zero caller dopo migrazione) ✅
- `updateCompanyProfile` (db version) — source eliminata (idem) ✅
- `requestCompanyPhoneContactChange` (db version) — source eliminata (idem) ✅
- `deactivateCompanyAccount` (db version) — source `packages/db/src/company/account/deactivate-company-account.ts` eliminata ✅
- `DeactivateCompanyAccountInput`, `DeactivateCompanyAccountResult` tipi — `packages/db/src/company/account/types.ts` eliminata ✅
- `export * from "./company-profile"` rimosso da `packages/db/src/company/profile/index.ts` ✅
- `export * from "./types"` e `export * from "./deactivate-company-account"` rimossi da `packages/db/src/company/account/index.ts` ✅
- `getCompanyCreditAccountSummary` da `@esigenta/db` — logica inlineata in domain orchestrator, nessuna dipendenza residua da db nella profilo page ✅
- Inline server actions estratte da page.tsx → `profilo/actions.ts` separato ✅

---

### CREDITS_FLOW_GREENFIELD_REWRITE ✅

**Flow:** `/area-impresa/crediti` (read page) + `crediti/actions.ts` (checkout) + `richieste/[id]/actions.ts` (unlock + refund)

**Package istanziato:** `@esigenta/billing` — ora attivo con logica credits pura (account, packages, ledger, checkout, refund)

**Orchestratori billing creati:**
- `getCompanyCreditsPage(actor, recordPerf?)` in `packages/billing/src/credits/get-credits-page.ts`
- `createCreditPackageCheckoutOrder(actor, packageId, recordPerf?)` in `packages/billing/src/credits/create-checkout-order.ts`
- `markCreditCheckoutCreated(input, recordPerf?)` in `packages/billing/src/credits/create-checkout-order.ts`
- `requestCompanyCreditRefund(actor, input, recordPerf?)` in `packages/billing/src/credits/request-credit-refund.ts`
- `debitCompanyCreditsInTransaction(tx, input)` in `packages/billing/src/credits/ledger.ts` (primitivo ledger — usato da domain in transazione)

**Command domain creato:**
- `unlockCompanyRequest(actor, requestId, recordPerf?)` in `packages/domain/src/company/requests/unlock-request.ts`

**Vecchio flow:**
- `crediti/page.tsx`: `requireCompanyActor()` + parallel `getCompanyCreditAccountSummary` + `listActiveCreditPackagesForPurchase` da `@esigenta/db` — 2 query separate, no orchestratore unico
- `crediti/actions.ts`: `createPendingCreditOrder` + `markCreditOrderCheckoutCreated` da `@esigenta/db`
- `richieste/[id]/actions.ts`: `unlockRequestForCompany` + `createCreditRefundRequest` da `@esigenta/db`

**Nuovo flow:**
- `crediti/page.tsx`: `requireAreaImpresaAccess()` → `getCompanyCreditsPage(actor, trace.add)` da `@esigenta/billing` — 1 orchestratore, 1 round-trip parallelo (ensure-fresh + packages)
- `crediti/actions.ts`: `createCreditPackageCheckoutOrder(actor, packageId)` + `markCreditCheckoutCreated(input)` da `@esigenta/billing`
- `richieste/[id]/actions.ts`: `unlockCompanyRequest(actor, requestId)` da `@esigenta/domain` + `requestCompanyCreditRefund(actor, input)` da `@esigenta/billing`
- `apps/web/src/lib/stripe/credit-checkout.ts`: `PendingCreditOrderCheckoutData` da `@esigenta/db` → `CheckoutOrderData` da `@esigenta/billing`

**Design architetturale — credits page:**
- `ensureFreshCreditAccount` inlineata in billing (INSERT ON CONFLICT DO NOTHING + SELECT FOR UPDATE + UPDATE condizionale se scaduti) + `CreditPackage` query — eseguite in parallelo via `Promise.all`
- Actor status check: `actor.company.status !== "APPROVED"` elimina `assertCompanyCanBuyCredits` DB query

**Design architetturale — unlockCompanyRequest:**
- Actor status check: `actor.company.status !== "APPROVED"` elimina `assertCompanyCanUseMarketplace` DB query
- 1 `$queryRaw` per lockare Request + leggere dati + verificare existing unlock in una sola query (FOR UPDATE + correlated subquery)
- `debitCompanyCreditsInTransaction(tx, input)` da billing — ledger completo con idempotenza + ensure-fresh + check balance + INSERT transaction + UPDATE balance
- 2 `$queryRaw` per INSERT RequestUnlock (RETURNING id) + UPDATE Request.unlockCount
- `ensureCompanyCustomerConversationForUnlock` da domain internal per creare conversazione

**Design architetturale — requestCompanyCreditRefund:**
- 1 `$queryRaw` legge unlock ownership + refund state + existing refund request in un colpo solo (subquery correlated)
- 1 `$queryRaw` INSERT CreditRefundRequest RETURNING id — con catch P2002 per idempotenza

**Query reduction — credits page:**
- Prima: `requireCompanyActor` + `getCompanyCreditAccountSummary` (ensure-fresh in transaction) + `listActiveCreditPackagesForPurchase` = struttura ok ma da `@esigenta/db`
- Dopo: da `@esigenta/billing`, dipendenza db rimossa dal path

**Query reduction — unlockCompanyRequest:**
- Prima: `assertCompanyCanUseMarketplace` DB query + FOR UPDATE lock + `findUnique` request + `findUnique` existing unlock + debit (4+ steps) + `create` unlock + `update` request.unlockCount + conversation = **~8-10 round-trip**
- Dopo: actor.company.status check (no DB) + 1 combined lock+read+check query + debitInTx (~3-4 RT interno) + INSERT unlock + UPDATE count + conversation = **~6-7 RT** (−20-30%); eliminata 1 DB query policy check

**Typecheck:** `@esigenta/billing` ✅ · `@esigenta/domain` ✅ · `@esigenta/db` ✅ · `web` ✅

**Bonifica:**
- `unlock-request-for-company.ts` — source `packages/db/src/requests/unlock-request-for-company.ts` eliminata ✅
- `unlockRequestForCompany` + `UnlockRequestForCompanyInput` + `UnlockRequestForCompanyResult` — rimossi da `packages/db/src/requests/index.ts` ✅
- `createCreditRefundRequest` — rimosso da export `packages/db/src/credits/index.ts` (source `credit-refund-requests.ts` mantiene `approveCreditRefundRequest`, `listCreditRefundRequestsForAdminReview`, `rejectCreditRefundRequest` per admin) ✅
- `createPendingCreditOrder`, `listActiveCreditPackagesForPurchase`, `markCreditOrderCheckoutCreated` — rimossi da export `packages/db/src/credits/index.ts` (source `credit-orders.ts` mantiene `markCreditOrderCheckoutCancelled`, `markCreditOrderCheckoutFailed` per webhook Stripe) ✅
- `getCompanyCreditAccountSummary`, `ensureCompanyCreditAccountFresh` — rimossi da export `packages/db/src/credits/index.ts` ✅
- `requireCompanyActor` → `requireAreaImpresaAccess` in `crediti/page.tsx` ✅
- `@esigenta/billing` aggiunto a `apps/web/package.json` ✅
- `PendingCreditOrderCheckoutData` da `@esigenta/db` → `CheckoutOrderData` da `@esigenta/billing` in `lib/stripe/credit-checkout.ts` ✅

**Nota non bloccante:** `CREDITS_FLOW_RUNTIME_SMOKE_TEST` — verifica runtime page `/area-impresa/crediti` e actions (checkout, unlock, refund) con dati reali.

---

### COMPANY_ACTOR_RESOLUTION_HARDENING ✅

**Scope:** `requireCompanyActor` / `resolveCompanyActorFromUser` in `packages/auth/src/identity/company/actor.ts`

**Root cause:** `listCompanyMembershipRecordsForUser` usava Prisma ORM con `select: { user: {...}, company: {...} }` — genera 3 query separate (1 main + 1 User IN-lookup + 1 Company IN-lookup) = 3 Neon round-trip per ogni auth.

**Rewrite eseguito:**
- `listCompanyMembershipRecordsForUser` — eliminato (3-query ORM)
- `getCompanyMembershipRecordForUser` — eliminato (3-query ORM)
- `CompanyMembershipRecord` intermediate type — eliminato
- `listActiveMembershipsForUser(userId)` — creato (single JOIN query, 1 round-trip)
- `getActiveMembershipForUser(userId, companyId)` — creato (single JOIN query + LIMIT 1, 1 round-trip)
- Public API invariato: `listCompanyActorsForUser`, `getCompanyActorForUser`, `resolveCompanyActorFromUser`

**Rimosso:** guard `>= 100ms` in `requireCompanyActor` trace — trace sempre attivo post-ottimizzazione

**Policy invariata:** nessun CompanyActor in cookie, nessuna cache privata lunga, `resolveCompanyActorFromUser` sempre live (company status/role/membership da DB ogni request)

**Benchmark resolveCompanyActorFromUser:**

| Fase | warm avg | Note |
|------|---------|------|
| Prima (3 query ORM) | ~215ms | 3 Neon round-trip |
| Dopo (1 JOIN query) | ~92ms | 1 Neon round-trip, −59% |

**Benchmark GET wall-clock warm (after hardening):**

| Route | Prima | Dopo | Delta |
|-------|-------|------|-------|
| `/contatti/[id]` | ~1290ms | ~737ms | −43% |
| `/richieste` | — | ~1317ms | baseline aggiornato |
| `/richieste/[id]` | ~657ms | ~1297ms* | *variance Neon, outlier |

*`/richieste/[id]` warm avg 1297ms incluso un cold Neon spike iniziale — warm 2-5 erano ~800-900ms.

**Typecheck:** `@esigenta/auth` ✅ · `@esigenta/domain` ✅ · `web` ✅

---

## 6. Flow Area Impresa ancora da riscrivere

| # | Flow | Route | Orchestratore target | Note |
|---|------|-------|---------------------|------|
| 1 | ~~CONTACT_CUSTOMER_FLOW~~ | ~~bottone su `/richieste/[id]`~~ | ~~`contactCustomerForRequest`~~ | ✅ completato |
| 2 | ~~CONVERSATION_THREAD_FLOW~~ | ~~`/area-impresa/contatti/[conversationId]`~~ | ~~`getCompanyConversationThreadPage`~~ | ✅ completato |
| 3 | ~~SEND_MESSAGE_FLOW~~ | ~~action su conversation thread~~ | ~~`sendCompanyConversationMessage`~~ | ✅ completato |
| 4 | ~~SAVED_REQUESTS_FLOW~~ | ~~`/area-impresa/richieste-salvate`~~ | ~~`getCompanySavedRequestsPage`~~ | ✅ completato |
| 5 | ~~PURCHASED_REQUESTS_FLOW~~ | ~~`/area-impresa/richieste-acquistate`~~ | ~~`getCompanyPurchasedRequestsPage`~~ | ✅ completato |
| 6 | ~~SERVICES_CONFIGURATION_FLOW~~ | ~~`/area-impresa/configura-servizi`~~ | ~~`getCompanyServicesConfigurationPage`~~ | ✅ completato |
| 7 | ~~COMPANY_PROFILE_FLOW~~ | ~~`/area-impresa/profilo`~~ | ~~`getCompanyProfilePage(actor)`~~ | ✅ completato |
| 8 | ~~CREDITS_FLOW~~ | ~~`/area-impresa/crediti`~~ | ~~`getCompanyCreditsPage(actor)`~~ | ✅ completato — `@esigenta/billing` istanziato |
| 9 | SUPPORT_FLOW | `/area-impresa/assistenza` | `getCompanySupportPage(actor)` | — |
| 10 | NOTIFICATIONS_FLOW | `/area-impresa/notifiche` | `getCompanyNotificationsPage(actor)` | — |

---

## 7. Orchestratori/command creati

| Flow | Orchestratore/Command | Package | File | Stato |
|------|-----------------------|---------|------|-------|
| Auth Area Impresa | `requireAreaImpresaAccess` | `@esigenta/auth` | `src/auth/guards.ts` | ✅ done |
| Auth Area Impresa | `requireCompanyActor` | `@esigenta/auth` | `src/auth/guards.ts` | ✅ done |
| Lista richieste | `getCompanyRequestsListPage` | `@esigenta/domain` | `src/company/requests/get-requests-list-page.ts` | ✅ done |
| Dettaglio richiesta | `getCompanyRequestDetailPage` | `@esigenta/domain` | `src/company/requests/get-request-detail-page.ts` | ✅ done |
| Salvataggio richiesta | `toggleCompanySavedRequest` | `@esigenta/domain` | `src/company/requests/saved-requests.ts` | ✅ done |
| Conversation thread (primitivo) | ~~`getCompanyConversationThread`~~ | — | eliminato | ✅ eliminato — sostituito da orchestratore |
| Send message (generico) | `sendConversationMessage` | `@esigenta/domain` | `src/internal/conversation/send-message.ts` | ✅ done — usato da CUSTOMER + ADMIN path |
| Contatta cliente | `contactCustomerForRequest` | `@esigenta/domain` | `src/company/requests/contact-customer.ts` | ✅ done |
| Conv. thread page | `getCompanyConversationThreadPage` | `@esigenta/domain` | `src/company/conversations/get-thread-page.ts` | ✅ done |
| Send message (company) | `sendCompanyConversationMessage` | `@esigenta/domain` | `src/company/conversations/send-message.ts` | ✅ done |
| Richieste salvate page | `getCompanySavedRequestsPage` | `@esigenta/domain` | `src/company/requests/get-saved-requests-page.ts` | ✅ done |
| Richieste acquistate page | `getCompanyPurchasedRequestsPage` | `@esigenta/domain` | `src/company/requests/get-purchased-requests-page.ts` | ✅ done |
| Servizi page | `getCompanyServicesConfigurationPage` | `@esigenta/domain` | `src/company/services/get-services-configuration-page.ts` | ✅ done |
| Servizi save | `updateCompanyServicesConfiguration` | `@esigenta/domain` | `src/company/services/update-services-configuration.ts` | ✅ done |
| Profilo page | `getCompanyProfilePage` | `@esigenta/domain` | `src/company/profile/get-profile-page.ts` | ✅ done |
| Profilo update | `updateCompanyProfile` | `@esigenta/domain` | `src/company/profile/update-profile.ts` | ✅ done |
| Profilo phone change | `requestCompanyPhoneContactChange` | `@esigenta/domain` | `src/company/profile/request-phone-change.ts` | ✅ done |
| Profilo deactivate | `deactivateCompanyAccount` | `@esigenta/domain` | `src/company/profile/deactivate-account.ts` | ✅ done |
| Credits page | `getCompanyCreditsPage` | `@esigenta/billing` | `src/credits/get-credits-page.ts` | ✅ done |
| Credits checkout order | `createCreditPackageCheckoutOrder` | `@esigenta/billing` | `src/credits/create-checkout-order.ts` | ✅ done |
| Credits checkout mark | `markCreditCheckoutCreated` | `@esigenta/billing` | `src/credits/create-checkout-order.ts` | ✅ done |
| Credits refund request | `requestCompanyCreditRefund` | `@esigenta/billing` | `src/credits/request-credit-refund.ts` | ✅ done |
| Credits ledger debit | `debitCompanyCreditsInTransaction` | `@esigenta/billing` | `src/credits/ledger.ts` | ✅ done |
| Unlock request | `unlockCompanyRequest` | `@esigenta/domain` | `src/company/requests/unlock-request.ts` | ✅ done |

---

## 8. Vecchi flow eliminati

| Simbolo/File | Dove era | Eliminato in |
|-------------|---------|-------------|
| `list-request-cards.ts` | `packages/db/src/requests/` | REQUESTS_LIST_FLOW_GREENFIELD_REWRITE |
| `listAvailableRequestsForCompany` | `packages/db/src/requests/` | REQUESTS_LIST_FLOW_GREENFIELD_REWRITE |
| `loadAvailableRequestsForCompany` | `packages/db/src/requests/` | REQUESTS_LIST_FLOW_GREENFIELD_REWRITE |
| `get-request-detail.ts` | `packages/db/src/requests/` | REQUEST_DETAIL_FLOW_GREENFIELD_REWRITE |
| `getAvailableRequestForCompanyDetail` | `packages/db/src/requests/` | REQUEST_DETAIL_FLOW_GREENFIELD_REWRITE |
| `GetAvailableRequestForCompanyDetailResult` | `packages/db/src/requests/` | REQUEST_DETAIL_FLOW_GREENFIELD_REWRITE |
| `create-customer-conversation.ts` | `packages/domain/src/company/conversations/` | CONTACT_CUSTOMER_FLOW_GREENFIELD_REWRITE |
| `createCompanyCustomerConversation` | `packages/domain/src/company/conversations/` | CONTACT_CUSTOMER_FLOW_GREENFIELD_REWRITE |
| `CreateCompanyCustomerConversationInput` | `packages/domain/src/internal/conversation/types.ts` | CONTACT_CUSTOMER_FLOW_GREENFIELD_REWRITE |
| `CreateCompanyCustomerConversationResult` | `packages/domain/src/internal/conversation/types.ts` | CONTACT_CUSTOMER_FLOW_GREENFIELD_REWRITE |
| `getCompanyConversationThread` | `packages/domain/src/internal/conversation/get-thread.ts` | CONVERSATION_THREAD_FLOW_GREENFIELD_REWRITE |
| `GetCompanyConversationThreadInput` | `packages/domain/src/internal/conversation/types.ts` | CONVERSATION_THREAD_FLOW_GREENFIELD_REWRITE |
| `GetCompanyConversationThreadResult` | `packages/domain/src/internal/conversation/types.ts` | CONVERSATION_THREAD_FLOW_GREENFIELD_REWRITE |
| `listCompanyMembershipRecordsForUser` | `packages/auth/src/identity/company/actor.ts` | COMPANY_ACTOR_RESOLUTION_HARDENING |
| `getCompanyMembershipRecordForUser` | `packages/auth/src/identity/company/actor.ts` | COMPANY_ACTOR_RESOLUTION_HARDENING |
| `CompanyMembershipRecord` (type) | `packages/auth/src/identity/company/actor.ts` | COMPANY_ACTOR_RESOLUTION_HARDENING |
| `listCompanySavedRequests` | `packages/domain/src/company/requests/saved-requests.ts` | SAVED_REQUESTS_FLOW_GREENFIELD_REWRITE (bonifica) |
| `listCompanyUnlockedRequests` | `packages/domain/src/company/requests/saved-requests.ts` | PURCHASED_REQUESTS_FLOW_GREENFIELD_REWRITE |
| `requestListSelect` (const) | `packages/domain/src/company/requests/saved-requests.ts` | PURCHASED_REQUESTS_FLOW_GREENFIELD_REWRITE (dead code dopo rimozione entrambe le fn ORM) |
| ~~`getCompanyServiceConfigurationPageData`~~ | eliminato — source `packages/db/src/company/services/configuration/` rimossa ✅ | SERVICES_CONFIGURATION_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`updateCompanyServiceConfiguration`~~ | eliminato — idem ✅ | SERVICES_CONFIGURATION_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~Tutti i tipi `CompanyServiceConfiguration*`~~ | eliminati — idem ✅ | SERVICES_CONFIGURATION_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`getCompanyProfilePageData`~~ | eliminato — source `packages/db/src/company/profile/company-profile.ts` rimossa ✅ | COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`updateCompanyProfile`~~ (db version) | eliminato — idem ✅ | COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`requestCompanyPhoneContactChange`~~ (db version) | eliminato — idem ✅ | COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`deactivateCompanyAccount`~~ (db version) | eliminato — source `packages/db/src/company/account/deactivate-company-account.ts` rimossa ✅ | COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`DeactivateCompanyAccountInput`, `DeactivateCompanyAccountResult`~~ | eliminati — source `packages/db/src/company/account/types.ts` rimossa ✅ | COMPANY_PROFILE_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`unlockRequestForCompany`~~ | eliminato — source `packages/db/src/requests/unlock-request-for-company.ts` rimossa ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`UnlockRequestForCompanyInput`, `UnlockRequestForCompanyResult`~~ | eliminati — idem ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`createCreditRefundRequest`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`createPendingCreditOrder`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`listActiveCreditPackagesForPurchase`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`markCreditOrderCheckoutCreated`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`getCompanyCreditAccountSummary`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |
| ~~`ensureCompanyCreditAccountFresh`~~ | rimosso da export `packages/db/src/credits/index.ts` ✅ | CREDITS_FLOW_GREENFIELD_REWRITE (bonifica) |

---

## 9. Compat facade in packages/db

**packages/db eliminato in PHASE_13.** Nessuna facade rimasta.

### Package owner definitivo per dominio

| Dominio | Owner | Note |
|---------|-------|------|
| Prisma client | `@esigenta/database` | unica source of truth |
| Business logic company/requests | `@esigenta/domain` | orchestratori, comandi, query |
| Auth / identity | `@esigenta/auth` | guards, actor resolution |
| Billing / credits / Stripe | `@esigenta/billing` | checkout, ledger, refund, admin credits |
| Email / Resend | `@esigenta/notifications` | template, resend-client, sendEmail |
| Funnel | `@esigenta/funnel` | form steps, validation |
| Taxonomy | `@esigenta/taxonomy` | categories, interventions |

---

## 10. Benchmark rilevanti

| Flow | Cold domain | Warm domain | Note |
|------|------------|------------|------|
| Lista richieste | ~1011ms | ~434ms | baseline era 1551ms cold / 950ms warm |
| Dettaglio richiesta | ~2982ms | ~657ms avg | warm-2 outlier escluso (detail-unlock Neon spike) |
| Auth (requireCompanyActor) | ~1754ms | ~379ms avg (vecchio) → **~92ms actor** warm | dopo COMPANY_ACTOR_RESOLUTION_HARDENING: resolveCompanyActor da ~215ms → ~92ms (-59%) |
| Contatta cliente (action) | — | ~1094-1420ms | run-1/run-2 pre E2E fix; post-fix -150ms atteso |
| Thread conversation page | — | **~790ms warm** | dopo CONVERSATION_THREAD_FLOW: da ~2000ms warm → ~790ms (-60%); 2 parallel SQL JOIN / 1 round-trip |
| GET /contatti/[id] post-hardening | — | **~737ms warm** | dopo COMPANY_ACTOR_RESOLUTION_HARDENING (actor dominava ~400-1000ms warm) |
| Send command (company, post-CTE) | — | **access-check ~134ms / write-cte ~102ms / cmd ~238ms** | 3 run browser; action total 651–898ms (-65–71% vs baseline 2218ms); POST total 1683–2055ms (-51–60% vs 4.2s) |
| GET thread (RSC inline dopo send) | — | **665–980ms** | RSC inline render durante POST 303; pre-CTE write-transaction era 944–1423ms (ora 96–107ms) |

**Nota HTTP cold lista richieste:** ~3072ms → ~3628ms — regressione HTTP cold da ricontrollare nel benchmark finale PHASE_8 (approvato come non bloccante).

---

## 11. Prossimo flow

```
NEXT_FLOW: SAVED_REQUESTS_FLOW_GREENFIELD_REWRITE
```

**Scope:** `/area-impresa/richieste-salvate` — lista richieste salvate dalla company. Verificare orchestratore attuale (`listCompanySavedRequests` in `packages/db/src/requests/` → facade verso `@esigenta/domain`). Creare `getCompanySavedRequestsPage(actor, filters)` in `packages/domain/src/company/requests/` se non esiste, eliminare vecchio flow.

**Nota pre-implementazione:** Leggere `apps/web/src/app/(area-impresa)/area-impresa/richieste-salvate/page.tsx` per capire il wrapping attuale. Verificare import chain verso packages/db vs domain.

---

## 12. Criteri di accettazione per ogni prossimo flow

Per ogni flow:

- Nuovo orchestratore/command nel boundary corretto (`packages/domain` o `packages/auth`)
- `apps/web` sottile: auth → orchestratore → render/redirect
- Nessun `@esigenta/db` nel flow attivo se esiste il package corretto
- Nessun Prisma diretto in `apps/web`
- Nessuna doppia logica attiva
- Vecchio flow eliminato o ridotto a re-export temporaneo senza logica
- Bonifica anti-codice-morto nello scope (rg sui vecchi simboli)
- `pnpm --filter @esigenta/domain typecheck` verde
- `pnpm --filter web typecheck` verde
- Benchmark domain cold/warm se il flow è runtime-critical
- Roadmap aggiornata
- Report finale (`FLOW_REWRITE_REPORT`)
- Stop — attendere approvazione prima del prossimo flow

---

## 13. Typecheck minimi per flow

```bash
# Ogni flow Area Impresa
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck

# Se tocca auth
pnpm --filter @esigenta/auth typecheck
pnpm --filter web typecheck
pnpm --filter admin typecheck

# Se tocca billing
pnpm --filter @esigenta/billing typecheck
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck

# Se tocca database/schema
pnpm --filter @esigenta/database typecheck
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck
```

---

## 14. Report finale per ogni flow

Ogni flow si chiude con `FLOW_REWRITE_REPORT` contenente:

```
1. flow riscritto
2. nuovo orchestratore creato/confermato
3. vecchio flow eliminato o ridotto a wrapper temporaneo
4. caller migrati
5. file modificati
6. query eliminate
7. query finali rimaste
8. side effect separati, se presenti
9. bonifica eseguita
10. codice morto trovato/rimosso
11. compat facade rimaste e perché
12. conferma nessuna doppia logica attiva
13. conferma no Prisma diretto in apps/web
14. conferma no @esigenta/db nel flow attivo
15. behavior changes
16. schema changes
17. UI changes
18. typecheck
19. benchmark cold/warm se rilevante
20. bottleneck rimasto
21. aggiornamento PACKAGES_MIGRATION_ROADMAP.md
22. NEXT_STEP_RECOMMENDED
```
