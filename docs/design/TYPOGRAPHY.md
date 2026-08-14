# TYPOGRAPHY

Sistema tipografico applicativo di Esigenta. La fonte di verita runtime e in
`packages/ui`: i documenti e i prototipi HTML sotto `docs/` non caricano font
nel prodotto.

## Famiglie attive

Web e Admin caricano soltanto due web font tramite `next/font/google`:

| Token | Famiglia | Ruolo |
|---|---|---|
| `--eg-font-primary` | IBM Plex Sans | Primary Typeface: display, contenuti e UI |
| `--eg-font-mono` | IBM Plex Mono | Technical Accent: microcopy e dati tecnici |

Le email HTML non usano questi web font: il loro stack resta
`Arial, sans-serif`.

## Loader e applicazione

- `packages/ui/src/fonts/primary-font.ts` carica IBM Plex Sans nei pesi
  400, 500, 600 e 700.
- `packages/ui/src/fonts/mono-font.ts` carica IBM Plex Mono nei pesi
  400, 500, 600 e 700.
- `packages/ui/src/fonts/index.ts` espone `fontVariables`.
- i root layout Web e Admin applicano `fontVariables` all'elemento `html`.
- `packages/ui/src/styles/globals.css` collega i token a Tailwind e alle
  primitive condivise.

I font sono self-hosted da Next nell'output applicativo. I fallback generici
sono definiti centralmente come `sans-serif` per Primary e `monospace` per
Mono.

## Primary Typeface — IBM Plex Sans

IBM Plex Sans e la voce principale del prodotto e il font predefinito del
`body`.

Viene usato per:

- Hero H1, H1, H2 e H3 editoriali;
- titoli di card;
- body copy, lede, guide e FAQ;
- navbar, footer e link ordinari;
- CTA e pulsanti;
- label form, input, textarea, select e placeholder;
- messaggi, alert e normale interfaccia Web/Admin.

Le primitive principali sono `eg-h1`, `eg-h2`, `eg-h3`, `eg-body`,
`eg-body-muted`, `eg-nav-link`, `eg-shell-nav-link`, `eg-footer`,
`eg-form-label`, `eg-form-help`, `eg-alert` e il componente `Button`.

Le primitive `eg-h1`, `eg-h2` ed `eg-h3` usano tutte il peso 600. La
gerarchia tra i titoli dipende dalla scala, dal line-height e dallo spazio,
non da override locali del peso.

## Technical Accent — IBM Plex Mono

IBM Plex Mono e un accento semantico, non decorativo. Viene usato con
parsimonia per:

- eyebrow e kicker;
- numerazioni come `01 / 02 / 03`;
- badge, categorie tecniche e piccoli label;
- metadata, identificatori e status;
- KPI e valori tecnici;
- header di tabella tecnici;
- panel header e microcopy tecnico.

Le primitive principali sono `eg-eyebrow`, `eg-list-index`,
`eg-list-status`, `eg-metadata`, `eg-kpi-value`, `eg-stat-value`,
`eg-table-label`, `eg-panel-header`, `eg-step-label`, `eg-chip-text` e il
componente `Badge`.

IBM Plex Mono non e il font dei grandi titoli, dei titoli card ordinari,
delle FAQ, del body copy, della navbar o delle CTA normali. Un prezzo resta
Primary salvo che rappresenti davvero un dato tecnico nel contesto.

## Regole

1. Le sole variabili di famiglia applicative sono `--eg-font-primary` e
   `--eg-font-mono`.
2. Non introdurre alias come `font-brand`, `font-ui`, `font-heading` o
   `font-display` per rappresentare le stesse famiglie.
3. I nomi reali dei font rimangono confinati ai loader in
   `packages/ui/src/fonts/`.
4. La famiglia va scelta per ruolo semantico, non per il tag HTML o per una
   somiglianza visiva.
5. Le scale locali esistenti possono restare nei template quando rispondono
   a densita differenti; una recipe ripetuta e stabile va invece promossa a
   primitiva condivisa.
6. Non caricare web font nei template email.

## Debito locale noto

Le intestazioni delle pagine pubbliche interne condividono `eg-h1` tramite
`InternalPageIntro`. I template mantengono scale locali soltanto per heading
di sezione, card, CTA e tabelle quando la densita del contenuto lo richiede.

L'Admin eredita IBM Plex Sans correttamente, ma compone ancora molte scale
con utility Tailwind locali. Non e un terzo sistema di font e non introduce
altre famiglie.

I prototipi HTML isolati sotto `docs/` possono dichiarare font propri per il
loro rendering statico. Non costituiscono la SSOT e non sono importati dal
runtime Web/Admin.
