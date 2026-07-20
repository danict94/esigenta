# TYPOGRAPHY

Documentazione del sistema tipografico di Esigenta, valida a partire dalla bonifica tipografica (fasi 1-22). Fonte di verità per come è oggi implementato in `packages/ui`.

---

## Token di font

Due soli token semantici, definiti in `packages/ui/src/styles/globals.css`:

| Token | Ruolo |
|---|---|
| `--eg-font-brand` | Identità di marca: titoli (`eg-h1`/`eg-h2`/`eg-h3`), corpo testo, contenuto editoriale. Font di default del `<body>`. |
| `--eg-font-ui` | Interfaccia: navigazione, controlli, badge, metadati, azioni, etichette. Mai usato per titoli o contenuto editoriale. |

Nessun terzo font è attivo. Il sistema è deliberatamente limitato a 2 font per non introdurre incoerenza visiva.

## Font reali

I font reali sono configurati **esclusivamente** in `packages/ui/src/fonts/`, mai altrove:

- `packages/ui/src/fonts/brand-font.ts` — carica il font di marca (`next/font/google`), esporta `brandFont`, imposta la variabile CSS `--font-brand`.
- `packages/ui/src/fonts/ui-font.ts` — carica il font UI (`next/font/google`), esporta `uiFont`, imposta la variabile CSS `--font-ui`.
- `packages/ui/src/fonts/index.ts` — barrel: esporta `brandFont`, `uiFont` e `fontVariables` (stringa combinata delle due classi `variable`).

`apps/web` e `apps/admin` importano **solo** `fontVariables` da `@esigenta/ui/fonts` nel proprio `layout.tsx` root — non chiamano mai direttamente `next/font/google`, non conoscono quale font reale sia in uso.

`--eg-font-brand` e `--eg-font-ui` referenziano `--font-brand`/`--font-ui` (generati dai file sopra), mai il nome del font. Questo disaccoppiamento significa che **cambiare il font reale (marca o UI) richiede modificare un solo file** in `packages/ui/src/fonts/` — nessun altro file nel monorepo deve cambiare.

## Regole vincolanti

1. **Mai il nome reale di un font** in CSS o JSX al di fuori di `packages/ui/src/fonts/` (niente `"Dosis"`, `"Source Sans 3"` hardcoded altrove).
2. **Mai `font-mono`** — l'utility Tailwind e il bridge `--font-mono` sono stati rimossi da `globals.css`; non esiste più un mapping che lo faccia risolvere a `--eg-font-ui`. Se reintrodotto, cadrebbe sul monospace di default del browser — un segnale visivo immediato dell'errore.
3. **Mai dichiarazioni tipografiche locali duplicate nel JSX.** Se una ricetta (font-family + eventuali size/tracking/color) si ripete con un ruolo stabile, va centralizzata come classe semantica in `globals.css`, raggruppando i selettori dove le dichiarazioni coincidono — mai duplicando CSS.
4. **Riuso solo per ruolo reale**, mai per coincidenza visiva: due elementi con lo stesso aspetto ma ruoli semantici diversi (es. un indice numerico vs una data) restano primitive separate, anche se condividono proprietà CSS.

## Primitive tipografiche semantiche

Tutte definite in `packages/ui/src/styles/globals.css`, `@layer components`. Font `--eg-font-ui` salvo dove indicato.

| Classe | Ruolo | Note |
|---|---|---|
| `eg-eyebrow` | Kicker/eyebrow sopra un titolo di sezione | Uppercase, 12px, tracking 0.12em |
| `eg-nav-link` | Link di navigazione strutturale (navbar, footer, `<nav>` con `aria-label`) | Hover scoping su `a`, non sul contenitore |
| `eg-action-link` | Link di azione/wayfinding inline nei contenuti (CTA "Scopri di più →") | Distinta da `eg-nav-link` |
| `eg-divider-label` | Etichetta su un divisore ("oppure") | |
| `eg-metric-label` | Etichetta sopra un valore di costo/metrica | |
| `eg-table-label` | Categoria e intestazioni colonna in tabelle prezzi | |
| `eg-scope-tag` | Tag "Include"/"Escluso" | |
| `eg-list-index` | Indice ordinale in una riga di lista ("01", "02"...) | 12px, tracking 0.12em, colore accento |
| `eg-list-status` | Stato/azione a fine riga lista ("Apri →", conteggi) | 11px, colore default muto, colore sovrascrivibile localmente |
| `eg-doc-meta` | Metadato di revisione documento ("Ultimo aggiornamento") | |
| `eg-shell-nav-link` | Link di navigazione primaria in un header applicativo (admin) | Diverso da `eg-nav-link`: peso, tracking e hover propri |
| `eg-footer` | Tipografia di default del footer | |
| `eg-pro-tag` | Tag "/ pro" accanto al wordmark | Font content (`--eg-font-brand`), non UI — eccezione di identità |
| `eg-form-eyebrow` | Eyebrow specifico nei form | |
| `eg-form-label` | Label standard di campo form | **Font Brand**, non UI |
| `eg-step-label` | Legend/label di step numerato in form multi-step | |
| `eg-index-tag` | Indice numerico decorativo (non in lista) | Solo font-family + colore, size locale |
| `eg-stat-value` | Valore numerico grande in una strip statistiche | Distinta da `eg-kpi-value` (dimensioni/tracking diversi) |
| `eg-field-caption` | Caption sotto un valore di campo (es. "telefono"/"email") | Solo font-family + colore |
| `eg-chip-text` | Base tipografica di un chip/tag pillola | Colore lasciato alle varianti locali |
| `eg-ui-muted` | Testo UI secondario generico | |
| `eg-metadata` | Data, contatori, informazioni accessorie | |
| `eg-kpi-value` | Valore numerico grande in una dashboard KPI | |
| `eg-panel-header` | Barra header di un pannello/step form | |
| `eg-status-label` | Stato di una voce (es. stato categoria cookie) | Distinta da `eg-metadata`/`eg-doc-meta`: stesso CSS di `eg-eyebrow`, ruolo "stato" non "eyebrow" o "metadato documento" |
| `eg-button-primary` / `eg-button-ghost` | Bottoni (via `packages/ui/src/components/button.tsx`) | |
| `Badge` (componente) | Badge (via `packages/ui/src/components/badge.tsx`) | |

Alcune primitive condividono dichiarazioni CSS identiche (es. `eg-eyebrow`/`eg-divider-label`/`eg-metric-label`) — sono raggruppate negli stessi selettori in `globals.css`, mai duplicate, pur restando nomi distinti per ruolo.

---

*Documento generato al termine della bonifica tipografica (fasi 1-22). Aggiornare se si introducono nuovi ruoli tipografici stabili o si modifica la struttura dei font in `packages/ui/src/fonts`.*
