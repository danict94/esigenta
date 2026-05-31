# FixPro / Esigenta — AI Context

## Monorepo

FixPro / Esigenta vive in un pnpm monorepo.

Aree principali:

- `apps/web`: sito pubblico, funnel cliente, area impresa pubblica/protetta, route SEO.
- `apps/admin`: pannello admin/moderazione.
- `packages/ui`: primitive UI condivise.
- `packages/db`: Prisma, taxonomy, funnel runtime, domain logic.

## Regola architetturale principale

Non duplicare responsabilità.

```txt
packages/db = autorità semantica / taxonomy / funnel data
apps/web = route pubbliche, SEO pages, business UI, content layer
packages/ui = primitive UI only
```

## Design system

Usare sempre primitive condivise da `packages/ui` quando disponibili:

- `PageShell`
- `Container`
- `Button`
- `Card`
- `Badge`
- `Input`

Regole:

- niente HEX hardcoded nelle pagine
- niente radius/shadow locali inventati
- niente componenti duplicati
- `className` solo per layout contestuale
- business UI in `apps/web`, non in `packages/ui`

## Taxonomy

La taxonomy è l'autorità semantica.

Livelli:

```txt
sector = area tecnica interna
category = professionista
service = capacità tecnica
intervention = richiesta cliente / funnel
domain = macro-area SEO/catalogo
```

Non confondere category e domain.

`sectorSlug: "impianti"` esiste già, quindi non creare un domain con slug `impianti`.

Domain corretti per la SEO/catalago:

- `ristrutturazione`
- `tetti`
- `idraulica`
- `impianti-elettrici`
- `clima-energia`

## Regola SEO principale

Le card homepage NON devono aprire direttamente il funnel.

Schema corretto:

```txt
Card homepage
→ /interventi/[seoSlug]
→ landing SEO pubblica
→ CTA interna /richiesta/[funnelSlug]
```

La search bar può continuare ad aprire direttamente il funnel.

## Mapping 6 landing principali

```txt
Ristrutturare bagno
SEO slug: ristrutturare-bagno
Funnel slug: rifare-bagno

Rifare impianto elettrico
SEO slug: rifare-impianto-elettrico
Funnel slug: impianto-elettrico-nuovo

Installare fotovoltaico
SEO slug: installare-fotovoltaico
Funnel slug: installare-fotovoltaico

Rifare tetto
SEO slug: rifare-tetto
Funnel slug: rifare-tetto

Installare climatizzatore
SEO slug: installare-climatizzatore
Funnel slug: installare-climatizzatore

Cartongesso e finiture
SEO slug: cartongesso-e-finiture
Funnel slug: fare-lavori-cartongesso
```

## Funnel

Il funnel pubblico vive su:

```txt
/richiesta/[slug]
```

Il funnel accetta solo `intervention.slug` canonici.

Non usare service/category/domain slug come funnel slug.

## SEO rules

Non creare:

- pagine geo duplicate
- `/interventi/[slug]-[city]`
- `/costi/[slug]-[city]`
- pagine costo per ogni micro-servizio
- pagine profilo professionista vuote
- domain automatici per ogni cluster

Geo deve essere dinamica dentro la pagina, non generare migliaia di URL.

## Robots / noindex

Le pagine funnel sono conversione, non SEO.

Regola futura:

```txt
/richiesta/[slug] = noindex, follow
```

Non bloccare `/richiesta/` da robots.txt se serve far leggere a Google il meta `noindex`.

## Open Graph

Ogni pagina SEO pubblica deve avere:

- title
- description
- canonical
- openGraph title
- openGraph description
- openGraph image default
- openGraph type

## Coding rules

- Server Components di default.
- Client Components solo se servono state, eventi o browser APIs.
- TypeScript strict.
- Niente `any` casuali.
- Niente duplicazione taxonomy in UI.
- Niente business logic in `packages/ui`.

## Comandi utili

```powershell
pnpm --filter web typecheck
pnpm.cmd --dir packages/db typecheck
pnpm.cmd --dir packages/db exec tsx src/taxonomy/orchestrator/build-taxonomy.ts
```

## Prima di modificare

Ogni task deve:

1. leggere questo file
2. leggere `docs/FIXPRO_ESIGENTA_SEO_SYSTEM_2026.md`
3. rispettare lo scope
4. non anticipare step futuri
5. mostrare diff finale

````

---

## 4. Commit docs

```powershell
git add docs\FIXPRO_ESIGENTA_SEO_SYSTEM_2026.md docs\AI_CONTEXT_FIXPRO.md
git diff --cached --stat
git commit -m "Document SEO system and AI context"
````
