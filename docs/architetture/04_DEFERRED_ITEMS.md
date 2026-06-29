# 04_DEFERRED_ITEMS.md

# ESIGENTA — DEFERRED ITEMS / DEBITO TECNICO CONTROLLATO

Versione: 1.0
Stato: ATTIVO

---

# SCOPO

Questo documento contiene tutto ciò che viene rimandato durante la ristrutturazione.

Nulla può essere rimandato solo nel report di chat.

Se una fase decide di non risolvere qualcosa, deve registrarlo qui.

---

# REGOLA FONDAMENTALE

```txt
Deferred non significa dimenticato.
Deferred significa tracciato, assegnato e pianificato.
```

Ogni item rimandato deve avere:

```txt
ID
titolo
descrizione
owner
fase target
motivo del rinvio
rischio
condizione di chiusura
stato
```

---

# STATI CONSENTITI

```txt
OPEN
IN_PROGRESS
RESOLVED
CANCELLED
```

---

# TEMPLATE ITEM

```txt
ID:
TITLE:
STATUS:
SOURCE_PHASE:
OWNER:
TARGET_PHASE:
FILES_INVOLVED:
DESCRIPTION:
WHY_DEFERRED:
RISK:
RESOLUTION_RULE:
CLOSE_WHEN:
NOTES:
```

---

# REGOLE

È vietato chiudere una fase lasciando un problema rimandato solo nel `PHASE_REPORT`.

Ogni voce in `RISKS`, `BLOCKERS`, `NEXT_PHASE`, `deferito`, `fuori scope`, `da consolidare`, `da riprendere`, `owner non valido`, `duplicazione residua` deve diventare un item in questo documento.

Se un deferred item viene risolto, aggiornare lo stato a:

```txt
RESOLVED
```

e aggiungere:

```txt
RESOLVED_IN_PHASE:
RESOLUTION_SUMMARY:
FILES_CHANGED:
```

---

# DEFERRED ITEMS ATTIVI

## D-001 — Consolidamento route pubbliche Area Impresa

```txt
ID: D-001
TITLE: Consolidare route pubbliche Area Impresa
STATUS: RESOLVED
SOURCE_PHASE: Phase 3 — Area Impresa Public
OWNER: app routing / area-impresa public
TARGET_PHASE: dopo Phase 4-8 oppure fase dedicata routing consolidation
FILES_INVOLVED:
  apps/web/src/app/(public-business)/area-impresa/**
  apps/web/src/app/(area-impresa)/area-impresa/**
  apps/web/src/area-impresa/public/**

DESCRIPTION:
Le route pubbliche Area Impresa sono state rese bridge sottili e il codice prodotto è stato spostato in apps/web/src/area-impresa/public.
Fisicamente però restano sotto app/(public-business)/area-impresa per evitare conflitti con l'albero privato ancora presente sotto app/(area-impresa)/area-impresa.

WHY_DEFERRED:
Spostare ora le route avrebbe potuto creare conflitti con il ramo privato non ancora bonificato.

RISK:
Due route group diversi rappresentano ancora lo stesso prodotto.

RESOLUTION_RULE:
Quando le fasi private avranno rimosso i route group vietati, consolidare il routing pubblico/privato Area Impresa in un unico albero coerente.

CLOSE_WHEN:
Non esistono più route Area Impresa pubbliche sotto app/(public-business).
Le route restano invariate.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 9 — Area Impresa Dead Code Cleanup
RESOLUTION_SUMMARY: Tutte le route Area Impresa consolidate in apps/web/src/app/area-impresa/.
  Route pubbliche spostate da app/(public-business)/area-impresa/ (6 page.tsx).
  Route private spostate da app/(area-impresa)/area-impresa/(private)/ (layout.tsx + 13 page.tsx).
  Entrambi i vecchi alberi e i route group legacy eliminati.
  Unico route group rimasto: (private) per layout/guard.
  URL invariati. Typecheck e build passano.
FILES_CHANGED: vedi PHASE_REPORT Fase 9 in 03_ROADMAP.md
```

---

## D-002 — Monitoring sotto apps/web/src/lib con owner non valido

```txt
ID: D-002
TITLE: Ricollocare area-monitoring fuori da lib
STATUS: RESOLVED
SOURCE_PHASE: Phase 2 / Phase 4 / Phase 5 / Phase 7
OWNER: platform/monitoring oppure area-impresa/monitoring
TARGET_PHASE: fase dedicata monitoring oppure quando tutti i consumer Area Impresa sono bonificati
FILES_INVOLVED:
  apps/web/src/lib/area-monitoring.ts
  apps/web/src/lib/area-monitoring.server.ts
  apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts
  apps/web/src/middleware.ts
  apps/web/src/app/api/stripe/webhook/route.ts
  app/(area-impresa)/area-impresa/(private)/**

DESCRIPTION:
I file area-monitoring vivono in apps/web/src/lib, che non è un owner valido secondo 01_ARCHITECTURE.md.
Sono però usati da più consumer, alcuni fuori scope Phase 4.
Phase 5 ha confermato lo stesso problema per apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts
(createPerfTrace): vive dentro app, owner non valido per REGOLA APP ROUTER, ed è usato anche da
(account), (billing), (comunicazioni) — tutti fuori scope Phase 5. Le pagine/azioni opportunità
spostate in Phase 5 continuano a importarlo dal path esistente (nessun duplicato creato).
Phase 7 ha riconfermato lo stesso vincolo: le nuove pagine account (profilo, servizi, notifiche)
importano sia lib/area-monitoring sia _lib/perf-log dai path esistenti (nessun duplicato creato).
Phase 8 ha riconfermato lo stesso vincolo: i nuovi file billing
(area-impresa/private/billing/crediti/credits-page.tsx e actions/create-credit-checkout-action.ts)
importano lib/area-monitoring e _lib/perf-log dagli stessi path esistenti (nessun duplicato creato).
Tutti i consumer Area Impresa (opportunita, comunicazioni, account, billing) ora bonificati tranne
questo owner. Resta aperto perché middleware e stripe webhook sono fuori scope Phase 8.

WHY_DEFERRED:
Spostarli durante Phase 4/5 avrebbe richiesto toccare file vietati oppure creare doppioni temporanei.

RISK:
Owner non valido persistente.
Possibili import legacy trascinati nelle fasi successive.

RESOLUTION_RULE:
Classificare monitoring generico vs Area Impresa-specifico.
Spostare il generico in apps/web/src/platform/monitoring.
Spostare lo specifico (incluso perf-log.ts) in apps/web/src/area-impresa/monitoring.
Aggiornare tutti i consumer in una fase controllata.

CLOSE_WHEN:
apps/web/src/lib/area-monitoring.ts non esiste più.
apps/web/src/lib/area-monitoring.server.ts non esiste più.
apps/web/src/app/(area-impresa)/area-impresa/_lib/perf-log.ts non esiste più.
Nessun import punta a apps/web/src/lib/area-monitoring o a app/(area-impresa)/area-impresa/_lib/perf-log.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 9 — Area Impresa Dead Code Cleanup
RESOLUTION_SUMMARY: Classificazione eseguita: monitoring generico (areaLog, classifyAreaRequest,
  safePath, shortId, ecc.) → platform/monitoring/area-monitoring.ts; specifico Area Impresa
  (traceSideEffect) → area-impresa/monitoring/area-impresa-monitoring.server.ts;
  perf trace → area-impresa/monitoring/area-impresa-perf-trace.ts.
  Tutti e 3 i file originali eliminati. Tutti i consumer aggiornati (24 file: middleware,
  auth/server, stripe webhook, shell, 18 feature files, 2 azioni .server).
  Nessun import legacy residuo. Typecheck e build passano.
FILES_CHANGED: vedi PHASE_REPORT Fase 9 in 03_ROADMAP.md
```

---

## D-003 — Duplicazione company status policy in billing

```txt
ID: D-003
TITLE: Consolidare company status policy in billing
STATUS: RESOLVED
SOURCE_PHASE: Phase 4
OWNER: packages/domain/company/account
TARGET_PHASE: Phase 8 — Area Impresa Billing
FILES_INVOLVED:
  packages/domain/src/company/account/company-status-policy.ts
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(billing)/crediti/page.tsx
  apps/web/src/area-impresa/private/billing/**

DESCRIPTION:
Phase 4 ha creato isCompanyMarketplaceEnabled nel domain owner.
Resta una logica inline equivalente in billing: company.status === "APPROVED".

WHY_DEFERRED:
Il file billing era fuori scope Phase 4.

RISK:
Regola marketplace duplicata tra shell e billing.

RESOLUTION_RULE:
Durante Phase 8, billing deve riusare isCompanyMarketplaceEnabled o la policy domain corretta.
Eliminare il check inline duplicato.

CLOSE_WHEN:
Nessun check inline company.status === "APPROVED" rimane nel billing web.
La policy è consumata dal package owner.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 8 — Area Impresa Billing
RESOLUTION_SUMMARY: La nuova credits-page.tsx in area-impresa/private/billing/crediti/ usa
  isCompanyMarketplaceEnabled importata da @esigenta/domain invece del check inline
  company.status === "APPROVED". Il vecchio page.tsx (billing route group) eliminato.
  Il check in packages/billing/src/checkout/checkout-order.ts è validazione server-side
  interna al package billing (ownership corretta, non una duplicazione web).
FILES_CHANGED: vedi PHASE_REPORT Fase 8 in 03_ROADMAP.md
```

---

## D-004 — Route group vietato opportunita

```txt
ID: D-004
TITLE: Rimuovere route group vietato (opportunita)
STATUS: RESOLVED
SOURCE_PHASE: Phase 2
OWNER: area-impresa/private/opportunita
TARGET_PHASE: Phase 5 — Area Impresa Opportunità
FILES_INVOLVED:
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(opportunita)/**
  apps/web/src/area-impresa/private/opportunita/**

DESCRIPTION:
Il route group (opportunita) viola l'architettura.
Le route devono restare in app come bridge sottili, mentre il codice prodotto deve vivere in apps/web/src/area-impresa/private/opportunita.

WHY_DEFERRED:
Fuori scope Phase 4.

RISK:
App Router continua a contenere responsabilità prodotto.

RESOLUTION_RULE:
Phase 5 deve eliminare il route group (opportunita), creare bridge sottili e spostare/riscrivere il codice nel feature owner.

CLOSE_WHEN:
Il path (private)/(opportunita) non esiste più.
Le route /area-impresa/richieste* sono in app come bridge sottili.
Il codice prodotto vive in area-impresa/private/opportunita.

RESOLVED_IN_PHASE: Phase 5 — Area Impresa Opportunità
RESOLUTION_SUMMARY: Route group (opportunita) eliminato. Le 4 route (/area-impresa/richieste,
  /area-impresa/richieste/[id], /area-impresa/richieste-salvate, /area-impresa/richieste-acquistate)
  sono ora bridge sottili in apps/web/src/app/(area-impresa)/area-impresa/(private)/{richieste,
  richieste-salvate,richieste-acquistate}/ (flat, nessun route group di prodotto). Il codice
  prodotto vive in apps/web/src/area-impresa/private/opportunita/{components,actions,view-models,
  richieste,richiesta-dettaglio,richieste-salvate,richieste-acquistate}/.
FILES_CHANGED: vedi PHASE_REPORT Fase 5 in 03_ROADMAP.md
```

---

## D-005 — Route group vietato comunicazioni

```txt
ID: D-005
TITLE: Rimuovere route group vietato (comunicazioni)
STATUS: RESOLVED
SOURCE_PHASE: Phase 2
OWNER: area-impresa/private/comunicazioni
TARGET_PHASE: Phase 6 — Area Impresa Comunicazioni
FILES_INVOLVED:
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(comunicazioni)/**
  apps/web/src/area-impresa/private/comunicazioni/**

DESCRIPTION:
Il route group (comunicazioni) viola l'architettura.

WHY_DEFERRED:
Fuori scope Phase 4 e Phase 5.

RISK:
App Router continua a contenere responsabilità prodotto.

RESOLUTION_RULE:
Phase 6 deve eliminare il route group e lasciare in app solo bridge sottili.

CLOSE_WHEN:
Il path (private)/(comunicazioni) non esiste più.
Codice prodotto in area-impresa/private/comunicazioni.

RESOLVED_IN_PHASE: Phase 6 — Area Impresa Comunicazioni
RESOLUTION_SUMMARY: Route group (comunicazioni) eliminato. Le 4 route (/area-impresa/contatti,
  /area-impresa/contatti/[conversationId], /area-impresa/assistenza,
  /area-impresa/assistenza/[conversationId]) sono ora bridge sottili in
  apps/web/src/app/(area-impresa)/area-impresa/(private)/{contatti,assistenza}/ (flat). Il
  codice prodotto vive in apps/web/src/area-impresa/private/comunicazioni/{contatti,assistenza,
  conversazione,actions,view-models}/.
FILES_CHANGED: vedi PHASE_REPORT Fase 6 in 03_ROADMAP.md
```

---

## D-006 — Route group vietato account

```txt
ID: D-006
TITLE: Rimuovere route group vietato (account)
STATUS: RESOLVED
SOURCE_PHASE: Phase 2
OWNER: area-impresa/private/account
TARGET_PHASE: Phase 7 — Area Impresa Account
FILES_INVOLVED:
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(account)/**
  apps/web/src/area-impresa/private/account/**

DESCRIPTION:
Il route group (account) viola l'architettura.

WHY_DEFERRED:
Fuori scope Phase 4-6.

RISK:
App Router continua a contenere responsabilità prodotto.

RESOLUTION_RULE:
Phase 7 deve eliminare il route group e lasciare in app solo bridge sottili.

CLOSE_WHEN:
Il path (private)/(account) non esiste più.
Codice prodotto in area-impresa/private/account.

RESOLVED_IN_PHASE: Phase 7 — Area Impresa Account
RESOLUTION_SUMMARY: Route group (account) eliminato. Le 3 route (/area-impresa/profilo,
  /area-impresa/configura-servizi, /area-impresa/notifiche) sono ora bridge sottili in
  apps/web/src/app/(area-impresa)/area-impresa/(private)/{profilo,configura-servizi,notifiche}/
  (flat). Il codice prodotto vive in apps/web/src/area-impresa/private/account/{profilo,servizi,
  notifiche,actions}/. copertura/ e view-models/ restano vuote (nessuna feature reale da
  popolare oggi).
FILES_CHANGED: vedi PHASE_REPORT Fase 7 in 03_ROADMAP.md
```

---

## D-007 — Route group vietato billing

```txt
ID: D-007
TITLE: Rimuovere route group vietato (billing)
STATUS: RESOLVED
SOURCE_PHASE: Phase 2
OWNER: area-impresa/private/billing
TARGET_PHASE: Phase 8 — Area Impresa Billing
FILES_INVOLVED:
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(billing)/**
  apps/web/src/area-impresa/private/billing/**

DESCRIPTION:
Il route group (billing) viola l'architettura.

WHY_DEFERRED:
Fuori scope Phase 4-7.

RISK:
App Router continua a contenere responsabilità prodotto.
La logica billing rischia di restare nel posto sbagliato.

RESOLUTION_RULE:
Phase 8 deve eliminare il route group e separare UI web da packages/billing.

CLOSE_WHEN:
Il path (private)/(billing) non esiste più.
Codice web in area-impresa/private/billing.
Logica vera in packages/billing.

RESOLVED_IN_PHASE: Phase 8 — Area Impresa Billing
RESOLUTION_SUMMARY: Route group (billing) eliminato. La route /area-impresa/crediti è ora
  un bridge sottile in apps/web/src/app/(area-impresa)/area-impresa/(private)/crediti/page.tsx.
  Il codice prodotto vive in apps/web/src/area-impresa/private/billing/{crediti,actions}/.
  La logica billing vera resta in packages/billing (invariata).
FILES_CHANGED: vedi PHASE_REPORT Fase 8 in 03_ROADMAP.md
```

---

## D-008 — uploadthing sotto apps/web/src/lib

```txt
ID: D-008
TITLE: Ricollocare uploadthing fuori da lib
STATUS: RESOLVED
SOURCE_PHASE: Phase 3 / Phase 4
OWNER: platform/uploads
TARGET_PHASE: fase dedicata platform oppure quando un consumer upload entra nello scope
FILES_INVOLVED:
  apps/web/src/lib/uploadthing.ts
  apps/web/src/platform/uploads/**
  apps/web/src/richiesta/flow/components/request-photo-upload.tsx

DESCRIPTION:
uploadthing vive sotto apps/web/src/lib, owner non valido.
Phase 10 ha spostato l'unico consumer (photo-upload-step.tsx → request-photo-upload.tsx) in
richiesta/flow/components/, ma lib/uploadthing.ts resta dove è perché il suo spostamento
richiede toccare anche il server (apps/web/src/app/api/uploadthing/route.ts) e l'config di
uploadthing che rimandano entrambi al profilo platform/uploads.

WHY_DEFERRED:
Fuori scope Phase 3 e Phase 4. Phase 10 ha aggiornato il consumer (path
../../../lib/uploadthing da richiesta/flow/components/) senza spostare il file lib.

RISK:
Persistenza di apps/web/src/lib come cartella cestino.

RESOLUTION_RULE:
Spostare o riscrivere uploadthing in apps/web/src/platform/uploads quando lo scope lo consente.

CLOSE_WHEN:
apps/web/src/lib/uploadthing.ts non esiste più.
Nessun import punta a lib/uploadthing.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 14 — Platform / UI / Shared Owner Cleanup
RESOLUTION_SUMMARY: uploadthing.ts spostato da lib/ a platform/uploads/uploadthing.ts.
  Import interno aggiornato da ../app/ a ../../app/api/uploadthing/core (profondità aumentata di 1).
  Consumer request-photo-upload.tsx aggiornato da ../../../lib/uploadthing a
  ../../../platform/uploads/uploadthing.
  lib/uploadthing.ts eliminato. lib/ directory eliminata (era già l'unico file rimasto).
  platform/uploads/.gitkeep eliminato (sostituito da file reale).
FILES_CHANGED:
  apps/web/src/platform/uploads/uploadthing.ts (creato)
  apps/web/src/richiesta/flow/components/request-photo-upload.tsx (import aggiornato)
  apps/web/src/lib/uploadthing.ts (eliminato)
  apps/web/src/lib/ (eliminata — vuota dopo rimozione)
  apps/web/src/platform/uploads/.gitkeep (eliminato)
```

---

## D-012 — city-autocomplete sotto apps/web/src/components/location con owner non valido

```txt
ID: D-012
TITLE: Ricollocare city-autocomplete fuori da components/location
STATUS: RESOLVED
SOURCE_PHASE: Phase 10 — Richiesta Flow
OWNER: ui/location
TARGET_PHASE: Phase 12 — Site Home/Legal/Shell (quando components/ viene bonificata) oppure Phase 14 — Packages Ownership Audit
FILES_INVOLVED:
  apps/web/src/components/location/city-autocomplete.tsx
  apps/web/src/richiesta/flow/components/request-step-ui.tsx
  apps/web/src/area-impresa/private/account/profilo/company-location-fields.tsx
  apps/web/src/area-impresa/public/marketing/company-lead-form.tsx

DESCRIPTION:
city-autocomplete.tsx vive in apps/web/src/components/location/, che non è un owner valido
secondo 01_ARCHITECTURE.md (gli owner validi sono: app, site, richiesta, area-impresa, ui,
platform, auth). Il componente è usato da tre owner distinti:
1. richiesta/flow/components/ (dopo Phase 10)
2. area-impresa/private/account/profilo/
3. area-impresa/public/marketing/
Questo lo rende shared e non assegnabile a un singolo macro-owner senza cross-boundary.

WHY_DEFERRED:
Phase 10 tocca solo richiesta/flow. Spostare city-autocomplete avrebbe richiesto aggiornare
anche i file area-impresa (vietato in Phase 10). Il componente non è toccabile atomicamente
senza scope che include entrambi i macro-owner.

RISK:
Cross-boundary import da richiesta → components/ (non owner valido).
Stessa violazione già esistente in area-impresa → components/.
lib/ e components/ restano cartelle cestino.

RESOLUTION_RULE:
Decidere l'owner corretto tra:
1. platform/location/ (infrastruttura geo, condivisa tra prodotti)
2. ui/ (se sufficientemente generico e non lega a Esigenta)
3. packages/shared (se estratto come utility pura)
Aggiornare tutti e tre i consumer atomicamente.

CLOSE_WHEN:
apps/web/src/components/location/city-autocomplete.tsx non esiste più.
Tutti e tre i consumer importano dal nuovo owner.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 14 — Platform / UI / Shared Owner Cleanup
RESOLUTION_SUMMARY: Owner scelto: ui/location/ (componente puramente visuale, nessuna logica
  domain-specifica, usato da owner distinti senza legame a uno specifico macro-owner).
  city-autocomplete.tsx spostato in ui/location/city-autocomplete.tsx.
  Import interno (cookie-consent-storage) invariato: percorso relativo ../../site/shell/
  è identico da ui/location/ e da components/location/ (stessa profondità da src/).
  Tutti e tre i consumer aggiornati atomicamente.
  components/location/ eliminata. ui/.gitkeep eliminato (sostituito da file reale).
FILES_CHANGED:
  apps/web/src/ui/location/city-autocomplete.tsx (creato)
  apps/web/src/richiesta/flow/components/request-step-ui.tsx (import aggiornato)
  apps/web/src/area-impresa/private/account/profilo/company-location-fields.tsx (import aggiornato)
  apps/web/src/area-impresa/public/marketing/company-lead-form.tsx (import aggiornato)
  apps/web/src/components/location/city-autocomplete.tsx (eliminato)
  apps/web/src/components/location/ (eliminata)
  apps/web/src/ui/.gitkeep (eliminato)
```

---

## D-009 — Shared messaging cross-boundary tra messaggi/accesso e Area Impresa

```txt
ID: D-009
TITLE: Spostare message-thread/send-message-form in area-impresa/shared-messaging
STATUS: RESOLVED
SOURCE_PHASE: Phase 2
OWNER: area-impresa/shared-messaging
TARGET_PHASE: Phase 6 — Area Impresa Comunicazioni
FILES_INVOLVED:
  apps/web/src/app/(area-impresa)/area-impresa/_components/message-thread.tsx
  apps/web/src/app/(area-impresa)/area-impresa/_components/send-message-form.tsx
  apps/web/src/app/(public)/messaggi/accesso/page.tsx
  apps/web/src/area-impresa/shared-messaging/**

DESCRIPTION:
apps/web/src/app/(public)/messaggi/accesso/page.tsx (owner richiesta/cliente soft) importa
direttamente message-thread.tsx e send-message-form.tsx da dentro l'albero app di Area Impresa
((area-impresa)/area-impresa/_components/), senza un owner condiviso. La stessa action chiama
anche revalidatePath("/area-impresa", "layout") da una route cliente, una revalidation
cross-prodotto ampia.

WHY_DEFERRED:
Fuori scope Phase 2 (audit read-only), Phase 3 (solo public Area Impresa) e Phase 4 (solo shell).
La cartella area-impresa/shared-messaging esiste già vuota (creata in Phase 1) ma popolarla
richiede toccare anche /messaggi/accesso, fuori da ogni scope finora dichiarato.

RISK:
Owner condiviso assente: due prodotti diversi (richiesta, area-impresa) dipendono da componenti
fisicamente dentro l'albero app di un terzo. Revalidation troppo ampia da una route cliente.

RESOLUTION_RULE:
Spostare message-thread.tsx e send-message-form.tsx in area-impresa/shared-messaging/.
Aggiornare l'import in messaggi/accesso/page.tsx e nei consumer privati di comunicazioni.
Valutare se restringere il revalidatePath("/area-impresa", "layout") a un target più mirato.

CLOSE_WHEN:
apps/web/src/app/(area-impresa)/area-impresa/_components/message-thread.tsx non esiste più.
apps/web/src/app/(area-impresa)/area-impresa/_components/send-message-form.tsx non esiste più.
area-impresa/shared-messaging/ contiene i componenti reali, non solo .gitkeep.
messaggi/accesso/page.tsx importa dal nuovo owner condiviso.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 6 — Area Impresa Comunicazioni
RESOLUTION_SUMMARY: message-thread.tsx e send-message-form.tsx spostati in
  apps/web/src/area-impresa/shared-messaging/ (send-message-form.tsx riscritto "use client" con
  useFormStatus per il feedback di invio, vedi UX_FEEDBACK_ADDED nel report Fase 6).
  messaggi/accesso/page.tsx aggiornato per importare dal nuovo owner (solo path, nessun'altra
  modifica al flow cliente, come richiesto dallo scope Fase 6). La revalidatePath ampia
  ("/area-impresa", "layout") in messaggi/accesso NON è stata restretta: era fuori dallo scope
  consentito ("solo aggiornare import"). Tracciata separatamente come D-010.
FILES_CHANGED: vedi PHASE_REPORT Fase 6 in 03_ROADMAP.md
```

---

## D-010 — revalidatePath ampia in messaggi/accesso

```txt
ID: D-010
TITLE: Restringere revalidatePath("/area-impresa", "layout") in messaggi/accesso
STATUS: RESOLVED
SOURCE_PHASE: Phase 6
OWNER: richiesta / area-impresa (boundary tra i due)
TARGET_PHASE: Phase 11 — Richiesta Stato/Verifica/Messaggi (quando /messaggi/accesso viene
  ricostruito) oppure Phase 15 — Performance Rewrite P0
FILES_INVOLVED:
  apps/web/src/app/(public)/messaggi/accesso/page.tsx

DESCRIPTION:
L'azione sendCustomerMessageAction in messaggi/accesso/page.tsx chiama
revalidatePath("/area-impresa", "layout") da una route cliente — una revalidation cross-prodotto
ampia (invalida l'intero layout Area Impresa per un evento che riguarda solo i contatori unread
della shell).

WHY_DEFERRED:
Fase 6 poteva toccare /messaggi/accesso solo per correggere l'import cross-boundary (D-009), non
per riscrivere il flow cliente. Restringere la revalidation è un cambiamento di comportamento,
non un fix di path.

RISK:
Revalidation più ampia del necessario ad ogni messaggio cliente; basso impatto ma non a costo
zero (REGOLA PERFORMANCE: "revalidatePath troppo ampio" è esplicitamente vietato).

RESOLUTION_RULE:
Quando /messaggi/accesso o il flow richiesta/comunicazioni verranno ricostruiti, valutare un
target di revalidation più mirato (es. solo il path della conversazione e/o un tag dedicato ai
contatori shell) invece di "/area-impresa" intero.

CLOSE_WHEN:
revalidatePath in messaggi/accesso non invalida più l'intero layout Area Impresa per un singolo
messaggio cliente.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 11 — Richiesta Stato/Verifica/Messaggi
RESOLUTION_SUMMARY: sendCustomerMessageAction riscritto in
  richiesta/comunicazioni/customer-conversation-page.tsx. revalidatePath cambiato da
  revalidatePath("/area-impresa", "layout") a due chiamate mirate:
  revalidatePath(`/area-impresa/contatti/${conversationId}`) e
  revalidatePath("/area-impresa/contatti"). L'intero layout /area-impresa non viene più
  invalidato per ogni messaggio cliente.
FILES_CHANGED:
  apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx (nuovo)
  apps/web/src/app/(public)/messaggi/accesso/page.tsx (eliminato)
```

---

## D-011 — Billing credit expiration policy must become FEFO

```txt
ID: D-011
TITLE: Billing credit expiration policy must become FEFO
STATUS: RESOLVED
SOURCE_PHASE: Phase 8 — Area Impresa Billing
OWNER: packages/billing
TARGET_PHASE: Phase 8.2 — Billing FEFO Credit Lots Rewrite
FILES_INVOLVED:
  packages/billing/**
  packages/database/prisma/schema.prisma se serve migration
  apps/web/src/area-impresa/private/billing/**
  docs/architetture/04_DEFERRED_ITEMS.md

DESCRIPTION:
La Phase 8 ha verificato che il modello attuale è global rolling ledger: saldo globale + expiresAt globale.
Questo modello non è la policy finale desiderata per Esigenta perché i pacchetti crediti possono avere durate diverse.
La policy finale deve usare lotti crediti separati con scadenza propria e consumo FEFO.

WHY_DEFERRED:
La Phase 8 era già focalizzata su route group billing, bridge, checkout P0, D-003 e D-007.
La correzione FEFO richiede audit più ampio del modello dati, eventuale migration, backfill e riscrittura della policy di consumo/accredito crediti.
Non deve essere fatta come patch dentro Phase 8 appena chiusa.

RISK:
Rischio economico/funzionale: una ricarica può estendere o alterare la scadenza dell'intero saldo crediti invece di mantenere la scadenza del singolo pacchetto.
Con pacchetti Base/Medio/Top a durate diverse, il saldo globale con expiresAt globale può produrre scadenze non coerenti.

RESOLUTION_RULE:
Implementare credit lots in packages/billing.
Ogni acquisto deve creare un lotto crediti con:
- quantità iniziale
- quantità residua
- expiresAt proprio
- riferimento acquisto/payment/checkout
- stato valido/scaduto/consumato

Il consumo deve usare FEFO:
- first expiring, first out
- consumare prima i crediti con scadenza più vicina
- ignorare lotti scaduti
- nessun nuovo acquisto deve estendere automaticamente la scadenza dei lotti precedenti

CLOSE_WHEN:
- Esiste una policy FEFO unica in packages/billing.
- Ogni acquisto genera o aggiorna un lotto separato corretto.
- Il consumo crediti usa FEFO.
- Il saldo disponibile è derivato dai lotti validi, non da un expiresAt globale ambiguo.
- I crediti scaduti non sono consumabili.
- Eventuale migration/backfill completata.
- Typecheck/build passano.
- Test o invarianti billing documentano la policy.

RESOLVED_IN_PHASE: Phase 8.2 — Billing FEFO Credit Lots Rewrite
RESOLUTION_SUMMARY: Introdotto il modello CreditLot (+ CreditLotConsumption) in
  packages/database/prisma/schema.prisma, additivo (nessuna colonna esistente
  toccata). Migration preparata in packages/database/prisma/migrations/
  20260617120000_credit_lots_fefo/migration.sql con backfill del saldo globale
  pre-FEFO in lotti LEGACY_MIGRATION (creditOrderId NULL, onestamente non
  attribuibile a un singolo acquisto). Nuovo modulo condiviso
  packages/billing/src/credits/lot-ledger.ts (REGOLA ANTI-RIDONDANZA: unica
  fonte delle primitive FEFO, riusata da ledger.ts, fulfillment.ts,
  admin/credit-ledger.ts, get-credits-page.ts invece di duplicare 4 copie
  della stessa logica di scadenza globale che esisteva prima). Debit
  (ledger.ts) ora consuma FEFO sui lotti attivi con lock+piano in due fasi
  (necessario perché CreditLotConsumption ha FK verso CompanyCreditTransaction,
  che deve esistere prima di scrivere le righe di consumo). Grant
  (fulfillment.ts) crea un nuovo lotto per acquisto con expiresAt proprio,
  senza mai estendere lotti precedenti. Refund (admin/credit-ledger.ts) crea
  un nuovo lotto REFUND con floor di validità invece di toccare l'expiresAt
  globale. CompanyCreditAccount.balance/expiresAt diventano una cache
  mantenuta (non più source of truth): balance = somma lotti attivi,
  expiresAt = MAX (non MIN) scadenza lotto attivo. La scelta del MAX (non
  della scadenza più vicina) è deliberata: protegge l'unico consumer esterno
  a packages/billing che legge ancora il campo globale,
  packages/domain/src/company/profile/get-profile-page.ts (fuori scope
  Phase 8.2, non toccato), dal marcare a zero il saldo cache quando scade solo
  il lotto più vicino mentre altri lotti restano validi — il suo controllo
  legacy "expiresAt <= now => balance 0" scatta solo quando TUTTI i lotti sono
  davvero scaduti, quindi resta corretto. Residuo non bloccante tracciato in
  D-018. La UI crediti (credits-page.tsx) mostra ora il breakdown per lotto e
  la prossima scadenza reale (MIN tra i lotti attivi), non il MAX di cache.
  Contratto esterno di debitCompanyCreditsInTransaction (usato da
  packages/domain/src/company/requests/unlock-request.ts) preservato
  identico: stessa input/output shape, stessi error code letterali
  ("insufficient_credits" ecc.).
FILES_CHANGED: vedi PHASE_REPORT Fase 8.2 in 03_ROADMAP.md
```

---

## D-013 — richiesta/comunicazioni importa da area-impresa/shared-messaging

```txt
ID: D-013
TITLE: Spostare shared-messaging in owner neutro (ui/ o platform/)
STATUS: RESOLVED
SOURCE_PHASE: Phase 11 — Richiesta Stato/Verifica/Messaggi
OWNER: ui/messaging
TARGET_PHASE: Phase 14 — Packages Ownership Audit oppure Phase 15 — Performance Rewrite P0
FILES_INVOLVED:
  apps/web/src/area-impresa/shared-messaging/message-thread.tsx
  apps/web/src/area-impresa/shared-messaging/send-message-form.tsx
  apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx
  apps/web/src/area-impresa/private/comunicazioni/conversazione/conversation-page.tsx

DESCRIPTION:
richiesta/comunicazioni/customer-conversation-page.tsx importa MessageThread e SendMessageForm
da area-impresa/shared-messaging/. Questa è una violazione del boundary richiesta: il dominio
richiesta non deve dipendere dal codice area-impresa. D-009 aveva risolto il problema fisico
(componenti spostati fuori da app/_components in area-impresa/shared-messaging/) ma non ha
risolto il problema del boundary logico — shared-messaging è ancora "dentro" area-impresa.
La soluzione corretta è spostare i componenti in un owner neutro (ui/ per componenti puramente
visuali, platform/ se contengono logica infrastrutturale).

WHY_DEFERRED:
Phase 11 ha come vincolo "Non toccare area-impresa/**". Spostare shared-messaging richiede
aggiornare anche i consumer area-impresa (comunicazioni/contatti, comunicazioni/assistenza),
che è vietato nello scope di questa fase.

RISK:
Cross-boundary import persistente: richiesta dipende da area-impresa.
Inversione di dipendenza se area-impresa in futuro dipende da richiesta.

RESOLUTION_RULE:
Decidere owner definitivo: ui/ se i componenti sono UI puri (no business logic domain-specifica),
platform/ se contengono logica di presentazione infrastrutturale.
Spostare message-thread.tsx e send-message-form.tsx nel nuovo owner.
Aggiornare tutti i consumer (richiesta/comunicazioni e area-impresa/private/comunicazioni).

CLOSE_WHEN:
apps/web/src/area-impresa/shared-messaging/ non esiste più (o è vuota con solo .gitkeep).
MessageThread e SendMessageForm importati dal nuovo owner neutro in tutti i consumer.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 14 — Platform / UI / Shared Owner Cleanup
RESOLUTION_SUMMARY: Owner scelto: ui/messaging/ (MessageThread e SendMessageForm sono componenti
  puramente visuali: nessuna chiamata domain, nessuna server action propria, nessuna logica
  business-specifica — solo presentazione con props tipate su @esigenta/domain types).
  message-thread.tsx e send-message-form.tsx spostati in ui/messaging/.
  I due consumer area-impresa aggiornati (conversation-page.tsx usa ../../../shared-messaging →
  ../../../../ui/messaging). I due consumer richiesta aggiornati (customer-conversation-page.tsx
  usa ../../area-impresa/shared-messaging → ../../ui/messaging).
  area-impresa/shared-messaging/ directory eliminata.
  Cross-boundary richiesta → area-impresa eliminato.
FILES_CHANGED:
  apps/web/src/ui/messaging/message-thread.tsx (creato)
  apps/web/src/ui/messaging/send-message-form.tsx (creato)
  apps/web/src/richiesta/comunicazioni/customer-conversation-page.tsx (import aggiornati)
  apps/web/src/area-impresa/private/comunicazioni/conversazione/conversation-page.tsx (import aggiornati)
  apps/web/src/area-impresa/shared-messaging/message-thread.tsx (eliminato)
  apps/web/src/area-impresa/shared-messaging/send-message-form.tsx (eliminato)
  apps/web/src/area-impresa/shared-messaging/ (directory eliminata)
```

---

## D-014 — Request verification URL should become single token path

```txt
ID: D-014
TITLE: Request verification URL should become single token path
STATUS: RESOLVED
SOURCE_PHASE: Phase 11 — Richiesta Stato / Verifica / Messaggi
OWNER: packages/domain oppure packages/funnel, da confermare in audit
TARGET_PHASE: fase futura request verification/domain cleanup
FILES_INVOLVED:
  packages/domain/src/internal/request/request-links.ts
  apps/web/src/richiesta/verifica/**
  apps/web/src/app/verifica-richiesta/**

DESCRIPTION:
L'architettura target prevede /verifica-richiesta/[token], ma il domain oggi usa requestId +
token separati in query string. Phase 11 ha rinominato il segmento a /verifica-richiesta
mantenendo query params (?requestId=...&token=...) per non cambiare la policy domain.

WHY_DEFERRED:
Convertire a token singolo richiede modifica domain/funnel della policy link verifica e
possibile compatibilità con link già emessi (emails in volo con vecchi URL).

RISK:
URL verifica non ancora allineato al target architetturale (/verifica-richiesta/[token]).
Due parametri in query string invece di uno solo nel path.

RESOLUTION_RULE:
Introdurre un token unico di verifica che encoda requestId + token.
Aggiornare buildRequestVerificationUrl in request-links.ts.
Aggiornare route da page.tsx query-params a [token]/page.tsx path param.
Gestire compatibilità legacy per link già emessi con redirect da ?requestId=&token= a /[token].

CLOSE_WHEN:
La route /verifica-richiesta/[token] è attiva.
I link nuovi usano token singolo.
I vecchi link query params sono gestiti con redirect/compatibilità.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 15.1 — Deferred Items Closure
RESOLUTION_SUMMARY: Audit ha rivelato che CustomerAccessToken (purpose REQUEST_VERIFICATION)
  memorizza già tokenHash + requestId nella stessa riga da quando create-request.ts crea una
  richiesta (createRequestVerificationAccessToken). Il requestId nell'URL era quindi già
  ridondante per il lookup: serviva solo come cross-check, non come chiave di ricerca. La
  legacy verifyWithLegacyStructuredDataToken (token dentro Request.structuredData, pre-esistente
  alla tabella CustomerAccessToken) resta l'UNICO caso che richiede davvero requestId nell'URL,
  ed è raggiungibile solo dalla route legacy.
  Implementato: nuova funzione verifyRequestEmailByToken(token) in
  packages/domain/src/customer/requests/verify-request.ts — risolve il requestId dal token
  (findValidRequestVerificationAccessToken) prima di caricare la Request, poi riusa
  verifyWithAccessToken esistente (nessuna duplicazione di logica transazionale).
  buildRequestVerificationUrl in request-links.ts riscritta per generare
  /verifica-richiesta/[token] (path param singolo) invece di ?requestId=&token=; unico
  chiamante (create-request.ts) aggiornato.
  Nuova route apps/web/src/app/verifica-richiesta/[token]/page.tsx (bridge sottile) +
  request-verification-page.tsx aggiornata per dispatchare a verifyRequestEmailByToken quando
  requestId è assente (nuovo link) e a verifyRequestEmail quando è presente (vecchio link).
  COMPATIBILITÀ: la vecchia route apps/web/src/app/verifica-richiesta/page.tsx
  (?requestId=&token=) NON è stata toccata né rimossa — resta attiva e funzionante invariata
  per i link già emessi (anche quelli sulla legacy structuredData token, che restano
  raggiungibili solo da questa route). Le due route coesistono senza conflitto in Next.js App
  Router (page.tsx vs [token]/page.tsx sono segmenti distinti). Nessun redirect necessario:
  nessun link esistente cambia comportamento.
FILES_CHANGED:
  packages/domain/src/internal/request/request-links.ts (buildRequestVerificationUrl riscritta)
  packages/domain/src/public/requests/create-request.ts (chiamata aggiornata)
  packages/domain/src/customer/requests/verify-request.ts (verifyRequestEmailByToken aggiunta)
  packages/domain/src/customer/requests/index.ts (export aggiunto)
  apps/web/src/richiesta/verifica/request-verification-page.tsx (dispatch legacy/nuovo)
FILES_CREATED:
  apps/web/src/app/verifica-richiesta/[token]/page.tsx
FILES_DELETED: nessuno (apps/web/src/app/verifica-richiesta/page.tsx invariata, per compat)
```

---

## D-015 — area-impresa importa PublicShell da components/layout (shim residuo)

```txt
ID: D-015
TITLE: Migra area-impresa/public/* da components/layout/public-shell shim a site/shell/public-shell
STATUS: RESOLVED
SOURCE_PHASE: Phase 12 — Site Home / Legal / Shell
OWNER: area-impresa/public
TARGET_PHASE: Phase 12.1 — Remove PublicShell Shim
FILES_INVOLVED:
  apps/web/src/components/layout/public-shell.tsx (shim re-export)
  apps/web/src/area-impresa/public/auth/login-page.tsx
  apps/web/src/area-impresa/public/auth/signup-page.tsx
  apps/web/src/area-impresa/public/marketing/area-impresa-marketing-page.tsx

DESCRIPTION:
Phase 12 ha spostato PublicShell in site/shell/public-shell.tsx (owner canonico).
I file area-impresa/public/* non potevano essere toccati (vincolo fase "non toccare area-impresa/**").
components/layout/public-shell.tsx è stato ridotto a un singolo re-export shim verso
site/shell/public-shell.tsx per mantenere compat senza duplicare l'implementazione.
La componente effettiva esiste in un solo posto (site/shell), ma il path legacy resta attivo.

WHY_DEFERRED:
Phase 12 non può toccare apps/web/src/area-impresa/**. I tre consumer area-impresa/public/*
importano da components/layout/public-shell con path relativo che non possiamo aggiornare
atomicamente in questa fase.

RISK:
Shim aggiuntivo mantenuto vivo da consumer che non sappiamo quando migrare.
components/layout/ resta non-vuota (contiene solo lo shim) invece di essere eliminata.

RESOLUTION_RULE:
Aggiornare i tre consumer area-impresa/public/* per importare direttamente da
../../site/shell/public-shell (o path relativo equivalente).
Eliminare components/layout/public-shell.tsx.
Eliminare components/layout/ se vuota.

CLOSE_WHEN:
components/layout/public-shell.tsx non esiste più.
Tutti i consumer area-impresa/public/* importano da site/shell/public-shell.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 12.1 — Remove PublicShell Shim
RESOLUTION_SUMMARY: I tre consumer area-impresa/public/* aggiornati per importare direttamente
  da ../../../site/shell/public-shell. Shim components/layout/public-shell.tsx eliminato.
  Cartella components/layout/ diventata vuota ed eliminata.
FILES_CHANGED:
  area-impresa/public/auth/login-page.tsx (import aggiornato)
  area-impresa/public/auth/signup-page.tsx (import aggiornato)
  area-impresa/public/marketing/area-impresa-marketing-page.tsx (import aggiornato)
  components/layout/public-shell.tsx (eliminato)
  components/layout/ (eliminata — era vuota)
```

---

## D-016 — revalidatePath troppo ampia in notifiche/messaggi/assistenza impresa

```txt
ID: D-016
TITLE: Restringere revalidatePath("/area-impresa", "layout") in mark-notification-read-action, send-message-action, open-support-action
STATUS: RESOLVED
SOURCE_PHASE: Phase 15 — Performance Rewrite P0
OWNER: area-impresa/private/shell (getAreaImpresaShellCounts) + area-impresa/private/account,
  area-impresa/private/comunicazioni (chiamanti)
TARGET_PHASE: fase dedicata "Area Impresa Shell Cache Tags" (richiede di toccare
  apps/web/src/area-impresa/private/shell/**, fuori scope sia di Phase 15 che di Phase 15.1)
FILES_INVOLVED:
  apps/web/src/area-impresa/private/account/actions/mark-notification-read-action.ts
  apps/web/src/area-impresa/private/comunicazioni/actions/send-message-action.ts
  apps/web/src/area-impresa/private/comunicazioni/actions/open-support-action.ts
  apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx
  packages/domain/src/company/shell/get-shell-counts.ts

DESCRIPTION:
Audit Phase 15.1 ha trovato TRE call site (non due come tracciato originariamente) che
chiamano revalidatePath("/area-impresa", "layout") subito dopo una revalidation specifica già
corretta:
  mark-notification-read-action.ts:44,74 — dopo revalidatePath("/area-impresa/notifiche")
  send-message-action.ts:104 — dopo revalidatePath(listPath)
  open-support-action.ts:56 — dopo revalidatePath("/area-impresa/assistenza")

ROOT CAUSE (confermata leggendo apps/web/node_modules/next/dist/docs, come richiesto da
AGENTS.md "questa non è il Next.js che conosci"): revalidatePath(path, "layout") invalida IL
LAYOUT che avvolge quel path e tutte le pagine sottostanti. L'intero albero
/area-impresa/(private) condivide UN SOLO layout (area-impresa-private-layout.tsx), che è
anche dove vive il badge contatori non letti della sidebar (getAreaImpresaShellCounts).
Per la doc staleTimes.md: "shared layouts won't automatically be refetched on every
navigation, only the page segment that changes" — quindi senza una revalidation che tocchi
esplicitamente il layout, il badge sidebar NON si aggiornerebbe dopo queste azioni (non è un
bug a costo zero da rimuovere: è una vera dipendenza funzionale). Dato che esiste UN SOLO
layout per tutto l'albero, revalidatePath(qualsiasi-path-sotto-quell'albero, "layout") ha
SEMPRE lo stesso raggio d'azione: non esiste un modo di "restringere" passando un path diverso
con type="layout", il raggio è definito dal layout condiviso, non dal path passato.

WHY_DEFERRED (aggiornato, Phase 15.1):
La fix architetturale corretta è disaccoppiare i contatori sidebar dalla revalidation di
pagina, avvolgendo getAreaImpresaShellCounts in unstable_cache con un tag (es.
`shell-counts:${companyId}`) e sostituire revalidatePath(..., "layout") con
revalidateTag(`shell-counts:${companyId}`) nei 3 action file. Questo richiede però modificare
area-impresa-private-layout.tsx (il punto che consuma la funzione e che dovrebbe smettere di
fare una query Prisma diretta ogni render per usare invece la versione cacheata-con-tag) —
file che vive in apps/web/src/area-impresa/private/shell/**, esplicitamente FUORI SCOPE sia di
Phase 15 (poteva toccare solo area-impresa/public/** e area-impresa/private/shell/** per altri
motivi, ma non per questo refactor) sia di Phase 15.1 (scope corrente non include
area-impresa/private/shell/**). Non è un fix "cerotto": richiede di introdurre un nuovo layer
di cache con tag, verificarne l'interazione con requireAreaImpresaAccess() e con
isAreaMonitoringEnabled(), e testare che il badge si aggiorni ancora correttamente — un lavoro
dedicato, non una sostituzione di una riga.

RISK:
Revalidation più ampia del necessario a ogni notifica letta, messaggio inviato o apertura
assistenza. Impatto: tutte le pagine sotto /area-impresa/(private) vengono marcate per
re-fetch al prossimo render lato client, non solo quella toccata. Nessun rischio di dati
errati o di sicurezza: il peggio che accade è un render leggermente più costoso del necessario
sulla prossima navigazione. Contrario a REGOLA PERFORMANCE ma non bloccante per il rilascio.

RESOLUTION_RULE:
Quando area-impresa/private/shell/** entra in scope: avvolgere getAreaImpresaShellCounts (o il
suo chiamante nel layout) in unstable_cache con tag `shell-counts:${companyId}`; sostituire le
3 occorrenze di revalidatePath("/area-impresa", "layout") con
revalidateTag(`shell-counts:${companyId}`); verificare che il badge sidebar si aggiorni
correttamente dopo ciascuna delle 3 azioni.

CLOSE_WHEN:
Nessuna delle tre azioni chiama revalidatePath(..., "layout").
Il badge contatori sidebar continua ad aggiornarsi correttamente dopo mark-read/send-message/
open-support.
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 15.2 — D-016 Shell Counts Revalidation Rewrite
RESOLUTION_SUMMARY: Ownership identificata: unreadNotificationCount deriva da
  CompanyNotification.readAt (packages/domain/company/notifications); unreadContactCount/
  unreadSupportCount derivano da Conversation+Message+ConversationParticipant.lastReadAt
  (packages/domain/internal/conversation). Audit completo di TUTTE le azioni che mutano questi
  dati (non solo le 3 note): trovata anche mark-conversation-read-action.ts (fired via after()
  durante il render della thread, MAI revalidava nulla prima — gap preesistente non a costo
  zero), e il path lato cliente in richiesta/comunicazioni/customer-conversation-page.tsx
  (invia messaggio cliente, fuori dalla sessione impresa). Nessuna unstable_cache/revalidateTag/
  tags: esisteva nel monorepo prima di questa fase (confermato via grep su apps/web/src e
  packages: zero match).
  Creato apps/web/src/area-impresa/private/shell/shell-counts-cache.ts: wrapper
  getAreaImpresaShellCountsCached(actor) con unstable_cache (chiave per company+user, tag
  shell-counts:${companyId}, revalidate: 30s come safety net bounded — non un cerotto, una
  scelta esplicita per i path che non possono invalidare con precisione, vedi sotto). La cache
  resta in apps/web (REGOLA: caching è concern di framework, non di domain — stesso pattern di
  auth/server.ts con React cache()), getAreaImpresaShellCounts in packages/domain non toccata.
  area-impresa-private-layout.tsx aggiornato per usare la versione cacheata.
  Le 3 azioni note (mark-notification-read-action.ts x2, send-message-action.ts,
  open-support-action.ts) ora chiamano revalidateTag(shellCountsTag(companyId), { expire: 0 })
  al posto di revalidatePath("/area-impresa", "layout") — invalidazione immediata, mirata al
  solo tag company-specific, confermata compatibile con unstable_cache dalla guida locale
  "Caching and Revalidating (Previous Model)" (questa app non ha il flag cacheComponents).
  Verificato che chiamare una funzione di revalidation da una Server Action svuota anche la
  client router cache immediatamente (cacheLife.md), quindi il badge si aggiorna al prossimo
  render senza bisogno di altro.
  mark-conversation-read-action.ts: NON modificata per chiamare revalidateTag (after() da
  render di un Server Component non è un contesto documentato come supportato per
  revalidateTag/revalidatePath, solo "Server Functions e Route Handlers") — gap chiuso dal TTL
  di 30s del wrapper, documentato esplicitamente nel codice, non lasciato silenzioso.
  Customer-side message (richiesta/comunicazioni) e notifiche create da admin (approvazione
  richiesta in apps/admin, processo Next.js separato con Data Cache non condivisa con apps/web)
  restano scoperti da invalidazione esplicita per gli stessi motivi (cross-app/cross-sessione,
  invalidazione precisa richiederebbe un endpoint di revalidation remoto — complessità
  sproporzionata per un badge sidebar) — coperti dallo stesso TTL di 30s, in modo uniforme e
  documentato, non come eccezione nascosta.
FILES_CHANGED:
  apps/web/src/area-impresa/private/shell/area-impresa-private-layout.tsx
  apps/web/src/area-impresa/private/account/actions/mark-notification-read-action.ts
  apps/web/src/area-impresa/private/comunicazioni/actions/send-message-action.ts
  apps/web/src/area-impresa/private/comunicazioni/actions/open-support-action.ts
  apps/web/src/area-impresa/private/comunicazioni/actions/mark-conversation-read-action.ts
    (solo commento esplicativo, nessun cambio di comportamento)
FILES_CREATED:
  apps/web/src/area-impresa/private/shell/shell-counts-cache.ts
```

---

## D-017 — Google Maps Autocomplete legacy API migration

```txt
ID: D-017
TITLE: Migrare google.maps.places.Autocomplete a PlaceAutocompleteElement
STATUS: NON_BLOCKING_POST_RELEASE
SOURCE_PHASE: Phase 15 — Performance Rewrite P0
OWNER: ui/location
TARGET_PHASE: fase dedicata Google Maps upgrade (post-release, nessuna scadenza nota)
FILES_INVOLVED:
  apps/web/src/ui/location/city-autocomplete.tsx

DESCRIPTION:
city-autocomplete.tsx usa l'API legacy google.maps.places.Autocomplete, che emette il warning
"google.maps.places.Autocomplete is deprecated" nella console. L'API moderna è
google.maps.places.PlaceAutocompleteElement (con diversa firma e behaviour del widget).
Il componente carica già Google Maps in modo lazy (useEffect, async+defer) — non è un problema
di performance P0, solo un'API deprecata.

WHY_DEFERRED:
La migrazione richiede di riscrivere l'interfaccia del widget (da Autocomplete widget classico
a web component PlaceAutocompleteElement), aggiornare la gestione degli eventi (place_changed
→ eventi custom del web component), e verificare la compatibilità con il controllo del
functional consent (hasFunctionalConsent). Non era P0 di Phase 15 (nessun impatto su
latenza/query count) e richiedeva un test manuale dell'UX della city autocomplete.

RISK:
Warning legacy nella console a ogni caricamento del widget. Google potrebbe rimuovere l'API
legacy in una versione futura delle Maps JS API.

RESOLUTION_RULE:
Riscrivere city-autocomplete.tsx per usare PlaceAutocompleteElement.
Mantenere la stessa interfaccia pubblica (props: value, onChange, placeholder).
Verificare che hasFunctionalConsent blocchi ancora il caricamento dello script.
Testare manualmente la selezione di un indirizzo e il ritorno di NormalizedLocation.

CLOSE_WHEN:
city-autocomplete.tsx non usa più google.maps.places.Autocomplete.
Nessun warning Maps deprecation in console.
Selezione indirizzo funziona identica (NormalizedLocation con address/city/postalCode/lat/lng).
Build e typecheck passano.

NON_BLOCKING_CLASSIFICATION (Phase 15.1):
Re-audit di apps/web/src/ui/location/city-autocomplete.tsx confermato:
  1. L'autocomplete funziona oggi (usato da 3 consumer: company-lead-form.tsx,
     request-step-ui.tsx, company-location-fields.tsx — tutti via questo unico componente,
     nessuna logica duplicata).
  2. Non viene caricato globalmente: lo script Google Maps è iniettato in un useEffect SOLO
     quando il componente CityAutocomplete è montato E hasFunctionalConsent && apiKey sono
     true (gating sul consenso cookie funzionale, non un caricamento eager app-wide).
  3. Non rompe la build: confermato (pnpm --filter web build PASS, qui e nelle fasi precedenti).
  4. Il warning "google.maps.places.Autocomplete is deprecated" è un avviso di migrazione
     futura dell'SDK Google Maps, non un errore a runtime: il widget continua a funzionare,
     nessuna eccezione, nessuna regressione UX osservata.
Tutte le 4 condizioni richieste per NON_BLOCKING_POST_RELEASE sono soddisfatte. Non eseguita
la riscrittura a PlaceAutocompleteElement in questa fase (richiede test manuale dedicato della
UX di selezione indirizzo, fuori dallo scope "nessun refactor estetico" di Phase 15.1).

DECISIONE_2026-06-18 (richiesta esplicita "chiudi D-017"):
Prima di scrivere codice, verificata la documentazione Google aggiornata su
PlaceAutocompleteElement (developers.google.com/maps/documentation/javascript/place-autocomplete-new).
Emerso un vincolo non risolvibile senza test in browser: PlaceAutocompleteElement è un custom
element (`<gmp-place-autocomplete>`) con un proprio input interno in shadow DOM — non si aggancia
a un `<Input>` esistente come l'API legacy. Migrare richiederebbe: (a) restyling via CSS
parts/custom properties Google per eguagliare lo stile attuale (h-16, icona pin, design system),
non garantito pixel-identico senza verifica visiva; (b) gestione del valore precompilato
(restore di un indirizzo già salvato in profilo impresa/funnel) non documentata chiaramente per
il nuovo elemento; (c) risultato selezione ora asincrono (`fetchFields`) con nomi campo diversi
(`addressComponents` vs `address_components`); (d) restrizione paese cambiata
(`includedRegionCodes` vs `componentRestrictions.country`).
Datti questi rischi su 3 consumer critici per la conversione (lead form, step indirizzo funnel
richiesta, profilo impresa) e l'impossibilità di verificare visivamente il rendering da questa
sessione (nessun browser disponibile), l'utente ha scelto esplicitamente di NON procedere con la
riscrittura ora. Nessun codice toccato. D-017 resta NON_BLOCKING_POST_RELEASE, non RESOLVED:
la classificazione non-blocking è confermata valida (il warning resta solo cosmetico), ma la
"chiusura" tecnica (CLOSE_WHEN) richiede una sessione dedicata con accesso a un browser per
verificare visivamente il rendering e il comportamento sui 3 consumer prima/dopo la riscrittura.
```

---

## D-018 — get-profile-page.ts ha una copia indipendente, ora solo cache-safe, della vecchia logica di scadenza globale

```txt
ID: D-018
TITLE: Migrare il riepilogo crediti del profilo impresa a derivare da CreditLot
STATUS: RESOLVED
SOURCE_PHASE: Phase 8.2 — Billing FEFO Credit Lots Rewrite
OWNER: packages/domain (company/profile)
TARGET_PHASE: fase futura account/profilo oppure Phase 16
FILES_INVOLVED:
  packages/domain/src/company/profile/get-profile-page.ts
  apps/web/src/area-impresa/private/account/profilo/**

DESCRIPTION:
get-profile-page.ts (getCreditSummary) contiene una propria copia, indipendente da
packages/billing, della vecchia logica "scadenza globale lazy": legge
CompanyCreditAccount.balance/expiresAt e, se expiresAt <= now, azzera il balance e scrive
una transazione CREDIT_EXPIRATION. Dopo Phase 8.2 questi due campi sono diventati una CACHE
mantenuta da packages/billing (source of truth ora è CreditLot), con expiresAt = MAX (non MIN)
scadenza tra i lotti attivi — scelta deliberata per cui il controllo legacy di
get-profile-page.ts resta corretto (scatta solo quando TUTTI i lotti sono scaduti).

Limite residuo non bloccante: tra la scadenza del lotto più vicino e quella del lotto più
lontano (MAX), se nessuna operazione billing (debit/grant/refund/visita pagina crediti) ha
ancora ri-sincronizzato la cache, il balance cache può sovrastimare il saldo reale. La pagina
profilo (fuori scope Phase 8.2, "Non toccare apps/web/src/area-impresa/private/account/**")
mostrerebbe quindi un numero transitoriamente più alto del vero saldo derivato dai lotti, fino
alla prossima operazione billing che risincronizza la cache. Nessun rischio di doppia spesa
(il debito vero usa sempre CreditLot con lock, non la cache) e nessuna scrittura ledger errata
(quando il controllo legacy scatta, il balance cache è per costruzione corretto, vedi D-011
RESOLUTION_SUMMARY).

WHY_DEFERRED:
apps/web/src/area-impresa/private/account/** era esplicitamente vietato in Phase 8.2.
packages/domain non era nello scope consentito della fase (solo packages/billing,
packages/database, apps/web/src/area-impresa/private/billing/**).

RISK:
Numero "crediti disponibili" mostrato nella pagina profilo può essere transitoriamente più alto
del vero saldo derivato dai lotti, in una finestra delimitata e non finanziariamente rischiosa
(solo display, non spendibile oltre il vero saldo).

RESOLUTION_RULE:
Sostituire getCreditSummary in get-profile-page.ts con una chiamata al modulo
packages/billing/src/credits/lot-ledger.ts (refreshCompanyCreditState o un wrapper pubblico
equivalente), eliminando la copia locale della logica di scadenza e leggendo balance/
nearestExpiresAt direttamente dai lotti, come già fa packages/billing/src/credits/
get-credits-page.ts.

CLOSE_WHEN:
get-profile-page.ts non contiene più una propria copia della logica di scadenza/azzeramento
CompanyCreditAccount.
Il riepilogo crediti del profilo deriva dai lotti attivi (stesso meccanismo della pagina crediti).
Build e typecheck passano.

RESOLVED_IN_PHASE: Phase 8.2.1 — FEFO Integrity Verification + D-018 Closure
RESOLUTION_SUMMARY: getCreditSummary in get-profile-page.ts riscritta da zero: non legge né
  scrive più CompanyCreditAccount in alcun modo (nessuna INSERT/SELECT FOR UPDATE/UPDATE
  diretta). Eliminata la quinta copia della logica di scadenza globale, che era anche l'unica,
  tra le cinque trovate nell'audit originale, a contenere una SCRITTURA diretta sulla cache
  (UPDATE "CompanyCreditAccount" SET balance=0 — non solo lettura) fuori dalla funzione di
  sync centralizzata di packages/billing: una violazione più seria di quanto descritto nella
  DESCRIPTION originale di questo item, non solo "display stale" ma una vera scrittura globale
  parallela. Aggiunta una nuova funzione pubblica getCompanyCreditSummary in
  packages/billing/src/credits/lot-ledger.ts (wrapper leggero su refreshCompanyCreditState,
  nessun nuovo read-model duplicato: stesso motore di get-credits-page.ts), esportata da
  packages/billing/src/credits/index.ts. get-profile-page.ts ora chiama
  getCompanyCreditSummary(companyId, now) e mappa nearestExpiresAt sul campo esposto
  CompanyProfileCreditSummary.expiresAt — contratto esterno di getCompanyProfilePage
  (consumato da apps/web/.../account/profilo/profile-page.tsx, fuori scope) invariato:
  stessa shape { balance, expiresAt } | null. Risultato: la pagina profilo mostra ora la
  scadenza del lotto più vicino (corretta, user-facing) invece di derivare da una cache
  potenzialmente disallineata. CreditLot è l'unica fonte di verità rimasta nell'intero
  monorepo; CompanyCreditAccount è scritta in un solo punto (syncCompanyCreditAccountCache
  InTransaction) più l'INSERT ON CONFLICT DO NOTHING di ensureCreditAccountRowInTransaction
  (mai sovrascrive dati esistenti, solo garantisce l'esistenza della riga).
FILES_CHANGED: vedi PHASE_REPORT Fase 8.2.1 in 03_ROADMAP.md
```

---

## D-019 — Apply FEFO credit lots migration to target database

```txt
ID: D-019
TITLE: Apply FEFO credit lots migration to target database
STATUS: RESOLVED
TYPE: DEPLOYMENT_GATE
SOURCE_PHASE: Phase 8.2 — Billing FEFO Credit Lots Rewrite (rischio mai tracciato come item
  proprio, solo annotato nei RISKS dei PHASE_REPORT di Phase 8.2 e 8.2.1; formalizzato qui in
  Phase 15.1)
OWNER: packages/database + packages/billing
TARGET_PHASE: pre-deploy checklist (non una fase di roadmap — un gate operativo da eseguire
  prima del prossimo deploy in produzione)
FILES_INVOLVED:
  packages/database/prisma/migrations/20260617120000_credit_lots_fefo/migration.sql
  packages/database/prisma/schema.prisma

DESCRIPTION:
La riscrittura FEFO (Phase 8.2) ha introdotto i modelli CreditLot/CreditLotConsumption e una
migration con backfill (20260617120000_credit_lots_fefo) che convalida il saldo globale
pre-FEFO in lotti. La migration è stata scritta, revisionata riga per riga (Phase 8.2.1: nessun
rischio finanziario trovato) e validata solo a livello di schema (`prisma generate`, senza
connessione a un database). NON è mai stata applicata (`prisma migrate deploy` / `db push`) a
nessun ambiente reale (dev/staging/prod), per esplicito divieto in tutte le fasi che hanno
toccato questo codice ("Non applicare migration a database reali").

Questo non è un bug applicativo: il codice (packages/billing) è scritto per il modello
CreditLot e già passa typecheck/build. Il rischio è puramente OPERATIVO: se questo codice viene
deployato senza prima applicare la migration, ogni operazione billing (acquisto, consumo,
rimborso) fallirebbe a runtime contro un database che non ha ancora le tabelle CreditLot/
CreditLotConsumption.

WHY_DEFERRED:
Applicare una migration con backfill su dati finanziari richiede conferma esplicita
sull'ambiente target, una finestra di deploy concordata, e idealmente un backup pre-migration
— decisioni operative che nessuna fase di questo audit/refactor era autorizzata a prendere
unilateralmente.

RISK:
Se il codice billing FEFO venisse deployato senza applicare prima questa migration, ogni
operazione crediti (acquisto, consumo, rimborso, visualizzazione saldo) andrebbe in errore
runtime (tabelle CreditLot/CreditLotConsumption inesistenti). Rischio operativo alto ma
interamente prevenibile con un gate di deploy esplicito.

RESOLUTION_RULE:
Prima del prossimo deploy che include il codice di packages/billing successivo a Phase 8.2:
1. Backup del database target.
2. Applicare 20260617120000_credit_lots_fefo (`prisma migrate deploy`) sull'ambiente target.
3. Verificare il backfill: contare i CreditLot creati, confrontare con le CompanyCreditAccount
   che avevano balance>0 prima della migration, confermare che la somma corrisponda.
4. Smoke test: un acquisto crediti completo (checkout -> webhook -> fulfillment -> lotto
   creato), un consumo (sblocco richiesta -> FEFO -> lotto decrementato), un rimborso admin.
5. Solo dopo i 4 punti sopra, deployare/abilitare il codice applicativo che dipende da
   CreditLot.

CLOSE_WHEN:
migration 20260617120000_credit_lots_fefo applicata all'ambiente target.
Backup completato prima dell'applicazione.
Backfill verificato (conteggio lotti coerente con i saldi pre-migration).
Smoke test crediti/acquisto/consumo/rimborso superato sull'ambiente target.

LAST_VERIFIED_ENV: branch Neon di test "test-fefo-credit-lots-migration" (br-aged-snow-alw7eqic),
  fork isolato del branch "production" (br-odd-dew-al5nhkxe) del progetto Neon "Esigenta"
  (purple-glitter-37268985) — creato in PRE-DEPLOY D-019 per non rischiare dati reali.
PRODUCTION_STATUS: PENDING — la migration NON è stata applicata al branch "production". L'unico
  ambiente DB configurato in questo repo (.env di root, usato da tutti i comandi Prisma locali)
  punta direttamente al branch Neon "production": non esiste un ambiente staging separato.
VERIFICATION_SUMMARY (sul branch di test):
  prisma migrate status (prima): 27 migration trovate, 1 pending (20260617120000_credit_lots_fefo),
    nessun drift, nessun'altra migration pending inattesa.
  prisma migrate deploy: applicata con successo, "All migrations have been successfully applied."
  prisma migrate status (dopo): "Database schema is up to date!"
  Schema: tabelle CreditLot e CreditLotConsumption presenti; enum CreditLotSource e
    CreditLotStatus presenti; tutti gli indici/FK del migration.sql confermati via pg_indexes/
    pg_constraint (CreditLot_idempotencyKey_key, CreditLot_companyId_status_expiresAt_idx,
    CreditLot_creditOrderId_idx, CreditLotConsumption_creditLotId_creditTransactionId_key,
    + relativi indici singoli e FK).
  Backfill: 1 lotto LEGACY_MIGRATION creato (unica company con saldo positivo nei dati reali
    forkati), quantityInitial = quantityRemaining = 100 (nessun mismatch), idempotencyKey unica
    e non nulla, 0 lotti ACTIVE con expiresAt nel passato.
  Cache sync: CompanyCreditAccount.balance/expiresAt coincidono esattamente con il lotto
    derivato (100 / stessa data) per l'unica company con saldo.
  Dati esistenti intatti: 4 righe CompanyCreditTransaction preesistenti, invariate dalla
    migration (che non le tocca).
  Caso "saldo scaduto -> nessun lotto creato" non era empiricamente testabile: nei dati reali
    forkati esisteva solo 1 CompanyCreditAccount, con saldo valido — nessun account con saldo
    scaduto presente da verificare. Ramo defensivo della migration già rivisto via code review
    in Phase 8.2.1, non esercitato qui per assenza di dati che lo attivino.
  Smoke test funzionale (acquisto/consumo/rimborso via UI+Stripe) NON eseguito: richiede un
    ambiente applicativo in esecuzione con Stripe configurato, fuori da questa sessione di solo
    audit/migration DB. Verificato solo a livello schema/dati via SQL read-only.
  pnpm --filter web typecheck/build e pnpm typecheck/build (root): PASS.
NEXT_STEP_FOR_PRODUCTION: ripetere l'applicazione (backup pg_dump del branch "production" +
  prisma migrate deploy con DATABASE_URL puntato esplicitamente al branch "production" +
  riverifica backfill) con conferma esplicita dell'utente immediatamente prima del comando di
  deploy, come da regola di sicurezza assoluta di questa fase.

RESOLVED_IN: PRE-DEPLOY D-019 (seconda esecuzione, 2026-06-18)
RESOLUTION_SUMMARY: Migration applicata al branch Neon "production" (br-odd-dew-al5nhkxe) reale,
  con procedura protetta e conferma esplicita dell'utente ("CONFERMO PRODUZIONE FEFO") raccolta
  immediatamente prima del comando `prisma migrate deploy`.
  Pre-deploy: confermato il branch via Neon API (nome "production", primary+default); nessuna
  stampa di DATABASE_URL in nessun output; backup creato come branch Neon
  "backup-pre-fefo-credit-lots-20260618" (br-flat-surf-alwnbse1, fork point-in-time di
  production, metodo nativo del provider Neon — pg_dump non disponibile localmente, indicato e
  motivato il metodo alternativo prima di procedere); verificata assenza di CreditOrder PENDING
  negli ultimi 30 minuti (nessun checkout in corso); prisma migrate status pre-deploy: 27
  migration, 1 sola pending (la FEFO), nessun drift.
  Deploy: `prisma migrate deploy` eseguito su production, "All migrations have been successfully
  applied."; `prisma migrate status` post-deploy: "Database schema is up to date!"; riga in
  _prisma_migrations confermata (finished_at popolato, rolled_back_at NULL).
  Verifica post-deploy (SQL read-only su production): tabelle CreditLot/CreditLotConsumption
  presenti; 1 lotto LEGACY_MIGRATION creato (quantityInitial=quantityRemaining=100, nessun
  mismatch, idempotencyKey unica); CompanyCreditAccount cache coincide esattamente col lotto
  (balance=100, expiresAt identico); 0 lotti ACTIVE con expiresAt nel passato; dati storici
  (CompanyCreditTransaction) intatti.
  pnpm --filter web typecheck/build e pnpm typecheck/build (root): PASS.
  Smoke test UI/Stripe (pagina crediti live, acquisto/consumo/rimborso end-to-end) NON eseguito:
  richiede un ambiente applicativo in esecuzione con Stripe configurato, non disponibile in
  questa sessione CLI. Verificato solo a livello dati/schema, che è esattamente l'invariante che
  un acquisto/consumo/rimborso reale dovrebbe rispettare — nessuna evidenza di problemi, ma la
  verifica end-to-end via browser resta una raccomandazione manuale, non un blocker.
  Branch di backup "backup-pre-fefo-credit-lots-20260618" (br-flat-surf-alwnbse1) mantenuto
  esplicitamente per 72 ore di osservazione post-migration (decisione utente, 2026-06-18). Da
  eliminare solo dopo: (a) smoke test manuali post-deploy superati (vedi checklist), (b) periodo
  di osservazione di 72 ore senza errori riportati su crediti/checkout/consumo. Nessuna ulteriore
  azione su database o migration prevista finché questa finestra non si chiude.
```

---

## D-020 — TODO non tracciato: azioni admin per richieste (edit/archive/soft delete)

```txt
ID: D-020
TITLE: Azioni admin edit/archive/soft-delete per le richieste, in attesa di decisione schema
STATUS: RESOLVED
SOURCE_PHASE: Phase 16 — Final Structural Audit (trovato durante audit TODO/FIXME/legacy)
OWNER: apps/admin (requests)
TARGET_PHASE: fase futura admin requests management, dopo decisione sullo schema
FILES_INVOLVED:
  apps/admin/src/app/(protected)/requests/page.tsx

DESCRIPTION:
La pagina admin elenco richieste contiene un commento TODO non tracciato:
"TODO: add admin actions for edit/archive/soft delete after schema decision" (riga 198).
Indica una feature non ancora implementata (azioni admin di modifica/archiviazione/
cancellazione soft delle richieste) in attesa di una decisione sul modello dati (es. se
"archiviata" è un nuovo stato di RequestStatus, un flag separato, o altro).

WHY_DEFERRED:
Implementarla ora sarebbe una nuova feature, esplicitamente vietata in Phase 16 ("Questa fase
non deve introdurre nuove feature"). La decisione sullo schema (come rappresentare
archiviazione/soft-delete per Request) non è stata presa in nessuna fase di questo audit.

RISK:
Nessuno strutturale. È un gap funzionale noto dell'admin, non un bug né un rischio di
sicurezza/dati. Restava però non tracciato fuori da questo singolo commento nel codice,
in violazione della REGOLA "ogni debito non tracciato deve diventare deferred item".

RESOLUTION_RULE:
Decidere il modello dati per l'archiviazione/soft-delete delle richieste (nuovo stato
RequestStatus, campo archivedAt, o altro) in packages/domain. Implementare le relative azioni
admin (edit/archive/soft-delete) in apps/admin/src/app/(protected)/requests/.

CLOSE_WHEN:
Il TODO inline in apps/admin/src/app/(protected)/requests/page.tsx è rimosso.
Le azioni admin edit/archive/soft-delete esistono e sono collegate a una decisione di schema
esplicita e documentata.
Build e typecheck passano.

RESOLVED_IN_PHASE: PHASE D-020 — Admin Requests Actions Closure
RESOLUTION_SUMMARY: TODO rimosso. Decisione schema presa e implementata: archivedAt/
  archivedByAdminUserId/archiveReason e deletedAt/deletedByAdminUserId/deleteReason aggiunti a
  Request (additivi, nullable, nessuna colonna esistente toccata), seguendo lo stesso pattern
  già usato altrove nello schema (Company.deletedAt, CreditRefundRequest.reviewedByAdminUserId).
  Entrambi i meccanismi sono ORTOGONALI a RequestStatus (CLOSED resta inutilizzato/riservato,
  non sovraccaricato per l'archiviazione — evita di perdere lo status editoriale precedente e
  rende l'unarchive/restore banali da implementare correttamente).
  EDIT: già esisteva (updateRequestCommercialSettings, limitato a creditCost/maxUnlocks) — nessun
  nuovo editing implementato sui campi snapshot cliente/funnel, che il modello dichiara
  esplicitamente "historically stable" (commento in schema.prisma); editare quei campi avrebbe
  violato l'invariante del modello, non una semplice scelta di scope.
  ARCHIVE: nuove archiveRequest/unarchiveRequest in packages/domain/src/admin/requests/
  archive-request.ts. Non distruttivo, reversibile, traccia admin+motivo+timestamp.
  SOFT-DELETE: nuove softDeleteRequest/restoreRequest in packages/domain/src/admin/requests/
  soft-delete-request.ts. Mai una delete fisica (confermato via audit: zero
  request.delete/deleteMany in tutto il codebase). Reversibile, traccia admin+motivo+timestamp.
  Nessuna referenza rotta: RequestUnlock, Conversation, CompanyCreditTransaction,
  CreditRefundRequest, CompanySavedRequest, RequestDispatch continuano a puntare alla stessa riga
  Request, che non viene mai eliminata.
  LISTE: listAdminRequests esclude archiviate/eliminate di default (flag includeArchived/
  includeDeleted per uso futuro, nessuna vista admin dedicata creata — non era già prevista).
  getRequestById NON esclude archiviate/eliminate (un admin deve poter aprire/ripristinare via
  link diretto). Marketplace (getCompanyRequestsListPage, getCompanyRequestDetailPage) aggiornati
  per escludere archiviate/eliminate dalla scoperta — le viste storiche company (salvate/
  acquistate) NON sono state filtrate, per non rompere lo storico di un'impresa che ha già
  interagito con la richiesta. Dashboard admin (getAdminDashboardMetrics) aggiornata per
  escludere archiviate/eliminate dai contatori "in coda"/azionabili (pendingRequests,
  publishedRequests, incompletePublishedRequests); totalRequests e la distribuzione per status
  restano invariati (metriche "nel sistema", storiche, non operative).
  UI admin: TODO rimosso dalla lista; azioni archivia/elimina/ripristina aggiunte nella pagina
  di dettaglio richiesta, stesso pattern già in uso per editing/revisione (form con motivo
  opzionale, nessun redesign).
  Nessuna modifica a crediti/billing/lotti FEFO.
FILES_CHANGED:
  packages/database/prisma/schema.prisma (Request + User, additivo)
  packages/domain/src/admin/requests/index.ts (export aggiunti)
  packages/domain/src/admin/requests/list-admin-requests.ts (filtro default)
  packages/domain/src/admin/requests/get-request-by-id.ts (campi esposti)
  packages/domain/src/admin/dashboard/admin-dashboard.ts (contatori coerenti)
  packages/domain/src/company/requests/get-requests-list-page.ts (esclusione marketplace)
  packages/domain/src/company/requests/get-request-detail-page.ts (esclusione marketplace)
  apps/admin/src/app/(protected)/requests/page.tsx (TODO rimosso)
  apps/admin/src/app/(protected)/requests/[id]/page.tsx (azioni + banner)
FILES_CREATED:
  packages/domain/src/admin/requests/archive-request.ts
  packages/domain/src/admin/requests/soft-delete-request.ts
  packages/database/prisma/migrations/20260618120000_request_admin_archive_delete/migration.sql
FILES_DELETED: nessuno

DISCREPANCY_FOUND_IN_PROJECT_RECONCILIATION_AUDIT (2026-06-18):
Verifica diretta sul database production (Neon, query read-only su _prisma_migrations e
information_schema.columns) ha confermato che la migration
20260618120000_request_admin_archive_delete NON era applicata: nessuna riga in
_prisma_migrations, le colonne archivedAt/archivedByAdminUserId/archiveReason/deletedAt/
deletedByAdminUserId/deleteReason non esistevano sulla tabella "Request" reale. Il codice (schema
Prisma, domain functions, UI admin) era corretto e già passava typecheck/build, ma se l'app admin
fosse stata deployata in produzione, ogni chiamata a archiveRequest/softDeleteRequest/
listAdminRequests (che filtra per archivedAt/deletedAt) sarebbe fallita a runtime contro colonne
inesistenti. STATUS temporaneamente corretto da RESOLVED a CODE_RESOLVED — DEPLOYMENT_GATE_OPEN,
stesso pattern già usato per D-019.

DEPLOYMENT_GATE_CLOSED_IN_PRE_DEPLOY_D020 (2026-06-18):
Migration 20260618120000_request_admin_archive_delete applicata a production (branch Neon
"production", br-odd-dew-al5nhkxe) tramite `prisma migrate deploy` dopo conferma esplicita
dell'utente ("CONFERMO PRODUZIONE D020"), seguendo la stessa disciplina di D-019: audit migration
(solo ADD COLUMN nullable + CREATE INDEX + ADD CONSTRAINT FK ON DELETE SET NULL, nessun DROP/
DELETE/UPDATE distruttivo), precheck migrate status (27/28 migration già applicate, D-020 unica
pending, nessun drift, nessuna migration failed), backup branch Neon creato e verificato
PRIMA del deploy (backup-pre-d020-request-admin-archive-delete-20260618, br-dry-sun-alc9famk,
fork di production), deploy eseguito, verifica post-migration: _prisma_migrations riporta
20260618120000_request_admin_archive_delete con finished_at=2026-06-18T15:53:31.562Z e
rolled_back_at=null; le 6 colonne esistono (tutte nullable); i 4 indici
(Request_archivedAt_idx, Request_deletedAt_idx, Request_archivedByAdminUserId_idx,
Request_deletedByAdminUserId_idx) e le 2 foreign key (Request_archivedByAdminUserId_fkey,
Request_deletedByAdminUserId_fkey) sono presenti; dati esistenti intatti (3 Request, invariate,
0 archiviate, 0 eliminate). Smoke test admin: query read-only equivalenti a listAdminRequests/
getRequestById/getAdminDashboardMetrics eseguite con successo sulle colonne reali; nessuna
richiesta sicura/test disponibile in produzione (solo 3 Request reali, tutte PUBLISHED) — nessuna
mutazione (archive/soft-delete) eseguita su dati reali, come da regola del task. Admin/web
typecheck e build (locali e root) tutti PASS dopo il deploy.
STATUS finale: RESOLVED — sia codice sia deployment gate sono chiusi. Migration applicata a
production, nessuna azione residua.
```

---

```
ID: D-021
TITLE: Runtime crediti post-FEFO instabile (P2028, lock su read path, refresh loop checkout)
STATUS: RESOLVED
SOURCE_PHASE: Phase 17 — Credits Runtime Stabilization Post-FEFO
OWNER: packages/billing, apps/web/src/area-impresa/private/billing, apps/web/src/app/api/credits

DESCRIPTION:
Dopo l'applicazione di FEFO (D-011/D-019), i log mostravano /area-impresa/crediti lento
(credits-queries 800ms-3000ms+), errori Prisma P2028 "Unable to start a transaction", molti
"[company-credits] START" concorrenti, e richieste ripetute a
/area-impresa/crediti?checkout=success&session_id=... e a /api/credits/checkout-status
(incluso almeno un 404 non gestito come stato terminale).

ROOT_CAUSE:
1. getCompanyCreditsPage (packages/billing/src/credits/get-credits-page.ts) chiamava
   refreshCompanyCreditState ad ogni render della pagina. Quella funzione apre un
   prisma.$transaction e dentro esegue expireStaleLotsInTransaction, che fa
   "SELECT ... FOR UPDATE" su TUTTI i CreditLot ACTIVE della company — un lock scrittura preso
   solo per leggere. Ogni page view, ogni router.refresh() e ogni poll concorrente apriva una
   nuova transazione in competizione sulle stesse righe, e in competizione anche con la
   transazione (legittima) del webhook Stripe che evade lo stesso acquisto. Sotto il pool di
   connessioni Neon questo produceva P2028 quando troppe transazioni concorrenti tentavano di
   partire/acquisire lock sulle stesse righe.
2. CreditCheckoutStatusBanner, dopo lo stato "fulfilled", chiamava router.refresh() lasciando
   intatti i query params (?checkout=success&session_id=...). Qualsiasi reload, bookmark o
   back-navigation su quella stessa URL faceva ripartire il polling da zero, anche per un
   acquisto già evaso da tempo — la causa delle "molte richieste" osservate, non un loop
   sincrono ma un URL "trappola" che non si autopuliva mai.
3. /api/credits/checkout-status, quando l'ordine non era trovato (sessione estranea o
   inesistente), restituiva sempre un generico { status: "error" } con HTTP 404, indistinguibile
   da un errore transitorio: il client non aveva modo di trattarlo come risposta terminale.

RESOLUTION:
1. Aggiunta getActiveCreditLotsReadModel (packages/billing/src/credits/lot-ledger.ts): query
   singola, nessuna transazione, nessun FOR UPDATE, nessuna scrittura. Esclude i lotti scaduti
   direttamente nella WHERE ("expiresAt" > now) invece di affidarsi al flip di stato, quindi è
   sempre corretta anche se il sweep di scadenza (che resta solo nei path di scrittura: grant/
   debit/refund/admin adjustment) non è ancora passato per quella company.
   getCompanyCreditsPage ora usa questa funzione: la pagina /area-impresa/crediti è tornata
   read-only, zero lock, zero transazioni sul render.
2. CreditCheckoutStatusBanner riscritto: backoff progressivo (1s/1.5s/2s/3s/4s/6s/8s/10s invece
   di intervallo fisso 1.5s), nuovo stato terminale esplicito "not_found", e soprattutto
   router.replace(pathname) — non più router.refresh() — su QUALSIASI esito terminale
   (fulfilled/failed/cancelled/expired/not_found): rimuove checkout/session_id dall'URL una sola
   volta, così un reload o un ritorno su quella URL non può più far ripartire il polling.
3. /api/credits/checkout-status: i risultati con httpStatus 404 (sessione/ordine non trovato
   per questa company) vengono ora restituiti come { status: "not_found", terminal: true } con
   200, non come errore generico; tutte le risposte includono un campo "terminal" coerente.

INDEX_AUDIT: @@index([companyId, status, expiresAt]) su CreditLot copre già tutte le query di
  lettura (companyId+status+expiresAt) e di scrittura (FOR UPDATE nei path write); idempotencyKey
  è @unique (indicizzato); creditOrderId ha indice proprio. Nessun indice mancante, nessuna
  migration creata.

VERIFICATION:
  pnpm --filter web typecheck: PASS
  pnpm --filter web build: PASS
  pnpm typecheck (root, 13 package): PASS
  pnpm build (root): PASS
  Verifica diretta su Neon production (br-odd-dew-al5nhkxe): 0 CreditLot con quantityRemaining
    negativo, 0 idempotencyKey duplicate su CreditLot, 0 mismatch tra CompanyCreditAccount
    (cache) e la somma/MAX-expiresAt live dei lotti ACTIVE per nessuna company. Company di test
    con 2 lotti (60 crediti exp. 2026-07-17, 180 crediti exp. 2026-10-15, da due CreditOrder
    distinti): il lotto più vecchio non ha subito alcuna modifica di expiresAt dal lotto più
    recente; cache coerente (balance=240=60+180, expiresAt=MAX=2026-10-15).
  Non è stato possibile eseguire un nuovo acquisto end-to-end con Stripe in questa sessione
    (richiede un ambiente applicativo in esecuzione); la verifica Task 5 è stata fatta sui dati
    reali già presenti, che soddisfano tutti gli invarianti richiesti.

CLOSE_WHEN: già chiuso in questa fase — nessuna azione residua.

FOLLOW_UP_RESOLVED_IN_PHASE_17_1 (Company Profile Credit Summary Read Path Fix): il RISK residuo
  annotato a fine Phase 17 (packages/domain/src/company/profile/get-profile-page.ts chiamava
  getCompanyCreditSummary -> refreshCompanyCreditState, stesso pattern transazionale/FOR UPDATE
  della pagina crediti) è stato chiuso. getCompanyCreditSummary ora deriva da
  getActiveCreditLotsReadModel (nessuna transazione, nessun FOR UPDATE, nessuna scrittura).
  refreshCompanyCreditState e listActiveCreditLotsInTransaction rimossi come dead code (zero
  chiamanti rimasti). Audit globale post-fix: zero read path in tutto il monorepo chiama ancora
  refreshCompanyCreditState; ogni FOR UPDATE/syncCompanyCreditAccountCacheInTransaction residuo è
  in un path di scrittura reale (grant/debit/refund/admin adjustment/altre approvazioni admin).
```

---

```
ID: D-022
TITLE: 01_ARCHITECTURE.md descrive struttura target non più presente su disco (cartelle vuote rimosse in Phase 16.1)
STATUS: PARTIALLY_RESOLVED (geo/market-data ripopolati in Phase 18.1; matrix e le
  sottocartelle account/billing restano da chiarire in 01_ARCHITECTURE.md)
SOURCE_PHASE: Phase 16.1 — Lean Structure Prune
OWNER: docs/architetture/01_ARCHITECTURE.md
TARGET_PHASE: fase documentale dedicata (fuori scope di modifica per Phase 16.1 e Phase 18.1)
FILES_INVOLVED:
  docs/architetture/01_ARCHITECTURE.md

DESCRIPTION:
01_ARCHITECTURE.md descrive come struttura TARGET le seguenti cartelle, tutte rimosse in Phase
16.1 perché vuote/.gitkeep-only e senza alcun import reale in tutto il monorepo:
  apps/web/src/content/legal
  apps/web/src/platform/{config,errors,privacy}
  apps/web/src/richiesta/notifiche
  apps/web/src/area-impresa/private/account/{copertura,view-models}
  apps/web/src/area-impresa/private/billing/{acquisti,fatture,rimborsi,view-models}
  apps/web/src/site/seo/{geo,market-data,matrix}
La rimozione era esplicitamente richiesta dal task ("una cartella futura non implementata è
rumore"), ma 01_ARCHITECTURE.md non era nello scope di modifica consentito per quella fase —
resta quindi una discrepanza documentata tra struttura target dichiarata e struttura reale.

UPDATE_PHASE_18_1:
Phase 18.1 ha ripopolato `site/seo/geo/` (cities.ts, supported-cities.ts) e
`site/seo/market-data/` (base-price-ranges.ts, city-price-index.ts) con contenuto reale,
usato dal composer della famiglia pilota `pages/costi/ristrutturare-bagno/content.ts`. La parte
di discrepanza relativa a queste due cartelle è quindi superata: non sono più scaffolding vuoto,
ma fondazione popolata e in uso. Resta non creata `site/seo/matrix/` (combinazioni pubblicabili
centralizzate) — giustificato finché esiste una sola famiglia SEO: il gate di indicizzabilità è
oggi gestito da engine/geo-policy.ts + engine/static-params.ts senza bisogno di un modulo
dedicato. Restano invariate, e quindi ancora aperte, le sottocartelle account/billing.

WHY_DEFERRED (per la parte ancora aperta — matrix/ e account/billing):
Phase 16.1 e Phase 18.1 potevano modificare solo apps/web/src/** (Phase 18.1: anche
site/seo/**, app/costi/**) più 03_ROADMAP.md e 04_DEFERRED_ITEMS.md. Editare
01_ARCHITECTURE.md (documento vincolante, letto integralmente prima di ogni fase) richiede una
fase dedicata con scope esplicito su quel file.

RISK:
Nessuno operativo. Rischio puramente documentale: una futura fase che legge 01_ARCHITECTURE.md
alla lettera potrebbe ricreare matrix/ o le sottocartelle account/billing come scaffolding
vuoto prima che esista un bisogno reale, se non viene letta anche questa nota.

RESOLUTION_RULE:
In una fase dedicata, aggiornare 01_ARCHITECTURE.md per:
1. Riflettere che site/seo/geo e site/seo/market-data sono ora struttura REALE (popolata in
   Phase 18.1), non solo target aspirazionale.
2. Chiarire che site/seo/matrix resta target futuro, da creare solo quando più famiglie SEO
   condividono combinazioni pubblicabili da centralizzare (oggi non è il caso, una sola
   famiglia: ristrutturare-bagno).
3. Rimuovere o aggiornare i riferimenti a copertura/view-models (account) e
   acquisti/fatture/rimborsi/view-models (billing) per riflettere che queste sono estensioni
   da creare on-demand quando una feature reale le richiede, non scaffolding permanente.

CLOSE_WHEN:
01_ARCHITECTURE.md non descrive più come "struttura obbligatoria" cartelle che non esistono e
non sono pianificate per la fase corrente.
```

---

```
ID: D-023
TITLE: Monorepo cleanup audit findings da chiudere in sprint dedicato
STATUS: OPEN
SOURCE_PHASE: Monorepo cleanup audit 2026-06-24
OWNER: multi-owner (web/site/richiesta/packages/config/auth/domain/funnel/taxonomy/ui)
TARGET_PHASE: sprint dedicato monorepo cleanup controllato
FILES_INVOLVED:
  docs/archive-legacy/structure-snapshots/MONOREPO_CLEANUP_REPORT.md
  apps/web/src/site/home/explosion.tsx
  packages/funnel/src/compiler/infer-presets.ts
  packages/funnel/src/types/request-answer.ts
  packages/funnel/src/types/runtime-step.ts
  packages/config/eslint/base.mjs
  docs/archive-legacy/performance/perf-patches/**
  packages/database/prisma.config.ts
  packages/auth/src/identity/admin/bootstrap-super-admin.ts
  apps/web/src/richiesta/**
  apps/web/src/site/services/**

DESCRIPTION:
Audit tecnico controllato eseguito con pnpm lint/typecheck/build, Knip, Dependency Cruiser e
Madge. Il fix sicuro `server-only` e' stato applicato in apps/web/package.json. Lo sprint
cleanup 1 ha risolto il lint fail in explosion.tsx e gli errori Dependency Cruiser su
Prisma/dotenv in file config/bootstrap. Restano aperti: unused files/dependencies/exports/types
da Knip, backup storici in docs/archive-legacy/performance/perf-patches, export `dynamic` in feature modules richiesta,
vari type/barrel da verificare e warning audit residui.

UPDATE_SPRINT_CLEANUP_1_2026_06_24:
Pipeline audit stabilizzata senza cleanup distruttivo. Il lint fail in
apps/web/src/site/home/explosion.tsx e' stato risolto derivando i risultati precaricati invece
di scriverli nello state da un effect. I 3 errori Dependency Cruiser su Prisma/dotenv sono stati
classificati come CONFIG_EXCEPTION/SCRIPT_EXCEPTION e gestiti con eccezioni esplicite in
.dependency-cruiser.js; nessuna dipendenza prisma/dotenv e' stata spostata tra dependencies e
devDependencies. pnpm lint/typecheck/build/audit:deps/audit:madge passano. D-023 resta OPEN solo
per il cleanup Knip e per i warning audit residui.

UPDATE_SPRINT_CLEANUP_3_2026_06_24:
Batch A `docs/archive-legacy/performance/perf-patches/**` completato. Eliminati solo gli 11 file classificati da Knip
come unused e da Sprint cleanup 2 come BACKUP_OR_PATCH_ARTIFACT: 10 backup sorgente sotto
`backup/apps/web/src/components/**` e lo script storico `patch-6i1-shared-prefetch.cjs`.
Mantenuti i report storici non segnalati da Knip (`git-diff`, `git-status`, `patch-summary`,
`typecheck`, `verify-links`). Nessun codice applicativo, export/type o dipendenza toccati.
`pnpm audit:knip` passa da 15 unused files a 4; non segnala piu' file sotto
`docs/archive-legacy/performance/perf-patches/**`. D-023 resta OPEN per gli altri item Knip e warning audit residui.

UPDATE_SPRINT_CLEANUP_4_2026_06_24:
Batch B dependency review completato. Rimosse solo dipendenze classificate `REMOVE_SAFE` e
verificate una alla volta: `@esigenta/config` da apps/admin, `class-variance-authority` e
`@types/react-dom` da packages/ui, `tsx` da packages/domain, `@types/react` dal root. Pipeline
verde dopo ogni micro-batch: lint/typecheck/build/audit:deps/audit:madge PASS; audit:knip resta
FAIL atteso. Knip passa da 4 unused dependencies + 5 unused devDependencies a 2 + 2. Rinviati:
`@better-auth/prisma-adapter` come DEFER auth owner review, `dotenv` in packages/domain come
MOVE_SCOPE_REVIEW domain/config, `playwright` e `vercel` come KEEP_TOOLING root da documentare,
scriptare o escludere in un batch tooling. Durante la verifica finale del turno sono emersi
fail lint/typecheck/build in modifiche applicative area-impresa fuori scope
(`request-detail-card.tsx`, `request-detail-page.tsx`, nuovo `request-refund-disclosure.tsx`);
non sono stati corretti in questo sprint per rispettare il divieto di toccare codice applicativo.

WHY_DEFERRED:
La fase era audit + fix minimo consentito. Eliminare file, refactorare componenti, spostare
dipendenze Prisma/dotenv o riscrivere codice applicativo era esplicitamente fuori scope.

RISK:
Rumore crescente negli audit, possibilita' di mantenere codice morto o dipendenze non allineate.
`audit:clean` resta bloccato da `audit:knip`, non piu' da lint o Dependency Cruiser.

RESOLUTION_RULE:
Chiudere in batch piccoli, con owner review:
1. fix lint in explosion.tsx senza cambio UX;
2. decidere eccezioni o riclassificazione Dependency Cruiser per config/bootstrap;
3. rimuovere o archiviare fuori grafo i backup docs/archive-legacy/performance/perf-patches;
4. verificare e rimuovere solo i file Knip confermati morti;
5. normalizzare export/types e config Next `dynamic` dove realmente inutili.

CLOSE_WHEN:
pnpm lint passa.
pnpm typecheck e pnpm build passano.
pnpm audit:deps non ha errori non intenzionali.
pnpm audit:knip non segnala codice morto/dipendenze inutili non intenzionali, oppure le eccezioni
sono documentate.
pnpm audit:madge processa file reali e resta senza cicli.
```

---

# LOG RISOLUZIONI

Quando un item viene chiuso, aggiungere qui:

```txt
ID:
RESOLVED_IN_PHASE:
RESOLUTION_SUMMARY:
FILES_CHANGED:
DATE:
```
