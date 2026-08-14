# Esigenta Design System

Questo documento congela la nuova base visiva Esigenta. La Home e' la fonte
di riferimento per tono, ritmo, tipografia e uso dei token. Le altre pagine
vanno riallineate una alla volta usando questa base, senza ricostruire il
vecchio sistema.

## Token

I token vivono in `packages/ui/src/styles/globals.css` come variabili `--eg-*`
e sono esposti a Tailwind con `@theme inline`.

Colori principali:

- `--eg-calce`, `--eg-calce-2`, `--eg-calce-translucent`
- `--eg-terra`
- `--eg-cotto`, `--eg-cotto-dark`, `--eg-cotto-tint`
- `--eg-salvia`
- `--eg-miele`, `--eg-miele-tint`
- `--eg-verde-conferma`
- `--eg-ardesia`, `--eg-ardesia-2`
- `--eg-hairline`
- `--eg-panel-bg`, `--eg-alert-border`, `--eg-alert-bg`

Altri token:

- shadow: `--eg-shadow-elevation`, `--eg-shadow-slab`,
  `--eg-shadow-elevation-lg`
- radius: `--eg-radius-sm`, `--eg-radius-md`, `--eg-radius-lg`
- typography: `--eg-text-page-title`, `--eg-text-heading`
- font: `--eg-font-primary` (IBM Plex Sans), `--eg-font-mono` (IBM Plex Mono)
- shell: `--eg-nav-height`, `--eg-nav-clear`

In Tailwind si usano come `bg-eg-calce`, `text-eg-terra`,
`border-eg-hairline`, `shadow-eg-slab`, `rounded-eg-lg`,
`text-eg-display`, ecc.

## Cosa puo' stare in globals.css

`globals.css` deve restare piccolo e stabile. Sono ammessi solo:

- token `--eg-*`
- `@theme inline` per esporre token a Tailwind
- base `html` e `body`
- primitive layout: `eg-page`, `eg-page-bg`, `eg-thread`, `eg-section`,
  `eg-section-large`, `eg-section-editorial`, `eg-container`, `eg-container-narrow`,
  `eg-internal-header`
- primitive typography: `eg-eyebrow`, `eg-h1`, `eg-h2`, `eg-h3`, `eg-body`,
  `eg-body-muted`, `eg-page-lede`, `eg-nav-link`, `eg-metadata`,
  `eg-kpi-value`
- primitive buttons: `eg-button-primary`, `eg-button-ghost`
- primitive panels: `eg-panel`
- primitive forms: `eg-form-field`, `eg-form-label`, `eg-form-help`
- primitive alerts: `eg-alert`
- keyframes solo se davvero generici e condivisi

Al momento non ci sono keyframe globali: quelli della Home sono definiti nella
zona Home, per non usare `globals.css` come CSS di una singola pagina.

## Cosa NON deve stare in globals.css

Non aggiungere:

- classi legate a una sezione o pagina specifica
- classi tipo `eg-hub`, `eg-work`, `eg-index`, `eg-proof`,
  `eg-photo-slab`, `eg-header`, `eg-footer`, `eg-search`
- alias temporanei per vecchie pagine
- palette parallele o token `fp-*` / `cantiere`
- layout completi di pagina
- CSS creato solo per evitare di migrare un componente

## Nuova sezione marketing

Le intestazioni delle pagine pubbliche interne usano il componente
`site/shared/InternalPageIntro`: breadcrumb, posizione, H1 e lede non vanno
ricostruiti nei template.

Le CTA usano la recipe condivisa di `packages/ui`: sentence case, altezza e
stati focus/hover non vanno ricostruiti localmente. `eg-button-arrow` aggiunge
la freccia direzionale alle sole azioni di avanzamento; i pulsanti funzionali
e distruttivi non la usano. Il componente `Button` e `buttonClassName`
consumano la stessa recipe CSS. Il colore dei pulsanti deriva esclusivamente
dal token semantico `--eg-color-action`, allineato al Brand chiaro. Il testo
usa Brand strong e l'hover usa `--eg-color-brand-hover`; il rosso `Accent`
resta riservato ai dettagli.
Sulle superfici scure il contenitore usa `eg-theme-dark`: le CTA diventano
chiare automaticamente, senza varianti o colori aggiunti ai singoli pulsanti.
Le superfici editoriali Ink usano `eg-theme-ink`: fondo Ink, testo inverso e
azione Brand. Servizi, Interventi e Costi condividono questa recipe tramite
`MarketingFinalCta`.
La Hero usa `eg-theme-hero`: la CTA della ricerca passa al ciano Brand, mentre
il pannello bianco del form continua a garantirne separazione e contrasto.
Le parole chiave sulle hero scure usano `eg-hero-emphasis`, alimentata dallo
stesso Brand chiaro; non usare quel ciano come testo su fondi chiari.

Il marchio condiviso `EsigentaLogo` usa esclusivamente Brand strong per il
wordmark e Brand per i dettagli del simbolo e del suffisso `.it`. Non usa
Accent: navbar, footer, Area Impresa e Admin ereditano la stessa versione.

Per una nuova sezione:

1. usare `eg-section` o `eg-section-large`; le pagine SEO lunghe usano
   `eg-section-editorial`
2. usare `eg-container` o `eg-container-narrow`
3. usare `eg-eyebrow`, `eg-h2`, `eg-body-muted` per il testo base
4. usare `eg-panel` per superfici incorniciate
5. usare `eg-button-primary` o `eg-button-ghost` per CTA standard
6. comporre layout, griglie e responsive con Tailwind

Esempio:

```tsx
<section className="eg-section">
  <div className="eg-container grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
    <header>
      <p className="eg-eyebrow">Metodo Esigenta</p>
      <h2 className="eg-h2 mt-4">Titolo sezione</h2>
      <p className="eg-body-muted mt-5">Testo di supporto.</p>
    </header>

    <div className="eg-panel p-6">
      Contenuto
    </div>
  </div>
</section>
```

## Tailwind e token

Usa Tailwind per:

- layout
- grid/flex
- spaziature locali
- responsive
- stato hover/focus
- composizione di componenti

Usa token o primitive per:

- colori
- shadow
- radius
- tipografia principale
- superfici ricorrenti
- bottoni standard
- alert e form base

## Regole anti-regressione

- niente vecchie classi globali sezione-specifiche
- niente doppie palette
- niente colori hex hardcoded nei componenti
- niente `rgba()` ripetuti nei componenti
- niente `rounded-[...]`, `shadow-[...]`, `bg-[...]` se sostituibili da token
- niente `globals.css` usato come CSS della singola pagina
- niente compatibilita' visiva col vecchio sistema solo per non migrare una pagina

## Checklist per futura pagina

- usa primitive globali dove esistono
- usa componenti riusabili per sezioni ripetute
- usa token per colori, radius e shadow
- usa Tailwind solo per layout e composizione
- non crea classi globali specifiche
- non importa o ricrea palette locali
- non introduce `fp-*`, `cantiere` o alias legacy
- verifica `pnpm --filter web typecheck`
