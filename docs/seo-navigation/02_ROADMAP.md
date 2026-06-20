# Esigenta — SEO Navigation Roadmap

Versione: 1.0
Stato: ATTIVA
Ambito: Home, servizi, interventi, guide ai costi, funnel, release readiness
Documento collegato: `docs/seo-navigation/01_SCHEMA.md`
Documento collegato: `docs/seo-navigation/03_RELEASE_GUARDS.md`
Documento collegato: `docs/seo-navigation/04_OPEN_ITEMS.md`
Ultimo aggiornamento: 2026-06-18
Protocollo di esecuzione AI: vedi sezione 26 — AI EXECUTION PROTOCOL (leggere prima di eseguire qualsiasi fase)

---

## 1. Scopo del documento

Questo documento è la roadmap operativa per rendere lo schema SEO/navigation di Esigenta eseguibile a fasi.

Obiettivo:

```txt id="q9au3l"
Preparare il terreno.
Eliminare mismatch e cose finte.
Creare gli hub necessari.
Allineare home, servizi, costi, funnel e SEO.
Andare in release senza figuracce.
```

Questa roadmap deve essere aggiornata dall’AI dopo ogni fase eseguita.

Nessuna fase deve procedere se la fase precedente non ha prodotto un report finale leggibile.

---

## 2. Documenti vincolanti

Prima di ogni fase, l’AI deve leggere:

```txt id="tpxemi"
docs/architetture/01_ARCHITECTURE.md
docs/architetture/02_GUARDS.md
docs/architetture/03_ROADMAP.md
docs/architetture/04_DEFERRED_ITEMS.md
docs/seo-navigation/01_SCHEMA.md
docs/seo-navigation/02_ROADMAP.md
docs/seo-navigation/03_RELEASE_GUARDS.md
docs/seo-navigation/04_OPEN_ITEMS.md
```

Se `03_RELEASE_GUARDS.md` non esiste ancora, la fase deve limitarsi alla documentazione o chiedere esplicitamente di crearlo.

---

## 3. Stato appreso dagli audit

### 3.1 Phase 18

Stato:

```txt id="os5qrq"
COMPLETATA
```

Risultato:

```txt id="eors2b"
Audit SEO/GEO completato.
Problema content.ts gigante identificato.
Problema guide costi/città scalabilità identificato.
```

---

### 3.2 Phase 18.1

Stato:

```txt id="h7ubzl"
COMPLETATA
```

Risultato:

```txt id="ges1e6"
content.ts ristrutturare-bagno da 543 righe a composer di 91 righe.
Creati geo/cities.ts.
Creati supported-cities.ts.
Creati market-data.
Creato pricing-resolver.
Creato canonical resolver.
Creati base.ts, faq.ts, local-overrides.ts.
```

Limite:

```txt id="xqkn26"
La fondazione SEO/GEO regge solo come pilot.
Manca ancora validazione su seconda famiglia.
Mancano matrix, schema-builder, sitemap.
```

---

### 3.3 Phase 19

Stato:

```txt id="vpb1o8"
COMPLETATA
```

Risultato:

```txt id="hxdtkh"
Audit home/interventi/costi completato.
Scoperto che le 6 card home sono hardcoded.
Scoperto che Guide ai costi in home è rotta/finta.
Scoperto che /costi hub non esiste.
Scoperto che /interventi hub non esiste.
```

---

### 3.4 Phase 19.0B

Stato:

```txt id="217i3q"
COMPLETATA
```

Risultato:

```txt id="b2o4rv"
Le 6 card home sono READY_FOR_RELEASE come comportamento attuale.
Le 6 card sono DA_RIALLINEARE come architettura.
Guide ai costi in home è NEEDS_FIX_BEFORE_RELEASE.
Manca /costi: release blocker.
Manca /servizi: requisito strategico per comunicare ampiezza catalogo.
Hub /interventi non è obbligatorio ora.
```

---

## 4. Principi di esecuzione

### 4.1 Una fase alla volta

Vietato eseguire più fasi insieme.

Esempio vietato:

```txt id="8bw9fq"
creare /costi
riscrivere home
creare /servizi
aggiungere task funnel
creare nuove guide costo
```

nella stessa fase.

Ogni fase deve avere:

```txt id="b1g4eo"
scope chiaro;
file consentiti;
file vietati;
test obbligatori;
report finale;
aggiornamento roadmap.
```

---

### 4.2 Prima fondamenta, poi pagine

Ordine logico:

```txt id="m2uaze"
1. Documentare schema.
2. Definire guardrail.
3. Preparare registry/fondazioni.
4. Correggere sezioni rotte.
5. Creare hub minimi.
6. Allineare source of truth.
7. Solo dopo espandere SEO.
```

---

### 4.3 Niente release con cose finte

Non può andare in release una sezione pubblica con:

```txt id="nkwjlp"
href="#";
guide inesistenti;
card non cliccabili se sembrano cliccabili;
CTA morti;
hub vuoti;
categorie vuote;
professionisti finti;
pagine promesse ma non implementate.
```

---

### 4.4 La roadmap si aggiorna sempre

Dopo ogni fase l’AI deve aggiornare questo file.

Ogni aggiornamento deve modificare:

```txt id="smgwvj"
stato fase;
file toccati;
release blockers risolti;
release blockers rimasti;
rischi;
prossima fase consigliata.
```

---

## 5. Stati ammessi per le fasi

Ogni fase usa uno di questi stati:

```txt id="d03m0n"
NOT_STARTED
READY
IN_PROGRESS
COMPLETED
COMPLETED_BY_BOOTSTRAP
PARTIALLY_COMPLETED
BLOCKED
DEFERRED
CANCELLED
```

Significato:

```txt id="vbl9bf"
NOT_STARTED = non ancora iniziata.
READY = pronta per essere eseguita.
IN_PROGRESS = in corso.
COMPLETED = completata e verificata con un'esecuzione dedicata della fase.
COMPLETED_BY_BOOTSTRAP = il contenuto/artefatto richiesto dalla fase risultava già presente
  e conforme al momento del bootstrap documentale (Phase 19.1): non è stata eseguita come
  fase dedicata con il proprio ciclo scope/azioni/acceptance criteria, ma l'output atteso
  esiste già e rispetta gli acceptance criteria dichiarati. Va trattata come COMPLETED per
  le fasi successive, ma la distinzione resta tracciata per onestà storica.
PARTIALLY_COMPLETED = completata solo in parte, con residui dichiarati.
BLOCKED = bloccata da problema tecnico/prodotto.
DEFERRED = rimandata consapevolmente.
CANCELLED = eliminata dalla roadmap.
```

---

## 6. Release blockers correnti

### 6.1 Blocker tecnici/prodotto

| Blocker                                                             |                           Stato | Note                                |
| ------------------------------------------------------------------- | ------------------------------: | ----------------------------------- |
| Guide ai costi in home mostra guide inesistenti                     |                            OPEN | 3 guide su 4 non hanno pagina reale |
| CTA Guide ai costi con `href="#"`                                   |                            OPEN | vietato in release                  |
| `/costi` hub mancante                                               |                            OPEN | guida reale orfana                  |
| Home comunica solo 6 servizi senza accesso chiaro al catalogo ampio |                            OPEN | richiede `/servizi` o CTA chiara    |
| 6 card hardcoded e non garantite da registry                        | OPEN ma non bloccante immediato | da riallineare in fase dedicata     |

---

### 6.2 Non blocker immediati

| Item                                                |                             Stato | Note                                         |
| --------------------------------------------------- | --------------------------------: | -------------------------------------------- |
| `/interventi` hub mancante                          |                      POST_RELEASE | home mostra già tutte le 6 landing esistenti |
| Nuove guide costo tetto/clima/fotovoltaico          |         POST_RELEASE o SEO_GROWTH | non prometterle finché non esistono          |
| Professionisti registrati visibili                  |                      POST_RELEASE | solo quando ci sono dati reali               |
| Migrazione `/interventi/[slug]` → `/servizi/[slug]` | POST_RELEASE / DECISIONE DEDICATA | richiede strategia redirect/canonical        |
| Micro-guide costo                                   |                        SEO_GROWTH | solo con contenuto reale                     |
| why-choose dead code                                |                           CLEANUP | non blocca SEO release                       |

---

## 7. Roadmap sintetica

| Fase | Nome                                 |       Stato | Tipo             |                              Release |
| ---- | ------------------------------------ | ----------: | ---------------- | -----------------------------------: |
| 19.1 | Documentation Lock                   |       COMPLETED | docs             |                                   sì |
| 19.2 | Release Guards                       | COMPLETED_BY_BOOTSTRAP | docs             |                                   sì |
| 19.3 | Navigation Registry Foundation       | COMPLETED | foundation       |                                   sì |
| 19.4 | Cost Hub Minimum `/costi`            | COMPLETED | route/page       |                                   sì |
| 19.5 | Home Cost Guides Rewrite             | COMPLETED | home/UI          |                                   sì |
| 19.6 | Services Hub Minimum `/servizi`      | COMPLETED | route/page       |                                   sì |
| 19.6B | Services Hub Breadth & Funnel Reality Check | COMPLETED | foundation/audit |                            sì |
| 19.6C | SEO Navigation Open Items Register   |   COMPLETED | docs             |                                   sì |
| 19.7 | Home Featured Services Alignment     | COMPLETED | home/foundation  |                                   sì |
| 19.6D | Taxonomy Source Structure Audit     |   COMPLETED | audit            |                                   sì |
| 19.6E | Services Hub Conversion Page Model Audit |  COMPLETED | audit/design |                              sì |
| 19.6F | SEO Navigation Docs Redefinition & Taxonomy Inconsistencies Register | COMPLETED | docs | sì |
| 19.6G | Taxonomy Orphan Cleanup              |   COMPLETED | taxonomy/data    |                                   sì |
| 19.6H | Public Catalog Schema & Coverage Guards |   COMPLETED | foundation/guards |                          sì |
| 19.6I | Services Hub Taxonomy-Derived Implementation |   COMPLETED | route/foundation |                       sì |
| 19.6J | Services Hub QA & Conversion Review  |   COMPLETED | QA               |                                   sì |
| 19.8 | Service Tasks Funnel-Only Pilot      |   COMPLETED | service/funnel   |                         nice-to-have |
| 19.9 | Release Readiness QA                 |   COMPLETED | QA               |                                   sì |
| 19.9.1 | Fix Release Blockers (footer href="#") |   COMPLETED | fix         |                                   sì |
| 20.1 | Second Cost Guide Family             |   COMPLETED | SEO growth       | post-release o pre-release se deciso |
| 20.2 | Cost Hub Categories                  |   COMPLETED | SEO growth       |                         post-release |
| 20.3 | Service → Cost Internal Linking      |   COMPLETED | SEO growth       |                         post-release |
| 20.4 | Professionals Module                 | NOT_STARTED | product/SEO      |                         post-release |
| 20.5 | `/servizi/[slug]` Canonical Decision | NOT_STARTED | architecture/SEO |                         post-release |

---

# 8. Phase 19.1 — Documentation Lock

Status:

```txt id="jg80lf"
COMPLETED
```

Tipo:

```txt id="ggjg0o"
Documentazione
```

Obiettivo:

```txt id="u9dqiu"
Creare la cartella docs/seo-navigation.
Creare 01_SCHEMA.md.
Creare 02_ROADMAP.md.
Preparare il terreno per 03_RELEASE_GUARDS.md.
Non modificare codice applicativo.
```

File consentiti:

```txt id="my27a1"
docs/seo-navigation/01_SCHEMA.md
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="23178z"
apps/**
packages/**
prisma/**
docs/architetture/**
```

Azioni:

```txt id="kgiwe7"
1. Creare docs/seo-navigation se non esiste.
2. Salvare 01_SCHEMA.md.
3. Salvare 02_ROADMAP.md.
4. Non toccare codice.
5. Non fare refactor.
```

Acceptance criteria:

```txt id="04th99"
01_SCHEMA.md presente.
02_ROADMAP.md presente.
Nessun file applicativo modificato.
Roadmap leggibile.
```

Output report richiesto:

```txt id="8vjv7v"
STATUS:
PHASE:
FILES_CREATED:
FILES_CHANGED:
FILES_DELETED:
CODE_CHANGED:
NEXT_STEP:
```

## 8.1 PHASE_REPORT Phase 19.1

```txt id="ph191rep"
STATUS: COMPLETED
PHASE: 19.1 — SEO Navigation Documentation Bootstrap
FILES_CREATED: nessuno (01_SCHEMA.md, 02_ROADMAP.md, 03_RELEASE_GUARDS.md risultavano già
  presenti e completi all'apertura della fase)
FILES_CHANGED: docs/seo-navigation/02_ROADMAP.md (aggiunta sezione 26 — AI EXECUTION
  PROTOCOL; stato 19.1 portato a COMPLETED; stato 19.2 portato a COMPLETED_BY_BOOTSTRAP;
  aggiunto stato COMPLETED_BY_BOOTSTRAP alla lista stati ammessi; aggiunto questo report)
FILES_DELETED: nessuno
CODE_CHANGED: NO — nessun file sotto apps/**, packages/**, prisma/**, package.json,
  pnpm-lock.yaml è stato letto o modificato in questa fase
NEXT_STEP: Phase 19.3 — Navigation Registry Foundation (prima fase che tocca codice,
  solo fondazione dati, nessuna nuova route pubblica)
```

---

# 9. Phase 19.2 — Release Guards

Status:

```txt id="i4xrru"
COMPLETED_BY_BOOTSTRAP
```

Tipo:

```txt id="c4pv34"
Documentazione / guardrail
```

Obiettivo:

```txt id="w3x17y"
Creare 03_RELEASE_GUARDS.md.
Definire regole anti-figuraccia.
Rendere i guardrail leggibili e verificabili dall’AI prima di ogni fase.
```

File consentiti:

```txt id="fj0exl"
docs/seo-navigation/03_RELEASE_GUARDS.md
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="pck4uf"
apps/**
packages/**
prisma/**
```

Contenuto minimo di `03_RELEASE_GUARDS.md`:

```txt id="pxg5z2"
nessun href="#";
nessuna guida inesistente in home o /costi;
nessuna card finta;
nessuna categoria vuota;
nessuna pagina locale thin;
nessuna micro-guida con card fotografica;
nessun professionista finto;
ogni voce pubblica deve avere destinazione reale;
ogni fase aggiorna 02_ROADMAP.md.
```

Acceptance criteria:

```txt id="92h61h"
03_RELEASE_GUARDS.md presente.
Ogni guard ha check concreto.
02_ROADMAP.md aggiornato con Phase 19.2 COMPLETED_BY_BOOTSTRAP.
```

## 9.1 PHASE_REPORT Phase 19.2

```txt id="ph192rep"
STATUS: COMPLETED_BY_BOOTSTRAP
PHASE: 19.2 — Release Guards
FILES_CREATED: nessuno in questa esecuzione — docs/seo-navigation/03_RELEASE_GUARDS.md
  risultava già presente, completo (28 sezioni, guard 1-20, checklist pre-release,
  esempi pratici) e conforme al contenuto minimo richiesto dalla sezione 9 di questo
  documento al momento dell'apertura della fase
FILES_CHANGED: nessuno (03_RELEASE_GUARDS.md non necessitava correzioni)
FILES_DELETED: nessuno
GUARDS_VERIFIED: ogni guard (1-20) ha una regola, un perché/check obbligatorio e un esito
  atteso espliciti — verificato per intero in questa fase, nessuna lacuna trovata
WHY_COMPLETED_BY_BOOTSTRAP_AND_NOT_COMPLETED: la fase non è stata eseguita come ciclo
  dedicato (scope→azioni→acceptance criteria propri), il documento esisteva già da una
  sessione precedente non visibile in questo contesto conversazionale; questa fase si è
  limitata a verificarne la conformità e a registrarlo nella roadmap
NEXT_STEP: nessuna ulteriore azione su 03_RELEASE_GUARDS.md finché non emerge una nuova
  regola da una fase successiva
```

---

# 10. Phase 19.3 — Navigation Registry Foundation

Status:

```txt id="rc64nk"
COMPLETED
```

Tipo:

```txt id="77lvxj"
Fondazione codice, senza nuove pagine pubbliche
```

Obiettivo:

```txt id="mye6ef"
Preparare il modello dati navigazionale per servizi, categorie e task.
Non creare ancora /servizi.
Non cambiare ancora home.
Non cambiare ancora /costi.
```

Ragione:

```txt id="77msb3"
Prima di creare pagine, serve definire una fonte ordinata per:
ServiceCategory
ServicePage
ServiceTask
FunnelIntent
CostGuide
```

Possibile collocazione da valutare:

```txt id="51x0tf"
apps/web/src/site/services/**
apps/web/src/site/seo/services/**
apps/web/src/site/navigation/**
```

La fase deve scegliere la collocazione coerente con `01_ARCHITECTURE.md` e `01_SCHEMA.md`.

Modello minimo atteso:

```txt id="i7ke9p"
ServiceCategory:
  slug
  title
  description
  order

ServiceCatalogItem:
  title
  categorySlug
  status: SEO_PAGE | FUNNEL_ONLY | PLANNED | HIDDEN
  seoInterventionSlug?
  funnelSlug?
  taskSlug?
  homeFeature?
  order
```

Regole:

```txt id="lvvoz2"
Non duplicare contenuto SEO.
Non mettere immagini marketing in taxonomy.
Non spostare funnel.
Il registry navigazionale può referenziare SEO slug e funnelSlug.
```

File consentiti:

```txt id="60gr3r"
apps/web/src/site/**
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="pmz5x3"
packages/taxonomy/**
packages/funnel/**
site/seo/pages/interventi/** contenuti editoriali, salvo type import minimi
site/home/** salvo se necessario solo per import type, ma preferire no
```

Acceptance criteria:

```txt id="vd4md8"
Esiste un modello navigazionale testabile.
Nessuna nuova route pubblica.
Nessuna UI modificata.
Nessun href nuovo.
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## 10.1 PHASE_REPORT Phase 19.3

```txt id="ph193rep"
STATUS: COMPLETED
PHASE: 19.3 — Navigation Registry Foundation

FILES_CREATED:
  apps/web/src/site/services/types.ts
  apps/web/src/site/services/categories.ts
  apps/web/src/site/services/catalog.ts
  apps/web/src/site/services/index.ts
FILES_CHANGED: docs/seo-navigation/02_ROADMAP.md (stato 19.3 → COMPLETED, questo report)
FILES_DELETED: nessuno

ROUTES_CREATED: nessuna (apps/web/src/app/** non toccato)
UI_CHANGED: nessuna (apps/web/src/site/home/** non toccato)
PACKAGES_CHANGED: nessuno (packages/** non toccato, solo letto packages/taxonomy e
  packages/funnel per confermare i funnelSlug, nessuna modifica)

SERVICE_CATEGORIES_CREATED: 7 — ristrutturazioni, impianti, energia, finiture,
  pratiche-edilizie, tecnici-e-progettazione, manutenzione
SERVICE_ITEMS_CREATED: 12
SEO_PAGE_ITEMS: 6 — ristrutturare-bagno (funnelSlug rifare-bagno),
  rifare-tetto (funnelSlug rifare-tetto),
  rifare-impianto-elettrico (funnelSlug impianto-elettrico-nuovo),
  installare-climatizzatore (funnelSlug installare-climatizzatore),
  installare-fotovoltaico (funnelSlug installare-fotovoltaico),
  cartongesso-e-finiture (funnelSlug fare-lavori-cartongesso)
  — ogni voce è validata a module-load time contro
  site/seo/pages/interventi/index.ts (slug esiste + funnelSlug coincide con la landing
  SEO reale); se uno slug venisse rinominato senza aggiornare questo registry, il
  typecheck/build di apps/web fallirebbe con un errore esplicito invece di un 404
  silenzioso in produzione (il rischio identificato in Phase 19.0B Audit 1/2)
FUNNEL_ONLY_ITEMS: 0 (nessun task funnel-only ancora definito, previsto per Phase 19.8)
PLANNED_ITEMS: 6 — pratica-cila, pratica-scia, pratica-ape, geometra, architetto,
  direzione-lavori (categoria pratiche-edilizie/tecnici-e-progettazione, nessuna pagina
  o funnel dedicato verificato oggi: non renderizzabili pubblicamente per costruzione,
  vedi isPubliclyLinkable())
HIDDEN_ITEMS: 0

ROADMAP_UPDATED: sì (questa sezione + tabella sintetica sezione 7)
TYPECHECK_RESULT: PASS (apps/web — pnpm --filter web typecheck)
BUILD_RESULT: PASS (apps/web — 41/41 pagine, stessa lista route di prima della fase:
  nessuna nuova route pubblica introdotta, confermato dal confronto dell'elenco "Route
  (app)" nell'output di build)

RISKS: il registry non è ancora consumato da nessuna UI (per design, è una fondazione
  isolata) — finché non viene letto da una pagina reale (Phase 19.6/19.7), la
  validazione a module-load time si attiva solo quando qualcosa lo importerà
BLOCKERS: nessuno
NEXT_STEP: Phase 19.4 — Cost Hub Minimum /costi
```

---

# 11. Phase 19.4 — Cost Hub Minimum `/costi`

Status:

```txt id="odagaj"
COMPLETED
```

Tipo:

```txt id="efo8z3"
Route/page
```

Obiettivo:

```txt id="2hnm77"
Creare /costi come hub minimo editoriale.
Mostrare solo guide costo realmente pubblicate.
Rendere raggiungibile /costi/ristrutturare-bagno.
```

Route da creare:

```txt id="mey0f6"
apps/web/src/app/costi/page.tsx
```

Possibile template:

```txt id="h6t5p2"
apps/web/src/site/seo/templates/cost-hub-template.tsx
```

Regole UI:

```txt id="vozpjf"
no gallery fotografica;
no categorie vuote;
no guide finte;
lista piatta se esiste una sola guida;
link reale a /costi/ristrutturare-bagno.
```

File consentiti:

```txt id="3u8pe2"
apps/web/src/app/costi/page.tsx
apps/web/src/site/seo/**
apps/web/src/site/shell/**
apps/web/src/ui/**
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="41cn6f"
apps/web/src/site/home/cost-guides.tsx
packages/**
site/seo/pages/costi/ristrutturare-bagno/** dati editoriali, salvo import read-only
```

Acceptance criteria:

```txt id="ofid5t"
/costi risponde.
Mostra solo guide reali.
Non mostra guida tetto/clima/fotovoltaico se non esiste.
Link a /costi/ristrutturare-bagno funzionante.
No href="#."
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## 11.1 PHASE_REPORT Phase 19.4

```txt id="ph194rep"
STATUS: COMPLETED
PHASE: 19.4 — Cost Hub Minimum /costi

FILES_CREATED:
  apps/web/src/app/costi/page.tsx
  apps/web/src/site/seo/templates/cost-hub-template.tsx
FILES_CHANGED:
  apps/web/src/site/seo/engine/metadata.ts (aggiunta buildCostHubMetadata(), nessuna
    immagine OG riusata dalla guida bagno per evitare di estendere il bug latente già
    noto — niente openGraph.images per l'hub)
  docs/seo-navigation/02_ROADMAP.md (stato 19.4 → COMPLETED, questo report)
FILES_DELETED: nessuno

ROUTES_CREATED: /costi (nessun'altra route introdotta — confermato dal build: 42/42
  pagine, una sola route nuova rispetto alla fase precedente)
UI_CHANGED: solo apps/web/src/app/costi/page.tsx (nuovo) e
  apps/web/src/site/seo/templates/cost-hub-template.tsx (nuovo) — nessun template
  esistente modificato
HOME_CHANGED: NO — apps/web/src/site/home/** non toccato (verificato via git status)

GUIDES_SHOWN: 1 — "Quanto costa ristrutturare un bagno?" → /costi/ristrutturare-bagno,
  letta da listCostGuides() (site/seo/pages/costi), non hardcoded nella route/template
MISSING_GUIDES_HIDDEN: tetto, climatizzatore, fotovoltaico e qualunque altra guida non
  pubblicata non compaiono per costruzione: il template itera solo su listCostGuides(),
  che oggi restituisce la sola guida ristrutturare-bagno (verificato in
  site/seo/pages/costi/index.ts, non modificato in questa fase)

ROADMAP_UPDATED: sì
TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (42/42 pagine — pnpm --filter web build)

RISKS: se in futuro listCostGuides() restituisse zero guide, il template mostra un
  messaggio informativo non cliccabile ("Le guide ai costi sono in preparazione...")
  invece di un hub vuoto o rotto — comportamento testato a livello di logica, non ancora
  verificabile a runtime perché oggi esiste sempre almeno una guida
BLOCKERS: nessuno
NEXT_STEP: Phase 19.5 — Home Cost Guides Rewrite
```

---

# 12. Phase 19.5 — Home Cost Guides Rewrite

Status:

```txt id="dbqfrc"
COMPLETED
```

Tipo:

```txt id="3yzi76"
Home/UI
```

Obiettivo:

```txt id="5yu95k"
Eliminare il modello legacy/finto della sezione Guide ai costi in home.
Riscrivere la sezione in formato editoriale compatto, coerente con la home.
Mostrare solo guide reali.
Collegare CTA a /costi reale.
```

File principale:

```txt id="5952uz"
apps/web/src/site/home/cost-guides.tsx
```

Regole:

```txt id="vrnsit"
non patchare vecchie card;
riscrivere la sezione se è più pulito;
no immagini obbligatorie;
no card fotografiche grandi;
no guide inesistenti;
no href="#";
ogni voce linka a pagina reale.
```

Stato minimo atteso:

```txt id="4k7k5s"
Guide ai costi
- Quanto costa ristrutturare un bagno
  link a /costi/ristrutturare-bagno

CTA:
Vedi tutte le guide
→ /costi
```

File consentiti:

```txt id="8smimz"
apps/web/src/site/home/cost-guides.tsx
apps/web/src/site/home/home-page.tsx solo se serve ordine sezione
apps/web/src/ui/**
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="f8a1cn"
apps/web/src/site/home/professional-areas.tsx
packages/**
site/seo/pages/interventi/**
site/seo/pages/costi/ristrutturare-bagno/** dati editoriali
```

Acceptance criteria:

```txt id="9t8jcn"
Nessuna guida inesistente in home.
Nessun href="#."
La sezione è cliccabile dove sembra cliccabile.
Design coerente con home.
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## 12.1 PHASE_REPORT Phase 19.5

```txt id="ph195rep"
STATUS: COMPLETED
PHASE: 19.5 — Home Cost Guides Rewrite

FILES_CREATED: nessuno
FILES_CHANGED: apps/web/src/site/home/cost-guides.tsx (riscritto integralmente),
  docs/seo-navigation/02_ROADMAP.md (stato 19.5 → COMPLETED, questo report)
FILES_DELETED: nessuno (le 4 immagini guida-*.webp non sono state cancellate dal
  filesystem, semplicemente non sono più referenziate dal componente — fuori scope
  toccare apps/web/public/** in questa fase)

HOME_CHANGED: sì, solo la sezione Guide ai costi (site/home/cost-guides.tsx).
  home-page.tsx non è stato toccato (ordine sezioni invariato: Hero, ProfessionalAreas,
  HowItWorks, ProfessionalCta, CostGuides). professional-areas.tsx non toccato
  (verificato: git diff vuoto su quel file).

GUIDES_SHOWN: 1 — "Quanto costa ristrutturare un bagno?" → /costi/ristrutturare-bagno,
  letta da listCostGuides() (site/seo/pages/costi), stessa fonte usata dall'hub /costi
  (Phase 19.4): nessun array hardcoded, nessuna seconda fonte di verità
MISSING_GUIDES_REMOVED: 3 — le card finte "riparare un tetto", "installare un
  climatizzatore", "impianto fotovoltaico" (nessuna pagina reale dietro) sono state
  rimosse insieme a tutte le immagini decorative associate
CTA_LINKS: "Vedi tutte le guide" → /costi (route reale, creata in Phase 19.4); ogni voce
  guida → guide.canonicalPath (oggi /costi/ristrutturare-bagno)
HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/home → 0 occorrenze

ROADMAP_UPDATED: sì
TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (42/42 pagine, stesse route di Phase 19.4, nessuna nuova)

RISKS: le 4 immagini guida-*.webp in apps/web/public/assets/images/home/ restano sul
  filesystem ma non più referenziate — cleanup asset non incluso in questo scope
  (apps/web/public/** non era nell'elenco file consentiti per questa fase)
BLOCKERS: nessuno
NEXT_STEP: Phase 19.6 — Services Hub Minimum /servizi
```

---

# 13. Phase 19.6 — Services Hub Minimum `/servizi`

Status:

```txt id="zexd6o"
COMPLETED
```

Tipo:

```txt id="1r6kej"
Route/page
```

Obiettivo:

```txt id="tcapne"
Creare /servizi come catalogo ampio.
Far capire che Esigenta copre più dei 6 servizi in home.
Includere categorie come pratiche edilizie, tecnici, progettazione, geometri.
```

Route da creare:

```txt id="24pfdo"
apps/web/src/app/servizi/page.tsx
```

Regole:

```txt id="m962js"
mostrare categorie;
mostrare servizi SEO_PAGE reali;
mostrare servizi FUNNEL_ONLY solo se hanno destinazione funnel reale;
non mostrare PLANNED come link pubblico;
nessun href="#";
nessuna categoria vuota;
nessuna pagina finta.
```

Categorie iniziali suggerite:

```txt id="rednn2"
Ristrutturazioni
Impianti
Energia
Pratiche edilizie
Tecnici e progettazione
Finiture
Manutenzione
```

Esempi voci:

```txt id="32hywy"
Ristrutturare bagno
Rifare tetto
Installare fotovoltaico
Installare climatizzatore
Rifare impianto elettrico
Cartongesso e finiture
Pratica CILA
SCIA
APE
Geometra
Architetto
Direzione lavori
Computo metrico
```

File consentiti:

```txt id="6vzcox"
apps/web/src/app/servizi/page.tsx
apps/web/src/site/services/**
apps/web/src/site/seo/**
apps/web/src/ui/**
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="lr54n8"
packages/taxonomy/**
packages/funnel/**
apps/web/src/site/home/** salvo link CTA in fase successiva
```

Acceptance criteria:

```txt id="s46ur6"
/servizi risponde.
Non ci sono link morti.
Le voci con pagina reale linkano a pagina reale.
Le voci funnel-only linkano a funnel reale o restano non cliccabili.
Nessuna categoria vuota.
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## 13.1 PHASE_REPORT Phase 19.6

```txt id="ph196rep"
STATUS: COMPLETED
PHASE: 19.6 — Services Hub Minimum /servizi

FILES_CREATED:
  apps/web/src/app/servizi/page.tsx
  apps/web/src/site/services/services-hub-page.tsx
FILES_CHANGED:
  apps/web/src/site/services/catalog.ts (aggiunte listVisibleServiceCatalogItemsByCategory()
    e getServiceCatalogItemHref())
  apps/web/src/site/services/index.ts (export delle due nuove funzioni)
  docs/seo-navigation/02_ROADMAP.md (stato 19.6 → COMPLETED, questo report)
FILES_DELETED: nessuno

ROUTES_CREATED: /servizi (unica route nuova — build passa da 42 a 43 pagine,
  esattamente +1, nessuna route imprevista)
HOME_CHANGED: NO (site/home/** non toccato, verificato via git status)

SERVICES_HUB_CREATED: sì — lista categorie con relative voci, lettura diretta dal
  registry apps/web/src/site/services/** (categories.ts + catalog.ts), nessun dato
  hardcoded nella pagina/template
CATEGORIES_SHOWN: 4 — ristrutturazioni, impianti, energia, finiture (le uniche con
  almeno una voce SEO_PAGE/FUNNEL_ONLY visibile). pratiche-edilizie,
  tecnici-e-progettazione e manutenzione NON sono mostrate: la prima e la seconda
  contengono solo voci PLANNED (CILA, SCIA, APE, geometra, architetto, direzione
  lavori), la terza non ha nessuna voce — tutte e tre filtrate dalla regola "nessuna
  categoria vuota"
SEO_PAGE_ITEMS_SHOWN: 6 — tutte e 6 le voci create in Phase 19.3, ciascuna linkata a
  /interventi/<seoInterventionSlug> via getServiceCatalogItemHref(), nessuna pagina
  inesistente referenziata (le route /interventi/[slug] sono quelle già esistenti,
  non toccate in questa fase)
PLANNED_ITEMS_SHOWN: 0 — le 6 voci PLANNED sono nascoste per costruzione
  (listVisibleServiceCatalogItemsByCategory filtra su isPubliclyLinkable, che esclude
  PLANNED/HIDDEN), come raccomandato dal task per evitare effetto finto

HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/services → 0 occorrenze
ROADMAP_UPDATED: sì
TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine — pnpm --filter web build)

RISKS: nessuno operativo. Se in futuro vengono aggiunte voci FUNNEL_ONLY senza una
  pagina /richiesta/[funnelSlug] funzionante, getServiceCatalogItemHref() le
  linkerebbe comunque (nessuna validazione runtime contro il funnel, a differenza
  della validazione già presente per SEO_PAGE contro il registry SEO) — accettabile
  oggi perché non esistono ancora voci FUNNEL_ONLY, da tenere a mente in Phase 19.8
BLOCKERS: nessuno
NEXT_STEP: Phase 19.7 — Home Featured Services Alignment
```

---

# 13.2 Phase 19.6B — Services Hub Breadth & Funnel Reality Check

Status:

```txt id="ph196brep"
COMPLETED
```

Obiettivo:

```txt id="ph196bobj"
Verificare se i 6 servizi tecnici/pratiche oggi PLANNED (pratica-cila, pratica-scia,
pratica-ape, geometra, architetto, direzione-lavori) hanno una destinazione reale in
packages/taxonomy o packages/funnel, da promuovere a FUNNEL_ONLY. Se non esiste,
lasciarli PLANNED e dichiararlo esplicitamente, senza forzare nulla.
```

## PHASE_REPORT Phase 19.6B

```txt id="ph196brepfull"
STATUS: COMPLETED
PHASE: 19.6B — Services Hub Breadth & Funnel Reality Check

FILES_CREATED: nessuno
FILES_CHANGED: apps/web/src/site/services/catalog.ts (solo un commento di audit
  aggiunto sopra le voci PLANNED, nessun cambio di status/dati),
  docs/seo-navigation/02_ROADMAP.md (questa sezione)
FILES_DELETED: nessuno

PACKAGES_READ: packages/taxonomy/src/source/** (services/edilizia.ts,
  categories/edilizia.ts, interventions/**, index.ts) e packages/taxonomy/generated/**
  (services/interventions/categories .generated.json); packages/funnel/src/**
  (presets/*.ts, runtime/validate-runtime.ts)
PACKAGES_CHANGED: nessuno

FUNNEL_REALITY_CHECK:
  Cercati con grep case-insensitive (parole intere dove sensato): "cila", "scia", "ape",
  "geometra", "architetto", "direzione lavori", "computo metrico", "sanatoria edilizia".
  packages/taxonomy/src/source/**: 0 corrispondenze reali (un unico match era un falso
  positivo: "ape" dentro la parola "apertura-chiusura-vani").
  packages/taxonomy/generated/**: 0 corrispondenze per gli slug normalizzati
  (cila, scia, ape, geometra, architetto, direzione-lavori, computo-metrico,
  sanatoria-edilizia).
  packages/funnel/src/**: 0 corrispondenze. L'unico preset generico applicabile a uno
  slug non riconosciuto è "GENERIC" (KNOWN_PRESETS in validate-runtime.ts) — un fallback
  acquisizione-dati universale, non una destinazione pensata per questi servizi
  specifici. Usarlo per giustificare una promozione a FUNNEL_ONLY avrebbe significato
  far credere che Esigenta gestisce operativamente CILA/SCIA/APE/geometra/architetto/
  direzione lavori, cosa non verificabile nel codice attuale — esattamente il tipo di
  "destinazione finta" vietato da 03_RELEASE_GUARDS.md Guard 4 e Guard 10.

SERVICES_PROMOTED_TO_FUNNEL_ONLY: 0 — nessuna destinazione reale trovata per nessuno
  dei 6 servizi tecnici/pratiche
SERVICES_LEFT_PLANNED: 6 — pratica-cila, pratica-scia, pratica-ape, geometra,
  architetto, direzione-lavori. Restano non cliccabili e non mostrati in /servizi
  (filtrati da isPubliclyLinkable, invariato da Phase 19.6). Motivazione tracciata
  direttamente nel codice (commento in catalog.ts) per evitare che una fase futura
  riproponga la stessa domanda senza il contesto di questo audit.

CATEGORIES_NOW_VISIBLE: invariate rispetto a Phase 19.6 — 4 (ristrutturazioni,
  impianti, energia, finiture). pratiche-edilizie e tecnici-e-progettazione restano
  nascoste: contengono solo voci PLANNED, quindi zero voci visibili, quindi categoria
  vuota per le regole del catalogo (Guard 6 — nessuna categoria vuota)

HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/services → 0 occorrenze
ROADMAP_UPDATED: sì
TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine, stessa lista route di Phase 19.6 — nessuna variazione)

RISKS: nessuno. La decisione di non promuovere nulla è conservativa per design: meglio
  un catalogo più corto e onesto che voci cliccabili senza una vera capacità operativa
  dietro
BLOCKERS: nessuno
NEXT_STEP: Phase 19.7 — Home Featured Services Alignment
```

---

# 13.3 Phase 19.6C — SEO Navigation Open Items Register

Status:

```txt id="ph196crep"
COMPLETED
```

Obiettivo:

```txt id="ph196cobj"
Creare un registro degli item scoperti durante le fasi SEO/navigation ma non
ancora risolti, senza autorizzare implementazioni automatiche e senza modificare
codice.
```

## PHASE_REPORT Phase 19.6C

```txt id="ph196crepfull"
STATUS: COMPLETED
PHASE: 19.6C — SEO Navigation Open Items Register

FILES_CREATED: docs/seo-navigation/04_OPEN_ITEMS.md
FILES_CHANGED: docs/seo-navigation/02_ROADMAP.md (riferimento a 04_OPEN_ITEMS.md
  aggiunto ai documenti collegati in testa e alla lista documenti vincolanti sezione
  2; riga 19.6C in tabella sintetica; questa sezione)
CODE_CHANGED: NO — nessun file sotto apps/**, packages/**, prisma/**, package.json,
  pnpm-lock.yaml letto o modificato

OPEN_ITEMS_REGISTERED: 21 — OI-001..OI-021, organizzati in: open items pre-release (1),
  open items post-release (8), deferred decisions (2), cleanup items (2, di cui uno
  duplicato per categoria con un post-release item), SEO growth items (6), product/
  domain items (2, di cui uno duplicato concettuale). Includono tutti gli item
  esplicitamente richiesti dal task (6 servizi tecnici non in taxonomy/funnel, voci
  PLANNED nascoste, divieto di usare il preset GENERIC come scorciatoia FUNNEL_ONLY,
  validazione funnelSlug mancante per future voci FUNNEL_ONLY, immagini guida-*.webp
  orfane, hub /interventi post-release, migrazione /interventi→/servizi, professionisti
  registrati, nuove guide/micro-guide/sitemap/schema-builder/matrix come SEO growth)

ROADMAP_UPDATED: sì (solo riferimenti e stato fase, nessuna fase già completata
  riaperta o modificata nel merito)
NEXT_STEP: Phase 19.7 — Home Featured Services Alignment
```

---

# 14. Phase 19.7 — Home Featured Services Alignment

Status:

```txt id="03mfxw"
COMPLETED
```

Tipo:

```txt id="p2eyur"
Home/foundation
```

Obiettivo:

```txt id="zlj8jq"
Riallineare le 6 card home.
Non devono restare hardcoded isolate dentro professional-areas.tsx.
Devono derivare da fonte verificabile.
Aggiungere CTA “Esplora tutti i servizi” verso /servizi.
```

File principale:

```txt id="4zro8p"
apps/web/src/site/home/professional-areas.tsx
```

Strategia target:

```txt id="qir7ov"
Home legge featured services da registry navigazionale o SEO registry.
Le card restano visuali.
Le card rappresentano “Servizi più richiesti”, non catalogo completo.
```

Regole:

```txt id="t1g78v"
non cambiare contenuto visivo senza motivo;
non rompere link esistenti;
non linkare taxonomy slug direttamente se non è URL pubblico;
non spostare copy marketing dentro packages/taxonomy;
non creare nuovo registry scollegato senza validazione.
```

File consentiti:

```txt id="1wgi2w"
apps/web/src/site/home/professional-areas.tsx
apps/web/src/site/services/**
apps/web/src/site/seo/pages/interventi/types.ts se serve campo homeFeature
apps/web/src/site/seo/pages/interventi/index.ts se serve export
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="3yq09z"
packages/taxonomy/**
packages/funnel/**
site/seo/pages/interventi/*/content.ts contenuto editoriale, salvo campo homeFeature se scelto esplicitamente
```

Acceptance criteria:

```txt id="tpu9vb"
Le 6 card mostrano ancora servizi reali.
I link restano funzionanti.
La sezione comunica “Servizi più richiesti”.
Esiste CTA verso /servizi.
Nessun hardcode isolato senza validazione.
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## 14.1 PHASE_REPORT Phase 19.7

```txt id="ph197rep"
STATUS: COMPLETED
PHASE: 19.7 — Home Featured Services Alignment

FILES_CREATED: nessuno
FILES_CHANGED:
  apps/web/src/site/services/types.ts (nuovo tipo ServiceHomeFeature; campo
    homeFeature opzionale su ServiceCatalogItem)
  apps/web/src/site/services/catalog.ts (homeFeature aggiunto alle 6 voci SEO_PAGE
    con image/description/icon già usate in home; validazione a module-load time che
    homeFeature non può esistere su voci non pubblicamente linkabili; nuova
    listFeaturedServiceCatalogItems())
  apps/web/src/site/services/index.ts (export ServiceHomeFeature e
    listFeaturedServiceCatalogItems)
  apps/web/src/site/home/professional-areas.tsx (riscritto per leggere da
    listFeaturedServiceCatalogItems()/getServiceCatalogItemHref() invece
    dell'array hardcoded; aggiunta CTA "Esplora i servizi" → /servizi)
  docs/seo-navigation/02_ROADMAP.md (stato 19.7 → COMPLETED, questo report)
FILES_DELETED: nessuno

HOME_CHANGED: sì, solo professional-areas.tsx (copy, immagini e ordine delle card
  invariati visivamente; cambia solo la fonte dati). cost-guides.tsx e home-page.tsx
  non toccati.
FEATURED_SOURCE_BEFORE: array `featuredInterventions` hardcoded dentro
  professional-areas.tsx, scollegato da qualunque registry
FEATURED_SOURCE_AFTER: site/services/catalog.ts → listFeaturedServiceCatalogItems()
  (filtra su homeFeature presente + isPubliclyLinkable, ordina per
  homeFeature.order) + getServiceCatalogItemHref() per il link. Lo stesso registry
  validato a module-load contro site/seo/pages/interventi (Phase 19.3): se uno slug
  SEO venisse rinominato, il build di apps/web fallisce con errore esplicito invece
  di un 404 silenzioso in produzione.

CARDS_SHOWN: 6 — ristrutturare-bagno, rifare-impianto-elettrico,
  installare-fotovoltaico, rifare-tetto, installare-climatizzatore,
  cartongesso-e-finiture (stesso identico set, stesso ordine visivo, stesse
  immagini/descrizioni di prima — nessuna card aggiunta o rimossa)
CTA_ADDED: nessuna CTA nuova nel layout. Il link "vedi tutti" già esistente è stato
  ricollegato da "#idee-progetto-lista" (scroll interno al carosello) a "/servizi",
  mantenendo identico testo, stile e posizione. Una prima versione di questa fase
  aveva aggiunto un secondo link separato "Esplora i servizi"; rimosso su richiesta
  dell'utente per non introdurre elementi visivi nuovi e mantenere la UI invariata.
LINKS_VERIFIED: tutte e 6 le card linkano a /interventi/<slug> reali (verificato dal
  build: nessuna nuova route, le pagine /interventi/[interventoSlug] esistenti non
  toccate); nessuna voce PLANNED (CILA, SCIA, APE, geometra, architetto, direzione
  lavori) è mai entrata nel set perché homeFeature non è stato assegnato a nessuna di
  esse e la validazione lo impedirebbe comunque
HREF_HASH_CHECK: grep "href=\"#\"" su professional-areas.tsx → 0 occorrenze

ROADMAP_UPDATED: sì
TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine, stessa lista route di Phase 19.6/19.6B/19.6C —
  nessuna nuova route introdotta)

RISKS: nessuno operativo. L'icona è risolta da una chiave stringa
  (homeFeature.icon) mappata localmente in professional-areas.tsx — se in futuro si
  aggiunge una voce featured con una chiave icona non mappata, il fallback silente è
  l'icona Bath; accettabile per ora (solo 6 voci, tutte mappate), da rivedere se il
  numero di featured crescerà.
BLOCKERS: nessuno
NEXT_STEP: Phase 19.6D — Taxonomy Source Structure Audit

NOTA (aggiunta in Phase 19.6F): questa fase resta COMPLETED e valida. La home
continua a derivare le 6 card da site/services/catalog.ts (featured items). Gli
audit successivi (19.6D/19.6E) hanno mostrato che il modello /servizi va esteso a
un layer taxonomy-backed più ampio: questo NON invalida il lavoro qui svolto sulla
home, che resta corretto e non viene toccato dall'estensione di /servizi.
```

---

# 14.2 Phase 19.6D — Taxonomy Source Structure Audit

Status:

```txt id="ph196dstatus"
COMPLETED
```

Tipo: audit read-only (nessun file applicativo toccato per vincolo esplicito della
fase). Output consegnato in conversazione come
`PHASE_19_6D_TAXONOMY_SOURCE_STRUCTURE_AUDIT_REPORT`, non persistito come file su
disco in quella fase.

Risultato sintetico: la taxonomy reale ha 87 services, 81 interventions, 7
categories, 10 domains (sector edilizia + impianti) — molto più ricca delle 6 voci
SEO_PAGE oggi in site/services/catalog.ts. Le 6 voci esistenti sono verificate
corrette al 100% (slug e funnelSlug coincidono con taxonomy reale). Confermato (terza
verifica indipendente dopo Phase 19.6B) che CILA/SCIA/APE/geometra/architetto/
direzione-lavori non esistono in taxonomy. Identificati 4 interventions orphan da
ogni TaxonomyDomain (installare-antifurto, installare-telecamere,
installare-controllo-accessi, rifare-impianto-idraulico) e un'anomalia di naming
(service "impianto-idraulico" con name in minuscolo).
Raccomandazione: derivare /servizi dalla taxonomy reale (Opzione B), non duplicare i
75 interventi mancanti a mano.

---

# 14.3 Phase 19.6E — Services Hub Conversion Page Model Audit

Status:

```txt id="ph196estatus"
COMPLETED
```

Tipo: audit/design read-only (nessun file applicativo toccato, nessuna roadmap
toccata per vincolo esplicito della fase).

Risultato sintetico: progettato il modello pubblico di `/servizi` come conversion
hub (hero → macro aree → servizi più richiesti → sezioni per macro area → CTA
finale), con 12 macro aree pubbliche derivate dai 10 TaxonomyDomain reali più 2
raggruppamenti editoriali cross-domain (Cartongesso e pareti, Piscine). Introdotti 7
stati ufficiali per le card (SEO_PAGE_NOW, REQUEST_NOW, SHOW_IN_COLLAPSED_LIST,
HIDE_FOR_NOW, SEO_PAGE_FUTURE, HIDE_UNTIL_TAXONOMY_EXISTS, NEEDS_TAXONOMY_FIX).
Proposta architettura scalabile: `site/services/public-navigation/` con
types/macro-areas/featured-items/seo-page-map/builders/validators, dove
seo-page-map.ts è DERIVATO da site/seo/pages/interventi (non duplicato a mano) e
macro-areas.ts resta un piccolo file editoriale che referenzia domini/interventi
reali senza mai copiarne i dati.

---

# 14.4 Phase 19.6F — SEO Navigation Docs Redefinition & Taxonomy Inconsistencies Register

Status:

```txt id="ph196fstatus"
COMPLETED
```

Tipo: documentazione (nessun codice toccato).

Obiettivo: recepire in `01_SCHEMA.md` e `04_OPEN_ITEMS.md` il nuovo schema mentale
emerso da Phase 19.6D/19.6E (taxonomy = fonte dominio, domains = cluster
interno/SEO non UX pubblica 1:1, PublicServiceMacroArea = layer pubblico sopra
taxonomy, interventions = unità di conversione) e registrare le incoerenze taxonomy
scoperte.

## PHASE_REPORT Phase 19.6F

```txt id="ph196frep"
STATUS: COMPLETED
PHASE: 19.6F — SEO Navigation Docs Redefinition & Taxonomy Inconsistencies Register

FILES_CREATED: nessuno
FILES_CHANGED:
  docs/seo-navigation/01_SCHEMA.md (nuova sezione 20 — Modello /servizi: Conversion
    Hub Taxonomy-Backed; sezione 8 marcata come superata con rimando alla 20)
  docs/seo-navigation/04_OPEN_ITEMS.md (OI-001 riscritto; aggiunti OI-022..OI-029 per
    incoerenze taxonomy, area Giardinaggio, competitor/SEO growth, decisione
    domains-vs-macro-aree)
  docs/seo-navigation/02_ROADMAP.md (tabella sintetica + sezioni 14.2/14.3/14.4/14.5/
    14.6/14.7 — questa fase e le due precedenti mai loggate, più gli stub 19.6G/H/I)
FILES_DELETED: nessuno
CODE_CHANGED: NO — nessun file sotto apps/**, packages/**, prisma/**, package.json,
  pnpm-lock.yaml letto o modificato. Nessuna route creata. Nessun catalog.ts toccato.

SCHEMA_UPDATED: sì — 01_SCHEMA.md sezione 20
SERVIZI_MODEL_UPDATED: sì — modello a 7 stati + hero/macro-aree/sezioni/CTA finale
PUBLIC_MACRO_AREA_LAYER_DOCUMENTED: sì — PublicServiceMacroArea/PublicServiceCard/
  DestinationType/VisibilityPolicy/SeoPageMapping/FunnelDestination definiti
DOMAINS_DECISION_DOCUMENTED: sì — "TaxonomyDomain non diventa macro-area pubblica 1:1"
  documentato esplicitamente con motivazione ed esempi (Tetti e facciate, Cartongesso)
INTERVENTIONS_AS_CONVERSION_UNIT_DOCUMENTED: sì — TaxonomyIntervention è l'unica unità
  che porta a una destinazione reale (SEO page o funnel diretto); Service/Category/
  Domain restano solo raggruppamento, mai CTA
LINK_RULES_DOCUMENTED: sì — tabella SEO_PAGE_NOW/REQUEST_NOW/SHOW_IN_COLLAPSED_LIST/
  fuori-taxonomy/macro-area-vuota
SCALABILITY_RULES_DOCUMENTED: sì — sezione "Scalable Services Model" con i punti
  richiesti (taxonomySource come fonte, site/services come layer editoriale, divieto
  di duplicare 81 interventions a mano, flow di promozione REQUEST_NOW→SEO_PAGE_NOW)

OPEN_ITEMS_UPDATED: sì
TAXONOMY_INCONSISTENCIES_REGISTERED: 5 (OI-022..OI-026): installare-antifurto,
  installare-telecamere, installare-controllo-accessi, rifare-impianto-idraulico
  (tutti orphan da TaxonomyDomain) + service impianto-idraulico (naming anomalo)
HIDE_UNTIL_TAXONOMY_EXISTS_ITEMS: 2 aree registrate (OI-027 Giardinaggio — nuovo;
  OI-002 Pratiche e tecnici — già esistente, aggiornato per chiarezza con l'elenco
  esplicito CILA/SCIA/APE/geometra/architetto/direzione-lavori)
SEO_GROWTH_ITEMS_REGISTERED: 2 nuovi (OI-028 competitor/navigation audit vs
  Instapro/HomeDeal/ProntoPro/Habitissimo; OI-029 keyword research + elenco
  candidate SEO_PAGE_FUTURE: perdita-acqua, rifare-cucina, posare-piastrelle,
  fare-opere-murarie, rifare-facciata, fare-cappotto-termico, saltata-corrente,
  ampliare-casa)

ROADMAP_UPDATED: sì (questa sezione, tabella sintetica, retro-logging 19.6D/19.6E,
  stub 19.6G/19.6H/19.6I)
NEXT_PHASE: 19.6G — Taxonomy Orphan Cleanup
RISKS: nessuno — fase puramente documentale. Il rischio reale resta quello già
  annotato in Phase 19.6E: il salto da 6 a ~73 voci REQUEST_NOW in /servizi va
  implementato rispettando rigorosamente i limiti di collasso documentati, non sarà
  verificato finché Phase 19.6H non viene eseguita.
BLOCKERS: nessuno
```

---

# 14.5 Phase 19.6G — Taxonomy Orphan Cleanup

Status:

```txt id="ph196gstatus"
COMPLETED
```

Obiettivo: risolvere le 5 incoerenze registrate in OI-022..OI-026 (4 interventions
orphan da domain + 1 anomalia di naming), senza ridisegnare la taxonomy e senza
trasformare alcun domain in macro-area pubblica.

## PHASE_REPORT Phase 19.6G

```txt id="ph196grep"
STATUS: COMPLETED
PHASE: 19.6G — Taxonomy Orphan Cleanup

FILES_CREATED: packages/taxonomy/src/source/domains/sicurezza-elettronica.ts
FILES_CHANGED:
  packages/taxonomy/src/source/domains/idraulica.ts (+rifare-impianto-idraulico)
  packages/taxonomy/src/source/services/impianti.ts (name fix impianto-idraulico)
  packages/taxonomy/src/source/index.ts (import + registrazione nuovo domain)
  packages/taxonomy/generated/{manifest,domains}.generated.json (rigenerati via
    `pnpm --filter @esigenta/taxonomy taxonomy:generate`, mai modificati a mano)
  docs/seo-navigation/04_OPEN_ITEMS.md (OI-022..026 → RESOLVED_BY_PHASE_19_6G,
    log risoluzioni aggiunto)
  docs/seo-navigation/02_ROADMAP.md (questa sezione)
FILES_DELETED: nessuno
CODE_CHANGED: solo packages/taxonomy/src/source/** e generated/** (entrambi nello
  scope consentito); nessun file in apps/**, packages/funnel/**, packages/domain/**,
  prisma/** toccato (verificato via git status)

TAXONOMY_FIXES_APPLIED: 3
SECURITY_DOMAIN_FIX: creato nuovo domain con slug "sicurezza" (non
  "sicurezza-elettronica": collisione globale di slug con la category esistente
  "sicurezza-elettronica", bloccata dal validator — risolta scegliendo uno slug
  distinto; il name resta "Sicurezza elettronica", i name non sono unici
  globalmente). Contiene installare-antifurto, installare-telecamere,
  installare-controllo-accessi (OI-022/023/024 risolti)
IDRAULICA_DOMAIN_FIX: aggiunto "rifare-impianto-idraulico" al domain idraulica
  esistente (OI-025 risolto)
SERVICE_NAMING_FIX: service impianto-idraulico, name "impianto-idraulico" →
  "Impianto idraulico" (OI-026 risolto)

DOMAIN_COUNT_BEFORE: 10
DOMAIN_COUNT_AFTER: 11
ORPHAN_INTERVENTIONS_BEFORE: 4 (installare-antifurto, installare-telecamere,
  installare-controllo-accessi, rifare-impianto-idraulico)
ORPHAN_INTERVENTIONS_AFTER: 0

GENERATED_UPDATED: sì, tramite `pnpm --filter @esigenta/taxonomy taxonomy:generate`
  (mai modificato a mano, come richiesto)
VALIDATION_COMMANDS_RUN:
  pnpm --filter @esigenta/taxonomy typecheck → PASS
  pnpm --filter @esigenta/taxonomy taxonomy:generate → PASS (fallito una prima volta
    per collisione di slug, risolto rinominando lo slug del domain da
    "sicurezza-elettronica" a "sicurezza"; al secondo run: "Generated taxonomy
    artifacts", zero warning orphan residui nell'output)
  pnpm --filter web typecheck → PASS
  pnpm --filter web build → PASS
  (taxonomy:seed non eseguito: scrive sul database Prisma, fuori scope di una fase
  che deve toccare solo file; nessuna richiesta esplicita di seedare il DB in questa
  fase)
TYPECHECK_TAXONOMY_RESULT: PASS
TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS (43/43 pagine, nessuna route nuova/rimossa)

OPEN_ITEMS_UPDATED: sì — OI-022..OI-026 marcati RESOLVED_BY_PHASE_19_6G, log
  risoluzioni aggiunto in 04_OPEN_ITEMS.md sezione 9
ROADMAP_UPDATED: sì

RISKS: nessuno tecnico. Il nuovo domain "sicurezza" non è ancora collegato a nessuna
  macro-area pubblica: resta una decisione separata per Phase 19.6H, come previsto.
  taxonomy:seed non eseguito — se l'ambiente di sviluppo/staging usa un DB seedato
  manualmente o con un processo CI separato, qualcuno dovrà eventualmente
  ri-eseguire il seed per riflettere queste modifiche nel database (fuori scope di
  questa fase, da verificare con chi gestisce il deploy taxonomy).
BLOCKERS: nessuno
NEXT_PHASE: Phase 19.6H — Services Hub Taxonomy-Derived Implementation
```

---

# 14.6 Phase 19.6H — Public Catalog Schema & Coverage Guards

Status:

```txt id="ph196hstatus"
COMPLETED
```

Obiettivo: definire uno schema esplicito per il catalogo pubblico (ogni
TaxonomyIntervention reale classificato in uno dei 7 stati) e un guard che fallisce
se qualcosa resta non classificato, punta a una destinazione inesistente, o crea una
macro area vuota — senza riscrivere `/servizi` né ridisegnare i TaxonomyDomain.

## PHASE_REPORT Phase 19.6H

```txt id="ph196hrep"
STATUS: COMPLETED
PHASE: 19.6H — Public Catalog Schema & Coverage Guards

FILES_CREATED:
  apps/web/src/site/services/public-navigation/types.ts
  apps/web/src/site/services/public-navigation/macro-areas.ts
  apps/web/src/site/services/public-navigation/seo-page-map.ts
  apps/web/src/site/services/public-navigation/cost-guide-map.ts
  apps/web/src/site/services/public-navigation/coverage.ts
  apps/web/src/site/services/public-navigation/builders.ts
  apps/web/src/site/services/public-navigation/validators.ts
  apps/web/src/site/services/public-navigation/validators.selftest.ts
  apps/web/src/site/services/public-navigation/index.ts
FILES_CHANGED:
  apps/web/src/site/services/index.ts (nota esplicita: public-navigation NON
    re-esportato qui — vedi RISKS)
  apps/web/src/site/services/services-hub-page.tsx (+1 import per side-effect)
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo apps/web/src/site/services/** (nessun file in apps/web/src/app/**,
  site/home/**, site/seo/templates/**, packages/funnel/**, packages/taxonomy/**,
  prisma/**, package.json, pnpm-lock.yaml — verificato via git status)

EXISTING_GUARDS_REVIEWED: packages/taxonomy/src/shared/validators.ts
  (validateTaxonomySource, eseguito a module-load da generate-taxonomy.ts e
  implicitamente da ogni import che valuta taxonomySource), site/seo/pages/costi/
  ristrutturare-bagno/content.ts e site/services/catalog.ts (entrambi con
  validazione a module-load-time, throw esplicito se uno slug referenziato non
  esiste — pattern introdotto Phase 19.3/18.1)
GUARD_PATTERN_USED: stesso pattern esistente (validazione a module-load, throw con
  messaggio leggibile), estESO con funzioni pure testabili separate dall'assert
  che le invoca — non inventato un sistema parallelo

SCHEMA_LAYER_CREATED: sì — types.ts (CoverageState a 7 valori, VisibilityPolicy,
  DestinationType, SeoStatus, CostGuideStatus, InterventionCoverageDecision,
  PublicServiceCard, PublicServiceMacroArea)
COVERAGE_MAP_CREATED: sì — coverage.ts, 81 voci (una per ogni TaxonomyIntervention
  reale dopo Phase 19.6G)
MACRO_AREAS_DEFINED: sì — 12 macro aree (macro-areas.ts), corrispondenti
  all'elenco 01_SCHEMA.md sezione 20.6; membership reale derivata da coverage.ts,
  non duplicata negli array opzionali di macro-areas.ts
SEO_PAGE_MAP_DEFINED: sì — derivato da listSeoInterventionLandings()
  (site/seo/pages/interventi), mai scritto a mano
COST_GUIDE_MAP_DEFINED: sì — derivato da listCostGuides() + landing SEO
  (site/seo/pages/costi + site/seo/pages/interventi), mai scritto a mano
VALIDATORS_CREATED: sì — 9 funzioni pure di guard + assertValidPublicCatalog()
  (validators.ts) + 9 scenari sintetici (validators.selftest.ts)

TOTAL_TAXONOMY_INTERVENTIONS: 81
CLASSIFIED_INTERVENTIONS: 81
UNCLASSIFIED_INTERVENTIONS_BEFORE: 81 (coverage.ts non esisteva prima di questa fase)
UNCLASSIFIED_INTERVENTIONS_AFTER: 0

SEO_PAGE_NOW_COUNT: 6
REQUEST_NOW_COUNT: 22
SHOW_IN_COLLAPSED_LIST_COUNT: 50
HIDE_FOR_NOW_COUNT: 3 (gruppo "sicurezza", domain creato in Phase 19.6G ma senza
  macro area pubblica ancora decisa)
SEO_PAGE_FUTURE_COUNT: 0 come `state` primario (nessun intervento reale è
  attualmente nascosto solo per una futura landing); 8 interventi hanno
  seoStatus derivato = SEO_PAGE_FUTURE pur restando REQUEST_NOW/COLLAPSED oggi
  (perdita-acqua, rifare-cucina, posare-piastrelle, fare-opere-murarie,
  rifare-facciata, fare-cappotto-termico, saltata-corrente, ampliare-casa — stessi
  8 candidati di OI-029)
HIDE_UNTIL_TAXONOMY_EXISTS_COUNT: 0 (per costruzione: questo stato si applica a
  voci fuori taxonomy come Giardinaggio/Pratiche e tecnici, che non hanno una
  TaxonomyIntervention da classificare in coverage.ts — restano fuori per
  assenza, non per classificazione esplicita)
NEEDS_TAXONOMY_FIX_COUNT: 0 (i 4 orphan sono stati risolti in Phase 19.6G, non più
  necessario questo stato per nessun intervento reale oggi)

SEO_PAGE_NOW_WITHOUT_ROUTE: 0 (verificato dal guard, eseguito su dati reali durante
  il build)
COST_GUIDE_EXISTS_WITHOUT_ROUTE: 0
VISIBLE_ITEMS_WITHOUT_DESTINATION: 0
MACRO_AREAS_WITHOUT_ITEMS: 0 (tutte e 12 le macro aree hanno almeno un item
  REQUEST_NOW/SHOW_IN_COLLAPSED_LIST dopo la classificazione delle 81 voci)

TESTS_ADDED: nessun test runner esiste nel monorepo (verificato: zero vitest/jest in
  qualunque package.json). validators.selftest.ts implementa i 7 scenari minimi
  richiesti (+2 extra) come asserzioni sincrone su fixture sintetiche, eseguite a
  module-load — pattern "test tramite module-load validator" esplicitamente
  consentito dal task quando non esiste un runner
TESTS_RUN: 9 scenari (unclassified intervention deve fallire; intervento reale
  classificato deve passare; coverage entry stale deve fallire; SEO_PAGE_NOW senza
  landing deve fallire; SEO_PAGE_NOW con landing deve passare; COST_GUIDE_EXISTS
  senza guida deve fallire; macro area visibile vuota deve fallire; card
  REQUEST_NOW valida deve passare; href="#" deve sempre fallire)
TEST_RESULT: PASS — eseguiti realmente durante `pnpm --filter web build` (la
  pagina /servizi è statica e viene prerenderizzata in build, quindi
  services-hub-page.tsx, che importa public-navigation per side-effect, esegue
  davvero selftest + guard reale ad ogni build, non solo a typecheck)

COMMANDS_RUN:
  pnpm --filter web typecheck → PASS
  pnpm --filter web build → PASS (43/43 pagine, nessuna route nuova)
  (taxonomy non toccata in questa fase: nessun taxonomy:generate necessario)
TYPECHECK_WEB_RESULT: PASS
BUILD_WEB_RESULT: PASS
TYPECHECK_TAXONOMY_RESULT: N/A (packages/taxonomy non modificato in questa fase)

OPEN_ITEMS_UPDATED: sì
ROADMAP_UPDATED: sì

RISKS: il barrel esistente `site/services/index.ts` NON re-esporta
  public-navigation/**, perché quel barrel è importato anche da
  professional-areas.tsx (Client Component, home) e public-navigation/builders.ts
  importa `taxonomySource` da `@esigenta/taxonomy`, il cui barrel pubblico
  (packages/taxonomy/src/index.ts) re-esporta anche query Prisma/pg non
  bundlabili per il browser (scoperto durante questa fase: il primo tentativo di
  wiring ha rotto il build della home con "Module not found: Can't resolve
  'net'/'tls'"). Il guard è quindi agganciato solo a services-hub-page.tsx (Server
  Component, già renderizzato per /servizi). Conseguenza per Phase 19.6I: quando
  /servizi verrà riscritta per consumare public-navigation, va fatto da un
  Server Component (la pagina lo è già); se in futuro qualcosa di
  public-navigation dovesse servire anche a un Client Component, andrà introdotto
  un punto di importazione type-only o un subpath export dedicato in
  packages/taxonomy — non risolvibile in questa fase (package.json non
  modificabile).
BLOCKERS: nessuno
NEXT_PHASE: Phase 19.6I — Services Hub Taxonomy-Derived Implementation
```

---

# 14.7 Phase 19.6I — Services Hub Taxonomy-Derived Implementation

Status:

```txt id="ph196istatus"
COMPLETED
```

Obiettivo: riscrivere `/servizi` per consumare
`site/services/public-navigation/{builders,coverage,macro-areas}.ts` al posto
dell'attuale lettura diretta della sola taxonomy a 6 voci, rispettando il confine
server/client emerso in Phase 19.6H.

## PHASE_REPORT Phase 19.6I

```txt id="ph196irep"
STATUS: COMPLETED
PHASE: 19.6I — Services Hub Taxonomy-Derived Implementation

FILES_CREATED: nessuno
FILES_CHANGED:
  apps/web/src/site/services/services-hub-page.tsx (riscritto integralmente)
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo apps/web/src/site/services/services-hub-page.tsx (apps/web/src/
  app/servizi/page.tsx letto ma non modificato: non richiedeva cambi, importa già
  ServicesHubPage senza assumere nulla sulla sua implementazione interna). Nessun
  file in site/home/**, site/seo/templates/**, app/interventi/**, app/costi/**,
  packages/funnel/**, packages/taxonomy/**, prisma/**, package.json,
  pnpm-lock.yaml toccato (verificato via git status)

SERVICES_HUB_REWRITTEN: sì
DATA_SOURCE_BEFORE: listServiceCategories()/listVisibleServiceCatalogItemsByCategory()
  da site/services/catalog.ts — 7 categorie editoriali hardcoded, solo le 6 voci
  SEO_PAGE esistenti effettivamente visibili (le 6 PLANNED sempre nascoste)
DATA_SOURCE_AFTER: buildPublicServiceMacroAreasWithItems() da
  site/services/public-navigation/builders.ts — deriva da taxonomySource (81
  interventions reali) + coverage.ts + seo-page-map/cost-guide-map derivati. La
  sezione "Servizi più richiesti" continua a usare
  listFeaturedServiceCatalogItems() da catalog.ts (Phase 19.7, invariato): stesse 6
  card con foto, nessuna duplicazione di dati introdotta.
PUBLIC_NAVIGATION_USED: sì — buildPublicServiceMacroAreasWithItems() e il tipo
  PublicServiceCard, importati solo in services-hub-page.tsx
SERVER_CLIENT_BOUNDARY_RESPECTED: sì — services-hub-page.tsx resta un Server
  Component (nessuna direttiva "use client"); l'espandi/collassa per ogni macro
  area usa l'elemento HTML nativo <details>/<summary> (zero JavaScript client,
  zero "use client" necessario). public-navigation/** non è stato re-esportato dal
  barrel site/services/index.ts (invariato da Phase 19.6H) e non è mai stato
  importato da home/professional-areas.tsx o da nessun Client Component.

MACRO_AREAS_RENDERED: 12 (tutte e 12 le macro aree di macro-areas.ts hanno almeno
  un item dopo la classificazione delle 81 interventions — nessuna esclusa)
TOTAL_TAXONOMY_INTERVENTIONS: 81
VISIBLE_PRIMARY_ITEMS: 35 (somma dei primi min(3, n) item per ciascuna delle 12
  macro aree, ordinati per priority)
COLLAPSED_ITEMS: 43 (resto degli item per macro area, dentro <details>
  "Vedi altri N servizi")
HIDDEN_ITEMS: 3 (gruppo "sicurezza" — installare-antifurto, installare-telecamere,
  installare-controllo-accessi — HIDE_FOR_NOW, mai presenti in nessun output di
  buildPublicServiceCards, quindi mai renderizzati)

SEO_PAGE_NOW_LINKS: 6 — verso /interventi/[slug], sia nella sezione "Servizi più
  richiesti" sia all'interno della rispettiva macro area
REQUEST_NOW_LINKS: 72 — 22 REQUEST_NOW + 50 SHOW_IN_COLLAPSED_LIST, tutti verso
  /richiesta/[taxonomyInterventionSlug] (nessuna SEO page per queste voci)
HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/services → 0 occorrenze
ROUTE_VALIDATION_RESULT: PASS — verificato sia dal guard (SEO_PAGE_NOW_WITHOUT_ROUTE
  e REAL_SEO_PAGE_NOT_TRACKED, entrambi 0 issue) sia dal build (43/43 pagine,
  nessuna route nuova/rimossa)
CATALOG_GUARD_RESULT: PASS (assertValidPublicCatalog() eseguito a module-load
  durante il build, nessun throw)
SELFTEST_RESULT: PASS (9/9 scenari di validators.selftest.ts)

HOME_TOUCHED: NO (verificato via git status — site/home/** non modificato)
TAXONOMY_TOUCHED: NO
FUNNEL_TOUCHED: NO

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine — pnpm --filter web build)

OPEN_ITEMS_UPDATED: sì
ROADMAP_UPDATED: sì

RISKS: l'unico bug trovato durante l'implementazione (un quarto item VISIBLE in
  un'area con 4 voci VISIBLE spariva invece di finire nella lista secondaria,
  perché il primo filtro tagliava su "visibility===VISIBLE" prima di prendere i
  primi 3) è stato corretto prendendo i primi 3 item per priority indipendentemente
  dal tag di visibility originale — nessun item può più sparire dal rendering.
  Nessun altro rischio noto.
BLOCKERS: nessuno
NEXT_PHASE: Phase 19.6J — Services Hub QA & Conversion Review
```

---

# 14.8 Phase 19.6J — Services Hub QA & Conversion Review

Status:

```txt id="ph196jstatus"
COMPLETED
```

Obiettivo: verificare che `/servizi` (Phase 19.6I) rispetti le regole UX/link/
scalabilità documentate, che i guard siano ancora attivi e che il confine
server/client (scoperto in Phase 19.6H) non sia stato violato. Nessuna nuova
architettura: solo QA, con piccoli fix se necessario.

## PHASE_REPORT Phase 19.6J

```txt id="ph196jrep"
STATUS: COMPLETED
PHASE: 19.6J — Services Hub QA & Conversion Review

FILES_CREATED: nessuno
FILES_CHANGED: docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
  (nessuna modifica di codice: la QA non ha trovato difetti bloccanti né
  miglioramenti necessari per superare la review)
FILES_DELETED: nessuno
CODE_CHANGED: NO

QA_RESULT: PASS, nessun fix di codice applicato

ABOVE_THE_FOLD_REVIEW: titolo "Servizi" chiaro, sottotitolo prudente ("Trova il
  professionista giusto per il tuo lavoro, dalla ristrutturazione completa alla
  singola riparazione" — non nomina aree assenti da taxonomy), nav macro-aree (12
  chip) seguita subito da "Servizi più richiesti" (6 voci con link reali a
  /interventi/[slug]). Un cliente normale capisce di poter richiedere preventivi
  per lavori reali entro il primo scroll. Nessuna promessa di servizi non presenti
  in taxonomy trovata.
MACRO_AREAS_REVIEWED: 12/12. Nomi tutti comprensibili per un cliente finale
  (nessuna fuga di terminologia da TaxonomyCategory tipo "Cartongessista"/
  "Impiantista"). Nessuna macro area vuota (garantito anche dal guard). Candidate
  per eventuale revisione futura, NON rinominate in questa fase per assenza di
  motivo forte: "Impermeabilizzazioni" (area di nicchia, potrebbe in futuro
  confluire in "Tetti e facciate"), "Piscine" (nicchia, già correttamente in
  ultima posizione). "Sicurezza" (3 item) resta interamente nascosta, come da
  OI-031, nessuna macro area pubblica esiste per il gruppo — corretto, non un bug.
PRIMARY_ITEMS_REVIEW: 35 card primarie distribuite su 12 sezioni (max 3 per
  sezione, verificato in coverage.ts: nessuna sezione supera il limite). Non
  percepibili come "database" perché mai più di 3 per area e mai tutte visibili
  nello stesso viewport (richiedono scroll attraverso le sezioni). Nessun
  aggiustamento ritenuto necessario.
COLLAPSED_ITEMS_REVIEW: 43 item dentro <details>/<summary> per area, etichetta
  "Vedi altri N servizi" chiara e dinamica (N reale, non un placeholder fisso).
  Espandibili senza JavaScript (elemento HTML nativo), nessun rischio di rompere
  il confine server/client.
CONVERSION_PATHS_REVIEW: ogni item cliccabile ha un'icona freccia coerente con il
  resto del sito (stesso pattern di cost-hub-template.tsx e dell'hub costi); CTA
  finale "Racconta il lavoro" → home, rete di sicurezza per chi non trova la
  propria voce. Nessuna sezione sembra incompleta o tronca.
SEO_LINKS_REVIEW: le 6 landing SEO sono linkate sia in "Servizi più richiesti" sia
  nella propria macro area — verificato che entrambi i link puntano a
  /interventi/[seoSlug] reali (stesso slug, nessuna discrepanza)
REQUEST_LINKS_REVIEW: tutti i 72 item REQUEST_NOW/SHOW_IN_COLLAPSED_LIST puntano a
  /richiesta/[taxonomyInterventionSlug] — verificato a campione e tramite il guard
  (nessun MISSING_REAL_DESTINATION riportato)
HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/services → 0 occorrenze
SERVER_CLIENT_BOUNDARY_CHECK: PASS — services-hub-page.tsx non ha "use client";
  grep "@esigenta/taxonomy" su site/services/** trova solo import in builders.ts e
  validators.ts (mai in un file con "use client"); grep su site/home/** trova solo
  `import type { TaxonomySearchResult }` (type-only, erasable, già presente da
  prima di Phase 19.6H, non un rischio); build non mostra nessun errore
  net/tls/pg/prisma
CATALOG_GUARD_RESULT: PASS (assertValidPublicCatalog eseguito durante il build,
  nessun throw)
SELFTEST_RESULT: PASS (9/9 scenari di validators.selftest.ts)

VISIBLE_PRIMARY_ITEMS_BEFORE: 35
VISIBLE_PRIMARY_ITEMS_AFTER: 35 (invariato — nessun fix applicato)
COLLAPSED_ITEMS_BEFORE: 43
COLLAPSED_ITEMS_AFTER: 43 (invariato)
MACRO_AREAS_RENDERED: 12 (invariato)

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine, nessuna route nuova)

OPEN_ITEMS_UPDATED: sì (OI-031 aggiornato con gli esiti della QA)
ROADMAP_UPDATED: sì

RISKS: nessuno nuovo. I candidati di revisione futura (Impermeabilizzazioni→Tetti e
  facciate, priorità per area non validata con dati reali di domanda) restano
  tracciati in OI-031, non risolti qui per evitare di introdurre architettura non
  richiesta da questa fase.
BLOCKERS: nessuno
NEXT_PHASE: Phase 19.8 — Service Tasks Funnel-Only Pilot
```

---

# 15. Phase 19.8 — Service Tasks Funnel-Only Pilot

Status:

```txt id="971jua"
COMPLETED
```

> **NOTA (esecuzione effettiva):** lo sketch originale sotto (task/sotto-servizi con
> parametro `?task=` sullo stesso funnel `rifare-bagno`) è stato superato dal task
> di esecuzione reale, che ha richiesto un modello più semplice e già coerente con
> l'infrastruttura costruita in Phase 19.6G-J: ogni "lavoro collegato" è una
> TaxonomyIntervention reale a sé, con il proprio `/richiesta/[taxonomyInterventionSlug]`
> diretto (nessun parametro `?task=`, nessuna estensione del funnel rifare-bagno).
> Lo sketch originale resta sotto per memoria storica, ma NON è quello implementato
> — vedi PHASE_REPORT per cosa è stato fatto davvero.

Tipo:

```txt id="2qjo0c"
Service page / funnel orientation
```

Obiettivo:

```txt id="4gya48"
Aggiungere task/sotto-servizi cliccabili alla pagina ristrutturare bagno.
Non creare pagine SEO nuove.
Orientare il funnel verso task specifici.
```

Pagina pilota:

```txt id="tk1hn3"
/interventi/ristrutturare-bagno
```

Task pilota:

```txt id="hiqpmg"
sostituzione vasca con doccia
rifacimento piastrelle bagno
installazione sanitari
rifacimento impianto idraulico bagno
rifacimento impianto elettrico bagno
demolizione bagno
posa pavimento bagno
```

Destinazione:

```txt id="o8n6x8"
funnel rifare-bagno con task selezionato
```

La forma tecnica del parametro deve essere decisa nella fase, ma deve essere coerente e non rompere il funnel esistente.

Esempio concettuale:

```txt id="7xmkd3"
/richiesta/rifare-bagno?task=sostituzione-vasca-con-doccia
```

File consentiti:

```txt id="0z8l1i"
apps/web/src/site/seo/pages/interventi/ristrutturare-bagno/**
apps/web/src/site/seo/templates/intervention-page-template.tsx
apps/web/src/richiesta/flow/**
packages/funnel/** solo se necessario e con scope strettissimo
docs/seo-navigation/02_ROADMAP.md
```

File vietati:

```txt id="dgmcfx"
creare /servizi/[taskSlug]
creare /interventi/[taskSlug]
creare /costi/[taskSlug]
toccare tutte le landing insieme
```

Acceptance criteria (sketch originale, vedi nota sopra):

```txt id="f98n67"
Task visibili nella pagina bagno.
Task non diventano pagine SEO.
Click porta a funnel reale o meccanismo documentato.
Funnel esistente rifare-bagno non rotto.
Typecheck PASS.
Build PASS.
Roadmap aggiornata.
```

## PHASE_REPORT Phase 19.8

```txt id="ph198rep"
STATUS: COMPLETED
PHASE: 19.8 — Service Tasks Funnel-Only Pilot

FILES_CREATED: apps/web/src/site/seo/templates/related-funnel-work.tsx
FILES_CHANGED:
  apps/web/src/site/seo/pages/interventi/types.ts (+campo opzionale
    relatedFunnelWork?: readonly string[])
  apps/web/src/site/seo/pages/interventi/ristrutturare-bagno/content.ts (+6 slug)
  apps/web/src/site/seo/templates/intervention-page-template.tsx (+1 import,
    +1 sezione condizionale)
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo site/seo/pages/interventi/** e site/seo/templates/** (scope
  consentito). Nessun file in app/**, site/home/**, site/services/**,
  packages/taxonomy/**, packages/funnel/**, prisma/**, package.json,
  pnpm-lock.yaml toccato (verificato via git status)

PILOT_PAGE: /interventi/ristrutturare-bagno
MODULE_ADDED: "Lavori che puoi richiedere insieme" — sezione tra "Professionisti
  collegati/Interventi correlati" e la sezione costi/geo, lista compatta (no card
  fotografiche), copy che chiarisce esplicitamente che non sono pagine dedicate
RELATED_ITEMS_ADDED: 6 — sostituire-sanitari, impermeabilizzare-bagno,
  posare-piastrelle, posare-rivestimento, rifare-impianto-idraulico,
  cambiare-rubinetto (tutti verificati TaxonomyIntervention reali, esistenti nei
  domain idraulica/impermeabilizzazioni/pavimenti)
RELATED_ITEMS_SKIPPED: nessuno — tutti i 6 candidati proposti esistono realmente
  in taxonomy, nessuno scartato
DATA_SOURCE: content.ts dichiara solo gli slug (mai i nomi); il template
  related-funnel-work.tsx risolve label = taxonomySource.interventions.find(slug).name
  a runtime/build, nessuna duplicazione di dati taxonomy nel layer SEO
LINKS_CREATED: 6, tutti verso /richiesta/[taxonomyInterventionSlug] (slug
  taxonomy reale, non un funnelSlug separato)
HREF_HASH_CHECK: grep "href=\"#\"" su apps/web/src/site/seo → 0 occorrenze
ROUTE_COUNT_CHANGED: NO — 43/43 pagine identiche a prima, nessuna nuova route
  (/interventi/ristrutturare-bagno è la stessa pagina statica di sempre, solo con
  una sezione in più)

TAXONOMY_TOUCHED: NO (solo letto, @esigenta/taxonomy importato in lettura in un
  file server-only nuovo)
FUNNEL_TOUCHED: NO (nessuna modifica a packages/funnel; i link puntano a
  /richiesta/[slug], route già esistente e generica, nessuna estensione)
SERVIZI_TOUCHED: NO
HOME_TOUCHED: NO

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine — pnpm --filter web build)

OPEN_ITEMS_UPDATED: sì
ROADMAP_UPDATED: sì

RISKS: il guard di related-funnel-work.tsx (throw se uno slug non esiste in
  taxonomy) è verificato solo per le landing che popolano il campo
  (oggi solo ristrutturare-bagno) — le altre 5 landing non hanno relatedFunnelWork
  e non attivano questo path, nessun rischio per loro. Il file
  related-funnel-work.tsx importa @esigenta/taxonomy: confermato (grep + build)
  che è raggiungibile solo da intervention-page-template.tsx, mai da un Client
  Component o dalla home — stesso vincolo di Phase 19.6H, rispettato.
BLOCKERS: nessuno
NEXT_PHASE: Phase 19.9 — Release Readiness QA
```

---

# 16. Phase 19.9 — Release Readiness QA

Status:

```txt id="ahfiz8"
COMPLETED
```

Tipo:

```txt id="b4gw1o"
QA / audit finale pre-release
```

Obiettivo:

```txt id="r9m9mj"
Verificare che non restino figuracce pubbliche.
Controllare home, /costi, /servizi, /interventi, funnel.
```

Controlli obbligatori:

```txt id="emcksu"
nessun href="#";
nessuna guida inesistente in home;
nessuna CTA morta;
nessuna card apparentemente cliccabile ma non cliccabile;
nessuna categoria vuota;
nessun link a route inesistente;
home comunica servizi ampi;
costi raggiungibile;
servizi raggiungibile;
funnel funzionante per 6 servizi principali.
```

Comandi minimi:

```powershell id="hwh1mb"
pnpm --filter @esigenta/web typecheck
pnpm --filter @esigenta/web build
pnpm typecheck
pnpm build
```

Output richiesto:

```txt id="g0mace"
RELEASE_READY: YES/NO
OPEN_BLOCKERS:
WARNINGS:
ROUTES_CHECKED:
LINKS_CHECKED:
TYPECHECK_RESULT:
BUILD_RESULT:
NEXT_STEP:
```

## PHASE_REPORT Phase 19.9

```txt id="ph199rep"
STATUS: COMPLETED
PHASE: 19.9 — Release Readiness QA

FILES_CREATED: nessuno
FILES_CHANGED: docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
  (nessuna modifica di codice: l'unico difetto reale trovato, href="#" nel footer
  globale, è fuori dallo scope di file modificabili di questa fase — site/shell/**
  non è nell'elenco consentito — quindi registrato come blocker, non corretto qui)
FILES_DELETED: nessuno
CODE_CHANGED: NO

RELEASE_READY: NO
OPEN_BLOCKERS: 1 — OI-033, href="#" reale in apps/web/src/site/shell/footer.tsx
  (voce "Articoli"), renderizzato su ogni pagina pubblica tramite PublicShell.
  Viola la Guard 1 di 03_RELEASE_GUARDS.md senza eccezioni. Scoperto da uno sweep
  grep esplicito su tutto apps/web/src richiesto da questa fase — non introdotto
  da nessuna fase 19.x precedente, semplicemente non era mai stato cercato lì.
WARNINGS: OI-034 (immagine OG hardcoded per cost guide, latente, diventa visibile
  solo con una seconda guida costi — non blocca la release attuale)

PUBLIC_NAVIGATION_QA: PASS per tutte le 10 pagine controllate (/, /servizi,
  /costi, /costi/ristrutturare-bagno, le 6 landing /interventi) — link reali, CTA
  reali, nessuna sezione vuota, nessuna card finta, copy coerente
HOME_QA: hero/search coerenti; 6 servizi featured da registry (Phase 19.7,
  invariato); CTA "vedi tutti" → /servizi reale; guide costi mostrano solo 1 guida
  reale con CTA → /costi reale; "Sei un professionista?" (ProfessionalCta) →
  /area-impresa reale, non rimosso e non richiesto di rimuoverlo; nessun href="#"
  dentro home/** stesso (il blocker trovato è nel footer globale, file condiviso
  fuori da site/home/**)
SERVIZI_QA: 12 macro aree renderizzate, 81 interventi classificati (6
  SEO_PAGE_NOW + 22 REQUEST_NOW + 50 SHOW_IN_COLLAPSED_LIST + 3 HIDE_FOR_NOW),
  nessuna macro area vuota, gruppo "sicurezza" (3) non visibile come link
  pubblico, nessuna area fuori taxonomy mostrata, nessun import @esigenta/taxonomy
  raggiungibile da un Client Component (verificato con grep dedicata su tutti i
  9 file "use client" del sito pubblico)
COSTI_QA: /costi mostra la sola guida reale (ristrutturare-bagno), nessuna card
  falsa, nessun link a guida mancante
INTERVENTI_QA: tutte e 6 le landing buildano, CTA funnel corretta (funnelSlug =
  slug taxonomy reale per tutte e 6), breadcrumb coerente, canonical dinamico
  (/interventi/[slug]), nessun contenuto placeholder trovato
RELATED_FUNNEL_WORK_QA: 6 lavori collegati su ristrutturare-bagno, label risolte
  da taxonomySource, link a /richiesta/[slug], copy chiaro — confermato invariato
  da Phase 19.8
RELEASE_GUARDS_QA: tutte le guard di 03_RELEASE_GUARDS.md verificate per
  conformità — UNA violazione trovata (Guard 1, vedi OI-033); le altre (no fake
  guides/services/professionals, no empty hubs, no planned public links, no
  categories without real services, no services outside taxonomy) tutte rispettate
SEO_TECHNICAL_QA: metadata/canonical dinamici e corretti su tutte le pagine
  controllate; nessuna direttiva noindex/robots trovata in site/seo/engine
  (coerente: indicizzazione di default, nessun errore introdotto); sitemap/schema
  FAQ assenti ma già tracciati come SEO growth (OI-016/OI-017), non una regressione
CONVERSION_PATHS_QA: tutti i 4 percorsi richiesti verificati end-to-end (home→
  featured→/interventi→/richiesta; home→/servizi→macro area→REQUEST_NOW→
  /richiesta; home→/costi→guida→CTA; /interventi/ristrutturare-bagno→lavori
  collegati→/richiesta) — nessuna pagina vuota, nessun link finto nel percorso

HREF_HASH_CHECK: 1 occorrenza reale (footer "Articoli", OI-033); 1 occorrenza in
  validators.selftest.ts (fixture sintetica di test, intenzionale, non un bug)
FAKE_LINKS_CHECK: nessuno oltre al footer
FAKE_GUIDES_CHECK: PASS (solo guide realmente esistenti mostrate ovunque)
FAKE_SERVICES_CHECK: PASS (PLANNED mai renderizzato pubblicamente, verificato sia
  in catalog.ts/isPubliclyLinkable sia in coverage.ts/HIDE_FOR_NOW)
EMPTY_HUBS_CHECK: PASS (/costi e /servizi entrambi non vuoti)
SERVICES_OUTSIDE_TAXONOMY_CHECK: PASS (Giardinaggio/Pratiche e tecnici mai mostrati)
SERVER_CLIENT_BOUNDARY_CHECK: PASS — grep su tutti i 9 file "use client" del sito
  pubblico, zero import di valore da @esigenta/taxonomy/public-navigation/
  related-funnel-work; solo `import type { TaxonomySearchResult }` (erasable) in
  hero.tsx/search-bar.tsx, già presente prima di Phase 19.6H

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine, nessuna route nuova, nessun errore net/tls/pg)

FIXES_APPLIED: nessuno (l'unico difetto reale trovato è fuori scope di modifica
  per questa fase — vedi OPEN_BLOCKERS)
OPEN_ITEMS_UPDATED: sì — OI-033 (blocker, nuovo), OI-034 (warning, nuovo)
ROADMAP_UPDATED: sì

RELEASE_STATUS: BLOCKED
RISKS: nessun rischio nuovo introdotto da questa fase (solo lettura + audit).
  Il rischio esistente (footer href="#") è ora finalmente tracciato.
BLOCKERS: OI-033 — href="#" nel footer globale (site/shell/footer.tsx), richiede
  una fase con scope su apps/web/src/site/shell/**
NEXT_PHASE: Phase 19.9.1 — Fix Release Blockers (scope minimo: footer.tsx)
```

---

# 16.1 Phase 19.9.1 — Fix Release Blockers

Status:

```txt id="ph1991status"
COMPLETED
```

Obiettivo: correggere OI-033 (href="#" nel footer globale, voce "Articoli") con
uno scope dedicato e minimo su `apps/web/src/site/shell/footer.tsx` — l'unico
blocker reale trovato da Phase 19.9.

## PHASE_REPORT Phase 19.9.1

```txt id="ph1991rep"
STATUS: COMPLETED
PHASE: 19.9.1 — Fix Release Blockers

FILES_CREATED: nessuno
FILES_CHANGED: apps/web/src/site/shell/footer.tsx, docs/seo-navigation/02_ROADMAP.md,
  docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo apps/web/src/site/shell/footer.tsx

BLOCKER_FIXED: OI-033 — href="#" nel footer globale
FOOTER_ARTICOLI_DECISION: rimossa (verificato che /guide e qualunque route
  articoli/blog non esiste — Glob su apps/web/src/app/guide/** → nessun file).
  Rimossa l'intera colonna "Piattaforma" (conteneva solo quella voce: lasciare
  un titolo di colonna senza link avrebbe creato una sezione vuota, lo stesso
  anti-pattern già vietato altrove per macro-aree/categorie). Resta solo la
  colonna "Legale" con le 3 route reali (Privacy/Cookie/Termini).
HREF_HASH_CHECK: 0 occorrenze reali renderizzabili in tutto apps/web/src (l'unica
  occorrenza residua è una fixture sintetica in
  public-navigation/validators.selftest.ts, usata per testare che il guard stesso
  rilevi correttamente un href="#" — non un bug, è il test che verifica il guard)
PUBLIC_FOOTER_CHECK: footer renderizzato su ogni pagina pubblica tramite
  PublicShell — verificato che ora contiene solo link reali (Privacy/Cookie/
  Termini + logo→home), nessun placeholder, nessuna sezione con titolo ma zero
  contenuto

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (43/43 pagine, nessuna route nuova/rimossa)

OPEN_ITEMS_UPDATED: sì — OI-033 → RESOLVED_BY_PHASE_19_9_1
ROADMAP_UPDATED: sì

RELEASE_STATUS: READY_FOR_RELEASE_CANDIDATE
RISKS: nessuno. OI-034 (immagine OG hardcoded per cost guide) resta un warning
  non bloccante, già tracciato per Phase 20.1.
BLOCKERS: nessuno
NEXT_PHASE: Release Candidate / Phase 20.1 — Second Cost Guide Family
```

---

# 17. Phase 20.1 — Second Cost Guide Family

Status:

```txt id="4ds2jq"
COMPLETED
```

Tipo:

```txt id="d5lnm2"
SEO growth
```

Obiettivo:

```txt id="9ngm8g"
Validare il pattern Phase 18.1 su una seconda famiglia costi.
Ridurre sensazione di hub /costi vuoto.
```

Candidate possibili:

```txt id="8guk81"
rifare-tetto
installare-climatizzatore
installare-fotovoltaico
rifare-impianto-elettrico
```

Regole:

```txt id="3gs5f4"
non creare guida se non c’è contenuto utile;
non copiare bagno cambiando parole;
usare base/faq/local-overrides/market-data/geo;
nessuna città thin;
nessuna promessa in home prima della pubblicazione.
```

## PHASE_REPORT Phase 20.1

```txt id="ph201rep"
STATUS: COMPLETED
PHASE: 20.1 — Second Cost Guide Family (rifare-tetto)

FILES_CREATED:
  apps/web/src/site/seo/pages/costi/rifare-tetto/base.ts
  apps/web/src/site/seo/pages/costi/rifare-tetto/faq.ts
  apps/web/src/site/seo/pages/costi/rifare-tetto/local-overrides.ts (vuoto,
    nessuna città in questa fase — riusa il tipo CityLocalOverride da
    ristrutturare-bagno/local-overrides.ts invece di duplicarlo)
  apps/web/src/site/seo/pages/costi/rifare-tetto/content.ts
FILES_CHANGED:
  apps/web/src/site/seo/pages/costi/types.ts (+heroImage, +topicLabel su CostGuide)
  apps/web/src/site/seo/pages/costi/ristrutturare-bagno/base.ts e content.ts
    (popolano i 2 nuovi campi con i valori già esistenti — nessun output cambiato)
  apps/web/src/site/seo/pages/costi/index.ts (registrata rifareTettoGuide)
  apps/web/src/site/seo/market-data/base-price-ranges.ts (+ "costGuide:rifare-tetto")
  apps/web/src/site/seo/templates/cost-page-template.tsx (DEVIAZIONE DI SCOPE
    autorizzata esplicitamente dall'utente, vedi RISKS)
  apps/web/src/site/seo/engine/metadata.ts (OI-034 risolto come effetto collaterale)
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: site/seo/pages/costi/**, site/seo/market-data/**,
  site/seo/templates/cost-page-template.tsx (fuori scope originale, autorizzato),
  site/seo/engine/metadata.ts. Nessun file in home/services/servizi/interventi/
  packages/prisma toccato.

DEVIATION_FROM_SCOPE: cost-page-template.tsx non era nell'elenco "Puoi
  modificare" del task. Scoperto durante l'esecuzione che il template aveva 3
  elementi hardcoded sul bagno (immagine hero, heading "sintesi costo", heading
  "città") che avrebbero mostrato testo/immagine sbagliati sulla pagina
  rifare-tetto. Chiesto esplicitamente all'utente come procedere (AskUserQuestion)
  — risposta: estendere lo scope con un fix minimo. Eseguito: aggiunti
  guide.heroImage/guide.topicLabel (CostGuide), usati nel template al posto delle
  3 stringhe/immagine fisse; sezione "Città" ora condizionale
  (indexableCityPages.length > 0), per non mostrare una sezione "Città" vuota
  sulle guide senza pagine città (come rifare-tetto in questa fase). Nessun
  output esistente cambiato per ristrutturare-bagno (stessa immagine, stesso
  testo, sezione città ancora visibile con le sue 8 città).

NEW_COST_GUIDE: /costi/rifare-tetto
ROUTE_CREATED: /costi/[costSlug] con nuovo param "rifare-tetto" (nessuna nuova
  route Next.js: stessa route dinamica esistente, ora con 2 parametri invece di 1)
COST_HUB_UPDATED: sì, automaticamente — /costi (template generico, non toccato)
  ora mostra 2 guide invece di 1, derivate da listCostGuides()
PRICE_MODEL_USED: market-data/base-price-ranges.ts, stesso pattern Phase 18.1;
  prezzo al mq (120-300 €/mq) coerente con quanto già pubblicato nella landing
  SEO /interventi/rifare-tetto (costSection.priceRange), nessuna contraddizione
  tra le due pagine
FAQ_ADDED: 4 FAQ nazionali (rifareTettoFaq)
CTA_TARGET: /richiesta/rifare-tetto (funnelSlug = slug taxonomy reale, verificato
  identico in precedenti audit)
INTERNAL_LINKS_ADDED: nessun link nuovo scritto a mano — il campo
  `costSlug: "rifare-tetto"` già presente in
  site/seo/pages/interventi/rifare-tetto/content.ts (preesistente, mai
  rimosso) ora produce un link reale da /interventi/rifare-tetto a
  /costi/rifare-tetto, prima dormiente/404 perché la guida non esisteva
OI_034_HANDLED: RISOLTO (non solo lasciato aperto) — costante ogBathroomImage
  rimossa da engine/metadata.ts, sostituita da guide.heroImage (stesso campo
  introdotto per il fix del template). Piccolo e coerente con questa fase, come
  esplicitamente autorizzato dal task.
HREF_HASH_CHECK: 0 occorrenze in tutto apps/web/src/site/seo

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (44/44 pagine: +1 rispetto a prima, esattamente
  /costi/rifare-tetto; le 8 città di ristrutturare-bagno invariate; nessuna città
  creata per rifare-tetto)

OPEN_ITEMS_UPDATED: sì (OI-034 → RESOLVED_BY_PHASE_20_1)
ROADMAP_UPDATED: sì

RISKS: la generalizzazione del template (heroImage/topicLabel) è minima e
  retrocompatibile (verificato: output identico per ristrutturare-bagno), ma è
  una deviazione di scope esplicitamente autorizzata dall'utente in questa
  sessione — da tenere a mente se una fase futura applica scope rigidi ai
  template senza sapere di questa eccezione.
BLOCKERS: nessuno
NEXT_PHASE: Phase 20.2 — Cost Hub Categories
```

---

# 18. Phase 20.2 — Cost Hub Categories

Status:

```txt id="m1gaac"
COMPLETED
```

Tipo:

```txt id="pqk7zm"
SEO growth / UX
```

Obiettivo:

```txt id="0x9bls"
Introdurre categorie in /costi solo quando ci sono abbastanza guide.
```

Regola:

```txt id="frc70o"
Una categoria appare solo se contiene almeno una guida pubblicata.
```

Categorie candidate:

```txt id="i6dnww"
Bagno
Tetto e coperture
Impianti
Energia
Finiture
Pratiche edilizie
Tecnici e progettazione
```

## PHASE_REPORT Phase 20.2

```txt id="ph202rep"
STATUS: COMPLETED
PHASE: 20.2 — Cost Hub Categories

FILES_CREATED: apps/web/src/site/seo/engine/cost-hub.ts
FILES_CHANGED:
  apps/web/src/site/seo/pages/costi/types.ts (+CostGuideHubCategory, +hubCategory
    su CostGuide)
  apps/web/src/site/seo/pages/costi/ristrutturare-bagno/{base.ts,content.ts}
    (hubCategory: "Ristrutturazioni")
  apps/web/src/site/seo/pages/costi/rifare-tetto/{base.ts,content.ts}
    (hubCategory: "Tetti e facciate")
  apps/web/src/site/seo/templates/cost-hub-template.tsx (riscritto per
    raggruppamento, prop `categories` invece di `guides` piatto)
  apps/web/src/app/costi/page.tsx (usa buildCostHubCategoryGroups())
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo site/seo/pages/costi/**, site/seo/engine/cost-hub.ts (nuovo),
  site/seo/templates/cost-hub-template.tsx, app/costi/page.tsx — tutti nello
  scope consentito di questa fase. Nessun file in home/services/servizi/
  interventi/packages toccato (verificato via git status)

COST_HUB_UPDATED: sì — /costi ora raggruppa per categoria invece di lista piatta
CATEGORY_MODEL_ADDED: CostGuideHubCategory { slug, name } su CostGuide,
  concetto editoriale indipendente da TaxonomyDomain/PublicServiceMacroArea
  (nessun import cross-layer verso site/services, come richiesto)
CATEGORIES_RENDERED: 2 — "Ristrutturazioni" (1 guida: ristrutturare-bagno),
  "Tetti e facciate" (1 guida: rifare-tetto)
GUIDES_RENDERED: 2 (le sole guide reali esistenti)
EMPTY_CATEGORIES_VISIBLE: 0 — buildCostHubCategoryGroups() deriva solo da
  listCostGuides(), una categoria esiste per costruzione solo se referenziata da
  almeno una guida reale (impossibile renderizzarne una vuota)
FAKE_GUIDES_CHECK: PASS (solo le 2 guide reali)
HREF_HASH_CHECK: 0 occorrenze in site/seo

SCALABILITY: aggiungere una terza guida costo (es. installare-fotovoltaico) con
  hubCategory "Clima ed energia" farebbe apparire un terzo gruppo in /costi al
  prossimo build, senza toccare cost-hub-template.tsx né engine/cost-hub.ts. Se
  una nuova guida usa una hubCategory.slug già esistente (es. un'altra guida
  "Ristrutturazioni"), si aggiunge alla stessa sezione automaticamente.

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (44/44 pagine, nessuna route nuova/rimossa;
  /costi/ristrutturare-bagno e /costi/rifare-tetto invariate)

OPEN_ITEMS_UPDATED: sì
ROADMAP_UPDATED: sì

RISKS: nessuno. Le categorie candidate elencate sopra (Bagno, Tetto e coperture,
  Impianti, Energia, Finiture, Pratiche edilizie, Tecnici e progettazione) erano
  un punto di partenza pre-esistente in roadmap; le 2 categorie effettivamente
  create ("Ristrutturazioni", "Tetti e facciate") riflettono i nomi già usati
  nel modello /servizi (Phase 19.6E) per coerenza terminologica nel sito, anche
  se i due modelli restano architetturalmente indipendenti.
BLOCKERS: nessuno
NEXT_PHASE: Phase 20.3 — Service → Cost Internal Linking
```

---

# 19. Phase 20.3 — Service → Cost Internal Linking

Status:

```txt id="hk32eh"
COMPLETED
```

Tipo:

```txt id="c2xdrr"
SEO growth / internal linking
```

Obiettivo:

```txt id="qxw8up"
Aggiungere link inversi da pagine servizio a guide costo corrispondenti.
```

Esempio:

```txt id="jzcfjb"
/interventi/ristrutturare-bagno
→ Quanto costa ristrutturare un bagno?
→ /costi/ristrutturare-bagno
```

Regole:

```txt id="o72al4"
link solo a guide esistenti;
no placeholder;
anchor chiaro;
non duplicare contenuto.
```

## PHASE_REPORT Phase 20.3

```txt id="ph203rep"
STATUS: COMPLETED
PHASE: 20.3 — Service ↔ Cost Internal Linking

FILES_CREATED: nessuno
FILES_CHANGED:
  apps/web/src/site/seo/engine/resolve-seo-page.ts (+2 resolver:
    resolveCostGuideHrefForIntervention, resolveInterventionHrefForCostGuide)
  apps/web/src/site/seo/templates/intervention-page-template.tsx (usa il
    resolver invece di costruire l'href direttamente da landing.costSlug)
  apps/web/src/site/seo/templates/cost-page-template.tsx (usa il resolver per
    interventionHref, bottone "Torna alla landing" ora condizionale)
  docs/seo-navigation/02_ROADMAP.md, docs/seo-navigation/04_OPEN_ITEMS.md
FILES_DELETED: nessuno
CODE_CHANGED: solo site/seo/engine/** e i 2 template esplicitamente consentiti

AUDIT_INIZIALE: il link servizio↔costo esisteva GIÀ in entrambe le direzioni fin
  da Phase 13 (SeoInterventionLanding.costSlug + GeoCostModule "Vedi la guida
  completa ai costi"; CostGuide.interventionSeoSlug + bottone "Torna alla
  landing" in cost-page-template.tsx). Questa fase non ha quindi "creato" il
  pattern, l'ha CORRETTO: nessuno dei due lati validava che l'altra pagina
  esistesse davvero prima di costruire l'href.

BUG_TROVATO: 3 landing su 6 dichiaravano un costSlug per una guida costo
  inesistente — link morto (404) reale, già presente prima di questa fase,
  scoperto durante l'audit richiesto:
    installare-fotovoltaico → costSlug "fotovoltaico" (nessuna guida con questo slug)
    installare-climatizzatore → costSlug "installare-climatizzatore" (nessuna guida)
    rifare-impianto-elettrico → costSlug "impianto-elettrico" (nessuna guida)
  Le altre 2 (ristrutturare-bagno, rifare-tetto) puntavano a guide reali (la
  seconda lo è diventata solo dopo Phase 20.1) — corrette, nessuna modifica
  necessaria al loro contenuto.
FIX: aggiunti i 2 resolver in engine/resolve-seo-page.ts che verificano
  l'esistenza reale (getCostGuideBySlug / getSeoInterventionLandingBySlug)
  prima di restituire un href; i template ora nascondono il bottone invece di
  linkare a un 404. Nessun costSlug rimosso dai content.ts delle 3 landing
  (resta dichiarato, pronto a "attivarsi" automaticamente quando quelle guide
  costo verranno create in una fase futura — coerente con
  "non creare nuove guide costo" in questa fase).

SERVICE_TO_COST_LINKS_BEFORE: 2 dichiarati nel dato, ma costruiti senza verifica
  (5 costSlug totali, 3 dei quali → 404 reale)
SERVICE_TO_COST_LINKS_AFTER: 2 funzionanti e verificati
  (ristrutturare-bagno→/costi/ristrutturare-bagno,
  rifare-tetto→/costi/rifare-tetto); 3 nascosti correttamente (nessun 404 più
  raggiungibile dal sito)
COST_TO_SERVICE_LINKS_BEFORE: 2 dichiarati, costruiti senza verifica (entrambi
  di fatto già corretti)
COST_TO_SERVICE_LINKS_AFTER: 2 funzionanti e verificati, stesso output visibile
  di prima (nessuna regressione)

PAIRS_VERIFIED: 2 — ristrutturare-bagno↔ristrutturare-bagno,
  rifare-tetto↔rifare-tetto
LINKS_ADDED: 0 nuovi link (il pattern esisteva già)
LINKS_ALREADY_PRESENT: 4 (2 coppie × 2 direzioni), tutti confermati funzionanti
LINKS_SKIPPED: 3 (i costSlug delle landing fotovoltaico/climatizzatore/elettrico,
  correttamente nascosti perché senza guida reale dietro)
CTA_TARGETS_VERIFIED: /richiesta/rifare-bagno e /richiesta/rifare-tetto
  invariate, confermate corrette (CTA funnel distinta dal link informativo,
  non toccata da questa fase)
GUARD_ADDED_OR_REUSED: aggiunto — resolveCostGuideHrefForIntervention/
  resolveInterventionHrefForCostGuide in engine/resolve-seo-page.ts,
  stesso principio "verifica esistenza prima di linkare" già in uso altrove
  (es. RelatedInterventionChip in questo stesso template, e public-navigation
  guards in site/services)
HREF_HASH_CHECK: 0 occorrenze in site/seo

TYPECHECK_RESULT: PASS (pnpm --filter web typecheck)
BUILD_RESULT: PASS (44/44 pagine, nessuna route nuova/rimossa)

OPEN_ITEMS_UPDATED: sì
ROADMAP_UPDATED: sì

RISKS: nessuno nuovo. I 3 costSlug "orfani" restano dichiarati nei content.ts
  delle rispettive landing — quando una fase futura crea quelle guide costo,
  deve usare uno slug guida IDENTICO al costSlug già dichiarato
  ("fotovoltaico", "installare-climatizzatore", "impianto-elettrico") oppure
  aggiornare il costSlug per farlo coincidere, altrimenti il link resterebbe
  nascosto anche con la guida creata.
BLOCKERS: nessuno
NEXT_PHASE: Phase 20.4 — Professionals Module (o priorità SEO/cost guide growth)
```

---

# 20. Phase 20.4 — Professionals Module

Status:

```txt id="zc9h78"
NOT_STARTED
```

Tipo:

```txt id="zho2d4"
Product/SEO
```

Obiettivo futuro:

```txt id="rgx2rm"
Mostrare professionisti registrati per servizio/città solo quando ci sono dati reali.
```

Precondizioni:

```txt id="uk0cl1"
aziende reali;
servizi abilitati;
copertura territoriale;
stato verifica;
eventuali recensioni;
eventuali lavori/foto;
regole privacy/visibilità.
```

Vietato:

```txt id="nfz90h"
professionisti finti;
recensioni finte;
“migliori professionisti” senza dati;
liste vuote mascherate.
```

---

# 21. Phase 20.5 — `/servizi/[slug]` Canonical Decision

Status:

```txt id="5dy1mb"
NOT_STARTED
```

Tipo:

```txt id="wy7mgq"
Architecture/SEO
```

Obiettivo:

```txt id="qp63kj"
Decidere se migrare le pagine servizio da /interventi/[slug] a /servizi/[slug].
```

Questa fase è delicata e non va fatta insieme a home/costi/funnel.

Richiede:

```txt id="65fiew"
audit indicizzazione;
redirect 301;
canonical;
sitemap;
internal links;
notFound;
Search Console;
piano rollback.
```

Decisione default fino a nuova fase:

```txt id="j7gzgs"
/interventi/[slug] resta attivo.
```

---

## 22. Template report dopo ogni fase

Ogni fase deve produrre un report con questo formato:

```txt id="2hll9q"
STATUS:
PHASE:

FILES_CHANGED:
FILES_CREATED:
FILES_DELETED:
ROUTES_CHANGED:
PACKAGES_CHANGED:

WHAT_WAS_DONE:
WHAT_WAS_NOT_DONE:
RELEASE_BLOCKERS_RESOLVED:
RELEASE_BLOCKERS_REMAINING:

SCHEMA_CHANGES:
ROADMAP_UPDATED:
GUARDS_CHECKED:

TYPECHECK_RESULT:
BUILD_RESULT:
ROOT_TYPECHECK_RESULT:
ROOT_BUILD_RESULT:

RISKS:
BLOCKERS:
NEXT_STEP:
```

---

## 23. Regole di aggiornamento di questa roadmap

Quando una fase viene completata:

```txt id="h74dac"
1. Cambiare lo stato della fase a COMPLETED.
2. Aggiungere file creati/modificati.
3. Aggiornare release blockers.
4. Aggiornare NEXT_STEP.
5. Non cancellare la storia.
6. Se una fase cambia scope, dichiararlo.
```

Quando una fase fallisce:

```txt id="91hrww"
1. Cambiare stato a BLOCKED o PARTIALLY_COMPLETED.
2. Scrivere perché.
3. Scrivere cosa è rimasto.
4. Non procedere alla fase successiva senza decisione.
```

---

## 24. Stato release target

Release target minima accettabile:

```txt id="n6782b"
Home senza guide finte.
Home senza href="#".
/costi esistente e raggiungibile.
/servizi esistente e raggiungibile.
6 servizi principali funzionanti.
Funnel 6 servizi principali funzionante.
Guide costo reali raggiungibili.
Nessuna pagina promessa ma inesistente.
```

Release non accettabile:

```txt id="pavhth"
Guide ai costi con 3 voci inesistenti.
CTA “leggi tutti” verso href="#".
Home che sembra mostrare tutto il catalogo ma mostra solo 6 lavori.
Hub /costi mancante.
Servizi tecnici/pratiche invisibili dal sito.
```

---

## 25. Sintesi operativa

Ordine corretto:

```txt id="hxjxeo"
19.1 Documentazione schema/roadmap
19.2 Guardrail release
19.3 Fondazione registry navigazionale
19.4 /costi hub minimo
19.5 Home guide costi rewrite
19.6 /servizi hub minimo
19.7 Home featured services alignment
19.8 Task funnel-only pilot
19.9 QA pre-release
```

Non procedere a SEO growth finché i release blocker sono aperti.

SEO growth inizia solo dopo:

```txt id="q4mbcu"
home pulita;
costi hub reale;
servizi hub reale;
funnel preservato;
nessun link morto.
```

---

# 26. AI EXECUTION PROTOCOL

Questa sezione è il protocollo operativo vincolante per qualsiasi AI (o sviluppatore) che
esegua una fase di questa roadmap. Consolida e rende eseguibile in un solo posto le regole
già descritte nelle sezioni 2, 4, 22, 23 e nel documento `03_RELEASE_GUARDS.md`.

## 26.1 Prima di iniziare qualsiasi fase

```txt id="aiep01"
1. Leggere integralmente, in quest'ordine:
   docs/architetture/01_ARCHITECTURE.md
   docs/architetture/02_GUARDS.md
   docs/architetture/03_ROADMAP.md
   docs/architetture/04_DEFERRED_ITEMS.md
   docs/seo-navigation/01_SCHEMA.md
   docs/seo-navigation/02_ROADMAP.md (questo file)
   docs/seo-navigation/03_RELEASE_GUARDS.md
2. Identificare la fase richiesta nella sezione "Roadmap sintetica" (sezione 7).
3. Se la fase ha uno stato diverso da NOT_STARTED o READY, fermarsi e segnalarlo
   all'utente prima di procedere (non sovrascrivere lavoro già fatto senza dirlo).
4. Leggere lo scope esatto della fase: obiettivo, file consentiti, file vietati,
   acceptance criteria.
5. Se la fase richiede `03_RELEASE_GUARDS.md` e il file non esiste, fermarsi e
   limitarsi a crearlo (non procedere con la fase applicativa).
```

## 26.2 Durante l'esecuzione

```txt id="aiep02"
1. Una fase alla volta (Guard 17 / sezione 4.1). Non accorpare più fasi numerate
   in una singola esecuzione, anche se sembrano collegate.
2. Toccare solo i file elencati come "consentiti" nella fase. Se serve un file
   fuori da quell'elenco, fermarsi e chiederlo esplicitamente prima di procedere.
3. Non introdurre nessuno degli elementi vietati da 03_RELEASE_GUARDS.md
   (href="#", guide/pagine/professionisti finti, categorie vuote, card senza
   destinazione reale, hub vuoti, micro-guide con foto).
4. Non fare refactor non richiesto, non fare cleanup generico, non rinominare
   nulla fuori scope.
```

## 26.3 Prima di dichiarare una fase COMPLETED

```txt id="aiep03"
1. Se la fase ha toccato codice in apps/web: eseguire
   `pnpm --filter web typecheck` e `pnpm --filter web build`.
2. Se la fase ha toccato package condivisi: eseguire anche `pnpm typecheck` e
   `pnpm build` a livello root.
3. Se una verifica fallisce, lo stato della fase è BLOCKED o
   PARTIALLY_COMPLETED, non COMPLETED — e non si procede alla fase successiva
   senza una decisione esplicita.
4. Verificare gli acceptance criteria della fase uno per uno, non a sensazione.
5. Verificare la checklist pre-release (03_RELEASE_GUARDS.md sezione 23) per gli
   elementi pertinenti alla fase appena eseguita.
```

## 26.4 Dopo l'esecuzione (sempre, anche per fasi solo-documentali)

```txt id="aiep04"
1. Aggiornare questo file (02_ROADMAP.md):
   - stato della fase nella tabella sintetica (sezione 7);
   - stato della fase nella sua sezione dedicata;
   - aggiungere un blocco "PHASE_REPORT Phase X.Y" subito dopo gli acceptance
     criteria della fase, con lo stesso formato della sezione 22.
2. Aggiornare la sezione "Release blockers correnti" (sezione 6) se la fase ha
   risolto o introdotto un blocker.
3. Non cancellare la storia delle fasi precedenti: solo aggiungere/aggiornare.
4. Restituire all'utente un report nel formato richiesto dal task specifico
   (può essere un sottoinsieme del formato sezione 22, se il task lo richiede
   esplicitamente — es. Phase 19.1 richiede STATUS/PHASE/FILES_CREATED/
   FILES_CHANGED/FILES_DELETED/CODE_CHANGED/NEXT_STEP).
```

## 26.5 Domanda di chiusura obbligatoria

```txt id="aiep05"
Prima di dichiarare qualunque fase conclusa, rispondere esplicitamente:
"Questa modifica rende il sito più reale, più chiaro e più navigabile, o introduce
una promessa che il sito non mantiene?"
Se la risposta è la seconda, la fase non è COMPLETED.
```
