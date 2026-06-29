AREA_IMPRESA_MAPPING_REPORT

PHASE: 2 — AREA IMPRESA AUDIT MAPPING
STATUS: READ_ONLY_COMPLETED. Nessun file spostato, riscritto o eliminato. Nessun fix performance applicato.
SUPERSEDE: Questo file sostituisce la versione precedente dello stesso documento, che certificava
erroneamente "STRUCTURE_STATUS: OK" per una struttura che invece viola 01_ARCHITECTURE.md / 02_GUARDS.md
(vedi RISKS #1). I dati di performance/query già raccolti nella versione precedente restano validi e sono
richiamati qui dove rilevanti; non sono stati riverificati riga per riga in questo passaggio.

SCOPE_LETTO:
  apps/web/src/app/(area-impresa)
  apps/web/src/app/(public-business)/area-impresa   (fuori scope letterale Fase 2, incluso perché stesso prodotto)
  apps/web/src/area-impresa                          (non esiste ancora — Fase 1 struttura target non creata)
  apps/web/src/auth
  apps/web/src/lib/*                                 (incluso: owner non chiaro, importato da quasi tutto Area Impresa)
  packages/auth/src, packages/domain/src, packages/billing/src, packages/notifications/src (solo struttura/grep, no audit query-by-query)

---

STRUCTURE_STATUS_REALE:

apps/web/src/app/(area-impresa)/area-impresa/(private)/
  (shell)/        <- route group vietato (responsabilità prodotto)
  (opportunita)/  <- route group vietato (responsabilità prodotto)
  (comunicazioni)/<- route group vietato (responsabilità prodotto)
  (account)/      <- route group vietato (responsabilità prodotto)
  (billing)/      <- route group vietato (responsabilità prodotto)

01_ARCHITECTURE.md, sezione ROUTE GROUP:
  "Vietato usare route group per responsabilità prodotto: (opportunita) (comunicazioni) (account) (billing)"
  "Quelle responsabilità stanno in: apps/web/src/area-impresa/private/"

Stato reale: VIOLAZIONE CONFERMATA. `apps/web/src/area-impresa/` (owner target) non esiste.
Tutta la logica privata Area Impresa vive oggi dentro `apps/web/src/app`, con route group nominati
per responsabilità prodotto. Una parte è già committata (vedi GIT_STATUS_SUMMARY).

In più, la parte pubblica (marketing/auth) vive in un terzo route group diverso:
`apps/web/src/app/(public-business)/area-impresa/`, separato sia da `(area-impresa)` sia dalla
struttura target `area-impresa/public/`. Stesso prodotto, tre alberi diversi.

GIT_STATUS_SUMMARY:
  Committato (d0d2b02 "refactor(web): reorganize area impresa opportunita routes"):
    spostamento di richieste/richieste-id/richieste-acquistate/richieste-salvate dentro
    (private)/(opportunita) — già introduce il route group vietato.
  Non committato (working tree):
    stesso pattern estero a (shell), (comunicazioni), (account), (billing) + nuovo (private)/layout.tsx.
    File vecchi a path flat (_components, assistenza/, contatti/, profilo/, crediti/, notifiche/,
    configura-servizi/ direttamente sotto area-impresa/) risultano "deleted" nel working tree: il
    contenuto è stato spostato, non duplicato su disco.
  Nessuna modifica rilevata fuori da quest'area in git status.

---

ROUTE_TO_FILE_MAP (stato attuale):

  /area-impresa/richieste
    apps/web/src/app/(area-impresa)/area-impresa/(private)/(opportunita)/richieste/page.tsx (445 righe)
    apps/web/src/app/(area-impresa)/area-impresa/(private)/(opportunita)/richieste/actions.ts (42 righe)
  /area-impresa/richieste/[id]
    .../richieste/[id]/page.tsx (214 righe), actions.ts (212 righe), view-model.ts (606 righe)
  /area-impresa/richieste-salvate
    .../richieste-salvate/page.tsx (92 righe)
  /area-impresa/richieste-acquistate
    .../richieste-acquistate/page.tsx (92 righe)
  /area-impresa/contatti
    (private)/(comunicazioni)/contatti/page.tsx (87 righe)
  /area-impresa/contatti/[conversationId]
    (private)/(comunicazioni)/contatti/[conversationId]/page.tsx (32 righe)
  /area-impresa/assistenza
    (private)/(comunicazioni)/assistenza/page.tsx (134 righe), actions.ts (59 righe)
  /area-impresa/assistenza/[conversationId]
    (private)/(comunicazioni)/assistenza/[conversationId]/page.tsx (32 righe)
  /area-impresa/profilo
    (private)/(account)/profilo/page.tsx (382 righe), actions.ts (113 righe)
  /area-impresa/configura-servizi
    (private)/(account)/configura-servizi/page.tsx (199 righe), actions.ts (78 righe)
  /area-impresa/notifiche
    (private)/(account)/notifiche/page.tsx (256 righe), actions.ts (75 righe)
  /area-impresa/crediti
    (private)/(billing)/crediti/page.tsx (197 righe), actions.ts (183 righe)
  layout privato
    (private)/layout.tsx (115 righe)
  pubblico (marketing/auth) — albero separato
    apps/web/src/app/(public-business)/area-impresa/{page,accedi,iscriviti,recupera-password,
    reimposta-password,seleziona-impresa}/page.tsx

Nota performance: i dettagli query-per-route (query count, N+1, bottleneck) già raccolti nella
versione precedente di questo audit restano il riferimento valido per le Fasi 5/8/15 (P0 confermati:
/area-impresa/richieste e /area-impresa/crediti checkout/status). Non sono stati ricalcolati qui.

---

FILES_TO_KEEP_IN_APP:
(Ruolo Next.js legittimo — page.tsx/layout.tsx — ma il PATH attuale viola REGOLA ROUTE GROUP e va
corretto rimuovendo i gruppi (opportunita)/(comunicazioni)/(account)/(billing)/(shell). Il CONTENUTO
va inoltre svuotato verso bridge sottile: tutti i file sotto sono oggi troppo pesanti per restare
app-bridge "as-is", vedi FILES_TO_REWRITE per i casi più gravi.)

  (private)/layout.tsx                                          -> area-impresa/(private)/layout.tsx
  (private)/(opportunita)/richieste/page.tsx                     -> area-impresa/(private)/richieste/page.tsx
  (private)/(opportunita)/richieste/[id]/page.tsx                -> area-impresa/(private)/richieste/[id]/page.tsx
  (private)/(opportunita)/richieste-acquistate/page.tsx          -> area-impresa/(private)/richieste-acquistate/page.tsx
  (private)/(opportunita)/richieste-salvate/page.tsx             -> area-impresa/(private)/richieste-salvate/page.tsx
  (private)/(comunicazioni)/contatti/page.tsx                    -> area-impresa/(private)/contatti/page.tsx
  (private)/(comunicazioni)/contatti/[conversationId]/page.tsx   -> area-impresa/(private)/contatti/[conversationId]/page.tsx
  (private)/(comunicazioni)/assistenza/page.tsx                  -> area-impresa/(private)/assistenza/page.tsx
  (private)/(comunicazioni)/assistenza/[conversationId]/page.tsx -> area-impresa/(private)/assistenza/[conversationId]/page.tsx
  (private)/(account)/profilo/page.tsx                           -> area-impresa/(private)/profilo/page.tsx
  (private)/(account)/configura-servizi/page.tsx                 -> area-impresa/(private)/configura-servizi/page.tsx
  (private)/(account)/notifiche/page.tsx                         -> area-impresa/(private)/notifiche/page.tsx
  (private)/(billing)/crediti/page.tsx                            -> area-impresa/(private)/crediti/page.tsx

  (public-business)/area-impresa/**/page.tsx (6 file)             -> consolidare sotto un solo route
  owner pubblico Area Impresa (oggi diviso tra (area-impresa) e (public-business); decisione di
  consolidamento per Fase 3, non eseguita qui).

FILES_TO_MOVE:
(Sani: nessun mix route+auth+query+business+UI+billing rilevato via grep su "use server", Prisma,
Stripe, revalidatePath, redirect. Spostabili as-is verso area-impresa/private/<owner>/, con solo
aggiornamento import path.)

  Opportunità (-> area-impresa/private/opportunita/):
    _components/company-request-list.tsx
    _components/request-card-format.ts
    _components/request-commercial-display.ts
    _components/request-detail-card.tsx        (891 righe — sano ma grande, valutare split in Fase 5)
    _components/request-filters-panel.tsx       (558 righe — sano ma grande, valutare split in Fase 5)
    _components/request-list-card.tsx
    _components/request-pending-controls.tsx
    richieste/actions.ts
    richieste/[id]/actions.ts
    richieste/[id]/view-model.ts                (606 righe — sano, nessun side-effect rilevato)

  Comunicazioni (-> area-impresa/private/comunicazioni/):
    _components/contact-list.tsx
    _lib/conversation-routes.ts
    assistenza/actions.ts

  Account (-> area-impresa/private/account/):
    (account)/profilo/actions.ts
    (account)/profilo/company-location-fields.tsx
    (account)/profilo/deactivate-account-form.tsx
    (account)/configura-servizi/actions.ts
    (account)/configura-servizi/category-services-selector.tsx (503 righe)
    (account)/notifiche/actions.ts

  Billing (-> area-impresa/private/billing/):
    (billing)/crediti/actions.ts
    (billing)/crediti/credit-checkout-status-banner.tsx

  Shell (-> area-impresa/private/shell/):
    (shell)/impresa-sidebar.tsx (552 righe — sano, nessun side-effect rilevato; valutare split header/nav in Fase 4)

  Shared messaging (-> area-impresa/shared-messaging/, owner nuovo da creare):
    area-impresa/_components/message-thread.tsx
    area-impresa/_components/send-message-form.tsx
    (vedi RISKS #6: oggi importati cross-boundary da apps/web/src/app/(public)/messaggi/accesso/page.tsx)

  Monitoring (-> area-impresa/monitoring/, owner nuovo da creare; vedi anche RISKS #2):
    area-impresa/_lib/perf-log.ts

FILES_TO_REWRITE:
(Marcio per definizione esplicita REGOLA FILE MARCIO: route+auth+query+business logic+UI+monitoring
nello stesso file, o azione server inline dentro componente.)

  (private)/layout.tsx
    Mix: auth (requireAreaImpresaAccess) + 2 query dirette (countUnreadCompanyNotifications,
    countUnreadCompanyConversationSummary) + business logic (getCompanyStatusNotice) + monitoring
    always-on (areaLog) + UI (sidebar/banner). Target: area-impresa-private-layout.tsx sottile +
    shell-counts.tsx (read-model unico) + spostare getCompanyStatusNotice fuori dal layout.

  (private)/(comunicazioni)/_components/company-conversation-thread-page.tsx (357 righe)
    Mix: "use server" inline (sendCompanyMessageAction) dentro un componente di rendering thread.
    Target: separare action (area-impresa/private/comunicazioni/actions/) da componente UI puro.

  richieste/page.tsx (445 righe) e richieste-acquistate/salvate (92 righe ciascuna, senza
  LIMIT/pagination sulla query raw)
    Non "marcio" per mix di responsabilità, ma confermato P0 performance dal precedente audit
    (filtri/sort/paginazione in JS, query senza LIMIT). Riscrittura performance demandata a Fase 5,
    non eseguita in questa fase di audit.

  (billing)/crediti/page.tsx + credit-checkout-status-banner.tsx
    Confermato P0 performance (polling 8x/1500ms, ogni poll fa auth+Stripe+DB). Riscrittura
    demandata a Fase 8/15, non eseguita in questa fase di audit.

FILES_TO_DELETE:
  Nessuno identificato in questo audit. I path vecchi flat (pre-rename) risultano già rimossi dal
  working tree (vedi GIT_STATUS_SUMMARY) — non sono file morti su disco, sono rename non committati.
  Le cancellazioni effettive del lato "app" avverranno nelle Fasi 4-8 quando la logica verrà
  spostata fisicamente nel nuovo owner e il vecchio file sotto app verrà sostituito dal bridge sottile.

DUPLICATES_FOUND:
  Nessuna duplicazione di codice a livello di file nello scope Area Impresa.
  1 duplicazione strutturale: owner pubblico Area Impresa diviso tra due route group
  ((area-impresa) e (public-business)) invece di un unico `area-impresa/public/` — vedi RISKS #8.

DEAD_CODE_FOUND:
  Nessuno. Verificato via grep di utilizzo per tutti i file in _components/_lib del ramo
  (opportunita)/(comunicazioni): tutti referenziati da almeno un page/action/altro componente.

PACKAGE_EXTRACTION_CANDIDATES:
  1. getCompanyStatusNotice (oggi inline in (private)/layout.tsx): da valutare se resta helper
     web (area-impresa/private/shell) o se la mappatura stato->testo deve essere domain-owned.
  2. Shell counts: introdurre un orchestratore unico (es. getAreaImpresaShellCounts(actor)) in
     packages/domain/src/company che consolidi countUnreadCompanyNotifications +
     countUnreadCompanyConversationSummary in una sola chiamata, riusabile da layout e da notifiche/page.
  3. apps/web/src/lib/area-impresa/create-company-for-current-user.ts: oggi vive in un percorso
     senza owner valido (lib/); logica di creazione company sembra candidata a packages/domain.
  4. apps/web/src/lib/area-monitoring.ts + area-monitoring.server.ts: da scomporre — parte generica
     (gate/sampling/console) -> platform/monitoring; parte con etichette Area Impresa-specifiche ->
     area-impresa/monitoring/area-impresa-perf-trace.ts (già previsto da 01_ARCHITECTURE.md).
  5. request-card-format.ts / request-commercial-display.ts: verificare overlap con helper generici
     money/date che packages/shared dovrebbe possedere (oggi packages/shared ha solo geo.ts e
     strings.ts; money.ts/date.ts previsti dall'architettura non esistono ancora).

RISKS:
  1. CRITICO — Route group vietati già parzialmente committati. (opportunita) è in main da d0d2b02;
     (comunicazioni)/(account)/(billing)/(shell) sono nel working tree non committato. Violano
     esplicitamente 01_ARCHITECTURE.md/02_GUARDS.md ("Vietato usare route group per responsabilità
     prodotto"). Per decisione esplicita dell'operatore, questa violazione NON viene corretta in
     questa fase: viene solo documentata per le Fasi 4-8.
  2. apps/web/src/lib/* non ha owner valido secondo REGOLA MACRO OWNER (lib non è tra gli owner
     ammessi sotto apps/web/src). È importato da quasi tutti i file Area Impresa, da
     apps/web/src/auth/server.ts, da apps/web/src/middleware.ts e da apps/web/src/app/api/stripe/webhook/route.ts.
     Va riassegnato prima/durante le Fasi 4-8, altrimenti ogni fase successiva eredita un import
     verso un owner inesistente.
  3. apps/web/src/auth/server.ts: requireCompanyActor esegue un console.info ad ogni invocazione
     (non gated da isAreaMonitoringEnabled) — viola REGOLA PERFORMANCE "logging sempre attivo
     vietato". L'adapter auth web è inoltre accoppiato a lib/area-monitoring (owner non chiaro, #2).
  4. Cross-boundary import confermato: apps/web/src/app/(public)/messaggi/accesso/page.tsx (owner
     richiesta/cliente soft) importa direttamente
     apps/web/src/app/(area-impresa)/area-impresa/_components/{message-thread,send-message-form}.tsx
     (owner Area Impresa). Nessun owner condiviso esiste oggi. È esattamente il caso che
     01_ARCHITECTURE.md risolve con `area-impresa/shared-messaging/`, non ancora creato.
  5. La stessa action (sendCustomerMessageAction in messaggi/accesso/page.tsx) chiama
     revalidatePath("/area-impresa", "layout") da una route cliente — revalidation cross-prodotto
     ampia. Fuori scope diretto Area Impresa, segnalato per la Fase 11 (richiesta/comunicazioni).
  6. Owner pubblico Area Impresa duplicato su due alberi route group diversi
     ((area-impresa) vs (public-business)) — vedi DUPLICATES_FOUND.
  7. 03_ROADMAP.md "STATO ROADMAP" dichiarava tutte le fasi PENDING nonostante lavoro (non conforme)
     già eseguito su Fasi 4-8. Aggiornato in questa stessa fase (vedi sezione roadmap).
  8. P0 performance già confermati dal precedente audit, non ancora risolti: /area-impresa/richieste
     (filtri/sort/paginazione in JS) e /area-impresa/crediti checkout/status (polling 8x/1500ms).

NEXT_PHASE:
  Fase 3 — Area Impresa Public, secondo l'ordine di 03_ROADMAP.md.
  Nota per chi eseguirà le Fasi 4-8: il lavoro già presente sotto
  apps/web/src/app/(area-impresa)/area-impresa/(private)/(opportunita|comunicazioni|account|billing|shell)/
  NON va trattato come baseline valida. Va corretto spostando i file secondo FILES_TO_MOVE/
  FILES_TO_REWRITE sopra, rimuovendo i route group vietati, e lasciando in app solo i bridge
  elencati in FILES_TO_KEEP_IN_APP con path corretto.
