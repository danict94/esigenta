# SEO/GEO content — guida per chi (o cosa) deve aggiungere contenuti

Questo documento spiega come aggiungere contenuti SEO/GEO (nuove città, nuove
guide costi, nuovi interventi) senza ricreare l'anti-pattern che questa
struttura ha sostituito: un unico file con contenuto nazionale + città + prezzi
+ FAQ + canonical tutto insieme.

Se sei un'AI che deve generare una pull request di contenuto: **leggi questo
file per intero prima di toccare qualsiasi file**, poi segui la checklist della
sezione che ti serve. Non inventare struttura nuova: tutto quello che serve
esiste già sotto `apps/web/src/site/seo/`.

## Mappa cartelle e responsabilità

```
site/seo/
  geo/
    cities.ts            — registry geografico: slug, name, province, region
    supported-cities.ts  — quali città sono "supportate" per QUALE famiglia SEO
                            (seoEnabled / contentStatus / uniquenessLevel)
  market-data/
    base-price-ranges.ts — range prezzo nazionale per famiglia (UNICA fonte)
    city-price-index.ts  — modificatore prezzo per città (oggi neutro, multiplier=1)
  engine/
    pricing-resolver.ts  — deriva il range finale (base + modificatore città)
    canonical.ts          — deriva canonical da family + slug + citySlug
    geo-policy.ts          — decide se una pagina città ha qualità minima per
                              essere generata/mostrata (owner reale). Dalla
                              Fase 5.E NON decide più l'indice: le pagine
                              città sono noindex per tutte le famiglie finché
                              non avranno dati locali reali (vedi metadata.ts
                              e sitemap.ts)
    compose-cost-guide.ts  — UNICO composer guide costi (Fase 3): base+faq+
                              local-overrides+geo+market-data+canonical, con
                              validazioni fail-fast a build-time
    resolve-group-page.ts  — view-model landing gruppo /servizi/[groupSlug]
                              (Fase 4): interventi dalla taxonomy, link da
                              registry landing/guide, costi solo da CostGuide
                              reali; fail-fast su gruppo/featured incoerenti
    resolve-seo-page.ts    — dispatch: data una slug, ritorna il dato della pagina
    metadata.ts             — costruisce title/description/canonical/openGraph
    static-params.ts        — generateStaticParams per le route Next.js
    sitemap.ts               — percorsi indicizzabili site/seo per app/sitemap.ts
                                (stessi registry di static-params, mai liste a mano)
    site-url.ts              — origin pubblico + URL assoluti (metadataBase,
                                sitemap, robots); env esplicita, throw in prod
  pages/
    costi/<slug-famiglia>/
      base.ts            — contenuto NAZIONALE tipizzato CostGuideBaseContent
                            (niente città, niente prezzo, niente familyKey)
      faq.ts              — FAQ nazionali
      local-overrides.ts  — SOLO i delta editoriali per ogni città supportata
                            (tipo CityLocalOverride condiviso in costi/types.ts)
      content.ts           — una sola chiamata a engine/compose-cost-guide.ts:
                              zero logica per famiglia
    interventi/<slug-intervento>/
      content.ts          — oggi un solo file per intervento (nessuna città, vedi
                              "Limiti attuali" più sotto)
    gruppi/<slug-gruppo>/
      content.ts          — SOLO editoriale della landing gruppo (Fase 4,
                              pilota: ristrutturazioni). Gli interventi del
                              gruppo vengono dalla taxonomy via
                              engine/resolve-group-page.ts, mai elencati qui;
                              i costi solo da CostGuide reali. Un gruppo è
                              abilitato solo se registrato in gruppi/index.ts
                              (dynamicParams=false: gli altri gruppi non
                              esistono come pagine né in sitemap).
  templates/
    *.tsx                  — solo presentazione. Non vanno mai toccati per
                              aggiungere contenuto: ricevono dati già pronti.
```

Regola di fondo, da non violare mai: **un dato ha un solo posto dove vivere**.

| Dato | Vive in |
|---|---|
| Nome/provincia/regione città | `geo/cities.ts` |
| Quali città sono attive per una famiglia | `geo/supported-cities.ts` |
| Range prezzo nazionale di una famiglia | `market-data/base-price-ranges.ts` |
| Unità/include/escluso/confidence/fonte di una voce costo | stesso file, campi del `PriceRow` — un numero entra SOLO con confidence alta/media (≥2 fonti coerenti); le voci con fonti deboli restano qualitative con nota utile |
| Modificatore prezzo per città (oggi neutro) | `market-data/city-price-index.ts` |
| Canonical di una pagina | calcolato da `engine/canonical.ts`, mai scritto a mano |
| Se una pagina città viene generata/mostrata | deciso da `engine/geo-policy.ts`, mai un campo sparso |
| Se una pagina città entra in indice/sitemap | oggi mai (Fase 5.E, tutte noindex) — deciso in `engine/metadata.ts` + `engine/sitemap.ts`, non da geo-policy.ts |
| Testo nazionale di una guida (summary, factors, savingTips...) | `pages/costi/<slug>/base.ts` |
| FAQ nazionali | `pages/costi/<slug>/faq.ts` |
| Testo specifico di UNA città (summary locale, FAQ locali, casi tipici...) | `pages/costi/<slug>/local-overrides.ts` |

---

## Pagine città: DISABILITATE (Fase 5.G)

`/costi/<slug>/[citySlug]` non genera più nessuna pagina, indipendentemente
dai flag in `geo/supported-cities.ts` o dal contenuto in
`local-overrides.ts`. Il gate è `engine/static-params.ts` →
`getCostGuideCityStaticParams()`, che oggi ritorna sempre `[]`; con
`dynamicParams = false` sulla route, questo trasforma OGNI
`/costi/<slug>/<città>` (comprese quelle già esistenti, es.
`ristrutturare-bagno/milano`) in 404, sia in build che in `next dev`.

Perché: senza dati locali reali (osservazioni di prezzo, preventivi
raccolti) queste pagine leggevano solo la fascia nazionale con una lettura
locale — troppo vicino a una doorway page per restare pubbliche. La guida
nazionale (`/costi/<slug>`) resta la pagina forte indicizzabile; ha un
blocco onesto "La città può incidere sul preventivo?" con fattori generici,
senza link a pagine città e senza prezzi locali.

**Non provare ad "aggiustare" questo aggiungendo o modificando città in
`geo/supported-cities.ts` o `local-overrides.ts`: non ha effetto sulla
generazione finché `getCostGuideCityStaticParams()` resta `[]`.** La
struttura sotto (`geo/`, `local-overrides.ts`, `market-data/city-price-index.ts`,
`engine/geo-policy.ts`) resta intatta apposta: torna operativa quando
esisteranno dati locali reali o una metodologia di calcolo documentata e
difendibile — a quel punto `getCostGuideCityStaticParams()` torna a
chiamare `listIndexableCostGuideCityPages()` (ancora definita in
`pages/costi/index.ts`, oggi semplicemente non richiamata da nessuna route).

La procedura "Caso 1" qui sotto resta come riferimento per QUANDO le
pagine città verranno riattivate: seguirla oggi produce contenuto pronto
ma non pubblicato, il che va bene, ma non aspettarti che la pagina compaia.

## Caso 1 — Aggiungere una città a una guida costi già esistente

Esempio: aggiungere "Bari" alla guida `ristrutturare-bagno`.

1. **`geo/cities.ts`** — se "bari" non esiste ancora nel registry geografico,
   aggiungi un record:
   ```ts
   { slug: "bari", name: "Bari", province: "Bari", region: "Puglia" },
   ```
   Se la città esiste già (perché supportata da un'altra famiglia), NON
   duplicarla: è già lì, riusala.

2. **`geo/supported-cities.ts`** — aggiungi un record nell'array della famiglia
   (`"costGuide:ristrutturare-bagno"`):
   ```ts
   { citySlug: "bari", seoEnabled: true, contentStatus: "ready", uniquenessLevel: "acceptable" },
   ```
   `uniquenessLevel: "thin"` o `contentStatus: "draft"` tengono la pagina fuori
   dalla generazione (vedi `engine/geo-policy.ts`) senza doverla cancellare.
   Anche con i flag "pronti", oggi (Fase 5.E) la pagina resta comunque
   noindex e fuori sitemap: vedi la riga sull'indice nella tabella sopra.

3. **`market-data/city-price-index.ts`** — aggiungi un modificatore neutro
   finché non c'è una decisione di prodotto sui prezzi differenziati per città:
   ```ts
   { citySlug: "bari", multiplier: 1 },
   ```
   **Non inventare un prezzo locale diverso senza che sia stato chiesto
   esplicitamente.** Se manca questa entry, il resolver applica comunque 1
   come default, ma è meglio essere espliciti.

4. **`pages/costi/ristrutturare-bagno/local-overrides.ts`** — aggiungi UN
   blocco con i soli delta editoriali della città (copia la struttura di un
   blocco esistente, es. Catania):
   ```ts
   {
     citySlug: "bari",
     title: "Costi ristrutturazione bagno a Bari",
     h1: "Quanto costa ristrutturare un bagno a Bari?",
     metaTitle: "Quanto costa ristrutturare un bagno a Bari?",
     metaDescription: "...",
     summary: "...",
     localReading: "...",
     priceInterpretation: "...",
     typicalCases: ["...", "...", "..."],
     localFactors: ["...", "...", "..."],
     whenPriceGoesUp: ["...", "...", "..."],
     whatToAskInQuote: ["...", "...", "..."],
     faq: [
       { question: "...", answer: "..." },
       { question: "...", answer: "..." },
     ],
   },
   ```
   Regole per questo blocco:
   - **Non mettere mai il nome della città come campo separato**: viene preso
     da `geo/cities.ts` tramite `citySlug` nel composer.
   - **Non mettere mai un `canonicalPath`**: viene calcolato da
     `engine/canonical.ts`.
   - **Non mettere mai un range di prezzo diverso da quello nazionale** dentro
     `summary`/`priceInterpretation` a meno che il prezzo nazionale stesso non
     sia cambiato in `market-data/base-price-ranges.ts` — il testo può
     riferirsi al range nazionale in prosa, ma non deve inventarne uno nuovo.
   - Il testo deve essere editoriale e specifico della città (non un
     copia-incolla con find&replace del nome): è l'unica parte di questo
     sistema dove la "duplicazione" è accettabile, perché è prosa diversa, non
     dato duplicato.

5. **`pages/costi/ristrutturare-bagno/content.ts`** — **non va toccato**. Il
   composer itera automaticamente su tutte le entry di `local-overrides.ts` e
   le compone con geo/supported-cities/pricing/canonical. Se aggiungi una città
   solo nei tre file sopra, compare automaticamente.

6. Verifica:
   ```bash
   pnpm --filter web typecheck
   pnpm --filter web build
   ```
   Controlla nell'output del build che compaia una nuova pagina statica sotto
   `/costi/ristrutturare-bagno/[citySlug]`.

**Cosa NON fare mai:**
- Non creare un file `bari.ts` o una cartella `bari/` dentro `pages/costi/ristrutturare-bagno/`.
- Non toccare `templates/cost-city-page-template.tsx` o `cost-page-template.tsx`.
- Non scrivere il canonical a mano in nessun file.
- Non duplicare il nome città come stringa libera fuori da `geo/cities.ts`.

---

## Caso 2 — Aggiungere una nuova famiglia "guida costi" (es. `installare-fotovoltaico` sotto `/costi`)

1. Crea la cartella `pages/costi/installare-fotovoltaico/` con quattro file,
   sullo stesso pattern di `ristrutturare-bagno/`:
   - `base.ts` — contenuto nazionale tipizzato `CostGuideBaseContent` (slug,
     funnelSlug, interventionSeoSlug, title, h1, metaTitle, metaDescription,
     heroImage, hubCategory, topicLabel, summary, factors, savingTips).
     Nessuna costante familyKey: la deriva il composer dallo slug.
   - `faq.ts` — FAQ nazionali.
   - `local-overrides.ts` — vuoto `[]` o con le prime città già pronte
     editorialmente (tipo `CityLocalOverride` da `../types`).
   - `content.ts` — una sola chiamata:
     ```ts
     export const installareFotovoltaicoGuide: CostGuide = composeCostGuide({
       base: installareFotovoltaicoBase,
       faq: installareFotovoltaicoFaq,
       localOverrides: installareFotovoltaicoLocalOverrides,
     });
     ```
     Mai logica per famiglia qui: se manca qualcosa, il composer fallisce il
     build con un errore esplicito (market-data assente, tabella prezzi vuota,
     città non registrata, città dichiarata pronta senza contenuto locale).

2. **`market-data/base-price-ranges.ts`** — aggiungi una entry con la chiave
   `"costGuide:installare-fotovoltaico"` (nationalRange, pricePerSquareMeter
   se ha senso per quell'intervento, priceRows, sizeExamples). Senza questa
   entry, o con `priceRows` vuoto, il build fallisce: una guida costi senza
   tabella prezzi reale non è pubblicabile.

3. **`market-data/city-price-index.ts`** — aggiungi una entry con la stessa
   chiave, anche vuota `[]` se non hai ancora città per questa famiglia.

4. **`geo/supported-cities.ts`** — aggiungi una entry con la stessa chiave per
   le città che vuoi supportare (puoi riusare le città già in `geo/cities.ts`
   senza duplicarle).

5. **`pages/costi/index.ts`** — aggiungi la guida all'array `all`:
   ```ts
   import { installareFotovoltaicoGuide } from "./installare-fotovoltaico/content";
   const all: readonly CostGuide[] = [ristrutturareBagnoGuide, installareFotovoltaicoGuide];
   ```
   Non toccare altro in questo file: resta solo registry, non deve contenere
   business logic (quella vive in `engine/geo-policy.ts`).

6. Non serve toccare `engine/static-params.ts`, `engine/metadata.ts`,
   `engine/resolve-seo-page.ts`, le route in `app/costi/**` o i template: sono
   già generici per qualunque famiglia registrata in `pages/costi/index.ts`.

7. Verifica con `pnpm --filter web typecheck && pnpm --filter web build`.

---

## Caso 3 — Aggiungere un nuovo intervento (`/interventi/<slug>`)

Oggi `pages/interventi/<slug>/content.ts` è un file unico senza varianti città
(non esiste `/interventi/<slug>/[citySlug]`). Per aggiungere un nuovo
intervento:

1. Crea `pages/interventi/<nuovo-slug>/content.ts` seguendo lo schema di un
   file esistente (es. `rifare-tetto/content.ts`): nessuna sezione città,
   nessun prezzo per città.
2. Registralo in `pages/interventi/index.ts` nell'array delle landing.
3. I blocchi "forti" della landing (Fase 5: `scopeIncluded`/`scopeExcluded`/
   `scopeNote`, `variants`, `preparationItems`, `groupSlug`,
   `requestCtaLabel`) sono opzionali — il modello di riferimento è
   `ristrutturare-bagno/content.ts`. Regole: linguaggio prudente ("può
   comprendere", "spesso resta fuori"), mai numeri/tempi/permessi nei blocchi,
   `variants` senza prezzi (i numeri restano nella tabella da market-data),
   `groupSlug` solo se l'intervento appartiene davvero a quel ProjectGroup
   (validato fail-fast).

**Non introdurre città dentro un intervento senza prima estendere lo schema**
(oggi `SeoInterventionLanding` non ha un concetto di città). Se serve, è un
cambio di architettura (Phase futura), non un'aggiunta di contenuto.

**Prezzi in `costSection` (Fase 2 — SSOT prezzi):** `costSection` non deve mai
contenere un numero scritto a mano. Se `costSlug` punta a una guida costi
reale in `pages/costi/index.ts`, `costSection.priceRowLabels` può elencare
quali label di `CostGuide.priceRows` mostrare nel riepilogo: i numeri vengono
risolti da `engine/resolve-seo-page.ts` (`resolveInterventionCostSectionPriceData`),
mai duplicati qui. Se non esiste ancora una guida per quella famiglia, non
inventare un range: lascia `costSlug`/`priceRowLabels` assenti e il blocco
prezzo semplicemente non compare nella landing (pattern già esistente in
`geo-cost-module.tsx`, nessun placeholder da scrivere).

---

## Regole vincolanti (valgono per ogni AI/sviluppatore che tocca questa cartella)

1. **Mai un file o una cartella per singola città.** Le città vivono come
   record in `local-overrides.ts`, non come file.
2. **Mai un canonical scritto a mano.** Sempre da `engine/canonical.ts`.
3. **Mai un prezzo città diverso da quello nazionale senza decisione di
   prodotto esplicita.** Il default è `multiplier: 1` in `city-price-index.ts`.
4. **Mai duplicare il nome/provincia/regione di una città fuori da
   `geo/cities.ts`.**
5. **Mai aggiungere business logic dentro `pages/<famiglia>/index.ts` o dentro
   un `content.ts`.** La policy di indicizzabilità vive in
   `engine/geo-policy.ts`.
6. **Mai modificare i `templates/*.tsx` per aggiungere contenuto.** Se un
   template non rende un campo che ti serve, è un segnale che la struttura
   dati va estesa (parlane prima, non improvvisare nel template).
7. **Ogni nuova famiglia/città deve passare `pnpm --filter web typecheck` e
   `pnpm --filter web build`** prima di essere considerata completa: il build
   genera le pagine statiche (`generateStaticParams`) e qualsiasi errore di
   composizione (es. città non registrata in `geo/cities.ts`) fallisce a
   build-time con un errore esplicito (vedi i controlli in `content.ts`).
8. **Nessuna pagina città è pubblica (Fase 5.G).** Vedi la sezione dedicata
   sopra prima di toccare geo/, local-overrides.ts o static-params.ts per
   una città: senza dati locali reali restano disabilitate a prescindere dai
   flag.

## Limiti attuali (non risolverli da soli, sono scope di fasi future)

- Non esiste `site/seo/matrix/` (combinazioni pubblicabili centralizzate): con
  una sola famiglia costi non è ancora necessario.
- Il JSON-LD vive SOLO in `engine/schema-builder.ts` (Fase 5): BreadcrumbList
  dal breadcrumb reale e FAQPage dalle FAQ visibili in pagina. Mai emettere
  rating, review, AggregateRating, offerte, disponibilità, prezzi puntuali o
  LocalBusiness; mai uno schema scritto inline in un template. La sitemap
  (`app/sitemap.ts` + `engine/sitemap.ts`) deriva dai registry: una nuova
  famiglia/città registrata entra in sitemap da sola, non aggiungerla a mano;
  ciò che non passa la policy (draft/thin) non viene generato né entra in
  sitemap.
- Regola funnel `/richiesta/*`: fuori dalla sitemap, meta `noindex, nofollow`
  sulla pagina, nessun canonical/OpenGraph. NON va messo in Disallow dentro
  `app/robots.ts`: la route deve restare crawlabile perché il noindex sia
  leggibile dai crawler. `robots.ts` blocca solo API e aree private/runtime.
- `/interventi/[slug]/[citySlug]` non esiste: gli interventi non hanno ancora
  varianti città.

Se uno di questi limiti blocca il task che ti è stato chiesto, segnalalo
invece di costruire una soluzione ad-hoc che lo elude.
