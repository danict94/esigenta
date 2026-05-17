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

Usare solo token semantici:

- `bg-surface-primary`
- `bg-surface-secondary`
- `bg-surface-tertiary`
- `bg-surface-elevated`
- `text-text-primary`
- `text-text-secondary`
- `text-text-muted`
- `text-text-inverse`
- `border-border-primary`
- `border-border-secondary`
- `border-border-focus`
- `bg-brand-primary`
- `hover:bg-brand-primary-hover`

Vietato usare HEX nelle pagine:

```tsx
bg-[#1abd5e]
text-[#364247]
border-[#e5e7eb]
```

## Tipografia

Usare `tokens.typography`.

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
