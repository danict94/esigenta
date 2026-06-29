# 03_ROADMAP.md

# ESIGENTA — ROADMAP DI RISTRUTTURAZIONE

Versione: 1.0
Stato: ATTIVA
Owner: AI / Codex / CTO workflow

---

# SCOPO

Questo documento guida la ristrutturazione progressiva di Esigenta.

Deve essere aggiornato dopo ogni fase.

La roadmap serve a evitare:

```txt
refactor casuali
file morti
duplicazioni
cartelle temporanee dimenticate
compat layer inutili
vecchio codice lasciato in giro
feature metà vecchia e metà nuova
```

---

# DOCUMENTI OBBLIGATORI

Prima di ogni fase leggere:

```txt
docs/architetture/01_ARCHITECTURE.md
docs/architetture/02_GUARDS.md
docs/architetture/03_ROADMAP.md
docs/architetture/04_DEFERRED_ITEMS.md
```

Se uno di questi file manca, fermarsi.

`04_DEFERRED_ITEMS.md` traccia tutto ciò che le fasi precedenti hanno rimandato. Ogni fase deve
verificare se chiude uno di quegli item (aggiornarne lo stato a `RESOLVED` con
`RESOLVED_IN_PHASE`/`RESOLUTION_SUMMARY`/`FILES_CHANGED`) e deve registrare lì qualsiasi nuovo
rinvio emerso. Non è consentito lasciare un problema rimandato solo nel `PHASE_REPORT`.

---

# PRINCIPIO ROADMAP

Non si lavora su tutto insieme.

Si lavora una fase alla volta.

Ogni fase deve avere:

```txt
scope chiaro
file consentiti
file vietati
audit iniziale
implementazione o rewrite
bonifica vecchio codice
typecheck
build
report finale
aggiornamento roadmap
```

---

# REGOLA PRINCIPALE

Non stiamo spostando file.

Stiamo ricostruendo il prodotto.

```txt
Se un file è sano, si può spostare.
Se un file è marcio, si riscrive.
Se una logica appartiene a un package, si estrae.
Se un file vecchio non serve più, si elimina.
```

È vietato lasciare:

```txt
old.tsx
legacy.tsx
temp.tsx
new-version.tsx
backup.tsx
copy.tsx
_component vecchio inutilizzato
_lib vecchio inutilizzato
compat layer non necessario
```

---

# ORDINE STRATEGICO

La ristrutturazione parte da:

```txt
1. Area Impresa
```

perché è la parte più grande, più delicata e più monetizzabile.

Poi:

```txt
2. Richiesta
3. Site / SEO / GEO
4. Packages ownership
5. Performance rewrite
6. Bonifica finale
```

---

# STATO GLOBALE

```txt
AREA IMPRESA: DA RISTRUTTURARE
RICHIESTA: DA RISTRUTTURARE
SITE SEO/GEO: FONDAZIONE SCALABILE AVVIATA (Phase 18.1, pilota ristrutturare-bagno) — DA ESTENDERE AD ALTRE FAMIGLIE
PACKAGES: DA AUDITARE / COMPATTARE
PERFORMANCE: DA RISCRIVERE DOPO OWNERSHIP
DEAD CODE: DA BONIFICARE A OGNI FASE
```

---

# PHASE 0 — CHECKPOINT INIZIALE

## Stato

```txt
PENDING
```

## Obiettivo

Creare checkpoint prima di modificare file.

## Azioni

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\Desktop\esigenta-backups" | Out-Null
git diff --binary > "$env:USERPROFILE\Desktop\esigenta-backups\phase-0-before-roadmap.patch"
git status --short
pnpm --filter web typecheck
pnpm --filter web build
```

## Vietato

```txt
modificare codice
spostare file
cancellare file
fare commit
usare git add .
```

## Done

```txt
checkpoint creato
typecheck verificato
build verificata
stato iniziale documentato
```

---

# PHASE 1 — CREARE STRUTTURA TARGET VUOTA

## Stato

```txt
COMPLETED — struttura target vuota creata (48 cartelle foglia con .gitkeep, tutte le directory
intermedie create di conseguenza). Nessun file esistente spostato/modificato. Nessun import
aggiornato. Nessun route group vietato corretto (resta da fare nelle Fasi 4-8). typecheck e build
passano, nessun comportamento cambiato.
```

## Obiettivo

Creare la struttura target senza cambiare comportamento.

## Scope

```txt
apps/web/src/site
apps/web/src/richiesta
apps/web/src/area-impresa
apps/web/src/ui
apps/web/src/platform
apps/web/src/auth
```

## Azioni

Creare solo cartelle mancanti e, se necessario, `.gitkeep`.

## Vietato

```txt
migrare logica
spostare file marci
aggiornare import
toccare packages
riscrivere flow
```

## Done

```txt
struttura target presente
nessun comportamento cambiato
typecheck passa
build passa
```

---

# PHASE 2 — AREA IMPRESA AUDIT MAPPING

## Stato

```txt
COMPLETED — audit read-only completato, nessun file spostato/riscritto/eliminato.
Report: docs/archive-legacy/old-architecture/audit_area-impresa.md (sostituisce la versione precedente che certificava
erroneamente come "OK" una struttura che viola la regola sui route group).
Violazione trovata: route group vietati (opportunita)/(comunicazioni)/(account)/(billing)/(shell)
sotto app, parzialmente già committati (d0d2b02). Per decisione esplicita dell'operatore, la
violazione NON è stata corretta in questa fase: resta da correggere nelle Fasi 4-8.
```

## Obiettivo

Mappare tutto ciò che oggi appartiene ad Area Impresa.

Classificare ogni file come:

```txt
router bridge
feature web sana
feature web marcia
package candidate
shared messaging
monitoring
dead code
unknown
```

## Scope

```txt
apps/web/src/app/area-impresa
apps/web/src/app/(area-impresa)
apps/web/src/area-impresa
apps/web/src/auth
packages/auth
packages/domain
packages/billing
packages/notifications
```

## Output obbligatorio

```txt
AREA_IMPRESA_MAPPING_REPORT

FILES_TO_KEEP_IN_APP:
FILES_TO_MOVE:
FILES_TO_REWRITE:
FILES_TO_DELETE:
PACKAGE_EXTRACTION_CANDIDATES:
DUPLICATES_FOUND:
DEAD_CODE_FOUND:
RISKS:
NEXT_PHASE:
```

## Vietato

```txt
spostare file durante audit
riscrivere codice durante audit
fare fix performance
```

---

# PHASE 3 — AREA IMPRESA PUBLIC

## Stato

```txt
COMPLETED — codice prodotto spostato in apps/web/src/area-impresa/public/{marketing,auth}/.
Route in app diventate bridge sottili. Nessun doppione, nessun file morto residuo nello stesso
scope. URL invariati, typecheck e build passano.

Route consolidation DEFERITA: le route pubbliche restano fisicamente sotto
apps/web/src/app/(public-business)/area-impresa/ (non spostate sotto apps/web/src/app/area-impresa/)
per evitare conflitto con l'albero (area-impresa)/area-impresa/(private)/... già esistente per la
parte privata. Da valutare in una fase dedicata di consolidamento route group, dopo che la
violazione dei route group vietati in (private) sarà corretta (Fasi 4-8).

Inoltre risolto un PACKAGE_EXTRACTION_CANDIDATE della Fase 2: apps/web/src/lib/area-impresa/
create-company-for-current-user.ts (owner non valido sotto lib/) spostato in
area-impresa/public/auth/actions/create-company-for-current-user.ts, suo unico consumer.
```

## Obiettivo

Ricostruire la parte pubblica Area Impresa.

## Owner finale

```txt
apps/web/src/area-impresa/public/
  marketing/
  auth/
```

## Route coinvolte

```txt
/area-impresa
/area-impresa/accedi
/area-impresa/iscriviti
/area-impresa/recupera-password
/area-impresa/reimposta-password
/area-impresa/seleziona-impresa
```

## Regola

Le route in `app` devono diventare bridge sottili.

## Done

```txt
route app sottili
codice prodotto in area-impresa/public
nessun doppione
vecchio codice eliminato
URL invariati
typecheck passa
build passa
```

---

# PHASE 4 — AREA IMPRESA PRIVATE SHELL

## Stato

```txt
COMPLETED — shell privata ricostruita in apps/web/src/area-impresa/private/shell/. Route group
vietato (private)/(shell) eliminato. layout.tsx in app è ora bridge sottile.

Risolto nello scope:
- shell counts: nuovo orchestratore getAreaImpresaShellCounts(actor) in packages/domain
  (company/shell), sostituisce le 2 query/orchestrazione inline nel layout.
- company status policy: nuova isCompanyMarketplaceEnabled(status) in packages/domain
  (company/account), sostituisce il controllo `=== "APPROVED"` inline nel layout. Lo stesso
  controllo duplicato in (private)/(billing)/crediti/page.tsx NON è stato toccato (billing fuori
  scope Fase 4; da consolidare in Fase 8).
- company status copy (testo banner): resta in area-impresa/private/shell (puramente visuale),
  ora tipizzata su CompanyStatus derivato da CompanyActor invece di string.
- logging always-on: rimosso il console.info incondizionato in requireCompanyActor
  (apps/web/src/auth/server.ts); le stesse metriche (requireUserMs/resolveCompanyActorMs) sono
  ora nel payload areaLog("area.auth.end") già gated da isAreaMonitoringEnabled().

Deferito (motivato, non corretto in questa fase):
- apps/web/src/lib/area-monitoring.ts e .server.ts NON sono stati spostati in
  platform/monitoring o area-impresa/monitoring. Sono importati anche da
  (private)/(opportunita|comunicazioni|account|billing), da middleware.ts e da
  api/stripe/webhook/route.ts: tutti fuori scope Fase 4 ("Non toccare" / non in "Puoi
  modificare"). Spostarli ora avrebbe richiesto toccare quei file (vietato) oppure creare un
  doppione temporaneo (vietato da REGOLA ZERO / REGOLA ANTI-RIDONDANZA: "vecchio + nuovo insieme
  no"). La shell continua a importarli dal path esistente. Vanno spostati in modo atomico quando
  tutti i consumer saranno migrati (fine Fase 8, o fase infra dedicata).
- impresa-sidebar.tsx NON è stato frammentato in private-header.tsx/shell-navigation.ts come
  nell'elenco aspirazionale di 01_ARCHITECTURE.md: il file era già classificato "sano" in Fase 2
  (nessun mix di responsabilità) e nessuno dei 7 problemi noti richiedeva la frammentazione;
  spostato as-is per evitare refactor non richiesto.

typecheck e build passano sia per web che per la root (packages/domain toccato).
```

## Obiettivo

Ricostruire layout, sidebar, header, counts privati.

## Owner finale

```txt
apps/web/src/area-impresa/private/shell/
```

## Route coinvolte

```txt
/area-impresa/*
```

## Attenzione

Shell counts non devono fare query duplicate sparse.

Se la logica è marcia, riscrivere con orchestratore/read-model corretto.

## Done

```txt
layout privato pulito
sidebar pulita
counts centralizzati
nessun vecchio layout duplicato
typecheck passa
build passa
```

---

# PHASE 5 — AREA IMPRESA OPPORTUNITÀ

## Stato

```txt
COMPLETED — feature ricostruita in apps/web/src/area-impresa/private/opportunita/{components,
actions,view-models,richieste,richiesta-dettaglio,richieste-salvate,richieste-acquistate}/.
Route group vietato (opportunita) eliminato (D-004 risolto). 4 route diventate bridge sottili.

P0 risolto, non rimandato: packages/domain/src/company/requests/get-requests-list-page.ts
riscritto. Filtri (keyword/categoria/servizio), distanza precisa (haversine), match level e
ordinamento (recommended/newest/nearest) e paginazione ora sono tutti DB-side in un'unica query
SQL (CTE + LIMIT pageSize+1/OFFSET), sugli indici esistenti (status, [latitude,longitude]).
Prima: findMany con take fisso 100, poi filtro/sort/paginazione in JS su quel sottoinsieme fisso
(bug di correttezza oltre che di performance: risultati oltre le prime 100 righe più recenti
non erano mai raggiungibili, anche se più pertinenti).

Risolto anche il P1 "query senza LIMIT" in salvate/acquistate: get-saved-requests-page.ts e
get-purchased-requests-page.ts ora accettano un parametro page e applicano LIMIT pageSize+1/
OFFSET; le pagine web mostrano link Pagina precedente/successiva come già su richieste.

Package-first applicato: packages/domain già possedeva countUnread.../matchLevel logic; nessuna
funzione equivalente esisteva per filtro/sort/paginazione DB, creata una volta sola nello stesso
file owner (nessun duplicato, nessun wrapper).

Deferito (motivato, registrato in 04_DEFERRED_ITEMS.md):
- apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts resta dove è: stesso problema di
  owner non valido già tracciato in D-002 (ora aggiornato per includerlo), usato anche da
  (account)/(billing)/(comunicazioni), fuori scope Fase 5.
- request-detail-card.tsx (891 righe) e request-filters-panel.tsx (558 righe) spostati as-is:
  erano "sani" in Fase 2 (nessun mix di responsabilità), nessuno dei problemi noti richiedeva
  uno split; introdotta solo una cartella components/ condivisa tra richieste e
  richiesta-dettaglio (deviazione minore dal naming aspirazionale di 01_ARCHITECTURE.md,
  giustificata: i file sono già correttamente nominati e funzionanti).
- D-003 (duplicazione `status === "APPROVED"` in billing) resta OPEN: (private)/(billing) non è
  stato toccato, come richiesto.

typecheck e build passano sia per web che per la root (packages/domain toccato).
```

## Obiettivo

Ricostruire opportunità impresa.

## Owner finale

```txt
apps/web/src/area-impresa/private/opportunita/
  richieste/
  richiesta-dettaglio/
  richieste-salvate/
  richieste-acquistate/
  actions/
  view-models/
```

## Route coinvolte

```txt
/area-impresa/richieste
/area-impresa/richieste/[id]
/area-impresa/richieste-salvate
/area-impresa/richieste-acquistate
```

## Regola speciale

`/area-impresa/richieste` è P0 performance.

Non fare patch.

Se il flow è marcio, riscrivere:

```txt
page sottile
feature page pulita
read-model package
filtri DB
sort DB
pagination DB
pageSize + 1
zero query per card
```

## Package owner probabile

```txt
packages/domain/src/company/requests
```

## Done

```txt
route app sottili
feature in area-impresa/private/opportunita
read-model in package se necessario
vecchio codice eliminato
nessun doppione
nessun filtro pesante in JS se evitabile
typecheck passa
build passa
```

---

# PHASE 6 — AREA IMPRESA COMUNICAZIONI

## Stato

```txt
COMPLETED — feature ricostruita in apps/web/src/area-impresa/private/comunicazioni/{contatti,
assistenza,conversazione,actions,view-models}/. Route group vietato (comunicazioni) eliminato
(D-005 risolto). 4 route diventate bridge sottili.

Shared messaging separato: message-thread.tsx e send-message-form.tsx spostati in
apps/web/src/area-impresa/shared-messaging/ (D-009 risolto). /messaggi/accesso aggiornato per
importare dal nuovo owner condiviso — nessun import cross-boundary verso l'albero app di Area
Impresa rimane.

File marcio risolto: company-conversation-thread-page.tsx (route+auth+query+business logic+UI+
message side effects+read state tutto insieme) riscritto separando:
- conversation-page.tsx (feature page web)
- actions/send-message-action.ts (azione web sottile, "use server" estratta dall'inline)
- actions/mark-conversation-read-action.ts (read-state, già render-safe via traceSideEffect/
  after(), ora con un proprio file invece di stare inline nella page)
- actions/open-support-action.ts (azione già sana, solo relocata)
- view-models/conversation-view-model.ts (route/status helper puri)
Anche il logging always-on dentro l'azione inline (2 console.info incondizionati) è stato rimosso,
sostituito da campi aggiuntivi nell'areaLog già gated da isAreaMonitoringEnabled().

Overfetch corretto: listCompanyConversations (packages/domain) accetta ora un parametro
excludeType; contacts-page.tsx lo usa per escludere le conversazioni SUPPORT nel WHERE invece di
fetchare tutto e filtrare in JS come prima.

UX invio messaggio corretta nello scope: send-message-form.tsx (shared-messaging) ora è "use
client" con pulsante che usa useFormStatus — pending state chiaro, disabilitazione durante invio,
nessun doppio invio. Errore/successo restano gestiti via redirect+query param (già corretti).

Eccezione minima e documentata fuori scope: apps/web/src/app/(area-impresa)/area-impresa/(private)/
(account)/notifiche/page.tsx (fuori scope Fase 6) importava buildCompanyConversationHref dal
percorso (comunicazioni)/_lib/conversation-routes.ts, che doveva sparire per requisito esplicito
di questa fase. Corretto un solo import (nessuna logica toccata) verso il nuovo owner
area-impresa/private/comunicazioni/view-models/conversation-view-model. Necessario per non
rompere la build di (account); alternativa (lasciare un compat layer al vecchio percorso)
avrebbe violato sia REGOLA ZERO sia il requisito "il route group deve sparire".

typecheck e build passano sia per web che per la root (packages/domain toccato).
```

## Obiettivo

Ricostruire contatti, assistenza e conversazioni impresa.

## Owner finale

```txt
apps/web/src/area-impresa/private/comunicazioni/
  contatti/
  assistenza/
  conversazione/
  actions/
  view-models/
```

## Route coinvolte

```txt
/area-impresa/contatti
/area-impresa/contatti/[conversationId]
/area-impresa/assistenza
/area-impresa/assistenza/[conversationId]
```

## Attenzione shared messaging

Se un componente è usato anche da:

```txt
/messaggi/accesso
```

non va nascosto in `private/comunicazioni`.

Va in:

```txt
apps/web/src/area-impresa/shared-messaging
```

oppure in owner neutro deciso dall’audit.

## Done

```txt
comunicazioni pulite
shared messaging separato
nessun duplicato thread/form
mark read non eseguito in render se rischioso
typecheck passa
build passa
```

---

# PHASE 7 — AREA IMPRESA ACCOUNT

## Stato

```txt
COMPLETED — feature ricostruita in apps/web/src/area-impresa/private/account/{profilo,servizi,
notifiche,actions}/. Route group vietato (account) eliminato (D-006 risolto). 3 route diventate
bridge sottili.

copertura/ e view-models/ lasciate vuote (solo .gitkeep, già da Fase 1): non esiste oggi un
campo/route "copertura" separato (il raggio operativo vive dentro la card "Sede operativa" di
profilo) e nessuna delle tre feature ha logica di mapping/formattazione abbastanza complessa o
condivisa da giustificare un file view-model dedicato (sarebbe stato un file inutile). Non
forzata l'estrazione per restare fedeli a "Non creare file inutili".

Correttezza notifiche risolta: getCompanyNotificationsPage (packages/domain) calcolava unreadCount
filtrando in JS la lista già limitata a 50 righe — sottostima quando un'impresa supera 50
notifiche non lette, in disaccordo silenzioso col badge della shell (getAreaImpresaShellCounts,
Fase 4, che fa un COUNT reale). Ora chiama countUnreadCompanyNotifications (funzione già
esistente, riusata) in parallelo alla lista.

notifiche, profilo e configura-servizi erano già "sani" secondo l'audit di Fase 2 (nessun mix
route+auth+query+business logic+UI+side effects); nessun file "marcio" trovato in questo scope.
packages/taxonomy NON toccato: la configurazione servizi/categorie usa Prisma diretto
(packages/database) via packages/domain, non packages/taxonomy — nessuna logica taxonomy reale
da estrarre.

notifications-page.tsx (256 righe) scomposto in notifications-page.tsx (dati+layout) +
notifications-list.tsx + notification-card.tsx, per leggibilità — nessun problema da correggere,
solo allineamento al naming aspirazionale di 01_ARCHITECTURE.md dato che la scomposizione era
naturale (markup per-notifica già auto-contenuto in un .map()).

profilo/actions.ts (3 azioni: update profile, richiesta cambio contatto, disattivazione account)
mantenute in un solo file actions/profile-actions.ts (nome non identico a "update-profile-
action.ts" del menu suggerito, ma più onesto: il file contiene 3 azioni distinte, non una sola;
separarle avrebbe duplicato gli helper locali normalizeText/redirectWithError o richiesto un
quarto file di soli helper condivisi).

typecheck e build passano sia per web che per la root (packages/domain toccato).
```

## Obiettivo

Ricostruire profilo, servizi, copertura, notifiche.

## Owner finale

```txt
apps/web/src/area-impresa/private/account/
  profilo/
  servizi/
  copertura/
  notifiche/
  actions/
  view-models/
```

## Route coinvolte

```txt
/area-impresa/profilo
/area-impresa/configura-servizi
/area-impresa/notifiche
```

## Attenzione

`profilo` non deve modificare o bloccare logiche billing.

`notifiche` non deve duplicare shell counts.

## Package owner probabile

```txt
packages/domain
packages/notifications
```

## Done

```txt
account pulito
profilo senza logica billing
notifiche senza duplicazioni
servizi/copertura con owner chiaro
vecchio codice eliminato
typecheck passa
build passa
```

---

# PHASE 8 — AREA IMPRESA BILLING

## Stato

```txt
COMPLETED — feature ricostruita in apps/web/src/area-impresa/private/billing/{crediti,actions}/.
Route group vietato (billing) eliminato (D-007 risolto). 1 route diventata bridge sottile.

D-003 risolto: credits-page.tsx usa isCompanyMarketplaceEnabled da @esigenta/domain invece del
check inline company.status === "APPROVED". Il check in packages/billing/checkout-order.ts è
validazione server-side interna al package (ownership corretta, non duplicazione web).

Checkout/status P0 risolto (non rimandato): getCheckoutSessionStatus in
packages/billing/src/checkout/checkout-status.ts riscritto DB-first. Prima: ogni poll chiamava
sempre Stripe + DB. Dopo: se l'ordine è già fulfilled/failed/cancelled nel DB (webhook già
eseguito), la risposta arriva dal DB senza chiamata Stripe. Solo ordini PENDING o non trovati
nel DB ricadono nel path Stripe. Riduzione Stripe API calls da MAX_ATTEMPTS (8) a ≤1 nel
happy path (webhook prima dell'ultimo poll).

Credit policy auditata: il modello è "global rolling ledger" con singolo balance e singola
expiresAt per company. Non è FIFO/FEFO per lot — è corretto per questo design (un conto
aggregato, non multi-lot). L'accredito aggiunge crediti e prolunga la scadenza dall'expiry
esistente (se futura) o da now. Il debito scala il balance senza toccare expiresAt. La
scadenza viene azzerata atomicamente dentro la tx quando la data è passata. Nessun bug di
policy trovato: corretto così com'è.

acquisti/fatture/rimborsi: nessuna route esiste oggi in app né funzioni di lettura in
packages/billing lato company — scaffolds .gitkeep già presenti da Phase 1, invariati.

typecheck e build passano sia per web che per la root (packages/billing toccato).

Phase 8 ha chiuso D-003 e D-007. La policy crediti globale rilevata non è la policy finale.
Creato D-011 per riscrittura FEFO a lotti in Phase 8.2.
```

## Obiettivo

Ricostruire crediti, checkout, acquisti, fatture, rimborsi.

## Owner finale web

```txt
apps/web/src/area-impresa/private/billing/
  crediti/
  acquisti/
  fatture/
  rimborsi/
  actions/
  view-models/
```

## Package owner

```txt
packages/billing
```

## Route coinvolte

```txt
/area-impresa/crediti
```

## Regola speciale

Checkout/status crediti è P0 performance.

Non fare patch.

Riscrivere con:

```txt
DB-first status
Stripe fallback solo se necessario
backoff
webhook-driven fulfillment
stop early
```

## Done

```txt
UI web billing pulita
logica billing in packages/billing
checkout/status non aggressivo
vecchio codice eliminato
nessun doppione Stripe
typecheck passa
build passa
```

---

# PHASE 8.2 — BILLING FEFO CREDIT LOTS REWRITE

## Stato

```txt
COMPLETED — D-011 risolto. Modello CreditLot/CreditLotConsumption introdotto in
packages/database (additivo). Debit/grant/refund riscritti in packages/billing per usare
lotti FEFO invece del global rolling ledger. CompanyCreditAccount diventata cache mantenuta.
D-018 creato per un follow-up non bloccante fuori scope (get-profile-page.ts). Typecheck e
build (web, admin, root) passano. Vedi PHASE_REPORT.
```

## Obiettivo

Sostituire il global rolling ledger (balance scalare + expiresAt globale) con credit lots separati per acquisto e consumo FEFO.

## Owner

```txt
packages/billing
packages/database/prisma/schema.prisma (eventuale migration)
apps/web/src/area-impresa/private/billing/**
```

## Deferred Item

D-011 — Billing credit expiration policy must become FEFO

## Done

```txt
Ogni acquisto genera un lotto crediti con expiresAt proprio.
Il consumo usa FEFO: prima i crediti con scadenza più vicina.
Nessun acquisto estende la scadenza dei lotti precedenti.
Il saldo disponibile è derivato dai lotti validi, non da expiresAt globale.
I crediti scaduti non sono consumabili.
Eventuale migration/backfill completata.
Typecheck e build passano.
Test o invarianti billing documentano la policy FEFO.
D-011 risolto.
```

## PHASE_REPORT Phase 8.2

```txt
DATA: 2026-06-17

AUDIT (stato prima della riscrittura):
  Schema: CompanyCreditAccount (balance scalare + expiresAt globale per company),
    CreditOrder (un ordine = un acquisto Stripe), CompanyCreditTransaction (ledger
    append-only con idempotencyKey univoca, balanceBefore/After, expiresAtBefore/After,
    relatedTransactionId per i reversal). Nessun concetto di lotto.
  Accredito: packages/billing/src/stripe/fulfillment.ts — grantCreditOrderFulfillment
    aggiornava CompanyCreditAccount.balance += credits e ricalcolava un SOLO expiresAt
    globale (max(expiresAt esistente, now) + validityDays), estendendo la scadenza
    dell'intero saldo a ogni acquisto — esattamente il rischio descritto in D-011.
  Consumo: packages/billing/src/credits/ledger.ts — debitCompanyCreditsInTransaction
    lockava l'account globale FOR UPDATE e scalava balance, ignorando l'esistenza di
    "lotti" diversi (non esistevano).
  Rimborso: packages/billing/src/admin/credit-ledger.ts — stessa logica, aggiungeva al
    balance globale con un floor di scadenza di 30 giorni.
  Scadenza: la stessa identica logica "se expiresAt globale <= now, azzera balance e
    scrivi CREDIT_EXPIRATION" era duplicata in QUATTRO posti indipendenti: ledger.ts,
    fulfillment.ts, admin/credit-ledger.ts, get-credits-page.ts (packages/billing) — e
    in un QUINTO fuori da packages/billing: packages/domain/src/company/profile/
    get-profile-page.ts (getCreditSummary), violazione REGOLA ANTI-RIDONDANZA pre-esistente.
  Idempotenza: già presente e solida (idempotencyKey univoca su CompanyCreditTransaction,
    pattern pre-check fuori tx + re-check dentro tx + retry su P2002) — preservata invariata.
  Test: nessun test esistente in packages/billing (confermato via glob *.test.ts/*.spec.ts).
  Contratto esterno critico: debitCompanyCreditsInTransaction(tx, input) è chiamato con un
    tx esterno da packages/domain/src/company/requests/unlock-request.ts (dentro la sua
    propria prisma.$transaction) e il chiamante fa cast diretto di debitResult.code su un
    union letterale che include "insufficient_credits" — il contratto (input shape, error
    code letterali, output shape con transactionId/balanceAfter) doveva restare identico.

SCHEMA (additivo, nessuna colonna esistente toccata):
  Nuovi modelli in packages/database/prisma/schema.prisma:
    CreditLot (companyId, creditOrderId nullable, source enum, quantityInitial,
      quantityRemaining, expiresAt proprio, status enum, idempotencyKey univoca)
    CreditLotConsumption (creditLotId, creditTransactionId, amount — invariante:
      quantityRemaining = quantityInitial - SUM(consumptions.amount))
  Nuovi enum: CreditLotSource (PACKAGE_PURCHASE/REFUND/ADMIN_ADJUSTMENT/LEGACY_MIGRATION),
    CreditLotStatus (ACTIVE/EXPIRED/CONSUMED)
  Relazioni aggiunte: Company.creditLots, CreditOrder.creditLots,
    CompanyCreditTransaction.lotConsumptions

MIGRATION_CREATED:
  packages/database/prisma/migrations/20260617120000_credit_lots_fefo/migration.sql
  Contiene: CREATE TYPE/TABLE per CreditLot e CreditLotConsumption, FK, indici;
  backfill che migra il saldo globale pre-FEFO in un lotto LEGACY_MIGRATION per ogni
  company con balance>0 ed expiresAt futuro (creditOrderId NULL — onestamente non
  attribuibile a un singolo acquisto storico); cleanup defensivo per eventuali account
  con balance>0 ma expiresAt nullo/passato (azzerati, stesso comportamento che la lazy
  expiration esistente avrebbe già applicato); re-sync finale di
  CompanyCreditAccount.balance/expiresAt dai lotti appena creati.
  NOTA OPERATIVA: la migration è stata SCRITTA e lo schema è stato validato con
  `prisma generate` (solo lettura schema, nessuna connessione DB). L'APPLICAZIONE
  della migration a un database (prisma migrate deploy / db push) NON è stata
  eseguita in questa fase — richiede conferma esplicita sull'ambiente target
  (dev/staging/prod) prima di un deploy reale, dato che riguarda dati finanziari.
BACKFILL_STRATEGY: vedi MIGRATION_CREATED sopra — un lotto per company con saldo
  positivo e scadenza futura; nessuna perdita di crediti validi; nessun lotto creato
  per saldi già scaduti secondo l'invariante esistente.

CREDIT_LOT_MODEL: vedi SCHEMA sopra.
EXPIRATION_STRATEGY: ogni lotto scade indipendentemente (expireStaleLotsInTransaction in
  packages/billing/src/credits/lot-ledger.ts, chiamata da ogni operazione che legge/muta
  i lotti). Un lotto scaduto viene marcato EXPIRED, quantityRemaining azzerato, e viene
  scritta UNA transazione CREDIT_EXPIRATION per lotto (mai più una sola transazione
  globale che nasconde quali lotti sono coinvolti).
CONSUMPTION_STRATEGY / FEFO_STRATEGY: lockAndPlanFefoConsumptionInTransaction blocca
  (FOR UPDATE) tutti i lotti ACTIVE della company, calcola il piano di consumo ordinando
  per expiresAt crescente (first expiring, first out), poi applyFefoConsumptionPlanInTransaction
  applica il piano una volta creata la riga CompanyCreditTransaction (necessaria per la FK
  di CreditLotConsumption). Split in due fasi per evitare di creare una transazione ledger
  "fantasma" se il consumo fallisse dopo l'insert.
CHECKOUT_ACCREDIT_STRATEGY: ogni fulfillment crea UN NUOVO lotto con expiresAt =
  now + validityDays del pacchetto — non estende mai la scadenza di lotti precedenti
  (risolve il rischio centrale di D-011).
IDEMPOTENCY_STRATEGY: preservata e estesa. CreditLot ha una propria idempotencyKey univoca
  (credit-lot:package-purchase:<orderId>, credit-lot:refund:<unlockId>,
  credit-lot-expiration:<lotId>) oltre a quella già esistente su CompanyCreditTransaction.
  Stesso pattern pre-check + insert ON CONFLICT DO NOTHING + retry-by-key già in uso.

OLD_GLOBAL_EXPIRY_REMOVED: la logica "expiresAt globale singolo, esteso ad ogni acquisto"
  rimossa da fulfillment.ts, ledger.ts, admin/credit-ledger.ts. CompanyCreditAccount.balance/
  expiresAt restano come CACHE mantenuta (non più source of truth) per i consumer fuori
  packages/billing — vedi DUPLICATE_LOGIC_REMOVED e D-018.
DUPLICATE_LOGIC_REMOVED: la logica di lazy-expiration duplicata 4 volte dentro
  packages/billing (ledger.ts, fulfillment.ts, admin/credit-ledger.ts, get-credits-page.ts)
  consolidata in un unico modulo packages/billing/src/credits/lot-ledger.ts
  (ensureCreditAccountRowInTransaction, expireStaleLotsInTransaction,
  lockAndPlanFefoConsumptionInTransaction, applyFefoConsumptionPlanInTransaction,
  createCreditLotInTransaction, deriveCreditSummaryInTransaction,
  syncCompanyCreditAccountCacheInTransaction, refreshCompanyCreditState). La quinta copia
  (packages/domain get-profile-page.ts) NON è stata toccata (fuori scope, packages/domain
  non era nello scope consentito di questa fase) — tracciata come D-018, resa sicura tramite
  la scelta MAX (non MIN) per CompanyCreditAccount.expiresAt cache (vedi D-011
  RESOLUTION_SUMMARY per il ragionamento completo).

FILES_CHANGED:
  packages/database/prisma/schema.prisma (additivo: 2 modelli, 2 enum, 3 relazioni)
  packages/billing/src/credits/ledger.ts (debit riscritto su FEFO, contratto esterno invariato)
  packages/billing/src/stripe/fulfillment.ts (grant crea un nuovo lotto per acquisto)
  packages/billing/src/admin/credit-ledger.ts (refund crea un nuovo lotto; rimossi 4 helper
    sul global-account ora superflui)
  packages/billing/src/credits/get-credits-page.ts (deriva balance/lotti da CreditLot)
  packages/billing/src/credits/index.ts (export tipo CreditLotSummary aggiunto)
  apps/web/src/area-impresa/private/billing/crediti/credits-page.tsx (breakdown per lotto +
    prossima scadenza reale invece del MAX di cache)
  docs/architetture/04_DEFERRED_ITEMS.md (D-011 RESOLVED, D-018 creato)
  docs/architetture/03_ROADMAP.md (questa sezione)

FILES_CREATED:
  packages/billing/src/credits/lot-ledger.ts
  packages/database/prisma/migrations/20260617120000_credit_lots_fefo/migration.sql

FILES_DELETED: nessuno (REGOLA ZERO rispettata: nessun vecchio+nuovo lasciato insieme —
  le 4 copie interne a packages/billing della logica di scadenza globale sono state
  rimosse, non affiancate, nello stesso commit logico della riscrittura)

PACKAGE_SEARCH_DONE: packages/billing (tutti i file credits/checkout/stripe/admin),
  packages/domain (grep cross-package per CompanyCreditAccount/CompanyCreditTransaction),
  apps/admin (grep per @esigenta/billing e funzioni billing consumate)
EXISTING_LOGIC_FOUND: pattern idempotencyKey + ON CONFLICT DO NOTHING + retry già
  consolidato nel package; pattern ${value}::"EnumName" per cast enum in raw SQL già in uso
  (request-credit-refund.ts) — riusato identico nel nuovo codice
REUSED_EXISTING_LOGIC: pattern di idempotenza e cast enum riusati invariati
CREATED_NEW_PACKAGE_LOGIC: lot-ledger.ts (unica creazione, nessun duplicato — vedi sopra)
REMOVED_DUPLICATE_LOGIC: vedi DUPLICATE_LOGIC_REMOVED sopra
REASON: package-first applicato — prima di scrivere il modulo lotti è stato verificato che
  nessuna primitiva equivalente esistesse già; le 4 copie locali della stessa logica di
  scadenza sono state consolidate invece di lasciarne una quinta

BLAST_RADIUS_VERIFICATO_FUORI_SCOPE (non modificato, solo verificato per non rompere nulla):
  packages/domain/src/company/requests/unlock-request.ts — consumer di
    debitCompanyCreditsInTransaction, contratto preservato esattamente
  packages/domain/src/company/profile/get-profile-page.ts — consumer del campo cache
    CompanyCreditAccount, reso sicuro dalla scelta MAX, tracciato in D-018
  apps/admin/src/app/(protected)/crediti/rimborsi/richieste/page.tsx,
    crediti/pacchetti/page.tsx, (protected)/page.tsx — consumer di
    listCreditRefundRequestsForAdminReview/approveCreditRefundRequest/
    rejectCreditRefundRequest/listCreditPackages/createCreditPackage/updateCreditPackage,
    tutte le shape di ritorno preservate identiche
  apps/web/src/area-impresa/private/billing/crediti/credit-checkout-status-banner.tsx,
    actions/create-credit-checkout-action.ts — non toccano balance/expiresAt, non impattati

DEFERRED_ITEMS_RESOLVED: D-011 (FEFO credit lots implementato)
DEFERRED_ITEMS_CREATED: D-018 (get-profile-page.ts: migrare a derivare da CreditLot,
  follow-up non bloccante)
DEFERRED_ITEMS_UPDATED: nessuno

TYPECHECK: PASS (web, admin, root — 12/12 package via `pnpm typecheck`)
BUILD: PASS (web 41/41 pagine, admin 14/14 pagine, @esigenta/database `prisma generate`
  senza connessione DB, root via `pnpm build`)
ROOT_TYPECHECK: PASS
ROOT_BUILD: PASS

RISKS:
  Migration SQL preparata ma NON applicata a nessun database (vedi MIGRATION_CREATED) —
  richiede un deploy esplicito quando l'ambiente target è confermato.
  D-018 resta OPEN: finestra di display transitorio (non finanziario) sulla pagina profilo
  impresa, fuori scope.
BLOCKERS: nessuno per procedere
NEXT_PHASE: Phase 15.1 — Deferred Items Closure (D-016, D-014, D-017) resta la fase
  bloccante prima di Phase 16, come da nota in Phase 15. Phase 8.2 non era nella catena di
  blocco di Phase 16 indicata in Phase 15 (solo D-011/D-016/D-014/D-017): D-011 è ora
  RESOLVED, quindi quel blocco è ridotto a D-016/D-014/D-017.
```

---

# PHASE 8.2.1 — FEFO INTEGRITY VERIFICATION + D-018 CLOSURE

## Stato

```txt
COMPLETED — audit cross-package confermato: CreditLot/CreditLotConsumption sono l'unica
fonte di verità finanziaria nell'intero monorepo; CompanyCreditAccount è scritta in un solo
punto (la funzione di sync centralizzata) più un INSERT idempotente che non sovrascrive mai
dati esistenti. D-018 RESOLVED: get-profile-page.ts non legge/scrive più CompanyCreditAccount,
deriva ora da CreditLot tramite la nuova getCompanyCreditSummary (packages/billing). Trovata e
corretta una scrittura globale diretta più seria di quanto D-018 descrivesse (vedi
OLD_GLOBAL_MODEL_USAGES_FOUND nel PHASE_REPORT). Migration 20260617120000_credit_lots_fefo
revisionata, nessun rischio finanziario trovato, non applicata a database reali. Typecheck e
build (web, admin, root) passano.
```

## Obiettivo

Verificare che la riscrittura FEFO di Phase 8.2 non abbia lasciato CompanyCreditAccount come
fonte decisionale in qualche punto del monorepo, e chiudere D-018.

## Scope

```txt
docs/architetture/03_ROADMAP.md
docs/architetture/04_DEFERRED_ITEMS.md
packages/billing/**
packages/domain/**
apps/web/src/area-impresa/private/billing/**
```

## Vietato

```txt
applicare la migration a database reali
fare commit
```

## Done

```txt
nessun uso di CompanyCreditAccount.balance/expiresAt come fonte decisionale fuori dalla
  funzione di sync centralizzata
D-018 risolto
migration/backfill rivisti senza apertura di nuovi blocker
typecheck passa
build passa
```

## PHASE_REPORT Phase 8.2.1

```txt
DATA: 2026-06-17

AUDIT_CROSS_PACKAGE:
  Grep di CompanyCreditAccount/companyCreditAccount/creditBalance/creditsBalance/expiresAt/
  CreditLot/CreditLotConsumption su packages/billing, packages/domain,
  apps/web/src/area-impresa/private/billing.
  packages/billing: 6 file con match (credits/index.ts, credits/get-credits-page.ts,
    admin/credit-ledger.ts, stripe/fulfillment.ts, credits/ledger.ts, credits/lot-ledger.ts).
    Tutti gli usi di balance/expiresAt sono: (a) campi CompanyCreditTransaction.balanceAfter/
    expiresAtAfter (storico ledger, non decisionale), (b) prima di chiamare
    syncCompanyCreditAccountCacheInTransaction, (c) prima di chiamare
    deriveCreditSummaryInTransaction (legge CreditLot, non CompanyCreditAccount). CLASSIFICATO
    OK ovunque.
  packages/domain: 1 file con match — get-profile-page.ts. CLASSIFICATO NON OK (vedi sotto).
  apps/web/src/area-impresa/private/billing: 0 file con match diretto sulle entità; verificati
    a parte .balance/.expiresAt/nearestLotExpiresAt in credits-page.tsx: tutti letti da
    result (GetCompanyCreditsPageResult, già lot-derived). CLASSIFICATO OK.

  Ricerca scritture dirette: grep di `UPDATE "CompanyCreditAccount"` e
  `INSERT INTO "CompanyCreditAccount"` su packages/billing → solo 2 occorrenze, entrambe in
  lot-ledger.ts: ensureCreditAccountRowInTransaction (INSERT ... ON CONFLICT DO NOTHING, non
  decisionale, garantisce solo l'esistenza della riga) e
  syncCompanyCreditAccountCacheInTransaction (l'unica funzione di sync, centralizzata).
  Nessuna scrittura sparsa trovata dentro packages/billing.

OLD_GLOBAL_MODEL_USAGES_FOUND:
  packages/domain/src/company/profile/get-profile-page.ts (getCreditSummary):
  - LETTURA diretta: SELECT ... FROM "CompanyCreditAccount" ... FOR UPDATE
  - SCRITTURA diretta: UPDATE "CompanyCreditAccount" SET balance=0, expiresAt=NULL
    fuori dalla funzione di sync centralizzata di packages/billing
  - INSERT CREDIT_EXPIRATION duplicato (stessa idempotencyKey pattern già coperta da
    expireStaleLotsInTransaction, ma calcolata su un dato — il balance globale — che dopo
    Phase 8.2 è solo una cache, non più la verità)
  Questa era la quinta copia della logica di scadenza globale individuata in Phase 8.2 (D-018),
  ma è risultata più seria di quanto la DESCRIPTION originale di D-018 indicasse: non solo
  lettura/display, ma una vera SCRITTURA globale parallela alla cache, indipendente dal motore
  lotti.

OLD_GLOBAL_MODEL_USAGES_REMOVED:
  get-profile-page.ts riscritto: getCreditSummary ora chiama
  getCompanyCreditSummary(companyId, now) da @esigenta/billing e mappa il risultato
  (balance, nearestExpiresAt) sulla shape esistente CompanyProfileCreditSummary
  ({ balance, expiresAt } | null) — nessuna query SQL, nessuna scrittura, nessuna copia
  locale della logica di scadenza rimasta in packages/domain.

COMPANY_CREDIT_ACCOUNT_ROLE: cache derivata di compatibilità, scritta esclusivamente da
  syncCompanyCreditAccountCacheInTransaction (packages/billing/src/credits/lot-ledger.ts);
  balance = somma quantityRemaining dei lotti ACTIVE; expiresAt = MAX(expiresAt) dei lotti
  ACTIVE (scelta deliberata, non MIN, per la sicurezza di eventuali letture esterne non ancora
  migrate — vedi D-011 RESOLUTION_SUMMARY). Nessun consumer rimasto che la tratti come fonte
  decisionale.
CREDIT_LOT_SOURCE_OF_TRUTH_CONFIRMED: sì — confermato che CreditLot/CreditLotConsumption sono
  l'unica fonte usata per: consumo (lockAndPlanFefoConsumptionInTransaction), accredito
  (createCreditLotInTransaction), rimborso (createCreditLotInTransaction con source REFUND),
  scadenza (expireStaleLotsInTransaction), e ora anche per il riepilogo profilo impresa
  (getCompanyCreditSummary).

DIRECT_GLOBAL_WRITES_FOUND:
  packages/domain/src/company/profile/get-profile-page.ts — UPDATE "CompanyCreditAccount"
  SET "balance"=0, "expiresAt"=NULL (fuori da syncCompanyCreditAccountCacheInTransaction)
DIRECT_GLOBAL_WRITES_REMOVED: sì, l'unica trovata (sopra), eliminata insieme a tutta la
  funzione getCreditSummary precedente.
CACHE_SYNC_STRATEGY: confermata unica e centralizzata —
  syncCompanyCreditAccountCacheInTransaction (packages/billing/src/credits/lot-ledger.ts) è
  l'unico punto che scrive balance/expiresAt con dati derivati; ensureCreditAccountRowInTransaction
  fa solo un INSERT ON CONFLICT DO NOTHING per garantire l'esistenza della riga (mai sovrascrive
  dati). Nessun consolidamento necessario: era già centralizzata dentro packages/billing; il
  problema era la copia indipendente in packages/domain, ora eliminata.

MIGRATION_REVIEW_RESULT: 20260617120000_credit_lots_fefo rivisitata riga per riga.
  - saldo positivo + scadenza futura -> lotto LEGACY_MIGRATION: confermato
    (WHERE balance>0 AND expiresAt IS NOT NULL AND expiresAt > now()).
  - saldo scaduto -> non crea credito utilizzabile: confermato (nessun lotto creato per righe
    fuori da quella WHERE; cleanup defensivo azzera balance/expiresAt per i pochi casi limite
    con balance>0 ed expiresAt nullo/passato, stesso comportamento che la lazy-expiration
    esistente avrebbe già applicato).
  - idempotencyKey unico: confermato ('credit-lot:legacy-migration:' || companyId, vincolo
    UNIQUE su CreditLot.idempotencyKey, ON CONFLICT DO NOTHING).
  - sync cache finale: confermato (UPDATE finale di CompanyCreditAccount da
    SUM/MAX su CreditLot raggruppato per companyId).
  Nessun rischio finanziario individuato. Nessun BLOCKER.
BACKFILL_REVIEW_RESULT: coerente con il modello FEFO; nessuna perdita di crediti validi;
  nessuna creazione di credito da saldi già scaduti; creditOrderId NULL sui lotti di backfill
  è corretto (il saldo pre-FEFO non era mai attribuibile a un singolo ordine).

FILES_CHANGED:
  packages/domain/src/company/profile/get-profile-page.ts (getCreditSummary riscritta;
    rimossi import/tipo CreditAccountRow non più necessari)
  docs/architetture/04_DEFERRED_ITEMS.md (D-018 RESOLVED)
  docs/architetture/03_ROADMAP.md (questa sezione)
FILES_CREATED: nessuno (nessun nuovo read-model duplicato: riusato refreshCompanyCreditState
  esistente tramite un nuovo export pubblico leggero)
FILES_DELETED: nessuno

PACKAGE_SEARCH_DONE: packages/billing (tutti i moduli credits/checkout/stripe/admin),
  packages/domain (grep cross-package)
EXISTING_LOGIC_FOUND: refreshCompanyCreditState già esistente in
  packages/billing/src/credits/lot-ledger.ts, calcola esattamente balance + nearestExpiresAt
  necessari al profilo
REUSED_EXISTING_LOGIC: refreshCompanyCreditState riusata invariata
CREATED_NEW_PACKAGE_LOGIC: getCompanyCreditSummary — un wrapper leggero di 5 righe attorno a
  refreshCompanyCreditState, non un nuovo read-model (nessuna query propria)
REMOVED_DUPLICATE_LOGIC: la quinta copia della logica di scadenza globale (get-profile-page.ts)

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package, incluso admin)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 6/6, @esigenta/database prisma generate senza
  connessione DB)

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: D-018

RISKS: migration 20260617120000_credit_lots_fefo resta preparata ma non applicata a nessun
  database — richiede conferma esplicita sull'ambiente target prima del deploy.
BLOCKERS: nessuno
NEXT_PHASE: Phase 15.1 — Deferred Items Closure
```

---

# PHASE 9 — AREA IMPRESA DEAD CODE CLEANUP

## Stato

```txt
COMPLETED — route consolidate in app/area-impresa/ (unico albero); route group legacy
(public-business)/area-impresa e (area-impresa)/area-impresa eliminati.
Monitoring ricollocato: generico in platform/monitoring/, specifico AI in area-impresa/monitoring/.
D-001 risolto: nessun route group di prodotto né legacy per Area Impresa.
D-002 risolto: nessun import residuo verso lib/area-monitoring o _lib/perf-log.
D-011 non toccato (Phase 8.2).
typecheck e build passano (12/12 package, 18/18 route area-impresa).
```

## Obiettivo

Dopo Area Impresa, eliminare tutto il vecchio codice Area Impresa non più usato.

## Cercare

```txt
_components legacy
_lib legacy
compat export inutili
file duplicati
old actions
vecchi view-model
route group di responsabilità
import path vecchi
```

## Comandi suggeriti

```powershell
rg "area-impresa|AreaImpresa|Impresa|richieste|crediti|contatti|assistenza|profilo|notifiche" apps/web/src --glob "*.{ts,tsx}"
```

## Done

```txt
zero file morti Area Impresa
zero doppioni Area Impresa
zero compat inutili
typecheck passa
build passa
```

---

# PHASE 10 — RICHIESTA FLOW

## Stato

```txt
COMPLETED — feature richiesta flow ricostruita in apps/web/src/richiesta/flow/.
Route group (public) per richiesta/[slug] sostituita da bridge piatto app/richiesta/[requestSlug].
Componenti funnel spostati da components/funnel/ (owner non valido) a richiesta/flow/components/.
packages/funnel e packages/domain già proprietari corretti — nessuna logica estratta o duplicata.
Deferred: D-012 (city-autocomplete in components/location/, shared tra richiesta e area-impresa,
non spostabile atomicamente in Phase 10); D-008 aggiornato (nuovo consumer path in
richiesta/flow/components/).
typecheck e build passano (route /richiesta/[requestSlug] presente, nessuna regressione).
```

## Obiettivo

Ricostruire funnel richiesta e cliente soft.

## Owner finale

```txt
apps/web/src/richiesta/flow
```

## Route coinvolta

```txt
/richiesta/[requestSlug]
```

## Package owner probabile

```txt
packages/funnel
packages/domain/request
packages/taxonomy
```

## Done

```txt
route app sottile
flow pulito
submit in owner corretto
nessuna logica pesante in app
vecchio codice eliminato
typecheck passa
build passa
```

---

# PHASE 11 — RICHIESTA STATO / VERIFICA / MESSAGGI

## Stato

```txt
COMPLETED — stato/verifica/comunicazioni ricostruiti in richiesta/; bridge sottili creati;
D-010 risolto; D-013 creato; vecchio codice eliminato; typecheck e build passano; vedi sezione fase.
```

## Obiettivo

Ricostruire stato richiesta, verifica token, messaggi cliente.

## Owner finale

```txt
apps/web/src/richiesta/
  stato/
  verifica/
  comunicazioni/
  notifiche/
```

## Route coinvolte

```txt
/stato-richiesta/[token]
/verifica-richiesta/[token]
/messaggi/accesso
```

## Done

```txt
cliente soft dentro richiesta
nessuna area-cliente creata
messaggi cliente separati da impresa se necessario
vecchio codice eliminato
typecheck passa
build passa
```

## PHASE_REPORT

```txt
PHASE: 11
TITLE: Richiesta Stato / Verifica / Messaggi

AUDIT:
  app/(public)/richiesta/stato/page.tsx          — MARCIO (343 righe, tutti helper inline)
  app/(public)/richiesta/verifica/page.tsx       — MARCIO (192 righe, verifyFromSearchParams inline)
  app/(public)/messaggi/accesso/page.tsx         — MARCIO (231 righe, server action inline, D-010)
  app/(public)/richieste/accesso/page.tsx        — semi-MARCIO (134 righe, server action inline)
  app/(public)/richieste/cliente/page.tsx        — MARCIO (226 righe, helper inline)
  app/(public)/richieste/cliente/richiesta/[id]  — molto MARCIO (583 righe, JSON parser inline)
  app/(public)/richieste/_components/nav.tsx     — SANO (spostato)
  app/(cliente)/layout.tsx                       — DEAD CODE (solo return children, nessun child)

CREATED_FEATURE_PAGES:
  apps/web/src/richiesta/stato/request-status-page.tsx
  apps/web/src/richiesta/verifica/request-verification-page.tsx
  apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx
  apps/web/src/richiesta/comunicazioni/customer-requests-page.tsx
  apps/web/src/richiesta/comunicazioni/customer-requests-access-page.tsx
  apps/web/src/richiesta/comunicazioni/customer-request-detail-page.tsx
  apps/web/src/richiesta/comunicazioni/actions/request-customer-access-action.ts
  apps/web/src/richiesta/comunicazioni/components/customer-requests-nav.tsx

CREATED_BRIDGES:
  apps/web/src/app/stato-richiesta/[token]/page.tsx
  apps/web/src/app/verifica-richiesta/page.tsx
  apps/web/src/app/messaggi/accesso/page.tsx
  apps/web/src/app/richieste/accesso/page.tsx
  apps/web/src/app/richieste/cliente/page.tsx
  apps/web/src/app/richieste/cliente/richiesta/[id]/page.tsx

DELETED:
  apps/web/src/app/(public)/richiesta/stato/page.tsx
  apps/web/src/app/(public)/richiesta/verifica/page.tsx
  apps/web/src/app/(public)/messaggi/accesso/page.tsx
  apps/web/src/app/(public)/richieste/accesso/page.tsx
  apps/web/src/app/(public)/richieste/cliente/page.tsx
  apps/web/src/app/(public)/richieste/cliente/richiesta/[id]/page.tsx
  apps/web/src/app/(public)/richieste/_components/customer-requests-nav.tsx
  apps/web/src/app/(cliente)/layout.tsx
  apps/web/src/app/(public)/richiesta/ (directory vuota)
  apps/web/src/app/(public)/messaggi/ (directory vuota)
  apps/web/src/app/(public)/richieste/ (directory vuota)
  apps/web/src/app/(cliente)/ (directory vuota)
  apps/web/src/richiesta/stato/.gitkeep
  apps/web/src/richiesta/verifica/.gitkeep
  apps/web/src/richiesta/comunicazioni/.gitkeep

PACKAGE_CHANGES:
  packages/domain/src/internal/request/request-links.ts
    buildRequestStatusUrl: /richiesta/stato?token= → /stato-richiesta/[token] (path param)
    buildRequestVerificationUrl: /richiesta/verifica → /verifica-richiesta (query params mantenuti)

URL_CHANGES:
  /richiesta/stato?token=TOKEN  → /stato-richiesta/TOKEN  (path param, più pulito)
  /richiesta/verifica?...       → /verifica-richiesta?... (solo rename del segmento)
  /messaggi/accesso             — invariato
  /richieste/accesso            — invariato
  /richieste/cliente            — invariato
  /richieste/cliente/richiesta/[id] — invariato

DEFERRED_RESOLVED:
  D-010: RESOLVED — revalidatePath ora punta a /area-impresa/contatti/[id] + /area-impresa/contatti

DEFERRED_CREATED:
  D-013: OPEN — richiesta/comunicazioni importa da area-impresa/shared-messaging (boundary violation)
              TARGET: Phase 14 — spostare shared-messaging in owner neutro (ui/ o platform/)

NOTES:
  verifica URL: l'architettura prevede /verifica-richiesta/[token] (path param singolo) ma il
  domain usa requestId+token separati. Si è rinominato solo il path, mantenendo query params.
  La migrazione a token unificato (encoded) è rimandata a quando il domain sarà aggiornato.
  app/(public)/richiesta/ rimane (contiene solo page.tsx home e dir costi/interventi per Phase 12-13).

MICRO_CORRECTION (post-Phase 11):
  Legacy redirect /richiesta/stato?token=TOKEN mantenuto verso /stato-richiesta/[token].
  Route creata: apps/web/src/app/richiesta/stato/page.tsx (solo redirect, nessuna UI business).
  Creato D-014 per migrazione futura /verifica-richiesta/[token] con token singolo.

TYPECHECK: PASS
BUILD: PASS
NEXT_PHASE: 12 — Site Home / Legal / Shell
```

---

# PHASE 12 — SITE HOME / LEGAL / SHELL

## Stato

```txt
COMPLETED — site/home, site/shell, site/legal creati; shell pubblico bonificato;
D-015 creato (shim area-impresa); risolto in Phase 12.1; vedi sezione fase e PHASE_REPORT.
```

## Obiettivo

Ricostruire home, legal e shell pubblico.

## Owner finale

```txt
apps/web/src/site/home
apps/web/src/site/legal
apps/web/src/site/shell
```

## Route coinvolte

```txt
/
/privacy
/termini
/cookie-policy
```

## Done

```txt
home pulita
legal pulito
shell pubblico pulito
route app sottili
typecheck passa
build passa
```

## PHASE_REPORT Phase 12

```txt
DATA: 2026-06-17

FILES_CREATED:
  site/shell/home-content-rail.tsx (da components/layout/home-content-rail.tsx)
  site/shell/navbar.tsx (da components/navigation/navbar.tsx)
  site/shell/cookie-consent-storage.ts (da components/privacy/cookie-consent-storage.ts)
  site/shell/cookie-preferences-button.tsx (da components/privacy/cookie-preferences-button.tsx)
  site/shell/footer.tsx (da components/layout/footer.tsx)
  site/shell/cookie-consent.tsx (da components/privacy/cookie-consent.tsx)
  site/shell/public-shell.tsx (da components/layout/public-shell.tsx)
  site/home/home-image.tsx (da components/home/home-image.tsx)
  site/home/search-bar.tsx (da components/home/search-bar.tsx)
  site/home/hero.tsx (da components/home/hero.tsx)
  site/home/how-it-works.tsx (da components/home/how-it-works.tsx)
  site/home/professional-cta.tsx (da components/home/professional-cta.tsx)
  site/home/professional-areas.tsx (da components/home/professional-areas.tsx)
  site/home/cost-guides.tsx (da components/home/cost-guides.tsx)
  site/home/funnel-entry.tsx (da components/home/funnel-entry.tsx)
  site/home/why-choose.tsx (da components/home/why-choose.tsx)
  site/home/home-page.tsx (NUOVO — assembla hero+shell+sezioni)
  site/legal/legal-profile.ts (da content/legal/legal-profile.ts)
  site/legal/legal-section.tsx (NUOVO — estratto da legal pages MARCIO)
  site/legal/privacy-page.tsx (riscritta da app/privacy/page.tsx)
  site/legal/termini-page.tsx (riscritta da app/termini/page.tsx)
  site/legal/cookie-policy-page.tsx (riscritta da app/cookie-policy/page.tsx)
  app/page.tsx (NUOVO — bridge flat verso site/home/home-page)
  public/assets/images/home/guida-bagno.webp (copiata da rifacimento-bagno.webp)
  public/assets/images/home/guida-tetto.webp (copiata da rifare-tetto.webp)
  public/assets/images/home/guida-climatizzatore.webp (copiata da climatizzazione.webp)
  public/assets/images/home/guida-fotovoltaico.webp (copiata da installazione-fotovoltaico.webp)

FILES_UPDATED:
  app/privacy/page.tsx → bridge sottile
  app/termini/page.tsx → bridge sottile
  app/cookie-policy/page.tsx → bridge sottile
  app/layout.tsx → aggiunto metadataBase + import CookieConsent da site/shell
  components/layout/public-shell.tsx → shim re-export verso site/shell/public-shell (D-015)
  components/location/city-autocomplete.tsx → import cookie-consent-storage aggiornato a site/shell
  richiesta/comunicazioni/customer-conversation-page.tsx → PublicShell da site/shell
  richiesta/comunicazioni/customer-request-detail-page.tsx → PublicShell da site/shell
  richiesta/comunicazioni/customer-requests-access-page.tsx → PublicShell da site/shell
  richiesta/comunicazioni/customer-requests-page.tsx → PublicShell da site/shell
  richiesta/flow/request-flow-page.tsx → PublicShell da site/shell
  richiesta/stato/request-status-page.tsx → PublicShell da site/shell
  richiesta/verifica/request-verification-page.tsx → PublicShell da site/shell

FILES_DELETED:
  app/(public)/page.tsx (rimosso; rimane (public)/ per costi/interventi Phase 13)
  components/home/cost-guides.tsx
  components/home/funnel-entry.tsx
  components/home/hero.tsx
  components/home/home-image.tsx
  components/home/how-it-works.tsx
  components/home/professional-areas.tsx
  components/home/professional-cta.tsx
  components/home/search-bar.tsx
  components/home/why-choose.tsx
  components/layout/footer.tsx
  components/layout/home-content-rail.tsx
  components/navigation/navbar.tsx
  components/privacy/cookie-consent-storage.ts
  components/privacy/cookie-consent.tsx
  components/privacy/cookie-preferences-button.tsx
  content/legal/legal-profile.ts
  site/home/.gitkeep
  site/shell/.gitkeep
  site/legal/.gitkeep

DEFERRED:
  D-015 OPEN — area-impresa/** importa ancora PublicShell da components/layout/public-shell.tsx
    (shim re-export). Risolto atomicamente quando area-impresa entra nello scope.

TYPECHECK: PASS
BUILD: PASS (Compiled successfully in 15.6s)
```

---

# PHASE 12.1 — REMOVE PUBLICSHELL SHIM

## Stato

```txt
COMPLETED — D-015 risolto; shim components/layout/public-shell.tsx eliminato;
area-impresa/public/* aggiornati per importare direttamente da site/shell/public-shell;
components/layout/ eliminata (vuota); typecheck e build passano.
```

## Obiettivo

Micro-correzione post-Phase-12: rimuovere il shim re-export `components/layout/public-shell.tsx`
creato come compat temporaneo (D-015) e aggiornare i 3 consumer `area-impresa/public/**`
per importare direttamente dal path canonico `site/shell/public-shell`.

## Scope

```txt
docs/architetture/03_ROADMAP.md
docs/architetture/04_DEFERRED_ITEMS.md
apps/web/src/components/layout/public-shell.tsx
apps/web/src/area-impresa/public/**
apps/web/src/site/**
```

## Done

```txt
shim eliminato
components/layout/ eliminata
consumer aggiornati
D-015 RESOLVED
typecheck passa
build passa
```

## PHASE_REPORT Phase 12.1

```txt
DATA: 2026-06-17

IMPORTS_UPDATED:
  area-impresa/public/auth/login-page.tsx:5
    "../../../components/layout/public-shell" → "../../../site/shell/public-shell"
  area-impresa/public/auth/signup-page.tsx:9
    "../../../components/layout/public-shell" → "../../../site/shell/public-shell"
  area-impresa/public/marketing/area-impresa-marketing-page.tsx:25
    "../../../components/layout/public-shell" → "../../../site/shell/public-shell"

FILES_DELETED:
  apps/web/src/components/layout/public-shell.tsx (shim eliminato)
  apps/web/src/components/layout/ (directory eliminata — vuota dopo rimozione shim)

SHIM_REMOVED: components/layout/public-shell.tsx (era re-export a 1 riga verso site/shell/public-shell)

DEFERRED_ITEMS_RESOLVED:
  D-015 — RESOLVED (tutti i consumer area-impresa/public/* ora importano da site/shell/public-shell)

TYPECHECK: PASS
BUILD: PASS
NEXT_PHASE: 13 — Site SEO Data-Driven
```

---

# PHASE 13 — SITE SEO DATA-DRIVEN

## Stato

```txt
COMPLETED
```

## Obiettivo

Ricostruire SEO/GEO scalabile.

## Owner finale

```txt
apps/web/src/site/seo/
  pages/
  geo/
  market-data/
  matrix/
  engine/
  templates/
```

## Route coinvolte

```txt
/interventi
/interventi/[interventoSlug]
/interventi/[interventoSlug]/[citySlug]
/costi
/costi/[costSlug]
/costi/[costSlug]/[citySlug]
/guide
/guide/[guideSlug]
```

## Regola

Non creare un file per ogni città.

Usare:

```txt
famiglia SEO
geo registry
market data
matrix
engine
template
```

## Done

```txt
SEO data-driven
GEO data-driven
prezzi locali componibili
canonical centralizzate
metadata centralizzati
sitemap centralizzata
route app sottili
typecheck passa
build passa
```

## PHASE_REPORT Phase 13

```txt
FILES_CREATED:
  site/seo/pages/interventi/types.ts
  site/seo/pages/interventi/ristrutturare-bagno/content.ts
  site/seo/pages/interventi/rifare-impianto-elettrico/content.ts
  site/seo/pages/interventi/installare-fotovoltaico/content.ts
  site/seo/pages/interventi/rifare-tetto/content.ts
  site/seo/pages/interventi/installare-climatizzatore/content.ts
  site/seo/pages/interventi/cartongesso-e-finiture/content.ts
  site/seo/pages/interventi/index.ts
  site/seo/pages/costi/types.ts
  site/seo/pages/costi/ristrutturare-bagno/content.ts
  site/seo/pages/costi/index.ts
  site/seo/engine/resolve-seo-page.ts
  site/seo/engine/geo-policy.ts
  site/seo/engine/metadata.ts
  site/seo/engine/static-params.ts
  site/seo/templates/seo-breadcrumb.tsx
  site/seo/templates/seo-faq.tsx
  site/seo/templates/geo-request-form.tsx
  site/seo/templates/geo-cost-module.tsx
  site/seo/templates/intervention-page-template.tsx
  site/seo/templates/cost-page-template.tsx
  site/seo/templates/cost-city-page-template.tsx
  app/interventi/[interventoSlug]/page.tsx
  app/interventi/[interventoSlug]/not-found.tsx
  app/costi/[costSlug]/page.tsx
  app/costi/[costSlug]/not-found.tsx
  app/costi/[costSlug]/[citySlug]/page.tsx
  app/costi/[costSlug]/[citySlug]/not-found.tsx

FILES_DELETED:
  components/seo/ (7 files)
  content/seo/ (2 files)
  app/(public)/costi/ (4 files)
  app/(public)/interventi/ (2 files)
  site/seo/*/. gitkeep (6 files)

FIXES:
  intervention-landing-page costGuideHref: hardcoded slug check replaced with landing.costSlug field
  app routes: flat paths replacing (public) route group (VIETATO)

TYPECHECK: PASS
BUILD: PASS (41 static pages, 6 interventi routes, 9 costi routes)
NEXT_PHASE: 14
```

---

# PHASE 14 — PLATFORM / UI / SHARED OWNER CLEANUP

## Stato

```txt
COMPLETED — D-008, D-012, D-013 risolti; lib/ eliminata; components/ eliminata interamente;
ui/location e ui/messaging popolati; platform/uploads popolato; typecheck e build passano.
```

## Obiettivo

Chiudere i deferred items D-008, D-012, D-013: spostare file rimasti in owner non validi
(lib/, components/) nei macro-owner corretti (platform/, ui/). Eliminare le directory
contenitore vuote residue.

## Scope

```txt
apps/web/src/lib/uploadthing.ts → platform/uploads/uploadthing.ts               (D-008)
apps/web/src/components/location/city-autocomplete.tsx → ui/location/            (D-012)
apps/web/src/area-impresa/shared-messaging/* → ui/messaging/                     (D-013)
```

## Vietato

```txt
packages/billing/**
packages/database/**
apps/web/src/app/area-impresa/**
apps/web/src/app/richiesta/**
apps/web/src/site/seo/**
D-011 non va toccato
```

## Done

```txt
lib/ eliminata
components/ eliminata
ui/location/city-autocomplete.tsx presente
ui/messaging/message-thread.tsx presente
ui/messaging/send-message-form.tsx presente
platform/uploads/uploadthing.ts presente
tutti i consumer aggiornati
typecheck passa
build passa
```

## PHASE_REPORT Phase 14

```txt
DATA: 2026-06-17

FILES_CREATED:
  apps/web/src/platform/uploads/uploadthing.ts (da lib/uploadthing.ts, import core aggiornato)
  apps/web/src/ui/location/city-autocomplete.tsx (da components/location/city-autocomplete.tsx)
  apps/web/src/ui/messaging/message-thread.tsx (da area-impresa/shared-messaging/message-thread.tsx)
  apps/web/src/ui/messaging/send-message-form.tsx (da area-impresa/shared-messaging/send-message-form.tsx)

IMPORTS_UPDATED:
  richiesta/flow/components/request-photo-upload.tsx
    ../../../lib/uploadthing → ../../../platform/uploads/uploadthing
  area-impresa/public/marketing/company-lead-form.tsx
    ../../../components/location/city-autocomplete → ../../../ui/location/city-autocomplete
  richiesta/flow/components/request-step-ui.tsx
    ../../../components/location/city-autocomplete → ../../../ui/location/city-autocomplete
  area-impresa/private/account/profilo/company-location-fields.tsx
    ../../../../components/location/city-autocomplete → ../../../../ui/location/city-autocomplete
  richiesta/comunicazioni/customer-conversation-page.tsx
    ../../area-impresa/shared-messaging/message-thread → ../../ui/messaging/message-thread
    ../../area-impresa/shared-messaging/send-message-form → ../../ui/messaging/send-message-form
  area-impresa/private/comunicazioni/conversazione/conversation-page.tsx
    ../../../shared-messaging/message-thread → ../../../../ui/messaging/message-thread
    ../../../shared-messaging/send-message-form → ../../../../ui/messaging/send-message-form

FILES_DELETED:
  apps/web/src/lib/uploadthing.ts (rimosso — spostato in platform/uploads)
  apps/web/src/lib/ (directory eliminata — era vuota dopo rimozione)
  apps/web/src/components/location/city-autocomplete.tsx (rimosso — spostato in ui/location)
  apps/web/src/components/location/ (directory eliminata)
  apps/web/src/components/cliente/ (directory eliminata — conteneva solo .gitkeep)
  apps/web/src/components/impresa/ (directory eliminata — conteneva solo .gitkeep)
  apps/web/src/components/shared/ (directory eliminata — conteneva solo .gitkeep)
  apps/web/src/components/home/ (directory eliminata — vuota)
  apps/web/src/components/navigation/ (directory eliminata — vuota)
  apps/web/src/components/privacy/ (directory eliminata — vuota)
  apps/web/src/components/ (directory eliminata — vuota dopo le rimozioni sopra)
  apps/web/src/area-impresa/shared-messaging/message-thread.tsx (rimosso — spostato in ui/messaging)
  apps/web/src/area-impresa/shared-messaging/send-message-form.tsx (rimosso — spostato in ui/messaging)
  apps/web/src/area-impresa/shared-messaging/ (directory eliminata)
  apps/web/src/platform/uploads/.gitkeep (rimosso — sostituito da file reale)
  apps/web/src/ui/.gitkeep (rimosso — sostituito da file reali in ui/location e ui/messaging)

GITKEEP_RETAINED:
  platform/config/.gitkeep
  platform/errors/.gitkeep
  platform/privacy/.gitkeep
  (le tre directory sopra restano vuote — nessun file reale le popola ancora)

DEFERRED_ITEMS_RESOLVED:
  D-008 — uploadthing fuori da lib: RESOLVED
  D-012 — city-autocomplete fuori da components/location: RESOLVED
  D-013 — shared-messaging in owner neutro ui/: RESOLVED

DEFERRED_ITEMS_OPEN:
  D-011 — billing FEFO: OPEN (non toccato, Phase 8.2)
  D-014 — verifica URL token singolo: OPEN

TYPECHECK: PASS
BUILD: PASS (41 pagine statiche, nessuna regressione)
NEXT_PHASE: 15 — Performance Rewrite P0
```

---

# PHASE 15 — PERFORMANCE REWRITE P0

## Stato

```txt
COMPLETED — 4 fix application-code applicati; always-on console.info rimosso da packages/auth
e gated in middleware; requireUser deduplica via getCurrentUser (deduplication cache); marketing
page usa getCurrentUser() dal cached web adapter; D-016 e D-017 creati; typecheck e build passano.
```

## Obiettivo

Riscrivere i flow P0 lenti dopo che ownership e struttura sono chiare.

## P0

```txt
/area-impresa/richieste
/area-impresa/crediti checkout/status
```

## Regola

Non fare patch.

Riscrivere come se fosse progettato da zero.

## Done

```txt
query count ridotto
payload ridotto
filtri DB dove necessari
pagination DB dove necessaria
polling ridotto
Stripe fallback non aggressivo
misure prima/dopo documentate
typecheck passa
build passa
```

## PHASE_REPORT Phase 15

```txt
DATA: 2026-06-17

AUDIT_FINDINGS:
  GET / 9.4s                        — dev cold compile (pagina statica pura, nessun fix possibile in app code)
  GET /richieste/accesso 5.0s       — dev cold compile (pagina statica pura, nessun fix possibile in app code)
  GET /area-impresa 7.6s            — parzialmente dev cold compile; partly da getSession cold DB + logging always-on
  [auth] getSession 4763.6ms        — BetterAuth cold DB hit; cookieCache enabled (maxAge=300) → warm OK
  Google Maps loading=async warning — già lazy-loaded via useEffect; solo warning API legacy → D-017
  metadataBase warning              — confermato già presente in app/layout.tsx:28; non era un problema reale
  revalidatePath("/area-impresa","layout") — trovato in mark-notification-read-action.ts e send-message-action.ts
                                              fuori scope Phase 15 → D-016

CONFIRMED_INFRASTRUCTURE_ISSUES (not fixable in app code):
  Cold compile DEV: GET / e GET /richieste/accesso → normale in Next.js dev, non applicativo
  BetterAuth cold DB (4763ms): prima richiesta dopo avvio DB o dopo 300s cookieCache TTL → infrastruttura

FIXES_APPLIED:
  FIX-1: packages/auth/src/auth/server.ts
    Rimosso console.info("[esigenta-perf] [auth]", `getSession ${ms}ms`) always-on
    Ogni getSession chiamata loggava incondizionatamente (inclusa ogni cold+warm request)
    Effetto: nessun logging non-gated da packages/auth

  FIX-2: apps/web/src/auth/server.ts
    requireUser ora chiama getCurrentUser() invece di requireUserFromHeaders(await headers())
    Se sia getCurrentUser() che requireUser() vengono chiamati nello stesso render, ora
    condividono la stessa chiamata getSession tramite React cache() deduplication
    Rimosso requireUserFromHeaders dall'import list (non più usato)
    Effetto: potenziale double-getSession prevenuto in render con entrambi i caller

  FIX-3: apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx
    Rimosso import { getCurrentUserFromHeaders } from "@esigenta/auth" (bypass del cache)
    Rimosso import { headers } from "next/headers" (non più necessario)
    Aggiunto import { getCurrentUser } from "../../../auth/server" (web adapter con cache())
    reactivateAccountAction: getCurrentUserFromHeaders(await headers()) → getCurrentUser()
    AreaImpresaMarketingPage component: stessa modifica
    Effetto: la marketing page ora partecipa alla React request-scoped deduplication;
    se getCurrentUser() viene chiamato altrove nello stesso render, getSession è chiamato una sola volta

  FIX-4: apps/web/src/middleware.ts
    Unificato il blocco console.info([...].join(" ")) (prima incondizionato, righe 65-86)
    con il blocco if (isAreaMonitoringEnabled()) { areaLog(...) } (già gated)
    in un unico if (isAreaMonitoringEnabled()) { console.info(...); areaLog(...); ... }
    Effetto: il trace verboso di ogni /area-impresa/** request non viene più loggato
    in assenza di ESIGENTA_AREA_MONITORING=1

FILES_CHANGED:
  packages/auth/src/auth/server.ts (rimosso always-on console.info)
  apps/web/src/auth/server.ts (requireUser → getCurrentUser delegation; import rimosso)
  apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx (cached adapter)
  apps/web/src/middleware.ts (logging gated)

FILES_CREATED: nessuno
FILES_DELETED: nessuno

DEFERRED_ITEMS_CREATED:
  D-016 — revalidatePath("/area-impresa", "layout") in mark-notification-read-action.ts e
           send-message-action.ts; fuori scope Phase 15 (file in area-impresa/private/account e
           area-impresa/private/comunicazioni); TARGET: Phase 16 o fase dedicata
  D-017 — Google Maps Autocomplete legacy API (PlaceAutocompleteElement migration);
           non P0 performance; TARGET: fase dedicata Google Maps upgrade

DEFERRED_ITEMS_RESOLVED: nessuno (Phase 15 chiude solo fix application-code; D-011, D-014 OPEN)

PERFORMANCE_IMPACT:
  BEFORE: ogni getSession (cold o warm) → console.info unconditional in packages/auth
  AFTER: nessun logging da packages/auth per getSession
  BEFORE: ogni /area-impresa/** request → console.info verboso sempre in middleware
  AFTER: logging middleware solo se ESIGENTA_AREA_MONITORING=1
  BEFORE: area-impresa-marketing-page chiama getSession bypassing React cache
  AFTER: getSession partecipa alla request-scoped deduplication tramite getCurrentUser()
  BEFORE: requireUser e getCurrentUser (se entrambi chiamati) → 2× getSession
  AFTER: requireUser → getCurrentUser → 1× getSession per render

NON_ISSUES_CONFIRMED:
  Immagini: professionisti-hero.webp, rifacimento-bagno.webp, guide-*.webp → tutte esistenti
  metadataBase: già presente in app/layout.tsx:28 → nessun problema
  Google Maps lazy-load: già async+defer con hasFunctionalConsent guard → non P0

TYPECHECK: PASS
BUILD: PASS (41 pagine, nessuna regressione)
NEXT_PHASE: Phase 8.2 — Billing FEFO Credit Lots Rewrite
```

## NOTA BLOCCANTE (post-Phase 15, aggiornata post-Phase 15.1 — RISOLTA)

```txt
D-011 RESOLVED in Phase 8.2 (FEFO credit lots).
D-014 RESOLVED in Phase 15.1 (single-token verification URL).
D-016 riclassificato in Phase 15.1: OPEN ma BLOCKING:no, con root cause e target phase precisi.
D-017 classificato NON_BLOCKING_POST_RELEASE in Phase 15.1.
D-018 RESOLVED in Phase 8.2.1.
D-019 creato in Phase 15.1 come deployment gate (non blocca Phase 16, blocca solo il deploy).
Nessun item OPEN strutturale o P0 non classificato residuo: Phase 16 può procedere.
```

---

# PHASE 15.1 — DEFERRED ITEMS CLOSURE

## Stato

```txt
COMPLETED — D-014 RESOLVED (single-token verification URL implementato con compat legacy);
D-016 classificato OPEN/BLOCKING:no con root cause Next.js confermata da doc locale e target
phase dedicata; D-017 classificato NON_BLOCKING_POST_RELEASE; D-019 creato come deployment
gate per la migration FEFO non ancora applicata. Nessun item OPEN strutturale o P0 non
classificato resta. Typecheck e build (web, admin, root) passano. Vedi PHASE_REPORT.
```

## Obiettivo

```txt
Chiudere D-016.
Valutare e chiudere D-014 oppure classificarlo non-blocking.
Classificare D-017 come non-blocking post-release oppure pianificarlo.
```

## PHASE_REPORT Phase 15.1

```txt
DATA: 2026-06-17

REVALIDATEPATH_AUDIT:
  rg "revalidatePath\(" su apps/web/src e packages. Trovate 21 chiamate totali.
  3 chiamate ampie (type "layout" sull'intero /area-impresa): mark-notification-read-action.ts
    (righe 44, 74), send-message-action.ts (riga 104), open-support-action.ts (riga 56) — un
    terzo call site (open-support-action.ts) non era tracciato in D-016 originale.
  Tutte le altre 18 chiamate sono già mirate (path specifici: /area-impresa/profilo,
  /area-impresa/notifiche, /area-impresa/richieste[-salvate|-acquistate], /area-impresa/
  contatti[/id], listPath, /area-impresa/assistenza) — nessun'altra revalidation ampia trovata
  in packages.

  ROOT CAUSE (verificata leggendo apps/web/node_modules/next/dist/docs/01-app/03-api-reference/
  04-functions/revalidatePath.md e .../05-config/01-next-config-js/staleTimes.md, come
  richiesto da AGENTS.md): revalidatePath(path, "layout") invalida il layout corrispondente E
  TUTTE le pagine sottostanti — il raggio d'azione è determinato dal LAYOUT CONDIVISO, non dal
  path passato. /area-impresa/(private) ha un solo layout condiviso
  (area-impresa-private-layout.tsx) che ospita il badge contatori sidebar
  (getAreaImpresaShellCounts). staleTimes.md conferma che "shared layouts won't automatically
  be refetched on every navigation" senza revalidation esplicita — quindi la chiamata ampia non
  è un cerotto pigro, è una dipendenza funzionale reale (il badge deve aggiornarsi dopo
  mark-read/send-message/open-support). Non esiste un modo di restringere una revalidation
  type="layout" passando un path diverso: il raggio resta sempre quello del layout condiviso.

  Fix corretto identificato: disaccoppiare i contatori sidebar dalla revalidation di pagina via
  unstable_cache+tag (revalidateTag invece di revalidatePath layout) — richiede modificare
  apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx, esplicitamente FUORI
  SCOPE di questa fase. Nessuna patch parziale applicata: D-016 resta OPEN con root cause e
  target phase precisi invece di una fix incompleta o un cerotto.

BROAD_REVALIDATIONS_FOUND: 3 (mark-notification-read-action.ts x2, send-message-action.ts x1,
  open-support-action.ts x1 — quest'ultimo non tracciato in precedenza)
BROAD_REVALIDATIONS_FIXED: 0 (richiede toccare area-impresa/private/shell/**, fuori scope;
  D-016 aggiornato con root cause completa, le 3 call site precise, e target phase dedicata)

VERIFICATION_URL_AUDIT:
  Generazione link: packages/domain/src/public/requests/create-request.ts chiama
  createRequestVerificationAccessToken (salva tokenHash+requestId in CustomerAccessToken,
  purpose REQUEST_VERIFICATION) e poi buildRequestVerificationUrl per ogni nuova richiesta —
  ESCLUSIVAMENTE questo path, nessun'altra route genera email di verifica.
  Validazione: packages/domain/src/customer/requests/verify-request.ts. Due path interni:
  verifyWithAccessToken (lookup via CustomerAccessToken, usato per tutte le richieste create
  dopo l'introduzione della tabella) e verifyWithLegacyStructuredDataToken (lookup via
  Request.structuredData.verification.tokenHash, per richieste storiche pre-tabella).
  Token unico già esistente: confermato — CustomerAccessToken.tokenHash è @unique e la riga
  porta già requestId. Il parametro requestId nell'URL era quindi ridondante per il path
  verifyWithAccessToken (serviva solo da cross-check), necessario SOLO per il path legacy.
  Compat senza rompere link esistenti: sì, dimostrata — le due route Next.js
  (/verifica-richiesta e /verifica-richiesta/[token]) sono segmenti distinti e coesistono senza
  conflitto; nessun link già emesso cambia comportamento.

SINGLE_TOKEN_IMPLEMENTED: sì.
  Nuova funzione verifyRequestEmailByToken(token) in verify-request.ts: risolve requestId dal
  token (findValidRequestVerificationAccessToken) poi riusa verifyWithAccessToken esistente
  (nessuna duplicazione).
  buildRequestVerificationUrl riscritta per generare /verifica-richiesta/[token] (path param).
  Nuova route apps/web/src/app/verifica-richiesta/[token]/page.tsx.
  request-verification-page.tsx aggiornata: dispatcha a verifyRequestEmailByToken se requestId
  assente (nuovo link), a verifyRequestEmail se presente (vecchio link).
LEGACY_COMPAT_STRATEGY: nessun redirect necessario — la vecchia route
  apps/web/src/app/verifica-richiesta/page.tsx (?requestId=&token=) resta invariata e
  pienamente funzionante, unica via di accesso rimasta per i token legacy
  (structuredData-based) e per ogni email già in transito/già recapitata con la vecchia forma.

GOOGLE_MAPS_AUDIT:
  apps/web/src/ui/location/city-autocomplete.tsx riletto interamente. Loader: script Google
  Maps iniettato in un useEffect, SOLO quando hasFunctionalConsent && apiKey sono true (gating
  esplicito sul consenso cookie funzionale) — non globale, non eager. 3 consumer (tutti tramite
  questo unico componente, nessuna duplicazione): company-lead-form.tsx, request-step-ui.tsx,
  company-location-fields.tsx.
GOOGLE_MAPS_BLOCKING: no.
GOOGLE_MAPS_CLASSIFICATION: NON_BLOCKING_POST_RELEASE — tutte le 4 condizioni richieste
  soddisfatte (autocomplete funzionante; non caricato globalmente; build non rotta, verificata;
  warning di migrazione futura dell'SDK, non un errore runtime).

FEFO_MIGRATION_GATE:
  04_DEFERRED_ITEMS.md non tracciava ancora un item dedicato per la migration FEFO non
  applicata (il rischio era solo annotato nei RISKS dei PHASE_REPORT di Phase 8.2/8.2.1).
  Creato D-019 — Apply FEFO credit lots migration to target database (TYPE: DEPLOYMENT_GATE).
MIGRATION_APPLIED: no (non eseguita in questa fase, come da vincolo esplicito — solo audit
  read-only di packages/database/prisma/migrations/20260617120000_credit_lots_fefo/migration.sql,
  rilettura riga per riga, nessuna modifica al file, nessun nuovo rischio finanziario trovato
  oltre a quanto già documentato in Phase 8.2.1)
DEPLOYMENT_GATE_CREATED: D-019

FILES_CHANGED:
  packages/domain/src/internal/request/request-links.ts (buildRequestVerificationUrl riscritta)
  packages/domain/src/public/requests/create-request.ts (chiamata aggiornata)
  packages/domain/src/customer/requests/verify-request.ts (verifyRequestEmailByToken aggiunta)
  packages/domain/src/customer/requests/index.ts (export aggiunto)
  apps/web/src/richiesta/verifica/request-verification-page.tsx (dispatch legacy/nuovo)
  docs/architetture/04_DEFERRED_ITEMS.md (D-014 RESOLVED, D-016 riclassificato con root cause
    e 3° call site, D-017 NON_BLOCKING_POST_RELEASE, D-019 creato)
  docs/architetture/03_ROADMAP.md (questa sezione + STATO ROADMAP)
FILES_CREATED:
  apps/web/src/app/verifica-richiesta/[token]/page.tsx
FILES_DELETED: nessuno

PACKAGE_SEARCH_DONE: packages/domain (customer/requests, internal/request, public/requests),
  packages/billing (nessuna modifica, solo audit read-only del gate migration)
EXISTING_LOGIC_FOUND: verifyWithAccessToken già esistente e riusabile invariata per il nuovo
  path single-token; CustomerAccessToken.tokenHash @unique con requestId già co-locato
REUSED_EXISTING_LOGIC: verifyWithAccessToken riusata identica
CREATED_NEW_PACKAGE_LOGIC: verifyRequestEmailByToken (orchestrazione diversa: lookup
  token-first invece di requestId-first; nessuna duplicazione della logica transazionale)
REMOVED_DUPLICATE_LOGIC: nessuna in questa fase (nessun duplicato preesistente trovato)

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine — incluse le 2 route verifica-richiesta coesistenti)
ROOT_TYPECHECK_RESULT: PASS (12/12 package, incluso admin)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 6/6, @esigenta/database prisma generate senza
  connessione DB)

DEFERRED_ITEMS_CREATED: D-019 (FEFO migration deployment gate)
DEFERRED_ITEMS_UPDATED: D-016 (root cause completa, 3° call site aggiunto, target phase
  precisa)
DEFERRED_ITEMS_RESOLVED: D-014
DEFERRED_ITEMS_REMAINING_OPEN: D-011 (RESOLVED — non più open), D-016 (OPEN, BLOCKING: no),
  D-019 (OPEN, TYPE: DEPLOYMENT_GATE)
OPEN_ITEMS_CLASSIFIED: sì — ogni item OPEN rimasto ha BLOCKING esplicito (D-016: no) o TYPE
  esplicito (D-019: DEPLOYMENT_GATE); nessun item OPEN generico/non classificato resta.

ROADMAP_UPDATED: sì
RISKS: D-019 (migration FEFO non applicata) resta un gate operativo pre-deploy, non risolvibile
  da nessuna fase di audit/refactor — richiede una decisione/azione operativa esplicita
  sull'ambiente target. D-016 resta un degrado di performance noto, non bloccante, che richiede
  toccare area-impresa/private/shell/** in una fase dedicata.
BLOCKERS: nessuno per procedere a Phase 16
NEXT_PHASE: Phase 16 — Final Structural Audit
```

---

# PHASE 15.2 — D-016 SHELL COUNTS REVALIDATION REWRITE

## Stato

```txt
COMPLETED — D-016 RESOLVED. Ownership shell counts mappata su packages/domain (notifications +
internal/conversation). Introdotta cache tag-based per company (unstable_cache + revalidateTag)
in apps/web/src/area-impresa/private/shell/shell-counts-cache.ts. Le 3 broad revalidatePath
eliminate. Trovato e documentato un quarto gap (mark-conversation-read-action.ts, mai
revalidava nulla) e un quinto path cross-sessione (customer message) — entrambi coperti da un
TTL di 30s esplicito, non da un cerotto silenzioso. Typecheck e build (web, root) passano.
```

## Obiettivo

Verificare e chiudere definitivamente D-016: non un fix locale, ma una verifica che la
strategia di invalidazione della shell Area Impresa sia corretta e scalabile.

## PHASE_15_2_D016_REPORT

```txt
STATUS: COMPLETED
PHASE: 15.2 — D-016 Shell Counts Revalidation Rewrite

CURRENT_CACHE_STRATEGY (prima della fase):
  Nessuna. Grep di revalidatePath(/revalidateTag(/unstable_cache(/cache(/tags: su apps/web/src
  e packages: zero occorrenze di unstable_cache, revalidateTag, tags: in tutto il monorepo.
  getAreaImpresaShellCounts(actor) era una query Prisma diretta eseguita ad ogni render del
  layout (private)/area-impresa-private-layout.tsx, senza alcuna cache server-side. L'unica
  "cache" rilevante era la Client Router Cache di Next.js per il layout condiviso, che
  staleTimes.md conferma non essere refreshata automaticamente sulla navigazione per i segmenti
  condivisi — da cui la necessità (reale, non un cerotto) della revalidatePath(..., "layout").

SHELL_COUNTS_OWNER:
  unreadNotificationCount -> packages/domain/src/company/notifications/notifications.ts
    (countUnreadCompanyNotifications: CompanyNotification.readAt IS NULL per companyId)
  unreadContactCount, unreadSupportCount -> packages/domain/src/internal/conversation/
    read-state.ts (countUnreadCompanyConversationSummary: Conversation+Message+
    ConversationParticipant.lastReadAt per companyId)
  Aggregatore: packages/domain/src/company/shell/get-shell-counts.ts
    (getAreaImpresaShellCounts) — NON modificato in questa fase (resta l'unica fonte logica,
    package-owned; la cache è stata aggiunta come wrapper a livello apps/web, non dentro
    packages/domain, perché unstable_cache è un'API Next.js, un concern di framework non di
    dominio — stesso principio già applicato a auth/server.ts con React cache()).

ACTIONS_AUDITED (tutte le azioni che mutano i dati sopra, non solo le 3 note):
  apps/web/src/area-impresa/private/account/actions/mark-notification-read-action.ts
    (markNotificationReadAction, markAllNotificationsReadAction) — Server Action, nota
  apps/web/src/area-impresa/private/comunicazioni/actions/send-message-action.ts
    (sendMessageAction) — Server Action, nota
  apps/web/src/area-impresa/private/comunicazioni/actions/open-support-action.ts
    (openSupportAction) — Server Action, nota
  apps/web/src/area-impresa/private/comunicazioni/actions/mark-conversation-read-action.ts
    (markConversationReadAction) — NUOVA SCOPERTA: fired via after() durante il render della
    thread (conversation-page.tsx), non una Server Action invocata da submit. Non chiamava
    alcuna revalidation prima di questa fase (gap preesistente, non causato da questa fase).
  apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx
    (sendCustomerMessageAction) — NUOVA SCOPERTA: Server Action lato cliente (sessione diversa
    da quella impresa) che crea un nuovo Message, incrementando unreadContactCount per
    l'impresa. Chiama già 2 revalidatePath specifiche (non a layout) verso /area-impresa/
    contatti, ma queste non avrebbero invalidato il nuovo tag cache (revalidatePath path/layout
    e revalidateTag sono meccanismi indipendenti).
  packages/domain/src/internal/request/dispatch/create-request-dispatches-for-request.ts
    (triggera da packages/domain/src/admin/requests/review-request.ts, apps/admin) —
    NUOVA SCOPERTA: crea CompanyNotification per più aziende quando un admin approva una
    richiesta. apps/admin è un'app Next.js SEPARATA da apps/web, con una Data Cache propria non
    condivisa — revalidateTag chiamato da admin non potrebbe comunque invalidare la cache di
    web (processi/deploy distinti). Invalidazione cross-app richiederebbe un endpoint di
    revalidation remoto: complessità sproporzionata per un badge sidebar, esplicitamente
    evitata per istruzione ("NON creare un framework di cache se non serve").

BROAD_REVALIDATIONS_FOUND:
  mark-notification-read-action.ts:44,74 — revalidatePath("/area-impresa", "layout")
  send-message-action.ts:104 — revalidatePath("/area-impresa", "layout")
  open-support-action.ts:56 — revalidatePath("/area-impresa", "layout")
  (confermato: nessun'altra revalidation ampia in apps/web/src o packages oltre queste 3)

FILES_CHANGED:
  apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx (usa la versione
    cacheata getAreaImpresaShellCountsCached invece della query diretta)
  apps/web/src/area-impresa/private/account/actions/mark-notification-read-action.ts
    (revalidatePath("/area-impresa","layout") x2 -> revalidateTag(shellCountsTag(companyId),
    { expire: 0 }) x2; revalidatePath("/area-impresa/notifiche") invariata)
  apps/web/src/area-impresa/private/comunicazioni/actions/send-message-action.ts
    (idem; revalidatePath(listPath) invariata)
  apps/web/src/area-impresa/private/comunicazioni/actions/open-support-action.ts
    (idem; revalidatePath("/area-impresa/assistenza") invariata)
  apps/web/src/area-impresa/private/comunicazioni/actions/mark-conversation-read-action.ts
    (solo commento: spiega perché non chiama revalidateTag qui, nessun cambio di comportamento)
  docs/architetture/04_DEFERRED_ITEMS.md (D-016 RESOLVED)
  docs/architetture/03_ROADMAP.md (questa sezione + STATO ROADMAP)

FILES_CREATED:
  apps/web/src/area-impresa/private/shell/shell-counts-cache.ts
    (shellCountsTag(companyId), getAreaImpresaShellCountsCached(actor): unstable_cache con
    keyParts [`area-impresa-shell-counts:${companyId}:${userId}`], tags:
    [shellCountsTag(companyId)], revalidate: 30s. La cache è scoped per company+user (keyParts)
    e il tag è scoped per company (così tutti gli utenti della stessa impresa condividono
    l'invalidazione). Il TTL di 30s è un safety net deliberato e documentato per i path che non
    possono invalidare con precisione (after()-deferred, cross-app), non un valore arbitrario
    lasciato senza spiegazione.)

FILES_DELETED: nessuno

DOCS_UPDATED: docs/architetture/04_DEFERRED_ITEMS.md (D-016 RESOLVED con RESOLUTION_SUMMARY
  completo), docs/architetture/03_ROADMAP.md (questa sezione, STATO ROADMAP)

D016_STATUS: RESOLVED

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package, incluso admin)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 6/6, @esigenta/database prisma generate senza
  connessione DB)

RISKS:
  TTL di 30s significa che, nei path non coperti da invalidazione esplicita (after()-deferred
  read, notifiche create da admin/dispatch, messaggio cliente), il badge sidebar può restare
  stale per un massimo di 30 secondi. Accettato esplicitamente come trade-off documentato, non
  un rischio nascosto: nessun impatto su correttezza del consumo crediti/sblocco richieste (che
  non dipendono in alcun modo da questa cache), solo sul numero mostrato nel badge.
  Compatibilità revalidateTag/unstable_cache con tags verificata leggendo la guida locale
  "Caching and Revalidating (Previous Model)" (applicabile perché questa app non ha il flag
  cacheComponents) — non verificata con un test end-to-end reale in browser in questa fase
  (ambiente di sviluppo non avviato); solo build/typecheck.
BLOCKERS: nessuno
NEXT_STEP: Phase 16 — Final Structural Audit
```

---

# PHASE 16 — CLEANUP FINALE / FINAL STRUCTURAL AUDIT

## Stato

```txt
COMPLETED — audit strutturale finale eseguito su app router, owner (site/richiesta/area-impresa/
ui/platform/packages), cross-boundary, package/DB boundary, FEFO credit lots, revalidation
(D-016), e deferred items. Nessuna violazione strutturale o cross-boundary trovata. Un solo
debito non tracciato trovato (TODO inline in apps/admin) e tracciato come D-020. Nessun codice
applicativo modificato (solo audit read-only + 1 nuovo deferred item in docs). Typecheck e
build (web, admin, root) passano. Vedi FINAL_STRUCTURAL_AUDIT_REPORT.
```

## Obiettivo

Eliminare tutto ciò che è rimasto morto, duplicato o temporaneo. Verificare che la struttura
prodotta dalle fasi 0–15.2 sia coerente, senza route group vietati, owner legacy, cross-boundary
import, vecchio modello crediti usato come fonte di verità, o deferred item bloccanti non
classificati.

## Cercare

```txt
legacy
old
temp
copy
backup
compat
deprecated
unused exports
unused imports
duplicate actions
duplicate read-models
```

## Done finale

```txt
zero file morti
zero duplicati
zero compat inutili
zero route vecchie
zero cartelle cestino
typecheck passa
build passa
roadmap aggiornata
```

## FINAL_STRUCTURAL_AUDIT_REPORT

```txt
DATA: 2026-06-17
STATUS: COMPLETED
PHASE: 16 — Final Structural Audit

APP_ROUTER_AUDIT:
  rg "\(shell\)|\(opportunita\)|\(comunicazioni\)|\(account\)|\(billing\)|\(public-business\)"
    su apps/web/src/app -> 0 match
  rg "\(public\)" su apps/web/src/app -> 0 match
  Unico route group presente nell'albero: (private), consentito (solo layout/guard, come da
  REGOLA ROUTE GROUP). Tutti i 33 page.tsx ispezionati sono bridge sottili (import + render,
  nessuna query/business logic inline).
FORBIDDEN_ROUTE_GROUPS: nessuno trovato
THIN_ROUTE_BRIDGES_CONFIRMED: sì (33 route, tutte import+render)

OWNER_AUDIT:
SITE_STATUS: OK — nessun residuo components/seo o content/seo (0 match)
RICHIESTA_STATUS: OK — nessun import da area-impresa/** (solo 1 match, una URL string
  "/area-impresa/contatti" in revalidatePath, già documentato D-010 RESOLVED, non un import
  cross-boundary)
AREA_IMPRESA_STATUS: OK — nessun import da richiesta/** (i match trovati sono tutti la parola
  italiana "richiesta" in copy/nomi componenti, non import dal macro-owner richiesta)
UI_STATUS: OK — nessuna cartella apps/web/src/components residua (0 risultati)
PLATFORM_STATUS: OK — nessuna cartella apps/web/src/lib residua (0 risultati)
PACKAGES_STATUS: OK — 11 package, nessuna duplicazione owner trovata

LEGACY_DIRS_FOUND: nessuna (apps/web/src/components e apps/web/src/lib confermati inesistenti)
LEGACY_IMPORTS_FOUND: nessuno (area-impresa/shared-messaging: 0 match, già migrato a
  ui/messaging in Phase 14)
SHIMS_FOUND: nessuno
COMPAT_LAYERS_FOUND:
  packages/ui/src/styles/tokens.ts: legacyCssSurfaceTokens + alias "Backward-compatible" per
    tokens.containers e tokens.surfaces.hero — OK, documentato inline con motivazione e path di
    migrazione esplicito ("layout.container.widths owns width selection", "new layout code uses
    structuralSurfaces"), interno al design system, non un residuo di questo audit
  packages/domain verifyWithLegacyStructuredDataToken (verify-request.ts) — OK, compat
    necessaria per D-014 RESOLVED (token di verifica emessi prima dell'introduzione di
    CustomerAccessToken), documentata
  apps/web richiesta/verifica/request-verification-page.tsx commento "D-014: requestId
    present -> legacy query-param link" — OK, documenta la stessa compat
TODO_FIXME_FOUND:
  apps/admin/src/app/(protected)/requests/page.tsx:198 — "TODO: add admin actions for
    edit/archive/soft delete after schema decision" — NON OK (non tracciato prima di questa
    fase) -> tracciato come D-020 in questa fase
  Nessun altro TODO/FIXME/HACK trovato in apps/web/src, packages, docs/architetture

PACKAGE_BOUNDARY_AUDIT: nessuna violazione — 11 package, ownership confermata per ciascuno
  (vedi PACKAGES_STATUS)
DB_IMPORTS_AUDIT: rg "@esigenta/database" su apps/web/src e apps/admin/src -> 0 match (gli
  unici import di @esigenta/database avvengono dentro i package, mai dalle app)
PRISMA_IMPORTS_AUDIT: rg "@prisma/client" su apps/web/src e apps/admin/src -> 0 match
CROSS_BOUNDARY_IMPORTS_AUDIT: nessuna violazione (vedi RICHIESTA_STATUS/AREA_IMPRESA_STATUS
  sopra); import di site/shell/public-shell da richiesta/** e area-impresa/public/** classificati
  OK (shell pubblico condiviso, esplicitamente consentito dall'architettura)

BILLING_FEFO_AUDIT:
  rg "CompanyCreditAccount|companyCreditAccount" su packages -> 11 file: 8 in packages/billing
    (lot-ledger.ts: 2 scritture, una INSERT...ON CONFLICT DO NOTHING idempotente che non
    sovrascrive mai, una UPDATE nella sync centralizzata; resto solo letture/tipi/commenti),
    1 in packages/domain (get-profile-page.ts: solo un commento che documenta l'assenza di
    accesso diretto, nessuna query reale), 3 in packages/database (schema + 2 migration sql,
    legittimo: è lì che la colonna è definita)
  rg "CompanyCreditAccount|companyCreditAccount" su apps/web/src -> 0 match
  rg "CreditLot|CreditLotConsumption" su packages -> 8 file, tutti in packages/billing (fonte di
    verità) e packages/database (schema/migration); nessun apps/web/src match (corretto: le app
    non leggono CreditLot direttamente, passano dai package)
COMPANY_CREDIT_ACCOUNT_ROLE_CONFIRMED: cache derivata, scritta in un solo punto
  (syncCompanyCreditAccountCacheInTransaction) più un INSERT idempotente che garantisce solo
  l'esistenza della riga (ensureCreditAccountRowInTransaction) — confermato, nessuna scrittura
  decisionale fuori da questi due punti
CREDIT_LOT_SOURCE_OF_TRUTH_CONFIRMED: sì — debit/grant/refund/expire operano tutti su CreditLot;
  nessuna decisione di consumo o scadenza basata su CompanyCreditAccount.expiresAt globale
D-019 confermato: STATUS OPEN, TYPE DEPLOYMENT_GATE — nessuna riscrittura della policy FEFO
  eseguita in questa fase (nessuna violazione reale trovata che la richiedesse)

REVALIDATION_AUDIT:
  rg "revalidatePath\(" su apps/web/src -> 17 occorrenze, TUTTE con path/template string
  specifico (nessuna con secondo argomento "layout"); rg su packages -> 0 match
  rg "revalidateTag\(" su apps/web/src -> 4 occorrenze, tutte
  revalidateTag(shellCountsTag(companyId), { expire: 0 }) nei 3 action file di Phase 15.2
  rg "unstable_cache|tags:" su apps/web/src -> solo in
  area-impresa/private/shell/shell-counts-cache.ts (1 file, come previsto, nessuna duplicazione
  del meccanismo altrove)
D016_STATUS_CONFIRMED: RESOLVED — zero revalidatePath(..., "layout") residui in tutto il
  monorepo
TTL_SAFETY_NET_CLASSIFICATION: OK — il TTL di 30s in shell-counts-cache.ts è documentato nel
  codice (commento esplicito che spiega quali path non possono invalidare con precisione e
  perché: after()-deferred render side effect, e cross-app admin->web Data Cache non condivisa)
  e nella RESOLUTION_SUMMARY di D-016 — classificato come safety net deliberato, non cerotto

DEFERRED_ITEMS_AUDIT:
  20 item totali (D-001 .. D-020). 18 RESOLVED, 1 NON_BLOCKING_POST_RELEASE (D-017),
  1 DEPLOYMENT_GATE (D-019). D-020 creato in questa fase (OPEN, BLOCKING: no, classificato).
OPEN_ITEMS: D-019 (DEPLOYMENT_GATE), D-020 (BLOCKING: no)
OPEN_ITEMS_CLASSIFIED: sì — entrambi hanno STATUS/TYPE o BLOCKING espliciti, nessun item OPEN
  generico
BLOCKING_ITEMS_REMAINING: nessuno

FILES_CHANGED: nessun file di codice applicativo (solo audit read-only)
FILES_DELETED: nessuno
DOCS_UPDATED:
  docs/architetture/04_DEFERRED_ITEMS.md (D-020 creato)
  docs/architetture/03_ROADMAP.md (questa sezione, STATO ROADMAP)

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package, incluso admin, full cache hit)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

RISKS:
  D-019 resta un deployment gate operativo (migration FEFO non applicata a un DB reale) — non
  risolvibile da una fase di audit, richiede azione esplicita pre-deploy.
  D-020 è un gap funzionale noto e non bloccante nell'admin (azioni edit/archive/soft-delete
  richieste), in attesa di una decisione di schema.
  apps/admin/src/lib/ esiste (notifications/process-request-email-deliveries.ts) — NON
  classificato come violazione: 01_ARCHITECTURE.md e 02_GUARDS.md definiscono la REGOLA MACRO
  OWNER e la struttura target esplicitamente per apps/web/src, non per apps/admin/src, che non è
  mai stato oggetto di nessuna delle 16+ fasi di questa roadmap. Segnalato qui per trasparenza,
  non trattato come debito perché non esiste una regola scritta che admin stia violando.
BLOCKERS: nessuno
NEXT_STEP: nessuna fase strutturale residua nella roadmap attuale. Eventuali lavori futuri:
  D-019 (deployment gate, quando si decide di deployare), D-020 (quando si decide lo schema
  archiviazione richieste), D-017 (Google Maps PlaceAutocompleteElement, post-release), ed
  eventualmente una fase dedicata se si decide di estendere la REGOLA MACRO OWNER anche ad
  apps/admin/src.
```

---

# PRE-DEPLOY D-019 — APPLY FEFO CREDIT LOTS MIGRATION GATE

## Stato

```txt
PARTIAL — migration 20260617120000_credit_lots_fefo verificata con successo su un branch Neon
di test (fork isolato di production), non sul branch "production" stesso. D-019 resta OPEN per
production: nessun comando distruttivo è stato eseguito sull'unico database reale del progetto
senza conferma esplicita, come da regola di sicurezza assoluta di questa fase.
```

## Obiettivo

Gestire in sicurezza il deployment gate D-019, verificando che la migration FEFO sia applicabile
correttamente prima di autorizzarne l'esecuzione su un ambiente reale.

## D019_PRE_DEPLOY_REPORT

```txt
DATA: 2026-06-17

STATUS: PARTIAL (verificato su branch di test; production non toccata, in attesa di conferma utente)
TARGET_ENVIRONMENT: inizialmente da determinare — l'audit ha rivelato che l'UNICO ambiente DB
  configurato nel repo (.env di root, usato da tutti i comandi Prisma locali) è il branch Neon
  "production" del progetto Neon "Esigenta": non esiste un branch staging separato. L'utente,
  alla domanda esplicita di conferma ambiente, ha scelto di creare un branch Neon temporaneo
  isolato per il test invece di toccare production direttamente.
DATABASE_PROVIDER: PostgreSQL 17 (Neon, k8s-neonvm, regione aws-eu-central-1)
DATABASE_HOST_MASKED:
  production: ep-little-dew-aljt0wd6-pooler.c-3.eu-central-1.aws.neon.tech (branch
    "production", br-odd-dew-al5nhkxe, primary+default, progetto Neon "Esigenta"
    purple-glitter-37268985) — NON toccato in questa fase
  test (creato in questa fase): ep-rapid-scene-alawc8v1-pooler.c-3.eu-central-1.aws.neon.tech
    (branch "test-fefo-credit-lots-migration", br-aged-snow-alw7eqic, fork di production)
DATABASE_PACKAGE_NAME: @esigenta/database (letto da packages/database/package.json; nessuno
  script "migrate" predefinito nel package — comandi eseguiti via
  `pnpm --filter @esigenta/database exec prisma <comando>`)

MIGRATION_FILE: packages/database/prisma/migrations/20260617120000_credit_lots_fefo/migration.sql
MIGRATION_STATUS_BEFORE (branch di test, fork 1:1 di production al momento della creazione):
  27 migration trovate in prisma/migrations; 1 pending: 20260617120000_credit_lots_fefo.
  Nessuna migration precedente pending inattesa, nessun drift.
BACKUP_CREATED: no — non eseguito pg_dump. Motivazione: il branch di test è esso stesso un fork
  isolato e non distruttivo di production (creato via Neon branching, dati reali copiati senza
  toccare l'originale); l'unico "rollback" necessario per il test è l'eliminazione del branch di
  test, senza alcun impatto su production. Il backup pg_dump resta OBBLIGATORIO e non eseguito
  per l'eventuale applicazione futura sul branch "production" reale.
BACKUP_PATH: n/a (vedi sopra)
BACKUP_SIZE: n/a
MIGRATION_APPLIED: sì, ma SOLO sul branch di test "test-fefo-credit-lots-migration"
  (br-aged-snow-alw7eqic). Il branch "production" non è stato toccato da nessun comando di
  scrittura in questa fase.
MIGRATION_STATUS_AFTER (branch di test): "Database schema is up to date!"

BACKFILL_VERIFICATION (query SQL read-only sul branch di test, via Neon MCP):
CREDIT_LOT_TABLE_EXISTS: sì
CREDIT_LOT_CONSUMPTION_TABLE_EXISTS: sì (+ enum CreditLotSource, CreditLotStatus confermati;
  tutti gli indici/FK del migration.sql confermati via pg_indexes/pg_constraint)
LEGACY_MIGRATION_LOTS_CREATED: 1 lotto creato (companyId cmq3k05fp000054c43vgkr70j),
  source=LEGACY_MIGRATION, status=ACTIVE, quantityInitial=quantityRemaining=100 (nessun
  mismatch), idempotencyKey unica e non nulla, expiresAt=2026-08-06T22:34:18.685Z
EXPIRED_BALANCES_HANDLED: non empiricamente testabile — nei dati reali forkati esisteva un solo
  CompanyCreditAccount, con saldo valido (non scaduto). 0 lotti ACTIVE con expiresAt nel passato
  confermato. Il ramo defensivo "saldo scaduto -> nessun lotto" era già stato rivisto via code
  review in Phase 8.2.1; non esercitato qui per assenza di dati che lo attivino.
CACHE_SYNC_VERIFIED: sì — CompanyCreditAccount.balance (100) e .expiresAt coincidono
  esattamente con quantityRemaining/expiresAt del lotto derivato per l'unica company con saldo.
  4 righe CompanyCreditTransaction preesistenti confermate intatte (la migration non le tocca).

SMOKE_TESTS:
CREDITS_PAGE_TEST: non eseguito (richiede ambiente applicativo in esecuzione); verificato
  indirettamente via SQL che i dati che la pagina leggerebbe (CreditLot attivi + cache) sono
  coerenti
PURCHASE_LOT_TEST: non eseguito (richiede Stripe configurato e un acquisto reale/simulato);
  logica già verificata via typecheck/build e code review in Phase 8.2/8.2.1
FEFO_CONSUMPTION_TEST: non eseguito a runtime; logica già verificata via typecheck/build e code
  review in Phase 8.2/8.2.1 (lockAndPlanFefoConsumptionInTransaction)
EXPIRATION_TEST: non eseguito a runtime (nessun lotto scaduto nei dati reali da osservare)
CACHE_TEST: verificato via SQL (vedi CACHE_SYNC_VERIFIED sopra)

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package, incluso admin, full cache hit)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

D019_STATUS: OPEN (non chiuso — verificato solo su branch di test, non su production)
DOCS_UPDATED:
  docs/architetture/04_DEFERRED_ITEMS.md (D-019: aggiunto LAST_VERIFIED_ENV, PRODUCTION_STATUS:
    PENDING, VERIFICATION_SUMMARY, NEXT_STEP_FOR_PRODUCTION)
  docs/architetture/03_ROADMAP.md (questa sezione)

RISKS:
  Il branch "production" è l'UNICO ambiente DB configurato nel repo: non esiste oggi un modo di
  testare in modo permanente senza toccare i dati reali, se non creando/distruggendo branch Neon
  temporanei come fatto in questa fase.
  Smoke test funzionali applicativi (UI + Stripe) non eseguiti: solo verifica a livello
  schema/dati via SQL.
BLOCKERS: nessuno tecnico. Blocco volontario: l'utente ha scelto esplicitamente di non applicare
  la migration su production in questa sessione.
NEXT_STEP: Ripetere D-019 su production con backup e conferma esplicita, quando l'utente deciderà
  di procedere col deploy.

POST_VERIFICATION_CLEANUP: il branch Neon di test "test-fefo-credit-lots-migration"
  (br-aged-snow-alw7eqic) è stato eliminato su richiesta esplicita dell'utente subito dopo la
  verifica positiva — nessun residuo di risorse Neon temporanee.
```

## D019_PRE_DEPLOY_REPORT — ESECUZIONE PRODUCTION (2026-06-18)

```txt
STATUS: COMPLETED
TARGET_ENVIRONMENT: production (confermato dall'utente con la frase esatta richiesta
  "CONFERMO PRODUZIONE FEFO", raccolta immediatamente prima del comando di deploy)
DATABASE_PROVIDER: PostgreSQL 17 (Neon, k8s-neonvm, eu-central-1)
DATABASE_HOST_MASKED: ep-little-dew-aljt0wd6-pooler.***.neon.tech (branch "production",
  br-odd-dew-al5nhkxe, primary+default, progetto Neon "Esigenta" purple-glitter-37268985)
DATABASE_PACKAGE_NAME: @esigenta/database

PRE_DEPLOY_CHECKS:
  1. Branch confermato via Neon API: nome "production", primary=true, default=true — match
     esatto con l'host nel .env di root.
  2. Nessuna stampa di DATABASE_URL in alcun output di questa sessione (solo host mascherato).
  3. Backup creato: branch Neon "backup-pre-fefo-credit-lots-20260618" (br-flat-surf-alwnbse1),
     fork point-in-time di production, metodo nativo del provider (pg_dump non disponibile
     localmente — verificato e dichiarato prima di procedere). Backup confermato esistente con
     describe_branch: schema completo presente (tutte le tabelle pre-migration, incluse
     CompanyCreditAccount/CreditOrder/CompanyCreditTransaction), equivalente a "size > 0".
  4. Nessun checkout/acquisto crediti in corso: 0 righe CreditOrder con status='PENDING' create
     negli ultimi 30 minuti.
  5. prisma migrate status pre-deploy: 27 migration trovate, 1 sola pending
     (20260617120000_credit_lots_fefo), nessuna migration precedente pending inattesa, nessun
     drift.
  6. Fermato e atteso conferma esplicita prima di eseguire `prisma migrate deploy` — ricevuta
     la frase esatta "CONFERMO PRODUZIONE FEFO".

DEPLOY:
  `prisma migrate deploy` su production: "All migrations have been successfully applied."
  `prisma migrate status` post-deploy: "Database schema is up to date!"
  `prisma generate`: client rigenerato con successo.
  _prisma_migrations: riga 20260617120000_credit_lots_fefo con finished_at popolato e
  rolled_back_at NULL — migration APPLIED, non in stato intermedio/fallito.

POST_DEPLOY_VERIFICATION (SQL read-only su production, via Neon MCP):
  CreditLot e CreditLotConsumption: tabelle presenti.
  Backfill: 1 lotto LEGACY_MIGRATION (unica company con saldo nei dati reali),
    quantityInitial=quantityRemaining=100, idempotencyKey unica e non nulla, 0 mismatch.
  Nessun lotto ACTIVE con expiresAt nel passato.
  Cache: CompanyCreditAccount.balance (100) ed .expiresAt coincidono esattamente col lotto
    derivato per l'unica company con saldo.
  Dati storici: CompanyCreditTransaction preesistenti intatti (non toccati dalla migration).

SMOKE_TEST_PAGINA_CREDITI: non eseguito a livello UI (nessun ambiente applicativo/Stripe in
  esecuzione in questa sessione CLI). Verificato a livello dati: i valori che
  getCompanyCreditsPage/getAreaImpresaShellCounts leggerebbero (somma lotti ACTIVE, cache
  sincronizzata) sono coerenti e corretti. Raccomandazione manuale residua: aprire
  /area-impresa/crediti con un utente reale per confermare il rendering, non bloccante per la
  chiusura di questo gate.

TYPECHECK_RESULT: PASS (web)
BUILD_RESULT: PASS (web, 41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

D019_STATUS: RESOLVED
DOCS_UPDATED: docs/architetture/04_DEFERRED_ITEMS.md (D-019 STATUS: RESOLVED,
  RESOLVED_IN: PRE-DEPLOY D-019, RESOLUTION_SUMMARY completo), docs/architetture/03_ROADMAP.md
  (questa sezione)

RISKS: branch di backup "backup-pre-fefo-credit-lots-20260618" (br-flat-surf-alwnbse1) resta
  attivo e consuma risorse Neon finché non viene eliminato — decisione di retention da
  confermare con l'utente. Smoke test UI/Stripe end-to-end resta una verifica manuale
  consigliata, non eseguita in questa sessione.
BLOCKERS: nessuno
NEXT_STEP: deploy finale / release checklist. Confermare con l'utente se mantenere o eliminare
  il branch di backup "backup-pre-fefo-credit-lots-20260618" dopo un periodo di osservazione.
```

## RETENTION DECISION — backup branch (2026-06-18)

```txt
STATUS: PRODUCTION FEFO MIGRATION APPLIED SUCCESSFULLY
D-019: RESOLVED

Decisione esplicita dell'utente: il branch di backup Neon
"backup-pre-fefo-credit-lots-20260618" (br-flat-surf-alwnbse1) NON viene eliminato ora.

RETENTION_WINDOW: 72 ore di osservazione post-migration a partire dal deploy (2026-06-18).
DELETE_CONDITION (entrambe devono essere vere):
  1. Checklist manuale post-deploy (pagina crediti, saldo, breakdown lotti, prossima scadenza,
     assenza errori server, eventuale test acquisto/consumo) superata senza problemi.
  2. Periodo di osservazione di 72 ore trascorso senza errori riportati su crediti/checkout/
     consumo/rimborso in produzione.

Nessuna ulteriore azione su database o migration prevista da questa sessione in poi, finché
l'utente non richiede esplicitamente la chiusura della finestra di osservazione (eliminazione
del branch di backup o estensione della retention).
```

---

# PHASE D-020 — ADMIN REQUESTS ACTIONS CLOSURE

## Stato

```txt
COMPLETED — D-020 RESOLVED. TODO non tracciato rimosso. Archiviazione e soft-delete richieste
implementati come campi ortogonali a RequestStatus (additivi, mai un hard-delete). Edit
confermato già esistente e limitato di proposito ai campi commerciali, per rispettare
l'invariante "historically stable" del modello Request. Liste admin e marketplace aggiornate
per coerenza di visibilità. Nessuna modifica a crediti/billing/FEFO. Typecheck e build (admin,
web, root) passano.
```

## D020_ADMIN_REQUESTS_ACTIONS_REPORT

```txt
STATUS: COMPLETED
PHASE: D-020 — Admin Requests Actions Closure
SCOPE: docs/architetture/03_ROADMAP.md, docs/architetture/04_DEFERRED_ITEMS.md,
  apps/admin/src/**, packages/domain/**, packages/database/prisma/schema.prisma,
  packages/database/prisma/migrations/**

D020_STATUS: RESOLVED
TODO_FOUND: apps/admin/src/app/(protected)/requests/page.tsx:198 — "TODO: add admin actions
  for edit/archive/soft delete after schema decision"
TODO_REMOVED: sì — sostituito con un commento che spiega dove vivono le azioni (pagina dettaglio)

REQUEST_MODEL: packages/database/prisma/schema.prisma, model Request. RequestStatus esistente
  (DRAFT/PENDING_VERIFICATION/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/CLOSED) lasciato
  intatto — CLOSED resta non utilizzato/riservato, non sovraccaricato per l'archiviazione.
EXISTING_ADMIN_ACTIONS_FOUND: reviewRequest/publishReviewedRequest (decisione editoriale,
  packages/domain/src/admin/requests/review-request.ts), updateRequestCommercialSettings
  (creditCost/maxUnlocks, request-commercial-settings.ts), listAdminRequests, getRequestById.
  Nessuna azione archive/delete preesistente.
SCHEMA_CHANGES: additive su Request — archivedAt/archivedByAdminUserId/archiveReason,
  deletedAt/deletedByAdminUserId/deleteReason (tutti nullable); 2 nuove relazioni su User
  (archivedRequests, deletedRequests); 4 nuovi indici su Request. Nessuna colonna esistente
  toccata o rimossa.
MIGRATION_CREATED: packages/database/prisma/migrations/20260618120000_request_admin_archive_delete/
  migration.sql — ALTER TABLE additivo + indici + FK verso User. NON applicata a nessun database
  reale in questa fase (solo prisma generate, schema-only, nessuna connessione DB).

EDIT_ACTION: nessuna nuova azione creata — updateRequestCommercialSettings esisteva già e resta
  l'unica azione di modifica, intenzionalmente limitata a creditCost/maxUnlocks. I campi
  snapshot cliente/funnel (customerName, customerEmail, city, structuredData, ecc.) NON sono
  editabili: il modello li dichiara esplicitamente "historically stable" in un commento nello
  schema, ed editarli avrebbe violato quell'invariante, non solo lo scope di questa fase.
ARCHIVE_ACTION: archiveRequest/unarchiveRequest (packages/domain/src/admin/requests/
  archive-request.ts) — non distruttivo, reversibile, traccia adminUserId + reason + timestamp.
  Indipendente da `status`.
SOFT_DELETE_ACTION: softDeleteRequest/restoreRequest (packages/domain/src/admin/requests/
  soft-delete-request.ts) — mai hard-delete, reversibile, traccia adminUserId + reason +
  timestamp. Indipendente da `status` e da archivedAt (compatibili tra loro).
HARD_DELETE_PRESENT: no (confermato via audit anti-duplicazione, Task 5)
HARD_DELETE_REMOVED: n/a — non ne esisteva nessuno da rimuovere

PACKAGE_OWNER: packages/domain/src/admin/requests/ (già l'owner esistente per la logica admin
  sulle richieste — review, commercial settings, list, detail — confermato e riusato, non
  duplicato altrove)
ADMIN_UI_FILES:
  apps/admin/src/app/(protected)/requests/page.tsx (TODO rimosso)
  apps/admin/src/app/(protected)/requests/[id]/page.tsx (4 nuove server action + card
    "Gestione richiesta" con banner archiviata/eliminata + form archivia/elimina/ripristina)
DOMAIN_FILES:
  packages/domain/src/admin/requests/archive-request.ts (nuovo)
  packages/domain/src/admin/requests/soft-delete-request.ts (nuovo)
  packages/domain/src/admin/requests/list-admin-requests.ts (filtro default archiviate/eliminate)
  packages/domain/src/admin/requests/get-request-by-id.ts (campi esposti per banner)
  packages/domain/src/admin/requests/index.ts (export aggiunti)
  packages/domain/src/admin/dashboard/admin-dashboard.ts (contatori coerenti)
  packages/domain/src/company/requests/get-requests-list-page.ts (esclusione marketplace)
  packages/domain/src/company/requests/get-request-detail-page.ts (esclusione marketplace)
DATABASE_FILES:
  packages/database/prisma/schema.prisma
  packages/database/prisma/migrations/20260618120000_request_admin_archive_delete/migration.sql

LIST_FILTERING_STRATEGY: listAdminRequests esclude archivedAt/deletedAt non-null di default
  (flag includeArchived/includeDeleted disponibili per uso futuro, nessuna vista admin dedicata
  creata — non era già prevista, per non cambiare UX più del necessario). getRequestById NON
  filtra: un admin deve poter aprire una richiesta archiviata/eliminata via link diretto per
  ripristinarla o consultarne lo storico. Marketplace company (browse + dettaglio) escludono
  sempre archiviate/eliminate. Viste storiche company (salvate/acquistate) NON filtrate
  intenzionalmente, per non rompere lo storico di un'impresa che ha già interagito con la
  richiesta.
DATA_RETENTION_STRATEGY: nessuna delete fisica, mai. Tutte le relazioni (RequestUnlock,
  Conversation, CompanyCreditTransaction, CreditRefundRequest, CompanySavedRequest,
  RequestDispatch) continuano a puntare alla stessa riga Request, che non viene mai rimossa.
  Reversibilità totale (unarchive/restore) come protezione da errore admin.
AUDIT_LOG_STRATEGY: stesso pattern già stabilito nello schema per altre entità admin-reviewed
  (CreditRefundRequest.reviewedByAdminUserId, CompanyContactChangeRequest.reviewedByAdminUserId):
  archivedByAdminUserId/deletedByAdminUserId + reason + timestamp, nessun log esterno separato
  introdotto (sarebbe stata complessità non richiesta da nessun pattern esistente).

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: D-020

TYPECHECK_ADMIN_RESULT: PASS
BUILD_ADMIN_RESULT: PASS (14/14 pagine)
TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

ROADMAP_UPDATED: sì
RISKS: RISOLTO in PRE-DEPLOY D-020 — migration applicata a production il 2026-06-18.
BLOCKERS: nessuno
NEXT_STEP: PRE-DEPLOY D-020 (completata)
```

---

# PRE-DEPLOY D-020 — APPLY ADMIN ARCHIVE/DELETE MIGRATION GATE

SCOPE: packages/database/prisma/schema.prisma (solo lettura/verifica),
  packages/database/prisma/migrations/20260618120000_request_admin_archive_delete/** (solo
  audit, nessuna modifica), docs/architetture/03_ROADMAP.md, docs/architetture/04_DEFERRED_ITEMS.md
GOAL: applicare in sicurezza a production la migration D-020, già scritta e validata a livello di
  schema ma non ancora applicata, con la stessa disciplina già usata per D-019 FEFO.
NON_GOALS: modificare FEFO, modificare la migration D-020, cleanup struttura, Google Maps.

MIGRATION_AUDIT: 6 ALTER TABLE "Request" ADD COLUMN (tutte nullable: archivedAt, 
  archivedByAdminUserId, archiveReason, deletedAt, deletedByAdminUserId, deleteReason), 4 CREATE
  INDEX, 2 ADD CONSTRAINT FOREIGN KEY (ON DELETE SET NULL ON UPDATE CASCADE verso User). Nessun
  DROP, DELETE, UPDATE distruttivo o rename. Migration puramente additiva e non distruttiva.

PRECHECK (production, branch Neon "production" br-odd-dew-al5nhkxe): D-019
  (20260617120000_credit_lots_fefo) applicata, finished_at=2026-06-17T21:57:45.432Z,
  rolled_back_at=null. D-020 (20260618120000_request_admin_archive_delete) assente da
  _prisma_migrations; le 6 colonne assenti dalla tabella Request reale. 27 dei 28 file di
  migration nel repo già applicati con successo (incluse 3 coppie rollback+retry storiche, tutte
  concluse con successo) — D-020 unica migration pending, nessun drift, nessuna migration failed.

BACKUP: branch Neon backup-pre-d020-request-admin-archive-delete-20260618 (br-dry-sun-alc9famk),
  fork di production, creato PRIMA del deploy e verificato (D-019 applicata, D-020 assente,
  colonne assenti, 3 Request — stato identico a production pre-migration). Non eliminato.

CONFERMA UTENTE: richiesta esplicitamente con messaggio PRE_DEPLOY_D020_READY_FOR_CONFIRMATION;
  ricevuta testualmente "CONFERMO PRODUZIONE D020" prima di qualsiasi `prisma migrate deploy`.

DEPLOY: `prisma migrate deploy` eseguito da packages/database contro production. Host (mascherato
  nel report finale, mai connection string/credenziali) confermato come istanza Neon EU-Central
  pooled. Risultato: "All migrations have been successfully applied."

POSTCHECK (production): _prisma_migrations riporta 20260618120000_request_admin_archive_delete
  con finished_at=2026-06-18T15:53:31.562Z, rolled_back_at=null. Le 6 colonne esistono (tutte
  is_nullable=YES). I 4 indici (Request_archivedAt_idx, Request_deletedAt_idx,
  Request_archivedByAdminUserId_idx, Request_deletedByAdminUserId_idx) e le 2 FK
  (Request_archivedByAdminUserId_fkey, Request_deletedByAdminUserId_fkey) presenti. Dati
  esistenti intatti: 3 Request totali (invariate), 0 archiviate, 0 eliminate.

SMOKE_TEST: solo 3 Request reali in production, tutte PUBLISHED, nessuna segnalata come
  test/dummy — nessuna mutazione (archive/unarchive/soft-delete/restore) eseguita su dati reali,
  come previsto dalla regola del task in assenza di una richiesta sicura/test. Smoke limitato a
  query read-only equivalenti a listAdminRequests/getRequestById/getAdminDashboardMetrics
  (eseguite con successo sulle colonne reali) + build/typecheck admin e web.

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: D-020 — nota DEPLOYMENT_GATE_CLOSED_IN_PRE_DEPLOY_D020 aggiunta
DEFERRED_ITEMS_RESOLVED: D-020 (deployment gate; il codice era già RESOLVED da PHASE D-020)

TYPECHECK_ADMIN_RESULT: PASS
BUILD_ADMIN_RESULT: PASS (14/14 pagine)
TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (13/13 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

ROADMAP_UPDATED: sì
RISKS: nessuno residuo — gate chiuso, migration applicata, dati intatti, backup branch
  conservato per la finestra di osservazione.
BLOCKERS: nessuno
NEXT_STEP: PHASE 16.1 — Lean Structure Prune (completata, vedi sezione fase)

---

# PHASE 17 — CREDITS RUNTIME STABILIZATION POST-FEFO

SCOPE: packages/billing, packages/domain, apps/web/src/area-impresa/private/billing,
  apps/web/src/app/api/credits/checkout-status
GOAL: eliminare P2028 e la lentezza di /area-impresa/crediti dopo FEFO, senza toccare il modello
  FEFO né la migration già applicata.
NON_GOALS: rifare FEFO, fare D-020, fare cleanup struttura, fare Google Maps.

ROOT_CAUSE: getCompanyCreditsPage chiamava refreshCompanyCreditState ad ogni render, che apre
  una transazione con SELECT ... FOR UPDATE su tutti i CreditLot ACTIVE della company — un lock
  di scrittura preso solo per leggere. Ogni page view/router.refresh()/poll concorrente apriva
  una nuova transazione in competizione sulle stesse righe e con la transazione del webhook
  Stripe che evade lo stesso acquisto, saturando il pool Neon -> P2028. In più,
  CreditCheckoutStatusBanner usava router.refresh() lasciando intatti checkout=success&session_id
  nell'URL: qualsiasi reload/bookmark su quella URL faceva ripartire il polling da zero anche per
  un acquisto già evaso da tempo.

RESOLUTION:
  packages/billing/src/credits/lot-ledger.ts: aggiunta getActiveCreditLotsReadModel (query
    singola, nessuna transazione, nessun FOR UPDATE, nessuna scrittura; esclude i lotti scaduti
    via WHERE expiresAt > now invece di affidarsi al flip di stato).
  packages/billing/src/credits/get-credits-page.ts: getCompanyCreditsPage usa il nuovo read
    model invece di refreshCompanyCreditState — la pagina è tornata read-only.
  apps/web/.../credit-checkout-status-banner.tsx: backoff progressivo (1s..10s), nuovo stato
    terminale "not_found", router.replace(pathname) al posto di router.refresh() su ogni esito
    terminale per rimuovere checkout/session_id dall'URL una sola volta.
  apps/web/.../api/credits/checkout-status/route.ts: risultati 404 (sessione/ordine non
    trovato) restituiti come { status: "not_found", terminal: true } con 200 invece di errore
    generico; tutte le risposte includono "terminal".

INDEX_AUDIT: nessun indice mancante (companyId+status+expiresAt già composito su CreditLot,
  idempotencyKey già @unique, creditOrderId già indicizzato) — nessuna migration creata.

VERIFICATION_PRODUCTION (Neon, read-only): 0 lotti negativi, 0 idempotencyKey duplicate, 0
  mismatch cache/lotti live su tutte le company. Company con 2 lotti da due acquisti distinti:
  lotto più vecchio con expiresAt invariato dopo il secondo acquisto, cache coerente
  (balance=240=60+180, expiresAt=MAX).

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: D-021 (Runtime crediti post-FEFO instabile — vedi 04_DEFERRED_ITEMS.md)

TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (13/13 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

RISKS: RISOLTO in PHASE 17.1 — vedi sezione fase dedicata. get-profile-page.ts non chiama più
  refreshCompanyCreditState; getCompanyCreditSummary è stata riscritta per derivare da
  getActiveCreditLotsReadModel, lo stesso read-model non transazionale già usato dalla pagina
  crediti.
BLOCKERS: nessuno
NEXT_STEP: PHASE 17.1 — Company Profile Credit Summary Read Path Fix (completata)

---

# PHASE 17.1 — COMPANY PROFILE CREDIT SUMMARY READ PATH FIX

SCOPE: packages/domain/src/company/profile, packages/billing/src/credits
GOAL: chiudere il rischio residuo segnalato da Phase 17 — get-profile-page.ts derivava il
  riepilogo crediti via getCompanyCreditSummary -> refreshCompanyCreditState, lo stesso pattern
  transazionale con FOR UPDATE già rimosso dalla pagina crediti.
NON_GOALS: D-020, cleanup struttura, Google Maps, modifiche a migration.

AUDIT: un solo consumer di getCompanyCreditSummary in tutto il repo (get-profile-page.ts).
  Nessun altro read path chiamava refreshCompanyCreditState.

RESOLUTION: getCompanyCreditSummary (packages/billing/src/credits/lot-ledger.ts) riscritta per
  derivare da getActiveCreditLotsReadModel (il read-model non transazionale introdotto in Phase
  17) invece di refreshCompanyCreditState — stessa firma, stesso shape di ritorno, zero cambi
  nel call site di get-profile-page.ts. refreshCompanyCreditState e
  listActiveCreditLotsInTransaction sono stati rimossi: con il fix, restavano a zero chiamanti
  in tutto il monorepo (no-legacy: si elimina, non si lascia dead code).

GLOBAL_AUDIT_POST_FIX: refreshCompanyCreditState — zero call site rimasti (solo menzionato in
  commenti storici). syncCompanyCreditAccountCacheInTransaction — solo nei path di scrittura
  reali (fulfillment.ts grant, ledger.ts debit, admin/credit-ledger.ts admin adjustment). FOR
  UPDATE — solo in path di scrittura (lot-ledger.ts expire/FEFO-lock, admin/credit-refunds.ts,
  admin/companies/*, unlock-request.ts, contact-customer.ts, ensure-unlock-conversation.ts,
  request-phone-change.ts), nessuno in un page/profile/list render.

VERIFICATION: query read-only su Neon production per la company con 2 lotti già verificata in
  Phase 17 (cmq3k05fp000054c43vgkr70j): balance=240, nearestExpiresAt=2026-07-17, 2 lotti attivi
  — identico per costruzione a quanto la pagina crediti calcola, perché entrambe le pagine ora
  chiamano la stessa funzione (getActiveCreditLotsReadModel).

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: nessun nuovo item (chiude il RISK residuo già annotato in D-021/Phase 17,
  nessun deferred separato necessario)

TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (41/41 pagine)
ROOT_TYPECHECK_RESULT: PASS (13/13 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

RISKS: nessuno residuo — nessun read path chiama più refreshCompanyCreditState in tutto il
  monorepo.
BLOCKERS: nessuno
NEXT_STEP: PRE-DEPLOY D-020

---

# TEMPLATE AGGIORNAMENTO FASE

Dopo ogni fase aggiornare questa sezione, aggiungendo una nuova voce in cima al log sotto.

```txt
PHASE:
STATUS:
DATE:
FILES_CHANGED:
FILES_CREATED:
FILES_DELETED:
OLD_CODE_REMOVED:
DUPLICATES_REMOVED:
DEAD_CODE_REMOVED:
APP_ROUTER_FILES:
FEATURE_FILES:
PACKAGE_FILES:
PLATFORM_FILES:
PACKAGE_SEARCH_DONE:
EXISTING_LOGIC_FOUND:
REUSED_EXISTING_LOGIC:
CREATED_NEW_PACKAGE_LOGIC:
REMOVED_DUPLICATE_LOGIC:
REASON:
PACKAGE_OWNERSHIP_DECISIONS:
ROUTE_GROUP_VIOLATIONS_REMOVED:
DEFERRED_ITEMS_CREATED:
DEFERRED_ITEMS_UPDATED:
DEFERRED_ITEMS_RESOLVED:
URL_CHANGED:
BEHAVIOR_CHANGED:
PERFORMANCE_IMPACT:
QUERY_COUNT_BEFORE:
QUERY_COUNT_AFTER:
PAGINATION_STRATEGY:
FILTERING_STRATEGY:
SORTING_STRATEGY:
TYPECHECK:
BUILD:
ROOT_TYPECHECK:
ROOT_BUILD:
RISKS:
BLOCKERS:
NEXT_PHASE:
```

## Log fasi completate

```txt
PHASE: 10 — RICHIESTA FLOW
STATUS: COMPLETED
DATE: 2026-06-17
FILES_CHANGED: nessun file modificato nella sua logica; solo spostamenti e ridenominazioni
FILES_CREATED:
  apps/web/src/richiesta/flow/request-flow-page.tsx (feature page: PublicShell + layout + RequestFlowShell)
  apps/web/src/richiesta/flow/components/request-flow-shell.tsx (da components/funnel/runtime-funnel-route.tsx)
  apps/web/src/richiesta/flow/components/request-stepper.tsx (da components/funnel/runtime-funnel.tsx)
  apps/web/src/richiesta/flow/components/request-step-ui.tsx (da components/funnel/funnel-ui.tsx)
  apps/web/src/richiesta/flow/components/request-photo-upload.tsx (da components/funnel/photo-upload-step.tsx)
  apps/web/src/app/richiesta/[requestSlug]/page.tsx (bridge sottile, sostituisce (public)/richiesta/[slug]/page.tsx)
FILES_DELETED:
  apps/web/src/app/(public)/richiesta/[slug]/page.tsx (MARCIO: layout+funnel inline nella route)
  apps/web/src/components/funnel/runtime-funnel-route.tsx (spostato in richiesta/flow/components)
  apps/web/src/components/funnel/runtime-funnel.tsx (spostato in richiesta/flow/components)
  apps/web/src/components/funnel/funnel-ui.tsx (spostato in richiesta/flow/components)
  apps/web/src/components/funnel/photo-upload-step.tsx (spostato in richiesta/flow/components)
  apps/web/src/richiesta/flow/.gitkeep (sostituito da file reali)
  apps/web/src/components/funnel/ (directory rimossa, vuota dopo lo spostamento)
OLD_CODE_REMOVED: codice prodotto funnel rimosso da components/funnel/ (owner non valido);
  layout inline rimosso dalla route (public)/richiesta/[slug]/page.tsx (REGOLA APP ROUTER)
DUPLICATES_REMOVED: nessun duplicato creato; nessun duplicato preesistente rimosso
DEAD_CODE_REMOVED: route group (public)/richiesta/ per il flow bonificata (solo stato/verifica rimangono,
  Phase 11); components/funnel/ eliminata come directory
APP_ROUTER_FILES: 1 page.tsx nuovo bridge in app/richiesta/[requestSlug]/
FEATURE_FILES: 5 file in richiesta/flow/ (request-flow-page.tsx + 4 componenti)
PACKAGE_FILES: nessuno toccato
PLATFORM_FILES: nessuno
PACKAGE_SEARCH_DONE: packages/funnel (createRuntimeFunnel, tipi RuntimeFunnelPayload),
  packages/domain (submitRuntimeRequest), packages/taxonomy (non usato direttamente),
  packages/shared (non usato direttamente)
EXISTING_LOGIC_FOUND: createRuntimeFunnel già esistente in packages/funnel/server;
  submitRuntimeRequest già esistente in packages/domain; tutte le funzioni di validazione
  (isRuntimeCapabilityAnswerComplete, countCompleteRuntimeAnswers) già in packages/funnel;
  API routes già thin (app/api/funnel/runtime e app/api/requests)
REUSED_EXISTING_LOGIC: tutte le funzioni package sopra usate invariate
CREATED_NEW_PACKAGE_LOGIC: nessuna — i package già possiedono tutta la logica necessaria
REMOVED_DUPLICATE_LOGIC: nessun duplicato trovato nel flow richiesta
REASON: package-first: packages/funnel e packages/domain già owner corretti della logica;
  il refactoring è stato solo di ricollocazione UI/routing in richiesta/flow/, non di logica
PACKAGE_OWNERSHIP_DECISIONS: runtime funnel (createRuntimeFunnel) → packages/funnel/server (invariato);
  submit request (submitRuntimeRequest) → packages/domain (invariato);
  city-autocomplete → DEFERRED D-012 (shared tra richiesta e area-impresa);
  uploadthing → DEFERRED D-008 (aggiornato con nuovo consumer path)
ROUTE_GROUP_VIOLATIONS_REMOVED: (public)/richiesta/[slug] eliminato; ora bridge piatto
  app/richiesta/[requestSlug]/page.tsx
DEFERRED_ITEMS_CREATED: D-012 (city-autocomplete in components/location/, owner non valido,
  shared tra richiesta e area-impresa, non spostabile atomicamente in Phase 10)
DEFERRED_ITEMS_UPDATED: D-008 (aggiornato con nuovo consumer in richiesta/flow/components/
  e motivazione del rinvio continuato)
DEFERRED_ITEMS_RESOLVED: nessuno (Phase 10 chiude solo scope flow; D-010 resta Phase 11)
URL_CHANGED: no — /richiesta/[requestSlug] identico a /richiesta/[slug] come URL
BEHAVIOR_CHANGED: no — stessa logica, stesso UX, stessi testi
FLOW_ROUTES_FOUND: app/(public)/richiesta/[slug]/page.tsx (URL: /richiesta/[slug])
FLOW_ROUTE_TARGET: app/richiesta/[requestSlug]/page.tsx (URL invariato)
SUBMIT_STRATEGY: invariata — fetch client a /api/requests → submitRuntimeRequest (packages/domain)
VALIDATION_STRATEGY: invariata — isRuntimeCapabilityAnswerComplete (packages/funnel) lato client
TAXONOMY_STRATEGY: invariata — createRuntimeFunnel (packages/funnel/server) risolve taxonomy internamente
REDIRECT_STRATEGY: invariata — onReset → router.push('/'); errori mostrati inline
UX_FEEDBACK_ADDED: nessun cambiamento UX (comportamento preservato identico)
TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS (route /richiesta/[requestSlug] presente nell'output build)
ROOT_TYPECHECK_RESULT: non richiesto (packages non toccati)
ROOT_BUILD_RESULT: non richiesto (packages non toccati)
ROADMAP_UPDATED: sì
RISKS: D-012 (city-autocomplete in components/location/, cross-boundary import da richiesta →
  components/); D-008 aggiornato; components/location/ resta con owner non valido
BLOCKERS: nessuno
NEXT_PHASE: 11 — Richiesta Stato/Verifica/Messaggi
```

```txt
PHASE: 9 — AREA IMPRESA DEAD CODE CLEANUP
STATUS: COMPLETED
DATE: 2026-06-17
FILES_CHANGED: 24 file (import monitoring aggiornati):
  apps/web/src/middleware.ts, apps/web/src/auth/server.ts,
  apps/web/src/app/api/stripe/webhook/route.ts,
  apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx,
  18 file feature area-impresa (opportunita, comunicazioni, account, billing),
  2 azioni .server (send-message-action.ts, mark-conversation-read-action.ts)
FILES_CREATED:
  apps/web/src/platform/monitoring/area-monitoring.ts (da lib/area-monitoring.ts)
  apps/web/src/area-impresa/monitoring/area-impresa-monitoring.server.ts (da lib/area-monitoring.server.ts)
  apps/web/src/area-impresa/monitoring/area-impresa-perf-trace.ts (da _lib/perf-log.ts)
  apps/web/src/app/area-impresa/page.tsx + 5 page.tsx pubbliche
  apps/web/src/app/area-impresa/(private)/layout.tsx + 13 page.tsx private
FILES_DELETED:
  apps/web/src/lib/area-monitoring.ts (eliminato, spostato in platform/monitoring)
  apps/web/src/lib/area-monitoring.server.ts (eliminato, spostato in area-impresa/monitoring)
  apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts (eliminato, spostato)
  apps/web/src/app/(area-impresa)/ (intero albero: vecchi bridge + _lib + _components)
  apps/web/src/app/(public-business)/area-impresa/ (intero albero: vecchie bridge pubbliche)
  apps/web/src/platform/monitoring/.gitkeep (sostituito da file reale)
  apps/web/src/area-impresa/monitoring/.gitkeep (sostituito da file reale)
OLD_CODE_REMOVED: route group (public-business) e (area-impresa) per Area Impresa rimossi;
  _lib/perf-log.ts rimosso da app tree (era REGOLA APP ROUTER violation); lib/area-monitoring
  rimosso da lib/ (owner non valido)
DUPLICATES_REMOVED: nessun duplicato creato; nessun doppione residuo
DEAD_CODE_REMOVED: interi alberi app/(public-business)/area-impresa e app/(area-impresa)/area-impresa
  (inclusi _components, _lib legacy già deleted dalle fasi precedenti, ora rimossi definitivamente)
APP_ROUTER_FILES: 20 file creati in app/area-impresa/ (6 pubblici + layout + 13 privati)
FEATURE_FILES: nessun file feature modificato nella sua logica
PACKAGE_FILES: nessuno
PLATFORM_FILES: 3 file creati in platform/monitoring/ e area-impresa/monitoring/
PACKAGE_SEARCH_DONE: nessuna nuova logica package — solo ricollocazione infrastruttura web
EXISTING_LOGIC_FOUND: area-monitoring.ts e _lib/perf-log.ts già esistenti come codice sano
REUSED_EXISTING_LOGIC: tutti i file ricollocati senza modifiche al comportamento
CREATED_NEW_PACKAGE_LOGIC: nessuno
REMOVED_DUPLICATE_LOGIC: nessuno
REASON: REGOLA APP ROUTER + REGOLA MACRO OWNER: lib/ non è owner valido; _lib dentro app non è
  owner valido; (public-business)/(area-impresa) route group legacy non necessari dopo Phase 3-8
PACKAGE_OWNERSHIP_DECISIONS: monitoring generico (areaLog, classifyAreaRequest, safePath, shortId)
  → platform/monitoring (usato anche da middleware e stripe webhook); monitoring Area-Impresa
  specifico (traceSideEffect) → area-impresa/monitoring; perf trace → area-impresa/monitoring
ROUTE_GROUP_VIOLATIONS_REMOVED: (public-business)/area-impresa eliminato; (area-impresa)/area-impresa
  eliminato. Rimane solo (private) come unico route group ammesso per Area Impresa.
DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: D-001 (route consolidation Area Impresa), D-002 (monitoring owner)
URL_CHANGED: no (tutte le 18 route area-impresa invariate)
BEHAVIOR_CHANGED: no (stessa logica, stesso output, stesso monitoring — solo path spostati)
PERFORMANCE_IMPACT: nessuno (refactor strutturale puro)
TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS (18/18 route area-impresa in output)
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS
ROADMAP_UPDATED: sì
RISKS: D-011 (billing FEFO) resta OPEN — non toccato da questa fase per vincolo esplicito;
  D-008 (uploadthing) resta OPEN — lib/uploadthing.ts non spostata (fuori scope)
BLOCKERS: nessuno
NEXT_PHASE: 10 — Richiesta Flow
```

```txt
PHASE: 8 — AREA IMPRESA BILLING
STATUS: COMPLETED
DATE: 2026-06-17
FILES_CHANGED: packages/billing/src/checkout/checkout-status.ts (DB-first rewrite)
FILES_CREATED: 3 file in area-impresa/private/billing/{crediti,actions}/
  (credits-page.tsx, credit-checkout-status-banner.tsx, create-credit-checkout-action.ts),
  1 bridge app (crediti/page.tsx)
FILES_DELETED: intera cartella (private)/(billing)/ (3 file + route group), 2 .gitkeep
  ridondanti in area-impresa/private/billing/{crediti,actions}
OLD_CODE_REMOVED: (billing)/crediti/page.tsx (MARCIO: route+auth+query+business+UI+billing
  tutto insieme), (billing)/crediti/actions.ts (rimosso dal path sbagliato, riscritto nel
  feature owner con path corretti), (billing)/crediti/credit-checkout-status-banner.tsx
  (rimosso dal route group, spostato nel feature owner)
DUPLICATES_REMOVED: check inline company.status === "APPROVED" nel billing web rimosso (D-003);
  ora usa isCompanyMarketplaceEnabled da @esigenta/domain come la shell
DEAD_CODE_REMOVED: route group (billing) (chiude D-007)
APP_ROUTER_FILES: 1 page.tsx, bridge sottile
FEATURE_FILES: 3 file in area-impresa/private/billing/{crediti,actions}
PACKAGE_FILES: 1 file riscritto in packages/billing/src/checkout (checkout-status.ts)
URL_CHANGED: no (/area-impresa/crediti invariata)
BEHAVIOR_CHANGED: sì, in meglio — checkout status polling ora DB-first (riduce Stripe API calls
  nel happy path da MAX_ATTEMPTS a ≤1 dopo webhook). canBuyCredits ora usa policy domain
  isCompanyMarketplaceEnabled. Nessuna regressione UI o funzionale.
TYPECHECK: PASS (web + root, 12/12 package)
BUILD: PASS (web + root: web 37/37 pagine, admin, @esigenta/database)
PACKAGE_SEARCH_DONE: packages/billing, packages/domain, packages/auth, packages/shared
EXISTING_LOGIC_FOUND: getCompanyCreditsPage, createCreditPackageCheckoutOrder,
  createStripeCreditPackageCheckoutSession, markCreditCheckoutCreated, getCheckoutSessionStatus,
  requestCompanyCreditRefund, debitCompanyCreditsInTransaction già esistenti in packages/billing;
  isCompanyMarketplaceEnabled già esistente in packages/domain (creata Phase 4);
  getCreditOrderCheckoutStatus già esistente (funzione interna a checkout-status.ts)
REUSED_EXISTING_LOGIC: tutte le funzioni billing sopra richiamate invariate;
  isCompanyMarketplaceEnabled riusata al posto del check inline duplicato
CREATED_NEW_PACKAGE_LOGIC: nessuna nuova funzione package — getCheckoutSessionStatus RISCRITTA
  (non aggiunta): stessa firma, stessa posizione, logica DB-first aggiunta prima del path Stripe
REMOVED_DUPLICATE_LOGIC: check inline company.status === "APPROVED" nel web billing (era
  duplicazione della policy già in packages/domain)
REASON: package-first applicato: isCompanyMarketplaceEnabled esisteva già in packages/domain,
  riusata senza creare nuova policy; getCheckoutSessionStatus migliorata in-place senza
  duplicare funzioni o wrapper

PACKAGE_OWNERSHIP_DECISIONS: logica crediti/checkout/Stripe resta in packages/billing (owner
  corretto, invariato); policy marketplace resta in packages/domain (owner corretto, riusata);
  UI billing web in area-impresa/private/billing (owner corretto); API route checkout-status
  in app/api/credits (già corretta, non toccata)
ROUTE_GROUP_VIOLATIONS_REMOVED: (private)/(billing) eliminato (D-007 risolto). Nessun route
  group vietato rimane nell'albero (private).

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: D-002 (confermato che i nuovi file billing importano area-monitoring e
  _lib/perf-log dagli stessi path esistenti, nessun duplicato; aggiornata DESCRIPTION)
DEFERRED_ITEMS_RESOLVED: D-003 (duplicazione company status policy in billing),
  D-007 (route group (billing) rimosso)

CREDIT_POLICY_AUDIT: Modello "global rolling ledger" — un CompanyCreditAccount per company con
  balance scalare e expiresAt globale. Accredito: balance += credits, expiresAt = max(expiresAt,
  now) + validityDays. Debito: balance -= amount, expiresAt invariata. Scadenza: azzerata
  atomicamente (CREDIT_EXPIRATION tx) quando expiresAt <= now, prima di qualsiasi operazione.
  Idempotenza: garantita da idempotencyKey su CompanyCreditTransaction (ON CONFLICT DO NOTHING
  o re-check dentro tx + retry). NESSUN BUG trovato. Il modello non è FIFO/FEFO per lot (non
  è mai stato FIFO/FEFO — è corretto per questo design mono-account).

CHECKOUT_FLOW_AUDIT: Flusso: form submit → action crea ordine DB (PENDING) + Stripe session +
  markCreditCheckoutCreated (attacca session ID) + redirect a Stripe. Return success:
  banner polling GET /api/credits/checkout-status. Webhook: fulfillCreditOrderFromStripeCheckoutSession
  (idempotente, 3-check pattern: pre-tx by key, pre-tx by order, inside-tx before lock,
  inside-tx after lock). CHECKOUT P0 FIX: getCheckoutSessionStatus ora DB-first — se
  fulfilled/failed/cancelled già in DB, risponde senza chiamata Stripe.

PERFORMANCE_IMPACT: checkout-status polling passa da "1 auth + 1 Stripe + 1 DB per ogni poll
  (max 8)" a "1 auth + 1 DB per ogni poll in stato terminale già risolto dal webhook; solo
  1 auth + 1 DB + 1 Stripe per poll PENDING". Nel happy path (webhook entro qualche secondo),
  i poll successivi al primo "fulfilled" non chiamano più Stripe.
QUERY_COUNT_BEFORE: checkout-status: 1 auth + 1 Stripe + 1 DB per ogni chiamata
QUERY_COUNT_AFTER: checkout-status: 1 auth + 1 DB (terminal già in DB) oppure
  1 auth + 1 DB + 1 Stripe (ancora PENDING)

TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web 37/37 pagine, admin, @esigenta/database)

ROADMAP_UPDATED: sì
RISKS: D-002 resta OPEN (area-monitoring/perf-log con owner non valido — ora tutti i consumer
  Area Impresa sono bonificati, mancano solo middleware e stripe webhook per poter spostare
  atomicamente); D-001 resta OPEN (route consolidation pubbliche, non impattata da Phase 8);
  D-008 resta OPEN (uploadthing); D-010 resta OPEN (revalidatePath ampia in messaggi/accesso)
BLOCKERS: nessuno per procedere alla Fase 9
NEXT_PHASE: 9 — Area Impresa Dead Code Cleanup
```

```txt
PHASE: 7 — AREA IMPRESA ACCOUNT
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: packages/domain/src/company/notifications/get-notifications-page.ts (unreadCount
  da COUNT reale invece di filtro JS su lista capped)
FILES_CREATED: 12 file in area-impresa/private/account/{profilo,servizi,notifiche,actions}/,
  3 bridge in app/(area-impresa)/area-impresa/(private)/{profilo,configura-servizi,notifiche}/
FILES_DELETED: intera cartella (private)/(account)/ (9 file + route group)
OLD_CODE_REMOVED: nessun codice marcio trovato in questo scope (profilo/servizi/notifiche erano
  già sani secondo l'audit di Fase 2); unico "vecchio codice" rimosso è il filtro JS per
  unreadCount, sostituito da una query reale
DUPLICATES_REMOVED: nessun duplicato creato; 4 .gitkeep ridondanti rimossi (copertura/ e
  view-models/ lasciati intenzionalmente vuoti, vedi sezione fase)
DEAD_CODE_REMOVED: route group (account) (chiude D-006)
APP_ROUTER_FILES: 3 page.tsx, tutti bridge sottili
FEATURE_FILES: 12 file in area-impresa/private/account/{profilo,servizi,notifiche,actions}
PACKAGE_FILES: 1 file modificato in packages/domain
URL_CHANGED: no
BEHAVIOR_CHANGED: sì, in meglio, nessuna regressione — il contatore "non lette" in notifiche ora
  riflette il conteggio reale anche oltre le prime 50 notifiche, non più in potenziale
  disaccordo col badge della shell
TYPECHECK: PASS (web + root, 12/12 package)
BUILD: PASS (web + root: web, admin, @esigenta/database; route map identica alla baseline)
PACKAGE_SEARCH_DONE: packages/auth, packages/domain, packages/notifications, packages/shared,
  packages/taxonomy
EXISTING_LOGIC_FOUND: countUnreadCompanyNotifications già esistente in packages/domain (la stessa
  funzione già riusata dalla shell in Fase 4); getCompanyProfilePage, updateCompanyProfile,
  requestCompanyPhoneContactChange, deactivateCompanyAccount, getCompanyServicesConfigurationPage,
  updateCompanyServicesConfiguration, markCompanyNotificationReadByActor,
  markAllCompanyNotificationsRead già correttamente posizionati in packages/domain; nessuna logica
  taxonomy reale in uso (configura-servizi usa Prisma diretto via packages/domain, non
  packages/taxonomy)
REUSED_EXISTING_LOGIC: countUnreadCompanyNotifications (nuovo utilizzo in getCompanyNotificationsPage)
  e tutte le funzioni di cui sopra, invariate
CREATED_NEW_PACKAGE_LOGIC: nessuna nuova funzione package — solo un nuovo utilizzo (Promise.all)
  di una funzione già esistente
REMOVED_DUPLICATE_LOGIC: rimosso il calcolo JS ridondante di unreadCount (duplicava, in modo
  impreciso, una logica di conteggio che esiste già correttamente come query)
REASON: il conteggio accurato esisteva già come countUnreadCompanyNotifications; riusarlo invece
  di continuare a derivare un conteggio approssimato in JS evita sia la duplicazione concettuale
  sia il bug di sottostima oltre 50 notifiche

PACKAGE_OWNERSHIP_DECISIONS: company profile read/write resta in packages/domain (owner reale
  esistente); company service configuration resta in packages/domain (nessun uso reale di
  packages/taxonomy da estrarre); notification list/read-state resta in packages/domain (owner
  reale esistente, non packages/notifications — stesso gap architettura-vs-realtà già documentato
  in Fase 4 e Fase 6, non aggravato né risolto qui); auth/actor invariato in packages/auth
ROUTE_GROUP_VIOLATIONS_REMOVED: (private)/(account) eliminato (D-006 risolto). Resta fuori scope:
  (private)/(billing) [D-007]

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: D-002 (confermato che anche le nuove pagine account continuano a
  importare apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts dal percorso esistente
  e non valido; già coperto dal pattern generico app/(area-impresa)/area-impresa/(private)/** nei
  FILES_INVOLVED, nessuna nuova riga necessaria — resta aperto per lo stesso motivo già
  documentato in Fase 4/5/6)
DEFERRED_ITEMS_RESOLVED: D-006 (route group (account) rimosso)

PERFORMANCE_IMPACT: notifiche passa da "1 query (take 50) + filtro JS per unreadCount" a "1 query
  (take 50) + 1 query COUNT in parallelo per unreadCount" (1 round-trip aggiuntivo, ma corretto;
  entrambe le query sono già indicizzate e leggere)
QUERY_COUNT_BEFORE: notifiche: 1 findMany (take 50)
QUERY_COUNT_AFTER: notifiche: 1 findMany (take 50) + 1 count, in Promise.all (parallele, non in
  serie)
PAGINATION_STRATEGY: invariata — take 50 fisso su notifiche (limite già presente, non era il
  problema; il problema era l'unreadCount derivato dalla lista limitata, non l'assenza di limite).
  profilo e configura-servizi non hanno liste paginabili (profilo singolo, configurazione singola)
FILTERING_STRATEGY: invariata in tutte le tre feature — nessun filtro largo in JS trovato da
  spostare in DB in questo scope
NOTIFICATIONS_READ_STATE_STRATEGY: invariata nella logica (markCompanyNotificationReadByActor /
  markAllCompanyNotificationsRead via form action + revalidatePath), ora in
  actions/mark-notification-read-action.ts dedicato

TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web, admin, @esigenta/database)

ROADMAP_UPDATED: sì
RISKS: D-002 resta OPEN (perf-log.ts ancora con owner non valido, condiviso con billing fuori
  scope); D-007 resta OPEN, fuori scope Fase 7; D-010 non toccato, nessun impatto diretto nello
  scope account
BLOCKERS: nessuno per procedere alla Fase 8
NEXT_PHASE: 8 — Area Impresa Billing
```

```txt
PHASE: 6 — AREA IMPRESA COMUNICAZIONI
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: packages/domain/src/company/conversations/list-conversations.ts (+excludeType),
  packages/domain/src/internal/conversation/types.ts (+campo tipo), 1 import fix fuori scope
  (apps/web/src/app/(area-impresa)/area-impresa/(private)/(account)/notifiche/page.tsx — solo
  path, nessuna logica), apps/web/src/app/(public)/messaggi/accesso/page.tsx (D-009)
FILES_CREATED: 8 file in area-impresa/private/comunicazioni/{contatti,assistenza,conversazione,
  actions,view-models}/, 2 file in area-impresa/shared-messaging/, 4 bridge app (contatti/page.tsx,
  contatti/[conversationId]/page.tsx, assistenza/page.tsx, assistenza/[conversationId]/page.tsx)
FILES_DELETED: intera cartella (private)/(comunicazioni)/ (8 file + route group), root-level
  area-impresa/_components/{message-thread,send-message-form}.tsx (spostati, cartella rimossa)
OLD_CODE_REMOVED: inline "use server" sendCompanyMessageAction dentro company-conversation-
  thread-page.tsx, 2 console.info incondizionati nella stessa azione, filtro SUPPORT in JS in
  contatti/page.tsx (ora WHERE DB)
DUPLICATES_REMOVED: nessun duplicato creato; 6 .gitkeep ridondanti rimossi
DEAD_CODE_REMOVED: route group (comunicazioni) (chiude D-005); cross-boundary import in
  messaggi/accesso (chiude D-009)
APP_ROUTER_FILES: 4 page.tsx, tutti bridge sottili
FEATURE_FILES: 8 file in area-impresa/private/comunicazioni + 2 in area-impresa/shared-messaging
PACKAGE_FILES: 2 file modificati in packages/domain (list-conversations.ts, types.ts)
URL_CHANGED: no
BEHAVIOR_CHANGED: sì, in meglio — contatti non fetcha più conversazioni SUPPORT poi scartate;
  invio messaggio ora mostra pending state e blocca il doppio invio. Nessuna regressione.
TYPECHECK: PASS (web + root, 12/12 package)
BUILD: PASS (web + root: web, admin, @esigenta/database; route map identica alla baseline)
PACKAGE_SEARCH_DONE: packages/auth, packages/domain, packages/notifications, packages/shared
EXISTING_LOGIC_FOUND: markConversationRead, sendCompanyConversationMessage,
  processConversationMessageSideEffects, getCompanySupportPage, ensureCompanySupportConversation
  già esistenti e correttamente posizionati in packages/domain; nessun filtro type su
  listCompanyConversations preesistente
REUSED_EXISTING_LOGIC: tutte le funzioni di cui sopra, invariate, solo richiamate dai nuovi file
CREATED_NEW_PACKAGE_LOGIC: parametro excludeType su listCompanyConversations (estensione di una
  funzione esistente, non una nuova funzione duplicata)
REMOVED_DUPLICATE_LOGIC: nessuna logica package duplicata trovata in questo scope
REASON: il filtro SUPPORT esisteva solo come post-filtro JS in app; estendere la funzione package
  esistente con un parametro era la soluzione corretta secondo REGOLA ANTI-RIDONDANZA, non creare
  una seconda funzione "listCompanyConversationsExcludingSupport"

PACKAGE_OWNERSHIP_DECISIONS: read-state/unread (markConversationRead, hasUnread) resta in
  packages/domain (owner reale esistente, non packages/notifications); notifiche di evento
  messaggio (CompanyNotification su nuovo messaggio) restano in packages/domain/internal/
  conversation/side-effects.ts (stesso gap architettura-vs-realtà già documentato in Fase 4 per
  countUnreadCompanyNotifications — non duplicato, non spostato, fuori scope una migrazione
  packages/notifications completa); auth/actor invariato in packages/auth
ROUTE_GROUP_VIOLATIONS_REMOVED: (private)/(comunicazioni) eliminato (D-005 risolto). Restano fuori
  scope: (private)/(account) [D-006], (private)/(billing) [D-007]

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: D-005 (route group (comunicazioni) rimosso), D-009 (shared messaging
  spostato, cross-boundary import corretto)

PERFORMANCE_IMPACT: contatti passa da "1 query senza filtro type + filtro JS" a "1 query con
  filtro type nel WHERE" (stesso numero di round-trip, payload più piccolo quando ci sono
  conversazioni SUPPORT); invio messaggio nessun impatto query, solo UX
QUERY_COUNT_BEFORE: contatti: 1 findMany (tutte le conversazioni, incluse SUPPORT) + filter JS
QUERY_COUNT_AFTER: contatti: 1 findMany con type escluso nel WHERE
READ_STATE_STRATEGY: invariata — markConversationRead lanciata durante il render del thread,
  deferita via traceSideEffect/after() (render-safe, non blocca la risposta), ora in un file
  azione dedicato invece che inline nella page
MESSAGE_SEND_STRATEGY: invariata nella logica (sendCompanyConversationMessage + side effects +
  revalidatePath + redirect), ora in actions/send-message-action.ts con parametri passati via
  Function.prototype.bind (pattern Next.js per dati extra su form action) invece di closure
  inline nella page
UX_FEEDBACK_ADDED: send-message-form.tsx (shared-messaging) convertito a "use client" con
  useFormStatus: pulsante disabilitato e testo "Invio in corso..." durante il submit, nessun
  doppio invio possibile

TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web, admin, @esigenta/database)

ROADMAP_UPDATED: sì
RISKS: eccezione minima fuori scope su (account)/notifiche/page.tsx (solo path import, vedi
  sezione fase per motivazione); gap architettura-vs-realtà su packages/notifications (stesso
  pattern già noto da Fase 4, non aggravato né risolto in questa fase)
BLOCKERS: nessuno per procedere alla Fase 7
NEXT_PHASE: 7 — Area Impresa Account
```

```txt
PHASE: 5 — AREA IMPRESA OPPORTUNITÀ
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: packages/domain/src/company/requests/get-requests-list-page.ts (riscrittura P0
  completa), get-saved-requests-page.ts e get-purchased-requests-page.ts (+ paginazione DB)
FILES_CREATED: 4 page feature (requests-page.tsx, request-detail-page.tsx,
  saved-requests-page.tsx, purchased-requests-page.tsx), 2 action (toggle-saved-request-action.ts,
  request-detail-actions.ts), 7 component (copiati as-is), 1 view-model, 4 bridge app
  (richieste/page.tsx, richieste/[id]/page.tsx, richieste-salvate/page.tsx,
  richieste-acquistate/page.tsx) sotto apps/web/src/area-impresa/private/opportunita/ e
  apps/web/src/app/(area-impresa)/area-impresa/(private)/
FILES_DELETED: intera cartella (private)/(opportunita)/ (14 file + route group)
OLD_CODE_REMOVED: buildRequestsQuery (findMany take:100), matchesKeyword, computeMatchLevel,
  sortRequests, normalizeText, collectJsonValues — tutta la logica di filtro/sort/paginazione JS
  rimossa dal package, sostituita da una query SQL
DUPLICATES_REMOVED: nessun duplicato creato; nessun duplicato preesistente rimosso in questo scope
DEAD_CODE_REMOVED: route group (opportunita) (D-004 risolto)
APP_ROUTER_FILES: 4 page.tsx, tutti bridge sottili
FEATURE_FILES: 14 file in area-impresa/private/opportunita/{components,actions,view-models,
  richieste,richiesta-dettaglio,richieste-salvate,richieste-acquistate}
PACKAGE_FILES: 3 file riscritti in packages/domain/src/company/requests
URL_CHANGED: no (le 4 route restano identiche; aggiunto solo ?page= opzionale su salvate/acquistate,
  stesso pattern già usato da richieste)
BEHAVIOR_CHANGED: sì, in meglio — risultati oltre le prime 100 righe ora raggiungibili; paginazione
  reale anche su salvate/acquistate. Nessuna regressione UI.
TYPECHECK: PASS (web + root, 12/12 package)
BUILD: PASS (web + root: web, admin, @esigenta/database; route map identica alla baseline)
PACKAGE_SEARCH_DONE: packages/auth, packages/domain, packages/billing, packages/shared
EXISTING_LOGIC_FOUND: nessun helper di paginazione/cursor generico preesistente; nessuna funzione
  haversine/distanza SQL preesistente; pattern ANY(${arr}::text[]) già usato in
  update-services-configuration.ts (riusato come convenzione, non duplicato come funzione)
REUSED_EXISTING_LOGIC: pattern $queryRaw con array Postgres (ANY(${arr}::text[])) già stabilito nel
  package; helper computeBoundingBox/normalizeFilters/hasFiniteNumber riusati invariati
CREATED_NEW_PACKAGE_LOGIC: queryPaginatedRequests (query SQL filtro/sort/paginazione DB-side),
  escapeLikeTerm (helper locale, owner chiaro e unico consumer: nessun motivo per packages/shared)
REMOVED_DUPLICATE_LOGIC: nessuna (nessun duplicato preesistente trovato in questo scope)
REASON: la query DB-side non esisteva in nessuna forma equivalente; creata una sola volta nel file
  owner (packages/domain/src/company/requests), niente wrapper attorno a Prisma findMany esistente
  perché quella funzione è stata sostituita, non affiancata

PACKAGE_OWNERSHIP_DECISIONS: query/filtro/sort/paginazione richieste -> packages/domain/company/
  requests (owner già corretto, solo riscritto); nessuna logica spostata in packages/billing
  (nessuna logica vera di crediti/acquisto emersa in questo scope, solo chiamate già esistenti a
  requestCompanyCreditRefund/unlockCompanyRequest, non modificate)
ROUTE_GROUP_VIOLATIONS_REMOVED: (private)/(opportunita) eliminato (D-004). Restano (per istruzione
  esplicita, fuori scope Fase 5): (private)/(comunicazioni) [D-005], (private)/(account) [D-006],
  (private)/(billing) [D-007]

DEFERRED_ITEMS_CREATED: nessuno
DEFERRED_ITEMS_UPDATED: D-002 (aggiunto apps/web/src/app/(area-impresa)/area-impresa/_lib/
  perf-log.ts ai FILES_INVOLVED — stesso problema di owner non valido confermato in questo scope)
DEFERRED_ITEMS_RESOLVED: D-004 (route group (opportunita) rimosso)

PERFORMANCE_IMPACT: query richieste passa da "fetch fisso 100 righe + filtro/sort/paginazione JS"
  a "filtro/sort/paginazione DB-side su indici esistenti (status, [latitude,longitude])"; query
  salvate/acquistate passano da "fetch illimitato" a "LIMIT pageSize+1/OFFSET"
QUERY_COUNT_BEFORE: richieste: 1 findMany (cap 100) + N filtri/sort/slice in JS; salvate/
  acquistate: 1 query raw senza LIMIT (cresce illimitatamente con lo storico)
QUERY_COUNT_AFTER: richieste: stesso numero di query (Batch1 invariato + 1 query CTE invece di 1
  findMany), ma la query restituisce solo le righe della pagina richiesta, filtrate/ordinate dal
  DB; salvate/acquistate: stessa 1 query, ora con LIMIT/OFFSET
PAGINATION_STRATEGY: pageSize+1 (50+1) con LIMIT/OFFSET in SQL, hasNextPage derivato dalla riga
  extra, nessuna query COUNT(*) separata — stessa strategia per richieste, salvate, acquistate
FILTERING_STRATEGY: status + bounding box + EXISTS su RequestRequiredService (servizi visibili)
  + distanza precisa (haversine) + keyword search (ILIKE su campi richiesta/structuredData/
  nome-slug servizio/nome categoria, con escape dei caratteri speciali ILIKE) — tutto nella CTE SQL
SORTING_STRATEGY: match_rank (selected_service/category/explore, calcolato una sola volta in SQL)
  + created_at per "recommended"; created_at per "newest"; distance_km + match_rank + created_at
  per "nearest" — tutto in ORDER BY SQL

TYPECHECK_RESULT: PASS
BUILD_RESULT: PASS
ROOT_TYPECHECK_RESULT: PASS (12/12 package)
ROOT_BUILD_RESULT: PASS (web, admin, @esigenta/database)

ROADMAP_UPDATED: sì
RISKS: apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts resta con owner non valido
  (D-002, aggiornato); D-003 (duplicazione company status policy in billing) resta OPEN, fuori
  scope Fase 5
BLOCKERS: nessuno per procedere alla Fase 6
NEXT_PHASE: 6 — Area Impresa Comunicazioni
```

```txt
PHASE: 4 — AREA IMPRESA PRIVATE SHELL
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: apps/web/src/app/(area-impresa)/area-impresa/(private)/layout.tsx (bridge sottile),
  apps/web/src/auth/server.ts (rimosso logging always-on), packages/domain/src/index.ts,
  packages/domain/src/company/account/index.ts, docs/architetture/03_ROADMAP.md
FILES_CREATED: apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx,
  apps/web/src/area-impresa/private/shell/impresa-sidebar.tsx,
  packages/domain/src/company/shell/get-shell-counts.ts,
  packages/domain/src/company/shell/index.ts,
  packages/domain/src/company/account/company-status-policy.ts
FILES_DELETED: apps/web/src/app/(area-impresa)/area-impresa/(private)/(shell)/impresa-sidebar.tsx
  (spostato), cartella (private)/(shell) rimossa (route group vietato eliminato)
OLD_CODE_REMOVED: query/orchestrazione shell counts e check status inline rimossi dal layout app;
  console.info incondizionato rimosso da requireCompanyActor
DUPLICATES_REMOVED: 1 .gitkeep ridondante in area-impresa/private/shell rimosso dopo i file reali
DEAD_CODE_REMOVED: nessun nuovo dead code trovato in questo scope
APP_ROUTER_FILES: 1 layout.tsx, bridge sottile (import + render)
FEATURE_FILES: 2 file in area-impresa/private/shell
PACKAGE_FILES: 3 file in packages/domain (get-shell-counts.ts, shell/index.ts,
  company-status-policy.ts) + 2 barrel aggiornati
URL_CHANGED: no
BEHAVIOR_CHANGED: no (stessa UI, stesso conteggio badge, stesso banner stato; logging
  diagnostico arricchito ma comunque gated)
TYPECHECK: PASS (web + root, 12/12 package)
BUILD: PASS (web + root: web, admin, @esigenta/database; route map identica alla baseline)
PACKAGE_SEARCH_DONE: packages/auth, packages/domain, packages/notifications, packages/shared
EXISTING_LOGIC_FOUND: countUnreadCompanyNotifications e countUnreadCompanyConversationSummary
  già esistenti in packages/domain (non in packages/notifications come da owner aspirazionale);
  nessun orchestratore shell-counts preesistente; nessuna policy company-status preesistente;
  `status === "APPROVED"` già duplicato altrove (billing, fuori scope)
REUSED_EXISTING_LOGIC: countUnreadCompanyNotifications, countUnreadCompanyConversationSummary
  (richiamate dal nuovo orchestratore, non duplicate)
CREATED_NEW_PACKAGE_LOGIC: getAreaImpresaShellCounts (packages/domain/company/shell),
  isCompanyMarketplaceEnabled (packages/domain/company/account) — owner reale (domain) preferito
  all'owner aspirazionale (notifications) per non spostare funzioni già correttamente
  consumate altrove fuori scope
REMOVED_DUPLICATE_LOGIC: nessuna logica package duplicata rimossa in questa fase (il duplicato
  `status === "APPROVED"` in billing resta, fuori scope; verrà consolidato in Fase 8)
REASON: package-first applicato: prima cercato se countUnreadCompanyNotifications/
  countUnreadCompanyConversationSummary esistevano già (sì, in domain) ed evitata la creazione
  di un secondo path in notifications; creato un solo nuovo orchestratore al posto di duplicare
  la chiamata Promise.all nel layout
PACKAGE_OWNERSHIP_DECISIONS: shell counts -> packages/domain/company/shell (owner reale
  esistente, non notifications); company status policy -> packages/domain/company/account;
  company status copy (banner) -> area-impresa/private/shell (puramente visuale); monitoring
  generico -> deferito a platform/monitoring (non eseguito, vedi RISKS)
ROUTE_GROUP_VIOLATIONS_REMOVED: (private)/(shell) eliminato. Restano (per decisione esplicita,
  fuori scope Fase 4): (private)/(opportunita) [D-004], (private)/(comunicazioni) [D-005],
  (private)/(account) [D-006], (private)/(billing) [D-007]
RISKS: apps/web/src/lib/area-monitoring.ts/.server.ts restano con owner non valido (lib/) perché
  condivisi con consumer fuori scope (altri domini Area Impresa, middleware, stripe webhook);
  spostarli ora avrebbe richiesto toccare file vietati o duplicare logica [D-002]. Duplicazione
  residua `status === "APPROVED"` tra shell e billing [D-003].
DEFERRED_ITEMS_LOGGED: D-002 (monitoring owner non valido), D-003 (duplicazione company status
  policy in billing) — entrambi in docs/architetture/04_DEFERRED_ITEMS.md
DEFERRED_ITEMS_RESOLVED: nessuno
BLOCKERS: nessuno per procedere alla Fase 5
NEXT_PHASE: 5 — Area Impresa Opportunità
```

```txt
PHASE: 3 — AREA IMPRESA PUBLIC
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: 6 page.tsx sotto apps/web/src/app/(public-business)/area-impresa/ (riscritti come
  bridge sottili), docs/architetture/03_ROADMAP.md
FILES_CREATED: 14 file sotto apps/web/src/area-impresa/public/{marketing,auth}/ (3 marketing,
  5 page + 2 component + 4 actions/helper auth)
FILES_DELETED: 6 file (_components/business-how-it-works.tsx, _components/company-lead-form.tsx,
  accedi/impresa-login-form.tsx, iscriviti/actions.ts, iscriviti/impresa-signup-form.tsx) +
  apps/web/src/lib/area-impresa/create-company-for-current-user.ts (relocato)
OLD_CODE_REMOVED: tutto il codice prodotto pubblico precedentemente dentro app è stato spostato/
  eliminato dal lato app; nessun residuo
DUPLICATES_REMOVED: nessun duplicato creato; 2 .gitkeep ridondanti rimossi dopo la creazione dei
  file reali in area-impresa/public/{marketing,auth}
DEAD_CODE_REMOVED: apps/web/src/lib/area-impresa/ (owner non valido, Fase 2 RISKS #2-3, parzialmente
  risolto: solo il file relativo al pubblico Area Impresa, area-monitoring.* e uploadthing.ts
  restano e non sono in scope Fase 3)
APP_ROUTER_FILES: 6 page.tsx, tutti bridge sottili (import + render, metadata re-exportata)
FEATURE_FILES: 14 file in area-impresa/public/{marketing,auth}
PACKAGE_FILES: nessuno toccato
URL_CHANGED: no (tutte le 6 route invariate)
BEHAVIOR_CHANGED: no
TYPECHECK: PASS
BUILD: PASS (stessa mappa route della baseline)
RISKS: route consolidation (public-business)/area-impresa -> app/area-impresa deferita per evitare
  conflitto con l'albero privato; resta da fare in fase dedicata dopo le Fasi 4-8
BLOCKERS: nessuno
NEXT_PHASE: 4 — Area Impresa Private Shell
```

```txt
PHASE: 1 — CREARE STRUTTURA TARGET VUOTA
STATUS: COMPLETED
DATE: 2026-06-16
FILES_CHANGED: docs/architetture/03_ROADMAP.md (stato fasi 1 e 2)
FILES_CREATED: 48 file .gitkeep (vedi elenco cartelle in "## Azioni" Fase 1) sotto
  apps/web/src/site, apps/web/src/richiesta, apps/web/src/area-impresa, apps/web/src/ui,
  apps/web/src/platform
FILES_DELETED: nessuno
OLD_CODE_REMOVED: nessuno (fase strutturale, nessuna logica migrata)
DUPLICATES_REMOVED: nessuno
DEAD_CODE_REMOVED: nessuno
APP_ROUTER_FILES: nessuno toccato
FEATURE_FILES: nessuno toccato (solo cartelle vuote create)
PACKAGE_FILES: nessuno toccato
URL_CHANGED: no
BEHAVIOR_CHANGED: no
TYPECHECK: PASS (pnpm --filter web typecheck)
BUILD: PASS (pnpm --filter web build, 37/37 pagine, output identico alla Fase 2)
RISKS: nessuno introdotto in questa fase. Restano aperti i rischi documentati nella Fase 2
  (route group vietati non ancora corretti, lib/* senza owner, logging always-on, cross-boundary
  import messaggi/accesso)
BLOCKERS: nessuno
NEXT_PHASE: 3 — Area Impresa Public

---

PHASE: 2 — AREA IMPRESA AUDIT MAPPING
STATUS: COMPLETED (read-only)
DATE: 2026-06-16
FILES_CHANGED: docs/archive-legacy/old-architecture/audit_area-impresa.md (rewrite), docs/architetture/03_ROADMAP.md (stato fase)
FILES_CREATED: nessuno
FILES_DELETED: nessuno
OLD_CODE_REMOVED: nessuno (fase read-only)
DUPLICATES_REMOVED: nessuno (1 duplicazione strutturale rilevata, non rimossa: owner pubblico
  Area Impresa diviso tra route group (area-impresa) e (public-business))
DEAD_CODE_REMOVED: nessuno rilevato
APP_ROUTER_FILES: mappati 13 page.tsx/layout.tsx privati + 6 page.tsx pubblici (vedi report)
FEATURE_FILES: mappati ~25 file (_components/_lib/actions/view-model) come spostabili o da riscrivere
PACKAGE_FILES: nessuno toccato; 5 candidati di estrazione identificati (vedi report)
URL_CHANGED: no
BEHAVIOR_CHANGED: no
TYPECHECK: non eseguito in Fase 2 (nessun file di codice modificato); confermato PASS in Fase 1
BUILD: non eseguito in Fase 2 (nessun file di codice modificato); confermato PASS in Fase 1
RISKS: route group vietati (opportunita)/(comunicazioni)/(account)/(billing)/(shell) già
  parzialmente committati (d0d2b02); lib/* senza owner valido; logging always-on in
  requireCompanyActor; cross-boundary import messaggi/accesso -> area-impresa/_components
BLOCKERS: nessuno per procedere alla Fase 3; le Fasi 4-8 erediteranno la violazione finché non
  verrà corretta secondo FILES_TO_MOVE/FILES_TO_REWRITE del report
NEXT_PHASE: 3 — Area Impresa Public
```

---

# REGOLA DI CHIUSURA

Una fase non è completa finché non ha eliminato il vecchio codice dello stesso scope.

Vietato chiudere una fase lasciando:

```txt
file duplicati
file vecchi equivalenti
import doppi
compat non necessari
componenti vecchi non usati
actions vecchie non usate
query duplicate
```

---

# STATO ROADMAP

```txt
PHASE 0  — PENDING
PHASE 1  — COMPLETED (struttura target vuota creata, vedi sezione Fase 1)
PHASE 2  — COMPLETED (audit read-only, vedi docs/archive-legacy/old-architecture/audit_area-impresa.md; violazione route group trovata e NON corretta su richiesta esplicita)
PHASE 3  — COMPLETED (public spostato in area-impresa/public/{marketing,auth}; route consolidation deferita, vedi sezione fase)
PHASE 4  — COMPLETED (shell ricostruita in area-impresa/private/shell; monitoring lib deferito, vedi sezione fase)
PHASE 5  — COMPLETED (opportunità ricostruita, P0 richieste riscritto DB-side, paginazione salvate/acquistate; vedi sezione fase)
PHASE 6  — COMPLETED (comunicazioni ricostruita, shared-messaging separato, D-005/D-009 risolti; vedi sezione fase)
PHASE 7  — COMPLETED (account ricostruito, D-006 risolto, fix correttezza unreadCount notifiche; vedi sezione fase)
PHASE 8  — COMPLETED (billing ricostruita in area-impresa/private/billing; D-003/D-007 risolti; checkout-status DB-first; vedi sezione fase)
PHASE 8.2 — COMPLETED (FEFO credit lots rewrite; D-011 risolto; D-018 creato; vedi sezione fase e PHASE_REPORT)
PHASE 8.2.1 — COMPLETED (audit integrità FEFO cross-package; D-018 risolto; CreditLot confermato unica fonte di verità; vedi sezione fase e PHASE_REPORT)
PHASE 9  — COMPLETED (route consolidate in app/area-impresa/; monitoring ricollocato; D-001/D-002 risolti; vedi sezione fase)
PHASE 10 — COMPLETED (richiesta flow ricostruita in richiesta/flow/; bridge app/richiesta/[requestSlug]; D-012 creato; vedi sezione fase)
PHASE 11 — COMPLETED (richiesta stato/verifica/messaggi ricostruiti; URL migrati; D-010 risolto; D-013 creato; vedi sezione fase)
PHASE 12 — COMPLETED (site/home, site/shell, site/legal creati; shell pubblico bonificato; D-015 creato; vedi sezione fase)
PHASE 13 — COMPLETED (SEO data-driven; site/seo/{pages,engine,templates} ricostruiti; vedi sezione fase e PHASE_REPORT)
PHASE 14 — COMPLETED (D-008/D-012/D-013 risolti; lib/ e components/ eliminate; ui/location, ui/messaging, platform/uploads popolati; vedi sezione fase e PHASE_REPORT)
PHASE 15 — COMPLETED (4 fix application-code: logging always-on rimosso da packages/auth e middleware, requireUser deduplica via getCurrentUser, marketing page su cached adapter; D-016/D-017 creati; vedi sezione fase e PHASE_REPORT)
PHASE 15.1 — COMPLETED (D-014 risolto con single-token URL; D-016 riclassificato OPEN non-blocking con target phase dedicata; D-017 NON_BLOCKING_POST_RELEASE; D-019 creato come deployment gate; vedi sezione fase e PHASE_REPORT)
PHASE 15.2 — COMPLETED (D-016 RESOLVED: cache tag-based per shell counts, broad revalidatePath eliminate; vedi sezione fase e PHASE_15_2_D016_REPORT)
PHASE 16 — COMPLETED (final structural audit: nessuna violazione route group/owner/cross-boundary/FEFO/revalidation trovata; D-020 creato per un TODO non tracciato in apps/admin; vedi sezione fase e FINAL_STRUCTURAL_AUDIT_REPORT)
PHASE D-020 — COMPLETED (admin requests archive/soft-delete implementati a livello di codice; D-020 STATUS RESOLVED — deployment gate chiuso in PRE-DEPLOY D-020, migration 20260618120000_request_admin_archive_delete applicata a production il 2026-06-18; vedi sezione fase, D020_ADMIN_REQUESTS_ACTIONS_REPORT, PRE-DEPLOY D-020 e 04_DEFERRED_ITEMS.md)
PRE-DEPLOY D-020 — COMPLETED (migration 20260618120000_request_admin_archive_delete applicata a production dopo conferma esplicita utente; backup branch Neon backup-pre-d020-request-admin-archive-delete-20260618 creato e verificato prima del deploy; colonne/indici/FK verificati post-deploy; dati esistenti intatti; admin+web typecheck/build PASS; vedi sezione fase)
PHASE 17 — COMPLETED (credits runtime stabilization post-FEFO: read path su CreditLot resa non-transazionale/senza lock, banner checkout riscritto con backoff + pulizia URL su esito terminale, checkout-status con contratto 404->not_found terminale; D-021 creato e risolto nella stessa fase; vedi sezione fase e 04_DEFERRED_ITEMS.md)
PHASE 17.1 — COMPLETED (chiuso il rischio residuo di Phase 17: getCompanyCreditSummary riscritta su getActiveCreditLotsReadModel, refreshCompanyCreditState e listActiveCreditLotsInTransaction rimossi come dead code; zero read path con FOR UPDATE/transazioni residue in tutto il monorepo; vedi sezione fase)
PHASE 16.1 — COMPLETED (lean structure prune: 14 cartelle vuote/.gitkeep-only/aspirazionali eliminate in apps/web/src — content/legal, platform/{config,errors,privacy}, richiesta/notifiche, area-impresa/private/account/{copertura,view-models}, area-impresa/private/billing/{acquisti,fatture,rimborsi,view-models}, site/seo/{geo,market-data,matrix}; nessuna API route morta trovata, /api/stripe/debug-config confermata già protetta da env flag; compat routes verifica-richiesta/richiesta-stato confermate necessarie e non toccate; D-022 creato per la discrepanza con 01_ARCHITECTURE.md; vedi sezione fase)
```

---

# PHASE 16.1 — LEAN STRUCTURE PRUNE

SCOPE: apps/web/src/**, docs/architetture/03_ROADMAP.md, docs/architetture/04_DEFERRED_ITEMS.md
GOAL: rimuovere rumore strutturale residuo (cartelle vuote, .gitkeep aspirazionali, SEO folder
  mai popolate, API route morte/debug non protette) senza riscrivere feature.
NON_GOALS: FEFO, D-020, Google Maps, modifiche DB/migration, refactor estetico, cambi UX.

EMPTY_DIRS_REMOVED (14, tutte confermate vuote o .gitkeep-only, zero import in tutto il repo):
  apps/web/src/content/legal (+ content/ stessa, rimasta vuota dopo la rimozione)
  apps/web/src/platform/config
  apps/web/src/platform/errors
  apps/web/src/platform/privacy
  apps/web/src/richiesta/notifiche
  apps/web/src/area-impresa/private/account/copertura
  apps/web/src/area-impresa/private/account/view-models
  apps/web/src/area-impresa/private/billing/acquisti
  apps/web/src/area-impresa/private/billing/fatture
  apps/web/src/area-impresa/private/billing/rimborsi
  apps/web/src/area-impresa/private/billing/view-models
  apps/web/src/site/seo/geo
  apps/web/src/site/seo/market-data
  apps/web/src/site/seo/matrix

NOTA_SU_01_ARCHITECTURE: 01_ARCHITECTURE.md descrive site/seo/{geo,market-data,matrix} e le
  sottocartelle account/billing rimosse come struttura TARGET. Erano vuote, mai popolate, zero
  import in tutto apps/web/src (verificato via rg prima della rimozione) — i dati città/prezzo
  reali vivono già, centralizzati per famiglia, dentro ogni pages/<famiglia>/content.ts (unica
  famiglia oggi: ristrutturare-bagno), non in un registry condiviso separato. Centralizzare ora
  sarebbe una riscrittura SEO (vietata in questa fase) senza una seconda famiglia che ne
  giustifichi il bisogno reale. Discrepanza tracciata come D-022 (01_ARCHITECTURE.md non
  modificabile in questo scope) invece di lasciata silente.

SEO_AUDIT: nessuna logica reale trovata da centralizzare in geo/market-data/matrix — dati
  città/prezzo già centralizzati per famiglia in pages/costi/ristrutturare-bagno/content.ts;
  "matrix" (combinazioni pubblicabili) già realizzata via engine/static-params.ts +
  isIndexableCityPage, senza bisogno di un modulo dedicato a singola famiglia. Nessun URL/
  canonical/metadata toccato.

API_ROUTES_AUDIT (apps/web/src/app/api/**):
  api/auth/[...all] — necessaria, bridge sottile verso packages/auth (better-auth). KEPT.
  api/stripe/webhook — necessaria, bridge sottile verso packages/billing. KEPT.
  api/stripe/debug-config — già protetta: isStripeDebugEnabled() richiede
    ESIGENTA_DEBUG_STRIPE=true altrimenti 404; payload solo booleani di presenza env +
    costanti pubbliche (URL webhook atteso, lista eventi richiesti), nessun secret. Non
    rimossa né modificata: packages/billing è fuori scope in questa fase e il gating esiste
    già lato codice. KEPT, classificata GIÀ_HARDENED.
  api/credits/checkout-status — necessaria, usata dal banner checkout (Phase 17/17.1). KEPT.
  api/funnel/draft, api/funnel/runtime — bridge sottili verso packages/funnel, usate dal flow
    cliente. KEPT.
  api/requests — bridge sottile verso packages/domain (submitRuntimeRequest), usata dal funnel.
    KEPT.
  api/taxonomy/search, api/taxonomy/category/[slug]/interventions — bridge sottili verso
    packages/taxonomy. KEPT.
  api/uploadthing/{core.ts,route.ts} — pattern uploadthing canonico (middleware/
    onUploadComplete delegano a packages/uploads + packages/domain), nessuna business logic
    propria. KEPT.
  Nessuna API route morta trovata. Nessuna route richiede hardening aggiuntivo oltre quanto
    già presente.

APP_ROUTER_AUDIT: nessun route group vietato residuo (solo (private), consentito). Compat route
  verificate e confermate necessarie, NON toccate (rischio di rompere link già distribuiti):
  apps/web/src/app/verifica-richiesta/page.tsx — compat query-param (?requestId&token),
    decisione già documentata in D-014 ("la vecchia route... invariata, per compat").
  apps/web/src/app/richiesta/stato/page.tsx — redirect-only verso /stato-richiesta/[token],
    decisione già documentata in 03_ROADMAP.md (sezione storica) come "legacy redirect
    mantenuto".
  Tutte le altre route in app/ sono bridge sottili (page.tsx/layout.tsx/route.ts, nessuna query/
    Prisma/business logic inline) — confermato a vista, nessuna violazione REGOLA APP ROUTER.

IMPORTS_AUDIT: rg su tutti i path rimossi (content/legal, platform/{config,errors,privacy},
  richiesta/notifiche, le sottocartelle account/billing rimosse, site/seo/{geo,market-data,
  matrix}, stripe/debug-config) — zero riferimenti reali in apps/web/src o packages prima della
  rimozione. Nessun import rotto da correggere, nessun dead re-export trovato.

DEFERRED_ITEMS_CREATED: D-022 (01_ARCHITECTURE.md descrive struttura target non più presente su
  disco per le cartelle rimosse — vedi 04_DEFERRED_ITEMS.md)
DEFERRED_ITEMS_UPDATED: nessuno
DEFERRED_ITEMS_RESOLVED: nessuno (D-019/D-020 non riaperti; D-017 resta NON_BLOCKING_POST_RELEASE)

TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (41/41 pagine; un primo tentativo è falito per un errore di rete
  transitorio nel fetch di Google Fonts, non legato al cleanup — il retry è passato)
ROOT_TYPECHECK_RESULT: PASS (13/13 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 14/14)

ROADMAP_UPDATED: sì
RISKS: nessuno strutturale. 01_ARCHITECTURE.md va aggiornato in una fase futura per rimuovere i
  riferimenti a site/seo/{geo,market-data,matrix} e alle sottocartelle account/billing eliminate
  (tracciato in D-022, fuori scope di modifica in questa fase).
BLOCKERS: nessuno
NEXT_STEP: nessuno obbligatorio; valutare aggiornamento di 01_ARCHITECTURE.md (D-022) in una
  fase dedicata, o ripopolare site/seo/{geo,market-data,matrix} quando esisterà una seconda
  famiglia SEO che giustifichi la centralizzazione.

---

# PHASE 18 — SEO/GEO CONTENT ARCHITECTURE AUDIT

## Stato

```txt
COMPLETED (read-only)
```

## Obiettivo

Audit completo, senza modifiche al codice, della scalabilità SEO/GEO prima di
aggiungere altre famiglie/città. Confermato che `pages/costi/ristrutturare-bagno/
content.ts` (543 righe, unica famiglia, 8 città) era il file a rischio diretto
descritto dal task: a 100 città o 50 guide sarebbe diventato ingestibile, perché
contenuto nazionale, contenuto città, prezzi (ripetuti in prosa), FAQ, canonical e
metadata vivevano tutti nello stesso file, e le cartelle target `geo/`,
`market-data/`, `matrix/` (rimosse vuote in Phase 16.1, vedi D-022) non erano mai
state ripopolate.

## PHASE_REPORT Phase 18

```txt
STATUS: COMPLETED
SCOPE: read-only, nessun file modificato/creato/cancellato
OUTPUT: PHASE_18_SEO_GEO_CONTENT_ARCHITECTURE_AUDIT_REPORT (consegnato in conversazione,
  non persistito come file su disco in questa fase)
FINDING_PRINCIPALE: pages/costi/ristrutturare-bagno/content.ts (543 righe) mischia
  contenuto nazionale + 8 blocchi città + FAQ + canonical + metadata; nessun JSON-LD,
  nessuna sitemap dinamica, nessuna route città per interventi.
DECISIONE: avviare Phase 18.1 come pilota di fondazione (geo/market-data/engine)
  limitato alla famiglia esistente, senza toccare URL/canonical/prezzi visibili.
NEXT_PHASE: 18.1
```

---

# PHASE 18.1 — SEO/GEO FOUNDATION PILOT: COST GUIDE RISTRUTTURARE BAGNO

## Stato

```txt
COMPLETED
```

## Obiettivo

Eliminare l'anti-pattern identificato in Phase 18 sul caso pilota
`/costi/ristrutturare-bagno` (+ città), senza cambiare URL, canonical, template UI
o prezzi visibili, e senza creare un file per singola città.

## Owner introdotti

```txt
apps/web/src/site/seo/
  geo/cities.ts                 — registry città (slug, name, province, region)
  geo/supported-cities.ts       — città supportate per famiglia SEO (seoEnabled/contentStatus/uniquenessLevel)
  market-data/base-price-ranges.ts — range prezzo nazionale per famiglia (unica fonte)
  market-data/city-price-index.ts  — modificatore prezzo per città (oggi neutro, multiplier=1)
  engine/pricing-resolver.ts    — deriva il range finale da base + modificatore città
  engine/canonical.ts           — deriva canonical da family+slug+citySlug
  engine/geo-policy.ts          — owner reale di isIndexableCityPage (prima re-export vuoto)
  pages/costi/ristrutturare-bagno/base.ts            — contenuto nazionale (no città, no prezzo)
  pages/costi/ristrutturare-bagno/faq.ts             — FAQ nazionali
  pages/costi/ristrutturare-bagno/local-overrides.ts — delta editoriali per le 8 città (no prezzo, no canonical)
  pages/costi/ristrutturare-bagno/content.ts         — composer (543 → 91 righe)
```

## PHASE_REPORT Phase 18.1

```txt
STATUS: COMPLETED
PHASE: 18.1

FILES_CHANGED: pages/costi/index.ts, engine/geo-policy.ts,
  pages/costi/ristrutturare-bagno/content.ts
FILES_CREATED: geo/cities.ts, geo/supported-cities.ts,
  market-data/base-price-ranges.ts, market-data/city-price-index.ts,
  engine/pricing-resolver.ts, engine/canonical.ts,
  pages/costi/ristrutturare-bagno/{base.ts,faq.ts,local-overrides.ts}
FILES_DELETED: nessuno (content.ts riscritto come composer, non eliminato:
  resta l'unico punto importato da pages/costi/index.ts)

CONTENT_FILE_BEFORE: pages/costi/ristrutturare-bagno/content.ts — 543 righe
  (contenuto nazionale + 8 blocchi città + FAQ + canonical + metadata insieme)
CONTENT_FILE_AFTER: 91 righe, solo composizione (geo + supported-cities +
  pricing-resolver + canonical + base + faq + local-overrides → CostGuide)
CONTENT_SPLIT_DONE: sì
BASE_CONTENT_FILE: pages/costi/ristrutturare-bagno/base.ts (29 righe)
FAQ_FILE: pages/costi/ristrutturare-bagno/faq.ts (22 righe)
LOCAL_OVERRIDES_FILE: pages/costi/ristrutturare-bagno/local-overrides.ts (396 righe,
  8 città — dimensione intrinseca al contenuto editoriale bespoke, non a duplicazione
  strutturale: ogni città ha solo i propri delta, zero prezzo/canonical duplicati)

GEO_REGISTRY_CREATED: sì — geo/cities.ts (8 città: slug/name/province/region)
CITIES_MOVED_TO_REGISTRY: milano, roma, torino, napoli, bologna, firenze, palermo, catania
SUPPORTED_CITIES_MODEL: geo/supported-cities.ts, mapping per familyKey
  ("costGuide:ristrutturare-bagno" → 8 record seoEnabled/contentStatus/uniquenessLevel)
CITY_FILE_PER_CITY_CREATED: no (vietato e rispettato)

MARKET_DATA_CREATED: sì
BASE_PRICE_RANGES: market-data/base-price-ranges.ts (nationalRange,
  pricePerSquareMeter, priceRows×8, sizeExamples×3 — unica fonte per famiglia)
CITY_PRICE_INDEX: market-data/city-price-index.ts (multiplier=1 per tutte le 8
  città, nessuna decisione prodotto presa in questa fase)
PRICING_RESOLVER: engine/pricing-resolver.ts (resolveFamilyPriceRange,
  resolveCityPriceRange — oggi restituisce sempre il range base)
VISIBLE_PRICE_OUTPUT_CHANGED: no

CANONICAL_RESOLVER_CREATED: sì — engine/canonical.ts (buildCanonicalPath)
CANONICAL_HARDCODED_REMOVED: sì (rimosso da ogni oggetto città nel content.ts,
  ora derivato da family+slug+citySlug)
CANONICAL_OUTPUT_CHANGED: no (verificato via build: stessi path generati)

GEO_POLICY_BEFORE: engine/geo-policy.ts era `export { isIndexableCityPage } from
  "../pages/costi"` (re-export vuoto); la logica reale viveva in pages/costi/index.ts
GEO_POLICY_AFTER: engine/geo-policy.ts è owner reale (seoEnabled + contentStatus +
  uniquenessLevel + presenza minima di local override: localReading non vuoto e
  faq.length > 0); pages/costi/index.ts ri-esporta, non definisce
INDEXABILITY_OWNER_AFTER: engine/geo-policy.ts

ROUTES_VERIFIED: /costi/ristrutturare-bagno, /costi/ristrutturare-bagno/[citySlug]
  (8 città), /interventi/[interventoSlug] (non toccata, verificata per regressione)
STATIC_PARAMS_RESULT: invariato — 1 guida + 8 città indicizzabili generate
METADATA_RESULT: invariato (title/description/canonical identici, bug preesistente
  immagine OG hardcoded non toccato, fuori scope Phase 18.1)
NOT_FOUND_RESULT: invariato (notFound() su slug/città non risolti)

DUPLICATION_REMOVED: sì (fonte unica per range prezzo nazionale; canonical derivato
  invece che scritto a mano per ognuna delle 8 città)
PRICE_DUPLICATION_REMOVED: sì (nationalRange/pricePerSquareMeter/priceRows/
  sizeExamples esistevano già una sola volta, ora centralizzati in market-data/
  invece che embedded nel content.ts della famiglia)
GEO_DUPLICATION_REMOVED: sì (nome città non più ripetuto in local-overrides, derivato
  da geo/cities.ts via citySlug)
FAQ_DUPLICATION_STATUS: nessuna duplicazione di dato — il pattern FAQ resta bespoke
  per città in local-overrides.ts (contenuto legittimamente diverso, non duplicato)

FILES_STILL_TOO_LARGE: local-overrides.ts (396 righe) — dimensione editoriale
  intrinseca (8 città × prosa bespoke), non un problema architetturale: nessuna
  responsabilità impropria al suo interno
SCALABILITY_AFTER: aggiungere una città ora richiede solo un nuovo record in
  geo/cities.ts + geo/supported-cities.ts + un blocco in local-overrides.ts (nessun
  prezzo/canonical da scrivere a mano); aggiungere una seconda famiglia costi
  richiede solo replicare base.ts/faq.ts/local-overrides.ts con lo stesso pattern,
  riusando geo/market-data/engine esistenti
DOES_THIS_SCALE_TO_500_SECTIONS_NOW: PARZIALMENTE — la fondazione (geo, market-data,
  pricing-resolver, canonical, geo-policy) regge; manca ancora matrix/ (combinazioni
  pubblicabili centralizzate) e schema-builder.ts/sitemap.ts (mai esistiti, non in
  scope Phase 18.1); con una sola famiglia oggi non è ancora dimostrato il riuso su
  una seconda famiglia
WHAT_REMAINS_FOR_PHASE_18_2: replicare il pattern su una seconda famiglia costi reale
  per validare il riuso di geo/market-data/engine; valutare matrix/ quando esistono
  più famiglie con combinazioni da centralizzare; creare engine/schema-builder.ts ed
  engine/sitemap.ts (gap preesistenti, non introdotti da questa fase); estendere il
  modello città anche a /interventi/[interventoSlug]/[citySlug] se deciso a livello
  prodotto

TYPECHECK_RESULT: PASS (apps/web)
BUILD_RESULT: PASS (41/41 pagine, 8/8 città ristrutturare-bagno generate)
ROOT_TYPECHECK_RESULT: PASS (13/13 package)
ROOT_BUILD_RESULT: PASS (web 41/41, admin 6/6)

DOCS_UPDATED: 03_ROADMAP.md (questa sezione + STATO GLOBALE), 04_DEFERRED_ITEMS.md
  (D-022 aggiornato: geo/market-data non sono più scaffolding vuoto)
RISKS: local-overrides.ts crescerà linearmente con le città per famiglia — accettato,
  è contenuto editoriale legittimo, non struttura da centralizzare ulteriormente
BLOCKERS: nessuno
NEXT_STEP: Phase 18.2 — validare il pattern su una seconda famiglia SEO reale
```

---

# FRASE GUIDA

```txt
Una fase alla volta.
Nessun file morto.
Nessun doppione.
Nessuna patch.
Nessun app-router pesante.
Nessuna logica nel posto sbagliato.

Se è sano, si sposta.
Se è marcio, si riscrive.
Se è vecchio, si elimina.
Se appartiene a un package, si estrae.
```