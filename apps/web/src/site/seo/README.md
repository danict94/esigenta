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
    geo-policy.ts          — decide se una pagina città è indicizzabile (owner reale)
    resolve-seo-page.ts    — dispatch: data una slug, ritorna il dato della pagina
    metadata.ts             — costruisce title/description/canonical/openGraph
    static-params.ts        — generateStaticParams per le route Next.js
  pages/
    costi/<slug-famiglia>/
      base.ts            — contenuto NAZIONALE (niente città, niente prezzo)
      faq.ts              — FAQ nazionali
      local-overrides.ts  — SOLO i delta editoriali per ogni città supportata
      content.ts           — composer: assembla base+faq+local-overrides+geo+
                              market-data+canonical nell'oggetto finale tipizzato
    interventi/<slug-intervento>/
      content.ts          — oggi un solo file per intervento (nessuna città, vedi
                              "Limiti attuali" più sotto)
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
| Modificatore prezzo per città (oggi neutro) | `market-data/city-price-index.ts` |
| Canonical di una pagina | calcolato da `engine/canonical.ts`, mai scritto a mano |
| Se una pagina città è indicizzabile | deciso da `engine/geo-policy.ts`, mai un campo sparso |
| Testo nazionale di una guida (summary, factors, savingTips...) | `pages/costi/<slug>/base.ts` |
| FAQ nazionali | `pages/costi/<slug>/faq.ts` |
| Testo specifico di UNA città (summary locale, FAQ locali, casi tipici...) | `pages/costi/<slug>/local-overrides.ts` |

---

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
   dall'indicizzazione (vedi `engine/geo-policy.ts`) senza doverla cancellare.

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

1. Crea la cartella `pages/costi/installare-fotovoltaico/` con tre file, sullo
   stesso pattern di `ristrutturare-bagno/`:
   - `base.ts` — contenuto nazionale (slug, funnelSlug, interventionSeoSlug,
     title, h1, metaTitle, metaDescription, summary, factors, savingTips) +
     una costante `<nome>FamilyKey = "costGuide:installare-fotovoltaico"`.
   - `faq.ts` — FAQ nazionali.
   - `local-overrides.ts` — vuoto `[]` o con le prime città già pronte editorialmente.
   - `content.ts` — composer, **copia quasi identica** di
     `ristrutturare-bagno/content.ts`, cambiando solo gli import dei tre file
     sopra e il `familyKey`. Non inventare logica nuova qui.

2. **`market-data/base-price-ranges.ts`** — aggiungi una entry con la chiave
   `"costGuide:installare-fotovoltaico"` (nationalRange, pricePerSquareMeter
   se ha senso per quell'intervento, priceRows, sizeExamples).

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

**Non introdurre città dentro un intervento senza prima estendere lo schema**
(oggi `SeoInterventionLanding` non ha un concetto di città). Se serve, è un
cambio di architettura (Phase futura), non un'aggiunta di contenuto.

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

## Limiti attuali (non risolverli da soli, sono scope di fasi future)

- Non esiste `site/seo/matrix/` (combinazioni pubblicabili centralizzate): con
  una sola famiglia costi non è ancora necessario.
- Non esiste `engine/schema-builder.ts` (JSON-LD) né `engine/sitemap.ts`
  (sitemap dinamica): nessuna pagina SEO oggi emette estructured data o entra
  in una sitemap generata.
- `/interventi/[slug]/[citySlug]` non esiste: gli interventi non hanno ancora
  varianti città.

Se uno di questi limiti blocca il task che ti è stato chiesto, segnalalo
invece di costruire una soluzione ad-hoc che lo elude.
