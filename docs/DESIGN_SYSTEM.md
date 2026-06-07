# FixPro Design System

## Principio

Il design di FixPro non deve vivere nelle singole pagine.

Il design vive in:

- `packages/ui/src/styles/globals.css`
- `packages/ui/src/styles/tokens.ts`
- `packages/ui/src/layout/*`
- `packages/ui/src/components/*`

Le pagine devono solo comporre primitive UI già esistenti.

## Sorgenti ufficiali

### CSS variables e Tailwind theme

File:

```txt
packages/ui/src/styles/globals.css
```

Contiene:

- colori surface
- colori testo
- colori border
- colori brand
- shadow globale
- mapping `@theme inline` per Tailwind

I valori HEX devono stare qui, non nelle pagine.

### Tokens TypeScript

File:

```txt
packages/ui/src/styles/tokens.ts
```

Contiene:

- larghezze container
- radius
- spacing
- typography
- shadows

Se una classe Tailwind rappresenta una decisione di design globale, deve stare qui.

## Layout primitives

### `PageShell`

Wrapper pagina standard.

Usare per la maggior parte delle pagine.

```tsx
<PageShell size="lg">
  ...
</PageShell>
```

Non duplicare manualmente:

```tsx
<main className="min-h-screen py-10 md:py-12">
```

### `Container`

Wrapper larghezza/padding.

```tsx
<Container size="lg">
  ...
</Container>
```

Non duplicare manualmente:

```tsx
<div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
```

## Componenti UI obbligatori

### Button

Usare sempre `Button`.

```tsx
<Button>Continua</Button>
<Button variant="secondary">Annulla</Button>
<Button size="lg">Richiedi preventivo</Button>
```

Non creare bottoni locali con Tailwind.

Se serve un nuovo stile, aggiungere una variant in `button.tsx`.

### Input

Usare sempre `Input`.

```tsx
<Input placeholder="Cerca..." />
```

Non creare input locali con Tailwind.

### Card

Usare `Card` e subcomponenti.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
    <CardDescription>Descrizione</CardDescription>
  </CardHeader>
  <CardContent>
    Contenuto
  </CardContent>
  <CardFooter>
    Azioni
  </CardFooter>
</Card>
```

Non creare card locali con `rounded`, `border`, `bg` ripetuti nelle pagine.

### Badge

Usare sempre `Badge`.

```tsx
<Badge>Nuovo</Badge>
<Badge variant="success">Attivo</Badge>
<Badge variant="danger">Errore</Badge>
```

Non creare pill/status locali con `span` custom.

## Uso di `className`

`className` è ammesso per layout contestuale.

Ammesso:

```tsx
<Button className="w-full md:w-auto" />
<Card className="mt-6" />
```

Da evitare:

```tsx
<Button className="bg-red-500 rounded-full h-16 text-lg" />
<Card className="border-purple-500 bg-yellow-50 shadow-2xl" />
```

Se serve cambiare identità visiva, modificare il componente in `packages/ui`.

## Colori

La palette globale e definita in `packages/ui/src/styles/globals.css`. I valori
fisici vivono li; in `apps/web` si usano solo token semantici.

| Ruolo | Token utility | Variabile sorgente | Uso |
| --- | --- | --- | --- |
| Surface base | `bg-surface-base` | `--fp-color-surface-base` | superfici bianche pure |
| Surface primary | `bg-surface-primary` | `--fp-color-surface-primary` | background applicativo quasi bianco |
| Surface muted | `bg-surface-muted` | `--fp-color-surface-muted` | sezioni leggere, inclusa Hero home |
| Surface subtle | `bg-surface-subtle` | `--fp-color-surface-subtle` | alias muted per compatibilita semantica |
| Text primary | `text-text-primary` | `--fp-color-text-primary` | titoli, logo text, copy principale |
| Text secondary | `text-text-secondary` | `--fp-color-text-secondary` | copy secondario |
| Border soft | `border-border-soft` | `--fp-color-border-soft` | search, input e bordi leggeri |
| Accent warm | `text-accent-warm`, `bg-accent-warm` | `--fp-color-accent-warm` | accento Canva-style, CTA e logo accent |
| Decorative purple | `text-decorative-purple`, `bg-decorative-purple` | `--fp-color-decorative-purple` | timeline, step e dettagli decorativi futuri |

`brand-primary`, `action-primary` e il vecchio `primary-purple` restano token di
compatibilita, ma non rappresentano piu il bordeaux legacy.

Usare solo token semantici:

- `bg-surface-base`
- `bg-surface-primary`
- `bg-surface-muted`
- `bg-surface-subtle`
- `bg-surface-secondary`
- `bg-surface-tertiary`
- `bg-surface-elevated`
- `text-text-primary`
- `text-text-secondary`
- `text-text-muted`
- `text-text-inverse`
- `border-border-primary`
- `border-border-secondary`
- `border-border-soft`
- `border-border-focus`
- `bg-brand-primary`
- `hover:bg-brand-primary-hover`
- `text-accent-warm`
- `bg-accent-warm`
- `hover:bg-accent-warm-hover`
- `text-decorative-purple`
- `bg-decorative-purple`

Vietato usare HEX nelle pagine:

```tsx
bg-[#1abd5e]
text-[#364247]
border-[#e5e7eb]
```

### Colori scuri

Le aree scure del sito usano solo due neutrali fondamentali:

- `--fp-color-neutral-black`
- `--fp-color-neutral-anthracite`

Uso previsto:

- nero: testo molto forte o superfici davvero nere se necessario;
- antracite: footer, CTA scure, sezioni scure e superfici scure principali.

Non creare tonalità scure locali o derivate dalla reference visuale.

Vietato introdurre token o classi come:

```txt
darkSoft
darkMuted
footerGray
canvasDark
screenshotBlack
almostBlack
heroDark
darkSurface2
darkSurface3
bg-[#111111]
bg-[#181818]
bg-[#222222]
bg-[#2a2a2a]
bg-[#303030]
```

Se serve uno sfondo scuro usare:

```tsx
bg-surface-dark
```

Se serve testo chiaro su sfondo scuro usare:

```tsx
text-text-inverse
```

## Tipografia

Usare `tokens.typography`.

Il tracking tipografico globale segue la reference Canva-style:

- sorgente: `--fp-letter-spacing-canvas`
- valore: `-0.06em`
- applicazione: `body` e testo con classi Tailwind/componenti

I token Tailwind `tracking-tight`, `tracking-normal`, `tracking-wide`,
`tracking-wider` e `tracking-widest` sono rimappati allo stesso valore globale
per evitare conflitti visivi. Evitare tracking locali nelle pagine; se serve
una variazione intenzionale va introdotta come token nel design system.

Pattern disponibili:

- `tokens.typography.hero`
- `tokens.typography.title`
- `tokens.typography.subtitle`
- `tokens.typography.body`
- `tokens.typography.caption`

Se un pattern titolo/testo appare più volte, creare un componente tipografico in `packages/ui`.

## Regole per AI assistant

Prima di creare o modificare una pagina, l'AI deve controllare:

- esiste già un componente in `packages/ui`?
- sto duplicando un bottone?
- sto duplicando una card?
- sto duplicando un input?
- sto duplicando container o page shell?
- sto usando colori hardcoded?
- sto usando radius o shadow locali?
- questa modifica erediterà futuri cambi globali?

Se la risposta è no, la patch non è accettabile.

## Divieti

L'AI non deve:

1. creare bottoni custom nelle pagine;
2. creare input custom nelle pagine;
3. creare card custom nelle pagine;
4. usare colori HEX in `apps/web` o `apps/admin`;
5. duplicare container layout;
6. creare token locali dentro una pagina;
7. cambiare look globale da una pagina singola;
8. aggiungere stili una tantum se il pattern è riutilizzabile.

## Checklist prima del commit

Eseguire:

```bash
pnpm typecheck
```

Controllare:

```bash
git diff -- packages/ui apps/web apps/admin docs
```

Il diff non deve introdurre nuovi pattern custom duplicati.
