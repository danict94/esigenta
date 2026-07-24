# Esigenta — SEO Navigation Open Items Register

Versione: 1.0
Stato: ATTIVO
Ambito: Home, servizi, interventi, guide ai costi, funnel, release readiness
Documento collegato: `docs/seo-navigation/01_SCHEMA.md`
Documento collegato: `docs/seo-navigation/02_ROADMAP.md`
Documento collegato: `docs/seo-navigation/03_RELEASE_GUARDS.md`
Documento sovraordinato: `docs/seo-navigation/05_SEO_DOMAIN_VISION.md` (prevale sul modello di dominio)
Ultimo aggiornamento: 2026-06-18

---

## 1. Scopo del documento

Questo documento registra gli item scoperti durante le fasi SEO/navigation ma non
ancora risolti.

Non è una roadmap operativa: `02_ROADMAP.md` resta l'unico documento che definisce
l'ordine di esecuzione delle fasi.

Non è un'autorizzazione a implementare: ogni item qui elencato richiede una fase
dedicata, con il proprio scope, i propri file consentiti/vietati e il proprio
acceptance criteria, prima di poter essere chiuso.

Questo documento serve a non perdere il contesto raccolto durante gli audit (Phase 18,
18.1, 19, 19.0B, 19.1-19.6B) e a non far ripetere a una fase futura una domanda già
risposta in passato.

---

## 2. Regole

```txt id="oi-rules"
Questo file non autorizza implementazioni automatiche.
Ogni item richiede una fase dedicata con scope esplicito prima di essere chiuso.
Non anticipare item post-release: restano dichiarati, non eseguiti.
Aggiungere un item è sempre permesso quando una fase lo scopre.
Chiudere un item richiede di spostarlo nella sezione "Log risoluzioni" con la fase
  che lo ha chiuso, non semplicemente cancellarlo.
Non duplicare un item già presente: se una fase lo ritrova, aggiornare la voce
  esistente (data, contesto), non crearne una seconda.
```

---

## 3. Open items pre-release

Item che, se non risolti, restano un blocker o un rischio per la release secondo
`03_RELEASE_GUARDS.md`.

```txt id="oi-pre-00"
ID: OI-033
TITLE: href="#" reale nel footer globale ("Articoli") — RELEASE BLOCKER
STATUS: RESOLVED_BY_PHASE_19_9_1
SOURCE_PHASE: 19.9 (Release Readiness QA, scoperto) → 19.9.1 (Fix Release Blockers, risolto)
DESCRIPTION:
  apps/web/src/site/shell/footer.tsx, colonna "Piattaforma", voce "Articoli":
    { href: "#", label: "Articoli" }
  Il footer è renderizzato da PublicShell su OGNI pagina pubblica del sito (home,
  /servizi, /costi, tutte le landing /interventi) — non era un caso isolato, era
  un link morto visibile sito-wide.
RESOLUTION: verificato che `/guide` (o qualunque route articoli/blog) non esiste
  nel codebase (Glob su apps/web/src/app/guide/** → nessun file). Per la regola
  "se non esiste una route reale, rimuovi la voce" applicata in Phase 19.9.1:
  rimossa l'intera colonna "Piattaforma" dal footer (conteneva solo quella voce,
  lasciarla con un titolo e zero link avrebbe creato una sezione vuota). Resta
  solo la colonna "Legale" (Privacy/Cookie/Termini, tutte route reali). Nessuna
  nuova route creata, nessun placeholder introdotto.
FILES_CHANGED: apps/web/src/site/shell/footer.tsx
VERIFICATION: grep "href=\"#\"" su tutto apps/web/src → 0 occorrenze reali
  renderizzabili (resta solo una fixture sintetica in
  public-navigation/validators.selftest.ts, usata per testare che il guard
  stesso riconosca un href="#" come invalido — non un bug).
NEXT_ACTION: nessuna.
```

```txt id="oi-pre-01"
ID: OI-001
TITLE: /servizi riscritto come conversion hub taxonomy-backed
STATUS: RESOLVED_BY_PHASE_19_6I — limiti residui tracciati in OI-031
SOURCE_PHASE: 19.6 (apertura) → 19.6D/19.6E (audit) → 19.6F (ridefinizione) →
  19.6H (schema/guard) → 19.6I (implementazione)
RESOLUTION: services-hub-page.tsx riscritto per usare
  buildPublicServiceMacroAreasWithItems() (site/services/public-navigation/
  builders.ts), derivato da taxonomySource (81 interventions reali) + coverage.ts
  + seo-page-map/cost-guide-map derivati. 12 macro aree pubbliche renderizzate, 35
  item in evidenza per area, 43 in liste collassate (<details>/<summary>, zero
  JS), 3 nascosti (gruppo sicurezza, HIDE_FOR_NOW). Nessun link finto, nessun
  href="#", build verificato.
NEXT_ACTION: nessuna per il modello base. Vedi OI-031 per i limiti/decisioni
  ancora aperti (QA conversione, eventuale priorità diversa per area).
DECISIONE_CORRELATA: TaxonomyDomain non è stato trasformato in macro-area
  pubblica — confermato anche nell'implementazione (01_SCHEMA.md sezione 20.3).
```

---

## 4. Open items post-release

Item esplicitamente non bloccanti, da tracciare ma non eseguire prima della release.

```txt id="oi-post-01"
ID: OI-002
TITLE: "Pratiche e tecnici" (CILA, SCIA, APE, geometra, architetto, direzione lavori)
  non esistono in taxonomy/funnel — area HIDE_UNTIL_TAXONOMY_EXISTS
STATUS: OPEN — POST_RELEASE
SOURCE_PHASE: 19.6B (prima verifica) → 19.6D (seconda verifica indipendente, stesso
  esito) → 19.6F (riclassificato come macro-area pubblica HIDE_UNTIL_TAXONOMY_EXISTS)
DESCRIPTION:
  Verificato con audit esplicito due volte (grep su packages/taxonomy e
  packages/funnel, Phase 19.6B e 19.6D): zero corrispondenze reali per CILA, SCIA,
  APE, geometra, architetto, direzione lavori. Restano PLANNED nel registry
  (site/services/catalog.ts) e nascosti in /servizi. Nel modello a 7 stati
  (01_SCHEMA.md sezione 20.5) questa è la macro-area pubblica "Pratiche e tecnici",
  stato HIDE_UNTIL_TAXONOMY_EXISTS.
RULE: non devono essere pubblicati (né come SEO_PAGE_NOW né come REQUEST_NOW) finché
  non esistono realmente nel dominio prodotto (taxonomy intervention reale). Non
  mostrare nemmeno come link generico o placeholder "in arrivo".
NEXT_ACTION: quando taxonomy verrà estesa con uno di questi servizi, una fase
  dedicata deve promuovere la singola voce corrispondente (non tutte insieme) da
  PLANNED/assente a SEO_PAGE_NOW o REQUEST_NOW, con verifica della destinazione reale.
```

```txt id="oi-post-02"
ID: OI-003
TITLE: Voci PLANNED nel registry servizi sono nascoste, non solo non cliccabili
STATUS: OPEN — POST_RELEASE
SOURCE_PHASE: 19.6 / 19.6B
DESCRIPTION:
  Per scelta esplicita (raccomandata anche dal task di Phase 19.6), le voci PLANNED
  non sono mostrate affatto in /servizi (isPubliclyLinkable le esclude), invece di
  apparire come testo "in arrivo" non cliccabile. Questo evita ogni rischio di effetto
  finto, ma significa che oggi nessun segnale "stiamo per aggiungere altro" è visibile
  agli utenti.
NEXT_ACTION: da riallineare quando la taxonomy verrà estesa e ci sarà massa critica di
  voci reali per categoria — valutare allora se mostrare un'indicazione "in arrivo"
  editoriale onesta, non un placeholder generico.
```

```txt id="oi-post-03"
ID: OI-004
TITLE: Nessun servizio tecnico/pratica deve diventare FUNNEL_ONLY usando il preset
  GENERIC come scorciatoia
STATUS: OPEN — POST_RELEASE (regola permanente, non un singolo task da chiudere)
SOURCE_PHASE: 19.6B
DESCRIPTION:
  Il funnel ha un preset GENERIC di fallback per qualunque slug non riconosciuto.
  Non è una destinazione "reale" nel senso richiesto dalle fasi 19.6/19.6B: è un
  acquisitore dati universale, non una conferma che Esigenta gestisce operativamente
  quel servizio.
RULE: FUNNEL_ONLY richiede un funnelSlug reale e validato (vedi OI-005), non la sola
  presenza del fallback GENERIC.
NEXT_ACTION: nessuna — regola da applicare ogni volta che si valuta una promozione a
  FUNNEL_ONLY, non un singolo item da chiudere.
```

```txt id="oi-post-04"
ID: OI-005
TITLE: getServiceCatalogItemHref() non valida ancora le voci FUNNEL_ONLY contro un
  funnel realmente esistente
STATUS: OPEN — POST_RELEASE
SOURCE_PHASE: 19.6
DESCRIPTION:
  Per le voci SEO_PAGE, il catalogo valida a module-load time che lo slug esista nel
  registry SEO (site/seo/pages/interventi). Per le voci FUNNEL_ONLY non esiste oggi un
  controllo equivalente contro packages/funnel, perché non esiste ancora nessuna voce
  FUNNEL_ONLY nel catalogo.
NEXT_ACTION: quando la prima voce FUNNEL_ONLY verrà introdotta (Phase 19.8 o
  successiva), aggiungere una validazione equivalente (es. verificare che il
  funnelSlug sia un preset/intervention taxonomy reale) prima di considerare la fase
  completa.
```

```txt id="oi-post-05"
ID: OI-006
TITLE: Immagini guida-*.webp non più referenziate dopo Phase 19.5
STATUS: OPEN — POST_RELEASE / CLEANUP
SOURCE_PHASE: 19.5
DESCRIPTION:
  apps/web/public/assets/images/home/guida-bagno.webp, guida-tetto.webp,
  guida-climatizzatore.webp, guida-fotovoltaico.webp non sono più importate da nessun
  componente dopo la riscrittura di site/home/cost-guides.tsx. Non sono state
  cancellate perché apps/web/public/** non era nello scope consentito in quella fase.
NEXT_ACTION: cleanup separato e non urgente — rimuovere i file se confermato che
  nessun altro punto del codice li referenzia.
```

```txt id="oi-post-06"
ID: OI-007
TITLE: Hub /interventi resta post-release
STATUS: OPEN — POST_RELEASE
SOURCE_PHASE: 19.0B
DESCRIPTION:
  La home mostra già tutte le 6 famiglie SEO intervento esistenti. Un hub /interventi
  separato oggi elencherebbe le stesse 6 voci, senza valore aggiunto.
NEXT_ACTION: creare l'hub solo quando le famiglie intervento superano quelle
  mostrabili in home (indicativamente 12-15+).
```

```txt id="oi-post-07"
ID: OI-008
TITLE: Migrazione /interventi/[slug] → /servizi/[slug] resta decisione futura
STATUS: OPEN — POST_RELEASE / DECISIONE DEDICATA
SOURCE_PHASE: 19.0B / 01_SCHEMA.md sezione 3.4
DESCRIPTION:
  01_SCHEMA.md prevede una possibile route canonica futura /servizi/[serviceSlug] che
  sostituisca o affianchi /interventi/[slug]. Non è richiesta per la release iniziale.
RULE: una migrazione di questo tipo richiede redirect strategy, canonical strategy,
  sitemap update, link interni aggiornati, test 404/301, verifica Search Console
  post-release — non va fatta insieme ad altre fasi (Guard 17, niente mega fasi).
NEXT_ACTION: nessuna fino a decisione esplicita dedicata (Phase 20.5 in 02_ROADMAP.md).
```

```txt id="oi-post-08"
ID: OI-009
TITLE: Professionisti registrati per servizio/città resta post-release
STATUS: OPEN — POST_RELEASE
SOURCE_PHASE: 19.0B / 01_SCHEMA.md sezione 12
DESCRIPTION:
  Mostrare professionisti specifici richiede dati reali (aziende registrate,
  copertura territoriale, stato verifica, eventuali recensioni). Non disponibili oggi
  in quantità/qualità sufficiente.
RULE: vietato mostrare "i migliori professionisti a [città]" senza dati reali dietro
  (Guard 9). Ammesso solo copy prudente generico.
NEXT_ACTION: nessuna fino a Phase 20.4 — Professionals Module, quando i dati saranno
  disponibili.
```

---

## 4.1 Taxonomy inconsistencies / needs review

Item emersi dall'audit Phase 19.6D (Taxonomy Source Structure Audit), registrati in
Phase 19.6F, e **risolti in Phase 19.6G (Taxonomy Orphan Cleanup)**.

```txt id="oi-taxfix-01"
ID: OI-022
TITLE: installare-antifurto è TaxonomyIntervention reale ma orphan da TaxonomyDomain
STATUS: RESOLVED_BY_PHASE_19_6G
SOURCE_PHASE: 19.6D (scoperto) → 19.6G (risolto)
DESCRIPTION: l'intervention esisteva in packages/taxonomy/src/source/interventions/
  impianti/sicurezza.ts (categoria sicurezza-elettronica), ma non era referenziata da
  nessun TaxonomyDomain.
RESOLUTION: creato il nuovo domain `sicurezza` (slug distinto dalla category
  "sicurezza-elettronica" per evitare collisione globale di slug; name "Sicurezza
  elettronica") in packages/taxonomy/src/source/domains/sicurezza-elettronica.ts,
  registrato in source/index.ts, con installare-antifurto incluso tra le
  interventions. Nessuno slug pubblico/SEO/funnel modificato. taxonomy:generate
  eseguito con successo, nessun warning orphan residuo per questo intervento.
NEXT_ACTION: nessuna — risolto. La pubblicazione pubblica in /servizi resta una
  decisione separata (PublicServiceMacroArea, Phase 19.6H), non automatica.
```

```txt id="oi-taxfix-02"
ID: OI-023
TITLE: installare-telecamere è TaxonomyIntervention reale ma orphan da TaxonomyDomain
STATUS: RESOLVED_BY_PHASE_19_6G
SOURCE_PHASE: 19.6D (scoperto) → 19.6G (risolto)
RESOLUTION: stesso fix di OI-022 — incluso nel nuovo domain `sicurezza`.
NEXT_ACTION: nessuna — risolto.
```

```txt id="oi-taxfix-03"
ID: OI-024
TITLE: installare-controllo-accessi è TaxonomyIntervention reale ma orphan da
  TaxonomyDomain
STATUS: RESOLVED_BY_PHASE_19_6G
SOURCE_PHASE: 19.6D (scoperto) → 19.6G (risolto)
RESOLUTION: stesso fix di OI-022/OI-023 — incluso nel nuovo domain `sicurezza`.
NEXT_ACTION: nessuna — risolto.
```

```txt id="oi-taxfix-04"
ID: OI-025
TITLE: rifare-impianto-idraulico esiste ma risulta orphan rispetto al domain idraulica
STATUS: RESOLVED_BY_PHASE_19_6G
SOURCE_PHASE: 19.6D (scoperto) → 19.6G (risolto)
DESCRIPTION: l'intervention era definita in
  packages/taxonomy/src/source/interventions/impianti/idraulica.ts, ma
  domains/idraulica.ts elencava solo 4 delle 5 interventions del file.
RESOLUTION: aggiunto "rifare-impianto-idraulico" all'array interventions del domain
  idraulica esistente (packages/taxonomy/src/source/domains/idraulica.ts). Nessuno
  slug modificato, nessuna nuova SEO page, nessun nuovo funnel.
NEXT_ACTION: nessuna — risolto.
```

```txt id="oi-taxfix-05"
ID: OI-026
TITLE: service "impianto-idraulico" ha naming anomalo (name in minuscolo)
STATUS: RESOLVED_BY_PHASE_19_6G
SOURCE_PHASE: 19.6D (scoperto) → 19.6G (risolto)
RESOLUTION: corretto packages/taxonomy/src/source/services/impianti.ts — il campo
  `name` del service `impianto-idraulico` è ora "Impianto idraulico" (era
  "impianto-idraulico", identico allo slug). Slug non modificato.
NEXT_ACTION: nessuna — risolto.
```

NOTA: anche dopo questa risoluzione, nessuno dei 4 interventi del gruppo "sicurezza"
o "rifare-impianto-idraulico" è automaticamente visibile in /servizi. La taxonomy non
ha più anomalie, ma la decisione di cosa pubblicare resta del layer
PublicServiceMacroArea/VisibilityPolicy (Phase 19.6H), non di questa fase.
VALIDAZIONE: `pnpm --filter @esigenta/taxonomy taxonomy:generate` eseguito con
successo dopo i fix — `validateTaxonomySource` non emette più alcun warning "is not
referenced by any domain" per questi 4 interventi (verificato sull'output completo
del comando, nessuna riga `[taxonomy warning]` presente).

```txt id="oi-area-giardinaggio"
ID: OI-027
TITLE: Giardinaggio — area di mercato reale, assente da taxonomy
STATUS: OPEN — HIDE_UNTIL_TAXONOMY_EXISTS
SOURCE_PHASE: 19.6E (proposta macro-area) / 19.6D (verifica assenza) / 19.6F (registrato)
DESCRIPTION: il giardinaggio è un'area di mercato plausibile per Esigenta (in linea
  con altri servizi casa), ma è completamente assente da packages/taxonomy:
  zero services, zero interventions, zero domains, zero categories con questo tema
  (verificato via grep dedicata in Phase 19.6D, nessun match).
RULE: questa area non va mostrata come disponibile in /servizi, nemmeno come link
  generico o placeholder "presto disponibile" — stessa regola già applicata a
  "Pratiche e tecnici" (OI-002).
NEXT_ACTION: nessuna finché qualcuno non decide di estendere taxonomy con questo
  dominio. Solo dopo, una fase dedicata valuta se/come introdurlo come macro-area
  pubblica.
```

---

## 5. Deferred decisions

Decisioni esplicitamente rimandate, non item da implementare a breve.

```txt id="oi-deferred-01"
ID: OI-010
TITLE: Forma tecnica del parametro task nel funnel
STATUS: DEFERRED
SOURCE_PHASE: 01_SCHEMA.md sezione 3.8 / 4.3
DESCRIPTION:
  01_SCHEMA.md propone concettualmente
  /richiesta/[funnelSlug]?task=[taskSlug]
  ma la forma esatta del parametro (query string vs altro) non è stata decisa
  tecnicamente. Rimandata alla fase che introdurrà i primi ServiceTask reali
  (Phase 19.8 — Service Tasks Funnel-Only Pilot).
NEXT_ACTION: decidere nella fase 19.8, non prima.
```

```txt id="oi-deferred-02"
ID: OI-011
TITLE: Categorie /costi
STATUS: RESOLVED_BY_PHASE_20_2
SOURCE_PHASE: 18.1 / 19 (apertura) → 20.2 (risolto)
DESCRIPTION:
  Con una sola guida costo pubblicata, /costi era rimasta lista piatta
  (corretto a quel tempo). Le 7 categorie originariamente candidate (Bagno,
  Tetto e coperture, Impianti, Energia, Finiture, Pratiche edilizie, Tecnici e
  progettazione) erano solo un'ipotesi, non implementate.
RESOLUTION: con 2 guide costo reali (ristrutturare-bagno, rifare-tetto), Phase
  20.2 ha introdotto CostGuideHubCategory su CostGuide e
  engine/cost-hub.ts (buildCostHubCategoryGroups, deriva solo da guide reali,
  nessuna categoria vuota possibile per costruzione). Categorie effettive
  oggi: "Ristrutturazioni", "Tetti e facciate" — nomi scelti per coerenza con
  /servizi (Phase 19.6E), non i 7 nomi originariamente ipotizzati nel 2019.x
  (quell'elenco resta solo un riferimento storico, non vincolante).
NEXT_ACTION: nessuna — ogni nuova guida costo (Phase 20.x) deve solo dichiarare
  `hubCategory` nel proprio base.ts; un nuovo gruppo o l'aggiunta a un gruppo
  esistente avviene automaticamente, nessun file da toccare in più.
```

---

## 6. Cleanup items

```txt id="oi-cleanup-01"
ID: OI-012
TITLE: why-choose.tsx è dead code
STATUS: OPEN — CLEANUP, non blocca la release
SOURCE_PHASE: 19.0B
DESCRIPTION:
  apps/web/src/site/home/why-choose.tsx esiste sul filesystem ma non è importato da
  nessun punto del codice (verificato via grep, unico match è il file stesso).
NEXT_ACTION: decidere se eliminarlo o montarlo in home, in una fase di cleanup
  dedicata — non è una fase SEO/navigation.
```

```txt id="oi-cleanup-02"
ID: OI-013
TITLE: Immagini guida-*.webp orfane
STATUS: OPEN — CLEANUP, non urgente
SOURCE_PHASE: 19.5
NOTE: stesso item di OI-006, elencato qui per categoria. Vedere OI-006 per i dettagli.
```

```txt id="oi-cleanup-03"
ID: OI-034
TITLE: Immagine OG hardcoded ("rifare-bagno.webp") per qualunque cost guide
STATUS: RESOLVED_BY_PHASE_20_1
SOURCE_PHASE: Phase 18 (audit originale) → 19.9 (formalizzato) → 20.1 (risolto)
DESCRIPTION:
  apps/web/src/site/seo/engine/metadata.ts usava una costante `ogBathroomImage`
  fissa per QUALSIASI guida/città. Sarebbe diventato un bug visibile (anteprima
  social sbagliata) con l'arrivo della seconda guida costi.
RESOLUTION: aggiunto il campo `heroImage: { src, alt }` a CostGuide
  (site/seo/pages/costi/types.ts), popolato per ogni guida nel proprio base.ts.
  engine/metadata.ts ora usa `guide.heroImage` sia in buildCostGuideMetadata che
  in buildCostGuideCityMetadata, costante rimossa. Verificato nessun cambio di
  output per ristrutturare-bagno (stessa immagine di prima) e immagine corretta
  per rifare-tetto.
FILES_CHANGED: site/seo/pages/costi/types.ts, site/seo/pages/costi/
  ristrutturare-bagno/{base.ts,content.ts}, site/seo/pages/costi/rifare-tetto/
  {base.ts,content.ts}, site/seo/engine/metadata.ts
NEXT_ACTION: nessuna — ogni futura guida costi deve solo popolare heroImage nel
  proprio base.ts, nessun altro file da toccare.
```

---

## 7. SEO growth items

Item esplicitamente fuori scope release, da eseguire solo dopo che i blocker pre-release
sono chiusi (vedi `02_ROADMAP.md` sezione 25).

```txt id="oi-growth-01"
ID: OI-014
TITLE: Nuove guide costi (climatizzatore, fotovoltaico, elettrico, cartongesso)
STATUS: OPEN — SEO_GROWTH (parzialmente risolto: tetto fatto in Phase 20.1)
SOURCE_PHASE: 18 / 18.1 / 19 → 20.1 (rifare-tetto completato)
NEXT_ACTION: una famiglia alla volta (Phase 20.1.x), mai copiando il pattern
  bagno/tetto cambiando solo le parole. Vedi OI-035 per gli slug guida esatti
  da usare per le 3 famiglie che hanno già un costSlug dichiarato in attesa.
```

```txt id="oi-growth-10"
ID: OI-035
TITLE: 3 landing /interventi dichiarano un costSlug per una guida costo non
  ancora creata — link nascosto correttamente, ma slug guida da rispettare
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 20.3 (Service ↔ Cost Internal Linking) — scoperto durante l'audit,
  bug preesistente da Phase 13, ora reso inoffensivo (link nascosto) ma non
  ancora risolto nella sostanza (guide non esistono)
DESCRIPTION:
  3 landing SEO interventi dichiarano costSlug per guide costo che non esistono
  ancora. Da Phase 20.3 il link "Vedi la guida completa ai costi" è nascosto
  automaticamente (engine/resolve-seo-page.ts valida l'esistenza), quindi non è
  più un link morto visibile — ma resta un'occasione di conversione/SEO persa
  finché le guide non vengono create:
    site/seo/pages/interventi/installare-fotovoltaico/content.ts → costSlug:
      "fotovoltaico"
    site/seo/pages/interventi/installare-climatizzatore/content.ts → costSlug:
      "installare-climatizzatore"
    site/seo/pages/interventi/rifare-impianto-elettrico/content.ts → costSlug:
      "impianto-elettrico"
RULE: quando si crea la guida costo per una di queste famiglie (Phase 20.1.x),
  lo slug della nuova guida (CostGuide.slug, usato anche in
  buildCanonicalPath/route /costi/[slug]) deve coincidere ESATTAMENTE con il
  costSlug già dichiarato qui sopra, altrimenti il link resterebbe nascosto
  anche dopo la creazione della guida (i due valori non sarebbero stati scelti
  per coincidere a priori, vanno verificati uno per uno, non assunti).
NEXT_ACTION: verificare/allineare lo slug guida ↔ costSlug per ciascuna delle 3
  famiglie nel momento in cui la rispettiva guida costo viene creata.
```

```txt id="oi-growth-02"
ID: OI-015
TITLE: Micro-guide costo (intonaco al mq, posa piastrelle, punto luce, ecc.)
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 18 / 19
RULE: mai card fotografiche grandi per le micro-guide (Guard 7). Solo dopo che esiste
  massa critica di guide principali.
```

```txt id="oi-growth-03"
ID: OI-016
TITLE: sitemap dinamica
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 18
DESCRIPTION: nessuna sitemap.xml/route generata dinamicamente esiste oggi in
  apps/web/src/app. site/seo/engine/sitemap.ts non esiste.
```

```txt id="oi-growth-04"
ID: OI-017
TITLE: schema-builder (JSON-LD)
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 18
DESCRIPTION: nessun JSON-LD (Service/FAQPage/LocalBusiness) generato oggi.
  site/seo/engine/schema-builder.ts non esiste.
```

```txt id="oi-growth-05"
ID: OI-018
TITLE: site/seo/matrix/ (combinazioni pubblicabili centralizzate)
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 18 / 18.1 / D-022 (docs/architetture/04_DEFERRED_ITEMS.md)
DESCRIPTION: non necessario con una sola famiglia costi. Da valutare solo quando
  esistono più famiglie con combinazioni da centralizzare.
```

```txt id="oi-growth-06"
ID: OI-019
TITLE: Internal linking servizio → guida costo (link inverso)
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 19
NEXT_ACTION: Phase 20.3 — Service → Cost Internal Linking.
```

```txt id="oi-growth-07"
ID: OI-028
TITLE: Competitor SEO/navigation audit (Instapro, HomeDeal, ProntoPro, Habitissimo e
  altri marketplace casa)
STATUS: OPEN — SEO_GROWTH, non da implementare ora
SOURCE_PHASE: 19.6F (registrato durante la ridefinizione docs, non eseguito)
DESCRIPTION: nessun audit competitor è mai stato fatto in questo filone di fasi.
  Servirebbe per validare/correggere le macro-aree pubbliche proposte in
  01_SCHEMA.md sezione 20.6 e per dare priorità realistica a SEO_PAGE_FUTURE (OI-029).
NEXT_ACTION: fase dedicata futura, fuori scope di qualunque fase 19.6x.
```

```txt id="oi-growth-08"
ID: OI-029
TITLE: Keyword research per le decisioni SEO_PAGE_FUTURE
STATUS: OPEN — SEO_GROWTH, non da implementare ora
SOURCE_PHASE: 19.6D / 19.6E (candidati identificati per affinità di dati, non per
  volume di ricerca reale) → 19.6F (registrato)
DESCRIPTION: gli audit 19.6D/19.6E hanno segnalato candidate landing SEO future solo
  in base a segnali interni (presenza di un preset taxonomy dedicato come
  PLUMBING_EMERGENCY, frequenza percepita, affinità con le 6 famiglie già esistenti),
  MAI in base a dati esterni di ricerca reali. Candidate elencate (priorità relativa,
  non assoluta, da validare con keyword research):
    perdita-acqua, rifare-cucina, posare-piastrelle, fare-opere-murarie,
    rifare-facciata, fare-cappotto-termico, saltata-corrente, ampliare-casa
RULE: nessuna di queste va promossa a landing SEO senza una fase dedicata che
  includa keyword research reale — la lista qui è solo un punto di partenza per quella
  fase, non una priorità definitiva.
NEXT_ACTION: Phase 20.1 (Second Cost Guide Family) o una fase SEO growth dedicata,
  dopo un eventuale OI-028.
```

```txt id="oi-growth-09"
ID: OI-032
TITLE: Related funnel work module da estendere ad altre landing SEO
STATUS: OPEN — SEO_GROWTH
SOURCE_PHASE: 19.8
DESCRIPTION:
  Phase 19.8 ha introdotto il modulo "Lavori che puoi richiedere insieme"
  (site/seo/templates/related-funnel-work.tsx) solo per la landing pilota
  /interventi/ristrutturare-bagno (campo relatedFunnelWork in
  ristrutturare-bagno/content.ts, 6 TaxonomyIntervention reali). Le altre 5
  landing SEO esistenti (rifare-impianto-elettrico, installare-fotovoltaico,
  rifare-tetto, installare-climatizzatore, cartongesso-e-finiture) non hanno
  questo modulo: il campo è opzionale e per loro resta undefined.
  Candidate work reali per estensioni future (verificare sempre esistenza in
  taxonomy prima di aggiungere, stesso pattern del pilota — mai inventare slug):
    rifare-impianto-elettrico → saltata-corrente, aggiungere-presa-elettrica,
      sostituire-interruttore, montare-lampadario, riparare-citofono
    rifare-tetto → riparare-tetto, fare-lattoneria, sostituire-grondaie
    installare-climatizzatore → (nessun lavoro granulare extra reale trovato nel
      domain clima-energia oltre ai 2 già SEO_PAGE_NOW)
    cartongesso-e-finiture → fare-parete-cartongesso, riparare-cartongesso,
      tinteggiare-interni, tinteggiare-esterni
RULE: ogni estensione deve verificare gli slug contro taxonomySource (il guard in
  related-funnel-work.tsx fa già fallire il build per slug inesistenti) e restare
  dentro il limite 4-6 item per landing.
NEXT_ACTION: nessuna automatica. Da valutare landing per landing in una fase
  dedicata o come parte di Phase 19.9/20.x.
```

---

## 8. Product/domain items

```txt id="oi-product-01"
ID: OI-020
TITLE: Source of truth finale delle 6 card home (homeFeature)
STATUS: OPEN — da riallineare in fase dedicata
SOURCE_PHASE: 19.0B / 19.7 (pianificata)
DESCRIPTION:
  Le 6 card in apps/web/src/site/home/professional-areas.tsx restano hardcoded.
  Funzionano (slug verificati manualmente, coincidenti con il registry SEO e con
  site/services/catalog.ts), ma non sono derivate da una fonte verificabile a
  typecheck/build time.
NEXT_ACTION: Phase 19.7 — Home Featured Services Alignment (già pianificata in
  02_ROADMAP.md sezione 14) deve decidere se/come collegarle al registry
  site/services/** senza rompere il design attuale.
```

```txt id="oi-product-02"
ID: OI-021
TITLE: Modello "professionisti disponibili" per servizio/città
STATUS: OPEN — POST_RELEASE (duplicato concettuale di OI-009, vedere quello per i
  dettagli completi)
SOURCE_PHASE: 19.0B
```

```txt id="oi-product-03"
ID: OI-030
TITLE: Public Catalog Schema & Coverage Guard
STATUS: RESOLVED_BY_PHASE_19_6H (fondazione) — consumata da /servizi in Phase 19.6I
  (vedi OI-001, RESOLVED_BY_PHASE_19_6I)
SOURCE_PHASE: 19.6H
DESCRIPTION:
  Creato apps/web/src/site/services/public-navigation/** con uno schema esplicito
  (CoverageState a 7 valori, VisibilityPolicy, DestinationType, SeoStatus,
  CostGuideStatus) e una coverage map (coverage.ts) che classifica le 81
  TaxonomyIntervention reali esistenti oggi. Un guard (validators.ts, eseguito a
  module-load tramite services-hub-page.tsx) fa fallire il build se:
    - una TaxonomyIntervention reale resta senza decisione di coverage
    - una decisione di coverage punta a uno slug taxonomy inesistente
    - un item visibile non ha macro area o destinazione reale
    - SEO_PAGE_NOW non corrisponde a una landing reale (in entrambe le direzioni:
      anche se una landing reale viene creata senza aggiornare coverage.ts)
    - COST_GUIDE_EXISTS non corrisponde a una guida reale
    - una macro area "in indice" resta vuota
  RULE: ogni TaxonomyIntervention deve avere una decisione pubblica esplicita —
  macro area (o motivo di esclusione), visibility, destinazione, stato SEO, stato
  guida costo. Nessuna voce può restare non classificata.
NOTE: il TaxonomyDomain model review resta un dubbio aperto (vedi 01_SCHEMA.md
  sezione 20.3) ma non blocca questo guard — i domains non sono stati ridisegnati
  in questa fase, restano cluster interni/SEO; il guard opera sopra di essi tramite
  il layer PublicServiceMacroArea, senza dipendere dalla loro forma definitiva.
NEXT_ACTION: Phase 19.6I (Services Hub Taxonomy-Derived Implementation) consumerà
  questo layer per riscrivere /servizi. Nessuna azione automatica fino a quella fase.
```

```txt id="oi-product-04"
ID: OI-031
TITLE: Limiti/decisioni residue dopo la riscrittura taxonomy-backed di /servizi
STATUS: OPEN — confermati dalla QA (Phase 19.6J), nessuno bloccante
SOURCE_PHASE: 19.6I (apertura) → 19.6J (QA, confermati senza fix di codice)
DESCRIPTION:
  La riscrittura (Phase 19.6I) è funzionalmente completa e validata (build, guard,
  selftest, e ora anche QA UX/conversione in Phase 19.6J). Restano decisioni
  editoriali/UX non prese, confermate ancora aperte dalla QA:
    - le prime 3 voci mostrate per macro area sono quelle con priority più basso in
      coverage.ts (decisione presa nell'audit 19.6E, non rivalidata con dati reali
      di domanda/ricerca) — la QA non ha trovato motivo per cambiarla ora, ma non è
      stata validata con dati esterni
    - il gruppo "sicurezza" (3 interventi, domain creato in Phase 19.6G) resta
      HIDE_FOR_NOW: nessuna macro area pubblica decisa per questo gruppo
    - nessuna immagine/copy marketing per le voci REQUEST_NOW/SHOW_IN_COLLAPSED_LIST
      (solo testo, per design — confermato corretto dalla QA: niente gallery per
      varianti granulari)
    - due macro aree di nicchia ("Impermeabilizzazioni", "Piscine") sono candidate
      a un futuro accorpamento/riordino (es. Impermeabilizzazioni dentro Tetti e
      facciate) — non rinominate/accorpate in Phase 19.6J per assenza di un motivo
      forte, solo annotate
NEXT_ACTION: nessuna azione automatica. Da rivalutare quando emergeranno dati reali
  di utilizzo (quali macro aree/voci vengono effettivamente cliccate) o quando il
  gruppo "sicurezza" verrà assegnato a una macro area in una fase dedicata.
```

```txt id="oi-product-05"
ID: OI-036
TITLE: Convergenza Group Service su un'unica fonte di verità (ritiro di
  PublicServiceMacroArea come sistema parallelo)
STATUS: OPEN — DECISIONE DI MODELLO APPROVATA, esecuzione non ancora pianificata
SOURCE_PHASE: SEO Domain Vision (audit Step 1.5 → 1.8)
DESCRIPTION:
  Gli audit Step 1.5 → 1.8 hanno stabilito che PublicServiceMacroArea
  (site/services/public-navigation/macro-areas.ts + coverage.ts) e ProjectGroup
  (taxonomy) rappresentano sostanzialmente lo stesso concetto. La decisione approvata
  (vedi 05_SEO_DOMAIN_VISION.md, "Fonte di verità del Group Service") è convergere su
  ProjectGroup come unica fonte di verità del Group Service e ritirare
  PublicServiceMacroArea come sistema editoriale parallelo. L'unico caso di reale
  divergenza editoriale oggi (presentazione unificata fotovoltaico + climatizzazione)
  va modellato come attributo dell'entità di dominio, non come secondo sistema.
  Questo item supera/assorbe i dubbi residui tracciati in OI-031 (gruppo "sicurezza"
  senza macro area, accorpamenti di nicchia) e la DECISIONE_CORRELATA di OI-001
  ("TaxonomyDomain non trasformato in macro-area pubblica"), entrambi nati dentro il
  modello a doppio sistema ora superato.
RULE: nessun doppio sistema, nessun codice legacy inutilizzato, nessun doppio flusso.
  La convergenza è una decisione di modello, non un refactor da eseguire in blocco:
  va eseguita con il metodo "un mercato alla volta" (05_SEO_DOMAIN_VISION.md principio
  8), e ogni parte sostituita va eliminata nello stesso passaggio che la sostituisce.
NEXT_ACTION: nessuna esecuzione automatica. Una fase dedicata dovrà pianificare la
  convergenza dopo che il modello del primo Group Service è stato approvato secondo il
  metodo "un mercato alla volta". 01_SCHEMA.md sezione 20.3 è già marcata come superata
  in attesa di quella fase.
```

---

## 9. Log risoluzioni

Quando un item viene chiuso, spostarlo qui con questo formato:

```txt id="oi-resolution-template"
ID:
RESOLVED_IN_PHASE:
RESOLUTION_SUMMARY:
FILES_CHANGED:
DATE:
```

```txt id="oi-resolution-001"
ID: OI-001
RESOLVED_IN_PHASE: 19.6I — Services Hub Taxonomy-Derived Implementation
RESOLUTION_SUMMARY: /servizi riscritto per derivare le sue sezioni da
  buildPublicServiceMacroAreasWithItems() (taxonomy-backed), al posto del registry
  manuale a 6 voci. 12 macro aree, 81 interventions classificate, nessun link finto.
  Limiti/decisioni residui tracciati in OI-031.
FILES_CHANGED: apps/web/src/site/services/services-hub-page.tsx
DATE: 2026-06-18
```

```txt id="oi-resolution-022-026"
ID: OI-022, OI-023, OI-024
RESOLVED_IN_PHASE: 19.6G — Taxonomy Orphan Cleanup
RESOLUTION_SUMMARY: creato il domain "sicurezza" (sicurezza-elettronica.ts),
  registrato in source/index.ts, con i 3 interventi del gruppo "sicurezza" inclusi.
  Nessuno slug pubblico/SEO/funnel modificato.
FILES_CHANGED: packages/taxonomy/src/source/domains/sicurezza-elettronica.ts (nuovo),
  packages/taxonomy/src/source/index.ts, packages/taxonomy/generated/**
DATE: 2026-06-18
```

```txt id="oi-resolution-025"
ID: OI-025
RESOLVED_IN_PHASE: 19.6G — Taxonomy Orphan Cleanup
RESOLUTION_SUMMARY: aggiunto "rifare-impianto-idraulico" all'array interventions del
  domain idraulica esistente.
FILES_CHANGED: packages/taxonomy/src/source/domains/idraulica.ts,
  packages/taxonomy/generated/**
DATE: 2026-06-18
```

```txt id="oi-resolution-026"
ID: OI-026
RESOLVED_IN_PHASE: 19.6G — Taxonomy Orphan Cleanup
RESOLUTION_SUMMARY: corretto il campo name del service impianto-idraulico da
  "impianto-idraulico" a "Impianto idraulico". Slug non modificato.
FILES_CHANGED: packages/taxonomy/src/source/services/impianti.ts,
  packages/taxonomy/generated/**
DATE: 2026-06-18
```
