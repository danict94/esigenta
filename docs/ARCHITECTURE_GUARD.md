# ARCHITECTURE_GUARD.md

> **⚠ DEPRECATED — 2026-06-12**
> Questo documento descriveva un'architettura precedente dove `packages/db` conteneva tutta la business logic. È ora superato da:
> `docs/architetture/PACKAGES_REWRITE_REFACTOR_CONTRACT.md`
> Non leggere per decisioni operative — usare il CONTRACT.

---

# Esigenta Architecture Contract

Version: 1.0

Questo documento è vincolante.

Ogni modifica deve rispettare queste regole.

In caso di conflitto tra codice esistente e questo documento, prevale questo documento.

---

# Mission

Esigenta è un monorepo basato su:

* pnpm
* turbo
* Next.js
* TypeScript strict
* Prisma
* packages condivisi

L'obiettivo non è mantenere compatibilità con implementazioni storiche.

L'obiettivo è mantenere:

* chiarezza
* performance
* ownership
* scalabilità
* prevedibilità

---

# Layer Ownership

## apps/web

Responsabilità:

* route
* page.tsx
* layout.tsx
* loading.tsx
* error.tsx
* UI feature components
* form handling
* pending state
* redirect tecnici

Una pagina deve limitarsi a:

1. leggere params
2. ottenere actor
3. chiamare un page model
4. renderizzare

Pattern corretto:

```ts
const actor = await getActor()

const model =
  await getCompanyRequestDetailPageModel({
    actor,
    requestId,
  })

return <PageView model={model} />
```

Non deve contenere:

* Prisma
* query SQL
* business logic
* authorization logic
* policy logic
* matching logic
* conversation logic
* unlock logic
* email logic
* orchestration logic

---

## packages/db

Contiene il prodotto.

Responsabilità:

* read models
* commands
* repositories
* policies
* authorization
* transactions
* DTO
* domain services
* side effects

Tutte le decisioni di business vivono qui.

---

## packages/ui

Contiene solo UI.

Responsabilità:

* Button
* Card
* Input
* Dialog
* Skeleton
* Container
* Badge
* Table
* UI primitives

Vietato:

* Prisma
* auth
* business logic
* dominio Esigenta

---

# Feature Ownership

Ogni feature deve avere un owner chiaro.

Esempio:

```text
packages/db/src/domains/requests/

  read-models/
  commands/
  policies/
  dto/
  repositories/
```

Non sono ammessi file di dominio sparsi senza ownership evidente.

Quando si apre una cartella deve essere immediatamente chiaro:

"questa feature vive qui".

---

# Read Model Rule

Ogni pagina significativa deve avere un read model dedicato.

Esempio:

```text
getCompanyRequestsPageModel()

getCompanyRequestDetailPageModel()

getCompanyConversationThreadPageModel()
```

Le page non assemblano dati.

I read model restituiscono dati pronti per il rendering.

---

# Command Rule

Le modifiche dati avvengono tramite command.

Esempio:

```text
contactCustomerForRequest()

sendConversationMessage()

unlockRequest()
```

Le server action non contengono business logic.

Le server action delegano.

---

# Performance Rule

Ogni chiamata deve essere classificata:

REQUIRED
DEFERRED
REMOVE

REQUIRED:
blocca il rendering.

DEFERRED:
può arrivare dopo.

REMOVE:
non serve.

---

# Rewrite First Rule

Se una feature presenta:

* responsabilità miste
* logica duplicata
* query nel layer sbagliato
* auth ripetuta
* side effects non chiari
* flusso difficile da comprendere

NON deve essere patchata.

Deve essere riscritta.

---

# Functional Preservation Rule

Durante un rewrite:

NON è obbligatorio preservare:

* router
* DTO
* query
* server actions
* redirect
* naming
* struttura esistente

È obbligatorio preservare:

* requisiti di business
* autorizzazioni corrette
* comportamento funzionale

---

# Legacy Removal Rule

Dopo approvazione del rewrite:

eliminare:

* file inutilizzati
* componenti inutilizzati
* DTO inutilizzati
* helper inutilizzati
* query inutilizzate
* codice morto

Git è il backup.

Il repository non mantiene codice legacy.
