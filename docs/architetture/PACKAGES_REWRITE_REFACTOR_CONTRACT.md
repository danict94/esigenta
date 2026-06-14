# Esigenta — Packages & Area Impresa Rewrite Contract

## Scopo

Questo è il contratto operativo obbligatorio per il refactor del monorepo Esigenta.

Da ora l’assistente AI deve leggere **solo questi documenti principali** prima di intervenire:

```txt
docs/architetture/PACKAGES_REWRITE_REFACTOR_CONTRACT.md
docs/architetture/PACKAGES_MIGRATION_ROADMAP.md
```

Se esistono altri documenti come:

```txt
docs/flusso_rewire.md
docs/rewrite_process.md
docs/*rewrite*.md
```

devono essere trattati così:

```txt
1. se dicono le stesse cose, vanno consolidati dentro questi due documenti e poi marcati come DEPRECATED o eliminati
2. se contengono dettagli unici non duplicati, PACKAGES_MIGRATION_ROADMAP.md deve citarli esplicitamente come documento secondario da leggere
3. non bisogna far leggere tre documenti che dicono quasi la stessa cosa
```

Obiettivo:
trasformare Esigenta in un monorepo pulito, scalabile, leggibile e performante.

Regola principale:

```txt
se un flow è scritto male, non si patcha.
si riscrive da zero nel boundary corretto.
dopo la riscrittura si elimina o riduce il vecchio flow.
poi si fa bonifica anti-codice-morto.
```

---

# 1. Regola CTO definitiva

Questo progetto non è online.

Quindi l’obiettivo non è preservare codice vecchio scritto male.

L’obiettivo è costruire il sistema come lo faremmo oggi da zero.

Se nello scope corrente trovi:

```txt
flow confuso
query duplicate
auth richiamata più volte
apps/web che orchestra business logic
domain che rifà auth
Prisma nel posto sbagliato
wrapper inutili
compat sporca
doppia logica
file troppo accoppiati
side effect nel critical path
performance bloccata da struttura errata
```

devi riscrivere il flow.

Non devi fare:

```txt
patch locale
cerotto
cache per coprire codice sporco
wrapper sopra codice vecchio
compat sporca per paura di rompere
ottimizzazione cosmetica
```

La regressione temporanea durante il refactor è accettata.

Il risultato finale invece deve avere:

```txt
typecheck verde
flow funzionante
nessuna doppia logica attiva
vecchio codice eliminato o ridotto a wrapper temporaneo pulito
nessun import sbagliato
nessun Prisma diretto in apps/web
nessun @esigenta/db nel flow attivo se esiste package corretto
```

---

# 2. Boundary obbligatori

## apps/web

Può fare:

```txt
routing
layout/page rendering
redirect
parsing input minimo
server actions sottili
chiamata a domain/auth
gestione risultato
```

Non può fare:

```txt
business logic pesante
policy company/admin/customer
Prisma diretto
orchestrazione complessa
query duplicate
side effect/email/notifiche
read-model complessi
```

## packages/auth

Possiede:

```txt
sessione
user
actor
guards
identity
requireCompanyActor
requireAreaImpresaAccess
marketplace policy
```

Non deve stare in `packages/db`.

## packages/domain

Possiede:

```txt
business logic Esigenta
read-model
write-model
orchestratori
policy specifiche della risorsa
```

Dentro domain si divide per attore/uso:

```txt
admin
public
company
customer
internal
```

## packages/database

Solo:

```txt
Prisma
schema
migrations
seed
client
transaction helper
repository bassi
```

## packages/billing

Solo:

```txt
credits
checkout
Stripe
ledger
orders
refunds
```

## packages/notifications

Solo:

```txt
email provider
templates
send-email
canali tecnici
```

Domain decide quando inviare.
Notifications invia.

## packages/ui

Solo UI pura.

Vietato:

```txt
ui -> database
ui -> domain
ui -> auth
ui -> billing
ui -> notifications
ui -> prisma
```

---

# 3. Target finale packages

```txt
packages/
  config/
  ui/
  uploads/

  shared/
  database/
  auth/
  domain/
  taxonomy/
  funnel/
  billing/
  notifications/
```

`packages/db` è temporaneo.

Target finale:

```txt
packages/db deve diventare solo compatibility facade
poi deve sparire
```

---

# 4. Regola per ogni flow Area Impresa

Ogni flow Area Impresa deve essere riscritto così:

```txt
apps/web
  -> risolve actor una volta
  -> chiama un solo orchestratore domain
  -> render / redirect

domain
  -> possiede read-model o command
  -> applica policy risorsa
  -> carica solo dati necessari
  -> ritorna dati pronti per UI
  -> non fa auth globale
  -> non importa Next.js
  -> non usa packages/db

database
  -> esegue Prisma/query basse
```

Ogni flow importante deve avere un orchestratore chiaro.

Esempi target:

```txt
getCompanyRequestsListPage(actor, filters)
getCompanyRequestDetailPage(actor, requestId)
contactCustomerForRequest(actor, requestId)
getCompanyConversationThreadPage(actor, conversationId)
sendCompanyConversationMessage(actor, conversationId, input)
getCompanySavedRequestsPage(actor, filters)
getCompanyPurchasedRequestsPage(actor, filters)
getCompanyCreditsPage(actor)
getCompanyServicesConfigurationPage(actor)
getCompanyProfilePage(actor)
getCompanyNotificationsPage(actor)
```

Vietato:

```txt
apps/web che chiama 4-5 helper sparsi
domain che rifà requireCompanyActor
server action che orchestra conversazioni, notifiche, request e email insieme
vecchio flow tenuto vivo “per sicurezza”
```

---

# 5. Procedura obbligatoria per ogni flow

Per ogni flow:

```txt
1. leggere PACKAGES_REWRITE_REFACTOR_CONTRACT.md
2. leggere PACKAGES_MIGRATION_ROADMAP.md
3. identificare lo scope del flow corrente
4. leggere il codice vecchio solo per capire il comportamento atteso
5. creare o confermare il nuovo orchestratore domain
6. migrare apps/web al nuovo orchestratore
7. eliminare il vecchio flow attivo
8. bonificare import/export/wrapper/file morti
9. eseguire rg anti-codice-morto
10. eseguire typecheck
11. eseguire benchmark se il flow è runtime/performance
12. aggiornare PACKAGES_MIGRATION_ROADMAP.md
13. report finale
14. fermarsi
```

Non fare un audit infinito.

L’audit è consentito solo se serve a capire lo scope.
Se il problema è già misurato e chiaro, si implementa il rewrite.

---

# 6. Bonifica obbligatoria nello scope

Ogni rewrite deve includere bonifica.

Dopo ogni flow, eseguire controlli tipo:

```bash
rg "nomeVecchiaFunzione" .
rg "nomeVecchioFile" .
rg "@esigenta/db" apps/web/src/app/<flow> packages/domain/src/<flow>
rg "prisma\." apps/web/src/app/<flow>
```

Verificare:

```txt
nessun caller usa il vecchio flow
nessun export punta a codice eliminato
nessuna doppia implementazione vecchio/nuovo
nessun wrapper sporco
nessun import da @esigenta/db nel flow attivo
nessun Prisma diretto in apps/web
nessun file vuoto inutile
nessun barrel index inutile
nessuna instrumentation incoerente
```

La compat facade è ammessa solo se:

```txt
temporanea
senza logica
re-export verso il nuovo package
documentata in roadmap
```

---

# 7. Performance come criterio architetturale

Ogni flow Area Impresa deve essere veloce anche a freddo, non solo dopo cache.

La cache non deve coprire codice scritto male.

Misurare sempre:

```txt
cold
warm
domain total
HTTP total
query principali
auth/actor
mapping/render
side effect
```

Se un flow è lento perché:

```txt
query seriali inutili
query globali a ogni render
JOIN profondo inutile
side effect nel critical path
refresh completo dopo action
actor ricalcolato più volte
```

si riscrive il flow.

Non si nasconde con cache.

---

# 8. Stato reale PHASE 8 — Area Impresa

PHASE_8 è in corso.

Sotto-step già chiusi:

```txt
AUTH_FLOW_STEP_1_ACCESS_GUARD_REWRITE
AUTH_FLOW_STEP_2_LOGIN_FLOW_REWRITE
AUTH_FLOW_STEP_3_COOKIECACHE_OFFICIAL_BETTER_AUTH
REQUESTS_LIST_FLOW_GREENFIELD_REWRITE
```

## Auth flow già riscritto

Fatto:

```txt
requireAreaImpresaAccess centralizzato
server actions con redirect coerente
login post-success con una sola navigazione
cookieCache ufficiale Better Auth
nessun CompanyActor in cookie/session
nessun HMAC manuale
nessun bypass Better Auth
```

## Lista richieste già riscritta

Flow:

```txt
/area-impresa/richieste
```

Nuovo orchestratore:

```txt
getCompanyRequestsListPage(actor, filters, page, recordPerf)
```

Vecchio flow eliminato:

```txt
list-request-cards.ts
listAvailableRequestsForCompany
loadAvailableRequestsForCompany
```

Risultati accettati lato domain:

```txt
domain cold: ~1551ms -> ~1011ms
domain warm: 950ms -> 434ms
```

Nota:

```txt
HTTP cold totale va ricontrollato nel benchmark finale PHASE_8
```

---

# 9. Flow Area Impresa ancora da riscrivere

Prossimi flow da trattare con lo stesso metodo:

```txt
1. REQUEST_DETAIL_FLOW
   /area-impresa/richieste/[id]
   target: getCompanyRequestDetailPage(actor, requestId)

2. CONTACT_CUSTOMER_FLOW
   bottone contatta cliente
   target: contactCustomerForRequest(actor, requestId)

3. CONVERSATION_THREAD_FLOW
   /area-impresa/contatti/[conversationId]
   target: getCompanyConversationThreadPage(actor, conversationId)

4. SEND_MESSAGE_FLOW
   invio messaggio
   target: sendCompanyConversationMessage(actor, conversationId, input)

5. SAVED_REQUESTS_FLOW
   /area-impresa/richieste-salvate

6. PURCHASED_REQUESTS_FLOW
   /area-impresa/richieste-acquistate

7. SERVICES_CONFIGURATION_FLOW
   /area-impresa/configura-servizi

8. COMPANY_PROFILE_FLOW
   /area-impresa/profilo

9. CREDITS_FLOW
   /area-impresa/crediti

10. SUPPORT_FLOW
    /area-impresa/assistenza

11. NOTIFICATIONS_FLOW
    /area-impresa/notifiche
```

Non passare a PHASE_9 finché PHASE_8 non è chiusa.

---

# 10. Roadmap packages

Le fasi grandi restano:

```txt
PHASE_0_SCAFFOLD_PACKAGES
PHASE_1_EXTRACT_SHARED
PHASE_2_EXTRACT_DATABASE
PHASE_3_EXTRACT_TAXONOMY
PHASE_4_EXTRACT_FUNNEL
PHASE_5_EXTRACT_AUTH
PHASE_6_EXTRACT_DOMAIN_BASE
PHASE_7_RESTRUCTURE_DOMAIN_REQUESTS
PHASE_8_AREA_IMPRESA_AUTH_RUNTIME_REWRITE
PHASE_9_EXTRACT_BILLING
PHASE_10_EXTRACT_NOTIFICATIONS
PHASE_11_DB_FACADE
PHASE_12_MIGRATE_APP_IMPORTS
PHASE_13_REMOVE_DB_PACKAGE
```

Stato attuale:

```txt
PHASE_0 - PHASE_7: completed
PHASE_8: in progress
PHASE_9 - PHASE_13: pending
```

---

# 11. Aggiornamento obbligatorio roadmap

Dopo ogni flow riscritto, aggiornare:

```txt
docs/architetture/PACKAGES_MIGRATION_ROADMAP.md
```

La roadmap deve contenere:

```txt
1. fase corrente
2. fasi completate
3. flow Area Impresa riscritti
4. flow Area Impresa mancanti
5. orchestratori creati
6. vecchi flow eliminati
7. compat facade rimaste
8. typecheck passati
9. benchmark rilevanti
10. prossimo flow consigliato
```

Se viene creato un altro documento, la roadmap deve indicare se:

```txt
è documento canonico secondario da leggere
oppure è duplicato/deprecato
```

Non lasciare documentazione parallela non sincronizzata.

---

# 12. Typecheck minimi

Per ogni flow Area Impresa:

```bash
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck
```

Se tocca auth:

```bash
pnpm --filter @esigenta/auth typecheck
pnpm --filter web typecheck
pnpm --filter admin typecheck
```

Se tocca billing:

```bash
pnpm --filter @esigenta/billing typecheck
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck
```

Se tocca database/schema:

```bash
pnpm --filter @esigenta/database typecheck
pnpm --filter @esigenta/domain typecheck
pnpm --filter web typecheck
```

---

# 13. Report obbligatorio per ogni flow

Ogni flow deve chiudersi con:

```txt
FLOW_REWRITE_REPORT
```

Contenuto obbligatorio:

```txt
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

Se non ci sono cambiamenti:

```txt
Behavior changes: none
Schema changes: none
UI changes: none
```

---

# 14. Regola finale

```txt
Non portare codice vecchio sporco dentro il nuovo flow.
Non tenere due flow vivi.
Non usare cache per coprire architettura sbagliata.
Non rimandare bonifica nello scope.
Non leggere tre documenti che dicono la stessa cosa.
Non fare patch se serve rewrite.

Riscrivi il flow come lo faresti oggi da zero.
Migra i caller.
Elimina il vecchio.
Bonifica.
Misura.
Aggiorna roadmap.
Fermati.
```
contenuto che era in rewrite process.md 

# REWRITE_PROCESS.md

# Esigenta Recovery Process

Version: 1.0

Ogni intervento segue questo processo.

Non sono consentiti shortcut.

---

# Obiettivo

Recuperare il progetto tramite rewrite controllati.

Non tramite patch.

Non tramite workaround.

Non tramite stratificazione di codice.

---

# STEP 1 — Audit

Analizzare il blocco esistente.

Mappare:

* route
* page
* componenti
* server actions
* read models
* commands
* query
* auth
* redirect
* side effects

Produrre una mappa completa del flusso.

Non modificare codice.

---

# STEP 2 — Reverse Engineering

Descrivere:

come funziona oggi.

Diagramma obbligatorio:

Utente
→ Route
→ Auth
→ Query
→ Policy
→ DTO
→ Render

Ogni passaggio deve essere identificato.

---

# STEP 3 — New Design

Ignorare l'implementazione esistente.

Rispondere:

"Se dovessi costruire questa feature oggi da zero, come la progetterei?"

Definire:

* architettura
* ownership
* read model
* command
* DTO
* UI
* router

---

# STEP 4 — Rewrite Decision

Classificare ogni elemento:

KEEP
REWRITE
REMOVE

Motivare ogni decisione.

---

# STEP 5 — Rewrite

Costruire la nuova implementazione.

Regole:

* non adattare il codice vecchio
* non aggiungere patch
* non aggiungere workaround
* non mantenere complessità inutile

La nuova implementazione deve poter vivere autonomamente.

---

# STEP 6 — Debug Visibility

Ogni rewrite deve essere osservabile.

Aggiungere log temporanei.

Esempio:

```text
[REQUEST_DETAIL]

auth: 23ms

loadRequest: 41ms

loadConversation: 9ms

total: 73ms
```

Deve essere sempre possibile capire:

* cosa viene chiamato
* in quale ordine
* quanto costa

---

# STEP 7 — Validation

Verificare:

* comportamento corretto
* autorizzazioni corrette
* query corrette
* performance corrette
* assenza di regressioni

---

# STEP 8 — Legacy Cleanup

Dopo validazione:

eliminare:

* vecchie page
* vecchi helper
* vecchi DTO
* vecchie query
* vecchi componenti

Non lasciare doppie implementazioni.

---

# STEP 9 — Approval Gate

Fermarsi.

Mostrare:

* architettura nuova
* file creati
* file eliminati
* nuovo flusso
* risultati debug

Attendere approvazione.

Solo dopo passare al blocco successivo.

---

# Domanda Obbligatoria

Prima di qualsiasi modifica:

"Se dovessi scrivere questa feature oggi da zero, la scriverei così?"

Se la risposta è NO:

vietato patchare.

Procedere con rewrite.

---

# Blocco Attivo

Può esistere un solo rewrite attivo alla volta.

Finché il blocco corrente non è approvato:

vietato iniziare il successivo.

---

# Priorità Attuale

RICHIESTE → DETTAGLIO RICHIESTA

Audit
→ New Design
→ Rewrite
→ Debug
→ Cleanup
→ Approval
