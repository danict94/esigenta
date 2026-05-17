# FixPro Design System Audit

## Stato

Il design system FixPro vive in `packages/ui`.

File auditati:

- `packages/ui/src/styles/globals.css`
- `packages/ui/src/styles/tokens.ts`
- `packages/ui/src/layout/container.tsx`
- `packages/ui/src/layout/page-shell.tsx`
- `packages/ui/src/components/input.tsx`
- `packages/ui/src/components/card.tsx`
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/badge.tsx`

## Problema iniziale

La struttura era corretta, ma non ancora abbastanza centralizzata.

Esistevano già tokens, layout primitives e componenti UI, però alcuni valori erano duplicati direttamente nei componenti:

- `Container` ridefiniva le dimensioni già presenti in `tokens.containers`.
- `Container` ridefiniva il padding già presente in `tokens.spacing.containerX`.
- `PageShell` usava padding verticale hardcoded.
- `Card` usava radius hardcoded invece di token.
- `Button` usava radius hardcoded invece di token.

Questa duplicazione rende più facile per l'AI creare nuove pagine con stili locali e più difficile cambiare look globale in modo sicuro.

## Bonifica applicata

La bonifica è intenzionalmente minima.

Non cambia business logic.
Non cambia DB.
Non cambia auth.
Non cambia routing.
Non cambia Stripe/crediti.
Non cambia il look in modo intenzionale.

### `tokens.ts`

Aggiunti export type derivati dai tokens:

- `ContainerToken`
- `RadiusToken`
- `SpacingToken`
- `TypographyToken`
- `ShadowToken`

Aggiunto:

- `spacing.pageShell`

per evitare padding pagina hardcoded in `PageShell`.

### `container.tsx`

Ora usa:

- `tokens.containers[size]`
- `tokens.spacing.containerX`

Non mantiene più una mappa locale duplicata.

### `page-shell.tsx`

Ora usa:

- `tokens.spacing.pageShell`

invece di duplicare `py-10 md:py-12`.

### `card.tsx`

Ora usa:

- `tokens.radius.lg`

Aggiunti subcomponenti riutilizzabili:

- `CardHeader`
- `CardContent`
- `CardFooter`
- `CardTitle`
- `CardDescription`

Servono a evitare che ogni pagina ricrei header/body/footer delle card con classi custom.

### `button.tsx`

Ora usa:

- `tokens.radius.md`

Aggiunta prop `size` con default `md`.

Varianti esistenti preservate:

- `primary`
- `secondary`

### `badge.tsx`

Aggiunta prop `size` con default `md`.

Varianti esistenti preservate:

- `neutral`
- `success`
- `warning`
- `danger`

## Regola architetturale

Le pagine devono comporre componenti, non definire design.

Corretto:

```tsx
<PageShell>
  <Card>
    <CardHeader>
      <CardTitle>Titolo</CardTitle>
      <CardDescription>Descrizione</CardDescription>
    </CardHeader>
    <CardContent>
      Contenuto
    </CardContent>
  </Card>
</PageShell>
```

Da evitare:

```tsx
<main className="min-h-screen py-10 md:py-12">
  <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
    <div className="rounded-lg border border-border-primary bg-surface-elevated p-6">
      ...
    </div>
  </div>
</main>
```

## Cosa resta da fare

Questa bonifica stabilizza il nucleo, ma non completa tutto il design system.

Prossimi step consigliati:

1. Creare componenti tipografici:
   - `PageHeader`
   - `SectionHeader`
   - `Heading`
   - `Text`
   - `Eyebrow`

2. Creare componenti form:
   - `Field`
   - `Label`
   - `Textarea`
   - `Select`
   - `FormError`

3. Fare audit delle pagine in:
   - `apps/web`
   - `apps/admin`

4. Cercare e sostituire pattern custom:
   - button locali
   - input locali
   - card locali
   - container locali
   - colori HEX
   - `max-w-* px-4 md:px-6 lg:px-8` duplicati

## Criterio di accettazione

Una nuova pagina è accettabile solo se:

- usa `PageShell` o un layout primitive equivalente;
- usa `Container` quando serve larghezza/padding;
- usa `Button`, `Input`, `Card`, `Badge` da `packages/ui`;
- non ridefinisce colori, radius, bottoni, card o input localmente;
- eventuali eccezioni sono motivate e rare.
