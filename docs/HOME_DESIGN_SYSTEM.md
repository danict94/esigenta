# Home Design System

La home pubblica usa il design system come sorgente ufficiale. Le pagine in
`apps/web` devono comporre primitive e recipe, non definire identita visiva.

## Sorgenti

- Colori e variabili regolabili: `packages/ui/src/styles/globals.css`
- Recipe strutturali: `packages/ui/src/styles/tokens.ts`
- Primitive: `Button`, `Input`, `Card`, `CardContent`, `Container`
- Rail applicativo: `apps/web/src/components/layout/home-content-rail.tsx`

## Rail

Il contenuto della home usa `HomeContentRail`, che applica:

- `Container size="full" gutter="sm"`
- `tokens.home.railFrame`
- `tokens.home.rail`

Questo rail allinea le sezioni all'asse del testo della Hero. Gli sfondi possono
essere larghi, ma label, titoli, card, CTA e footer devono partire da questo
rail.

## Hero

La Hero e una composizione a layer:

- `tokens.home.hero.frame` governa larghezza e altezza del frame.
- `tokens.home.hero.lightPanel` governa il pannello chiaro.
- `tokens.home.hero.darkPanel` governa il pannello scuro dietro/destra.
- `tokens.home.hero.titleBlock` e `tokens.home.hero.searchBlock` governano
  l'asse interno del contenuto.
- `tokens.home.hero.image` governa il posizionamento immagine.

Non spostare coordinate della Hero dentro `hero.tsx`: se serve tuning, aggiorna
i token o le variabili CSS.

## Variabili DevTools

Le variabili principali sono in `:root`:

- `--fp-home-rail-max-width`
- `--fp-home-hero-max-width`
- `--fp-home-hero-height`
- `--fp-home-hero-radius`
- `--fp-home-hero-light-width`
- `--fp-home-hero-light-height`
- `--fp-home-hero-dark-left`
- `--fp-home-hero-dark-top`
- `--fp-home-hero-dark-bottom`
- `--fp-home-hero-title-x`
- `--fp-home-hero-title-y`
- `--fp-home-hero-search-x`
- `--fp-home-hero-search-y`
- `--fp-home-hero-image-x`
- `--fp-home-hero-image-y`
- `--fp-home-content-inset-x`
- `--fp-home-section-y`
- `--fp-home-section-y-compact`
- `--fp-home-section-gap`

Da DevTools puoi cambiare questi valori per provare frame Hero piu largo,
altezza piu compatta, dark panel piu basso, rail piu ampio o sezioni piu
ravvicinate.

## Sezioni Home

Per una nuova sezione:

- usa `tokens.home.section` oppure `tokens.home.softSection`
- metti il contenuto dentro `HomeContentRail`
- usa `tokens.home.sectionLabel`, `tokens.home.sectionTitle` e
  `tokens.home.sectionDescription`
- lascia locali solo micro-layout interni, come gap di una card o dimensioni di
  un'immagine contestuale

Non aggiungere HEX, max-width strutturali o coordinate Hero dentro `apps/web`.
