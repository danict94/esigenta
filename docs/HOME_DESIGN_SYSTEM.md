# Home Design System

La home pubblica usa il design system come sorgente ufficiale. Le pagine in
`apps/web` devono comporre primitive e recipe, non definire identita visiva.

## Sorgenti

- Colori e variabili regolabili: `packages/ui/src/styles/globals.css`
- Recipe strutturali: `packages/ui/src/styles/tokens.ts`
- Primitive: `Button`, `Input`, `Card`, `CardContent`, `Container`
- Rail applicativo: `apps/web/src/components/layout/home-content-rail.tsx`

## Palette Home

Hero e top nav consumano la palette globale, non colori locali:

- superficie nav: `bg-surface-elevated`
- superficie hero: `bg-surface-muted`
- testo principale: `text-text-primary`
- accento logo, link hover e CTA: `text-accent-warm`, `bg-accent-warm`
- bordi search/input: `border-border-soft`
- focus ring: `ring-accent-warm`

Gli alias legacy `brand-primary`, `action-primary` e `primary-purple` sono
mantenuti solo per compatibilita e risolti dalla palette globale.

## Tipografia Home

La home eredita il tracking globale Canva-style da
`--fp-letter-spacing-canvas`. La stessa spaziatura si applica a Hero, top nav,
search e testi delle sezioni tramite il design system; non va ridefinita nelle
pagine.

## Rail

Il contenuto della home usa `HomeContentRail`, che applica:

- `Container size="full" gutter="sm"`
- `tokens.home.railFrame`
- `tokens.home.rail`

Il rail eredita la larghezza ufficiale da `Container`. La compattezza laterale
della home dipende da `--fp-container-max-width`, non da `max-width` locali nelle
sezioni.

## Hero

La Hero home e una composizione centrata e compatta, ispirata al mockup Canva.

- `tokens.home.hero.root` governa la superficie muted della sezione.
- `tokens.home.hero.container` governa altezza, padding verticale e
  allineamento.
- `tokens.home.hero.title`, `titleAccent` e `question` governano ritmo
  tipografico.
- `tokens.home.hero.searchWrap`, `searchForm`, `searchInput` e `searchSubmit`
  governano la search bar.
- `tokens.home.hero.suggestions` e token collegati governano autocomplete,
  stati e messaggi.

La Hero non contiene immagine, trust badge o copy secondari extra. La search
continua a consumare `/api/taxonomy/search` e ad aprire il funnel
`/richiesta/[slug]`.

## Variabili DevTools

Le variabili principali sono in `:root`:

- `--fp-container-max-width`
- `--fp-container-padding-inline`
- `--fp-container-padding-inline-mobile`
- `--fp-home-hero-min-height`
- `--fp-home-hero-title-max-width`
- `--fp-home-hero-search-width`
- `--fp-home-content-inset-x`
- `--fp-home-section-y`
- `--fp-home-section-y-compact`
- `--fp-home-section-gap`

Da DevTools puoi cambiare questi valori per provare container piu compatto,
altezza hero piu sostenibile, search bar piu larga o sezioni piu ravvicinate.

## Sezioni Home

Per una nuova sezione:

- usa `tokens.home.section` oppure `tokens.home.softSection`
- metti il contenuto dentro `HomeContentRail`
- usa `tokens.home.sectionLabel`, `tokens.home.sectionTitle` e
  `tokens.home.sectionDescription`
- lascia locali solo micro-layout interni, come gap di una card o dimensioni di
  un'immagine contestuale

Non aggiungere HEX, max-width strutturali o coordinate Hero dentro `apps/web`.
